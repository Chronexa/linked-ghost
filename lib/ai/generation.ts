/**
 * Content Generation Utilities
 * Generate LinkedIn posts using GPT-4o with voice matching
 */

import { openai, OPENAI_MODELS, DEFAULT_CONFIG } from './openai';
import { generateEmbedding, cosineSimilarity } from './embeddings';

/**
 * Structure of a LinkedIn post
 */
export interface LinkedInPost {
  fullText: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  characterCount: number;
  estimatedEngagement?: number;
}

/**
 * Draft variant with voice match score
 */
export interface DraftVariant {
  variantLetter: 'A' | 'B' | 'C';
  post: LinkedInPost;
  voiceMatchScore: number; // 0-100, how well it matches user's voice
  style: string; // "narrative" | "analytical" | "conversational"
}

/**
 * Generation result with multiple variants
 */
export interface GenerationResult {
  variants: DraftVariant[];
  topicTitle: string;
  pillarName: string;
  metadata: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    generationTime: number;
  };
}

/**
 * Voice example for prompt context
 */
interface VoiceExample {
  postText: string;
  embedding?: number[];
}

/**
 * Generate 3 LinkedIn post variants from a topic
 */
export async function generateDraftVariants(params: {
  topicTitle: string;
  topicDescription?: string;
  pillarName: string;
  pillarDescription?: string;
  pillarTone?: string;
  targetAudience?: string;
  customPrompt?: string;
  voiceExamples: VoiceExample[];
  masterVoiceEmbedding?: number[];
}): Promise<GenerationResult> {
  const startTime = Date.now();

  const {
    topicTitle,
    topicDescription,
    pillarName,
    pillarDescription,
    pillarTone,
    targetAudience,
    customPrompt,
    voiceExamples,
    masterVoiceEmbedding,
  } = params;

  // Build the prompt
  const systemPrompt = buildSystemPrompt({
    pillarName,
    pillarDescription,
    pillarTone,
    targetAudience,
    customPrompt,
  });

  const userPrompt = buildUserPrompt({
    topicTitle,
    topicDescription,
    voiceExamples,
  });

  console.log('🤖 Generating drafts with GPT-4o...');

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: DEFAULT_CONFIG.generation.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: DEFAULT_CONFIG.generation.temperature,
    max_tokens: DEFAULT_CONFIG.generation.max_tokens,
    response_format: { type: 'json_object' },
  });

  const completion = response.choices[0].message.content;
  if (!completion) {
    throw new Error('No completion received from OpenAI');
  }

  // Parse the JSON response
  const parsed = JSON.parse(completion);
  const variants: DraftVariant[] = [];

  // Process each variant
  for (const variant of parsed.variants) {
    const post: LinkedInPost = {
      fullText: variant.fullText,
      hook: variant.hook,
      body: variant.body,
      cta: variant.cta,
      hashtags: variant.hashtags || [],
      characterCount: variant.fullText.length,
    };

    // Calculate voice match score if master embedding is available
    let voiceMatchScore = 50; // Default

    if (masterVoiceEmbedding) {
      console.log(`🔍 Calculating voice match for variant ${variant.letter}...`);
      const draftEmbedding = await generateEmbedding(post.fullText);
      const similarity = cosineSimilarity(draftEmbedding, masterVoiceEmbedding);
      voiceMatchScore = Math.round(similarity * 100);
    }

    variants.push({
      variantLetter: variant.letter,
      post,
      voiceMatchScore,
      style: variant.style,
    });
  }

  // Sort by voice match score (highest first)
  variants.sort((a, b) => b.voiceMatchScore - a.voiceMatchScore);

  const generationTime = Date.now() - startTime;

  console.log('✅ Draft generation complete!');
  console.log(`   Variants: ${variants.length}`);
  console.log(`   Voice match scores: ${variants.map((v) => v.voiceMatchScore).join(', ')}`);
  console.log(`   Generation time: ${generationTime}ms`);

  return {
    variants,
    topicTitle,
    pillarName,
    metadata: {
      model: DEFAULT_CONFIG.generation.model,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      estimatedCost: calculateCost(
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      ),
      generationTime,
    },
  };
}

/**
 * Build system prompt with pillar context
 */
