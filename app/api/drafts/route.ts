/**
 * Drafts API - List Drafts
 * GET /api/drafts - List all user's drafts
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { getPagination, getSorting } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { generatedDrafts, classifiedTopics, pillars } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/drafts
 * List all drafts for the user
 * Query params: page, limit, status, pillarId, sortBy, sortOrder
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const pillarId = searchParams.get('pillarId');
    const topicId = searchParams.get('topicId');
    const { page, limit, offset } = getPagination(req);
    const { sortBy, sortOrder } = getSorting(req, ['createdAt', 'updatedAt', 'approvedAt', 'scheduledFor']);

    // Build where clause
    const whereConditions = [eq(generatedDrafts.userId, user.id)];

    if (status !== 'all') {
      whereConditions.push(eq(generatedDrafts.status, status as any));
    }

    if (pillarId) {
      whereConditions.push(eq(generatedDrafts.pillarId, pillarId));
    }

    if (topicId) {
      whereConditions.push(eq(generatedDrafts.topicId, topicId));
    }

    // Query drafts with related data
    const drafts = await db
      .select({
        id: generatedDrafts.id,
        topicId: generatedDrafts.topicId,
        pillarId: generatedDrafts.pillarId,
        variantLetter: generatedDrafts.variantLetter,
        fullText: generatedDrafts.fullText,
        characterCount: generatedDrafts.characterCount,
        status: generatedDrafts.status,
        createdAt: generatedDrafts.createdAt,
        updatedAt: generatedDrafts.updatedAt,
        approvedAt: generatedDrafts.approvedAt,
        scheduledFor: generatedDrafts.scheduledFor,
        postedAt: generatedDrafts.postedAt,
        qualityWarnings: generatedDrafts.qualityWarnings,
        pillarName: pillars.name,
        topicContent: classifiedTopics.content,
      })
      .from(generatedDrafts)
      .leftJoin(pillars, eq(generatedDrafts.pillarId, pillars.id))
      .leftJoin(classifiedTopics, eq(generatedDrafts.topicId, classifiedTopics.id))
      .where(and(...whereConditions))
      .orderBy(sortOrder === 'asc' ? sql`${generatedDrafts[sortBy as keyof typeof generatedDrafts]} asc` : sql`${generatedDrafts[sortBy as keyof typeof generatedDrafts]} desc`)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generatedDrafts)
      .where(and(...whereConditions));

    return responses.list(drafts, page, limit, count);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return errors.internal('Failed to fetch drafts');
  }
});
