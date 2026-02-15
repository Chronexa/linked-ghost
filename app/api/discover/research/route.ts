/**
 * Topic Research API
 * POST /api/discover/research - Research a specific topic in depth using Perplexity
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { rawTopics, pillars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { researchTopic } from '@/lib/ai/perplexity';
import { z } from 'zod';

/**
 * Request body schema
 */
const researchSchema = z.object({
  topic: z.string().min(10).max(500),
  pillarId: z.string().uuid().optional(),
  autoSave: z.boolean().optional().default(false),
});

/**
 * POST /api/discover/research
 * Research a specific topic in depth
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, researchSchema);
    if (!result.success) return result.error;
    const { topic, pillarId, autoSave } = result.data;

    console.log(`📚 Researching topic for user ${user.id}: ${topic.slice(0, 50)}...`);

    // Get pillar context if provided
    let pillarContext: string | undefined;
    if (pillarId) {
      const pillar = await db.query.pillars.findFirst({
        where: eq(pillars.id, pillarId),
      });

      if (!pillar || pillar.userId !== user.id) {
        return errors.notFound('Pillar');
      }

      pillarContext = `${pillar.name}: ${pillar.description || ''}. Tone: ${pillar.tone || 'professional'}. Audience: ${pillar.targetAudience || 'professionals'}.`;
    }

    // Research topic using Perplexity
    const research = await researchTopic({
      topic,
      pillarContext,
    });

    // Save to database if autoSave is enabled
    let savedTopic = null;
    if (autoSave) {
      console.log(`💾 Saving researched topic...`);

      [savedTopic] = await db
        .insert(rawTopics)
        .values({
          userId: user.id,
          source: 'perplexity',
          sourceUrl: research.sources[0]?.url || null,
          content: research.content,
          rawData: {
            summary: research.summary,
            keyPoints: research.keyPoints,
            sources: research.sources,
            relevanceScore: research.relevanceScore,
            trendingScore: research.trendingScore,
            suggestedHashtags: research.suggestedHashtags,
          },
        })
        .returning();
    }

    console.log(`✅ Research complete!`);
    console.log(`   Relevance: ${research.relevanceScore}%`);
    console.log(`   Trending: ${research.trendingScore}%`);
    console.log(`   Key points: ${research.keyPoints.length}`);

    return responses.ok({
      message: 'Topic research completed',
      research: {
        ...research,
        savedId: savedTopic?.id || null,
      },
    });
  } catch (error) {
    console.error('Error researching topic:', error);

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errors.internal('Perplexity API key is invalid or missing');
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return errors.rateLimit('Perplexity rate limit exceeded. Please try again in a few moments.');
      }
    }

    return errors.internal('Failed to research topic. Please try again.');
  }
});
