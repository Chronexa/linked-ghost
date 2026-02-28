/**
 * Voice Example API - Single Example Operations
 * DELETE /api/voice/examples/:id - Delete a voice example
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { voiceExamples } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';


/**
 * DELETE /api/voice/examples/:id
 * Delete a voice training example
 */
export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Check if example exists and belongs to user
    const existingExample = await db.query.voiceExamples.findFirst({
      where: and(
        eq(voiceExamples.id, id),
        eq(voiceExamples.userId, user.id)
      ),
    });

    if (!existingExample) {
      return errors.notFound('Voice example');
    }

    // Delete example
    await db.delete(voiceExamples).where(eq(voiceExamples.id, id));

    // TODO: Trigger voice retraining if this was an active example
    // await queue.add('retrain-voice-profile', { userId: user.id });

    return responses.noContent();
  } catch (error) {
    console.error('Error deleting voice example:', error);
    return errors.internal('Failed to delete voice example');
  }
});
