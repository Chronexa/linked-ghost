/**
 * Semantic Deduplication
 * Prevents the AI from generating posts that are too similar to what the
 * user has already published or approved.
 *
 * Uses cosine similarity between draft embeddings to detect overlap.
 * Thresholds:
 *   > 0.85 → force_new_angle (too similar, audience will notice)
 *   > 0.75 → warn (noticeable overlap)
 *   ≤ 0.75 → proceed (sufficiently different)
 */

import { generateEmbedding, cosineSimilarity } from './embeddings';
import { db } from '@/lib/db';
import { generatedDrafts } from '@/lib/db/schema';
import { eq, and, inArray, isNotNull } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface DeduplicationResult {
    /** Whether any past draft is too similar */
    isDuplicate: boolean;
    /** Highest similarity score found (0-1 scale) */
    similarityScore: number;
    /** ID of the most similar past draft, if any */
    mostSimilarDraftId: string | null;
    /** Preview text of the most similar draft (first 100 chars) */
    mostSimilarDraftPreview: string | null;
    /** Action recommendation */
    recommendation: 'proceed' | 'warn' | 'force_new_angle';
}

// ============================================================================
// CORE FUNCTION
// ============================================================================

/**
 * Check a new draft against a user's past published/approved drafts
 * for semantic similarity.
 *
 * @param newDraftText - The full text of the new draft to check
 * @param userId - The user whose past drafts to compare against
 * @param threshold - Similarity threshold for "too similar" (default 0.85)
 * @returns DeduplicationResult with recommendation
 */
export async function checkSemanticDuplication(params: {
    newDraftText: string;
    userId: string;
    threshold?: number;
}): Promise<DeduplicationResult> {
    const { newDraftText, userId, threshold = 0.85 } = params;

    // 1. Fetch past drafts that have embeddings and are approved/posted
    const pastDrafts = await db
        .select({
            id: generatedDrafts.id,
            fullText: generatedDrafts.fullText,
            embedding: generatedDrafts.embedding,
        })
        .from(generatedDrafts)
        .where(
            and(
                eq(generatedDrafts.userId, userId),
                inArray(generatedDrafts.status, ['approved', 'posted', 'draft']),
                isNotNull(generatedDrafts.embedding)
            )
        )
        .limit(100); // Check against last 100 drafts

    // No past drafts → no duplication possible
    if (pastDrafts.length === 0) {
        return {
            isDuplicate: false,
            similarityScore: 0,
            mostSimilarDraftId: null,
            mostSimilarDraftPreview: null,
            recommendation: 'proceed',
        };
    }

    // 2. Generate embedding for the new draft
    const newEmbedding = await generateEmbedding(newDraftText);

    // 3. Compare against each past draft's embedding
    let maxSimilarity = 0;
    let mostSimilarDraft: { id: string; fullText: string } | null = null;

    for (const draft of pastDrafts) {
        if (!draft.embedding || !Array.isArray(draft.embedding)) continue;

        const similarity = cosineSimilarity(newEmbedding, draft.embedding as number[]);

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarDraft = { id: draft.id, fullText: draft.fullText };
        }
    }

    // 4. Determine recommendation
    let recommendation: DeduplicationResult['recommendation'] = 'proceed';
    if (maxSimilarity > threshold) {
        recommendation = 'force_new_angle';
    } else if (maxSimilarity > 0.75) {
        recommendation = 'warn';
    }

    const result: DeduplicationResult = {
        isDuplicate: maxSimilarity > threshold,
        similarityScore: Math.round(maxSimilarity * 1000) / 1000, // 3 decimal places
        mostSimilarDraftId: mostSimilarDraft?.id ?? null,
        mostSimilarDraftPreview: mostSimilarDraft
            ? mostSimilarDraft.fullText.slice(0, 100) + '...'
            : null,
        recommendation,
    };

    if (recommendation !== 'proceed') {
        console.log(`🔄 Dedup ${recommendation}: similarity=${result.similarityScore} with draft ${result.mostSimilarDraftId}`);
    }

    return result;
}

/**
 * Embed a draft and return the embedding vector.
 * Used to store embeddings on newly created drafts so future dedup checks
 * can compare against them.
 */
export async function embedDraftText(text: string): Promise<number[]> {
    return generateEmbedding(text);
}
