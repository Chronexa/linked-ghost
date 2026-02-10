/**
 * User Subscription API
 * GET /api/user/subscription - Get subscription info with usage
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { subscriptions, usageTracking, generatedDrafts } from '@/lib/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';

// Plan limits configuration
const PLAN_LIMITS = {
  starter: {
    postsPerMonth: 10,
    pillars: 2,
    regenerations: 3,
  },
  growth: {
    postsPerMonth: 30,
    pillars: 5,
    regenerations: 10,
  },
  agency: {
    postsPerMonth: 999999, // Unlimited
    pillars: 10,
    regenerations: 999999,
  },
};

/**
 * GET /api/user/subscription
 * Get subscription information with current usage
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Get subscription
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, user.id),
    });

    // Default to free tier if no subscription
    const planType = subscription?.planType || 'starter';
    const limits = PLAN_LIMITS[planType];

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Get usage tracking
    const usage = await db.query.usageTracking.findFirst({
      where: and(
        eq(usageTracking.userId, user.id),
        eq(usageTracking.month, currentMonth)
      ),
    });

    // Calculate posts this month (alternative method if usage tracking not set up)
    const startOfMonth = new Date(currentMonth + '-01');
    const [{ count: postsThisMonth }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generatedDrafts)
      .where(and(
        eq(generatedDrafts.userId, user.id),
        gte(generatedDrafts.createdAt, startOfMonth)
      ));

    return responses.ok({
      subscription: subscription ? {
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd,
      } : {
        planType: 'starter',
        status: 'trialing',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
      },
      limits,
      usage: {
        postsThisMonth: usage?.postsGenerated || postsThisMonth,
        regenerationsThisMonth: usage?.regenerationsUsed || 0,
        topicsClassified: usage?.topicsClassified || 0,
      },
      remainingQuota: {
        posts: limits.postsPerMonth - (usage?.postsGenerated || postsThisMonth),
        regenerations: limits.regenerations - (usage?.regenerationsUsed || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return errors.internal('Failed to fetch subscription');
  }
});
