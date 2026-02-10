/**
 * Topics API - Single Topic Operations
 * GET /api/topics/:id - Get a single topic
 * PATCH /api/topics/:id - Update a topic
 * DELETE /api/topics/:id - Delete a topic
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { classifiedTopics, generatedDrafts, pillars } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const updateTopicSchema = z.object({
  pillarId: z.string().uuid().optional(),
  status: z.enum(['classified', 'archived']).optional(),
});

/**
 * GET /api/topics/:id
 * Get a single topic with generated drafts
 */
export const GET = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Get topic with pillar info
    const topic = await db
      .select({
        id: classifiedTopics.id,
        content: classifiedTopics.content,
        sourceUrl: classifiedTopics.sourceUrl,
        source: classifiedTopics.source,
        aiScore: classifiedTopics.aiScore,
        hookAngle: classifiedTopics.hookAngle,
        reasoning: classifiedTopics.reasoning,
        keyPoints: classifiedTopics.keyPoints,
        suggestedHashtags: classifiedTopics.suggestedHashtags,
        status: classifiedTopics.status,
        createdAt: classifiedTopics.createdAt,
        classifiedAt: classifiedTopics.classifiedAt,
        pillarId: classifiedTopics.pillarId,
        pillarName: pillars.name,
      })
      .from(classifiedTopics)
      .leftJoin(pillars, eq(classifiedTopics.pillarId, pillars.id))
      .where(and(
        eq(classifiedTopics.id, id),
        eq(classifiedTopics.userId, user.id)
      ))
      .limit(1);

    if (!topic.length) {
      return errors.notFound('Topic');
    }

    // Get generated drafts for this topic
    const drafts = await db
      .select()
      .from(generatedDrafts)
      .where(eq(generatedDrafts.topicId, id))
      .orderBy(sql`${generatedDrafts.variantLetter} asc`);

    return responses.ok({
      topic: topic[0],
      drafts,
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return errors.internal('Failed to fetch topic');
  }
});

/**
 * PATCH /api/topics/:id
 * Update a topic (e.g., change pillar or status)
 */
export const PATCH = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Validate request body
    const result = await validateBody(req, updateTopicSchema);
    if (!result.success) return result.error;

    const data = result.data;

    // Check if topic exists and belongs to user
    const existingTopic = await db.query.classifiedTopics.findFirst({
      where: and(
        eq(classifiedTopics.id, id),
        eq(classifiedTopics.userId, user.id)
      ),
    });

    if (!existingTopic) {
      return errors.notFound('Topic');
    }

    // If pillarId is being changed, verify it belongs to user
    if (data.pillarId) {
      const pillar = await db.query.pillars.findFirst({
        where: and(
          eq(pillars.id, data.pillarId),
          eq(pillars.userId, user.id)
        ),
      });

      if (!pillar) {
        return errors.badRequest('Invalid pillar ID');
      }

      // Update pillar name too
      (data as any).pillarName = pillar.name;
    }

    // Update topic
    const [updatedTopic] = await db
      .update(classifiedTopics)
      .set(data as any)
      .where(eq(classifiedTopics.id, id))
      .returning();

    return responses.ok(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return errors.internal('Failed to update topic');
  }
});

/**
 * DELETE /api/topics/:id
 * Delete a topic
 */
export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Check if topic exists and belongs to user
    const existingTopic = await db.query.classifiedTopics.findFirst({
      where: and(
        eq(classifiedTopics.id, id),
        eq(classifiedTopics.userId, user.id)
      ),
    });

    if (!existingTopic) {
      return errors.notFound('Topic');
    }

    // Delete topic (cascade will delete generated drafts)
    await db.delete(classifiedTopics).where(eq(classifiedTopics.id, id));

    return responses.noContent();
  } catch (error) {
    console.error('Error deleting topic:', error);
    return errors.internal('Failed to delete topic');
  }
});
