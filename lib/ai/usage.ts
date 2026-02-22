// lib/ai/usage.ts
// ============================================================
// USAGE ENFORCEMENT — SINGLE SOURCE OF USAGE CHECKS
// All limit values come from getPlanConfig() — NEVER hardcoded here.
// ============================================================

import { db } from '@/lib/db';
import { usageTracking, subscriptions, pillars, voiceExamples } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { format } from 'date-fns';
import {
    getPlanConfig,
    isLimitExceeded,
    limitPercentage,
    FREE_TRIAL_LIMITS,
    type PlanId,
    type PlanLimits,
    type PlanConfig,
} from '@/lib/config/plans.config';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getCurrentMonth(): string {
    return format(new Date(), 'yyyy-MM');
}

async function getSubscriptionAndLimits(userId: string): Promise<{
    planId: PlanId | 'free_trial';
    planConfig: PlanConfig | null;
    limits: PlanLimits;
    status: string | null;
}> {
    const sub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
    });

    // Users without a subscription OR with halted/canceled get free trial limits
    const hasAccess = sub && (sub.status === 'active' || sub.status === 'trialing');

    if (!hasAccess || !sub) {
        return { planId: 'free_trial', planConfig: null, limits: FREE_TRIAL_LIMITS, status: sub?.status ?? null };
    }

    const planConfig = getPlanConfig(sub.planType as PlanId);
    return { planId: sub.planType as PlanId, planConfig, limits: planConfig.limits, status: sub.status };
}

async function getCurrentUsage(userId: string) {
    const currentMonth = getCurrentMonth();
    return await db.query.usageTracking.findFirst({
        where: and(eq(usageTracking.userId, userId), eq(usageTracking.month, currentMonth)),
    });
}

// ---------------------------------------------------------------------------
// Public: Can-do checks (called BEFORE taking action, return HTTP 402 if false)
// ---------------------------------------------------------------------------

export async function canGeneratePost(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number | null;
}> {
    const { limits } = await getSubscriptionAndLimits(userId);
    const usage = await getCurrentUsage(userId);
    const current = (usage?.postsGenerated ?? 0) + (usage?.regenerationsUsed ?? 0);
    const allowed = !isLimitExceeded(limits.postsPerMonth, current);
    return {
        allowed,
        current,
        limit: limits.postsPerMonth,
        reason: allowed ? undefined : `You've used ${current} of ${limits.postsPerMonth} posts this month. Upgrade to generate more.`,
    };
}

export async function canRegenerate(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number | null;
}> {
    const { limits } = await getSubscriptionAndLimits(userId);

    // If unlimited regens, short-circuit
    if (limits.regenerationsPerMonth === null) {
        return { allowed: true, current: 0, limit: null };
    }

    const usage = await getCurrentUsage(userId);
    const current = usage?.regenerationsUsed ?? 0;
    const allowed = !isLimitExceeded(limits.regenerationsPerMonth, current);
    return {
        allowed,
        current,
        limit: limits.regenerationsPerMonth,
        reason: allowed ? undefined : `You've used ${current} of ${limits.regenerationsPerMonth} regenerations this month. Upgrade for unlimited regenerations.`,
    };
}

export async function canAddPillar(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number | null;
}> {
    const { limits } = await getSubscriptionAndLimits(userId);
    const pillarRows = await db.select({ count: sql<number>`count(*)::int` })
        .from(pillars)
        .where(and(eq(pillars.userId, userId), eq(pillars.status, 'active')));
    const current = pillarRows[0]?.count ?? 0;
    const allowed = !isLimitExceeded(limits.pillars, current);
    return {
        allowed,
        current,
        limit: limits.pillars,
        reason: allowed ? undefined : `You have ${current} of ${limits.pillars} pillars. Upgrade to add more content pillars.`,
    };
}

export async function canAddVoiceExample(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    current: number;
    limit: number | null;
}> {
    const { limits } = await getSubscriptionAndLimits(userId);
    const exampleRows = await db.select({ count: sql<number>`count(*)::int` })
        .from(voiceExamples)
        .where(and(eq(voiceExamples.userId, userId), eq(voiceExamples.status, 'active')));
    const current = exampleRows[0]?.count ?? 0;
    const allowed = !isLimitExceeded(limits.voiceExamples, current);
    return {
        allowed,
        current,
        limit: limits.voiceExamples,
        reason: allowed ? undefined : `You have ${current} of ${limits.voiceExamples} voice examples. Upgrade to add more.`,
    };
}

