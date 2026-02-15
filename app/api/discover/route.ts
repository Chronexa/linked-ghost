/**
 * Content Discovery API
 * POST /api/discover - Discover trending topics using Perplexity
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { rawTopics, pillars, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { discoverTopics } from '@/lib/ai/perplexity';
import { getPrompt, PROMPT_KEYS } from '@/lib/prompts/store';
import { z } from 'zod';

/**
 * Request body schema
 */
const discoverSchema = z.object({
  domain: z.string().min(3).max(200),
  pillarId: z.string().uuid().optional(),
  count: z.number().int().min(1).max(10).optional().default(5),
  autoSave: z.boolean().optional().default(true),
});

/**
 * POST /api/discover
 * Discover trending topics in a specific domain using Perplexity
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting (Perplexity is expensive, limit strictly)
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, discoverSchema);
    if (!result.success) return result.error;
    const { domain, pillarId, count, autoSave } = result.data;

    console.log(`🔍 Discovering topics for user ${user.id} in domain: ${domain}`);

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

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
      columns: { defaultInstructions: true },
    });
    const userInstructions = profile?.defaultInstructions ?? '';
    let systemPrompt: string | undefined;
    let userQuery: string | undefined;
    try {
      systemPrompt = await getPrompt(PROMPT_KEYS.RESEARCH_SYSTEM, { userInstructions });
      userQuery = await getPrompt(PROMPT_KEYS.RESEARCH_USER, {
        domain,
        count,
        pillarContext: pillarContext ? `Focus on topics relevant to: ${pillarContext}` : '',
        userInstructions: userInstructions ? `User instructions: ${userInstructions}` : '',
      });
    } catch {
      systemPrompt = undefined;
      userQuery = undefined;
    }

    const discoveryResult = await discoverTopics({
      domain,
      pillarContext,
      count,
      systemPrompt,
      userQuery,
    });

    // Save topics to database if autoSave is enabled
    let savedTopics: Array<{ id: string }> = [];
    if (autoSave && discoveryResult.topics.length > 0) {
      console.log(`💾 Saving ${discoveryResult.topics.length} discovered topics...`);

      const topicsToInsert = discoveryResult.topics.map((topic) => ({
        userId: user.id,
        source: 'perplexity' as const,
        sourceUrl: topic.sources[0]?.url || null,
        content: topic.content,
        rawData: {
          summary: topic.summary,
          keyPoints: topic.keyPoints,
          sources: topic.sources,
          relevanceScore: topic.relevanceScore,
          trendingScore: topic.trendingScore,
          suggestedHashtags: topic.suggestedHashtags,
        },
      }));

      savedTopics = await db.insert(rawTopics).values(topicsToInsert).returning();
    }

    console.log(`✅ Discovery complete! Found ${discoveryResult.topics.length} topics`);

    return responses.ok({
      message: `Discovered ${discoveryResult.topics.length} trending topics`,
      topics: discoveryResult.topics.map((topic, index) => ({
        ...topic,
        savedId: savedTopics[index]?.id || null,
      })),
      metadata: discoveryResult.metadata,
      saved: autoSave ? savedTopics.length : 0,
    });
  } catch (error) {
    console.error('Error discovering topics:', error);

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errors.internal('Perplexity API key is invalid or missing');
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return errors.rateLimit('Perplexity rate limit exceeded. Please try again in a few moments.');
      }
    }

    return errors.internal('Failed to discover topics. Please try again.');
  }
});
