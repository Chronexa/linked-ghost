/**
 * Engagement Learning Engine
 * Analyzes patterns from top-performing posts to improve future generation.
 * This is "the compounding moat" — the system gets smarter with usage.
 */

import { openai, DEFAULT_CONFIG } from './openai';
import { db } from '@/lib/db';
import { postPerformance } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface WinningPatterns {
    /** Hook patterns that drove the most engagement */
    hookPatterns: string[];
    /** Topic categories that performed best */
    topicCategories: string[];
    /** Structural patterns (lists, stories, data-driven, etc.) */
    structuralPatterns: string[];
    /** Optimal post length range */
    optimalLength: { min: number; max: number };
    /** Audience-resonance insights */
    audienceInsights: string[];
    /** Computed from data, not AI */
    stats: {
        totalPostsAnalyzed: number;
        avgLikes: number;
        avgComments: number;
        topPerformerCount: number;
    };
}

// ============================================================================
// PERFORMANCE CLASSIFICATION
// ============================================================================

/**
 * Calculate engagement rate and classify performance tier.
 */
export function classifyPerformance(metrics: {
    likes: number;
    comments: number;
    reposts: number;
    impressions: number;
    userAverages?: {
        avgLikes: number;
        avgComments: number;
    };
}): {
    engagementRate: number;
    tier: 'top_performer' | 'above_average' | 'average' | 'below_average';
} {
    const totalEngagement = metrics.likes + metrics.comments + metrics.reposts;

    // Engagement rate in basis points (multiply by 10000 for storage as int)
    const engagementRate = metrics.impressions > 0
        ? Math.round((totalEngagement / metrics.impressions) * 10000)
        : 0;

    // If we have user averages, classify relative to their baseline
    if (metrics.userAverages) {
        const avgEngagement = metrics.userAverages.avgLikes + metrics.userAverages.avgComments;
        const ratio = avgEngagement > 0 ? totalEngagement / avgEngagement : 1;

        if (ratio >= 2.0) return { engagementRate, tier: 'top_performer' };
        if (ratio >= 1.3) return { engagementRate, tier: 'above_average' };
        if (ratio >= 0.7) return { engagementRate, tier: 'average' };
        return { engagementRate, tier: 'below_average' };
    }

    // Absolute classification (LinkedIn benchmarks)
    if (totalEngagement >= 100) return { engagementRate, tier: 'top_performer' };
    if (totalEngagement >= 40) return { engagementRate, tier: 'above_average' };
    if (totalEngagement >= 10) return { engagementRate, tier: 'average' };
    return { engagementRate, tier: 'below_average' };
}

// ============================================================================
// USER AVERAGES
// ============================================================================

/**
 * Get user's average engagement metrics from past performance data.
 */
export async function getUserAverages(userId: string): Promise<{
    avgLikes: number;
    avgComments: number;
    avgReposts: number;
    totalPosts: number;
} | null> {
    const performances = await db
        .select({
            likes: postPerformance.likes,
            comments: postPerformance.comments,
            reposts: postPerformance.reposts,
        })
        .from(postPerformance)
        .where(eq(postPerformance.userId, userId))
        .limit(100);

    if (performances.length === 0) return null;

    const totalPosts = performances.length;
    const avgLikes = Math.round(performances.reduce((s, p) => s + p.likes, 0) / totalPosts);
    const avgComments = Math.round(performances.reduce((s, p) => s + p.comments, 0) / totalPosts);
    const avgReposts = Math.round(performances.reduce((s, p) => s + p.reposts, 0) / totalPosts);

    return { avgLikes, avgComments, avgReposts, totalPosts };
}

// ============================================================================
// WINNING PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze winning patterns from top-performing posts using GPT-4o.
 * Requires at least 5 posts with performance data to run meaningfully.
 */
