/**
 * Topic Generation API
 * POST /api/topics/:id/generate - Generate 3 draft variants from a topic
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { classifiedTopics, generatedDrafts, voiceExamples, pillars, profiles } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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

    // Get user profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });

    // TODO: Call OpenAI API to generate 3 variants
    // For now, create mock drafts
    const variants = ['A', 'B', 'C'];
    const mockDrafts = variants.map((letter, index) => {
      const mockText = generateMockDraft(topic, letter, pillar?.name || 'General');
      return {
        userId: user.id,
        topicId: topic.id,
        pillarId: topic.pillarId,
        variantLetter: letter,
        fullText: mockText,
        hook: mockText.split('\n\n')[0],
        body: mockText.split('\n\n').slice(1, -1).join('\n\n'),
        cta: mockText.split('\n\n').slice(-1)[0],
        hashtags: topic.suggestedHashtags as string[] || [],
        characterCount: mockText.length,
        status: 'draft' as const,
      };
    });

    // Insert all drafts
    const createdDrafts = await db
      .insert(generatedDrafts)
      .values(mockDrafts)
      .returning();

    return responses.created({
      message: '3 draft variants generated successfully',
      drafts: createdDrafts,
      topic: {
        id: topic.id,
        content: topic.content,
        pillarName: pillar?.name,
      },
    });
  } catch (error) {
    console.error('Error generating drafts:', error);
    return errors.internal('Failed to generate drafts');
  }
});

/**
 * Mock draft generator (placeholder for OpenAI integration)
 * TODO: Replace with actual OpenAI API call
 */
function generateMockDraft(topic: any, variant: string, pillarName: string): string {
  const hooks = {
    A: `Here's something interesting about ${pillarName.toLowerCase()}:`,
    B: `Let me share a quick insight about ${pillarName.toLowerCase()}.`,
    C: `Quick take on ${pillarName.toLowerCase()}:`,
  };

  const hook = hooks[variant as keyof typeof hooks] || hooks.A;
  const content = topic.content.slice(0, 200);

  return `${hook}\n\n${content}\n\nWhat's your experience with this?\n\n#LinkedIn #${pillarName.replace(/\s+/g, '')}`;
}
