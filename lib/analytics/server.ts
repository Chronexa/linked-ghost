import { PostHog } from 'posthog-node';

/**
 * Server-side PostHog client for API routes and webhook handlers.
 * Use this for billing events, scraper events, and error tracking
 * where you can't use the client-side hook.
 *
 * Usage:
 *   import { analytics, shutdownAnalytics } from '@/lib/analytics/server';
 *   analytics.capture({ distinctId: userId, event: 'billing_upgrade_completed', properties: { plan_name: 'pro' } });
 */

let _analytics: PostHog | null = null;

function getAnalytics(): PostHog {
    if (!_analytics) {
        _analytics = new PostHog(
            process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
            {
                host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
                flushAt: 1,       // Flush immediately in serverless
                flushInterval: 0, // No batching — each event sent right away
            }
        );
    }
    return _analytics;
}

export const analytics = {
    capture: (params: { distinctId: string; event: string; properties?: Record<string, unknown> }) => {
        if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
        getAnalytics().capture(params);
    },

    identify: (params: { distinctId: string; properties?: Record<string, unknown> }) => {
        if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
        getAnalytics().identify(params);
    },

    /** Call this at the end of API routes to flush the queue before serverless shuts down */
    shutdown: async () => {
        if (_analytics) await _analytics.shutdown();
    },
};
