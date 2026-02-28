/**
 * Batch Topic Classification API
 * POST /api/topics/classify/batch - Classify multiple topics at once
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { rawTopics, classifiedTopics, pillars } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { classifyTopicsBatch, needsManualReview, getReviewRecommendation } from '@/lib/ai/classification';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


/**
 * Request body schema
 */
const batchClassifySchema = z.object({
  topics: z
    .array(
      z.object({
        rawTopicId: z.string().uuid().optional(),
        content: z.string().min(10).max(1000),
        sourceUrl: z.string().url().optional(),
      })
    )
    .min(1)
    .max(20), // Limit to 20 topics per batch
  autoApprove: z.boolean().optional().default(true),
});

/**
 * POST /api/topics/classify/batch
 * Classify multiple topics at once (more efficient than individual calls)
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting (more restrictive for batch operations)
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, batchClassifySchema);
    if (!result.success) return result.error;
    const { topics, autoApprove } = result.data;

    console.log(`🔍 Batch classifying ${topics.length} topics for user ${user.id}`);

    // Get user's content pillars
    const userPillars = await db
      .select()
      .from(pillars)
      .where(eq(pillars.userId, user.id));

    if (userPillars.length === 0) {
      return errors.badRequest('You need to create at least one content pillar before classifying topics.');
    }

    // Classify all topics in batch
    const batchResult = await classifyTopicsBatch({
      topics: topics.map((t) => ({
        content: t.content,
        sourceUrl: t.sourceUrl,
      })),
      pillars: userPillars.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        tone: p.tone || undefined,
        targetAudience: p.targetAudience || undefined,
      })),
    });

    // Create classified topics in database
    const classifiedTopicsToInsert = batchResult.results.map((classification, index) => {
      const requiresReview = needsManualReview(classification);
      let status: 'pending' | 'approved' | 'needs_review' = 'approved';

      if (requiresReview) {
        status = 'needs_review';
      } else if (!autoApprove) {
        status = 'pending';
      }

      // Determine hook angle based on topic analysis (simplified)
      const hookAngle: 'emotional' | 'analytical' | 'storytelling' | 'contrarian' | 'data_driven' = 
        classification.reasoning.toLowerCase().includes('data') || classification.reasoning.toLowerCase().includes('analytics') ? 'data_driven' :
        classification.reasoning.toLowerCase().includes('story') ? 'storytelling' :
        classification.reasoning.toLowerCase().includes('emotion') ? 'emotional' :
        classification.reasoning.toLowerCase().includes('contro') ? 'contrarian' :
        'analytical'; // default

      return {
        userId: user.id,
        rawTopicId: topics[index].rawTopicId || null,
        pillarId: classification.pillarId,
        pillarName: classification.pillarName,
        content: classification.topicContent,
        source: 'manual' as const,
        sourceUrl: topics[index].sourceUrl || null,
        aiScore: classification.confidenceScore,
        hookAngle,
        reasoning: classification.reasoning,
        suggestedHashtags: classification.suggestedHashtags,
        status,
      };
    });

    const createdTopics = await db
      .insert(classifiedTopics)
      .values(classifiedTopicsToInsert)
      .returning();

    // Update raw topics if they exist
    const rawTopicIds = topics
      .filter((t) => t.rawTopicId)
      .map((t) => t.rawTopicId as string);

    if (rawTopicIds.length > 0) {
      // Mark raw topics as processed
      await db
        .update(rawTopics)
        .set({
          processedAt: new Date(),
        })
        .where(inArray(rawTopics.id, rawTopicIds));
    }

    // Build response with classification details
    const topicsWithClassification = createdTopics.map((topic, index) => {
      const classification = batchResult.results[index];
      const requiresReview = needsManualReview(classification);

      return {
        ...topic,
        classification: {
          confidenceScore: classification.confidenceScore,
          relevanceScore: classification.relevanceScore,
          reasoning: classification.reasoning,
          requiresReview,
          recommendation: getReviewRecommendation(classification),
        },
      };
    });

    // Count statuses
    const statusCounts = topicsWithClassification.reduce(
      (acc, topic) => {
        acc[topic.status] = (acc[topic.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`✅ Batch classification complete!`);
    console.log(`   Topics classified: ${createdTopics.length}`);
    console.log(`   Average confidence: ${batchResult.metadata.averageConfidence}%`);
    console.log(`   Status breakdown:`, statusCounts);

    return responses.created({
      message: `Successfully classified ${topics.length} topics`,
      topics: topicsWithClassification,
      summary: {
        totalClassified: createdTopics.length,
        averageConfidence: batchResult.metadata.averageConfidence,
        statusCounts,
        needsReview: topicsWithClassification.filter((t) => t.status === 'needs_review').length,
      },
      metadata: batchResult.metadata,
    });
  } catch (error) {
    console.error('Error batch classifying topics:', error);

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errors.internal('OpenAI API key is invalid or missing');
      }
      if (error.message.includes('rate limit')) {
        return errors.rateLimit('OpenAI rate limit exceeded. Please try again in a few moments.');
      }
    }

    return errors.internal('Failed to classify topics. Please try again.');
  }
});
