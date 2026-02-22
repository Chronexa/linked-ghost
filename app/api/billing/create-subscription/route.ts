import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { razorpay } from '@/lib/payments/razorpay';
import { getPlanConfig, type PlanId, type BillingInterval } from '@/lib/config/plans.config';

const createSubscriptionSchema = z.object({
    planId: z.enum(['starter', 'growth']),
    billingInterval: z.enum(['monthly', 'yearly']),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const body = await req.json();
        const validation = createSubscriptionSchema.safeParse(body);
        if (!validation.success) {
            return errors.badRequest('Invalid plan or billing interval. Must be starter|growth and monthly|yearly.');
        }

        const { planId, billingInterval } = validation.data as { planId: PlanId; billingInterval: BillingInterval };
        const planConfig = getPlanConfig(planId);
        const razorpayPlanId = planConfig.razorpayPlanIds[billingInterval];

        if (!razorpayPlanId) {
            return errors.badRequest('Selected plan configuration is not yet available. Please contact support.');
        }

        // 1. Idempotency — reject if user already has an active or trialing subscription
        const existingSub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
        });

        if (existingSub && (existingSub.status === 'active' || existingSub.status === 'trialing')) {
            return responses.conflict({
                error: `You already have an active ${existingSub.planType} subscription. Please cancel it before switching plans.`,
                currentPlan: existingSub.planType,
                currentStatus: existingSub.status,
            });
        }

        // 2. Ensure Razorpay customer exists — save to DB immediately before subscription
        let customerId = existingSub?.razorpayCustomerId ?? null;

        if (!customerId) {
            console.log(`[create-subscription] Creating Razorpay customer for user ${user.id}`);
            const customer = await razorpay.customers.create({
                name: user.fullName || 'ContentPilot User',
                email: user.email,
                notes: { userId: user.id },
            });
            customerId = customer.id;
            console.log(`[create-subscription] Created customer: ${customerId}`);
        }

        // 3. Create Razorpay subscription
        const totalCount = billingInterval === 'yearly' ? 1 : 12; // yearly = 1 annual charge
        const rzpSubscription = await razorpay.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_notify: 1,
            quantity: 1,
            total_count: totalCount,
            expire_by: Math.floor(Date.now() / 1000) + 30 * 60, // 30-min checkout expiry
            notes: {
                userId: user.id,
                planId,
                billingInterval,
            },
        });

        console.log(`[create-subscription] Created Razorpay subscription: ${rzpSubscription.id}`);

        // 4. Save pending subscription to DB
        const now = new Date();
        const dbData = {
            userId: user.id,
            razorpayCustomerId: customerId,
            razorpaySubscriptionId: rzpSubscription.id,
            razorpayPlanId: razorpayPlanId,
            billingInterval: billingInterval,
            planType: planId,
            status: 'trialing' as const,
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // placeholder — webhook will overwrite
            cancelAtPeriodEnd: false,
            updatedAt: now,
        };

        if (existingSub) {
            await db.update(subscriptions)
                .set(dbData)
                .where(eq(subscriptions.userId, user.id));
        } else {
            await db.insert(subscriptions).values(dbData);
        }

        // 5. Return subscription ID + public key for frontend checkout modal
        return responses.ok({
            subscriptionId: rzpSubscription.id,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        });

    } catch (error: any) {
        console.error('[create-subscription] Error:', error);
        // Never expose raw Razorpay errors to client
        return errors.internal('Failed to initialize subscription checkout. Please try again or contact support.');
    }
});
