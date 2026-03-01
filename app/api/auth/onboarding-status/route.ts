/**
 * GET /api/auth/onboarding-status
 * ─────────────────────────────────────────────────────────────────
 * DB-backed onboarding check. The middleware routes through here
 * when the JWT is stale (onboardingComplete not yet reflected).
 *
 * CRITICAL: When the user IS done, this endpoint sets a
 * __cp_onboarding_done=1 cookie (5-minute TTL) in the redirect response.
 * The middleware reads this cookie at Layer 1 on all subsequent requests —
 * this breaks the infinite redirect loop caused by stale JWTs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard';
        // Safety: never redirect back to this endpoint (loop prevention)
        const safeRedirect = redirectTo.startsWith('/api/auth/onboarding-status')
            ? '/dashboard'
            : redirectTo;

        // Check DB directly — bypasses stale JWT
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
            columns: { onboardingCompletedAt: true },
        });

        const isOnboardingComplete = !!profile?.onboardingCompletedAt;

        if (isOnboardingComplete) {
            // Heal Clerk metadata fire-and-forget (so JWT refreshes next time)
            try {
                const client = await clerkClient();
                client.users.updateUserMetadata(userId, {
                    publicMetadata: { onboardingComplete: true },
                }).catch(() => { });
            } catch { /* non-fatal */ }

            console.log(`[onboarding-status] User ${userId} done → redirecting to ${safeRedirect}`);

            // Set the __cp_onboarding_done cookie so middleware lets through
            // on the very next request (breaks the infinite redirect loop).
            const response = NextResponse.redirect(new URL(safeRedirect, req.url));
            response.cookies.set('__cp_onboarding_done', '1', {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 300, // 5 minutes — long enough to survive JWT staleness window
                path: '/',
            });
            return response;
        }

        if (profile) {
            // Has a profile but not complete → send to onboarding
            console.log(`[onboarding-status] User ${userId} has profile, not complete → /onboarding`);
            return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        // No profile at all → brand new user → trial/start
        console.log(`[onboarding-status] User ${userId} has no profile → /trial/start`);
        return NextResponse.redirect(new URL('/trial/start', req.url));

    } catch (error: any) {
        console.error('[onboarding-status] Error:', error);
        return NextResponse.redirect(new URL('/trial/start', req.url));
    }
}
