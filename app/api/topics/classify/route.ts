/**
 * Topic Classification API
 * POST /api/topics/classify - Classify a topic into a content pillar using GPT-4o-mini
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { rawTopics, classifiedTopics, pillars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { classifyTopic, needsManualReview, getReviewRecommendation } from '@/lib/ai/classification';
import { z } from 'zod';

/**
 * Request body schema
 */
const classifySchema = z.object({
  rawTopicId: z.string().uuid().optional(),
  topicContent: z.string().min(10).max(1000),
  sourceUrl: z.string().url().optional(),
  autoApprove: z.boolean().optional().default(true), // Auto-approve high-confidence classifications
});

/**
 * POST /api/topics/classify
 * Classify a topic into the most appropriate content pillar
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting (AI operations are more expensive)
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, classifySchema);
    if (!result.success) return result.error;
    const { rawTopicId, topicContent, sourceUrl, autoApprove } = result.data;

    console.log(`🔍 Classifying topic for user ${user.id}`);

    // Get user's content pillars
    const userPillars = await db
      .select()
      .from(pillars)
      .where(eq(pillars.userId, user.id));

    if (userPillars.length === 0) {
      return errors.badRequest('You need to create at least one content pillar before classifying topics.');
    }

    // Classify the topic
    const classification = await classifyTopic({
      topicContent,
      sourceUrl,
      pillars: userPillars.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        tone: p.tone || undefined,
        targetAudience: p.targetAudience || undefined,
      })),
    });

    // Check if manual review is needed
    const requiresReview = needsManualReview(classification);
    const recommendation = getReviewRecommendation(classification);

    // Determine status based on confidence and auto-approve setting
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

    // Create classified topic
    const [classifiedTopic] = await db
      .insert(classifiedTopics)
      .values({
        userId: user.id,
        rawTopicId: rawTopicId || null,
        pillarId: classification.pillarId,
        pillarName: classification.pillarName,
        content: topicContent,
        source: rawTopicId ? 'manual' : 'manual', // Both are manual for now
        sourceUrl: sourceUrl || null,
        aiScore: classification.confidenceScore,
        hookAngle,
        reasoning: classification.reasoning,
        suggestedHashtags: classification.suggestedHashtags,
        status,
      })
      .returning();

    // If this was from a raw topic, mark it as processed
    if (rawTopicId) {
      await db
        .update(rawTopics)
        .set({
          processedAt: new Date(),
        })
        .where(eq(rawTopics.id, rawTopicId));
    }

    console.log(`✅ Topic classified into pillar: ${classification.pillarName}`);
    console.log(`   Confidence: ${classification.confidenceScore}%`);
    console.log(`   Relevance: ${classification.relevanceScore}%`);
    console.log(`   Status: ${status}`);

    return responses.created({
      message: `Topic successfully classified into "${classification.pillarName}"`,
      topic: classifiedTopic,
      classification: {
        pillarName: classification.pillarName,
        confidenceScore: classification.confidenceScore,
        relevanceScore: classification.relevanceScore,
        reasoning: classification.reasoning,
        suggestedHashtags: classification.suggestedHashtags,
        requiresReview,
        recommendation,
      },
    });
  } catch (error) {
    console.error('Error classifying topic:', error);
    
    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errors.internal('OpenAI API key is invalid or missing');
      }
      if (error.message.includes('rate limit')) {
        return errors.rateLimit('OpenAI rate limit exceeded. Please try again in a few moments.');
      }
    }
    
    return errors.internal('Failed to classify topic. Please try again.');
  }
});
