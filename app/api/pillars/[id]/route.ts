/**
 * Pillars API - Single Pillar Operations
 * GET /api/pillars/:id - Get a single pillar
 * PATCH /api/pillars/:id - Update a pillar
 * DELETE /api/pillars/:id - Delete a pillar
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { pillars, classifiedTopics, generatedDrafts, voiceExamples } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';


// Validation schema for updates
const updatePillarSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  tone: z.string().max(200).optional(),
  targetAudience: z.string().max(200).optional(),
  customPrompt: z.string().max(1000).optional(),
  cta: z.string().max(500).optional(),
  positioning: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * GET /api/pillars/:id
 * Get a single pillar with statistics
 */
export const GET = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Get pillar
    const pillar = await db.query.pillars.findFirst({
      where: and(
        eq(pillars.id, id),
        eq(pillars.userId, user.id)
      ),
    });

    if (!pillar) {
      return errors.notFound('Pillar');
    }

    // Get statistics
    const [topicsCount, draftsCount, voiceExamplesCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(classifiedTopics)
        .where(eq(classifiedTopics.pillarId, id))
        .then(([result]) => result.count),

      db.select({ count: sql<number>`count(*)::int` })
        .from(generatedDrafts)
        .where(eq(generatedDrafts.pillarId, id))
        .then(([result]) => result.count),

      db.select({ count: sql<number>`count(*)::int` })
        .from(voiceExamples)
        .where(eq(voiceExamples.pillarId, id))
        .then(([result]) => result.count),
    ]);

    return responses.ok({
      ...pillar,
      stats: {
        topicsCount,
        draftsCount,
        voiceExamplesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching pillar:', error);
    return errors.internal('Failed to fetch pillar');
  }
});

/**
 * PATCH /api/pillars/:id
 * Update a pillar
 */
export const PATCH = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Validate request body
    const result = await validateBody(req, updatePillarSchema);
    if (!result.success) return result.error;

    const data = result.data;

    // Check if pillar exists and belongs to user
    const existingPillar = await db.query.pillars.findFirst({
      where: and(
        eq(pillars.id, id),
        eq(pillars.userId, user.id)
      ),
    });

    if (!existingPillar) {
      return errors.notFound('Pillar');
    }

    // If name is being changed, check for duplicates
    if (data.name && data.name !== existingPillar.name) {
      const duplicatePillar = await db.query.pillars.findFirst({
        where: and(
          eq(pillars.userId, user.id),
          eq(pillars.name, data.name)
        ),
      });

      if (duplicatePillar) {
        return errors.conflict('A pillar with this name already exists');
      }
    }

    // Generate new slug if name changed; ensure unique per user (C3)
    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      const baseSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        || 'pillar';
      let slug = baseSlug;
      let attempt = 0;
      while (true) {
        const existing = await db.query.pillars.findFirst({
          where: and(
            eq(pillars.userId, user.id),
            eq(pillars.slug, slug)
          ),
          columns: { id: true },
        });
        if (!existing || existing.id === id) break;
        attempt += 1;
        slug = `${baseSlug}_${attempt}`;
      }
      updateData.slug = slug;
    }

    // Update pillar
    const [updatedPillar] = await db
      .update(pillars)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(pillars.id, id))
      .returning();

    return responses.ok(updatedPillar);
  } catch (error) {
    console.error('Error updating pillar:', error);
    return errors.internal('Failed to update pillar');
  }
});

/**
 * DELETE /api/pillars/:id
 * Delete a pillar
 */
export const DELETE = withAuth(async (req: NextRequest, { params, user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const { id } = params;

    // Check if pillar exists and belongs to user
    const existingPillar = await db.query.pillars.findFirst({
      where: and(
        eq(pillars.id, id),
        eq(pillars.userId, user.id)
      ),
    });

    if (!existingPillar) {
      return errors.notFound('Pillar');
    }

    // Check if pillar has associated content
    const [topicsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(classifiedTopics)
      .where(eq(classifiedTopics.pillarId, id));

    if (topicsCount.count > 0) {
      return errors.badRequest(
        'Cannot delete pillar with associated topics. Please delete or reassign the topics first.'
      );
    }

    // Delete pillar (cascade will handle voice_examples and drafts)
    await db.delete(pillars).where(eq(pillars.id, id));

    return responses.noContent();
  } catch (error) {
    console.error('Error deleting pillar:', error);
    return errors.internal('Failed to delete pillar');
  }
});
