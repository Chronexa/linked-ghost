/**
 * Embedding Utilities
 * Generate and compare text embeddings for voice analysis
 */

import { openai, OPENAI_MODELS, DEFAULT_CONFIG } from './openai';

/**
 * Generate embedding for a text
 * Returns a vector representation of the text for similarity comparison
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: DEFAULT_CONFIG.embedding.model,
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than generating one by one
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: DEFAULT_CONFIG.embedding.model,
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * Returns a value between -1 and 1 (higher = more similar)
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Find the most similar embedding from a list
 * Returns the index and similarity score
 */
export function findMostSimilar(
  targetEmbedding: number[],
  candidateEmbeddings: number[][]
): { index: number; similarity: number } {
  let maxSimilarity = -1;
  let maxIndex = -1;

  candidateEmbeddings.forEach((candidate, index) => {
    const similarity = cosineSimilarity(targetEmbedding, candidate);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      maxIndex = index;
    }
  });

  return {
    index: maxIndex,
    similarity: maxSimilarity,
  };
}

/**
 * Calculate average embedding from multiple embeddings
 * Useful for creating a "voice profile" from multiple examples
 */
export function averageEmbedding(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    throw new Error('Cannot average empty embeddings list');
  }

  const dimensions = embeddings[0].length;
  const result = new Array(dimensions).fill(0);

  // Sum all embeddings
  embeddings.forEach((embedding) => {
    embedding.forEach((value, i) => {
      result[i] += value;
    });
  });

  // Divide by count to get average
  return result.map((sum) => sum / embeddings.length);
}

/**
 * Calculate voice confidence score based on embedding consistency
 * Returns 0-100 score indicating how consistent the voice examples are
 */
export function calculateVoiceConsistency(embeddings: number[][]): number {
  if (embeddings.length < 2) {
    return 50; // Not enough data
  }

  // Calculate average embedding (voice profile)
  const avgEmbedding = averageEmbedding(embeddings);

  // Calculate similarity of each example to the average
  const similarities = embeddings.map((emb) => cosineSimilarity(emb, avgEmbedding));

  // Average similarity (0-1 range)
  const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

  // Convert to 0-100 score
  // High similarity (>0.9) = 90-100 score
  // Medium similarity (0.7-0.9) = 70-90 score
  // Low similarity (<0.7) = below 70 score
  const baseScore = avgSimilarity * 100;

  // Bonus for having more examples
  const exampleBonus = Math.min(embeddings.length - 3, 5); // Up to +5 for having 8+ examples

  // Penalize if examples are too different from each other
  const variance = calculateVariance(similarities);
  const variancePenalty = variance > 0.1 ? -10 : 0;

  const finalScore = Math.max(0, Math.min(100, baseScore + exampleBonus + variancePenalty));

  return Math.round(finalScore);
}

/**
 * Calculate variance of similarities
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Get recommended action based on voice confidence score
 */
export function getVoiceRecommendation(score: number, exampleCount: number): string {
  if (score >= 90) {
    return 'Excellent! Your voice profile is well-trained and consistent.';
  }
  
  if (score >= 80) {
    return 'Great voice profile! Consider adding 1-2 more examples for even better results.';
  }
  
  if (score >= 70) {
    return 'Good voice profile. Add 2-3 more examples for improved consistency.';
  }
  
  if (score >= 60) {
    return 'Fair voice profile. Add 3-5 more examples and ensure they match your writing style.';
  }
  
  if (exampleCount < 3) {
    return 'Not enough examples. Add at least 3-5 high-quality LinkedIn posts to train your voice.';
  }
  
  return 'Voice examples are inconsistent. Review your examples and ensure they represent your authentic writing style.';
}
