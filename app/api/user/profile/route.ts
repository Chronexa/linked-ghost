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
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().nullable(),
  linkedinHeadline: z.string().max(500).optional().nullable(),
  linkedinSummary: z.string().max(5000).optional().nullable(),
  // Identity
  fullName: z.string().max(255).optional().nullable(),
  currentRole: z.string().max(255).optional().nullable(),
  companyName: z.string().max(255).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),

  // Background
  yearsOfExperience: z.string().max(50).optional().nullable(),
  keyExpertise: z.array(z.string()).optional().nullable(),
  careerHighlights: z.string().optional().nullable(),
  currentResponsibilities: z.string().optional().nullable(),

  // Positioning
  about: z.string().optional().nullable(),
  howYouWantToBeSeen: z.string().max(50).optional().nullable(),
  uniqueAngle: z.string().optional().nullable(),

  // Network
  currentConnections: z.number().optional().nullable(),
  targetConnections: z.number().optional().nullable(),
  networkComposition: z.array(z.string()).optional().nullable(),
  idealNetworkProfile: z.string().optional().nullable(),
  linkedinGoal: z.string().max(50).optional().nullable(),

  // Settings
  targetAudience: z.string().max(500, 'Target audience must be at most 500 characters').optional().nullable(),
  contentGoal: z.string().max(100, 'Content goal must be at most 100 characters').optional().nullable(),
  customGoal: z.string().max(200, 'Custom goal must be at most 200 characters').optional().nullable(),
  writingStyle: z.string().max(500, 'Writing style must be at most 500 characters').optional().nullable(),
  perplexityEnabled: z.boolean().optional(),
  redditEnabled: z.boolean().optional(),
  redditKeywords: z.string().optional().nullable(),
  manualOnly: z.boolean().optional(),
  onboardingCompletedAt: z.coerce.date().optional().nullable(),
  profileCompleteness: z.number().optional().nullable(),

  // Prompt personalisation: default instructions for all AI (research, classification, draft)
  defaultInstructions: z.string().max(2000).optional().nullable(),
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

    const cleanData = {
      ...data,
      updatedAt: new Date(),
    };

    let updatedProfile;

    if (!existingProfile) {
      // Create profile if it doesn't exist
      [updatedProfile] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          ...cleanData,
        })
        .returning();
    } else {
      // Update existing profile
      [updatedProfile] = await db
        .update(profiles)
        .set(cleanData)
        .where(eq(profiles.userId, user.id))
        .returning();
    }

    return responses.ok(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return errors.internal('Failed to update profile');
  }
});
