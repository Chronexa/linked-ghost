import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
    planId: z.enum(['starter', 'growth']),
    billingInterval: z.enum(['monthly', 'yearly']),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const body = await req.json();
        const validation = schema.safeParse(body);
        if (!validation.success) {
            return errors.badRequest('Invalid plan or billing interval.');
        }

        const { planId, billingInterval } = validation.data;

        // Idempotency check: Don't create if one already exists
        const existingSub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
        });

        if (existingSub) {
            return responses.ok({ message: 'Trial or subscription already active.' });
        }

        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        await db.insert(subscriptions).values({
            userId: user.id,
            planType: planId,
            billingInterval,
            status: 'trialing',
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd, // Clerk-only trial ends here unless they checkout
            trialEnd,
            cancelAtPeriodEnd: false,
            updatedAt: now,
        }).onConflictDoNothing({ target: subscriptions.userId });

        console.log(`[activate-trial] Created Clerk-only trial for user ${user.id} on ${planId}`);

        return responses.ok({ success: true, trialEnd });
    } catch (error: any) {
        console.error('[activate-trial] Error:', error);
        return errors.internal('Failed to activate trial.');
    }
});