// ---------------------------------------------------------------------------
// Public: Usage summary (for billing page display)
// ---------------------------------------------------------------------------

export async function getUsageSummary(userId: string) {
    const { planId, planConfig, limits, status } = await getSubscriptionAndLimits(userId);
    const usage = await getCurrentUsage(userId);

    const postsThisMonth = (usage?.postsGenerated ?? 0) + (usage?.regenerationsUsed ?? 0);
    const regenerationsThisMonth = usage?.regenerationsUsed ?? 0;

    const pillarRows = await db.select({ count: sql<number>`count(*)::int` })
        .from(pillars)
        .where(and(eq(pillars.userId, userId), eq(pillars.status, 'active')));
    const pillarsCount = pillarRows[0]?.count ?? 0;

    const exampleRows = await db.select({ count: sql<number>`count(*)::int` })
        .from(voiceExamples)
        .where(and(eq(voiceExamples.userId, userId), eq(voiceExamples.status, 'active')));
    const voiceExamplesCount = exampleRows[0]?.count ?? 0;

    return {
        planId,
        planConfig,
        status,
        limits,
        usage: {
            postsThisMonth,
            regenerationsThisMonth,
            pillarsCount,
            voiceExamplesCount,
        },
        percentages: {
            posts: limitPercentage(limits.postsPerMonth, postsThisMonth),
            regenerations: limitPercentage(limits.regenerationsPerMonth, regenerationsThisMonth),
            pillars: limitPercentage(limits.pillars, pillarsCount),
            voiceExamples: limitPercentage(limits.voiceExamples, voiceExamplesCount),
        },
    };
}

// ---------------------------------------------------------------------------
// Public: Increment usage counters (called AFTER taking action)
// ---------------------------------------------------------------------------

export type UsageAction = 'generate_post' | 'regenerate_post' | 'classify_topic' | 'analyze_voice';

export async function incrementUsage(userId: string, action: UsageAction, count: number = 1): Promise<void> {
    const currentMonth = getCurrentMonth();

    const values = {
        userId,
        month: currentMonth,
        postsGenerated: action === 'generate_post' ? count : 0,
        regenerationsUsed: action === 'regenerate_post' ? count : 0,
        topicsClassified: action === 'classify_topic' ? count : 0,
        voiceAnalyses: action === 'analyze_voice' ? count : 0,
    };

    const conflictUpdate: Record<string, any> = { updatedAt: new Date() };
    if (action === 'generate_post') conflictUpdate.postsGenerated = sql`${usageTracking.postsGenerated} + ${count}`;
    if (action === 'regenerate_post') conflictUpdate.regenerationsUsed = sql`${usageTracking.regenerationsUsed} + ${count}`;
    if (action === 'classify_topic') conflictUpdate.topicsClassified = sql`${usageTracking.topicsClassified} + ${count}`;
    if (action === 'analyze_voice') conflictUpdate.voiceAnalyses = sql`${usageTracking.voiceAnalyses} + ${count}`;

    await db.insert(usageTracking)
        .values(values)
        .onConflictDoUpdate({
            target: [usageTracking.userId, usageTracking.month],
            set: conflictUpdate,
        });
}

// ---------------------------------------------------------------------------
// Legacy compat: checkUsageLimit (wraps canGeneratePost for existing routes)
// ---------------------------------------------------------------------------

export async function checkUsageLimit(userId: string, action: UsageAction): Promise<{
    allowed: boolean;
    limit: number | null;
    current: number;
    plan: string;
}> {
    const { planId, limits, status } = await getSubscriptionAndLimits(userId);

    const usage = await getCurrentUsage(userId);
    let limit: number | null = null;
    let current = 0;

    if (action === 'generate_post' || action === 'regenerate_post') {
        limit = limits.postsPerMonth;
        current = (usage?.postsGenerated ?? 0) + (usage?.regenerationsUsed ?? 0);
    } else if (action === 'classify_topic') {
        limit = limits.topicsDiscoveredPerDay;
        current = usage?.topicsClassified ?? 0;
    } else if (action === 'analyze_voice') {
        limit = limits.voiceExamples;
        current = usage?.voiceAnalyses ?? 0;
    }

    return {
        allowed: !isLimitExceeded(limit, current),
        limit,
        current,
        plan: planId,
    };
}