export async function analyzeWinningPatterns(userId: string): Promise<WinningPatterns | null> {
    // Fetch performance data
    const performances = await db
        .select({
            likes: postPerformance.likes,
            comments: postPerformance.comments,
            reposts: postPerformance.reposts,
            impressions: postPerformance.impressions,
            postText: postPerformance.postText,
            performanceTier: postPerformance.performanceTier,
        })
        .from(postPerformance)
        .where(eq(postPerformance.userId, userId))
        .orderBy(desc(postPerformance.likes))
        .limit(50);

    if (performances.length < 5) {
        console.log(`📊 Insufficient data for pattern analysis: ${performances.length} posts (need 5+)`);
        return null;
    }

    const topPerformers = performances.filter(p =>
        p.performanceTier === 'top_performer' || p.performanceTier === 'above_average'
    );
    const averagePosts = performances.filter(p =>
        p.performanceTier === 'average' || p.performanceTier === 'below_average'
    );

    if (topPerformers.length < 2) {
        console.log('📊 Not enough top performers for meaningful analysis');
        return null;
    }

    // Calculate stats
    const totalPosts = performances.length;
    const avgLikes = Math.round(performances.reduce((s, p) => s + p.likes, 0) / totalPosts);
    const avgComments = Math.round(performances.reduce((s, p) => s + p.comments, 0) / totalPosts);

    console.log(`🧠 Analyzing winning patterns from ${topPerformers.length} top posts vs ${averagePosts.length} average posts...`);

    // Use GPT-4o to analyze patterns
    const prompt = `Analyze the following LinkedIn posts and their engagement data.

**TOP PERFORMERS (high engagement):**
${topPerformers.slice(0, 10).map((p, i) =>
        `Post ${i + 1} (${p.likes} likes, ${p.comments} comments): ${p.postText?.slice(0, 500) || 'N/A'}`
    ).join('\n\n')}

**AVERAGE POSTS (lower engagement):**
${averagePosts.slice(0, 5).map((p, i) =>
        `Post ${i + 1} (${p.likes} likes, ${p.comments} comments): ${p.postText?.slice(0, 500) || 'N/A'}`
    ).join('\n\n')}

Analyze what makes the top performers work better. Return ONLY valid JSON:
{
  "hookPatterns": ["<patterns in how top posts open, max 5>"],
  "topicCategories": ["<what topics drive engagement, max 5>"],
  "structuralPatterns": ["<formatting/structure patterns that work, max 5>"],
  "optimalLength": { "min": <number>, "max": <number> },
  "audienceInsights": ["<what resonates with this person's audience, max 5>"]
}`;

    try {
        const response = await openai.chat.completions.create({
            model: DEFAULT_CONFIG.generation.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert LinkedIn content strategist analyzing post performance data. Return only valid JSON.'
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 800,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        if (!content) return null;

        const parsed = JSON.parse(content);

        return {
            hookPatterns: Array.isArray(parsed.hookPatterns) ? parsed.hookPatterns.slice(0, 5) : [],
            topicCategories: Array.isArray(parsed.topicCategories) ? parsed.topicCategories.slice(0, 5) : [],
            structuralPatterns: Array.isArray(parsed.structuralPatterns) ? parsed.structuralPatterns.slice(0, 5) : [],
            optimalLength: parsed.optimalLength || { min: 800, max: 1500 },
            audienceInsights: Array.isArray(parsed.audienceInsights) ? parsed.audienceInsights.slice(0, 5) : [],
            stats: {
                totalPostsAnalyzed: totalPosts,
                avgLikes,
                avgComments,
                topPerformerCount: topPerformers.length,
            },
        };
    } catch (error) {
        console.error('❌ Winning pattern analysis failed:', error);
        return null;
    }
}

// ============================================================================
// PROMPT INJECTION
// ============================================================================

/**
 * Build an engagement intelligence section for injection into generation prompts.
 */
export function buildEngagementIntelligenceSection(patterns: WinningPatterns | null): string {
    if (!patterns) return '';
    if (patterns.stats.totalPostsAnalyzed < 5) return '';

    let section = `\n\n**ENGAGEMENT INTELLIGENCE (learned from your top-performing posts):**\n`;

    if (patterns.hookPatterns.length > 0) {
        section += `- Your best hooks use: ${patterns.hookPatterns.join('; ')}\n`;
    }

    if (patterns.topicCategories.length > 0) {
        section += `- Your audience engages most with: ${patterns.topicCategories.join(', ')}\n`;
    }

    if (patterns.structuralPatterns.length > 0) {
        section += `- Structure that works: ${patterns.structuralPatterns.join(', ')}\n`;
    }

    section += `- Optimal post length: ${patterns.optimalLength.min}-${patterns.optimalLength.max} characters\n`;

    if (patterns.audienceInsights.length > 0) {
        section += `- What resonates: ${patterns.audienceInsights.join('; ')}\n`;
    }

    section += `- Based on ${patterns.stats.totalPostsAnalyzed} published posts (${patterns.stats.topPerformerCount} top performers)\n`;

    return section;
}
