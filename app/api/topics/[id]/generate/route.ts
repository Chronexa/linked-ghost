/**
 * Topic Generation API
 * POST /api/topics/:id/generate - Generate 3 draft variants from a topic using GPT-4o
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { classifiedTopics, generatedDrafts, voiceExamples, pillars, profiles } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateDraftVariants, estimateEngagement } from '@/lib/ai/generation';

/**
 * POST /api/topics/:id/generate
 * Generate 3 draft variants (A, B, C) from a classified topic
 * This is a simplified version - full implementation will use OpenAI
 */
export const POST = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting (more restrictive for AI generation)
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id: topicId } = params;

    // Get topic
    const topic = await db.query.classifiedTopics.findFirst({
      where: and(
        eq(classifiedTopics.id, topicId),
        eq(classifiedTopics.userId, user.id)
      ),
    });

    if (!topic) {
      return errors.notFound('Topic');
    }

    // Get pillar for context
    const pillar = await db.query.pillars.findFirst({
      where: eq(pillars.id, topic.pillarId),
    });

    // Get voice examples (3-10 examples, preferably from same pillar)
    const examples = await db
      .select()
      .from(voiceExamples)
      .where(and(
        eq(voiceExamples.userId, user.id),
        eq(voiceExamples.status, 'active')
      ))
      .orderBy(
        // Prioritize examples from same pillar
        sql`CASE WHEN ${voiceExamples.pillarId} = ${topic.pillarId} THEN 0 ELSE 1 END`,
        sql`${voiceExamples.createdAt} desc`
      )
      .limit(10);

    if (examples.length < 3) {
      return errors.badRequest('You need at least 3 voice training examples to generate posts. Please add more examples in Voice Training.');
    }

    // Get user profile (with voice embedding)
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });

    if (!profile?.voiceEmbedding) {
      return errors.badRequest('Voice profile not trained. Please analyze your voice first in Voice Training.');
    }

    console.log(`🚀 Generating drafts for topic: ${topic.content}`);

    // Call OpenAI to generate 3 variants
    const result = await generateDraftVariants({
      topicTitle: topic.content,
      topicDescription: topic.sourceUrl || undefined,
      pillarName: pillar?.name || 'General',
      pillarDescription: pillar?.description || undefined,
      pillarTone: pillar?.tone || undefined,
      targetAudience: pillar?.targetAudience || profile.targetAudience || undefined,
      customPrompt: pillar?.customPrompt || undefined,
      voiceExamples: examples.map((ex) => ({
        postText: ex.postText,
        embedding: ex.embedding as number[] | undefined,
      })),
      masterVoiceEmbedding: profile.voiceEmbedding as number[],
    });

    // Prepare drafts for database insertion
    const draftsToInsert = result.variants.map((variant) => {
      const engagement = estimateEngagement(variant.post);

      return {
        userId: user.id,
        topicId: topic.id,
        pillarId: topic.pillarId,
        variantLetter: variant.variantLetter,
        fullText: variant.post.fullText,
        hook: variant.post.hook,
        body: variant.post.body,
        cta: variant.post.cta,
        hashtags: variant.post.hashtags,
        characterCount: variant.post.characterCount,
        estimatedEngagement: engagement,
        status: 'draft' as const,
      };
    });

    // Insert all drafts
    const createdDrafts = await db
      .insert(generatedDrafts)
      .values(draftsToInsert)
      .returning();

    console.log(`✅ Generated ${createdDrafts.length} drafts successfully`);

    return responses.created({
      message: '3 draft variants generated successfully using GPT-4o',
      drafts: createdDrafts.map((draft, index) => ({
        ...draft,
        voiceMatchScore: result.variants[index].voiceMatchScore,
        style: result.variants[index].style,
      })),
      topic: {
        id: topic.id,
        content: topic.content,
        pillarName: pillar?.name,
      },
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Error generating drafts:', error);
    
    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errors.internal('OpenAI API key is invalid or missing');
      }
      if (error.message.includes('rate limit')) {
        return errors.rateLimit('OpenAI rate limit exceeded. Please try again in a few moments.');
      }
    }
    
    return errors.internal('Failed to generate drafts. Please try again.');
  }
});
