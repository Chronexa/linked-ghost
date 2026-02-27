import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Clerk Authentication Middleware
 * - Protects all routes except public pages
 * - Detects NEW users via Clerk publicMetadata.onboardingComplete flag
 * - Redirects new users → /trial/start regardless of signup method (email, Google, etc.)
 * - Detects cp_selected_plan cookie after sign-up → redirects signed-in users to /trial/start
 */

// Define public routes that don't require authentication
// ⚠️ IMPORTANT: All marketing/SEO pages must be listed here or Clerk will redirect to sign-in
const isPublicRoute = createRouteMatcher([
  // Core marketing pages
  '/',
  '/pricing',
  '/about',

  // Auth pages
  '/sign-in(.*)',
  '/sign-up(.*)',

  // Persona / use-case landing pages
  '/for(.*)',

  // Feature deep-dive pages
  '/features(.*)',

  // Content marketing & resources
  '/guides(.*)',
  '/changelog(.*)',
  '/blog(.*)',

  // Legal
  '/legal(.*)',

  // API public routes
  '/api/webhooks(.*)',
  '/api/cron(.*)',
  '/api/health',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes - require authentication
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    // Redirect to sign-in if not authenticated
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ── New User Detection ────────────────────────────────────────────────────
  // If the user hasn't completed onboarding (publicMetadata.onboardingComplete !== true),
  // redirect them to /trial/start — this catches ALL signup methods (Google, email, etc.)
  // Skip this check if they are already on onboarding-related paths to avoid loops
  const isOnboardingPath =
    req.nextUrl.pathname.startsWith('/trial') ||
    req.nextUrl.pathname.startsWith('/onboarding') ||
    req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/sign-up') ||
    req.nextUrl.pathname.startsWith('/api');

  if (!isOnboardingPath) {
    const onboardingComplete = (session.sessionClaims?.metadata as any)?.onboardingComplete;
    if (!onboardingComplete) {
      // New user — send them to trial start
      const trialUrl = new URL('/trial/start', req.url);
      return NextResponse.redirect(trialUrl);
    }
  }

  // ── Existing Signed-in User Plan Cookie Check ─────────────────────────────
  // If signed-in user has a pending plan cookie (e.g., signed in from pricing page)
  // redirect to trial/start to activate the trial
  if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    const planCookie = req.cookies.get('cp_selected_plan')?.value;
    if (planCookie) {
      const trialUrl = new URL('/trial/start', req.url);
      return NextResponse.redirect(trialUrl);
    }
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
