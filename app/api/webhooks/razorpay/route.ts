import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.error('Missing Razorpay webhook signature or secret');
            return new NextResponse('Webhook error: Missing signature or secret', { status: 400 });
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(bodyText)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Invalid Razorpay webhook signature');
            return new NextResponse('Invalid signature', { status: 400 });
        }

        const event = JSON.parse(bodyText);
        const { event: eventType, payload } = event;

        console.log(`[Razorpay Webhook] Received event: ${eventType}`);

        if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
            const subscriptionId = payload.subscription?.entity?.id;
            const currentEnd = payload.subscription?.entity?.current_end;

            if (subscriptionId) {
                await db.update(subscriptions)
                    .set({
                        status: 'active',
                        currentPeriodEnd: new Date(currentEnd * 1000),
                        updatedAt: new Date()
                    })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));

                console.log(`[Razorpay Webhook] Subscription ${subscriptionId} marked as active`);
            }
        } else if (eventType === 'subscription.cancelled' || eventType === 'subscription.halted') {
            const subscriptionId = payload.subscription?.entity?.id;

            if (subscriptionId) {
                const status = eventType === 'subscription.cancelled' ? 'canceled' : 'past_due';

                await db.update(subscriptions)
                    .set({
                        status: status,
                        canceledAt: eventType === 'subscription.cancelled' ? new Date() : null,
                        updatedAt: new Date()
                    })
                    .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));

                console.log(`[Razorpay Webhook] Subscription ${subscriptionId} marked as ${status}`);
            }
        }

        return new NextResponse(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Razorpay Webhook handler failed:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }
}
