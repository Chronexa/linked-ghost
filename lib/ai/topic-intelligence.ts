/**
 * Topic Intelligence Scoring
 * Multi-signal scoring system for discovered topics.
 * Ranks topics by how likely they are to produce engaging content
 * for this specific user — not just "are they trending?"
 *
 * Signals:
 *   - Timeliness (25%): How fresh is this topic?
 *   - Audience Fit (25%): Does it match the user's target audience?
 *   - Pillar Alignment (20%): Classification confidence
 *   - Expertise Match (20%): Can this user credibly write about it?
 *   - Novelty (10%): Has the user covered this before?
 */

import { generateEmbedding, cosineSimilarity } from './embeddings';

// ============================================================================
// TYPES
// ============================================================================

export interface TopicIntelligenceScore {
    /** Composite score (0-100) */
    overall: number;
    /** How fresh/timely is this topic (0-100) */
    timeliness: number;
    /** Match to user's target audience (0-100) */
    audienceFit: number;
    /** Fit with assigned content pillar (0-100) */
    pillarAlignment: number;
    /** Can the user credibly write about this? (0-100) */
    expertiseMatch: number;
    /** Is this a fresh topic for this user? (0-100) */
    novelty: number;
    /** Individual signal breakdown */
    breakdown: Record<string, number>;
}

export interface TopicForScoring {
    content: string;
    summary?: string;
    relevanceScore?: number;
    trendingScore?: number;
    sources?: Array<{ url?: string; snippet?: string }>;
}

export interface ScoringContext {
    /** User's target audience description */
    targetAudience?: string;
    /** User's expertise areas */
    expertise?: string[];
    /** User's industry */
    industry?: string;
    /** Pillar name + description for alignment */
    pillarContext?: string;
    /** Classification confidence (0-100) if already classified */
    classificationConfidence?: number;
    /** User's past topic titles for novelty check */
    pastTopicTitles?: string[];
}

// ============================================================================
// SCORING
// ============================================================================

/**
 * Score a discovered topic across 5 intelligence signals.
 */
export async function scoreTopicIntelligence(
    topic: TopicForScoring,
    context: ScoringContext
): Promise<TopicIntelligenceScore> {

    // 1. Timeliness (25%) — based on textual cues
    const timeliness = scoreTimeliness(topic);

    // 2. Audience Fit (25%) — semantic similarity to target audience
    const audienceFit = await scoreAudienceFit(topic, context);

    // 3. Pillar Alignment (20%) — use classification confidence if available
    const pillarAlignment = scorePillarAlignment(topic, context);

    // 4. Expertise Match (20%) — can user credibly speak to this?
    const expertiseMatch = scoreExpertiseMatch(topic, context);

    // 5. Novelty (10%) — has the user already covered this?
    const novelty = scoreNovelty(topic, context);

    // Weighted composite
    const overall = Math.round(
        (timeliness * 0.25) +
        (audienceFit * 0.25) +
        (pillarAlignment * 0.20) +
        (expertiseMatch * 0.20) +
        (novelty * 0.10)
    );

    return {
        overall,
        timeliness,
        audienceFit,
        pillarAlignment,
        expertiseMatch,
        novelty,
        breakdown: {
            timeliness,
            audienceFit,
            pillarAlignment,
            expertiseMatch,
            novelty,
        },
    };
}

/**
 * Batch-score multiple topics.
 */
export async function scoreTopicsBatch(
    topics: TopicForScoring[],
    context: ScoringContext
): Promise<TopicIntelligenceScore[]> {
    return Promise.all(topics.map(topic => scoreTopicIntelligence(topic, context)));
}

// ============================================================================
// INDIVIDUAL SIGNALS
// ============================================================================

function scoreTimeliness(topic: TopicForScoring): number {
    const text = (topic.content + ' ' + (topic.summary || '')).toLowerCase();
    let score = 50; // base

    // Very fresh indicators
    const freshKeywords = ['today', 'just announced', 'breaking', 'this morning', 'hours ago', 'just released'];
    if (freshKeywords.some(kw => text.includes(kw))) score += 30;

    // Recent indicators
    const recentKeywords = ['this week', 'yesterday', 'recently', 'latest', 'new report', 'just published', '2026', '2025'];
    if (recentKeywords.some(kw => text.includes(kw))) score += 15;

    // Use provided trending score as signal
    if (topic.trendingScore) {
        score += Math.round(topic.trendingScore * 20);
    }

    // Penalty: evergreen content is less timely (but still valuable)
    const evergreenKeywords = ['always', 'timeless', 'fundamentals', 'basics', '101'];
    if (evergreenKeywords.some(kw => text.includes(kw))) score -= 10;

    return Math.min(100, Math.max(0, score));
}

async function scoreAudienceFit(topic: TopicForScoring, context: ScoringContext): Promise<number> {
    if (!context.targetAudience) return 50; // Can't score without audience context

    try {
        const topicEmbedding = await generateEmbedding(topic.content);
        const audienceEmbedding = await generateEmbedding(context.targetAudience);
        const similarity = cosineSimilarity(topicEmbedding, audienceEmbedding);
        return Math.round(similarity * 100);
    } catch {
        return 50; // Fallback
    }
}

function scorePillarAlignment(topic: TopicForScoring, context: ScoringContext): number {
    // If we already have classification confidence, use it directly
    if (context.classificationConfidence !== undefined) {
        return context.classificationConfidence;
    }

    // Fallback: text-based matching
    if (!context.pillarContext) return 50;

    const topicLower = topic.content.toLowerCase();
    const pillarLower = context.pillarContext.toLowerCase();

    // Simple word overlap scoring
    const pillarWords = pillarLower.split(/\s+/).filter(w => w.length > 3);
    const matchCount = pillarWords.filter(w => topicLower.includes(w)).length;
    const matchRatio = pillarWords.length > 0 ? matchCount / pillarWords.length : 0;

    return Math.min(100, Math.round(40 + matchRatio * 60));
}

function scoreExpertiseMatch(topic: TopicForScoring, context: ScoringContext): number {
    if (!context.expertise || context.expertise.length === 0) return 50;

    const topicLower = topic.content.toLowerCase();
    let matches = 0;

    for (const skill of context.expertise) {
        if (topicLower.includes(skill.toLowerCase())) matches++;
    }

    // Also check industry
    if (context.industry && topicLower.includes(context.industry.toLowerCase())) matches += 2;

    const matchRatio = matches / (context.expertise.length + 2); // +2 for industry bonus
    return Math.min(100, Math.round(30 + matchRatio * 70));
}

function scoreNovelty(topic: TopicForScoring, context: ScoringContext): number {
    if (!context.pastTopicTitles || context.pastTopicTitles.length === 0) return 80; // New user = everything is novel

    const topicLower = topic.content.toLowerCase();

    // Check for similarity with past topics (simple word overlap)
    let maxOverlap = 0;
    for (const pastTitle of context.pastTopicTitles) {
        const pastWords = pastTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const topicWords = topicLower.split(/\s+/).filter(w => w.length > 3);

        if (pastWords.length === 0 || topicWords.length === 0) continue;

        const overlapCount = topicWords.filter(w => pastWords.includes(w)).length;
        const overlap = overlapCount / Math.max(topicWords.length, 1);
        maxOverlap = Math.max(maxOverlap, overlap);
    }

    // High overlap = low novelty
    return Math.round((1 - maxOverlap) * 100);
}
