/**
 * Voice Analysis API
 * POST /api/voice/analyze - Analyze and calculate voice confidence score using OpenAI embeddings
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { voiceExamples, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateEmbeddings, calculateVoiceConsistency, averageEmbedding, getVoiceRecommendation } from '@/lib/ai/embeddings';

/**
 * POST /api/voice/analyze
 * Analyze voice examples using OpenAI embeddings and calculate confidence score
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

    // Validation
    if (examples.length === 0) {
      return errors.badRequest('No voice examples found. Add at least 3 examples to analyze your voice.');
    }

    if (examples.length < 3) {
      return errors.badRequest('At least 3 voice examples are required for accurate voice analysis.');
    }

    console.log(`🧠 Analyzing ${examples.length} voice examples for user ${user.id}...`);

    // Extract post texts
    const postTexts = examples.map((ex) => ex.postText);

    // Generate embeddings using OpenAI (batch request for efficiency)
    console.log('🔄 Generating embeddings with OpenAI...');
    const embeddings = await generateEmbeddings(postTexts);

    // Calculate voice consistency score
    const confidenceScore = calculateVoiceConsistency(embeddings);

    console.log(`✅ Voice confidence score: ${confidenceScore}`);

    // Calculate average embedding (master voice profile)
    const masterVoiceEmbedding = averageEmbedding(embeddings);

    // Store individual embeddings in voice_examples
    console.log('💾 Storing embeddings in database...');
    
    await Promise.all(
      examples.map((example, index) =>
        db
          .update(voiceExamples)
          .set({
            embedding: embeddings[index],
          })
          .where(eq(voiceExamples.id, example.id))
      )
    );

    // Update or create profile with master voice embedding and score
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    });

    let updatedProfile;

    if (existingProfile) {
      [updatedProfile] = await db
        .update(profiles)
        .set({
          voiceConfidenceScore: confidenceScore,
          voiceEmbedding: masterVoiceEmbedding,
          lastVoiceTrainingAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning();
    } else {
      [updatedProfile] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          voiceConfidenceScore: confidenceScore,
          voiceEmbedding: masterVoiceEmbedding,
          lastVoiceTrainingAt: new Date(),
        })
        .returning();
    }

    const recommendation = getVoiceRecommendation(confidenceScore, examples.length);

    console.log('✅ Voice analysis complete!');

    return responses.ok({
      confidenceScore,
      examplesAnalyzed: examples.length,
      recommendation,
      profile: {
        id: updatedProfile.id,
        voiceConfidenceScore: updatedProfile.voiceConfidenceScore,
        lastVoiceTrainingAt: updatedProfile.lastVoiceTrainingAt,
      },
      insights: {
        embeddingDimensions: masterVoiceEmbedding.length,
        averagePostLength: Math.round(
          examples.reduce((sum, ex) => sum + ex.characterCount, 0) / examples.length
        ),
        shortestPost: Math.min(...examples.map((ex) => ex.characterCount)),
        longestPost: Math.max(...examples.map((ex) => ex.characterCount)),
      },
    });
  } catch (error) {
    console.error('Error analyzing voice:', error);
    
    // Provide helpful error message
    if (error instanceof Error && error.message.includes('API key')) {
      return errors.internal('OpenAI API key is invalid or missing');
    }
    
    return errors.internal('Failed to analyze voice. Please try again.');
  }
});
