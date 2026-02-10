/**
 * Drafts API - Single Draft Operations
 * GET /api/drafts/:id - Get a single draft
 * PATCH /api/drafts/:id - Update a draft
 * DELETE /api/drafts/:id - Delete a draft
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { generatedDrafts, classifiedTopics, pillars } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const updateDraftSchema = z.object({
  editedText: z.string().min(50).max(3000).optional(),
  feedbackNotes: z.string().max(1000).optional(),
  status: z.enum(['draft', 'approved', 'rejected']).optional(),
});

/**
 * GET /api/drafts/:id
 * Get a single draft with full details
 */
export const GET = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Get draft with related data
    const draft = await db
      .select({
        draft: generatedDrafts,
        pillarName: pillars.name,
        topic: {
          id: classifiedTopics.id,
          content: classifiedTopics.content,
          sourceUrl: classifiedTopics.sourceUrl,
          aiScore: classifiedTopics.aiScore,
        },
      })
      .from(generatedDrafts)
      .leftJoin(pillars, eq(generatedDrafts.pillarId, pillars.id))
      .leftJoin(classifiedTopics, eq(generatedDrafts.topicId, classifiedTopics.id))
      .where(and(
        eq(generatedDrafts.id, id),
        eq(generatedDrafts.userId, user.id)
      ))
      .limit(1);

    if (!draft.length) {
      return errors.notFound('Draft');
    }

    return responses.ok(draft[0]);
  } catch (error) {
    console.error('Error fetching draft:', error);
    return errors.internal('Failed to fetch draft');
  }
});

/**
 * PATCH /api/drafts/:id
 * Update a draft (edit text, add notes, change status)
 */
export const PATCH = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Validate request body
    const result = await validateBody(req, updateDraftSchema);
    if (!result.success) return result.error;

    const data = result.data;

    // Check if draft exists and belongs to user
    const existingDraft = await db.query.generatedDrafts.findFirst({
      where: and(
        eq(generatedDrafts.id, id),
        eq(generatedDrafts.userId, user.id)
      ),
    });

    if (!existingDraft) {
      return errors.notFound('Draft');
    }

    // Prepare update data
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // Update character count if text changed
    if (data.editedText) {
      updateData.characterCount = data.editedText.length;
    }

    // Update draft
    const [updatedDraft] = await db
      .update(generatedDrafts)
      .set(updateData)
      .where(eq(generatedDrafts.id, id))
      .returning();

    return responses.ok(updatedDraft);
  } catch (error) {
    console.error('Error updating draft:', error);
    return errors.internal('Failed to update draft');
  }
});

/**
 * DELETE /api/drafts/:id
 * Delete a draft
 */
export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Check if draft exists and belongs to user
    const existingDraft = await db.query.generatedDrafts.findFirst({
      where: and(
        eq(generatedDrafts.id, id),
        eq(generatedDrafts.userId, user.id)
      ),
    });

    if (!existingDraft) {
      return errors.notFound('Draft');
    }

    // Don't allow deletion of posted drafts
    if (existingDraft.status === 'posted') {
      return errors.badRequest('Cannot delete a draft that has already been posted');
    }

    // Delete draft
    await db.delete(generatedDrafts).where(eq(generatedDrafts.id, id));

    return responses.noContent();
  } catch (error) {
    console.error('Error deleting draft:', error);
    return errors.internal('Failed to delete draft');
  }
});
