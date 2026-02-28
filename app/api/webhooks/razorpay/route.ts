import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { subscriptions, usageTracking } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';


// ============================================================================
// RAZORPAY WEBHOOK HANDLER
// This is the source of truth for subscription state.
// A bug here = users paying but not getting access, or non-paying getting in.
// ============================================================================

export async function POST(req: NextRequest) {
    // 1. Read raw body FIRST — before any parsing
    const webhookBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 2. Signature verification — reject invalid requests immediately
    if (!signature || !webhookSecret) {
        console.error('[rzp-webhook] Missing signature or secret');
        // Still return 200 to prevent infinite Razorpay retries
        return NextResponse.json({ received: false, error: 'Missing auth' }, { status: 200 });
    }

    const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');

    if (expectedSig !== signature) {
        console.error('[rzp-webhook] Invalid signature — rejecting');
        return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Parse and route event
    let event: any;
    try {
        event = JSON.parse(webhookBody);
    } catch {
        console.error('[rzp-webhook] Failed to parse webhook body');
        return NextResponse.json({ received: true }, { status: 200 }); // return 200 to stop retries
    }

    const eventType: string = event.event;
    const subscriptionEntity = event.payload?.subscription?.entity;
    const subscriptionId: string | undefined = subscriptionEntity?.id;

    console.log(`[rzp-webhook] Event: ${eventType} | Subscription: ${subscriptionId ?? 'N/A'}`);

    if (!subscriptionId) {
        console.warn(`[rzp-webhook] No subscriptionId in payload for event ${eventType}`);
        return NextResponse.json({ received: true }, { status: 200 });
    }

    // 4. Handle events — always wrap in try/catch, always return 200
    try {
        switch (eventType) {

            case 'subscription.authenticated': {
                // User completed auth step — subscription created, trial begins
                const trialEnd = subscriptionEntity?.trial_end
                    ? new Date(subscriptionEntity.trial_end * 1000)
                    : null;
                const userId = subscriptionEntity?.notes?.userId;

                if (userId) {
                    const planId = subscriptionEntity?.notes?.planId || 'growth';
                    const billingInterval = subscriptionEntity?.notes?.billingInterval || 'monthly';

                    await db.insert(subscriptions).values({
                        userId,
                        razorpaySubscriptionId: subscriptionId,
                        razorpayPlanId: subscriptionEntity?.plan_id,
                        billingInterval,
                        planType: planId,
                        status: 'trialing',
                        trialEnd: trialEnd ?? undefined,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // placeholder until charged
                        updatedAt: new Date()
                    }).onConflictDoUpdate({
                        target: subscriptions.userId,
                        set: {
                            razorpaySubscriptionId: subscriptionId,
                            status: 'trialing',
                            trialEnd: trialEnd ?? undefined,
                            updatedAt: new Date(),
                        }
                    });
                } else {
                    await db.update(subscriptions)
                        .set({
                            status: 'trialing',
                            trialEnd: trialEnd ?? undefined,
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                }

                console.log(`[rzp-webhook] ${subscriptionId} → trialing`);
                break;
            }

            case 'subscription.activated': {
                // First payment confirmed — full access granted
                const start = subscriptionEntity?.current_start
                    ? new Date(subscriptionEntity.current_start * 1000)
                    : new Date();
                const end = subscriptionEntity?.current_end
                    ? new Date(subscriptionEntity.current_end * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const userId = subscriptionEntity?.notes?.userId;

                if (userId) {
                    const planId = subscriptionEntity?.notes?.planId || 'growth';
                    const billingInterval = subscriptionEntity?.notes?.billingInterval || 'monthly';

                    await db.insert(subscriptions).values({
                        userId,
                        razorpaySubscriptionId: subscriptionId,
                        razorpayPlanId: subscriptionEntity?.plan_id,
                        billingInterval,
                        planType: planId,
                        status: 'active',
                        currentPeriodStart: start,
                        currentPeriodEnd: end,
                        updatedAt: new Date()
                    }).onConflictDoUpdate({
                        target: subscriptions.userId,
                        set: {
                            razorpaySubscriptionId: subscriptionId,
                            status: 'active',
                            currentPeriodStart: start,
                            currentPeriodEnd: end,
                            updatedAt: new Date(),
                        }
                    });
                } else {
                    await db.update(subscriptions)
                        .set({
                            status: 'active',
                            currentPeriodStart: start,
                            currentPeriodEnd: end,
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                }

                console.log(`[rzp-webhook] ${subscriptionId} → active`);
                break;
            }

            case 'subscription.charged': {
                // Recurring payment success — renew period AND reset monthly usage counters
                const start = subscriptionEntity?.current_start
                    ? new Date(subscriptionEntity.current_start * 1000)
                    : new Date();
                const end = subscriptionEntity?.current_end
                    ? new Date(subscriptionEntity.current_end * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                await db.update(subscriptions)
                    .set({
                        status: 'active',
                        currentPeriodStart: start,
                        currentPeriodEnd: end,
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));

                // Find the userId and reset their monthly usage counter
                const sub = await db.query.subscriptions.findFirst({
                    where: eq(subscriptions.razorpaySubscriptionId, subscriptionId),
                });
                if (sub?.userId) {
                    const currentMonth = format(new Date(), 'yyyy-MM');
                    await db.update(usageTracking)
                        .set({
                            postsGenerated: 0,
                            regenerationsUsed: 0,
                            topicsClassified: 0,
                            voiceAnalyses: 0,
                            updatedAt: new Date(),
                        })
                        .where(and(
                            eq(usageTracking.userId, sub.userId),
                            eq(usageTracking.month, currentMonth)
                        ));
                    console.log(`[rzp-webhook] ${subscriptionId} → charged, period renewed, usage reset for ${sub.userId}`);
                }
                break;
            }

            case 'subscription.pending': {
                // Payment attempt failed — soft warning, don't revoke access yet
                await db.update(subscriptions)
                    .set({ status: 'past_due', updatedAt: new Date() })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                console.log(`[rzp-webhook] ${subscriptionId} → past_due (payment pending)`);
                break;
            }

            case 'subscription.halted': {
                // All retry attempts exhausted — revoke access immediately
                await db.update(subscriptions)
                    .set({ status: 'halted', updatedAt: new Date() })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                console.log(`[rzp-webhook] ${subscriptionId} → halted (access revoked)`);
                break;
            }

            case 'subscription.cancelled': {
                // User or admin explicitly cancelled — access until period end
                await db.update(subscriptions)
                    .set({
                        status: 'canceled',
                        cancelAtPeriodEnd: true,
                        canceledAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                console.log(`[rzp-webhook] ${subscriptionId} → canceled`);
                break;
            }

            case 'subscription.completed': {
                // All billing cycles exhausted (e.g., yearly plan ended)
                await db.update(subscriptions)
                    .set({
                        status: 'canceled',
                        canceledAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                console.log(`[rzp-webhook] ${subscriptionId} → completed (marked canceled)`);
                break;
            }

            case 'subscription.paused': {
                await db.update(subscriptions)
                    .set({ status: 'paused', updatedAt: new Date() })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
                console.log(`[rzp-webhook] ${subscriptionId} → paused`);
                break;
            }

            case 'payment.failed': {
                // Log only — access decision is driven by subscription.halted
                console.warn(`[rzp-webhook] payment.failed for subscription ${subscriptionId} — monitoring only`);
                break;
            }

            default: {
                console.log(`[rzp-webhook] Unhandled event type: ${eventType}`);
            }
        }
    } catch (handlerError) {
        // Log but always return 200 — Razorpay must not retry indefinitely
        console.error(`[rzp-webhook] Handler error for ${eventType}:`, handlerError);
    }

    // Always 200 — even on handler errors
    return NextResponse.json({ received: true }, { status: 200 });
}
