import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { razorpay } from '@/lib/payments/razorpay';
import { getPlanConfig, type PlanId, type BillingInterval } from '@/lib/config/plans.config';

const upgradeSchema = z.object({
    planId: z.enum(['starter', 'growth']),
    billingInterval: z.enum(['monthly', 'yearly']),
});

// POST /api/billing/upgrade-subscription
// Cancels current subscription immediately and creates a new one for the target plan.
// Future enhancement: use Razorpay subscription update API when available.
export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const body = await req.json();
        const validation = upgradeSchema.safeParse(body);
        if (!validation.success) {
            return errors.badRequest('Invalid plan or billing interval.');
        }

        const { planId, billingInterval } = validation.data as { planId: PlanId; billingInterval: BillingInterval };

        const existingSub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
        });

        if (!existingSub) {
            return errors.notFound('No existing subscription to upgrade. Use create-subscription instead.');
        }

        if (existingSub.planType === planId && existingSub.billingInterval === billingInterval) {
            return errors.badRequest('You are already on this plan.');
        }

        // 1. Cancel existing Razorpay subscription immediately (cancel_at_cycle_end = false)
        try {
            if (existingSub.razorpaySubscriptionId) {
                await razorpay.subscriptions.cancel(existingSub.razorpaySubscriptionId, false);
                console.log(`[upgrade-subscription] Cancelled old subscription ${existingSub.razorpaySubscriptionId}`);
            }
        } catch (cancelErr: any) {
            // Subscription may already be cancelled — proceed anyway
            console.warn(`[upgrade-subscription] Cancel old sub warning: ${cancelErr.message}`);
        }

        // 2. Get the new plan config
        const newPlanConfig = getPlanConfig(planId);
        const razorpayPlanId = newPlanConfig.razorpayPlanIds[billingInterval];
        if (!razorpayPlanId) {
            return errors.badRequest('Target plan configuration is not available.');
        }

        // 3. Create new Razorpay subscription
        const totalCount = billingInterval === 'yearly' ? 1 : 12;
        const rzpSubscription = await razorpay.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_notify: 1,
            quantity: 1,
            total_count: totalCount,
            expire_by: Math.floor(Date.now() / 1000) + 30 * 60,
            notes: { userId: user.id, planId, billingInterval, upgraded: 'true' },
        });

        console.log(`[upgrade-subscription] New subscription ${rzpSubscription.id} for user ${user.id}`);

        // 4. Update DB with new subscription (overwrite existing row)
        const now = new Date();
        await db.update(subscriptions)
            .set({
                razorpaySubscriptionId: rzpSubscription.id,
                razorpayPlanId,
                billingInterval,
                planType: planId,
                status: 'trialing' as const,
                currentPeriodStart: now,
                currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                cancelAtPeriodEnd: false,
                canceledAt: null,
                updatedAt: now,
            })
            .where(eq(subscriptions.userId, user.id));

        return responses.ok({
            subscriptionId: rzpSubscription.id,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
            message: 'Previous plan cancelled. Complete checkout to activate your new plan.',
        });

    } catch (error: any) {
        console.error('[upgrade-subscription] Error:', error);
        return errors.internal('Failed to upgrade subscription. Please try again or contact support.');
    }
});
