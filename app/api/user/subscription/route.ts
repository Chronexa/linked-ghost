/**
 * User Subscription API
 * GET /api/user/subscription - Get subscription info with full usage summary
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { getUsageSummary } from '@/lib/ai/usage';

/**
 * GET /api/user/subscription
 * All plan limits and usage data come from getUsageSummary() — never hardcoded here.
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const summary = await getUsageSummary(user.id);
    return responses.ok(summary);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return errors.internal('Failed to fetch subscription');
  }
});
