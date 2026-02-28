/**
 * Draft Approval API
 * POST /api/drafts/:id/approve - Approve a draft
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { generatedDrafts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';


/**
 * POST /api/drafts/:id/approve
 * Approve a draft (marks it as ready for posting)
 */
export const POST = withAuth(async (req: NextRequest, { params, user }) => {
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

    // Check if draft is in a state that can be approved
    if (draft.status === 'posted') {
      return errors.badRequest('This draft has already been posted');
    }

    if (draft.status === 'rejected') {
      return errors.badRequest('Cannot approve a rejected draft');
    }

    // Update draft status to approved
    const [approvedDraft] = await db
      .update(generatedDrafts)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(generatedDrafts.id, id))
      .returning();

    // TODO: Trigger LinkedIn posting workflow
    // await queue.add('post-to-linkedin', { draftId: id });

    return responses.ok({
      message: 'Draft approved successfully',
      draft: approvedDraft,
      nextSteps: 'Draft is ready. You can schedule it or it will be posted automatically based on your settings.',
    });
  } catch (error) {
    console.error('Error approving draft:', error);
    return errors.internal('Failed to approve draft');
  }
});
