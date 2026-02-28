/**
 * Draft Scheduling API
 * POST /api/drafts/:id/schedule - Schedule a draft for posting
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { generatedDrafts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


// Validation schema
const scheduleSchema = z.object({
  scheduledFor: z.string().datetime('Invalid datetime format'),
});

/**
 * POST /api/drafts/:id/schedule
 * Schedule a draft for future posting
 */
export const POST = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Validate request body
    const result = await validateBody(req, scheduleSchema);
    if (!result.success) return result.error;

    const data = result.data;

    // Get draft
    const draft = await db.query.generatedDrafts.findFirst({
      where: and(
        eq(generatedDrafts.id, id),
        eq(generatedDrafts.userId, user.id)
      ),
    });

    if (!draft) {
      return errors.notFound('Draft');
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(data.scheduledFor);
    const now = new Date();

    if (scheduledTime <= now) {
      return errors.badRequest('Scheduled time must be in the future');
    }

    // Don't allow scheduling more than 30 days in advance
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 30);

    if (scheduledTime > maxDate) {
      return errors.badRequest('Cannot schedule more than 30 days in advance');
    }

    // Check if draft can be scheduled
    if (draft.status === 'posted') {
      return errors.badRequest('This draft has already been posted');
    }

    if (draft.status === 'rejected') {
      return errors.badRequest('Cannot schedule a rejected draft');
    }

    // Update draft with schedule
    const [scheduledDraft] = await db
      .update(generatedDrafts)
      .set({
        status: 'scheduled',
        scheduledFor: scheduledTime,
        updatedAt: new Date(),
      })
      .where(eq(generatedDrafts.id, id))
      .returning();

    // TODO: Add to scheduling queue
    // await queue.add('scheduled-post', { draftId: id }, {
    //   delay: scheduledTime.getTime() - now.getTime(),
    // });

    return responses.ok({
      message: 'Draft scheduled successfully',
      draft: scheduledDraft,
      scheduledFor: scheduledTime.toISOString(),
    });
  } catch (error) {
    console.error('Error scheduling draft:', error);
    return errors.internal('Failed to schedule draft');
  }
});

/**
 * DELETE /api/drafts/:id/schedule
 * Cancel a scheduled draft (revert to approved or draft status)
 */
export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Get draft
    const draft = await db.query.generatedDrafts.findFirst({
      where: and(
        eq(generatedDrafts.id, id),
        eq(generatedDrafts.userId, user.id)
      ),
    });

    if (!draft) {
      return errors.notFound('Draft');
    }

    if (draft.status !== 'scheduled') {
      return errors.badRequest('This draft is not scheduled');
    }

    // Revert status to approved
    const [updatedDraft] = await db
      .update(generatedDrafts)
      .set({
        status: 'approved',
        scheduledFor: null,
        updatedAt: new Date(),
      })
      .where(eq(generatedDrafts.id, id))
      .returning();

    // TODO: Remove from scheduling queue
    // await queue.remove('scheduled-post', { draftId: id });

    return responses.ok({
      message: 'Schedule cancelled successfully',
      draft: updatedDraft,
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    return errors.internal('Failed to cancel schedule');
  }
});
