/**
 * Topic Generation API
 * POST /api/topics/:id/generate - Generate 2 draft variants from a topic using GPT-4o
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { classifiedTopics, generatedDrafts, voiceExamples, pillars, profiles } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateDraftVariants, estimateEngagement } from '@/lib/ai/generation';
import { z } from 'zod';
import { retry, isRetryableError } from '@/lib/utils/retry';
import { enqueueGeneration } from '@/lib/queue';
import { canGeneratePost, incrementUsage } from '@/lib/ai/usage';

export const dynamic = 'force-dynamic';

// Export max duration to prevent serverless timeouts during fallback AI generation
export const maxDuration = 60;

// Validation schema
const generateSchema = z.object({
  userPerspective: z.string()
    .min(50, 'User perspective must be at least 50 characters')
    .max(500, 'User perspective must be less than 500 characters'), // Align with frontend
  pillarId: z.string().uuid().optional(),
});

/**
 * POST /api/topics/:id/generate
 * Generate 2 draft variants (A, B) from a classified topic with user perspective
 */
export const POST = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting (more restrictive for AI generation)
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id: topicId } = params;

    // Check post generation limit from subscription plan
    const usageCheck = await canGeneratePost(user.id);
    if (!usageCheck.allowed) {
      return errors.paymentRequired(usageCheck.reason || 'Post limit reached. Upgrade your plan to generate more posts.');
    }

    // Validate request body
    const validation = await validateBody(req, generateSchema);
    if (!validation.success) return validation.error;

    const { userPerspective, pillarId: requestedPillarId } = validation.data;

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

    // Use requested pillarId or fall back to topic's pillarId
    const effectivePillarId = requestedPillarId || topic.pillarId;

    // Get pillar for context
    const pillar = await db.query.pillars.findFirst({
      where: eq(pillars.id, effectivePillarId),
    });

    // Get voice examples (3-10 examples, preferably from same pillar)
    // Get voice examples (application-level sorting to prevent SQL injection)
    const allExamples = await db
      .select()
      .from(voiceExamples)
      .where(and(
        eq(voiceExamples.userId, user.id),
        eq(voiceExamples.status, 'active')
      ))
      .limit(20); // Get more than needed for sorting

    // Sort: same pillar first, then by date (application-level)
    const examples = allExamples
      .sort((a, b) => {
        // Prioritize examples from same pillar
        const aPriority = a.pillarId === effectivePillarId ? 0 : 1;
        const bPriority = b.pillarId === effectivePillarId ? 0 : 1;

        if (aPriority !== bPriority) return aPriority - bPriority;

        // Within same priority, sort by date (newer first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 10); // Take top 10 after sorting

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

    // Enqueue generation job
    const jobId = `gen-${topic.id}-${Date.now()}`;

    try {
      if (process.env.USE_BACKGROUND_WORKER !== 'true') {
        throw new Error('SYNC_FALLBACK_REQUESTED_BY_ENV');
      }

      await enqueueGeneration({
        userId: user.id,
        topicId: topic.id,
        pillarId: effectivePillarId,
        pillarContext: {
          name: pillar?.name || 'General',
          description: pillar?.description,
          tone: pillar?.tone,
          targetAudience: pillar?.targetAudience || undefined,
          customPrompt: pillar?.customPrompt,
        },
        topicContent: {
          title: topic.content,
          summary: topic.sourceUrl,
        },
        voiceExamples: examples.map((ex) => ({
          postText: ex.postText,
          embedding: ex.embedding,
        })),
        userPerspective,
        jobId,
      });

      console.log(`✅ Enqueued draft generation job: ${jobId}`);
      await incrementUsage(user.id, 'generate_post', 2);

      return responses.accepted({
        message: 'Draft generation started in background. We will notify you when it is ready.',
        jobId,
        status: 'processing'
      });

    } catch (queueError: any) {
      console.warn(`⚠️ Queue fallback triggered in /generate: running synchronously.`);

      // 1. Run Generation Direct
      const result = await generateDraftVariants({
        topicTitle: topic.content,
        topicDescription: topic.sourceUrl || undefined,
        userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
        pillarName: pillar?.name || 'General',
        pillarDescription: pillar?.description || undefined,
        pillarTone: pillar?.tone || undefined,
        targetAudience: pillar?.targetAudience || undefined,
        customPrompt: pillar?.customPrompt || undefined,
        voiceExamples: examples.map((ex) => ({
          postText: ex.postText,
          embedding: ex.embedding as number[] | undefined,
        })),
        userId: user.id,
        numVariants: 2 // Typical for this route
      });

      // 2. Save Drafts
      const draftInserts = result.variants.map((variant) => ({
        userId: user.id,
        topicId: topic.id,
        pillarId: effectivePillarId,
        userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
        variantLetter: variant.variantLetter,
        fullText: variant.post.fullText,
        hook: variant.post.hook,
        body: variant.post.body,
        cta: variant.post.cta,
        hashtags: variant.post.hashtags,
        characterCount: variant.post.characterCount,
        estimatedEngagement: estimateEngagement(variant.post),
        status: 'draft' as const,
      }));

      const createdDrafts = await db.insert(generatedDrafts).values(draftInserts).returning();

      // 3. Update Topic Status
      await db.update(classifiedTopics)
        .set({ status: 'drafted', updatedAt: new Date() })
        .where(eq(classifiedTopics.id, topic.id));

      await incrementUsage(user.id, 'generate_post', 2);

      return responses.ok({
        message: 'Drafts generated successfully',
        drafts: createdDrafts,
        status: 'completed'
      });
    }
  } catch (error) {
    console.error('Error in draft generation:', error);
    return errors.internal('Failed to generate drafts');
  }
});
