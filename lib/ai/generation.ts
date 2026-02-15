/**
 * Content Generation Utilities
 * Generate LinkedIn posts using GPT-4o with voice matching
 * Uses prompt store when available; falls back to in-code builders.
 */

import { openai, OPENAI_MODELS, DEFAULT_CONFIG } from './openai';
import { generateEmbedding, cosineSimilarity } from './embeddings';
import { getPrompt, PROMPT_KEYS } from '@/lib/prompts/store';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
 * Draft variant with voice match score and optional quality warnings
 */
export interface DraftVariant {
  variantLetter: 'A' | 'B' | 'C';
  post: LinkedInPost;
  voiceMatchScore: number; // 0-100, how well it matches user's voice
  style: string; // "narrative" | "analytical" | "conversational"
  qualityWarnings?: string[]; // from validatePost() when invalid
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

interface VoiceExample {
  postText: string;
  embedding?: number[];
}

interface AuthorContextConfig {
  profile: any | null; // Typed as 'any' locally to avoid circular deps, effectively typeof profiles.$inferSelect
  mode: 'full' | 'minimal' | 'none';
}

/**
 * Build Author Context String
 * Converts raw profile data into a rich persona definition for the AI.
 */
export function buildAuthorContext(config: AuthorContextConfig): string {
  const { profile, mode } = config;

  if (mode === 'none' || !profile) {
    return '';
  }

  // extract fields with fallbacks
  const role = profile.currentRole || 'Professional';
  const industry = profile.industry || 'Business';
  const years = profile.yearsOfExperience || 'several';
  const expertise = Array.isArray(profile.keyExpertise) ? profile.keyExpertise : [];
  const angle = profile.uniqueAngle || '';

  // Calculate seniority/credibility level
  let seniorityLevel = 'mid-level';
  let yearsNum = 0;

  if (typeof years === 'string') {
    if (years.includes('15+')) yearsNum = 15;
    else if (years.includes('11-15')) yearsNum = 12;
    else if (years.includes('6-10')) yearsNum = 8;
    else if (years.includes('3-5')) yearsNum = 4;
    else yearsNum = 1;
  }

  if (yearsNum >= 10) seniorityLevel = 'expert veteran';
  else if (yearsNum >= 5) seniorityLevel = 'experienced practitioner';
  else seniorityLevel = 'emerging professional';

  // Industry-specific terminology injection (Simple map for now, can be expanded)
  let industryTerms = '';
  const indLower = industry.toLowerCase();
  if (indLower.includes('saas') || indLower.includes('software')) {
    industryTerms = 'Use SaaS metrics like ARR, CAC, LTV, and Churn where appropriate. Focus on growth, scale, and product-market fit.';
  } else if (indLower.includes('marketing')) {
    industryTerms = 'Focus on ROI, brand equity, conversion rates, and audience segmentation.';
  } else if (indLower.includes('healthcare')) {
    industryTerms = 'Prioritize patient outcomes, compliance, and operational efficiency.';
  }

  let context = `**AUTHOR IDENTITY**\n`;
  context += `You are ghostwriting for a ${role} with ${years} years of experience in ${industry}. `;

  if (seniorityLevel === 'expert veteran') {
    context += `They are an authoritative voice in the industry. `;
  } else {
    context += `They are sharing their journey and learnings. `;
  }

  if (expertise.length > 0) {
    context += `\nTheir core expertise covering: ${expertise.join(', ')}. `;
    context += `\n\n**MANDATORY EXPERTISE INJECTION**\n`;
    context += `You must subtly weave in the following expertise areas to establish authority: ${expertise.join(', ')}.\n`;
  }

  if (angle) {
    context += `\nUnique Perspective: "${angle}"`;
  }

  context += `\n\n**CREDIBILITY CONSTRAINTS**\n`;
  context += `- Frame insights through the lens of a ${seniorityLevel}.\n`;
  if (industryTerms) {
    context += `- ${industryTerms}\n`;
  }
  context += `- Avoid generic advice; be specific to the ${industry} context.\n`;
  context += `- Use specialized terminology from the user's expertise where natural.\n`;

  return context;
}

/**
 * Generate 2-3 LinkedIn post variants from a topic with user perspective
 */
export async function generateDraftVariants(params: {
  topicTitle: string;
  topicDescription?: string;
  userPerspective: string;
  pillarName: string;
  pillarDescription?: string;
  pillarTone?: string;
  targetAudience?: string;
  customPrompt?: string;
  voiceExamples: VoiceExample[];
  masterVoiceEmbedding?: number[];
  numVariants?: number;
  userInstructions?: string;
  userId: string; // Added userId to fetch profile
}): Promise<GenerationResult> {
  const startTime = Date.now();

  const {
    topicTitle,
    topicDescription,
    userPerspective,
    pillarName,
    pillarDescription,
    pillarTone,
    targetAudience,
    customPrompt,
    voiceExamples,
    masterVoiceEmbedding,
    numVariants = 3,
    userInstructions,
    userId,
  } = params;

  // 1. Fetch Profile Data (Mission Objective 1.3)
  console.log(`👤 Fetching profile context for user: ${userId}`);
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  // Calculate profile completeness for telemetry (Mocking analytics for now)
  const hasRole = !!profile?.currentRole;
  const hasIndustry = !!profile?.industry;
  const hasExpertise = ((profile?.keyExpertise as string[])?.length ?? 0) > 0;
  const profileScore = [hasRole, hasIndustry, hasExpertise, !!profile?.yearsOfExperience].filter(Boolean).length * 25;
  console.log(`   Profile Completeness: ${profileScore}%`);

  // 2. Build Author Context (Mission Objective 1.1)
  // Default to 'full' mode, can be controlled via feature flag later
  const authorContext = buildAuthorContext({ profile, mode: 'full' });

  const contextParts: string[] = [];
  if (pillarDescription) contextParts.push(`**DESCRIPTION:** ${pillarDescription}`);
  if (pillarTone) contextParts.push(`**TONE:** ${pillarTone}`);
  if (targetAudience) contextParts.push(`**TARGET AUDIENCE:** ${targetAudience}`);
  if (customPrompt) contextParts.push(`**CUSTOM INSTRUCTIONS:** ${customPrompt}`);
  const pillarContext = contextParts.join('\n');

  const selectedExamples = voiceExamples.slice(0, 3);
  const voiceExamplesText = selectedExamples.length > 0
    ? selectedExamples.map((ex, i) => `Example ${i + 1}:\n${ex.postText}\n\n---\n`).join('\n')
    : "No specific voice examples provided. Please write in a professional, engaging, and authentic LinkedIn tone. Avoid corporate jargon.";
  const topicDescriptionText = topicDescription ? `**DESCRIPTION:** ${topicDescription}` : '';

  let systemPrompt: string;
  let userPrompt: string;
  try {
    systemPrompt = await getPrompt(PROMPT_KEYS.DRAFT_SYSTEM, {
      pillarName,
      pillarContext,
      userInstructions: userInstructions ? `\n**USER INSTRUCTIONS:** ${userInstructions}` : '',
      numVariants,
      authorContext,
    });
    userPrompt = await getPrompt(PROMPT_KEYS.DRAFT_USER, {
      topicTitle,
      topicDescription: topicDescriptionText,
      voiceExamples: voiceExamplesText,
      userPerspective,
      numVariants,
    });
    if (!systemPrompt.trim() || !userPrompt.trim()) throw new Error('Empty');
  } catch {
    systemPrompt = buildSystemPrompt({
      pillarName,
      pillarDescription,
      pillarTone,
      targetAudience,
      customPrompt,
      numVariants,
      authorContext,
    });
    userPrompt = buildUserPrompt({
      topicTitle,
      topicDescription,
      userPerspective,
      voiceExamples,
    });
  }

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

    // Validate post and attach warnings (Option A: log and attach, don't reject)
    const validation = validatePost(post);
    const qualityWarnings = validation.valid ? undefined : validation.errors;
    if (qualityWarnings?.length) {
      console.warn(`⚠️ Draft variant ${variant.letter} quality warnings:`, qualityWarnings);
    }

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
      qualityWarnings,
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
import { GENERATION_PROMPTS, interpolate } from '@/lib/prompts/generation-prompts';

/**
 * Build system prompt with pillar context
 */
export function buildSystemPrompt(params: {
  pillarName: string;
  pillarDescription?: string;
  pillarTone?: string;
  targetAudience?: string;
  customPrompt?: string;
  numVariants?: number;
  authorContext?: string;
}): string {
  const { pillarName, pillarDescription, pillarTone, targetAudience, customPrompt, numVariants = 3, authorContext = '' } = params;

  // Build pillar context string
  const contextParts = [];
  if (pillarDescription) contextParts.push(`**DESCRIPTION:** ${pillarDescription}`);
  if (pillarTone) contextParts.push(`**TONE:** ${pillarTone}`);
  if (targetAudience) contextParts.push(`**TARGET AUDIENCE:** ${targetAudience}`);
  if (customPrompt) contextParts.push(`**CUSTOM INSTRUCTIONS:** ${customPrompt}`);

  const pillarContext = contextParts.join('\n');

  const systemPromptText = interpolate(GENERATION_PROMPTS.systemPrompt.base, {
    pillarName,
    pillarContext,
    authorContext,
  });

  // Update to request specific number of variants
  return systemPromptText.replace('3 variants', `${numVariants} variants`);
}

/**
 * Build user prompt with topic and voice examples
 */
function buildUserPrompt(params: {
  topicTitle: string;
  topicDescription?: string;
  userPerspective: string;
  voiceExamples: VoiceExample[];
}): string {
  const { topicTitle, topicDescription, userPerspective, voiceExamples } = params;

  // Select best voice examples (max 3 for context window)
  const selectedExamples = voiceExamples.slice(0, 3);

  let examplesText = selectedExamples.map((example, index) =>
    `Example ${index + 1}:\n${example.postText}\n\n---\n`
  ).join('\n');

  if (!examplesText) {
    examplesText = "No specific voice examples provided. Please write in a professional, engaging, and authentic LinkedIn tone. Avoid corporate jargon.";
  }

  const descriptionText = topicDescription
    ? interpolate(GENERATION_PROMPTS.userPrompt.descriptionTemplate, { description: topicDescription })
    : '';

  const basePrompt = interpolate(GENERATION_PROMPTS.userPrompt.base, {
    topicTitle,
    topicDescription: descriptionText,
    voiceExamples: examplesText
  });

  // Add user perspective to the prompt
  const perspectiveSection = `\n\n**USER'S PERSPECTIVE:**\n${userPerspective}\n\nPlease incorporate this perspective into the LinkedIn posts. Use this insight to guide the angle, narrative, and key points of each variant.`;

  return basePrompt + perspectiveSection;
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
