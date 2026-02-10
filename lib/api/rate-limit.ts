/**
 * API Rate Limiting Utilities
 * Protect API routes from abuse
 */

import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/redis';
import { errors } from './response';

/**
 * Rate limit configuration by user tier
 */
export const rateLimits = {
  anonymous: {
    requests: 10,
    window: 60, // 1 minute
  },
  authenticated: {
    requests: 100,
    window: 60, // 1 minute
  },
  premium: {
    requests: 500,
    window: 60, // 1 minute
  },
  admin: {
    requests: 1000,
    window: 60, // 1 minute
  },
};

/**
 * Rate limit handler for API routes
 * 
 * Usage:
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const rateLimitResult = await rateLimit(req, 'userId123', 'authenticated');
 *   if (rateLimitResult) return rateLimitResult; // Returns error response if limited
 *   
 *   // Continue with API logic
 * }
 * ```
 */
export async function rateLimit(
  req: NextRequest,
  userId: string | null,
  tier: keyof typeof rateLimits = 'anonymous'
): Promise<ReturnType<typeof errors.rateLimit> | null> {
  const endpoint = new URL(req.url).pathname;
  const identifier = userId || getClientId(req);
  const limit = rateLimits[tier];

  const { allowed, remaining } = await checkRateLimit(
    identifier,
    endpoint,
    limit.requests,
    limit.window
  );

  if (!allowed) {
    return errors.rateLimit(
      `Rate limit exceeded. Please try again in ${limit.window} seconds.`
    );
  }

  // Add rate limit headers (optional but good practice)
  // Note: NextResponse doesn't easily allow header manipulation without returning
  // So we return null for success and let the caller handle the response

  return null;
}

/**
 * Get client identifier for rate limiting
 * Uses IP address as fallback for anonymous users
 */
function getClientId(req: NextRequest): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown';

  return `ip:${ip}`;
}

/**
 * Check if user has premium tier (for rate limiting)
 * TODO: Implement after subscriptions are set up
 */
export async function getUserTier(userId: string): Promise<keyof typeof rateLimits> {
  // TODO: Check user's subscription from database
  // For now, return 'authenticated' for all logged-in users
  return 'authenticated';
}
