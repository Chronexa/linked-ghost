/**
 * OpenAI Client Wrapper
 * Provides type-safe access to OpenAI API with error handling
 */

import OpenAI from 'openai';

// Lazy initialization
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Export a proxy that lazily initializes the client
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    const client = getOpenAI();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
}) as OpenAI;

/**
 * Available OpenAI models for different tasks
 */
export const OPENAI_MODELS = {
  // Chat completion models
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
  GPT4_TURBO: 'gpt-4-turbo-preview',
  
  // Embedding models
  EMBEDDING_SMALL: 'text-embedding-3-small', // 1536 dimensions, cheaper
  EMBEDDING_LARGE: 'text-embedding-3-large', // 3072 dimensions, better quality
  
  // Moderation
  MODERATION: 'text-moderation-latest',
} as const;

/**
 * Default configuration for different use cases
 */
export const DEFAULT_CONFIG = {
  // Voice analysis and classification
  classification: {
    model: OPENAI_MODELS.GPT4O_MINI,
    temperature: 0.3, // Lower = more consistent
    max_tokens: 1000,
  },
  
  // Draft generation
  generation: {
    model: OPENAI_MODELS.GPT4O,
    temperature: 0.7, // Higher = more creative
    max_tokens: 1500,
  },
  
  // Voice embeddings
  embedding: {
    model: OPENAI_MODELS.EMBEDDING_SMALL, // Good balance of cost/quality
    dimensions: 1536,
  },
} as const;

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const client = getOpenAI();
    
    // Simple test: list models
    await client.models.list();
    
    console.log('✅ OpenAI connection successful');
    return true;
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error);
    return false;
  }
}

/**
 * Calculate estimated cost for OpenAI operations
 * Prices as of 2024 (may change)
 */
export const PRICING = {
  // GPT-4o (input / output per 1M tokens)
  gpt4o: {
    input: 2.50,
    output: 10.00,
  },
  
  // GPT-4o Mini (input / output per 1M tokens)
  gpt4oMini: {
    input: 0.150,
    output: 0.600,
  },
  
  // Embeddings (per 1M tokens)
  embeddingSmall: 0.020,
  embeddingLarge: 0.130,
} as const;

/**
 * Estimate cost for an operation
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: keyof typeof PRICING
): number {
  const pricing = PRICING[model];
  
  if (typeof pricing === 'number') {
    // Embedding model
    return (inputTokens / 1_000_000) * pricing;
  }
  
  // Chat model
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}
