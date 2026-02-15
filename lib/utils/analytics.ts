/**
 * Analytics Tracking Utility
 * Centralized tracking for user actions and events
 */

type EventName =
    | 'manual_topic_created'
    | 'topic_classified'
    | 'draft_generated'
    | 'draft_approved'
    | 'post_scheduled'
    | 'post_published'
    | 'voice_training_started'
    | 'voice_training_completed'
    | 'onboarding_step_completed'
    | 'onboarding_completed';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Track a user action or event
 * @param eventName - Name of the event
 * @param properties - Additional properties to track with the event
 */
export function track(eventName: EventName, properties?: EventProperties): void {
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Analytics: ${eventName}`, properties);
    }

    // TODO: Integrate with analytics provider (PostHog, Mixpanel, etc.)
    // Example:
    // if (typeof window !== 'undefined' && window.analytics) {
    //   window.analytics.track(eventName, {
    //     ...properties,
    //     timestamp: new Date().toISOString(),
    //   });
    // }
}

/**
 * Identify a user (usually after login)
 * @param userId - Unique user identifier
 * @param traits - User traits (email, name, etc.)
 */
export function identify(userId: string, traits?: EventProperties): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(`👤 Analytics: Identify user ${userId}`, traits);
    }

    // TODO: Integrate with analytics provider
    // if (typeof window !== 'undefined' && window.analytics) {
    //   window.analytics.identify(userId, traits);
    // }
}

/**
 * Page view tracking
 * @param pageName - Name of the page viewed
 * @param properties - Additional page properties
 */
export function page(pageName: string, properties?: EventProperties): void {
    if (process.env.NODE_ENV === 'development') {
        console.log(`📄 Analytics: Page view ${pageName}`, properties);
    }

    // TODO: Integrate with analytics provider
    // if (typeof window !== 'undefined' && window.analytics) {
    //   window.analytics.page(pageName, properties);
    // }
}
