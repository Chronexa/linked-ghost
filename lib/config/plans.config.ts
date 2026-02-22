// lib/config/plans.config.ts
// ============================================================
// SINGLE SOURCE OF TRUTH FOR ALL PLAN CONFIGURATION
// Change limits, prices, or features here — nowhere else.
// ============================================================

export const TRIAL_PERIOD_DAYS = 7;

export const BILLING_CURRENCY = 'USD';

export type PlanId = 'starter' | 'growth';

export type BillingInterval = 'monthly' | 'yearly';

export interface PlanLimits {
    postsPerMonth: number | null;       // null = unlimited
    pillars: number | null;
    voiceExamples: number | null;
    regenerationsPerMonth: number | null;
    topicsDiscoveredPerDay: number | null;
}

export interface PlanFeatures {
    prioritySupport: boolean;
    unlimitedRegens: boolean;
}

export interface PlanConfig {
    id: PlanId;
    name: string;
    description: string;
    monthlyPriceUsd: number;
    yearlyPriceUsd: number;            // total annual charge
    yearlyMonthlyEquivalent: number;   // what we show as "per month"
    razorpayPlanIds: {
        monthly: string;                 // from env var — NOT hardcoded
        yearly: string;                  // from env var — NOT hardcoded
    };
    limits: PlanLimits;
    features: PlanFeatures;
    badge?: string;                    // e.g. "Most Popular"
}

export const PLANS: Record<PlanId, PlanConfig> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        description: 'For creators building their LinkedIn presence',
        monthlyPriceUsd: 19,
        yearlyPriceUsd: 180,
        yearlyMonthlyEquivalent: 15,
        razorpayPlanIds: {
            monthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY ?? '',
            yearly: process.env.RAZORPAY_PLAN_STARTER_YEARLY ?? '',
        },
        limits: {
            postsPerMonth: 15,
            pillars: 2,
            voiceExamples: 10,
            regenerationsPerMonth: 10,
            topicsDiscoveredPerDay: 5,
        },
        features: {
            prioritySupport: false,
            unlimitedRegens: false,
        },
    },

    growth: {
        id: 'growth',
        name: 'Growth',
        description: 'For active thought leaders and consultants',
        monthlyPriceUsd: 49,
        yearlyPriceUsd: 468,
        yearlyMonthlyEquivalent: 39,
        razorpayPlanIds: {
            monthly: process.env.RAZORPAY_PLAN_GROWTH_MONTHLY ?? '',
            yearly: process.env.RAZORPAY_PLAN_GROWTH_YEARLY ?? '',
        },
        limits: {
            postsPerMonth: 60,
            pillars: 5,
            voiceExamples: 25,
            regenerationsPerMonth: null,   // unlimited
            topicsDiscoveredPerDay: 15,
        },
        features: {
            prioritySupport: true,
            unlimitedRegens: true,
        },
        badge: 'Most Popular',
    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get plan config by ID — throws if invalid (never returns undefined) */
export function getPlanConfig(planId: PlanId): PlanConfig {
    const plan = PLANS[planId];
    if (!plan) throw new Error(`Unknown plan: ${planId}`);
    return plan;
}

/** Returns true if a limit has been reached or exceeded */
export function isLimitExceeded(limit: number | null, current: number): boolean {
    if (limit === null) return false; // unlimited
    return current >= limit;
}

/** Returns a 0–100 percentage for a limit (capped at 100) */
export function limitPercentage(limit: number | null, current: number): number {
    if (limit === null || limit === 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
}

/** Free-trial limits — allows testing the product without a subscription */
export const FREE_TRIAL_LIMITS: PlanLimits = {
    postsPerMonth: 3,
    pillars: 1,
    voiceExamples: 3,
    regenerationsPerMonth: 3,
    topicsDiscoveredPerDay: 3,
};