function buildSystemPrompt(params: {
  pillarName: string;
  pillarDescription?: string;
  pillarTone?: string;
  targetAudience?: string;
  customPrompt?: string;
}): string {
  const { pillarName, pillarDescription, pillarTone, targetAudience, customPrompt } = params;

  return `You are an expert LinkedIn ghostwriter specializing in authentic, engaging content.

**CONTENT PILLAR:** ${pillarName}
${pillarDescription ? `**DESCRIPTION:** ${pillarDescription}` : ''}
${pillarTone ? `**TONE:** ${pillarTone}` : ''}
${targetAudience ? `**TARGET AUDIENCE:** ${targetAudience}` : ''}
${customPrompt ? `**CUSTOM INSTRUCTIONS:** ${customPrompt}` : ''}

**YOUR TASK:**
Generate 3 LinkedIn post variants (A, B, C) that:
1. Match the user's authentic writing voice (study the examples provided)
2. Cover the topic thoroughly and insightfully
3. Engage the target audience with actionable insights
4. Follow LinkedIn best practices (hooks, storytelling, CTAs)

**VARIANT STYLES:**
- Variant A: Narrative/storytelling style (personal, relatable)
- Variant B: Analytical/data-driven style (insights, frameworks)
- Variant C: Conversational/question-based style (engaging, interactive)

**STRUCTURE REQUIREMENTS:**
- Hook: Compelling opening (1-2 lines, stops the scroll)
- Body: Main content (insights, story, data - 5-8 lines)
- CTA: Call to action (question, request for engagement - 1-2 lines)
- Hashtags: 3-5 relevant hashtags
- Length: 200-600 characters (LinkedIn sweet spot)

**IMPORTANT:**
- Match the user's voice patterns from their examples
- Avoid clichés ("game-changer", "unlock", "secret sauce")
- Be authentic, not corporate
- Use line breaks for readability
- Make it scroll-stopping

**OUTPUT FORMAT (JSON):**
{
  "variants": [
    {
      "letter": "A",
      "style": "narrative",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "fullText": "...",
      "hashtags": ["...", "..."]
    },
    // B and C...
  ]
}`;
}

/**
 * Build user prompt with topic and voice examples
 */
function buildUserPrompt(params: {
  topicTitle: string;
  topicDescription?: string;
  voiceExamples: VoiceExample[];
}): string {
  const { topicTitle, topicDescription, voiceExamples } = params;

  // Select best voice examples (max 3 for context window)
  const selectedExamples = voiceExamples.slice(0, 3);

  let prompt = `**TOPIC:** ${topicTitle}\n`;
  if (topicDescription) {
    prompt += `**DESCRIPTION:** ${topicDescription}\n`;
  }

  prompt += `\n**USER'S WRITING VOICE (study these examples):**\n\n`;

  selectedExamples.forEach((example, index) => {
    prompt += `Example ${index + 1}:\n${example.postText}\n\n---\n\n`;
  });

  prompt += `\nNow generate 3 LinkedIn post variants (A, B, C) on the topic "${topicTitle}" that match this authentic voice.\n`;
  prompt += `Return ONLY valid JSON matching the format specified in the system prompt.`;

  return prompt;
}

/**
 * Calculate estimated cost for generation
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  // GPT-4o pricing: $2.50 input, $10.00 output per 1M tokens
  const inputCost = (inputTokens / 1_000_000) * 2.5;
  const outputCost = (outputTokens / 1_000_000) * 10.0;
  return inputCost + outputCost;
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
}

/**
 * Calculate estimated engagement based on post characteristics
 * This is a simplified heuristic - in production, use ML model
 */
export function estimateEngagement(post: LinkedInPost, userFollowers: number = 1000): number {
  let score = 100; // Base score

  // Length factor (sweet spot is 200-600 chars)
  if (post.characterCount >= 200 && post.characterCount <= 600) {
    score += 50;
  } else if (post.characterCount < 200) {
    score -= 20;
  } else {
    score -= 30;
  }

  // Hook quality (very basic - checks for question or number)
  if (post.hook.includes('?')) score += 20;
  if (/\d/.test(post.hook)) score += 15;

  // CTA present
  if (post.cta.length > 0) score += 25;

  // Hashtags (3-5 is optimal)
  if (post.hashtags.length >= 3 && post.hashtags.length <= 5) {
    score += 20;
  }

  // Scale by follower count (rough approximation)
  const engagementRate = 0.02; // 2% average engagement rate
  const estimatedLikes = Math.round((userFollowers * engagementRate * score) / 100);

  return estimatedLikes;
}

/**
 * Validate generated post meets LinkedIn requirements
 */
export function validatePost(post: LinkedInPost): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (post.characterCount > 3000) {
    errors.push('Post exceeds LinkedIn character limit (3000)');
  }

  if (post.characterCount < 50) {
    errors.push('Post too short (minimum 50 characters)');
  }

  if (!post.hook || post.hook.length < 10) {
    errors.push('Hook is missing or too short');
  }

  if (!post.body || post.body.length < 50) {
    errors.push('Body is missing or too short');
  }

  if (post.hashtags.length > 10) {
    errors.push('Too many hashtags (maximum 10)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
