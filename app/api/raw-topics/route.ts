/**
 * Raw Topics API
 * GET /api/raw-topics - List raw topics for the user
 * POST /api/raw-topics - Create a new raw topic (manual entry)
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { getPagination } from '@/lib/api/validate';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { rawTopics } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


/**
 * GET /api/raw-topics
 * List raw (unclassified) topics for the user
 * Query params: page, limit, source
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    const { page, limit, offset } = getPagination(req);

    const whereConditions = [
      eq(rawTopics.userId, user.id),
      eq(rawTopics.status, 'new'),
    ];

    if (source) {
      whereConditions.push(eq(rawTopics.source, source as any));
    }

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: rawTopics.id,
          content: rawTopics.content,
          source: rawTopics.source,
          sourceUrl: rawTopics.sourceUrl,
          status: rawTopics.status,
          discoveredAt: rawTopics.discoveredAt,
          createdAt: rawTopics.createdAt,
        })
        .from(rawTopics)
        .where(and(...whereConditions))
        .orderBy(desc(rawTopics.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(rawTopics)
        .where(and(...whereConditions)),
    ]);

    const total = countResult[0]?.count ?? 0;

    return responses.ok({
      data: items,
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error('Error fetching raw topics:', error);
    return errors.internal('Failed to fetch raw topics');
  }
});

// Validation schema for creating raw topics
const createRawTopicSchema = z.object({
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(500, 'Content must be less than 500 characters'), // Align with frontend
  sourceUrl: z.string()
    .url('Invalid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      'Only HTTP and HTTPS URLs are allowed'
    )
    .optional()
    .nullable(),
  source: z.enum(['manual', 'perplexity', 'reddit', 'fireflies']).optional().default('manual'),
  status: z.enum(['new', 'classified', 'archived']).optional().default('new'),
});

/**
 * POST /api/raw-topics
 * Create a new raw topic (manual entry)
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, createRawTopicSchema);
    if (!result.success) return result.error;

    const { content, sourceUrl, source, status } = result.data;

    // Create raw topic
    const [rawTopic] = await db
      .insert(rawTopics)
      .values({
        userId: user.id,
        content,
        sourceUrl: sourceUrl || null,
        source: source || 'manual',
        status: status || 'new',
      })
      .returning();

    console.log(`✅ Raw topic created: ${rawTopic.id} (source: ${source || 'manual'})`);

    return responses.created({
      message: 'Topic added successfully',
      data: rawTopic,
    });
  } catch (error) {
    console.error('Error creating raw topic:', error);
    return errors.internal('Failed to create topic');
  }
});
