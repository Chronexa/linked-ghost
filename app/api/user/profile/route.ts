/**
 * User Profile API - Update Profile
 * PATCH /api/user/profile - Update user profile
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const updateProfileSchema = z.object({
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  targetAudience: z.string().max(500, 'Target audience must be at most 500 characters').optional(),
  writingStyle: z.string().max(500, 'Writing style must be at most 500 characters').optional(),
});

/**
 * PATCH /api/user/profile
 * Update user profile
 */
export const PATCH = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Validate request body
    const result = await validateBody(req, updateProfileSchema);
    if (!result.success) return result.error;

    const data = result.data;

    // Check if profile exists
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });

    let updatedProfile;

    if (!existingProfile) {
      // Create profile if it doesn't exist
      [updatedProfile] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          linkedinUrl: data.linkedinUrl || null,
          targetAudience: data.targetAudience || null,
          writingStyle: data.writingStyle || null,
        })
        .returning();
    } else {
      // Update existing profile
      [updatedProfile] = await db
        .update(profiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning();
    }

    return responses.ok(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return errors.internal('Failed to update profile');
  }
});
