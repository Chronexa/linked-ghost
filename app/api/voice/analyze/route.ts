/**
 * Voice Analysis API
 * POST /api/voice/analyze - Analyze and calculate voice confidence score
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { voiceExamples, profiles } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * POST /api/voice/analyze
 * Analyze voice examples and calculate confidence score
 * This is a simplified version - full implementation will use OpenAI embeddings
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Rate limiting (more restrictive for AI operations)
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    // Get all active voice examples
    const examples = await db
      .select()
      .from(voiceExamples)
      .where(eq(voiceExamples.userId, user.id));

    if (examples.length === 0) {
      return errors.badRequest('No voice examples found. Add at least 3 examples to analyze your voice.');
    }

    if (examples.length < 3) {
      return errors.badRequest('At least 3 voice examples are required for accurate voice analysis.');
    }

    // Calculate voice confidence score (simplified)
    // TODO: Implement full voice analysis with OpenAI embeddings
    const baseScore = 50;
    const exampleBonus = Math.min(examples.length * 8, 40); // Up to 40 points for examples
    const lengthBonus = examples.every(e => e.characterCount >= 200) ? 10 : 5;

    const confidenceScore = Math.min(baseScore + exampleBonus + lengthBonus, 100);

    // Update profile with confidence score
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        voiceConfidenceScore: confidenceScore,
        lastVoiceTrainingAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.id))
      .returning();

    return responses.ok({
      confidenceScore,
      examplesAnalyzed: examples.length,
      recommendation:
        confidenceScore >= 85
          ? 'Excellent! Your voice profile is well-trained.'
          : confidenceScore >= 70
          ? 'Good voice profile. Add 2-3 more examples for better results.'
          : 'Add more examples (5-10 recommended) for better voice matching.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error analyzing voice:', error);
    return errors.internal('Failed to analyze voice');
  }
});
