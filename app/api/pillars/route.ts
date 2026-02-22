/**
 * Pillars API - List and Create
 * GET /api/pillars - List all user's pillars
 * POST /api/pillars - Create a new pillar
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody, getPagination, getSorting } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { pillars } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { canAddPillar } from '@/lib/ai/usage';

// Validation schemas
const createPillarSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  tone: z.string().max(200, 'Content Voice must be at most 200 characters').optional(),
  targetAudience: z.string().max(200, 'Target audience must be at most 200 characters').optional(),
  customPrompt: z.string().max(1000, 'Custom prompt must be at most 1000 characters').optional(),
  cta: z.string().max(500, 'CTA must be at most 500 characters').optional(),
  positioning: z.string().max(500, 'Positioning must be at most 500 characters').optional(),
});

/**
 * GET /api/pillars
 * List all pillars for the authenticated user
 * Query params: page, limit, sortBy, sortOrder, status
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all'; // 'all', 'active', 'inactive'
    const { page, limit, offset } = getPagination(req);
    const { sortBy, sortOrder } = getSorting(req, ['name', 'createdAt', 'updatedAt']);

    // Build where clause
    const whereConditions = [eq(pillars.userId, user.id)];
    if (status !== 'all') {
      whereConditions.push(eq(pillars.status, status as 'active' | 'inactive'));
    }

    // Query pillars
    const userPillars = await db
      .select()
      .from(pillars)
      .where(and(...whereConditions))
      .orderBy(sortOrder === 'asc' ? sql`${pillars[sortBy as keyof typeof pillars]} asc` : sql`${pillars[sortBy as keyof typeof pillars]} desc`)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pillars)
      .where(and(...whereConditions));

    return responses.list(userPillars, page, limit, count);
  } catch (error) {
    console.error('Error fetching pillars:', error);
    return errors.internal('Failed to fetch pillars');
  }
});

/**
 * POST /api/pillars
 * Create a new pillar
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, createPillarSchema);
    if (!result.success) return result.error;

    // Check pillar limit from subscription plan
    const pillarCheck = await canAddPillar(user.id);
    if (!pillarCheck.allowed) {
      return errors.paymentRequired(pillarCheck.reason || 'Pillar limit reached. Upgrade your plan to add more.');
    }

    const data = result.data;

    // Check for duplicate pillar name
    const existingPillar = await db.query.pillars.findFirst({
      where: and(
        eq(pillars.userId, user.id),
        eq(pillars.name, data.name)
      ),
    });

    if (existingPillar) {
      return errors.conflict('A pillar with this name already exists');
    }

    // Generate slug from name; ensure unique per user (C3)
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      || 'pillar';
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await db.query.pillars.findFirst({
        where: and(eq(pillars.userId, user.id), eq(pillars.slug, slug)),
        columns: { id: true },
      });
      if (!existing) break;
      attempt += 1;
      slug = `${baseSlug}_${attempt}`;
    }

    // Create pillar
    const [newPillar] = await db
      .insert(pillars)
      .values({
        userId: user.id,
        name: data.name,
        slug,
        description: data.description || null,
        tone: data.tone || null,
        targetAudience: data.targetAudience || null,
        customPrompt: data.customPrompt || null,
        cta: data.cta || null,
        positioning: data.positioning || null,
        status: 'active',
      })
      .returning();

    return responses.created(newPillar);
  } catch (error) {
    console.error('Error creating pillar:', error);
    return errors.internal('Failed to create pillar');
  }
});
