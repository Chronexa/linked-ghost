/**
 * Topics API - List and Create
 * GET /api/topics - List classified topics
 * POST /api/topics - Create a manual topic
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody, getPagination, getSorting } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { classifiedTopics, rawTopics, pillars } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


// Validation schemas
const createTopicSchema = z.object({
  content: z.string().min(50, 'Content must be at least 50 characters').max(5000, 'Content must be at most 5000 characters'),
  sourceUrl: z.string().url('Invalid URL').optional(),
  pillarId: z.string().uuid('Invalid pillar ID').optional(),
  source: z.enum(['manual', 'perplexity', 'reddit', 'fireflies']).optional(),
});

/**
 * GET /api/topics
 * List classified topics for the user
 * Query params: page, limit, status, pillarId, minScore
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
    const minScore = Number(searchParams.get('minScore')) || 70;
    const { page, limit, offset } = getPagination(req);
    const { sortBy, sortOrder } = getSorting(req, ['aiScore', 'createdAt', 'classifiedAt']);

    // Build where clause
    const whereConditions = [
      eq(classifiedTopics.userId, user.id),
      gte(classifiedTopics.aiScore, minScore),
    ];

    if (status !== 'all') {
      whereConditions.push(eq(classifiedTopics.status, status));
    }

    if (pillarId) {
      whereConditions.push(eq(classifiedTopics.pillarId, pillarId));
    }

    // Query topics with pillar info
    const topics = await db
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
      .where(and(...whereConditions))
      .orderBy(sortOrder === 'asc' ? sql`${classifiedTopics[sortBy as keyof typeof classifiedTopics]} asc` : sql`${classifiedTopics[sortBy as keyof typeof classifiedTopics]} desc`)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(classifiedTopics)
      .where(and(...whereConditions));

    return responses.list(topics, page, limit, count);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return errors.internal('Failed to fetch topics');
  }
});

/**
 * POST /api/topics
 * Create a manual topic (will be classified by AI)
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, createTopicSchema);
    if (!result.success) return result.error;

    const data = result.data;

    // If pillarId provided, verify it belongs to user
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
    }

    // If pillarId provided, create classified topic directly
    if (data.pillarId) {
      const pillar = await db.query.pillars.findFirst({
        where: eq(pillars.id, data.pillarId),
      });

      // Create classified topic (skip AI classification)
      const [newTopic] = await db
        .insert(classifiedTopics)
        .values({
          userId: user.id,
          pillarId: data.pillarId,
          pillarName: pillar!.name,
          content: data.content,
          sourceUrl: data.sourceUrl || null,
          source: 'manual',
          aiScore: 85, // Default score for manual topics
          hookAngle: 'analytical', // Default hook angle
          reasoning: 'Manually added topic',
          status: 'classified',
          classifiedAt: new Date(),
        })
        .returning();

      return responses.created(newTopic);
    }

    // Otherwise, create raw topic for AI classification
    const [rawTopic] = await db
      .insert(rawTopics)
      .values({
        userId: user.id,
        source: data.source || 'manual',
        sourceUrl: data.sourceUrl || null,
        content: data.content,
        status: 'new',
        discoveredAt: new Date(),
      })
      .returning();

    // TODO: Trigger AI classification job
    // await queue.add('classify-topic', { topicId: rawTopic.id });

    return responses.created({
      ...rawTopic,
      message: 'Topic created. AI classification will complete shortly.',
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    return errors.internal('Failed to create topic');
  }
});
