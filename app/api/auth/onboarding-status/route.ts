/**
 * GET /api/auth/onboarding-status
 * ─────────────────────────────────────────────────────────────────
 * This route is used by the middleware as the SINGLE source of truth for
 * onboarding completion. The middleware reads `onboardingComplete` from the
 * JWT (sessionClaims), but the JWT can be stale for up to 60 seconds after
 * Clerk metadata is updated. This route bypasses the JWT by checking the DB
 * directly, and redirects to the right destination.
 *
 * Called from: middleware.ts when JWT onboardingComplete is falsy
 * Returns: 302 redirect to /trial/start, /onboarding, or /dashboard
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
            const signInUrl = new URL('/sign-in', req.url);
            return NextResponse.redirect(signInUrl);
        }

        const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard';

        // Check DB profile for onboarding completion
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
            columns: {
                onboardingCompletedAt: true,
                scraperStatus: true,
            },
        });

        const isOnboardingComplete = !!profile?.onboardingCompletedAt;

        if (isOnboardingComplete) {
            // Update Clerk metadata so the JWT will be fresh next time
            // (fire-and-forget, don't await)
            try {
                const client = await clerkClient();
                client.users.updateUserMetadata(userId, {
                    publicMetadata: { onboardingComplete: true },
                }).catch((err) => console.error('[onboarding-status] Clerk metadata update failed:', err));
            } catch {
                // Non-fatal
            }

            console.log(`[onboarding-status] User ${userId} has completed onboarding → redirecting to ${redirectTo}`);
            return NextResponse.redirect(new URL(redirectTo, req.url));
        }

        // Not complete — check if they have started (has a profile) → onboarding
        if (profile) {
            console.log(`[onboarding-status] User ${userId} has profile but not complete → /onboarding`);
            return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        // No profile at all → trial/start (brand new user)
        console.log(`[onboarding-status] User ${userId} has no profile → /trial/start`);
        return NextResponse.redirect(new URL('/trial/start', req.url));

    } catch (error: any) {
        console.error('[onboarding-status] Error:', error);
        // Safe fallback
        return NextResponse.redirect(new URL('/trial/start', req.url));
    }
}
