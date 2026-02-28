/**
 * User API - Current User Operations
 * GET /api/user - Get current user with profile and subscription
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { users, profiles, subscriptions, pillars, voiceExamples } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';


/**
 * GET /api/user
 * Get current authenticated user with profile and stats
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Get complete user data
    const userData = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        profile: true,
        subscription: true,
      },
    });

    if (!userData) {
      return errors.notFound('User');
    }

    // Get user statistics
    const [pillarsCount, voiceExamplesCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(pillars)
        .where(eq(pillars.userId, user.id))
        .then(([result]) => result.count),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(voiceExamples)
        .where(eq(voiceExamples.userId, user.id))
        .then(([result]) => result.count),
    ]);

    // Calculate onboarding completion
    const hasCompletedOnboarding = pillarsCount >= 3 && voiceExamplesCount >= 3;

    return responses.ok({
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        avatarUrl: userData.avatarUrl,
        status: userData.status,
        createdAt: userData.createdAt,
      },
      profile: userData.profile,
      subscription: userData.subscription,
      stats: {
        pillarsCount,
        voiceExamplesCount,
        hasCompletedOnboarding,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return errors.internal('Failed to fetch user');
  }
});
