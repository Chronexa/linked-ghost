/**
 * Raw Topic API - Get or Delete a single raw topic
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { rawTopics } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET = withAuth(async (req: NextRequest, { params, user }) => {
  const id = params?.id;
  if (!id) return errors.badRequest('Topic ID required');

  try {
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const [topic] = await db
      .select()
      .from(rawTopics)
      .where(and(eq(rawTopics.id, id), eq(rawTopics.userId, user.id)))
      .limit(1);

    if (!topic) return errors.notFound('Raw topic');
    return responses.ok(topic);
  } catch (e) {
    console.error('Error fetching raw topic:', e);
    return errors.internal('Failed to fetch topic');
  }
});

export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  const id = params?.id;
  if (!id) return errors.badRequest('Topic ID required');

  try {
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const [topic] = await db
      .select({ id: rawTopics.id })
      .from(rawTopics)
      .where(and(eq(rawTopics.id, id), eq(rawTopics.userId, user.id)))
      .limit(1);

    if (!topic) return errors.notFound('Raw topic');

    await db.delete(rawTopics).where(eq(rawTopics.id, id));
    return responses.noContent();
  } catch (e) {
    console.error('Error deleting raw topic:', e);
    return errors.internal('Failed to delete topic');
  }
});
