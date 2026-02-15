import { db } from '@/lib/db';
import { usageTracking, subscriptions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { format } from 'date-fns';

export type UsageAction = 'generate_post' | 'regenerate_post' | 'classify_topic' | 'analyze_voice';

export const PLAN_LIMITS = {
    starter: {
        posts: 20,
        research: 50,
        voice_analysis: 1,
    },
    growth: {
        posts: 100,
        research: 200,
        voice_analysis: 5,
    },
    agency: {
        posts: 500,
        research: 1000,
        voice_analysis: 20,
    },
    free_trial: {
        posts: 5,
        research: 10,
        voice_analysis: 1,
    }
};

function getCurrentMonth(): string {
    return format(new Date(), 'yyyy-MM');
}

export async function checkUsageLimit(userId: string, action: UsageAction): Promise<{ allowed: boolean; limit: number; current: number; plan: string }> {
    // 1. Get user's plan
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
    });

    const planType = (subscription?.planType || 'free_trial') as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.free_trial;

    // 2. Get current usage
    const currentMonth = getCurrentMonth();
    const usageRecord = await db.query.usageTracking.findFirst({
        where: and(
            eq(usageTracking.userId, userId),
            eq(usageTracking.month, currentMonth)
        ),
    });

    // 3. Determine specific limit and current count
    let limit = 0;
    let currentUsage = 0;

    if (action === 'generate_post' || action === 'regenerate_post') {
        limit = limits.posts;
        currentUsage = (usageRecord?.postsGenerated || 0) + (usageRecord?.regenerationsUsed || 0);
    } else if (action === 'classify_topic') {
        limit = limits.research;
        currentUsage = usageRecord?.topicsClassified || 0;
    } else if (action === 'analyze_voice') {
        limit = limits.voice_analysis;
        currentUsage = usageRecord?.voiceAnalyses || 0;
    }

    return {
        allowed: currentUsage < limit,
        limit,
        current: currentUsage,
        plan: planType
    };
}

export async function incrementUsage(userId: string, action: UsageAction, count: number = 1): Promise<void> {
    const currentMonth = getCurrentMonth();

    // Prepare the update values
    const values = {
        userId,
        month: currentMonth,
        postsGenerated: action === 'generate_post' ? count : 0,
        regenerationsUsed: action === 'regenerate_post' ? count : 0,
        topicsClassified: action === 'classify_topic' ? count : 0,
        voiceAnalyses: action === 'analyze_voice' ? count : 0,
    };

    // Prepare the SQL conflict update
    const conflictUpdate = {
        postsGenerated: action === 'generate_post'
            ? sql`${usageTracking.postsGenerated} + ${count}`
            : undefined,
        regenerationsUsed: action === 'regenerate_post'
            ? sql`${usageTracking.regenerationsUsed} + ${count}`
            : undefined,
        topicsClassified: action === 'classify_topic'
            ? sql`${usageTracking.topicsClassified} + ${count}`
            : undefined,
        voiceAnalyses: action === 'analyze_voice'
            ? sql`${usageTracking.voiceAnalyses} + ${count}`
            : undefined,
        updatedAt: new Date(),
    };

    // Remove undefined keys from conflictUpdate to avoid runtime issues if any
    Object.keys(conflictUpdate).forEach(key =>
        (conflictUpdate as any)[key] === undefined && delete (conflictUpdate as any)[key]
    );

    await db.insert(usageTracking)
        .values(values)
        .onConflictDoUpdate({
            target: [usageTracking.userId, usageTracking.month],
            set: conflictUpdate,
        });
}
