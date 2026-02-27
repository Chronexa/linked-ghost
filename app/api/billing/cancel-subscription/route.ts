import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { razorpay } from '@/lib/payments/razorpay';

// POST /api/billing/cancel-subscription
export const POST = withAuth(async (_req: NextRequest, { user }) => {
    try {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
        });

        if (!sub) {
            return errors.notFound('No active subscription found.');
        }

        if (sub.status === 'canceled' || sub.status === 'halted') {
            return errors.badRequest('Subscription is already cancelled.');
        }

        const body = await _req.json().catch(() => ({}));
        const reason = body.reason || null;

        if (!sub.razorpaySubscriptionId) {
            return errors.badRequest('No Razorpay subscription ID found.');
        }

        // Cancel at period end via Razorpay — user keeps access until currentPeriodEnd
        await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, false);

        // Mark in DB immediately (webhook will confirm)
        await db.update(subscriptions)
            .set({
                cancelAtPeriodEnd: true,
                canceledAt: new Date(),
                cancellationReason: reason,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, user.id));

        console.log(`[cancel-subscription] Cancelled subscription ${sub.razorpaySubscriptionId} for user ${user.id}`);

        return responses.ok({
            message: 'Subscription cancelled. You will retain access until the end of your billing period.',
            periodEnd: sub.currentPeriodEnd,
        });

    } catch (error: any) {
        console.error('[cancel-subscription] Error:', error);
        return errors.internal('Failed to cancel subscription. Please try again or contact support.');
    }
});
