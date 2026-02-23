import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses } from '@/lib/api/response';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { razorpay } from '@/lib/payments/razorpay';

// GET /api/billing/history
// Returns the last 10 invoices/payments for the user's subscription.
export const GET = withAuth(async (_req: NextRequest, { user }) => {
    try {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.userId, user.id),
        });

        if (!sub) {
            return responses.ok({ payments: [], message: 'No subscription found.' });
        }

        // Fetch payments via Razorpay REST API (SDK type doesn't expose fetchAllPayments)
        const auth = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64');

        const rzpRes = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${sub.razorpaySubscriptionId}/payments?count=10`,
            { headers: { Authorization: `Basic ${auth}` } }
        );

        if (!rzpRes.ok) {
            return responses.ok({ payments: [], error: 'Could not fetch from Razorpay.' });
        }

        const paymentsResponse = await rzpRes.json();
        const items: any[] = paymentsResponse?.items ?? [];
        const payments = items.map((p) => ({
            id: p.id,
            amount: p.amount / 100,      // Razorpay stores in paisa
            currency: p.currency,
            status: p.status,
            method: p.method,
            createdAt: new Date(p.created_at * 1000).toISOString(),
            description: p.description ?? null,
        }));

        return responses.ok({
            subscriptionId: sub.razorpaySubscriptionId,
            planType: sub.planType,
            billingInterval: sub.billingInterval,
            payments,
        });

    } catch (error: any) {
        console.error('[billing-history] Error:', error);
        // Return empty array instead of 500 — billing history is non-critical
        return responses.ok({ payments: [], error: 'Could not fetch payment history.' });
    }
});
