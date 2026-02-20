import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { db } from '@/lib/db';
import { subscriptions, planTypeEnum } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { razorpay } from '@/lib/payments/razorpay';
import { RAZORPAY_PLANS } from '@/lib/payments/plans';

// Type extraction from zod enum for runtime matching
type PlanType = typeof planTypeEnum.enumValues[number];

const createSubscriptionSchema = z.object({
    planType: z.enum(planTypeEnum.enumValues),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const body = await req.json();
        const validation = createSubscriptionSchema.safeParse(body);
        if (!validation.success) {
            return errors.badRequest('Invalid plan type provided.');
        }

        const { planType } = validation.data;
        const razorpayPlanId = RAZORPAY_PLANS[planType as PlanType];

        if (!razorpayPlanId) {
            return errors.badRequest('Selected plan is not currently available.');
        }

        // 1. Check if user already has an active subscription
        let existingSub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id)
        });

        if (existingSub && existingSub.status === 'active' && existingSub.planType === planType) {
            return errors.badRequest('You are already subscribed to this plan.');
        }

        // 2. Ensure Razorpay Customer Exists
        let customerId = existingSub?.razorpayCustomerId;

        if (!customerId) {
            // Create a new Razorpay customer
            const customerParams = {
                name: user.fullName || undefined,
                email: user.email,
                contact: undefined,
                notes: {
                    userId: user.id
                }
            };

            const customer = await razorpay.customers.create(customerParams);
            customerId = customer.id;
        }

        // 3. Create Subscription in Razorpay
        const subscriptionParams = {
            plan_id: razorpayPlanId,
            customer_id: customerId,
            total_count: 120, // max billing cycles (e.g. 10 years for monthly)
            notes: {
                userId: user.id,
                planType: planType,
            }
        };

        const rzpSubscription = await razorpay.subscriptions.create(subscriptionParams);

        // 4. Update or Insert pending subscription record in DB
        const dbData = {
            userId: user.id,
            razorpayCustomerId: customerId as string,
            razorpaySubscriptionId: rzpSubscription.id,
            planType: planType as PlanType,
            status: 'trialing' as const, // will be updated to 'active' by webhook
            currentPeriodStart: new Date(rzpSubscription.current_start ? rzpSubscription.current_start * 1000 : Date.now()),
            currentPeriodEnd: new Date(rzpSubscription.current_end ? rzpSubscription.current_end * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            updatedAt: new Date()
        };

        if (existingSub) {
            await db.update(subscriptions)
                .set(dbData)
                .where(eq(subscriptions.userId, user.id));
        } else {
            await db.insert(subscriptions).values(dbData);
        }

        // Return the subscription ID to the frontend to launch checkout
        return responses.ok({
            subscriptionId: rzpSubscription.id,
            customerId: customerId,
        });

    } catch (error: any) {
        console.error('Error creating Razorpay subscription:', error);
        return errors.internal(error.message || 'Failed to initialize subscription check-out.');
    }
});
