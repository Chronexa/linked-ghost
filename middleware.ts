import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Clerk Authentication Middleware
 *
 * Onboarding redirect logic (loop-proof):
 * ─────────────────────────────────────────────────────
 * Problem: Clerk JWT caches onboardingComplete for ~60s after Clerk metadata
 * update. Redirecting through a DB-check API endpoint creates an infinite loop:
 *   /dashboard → /api/auth/onboarding-status?redirect=/dashboard → db says done
 *   → redirect /dashboard → middleware catches it → /api/auth/onboarding-status
 *   → INFINITE LOOP
 *
 * Solution: Two-layer check:
 *   Layer 1 (fast path): Check __cp_onboarding_done cookie.
 *     This cookie is set by /api/auth/onboarding-status when DB confirms done.
 *     If cookie present → let through immediately (no DB, no JWT needed).
 *   Layer 2 (when cookie absent): Check JWT sessionClaims.
 *     If JWT says not complete → redirect to /api/auth/onboarding-status
 *     which checks DB, sets the cookie, then redirects back.
 *
 * The cookie breaks the loop: once set, subsequent requests to /dashboard
 * pass Layer 1 and never hit Layer 2 again (until the 5-minute cookie expires,
 * by which time Clerk's JWT has refreshed with onboardingComplete: true).
 */

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/about',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/for(.*)',
  '/features(.*)',
  '/guides(.*)',
  '/changelog(.*)',
  '/blog(.*)',
  '/alternatives(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/legal(.*)',
  '/api/webhooks(.*)',
  '/api/cron(.*)',
  '/api/health',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes — require authentication
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ── Onboarding Guard ─────────────────────────────────────────────────────
  // API routes, onboarding pages, and trial pages are exempt
  const isOnboardingPath =
    req.nextUrl.pathname.startsWith('/trial') ||
    req.nextUrl.pathname.startsWith('/onboarding') ||
    req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/sign-up') ||
    req.nextUrl.pathname.startsWith('/api');

  if (!isOnboardingPath) {
    // Layer 1: __cp_onboarding_done cookie set by /api/auth/onboarding-status
    // when DB confirms the user has completed onboarding. This cookie breaks
    // the infinite redirect loop caused by stale JWTs.
    const doneCookie = req.cookies.get('__cp_onboarding_done')?.value;
    if (doneCookie === '1') {
      // Cookie present — user confirmed done by DB check. Let through.
      return NextResponse.next();
    }

    // Layer 2: Check JWT claims
    const onboardingComplete = (session.sessionClaims?.metadata as any)?.onboardingComplete;
    if (!onboardingComplete) {
      // JWT says not complete (may be stale). Route through DB-backed check.
      // That endpoint will set the __cp_onboarding_done cookie if done,
      // OR redirect to /trial/start if they haven't started.
      const checkUrl = new URL('/api/auth/onboarding-status', req.url);
      checkUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(checkUrl);
    }
  }

  // ── Signed-in user hitting sign-in/sign-up with plan cookie ──────────────
  if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    const planCookie = req.cookies.get('cp_selected_plan')?.value;
    if (planCookie) {
      return NextResponse.redirect(new URL('/trial/start', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
