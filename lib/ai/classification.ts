/**
 * Topic Classification Utilities
 * Automatically classify topics into content pillars using GPT-4o-mini
 */

import { openai, DEFAULT_CONFIG } from './openai';

/**
 * Content pillar for classification
 */
export interface ClassificationPillar {
  id: string;
  name: string;
  description?: string;
  tone?: string;
  targetAudience?: string;
}

/**
 * Classification result for a single topic
 */
export interface ClassificationResult {
  topicContent: string;
  pillarId: string;
  pillarName: string;
  confidenceScore: number; // 0-100
  reasoning: string;
  suggestedHashtags: string[];
  relevanceScore: number; // 0-100, how relevant is this topic overall
}

/**
 * Batch classification result
 */
export interface BatchClassificationResult {
  results: ClassificationResult[];
  metadata: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    classificationTime: number;
    totalTopics: number;
    averageConfidence: number;
  };
}

/**
 * Classify a single topic into a pillar
 */
export async function classifyTopic(params: {
  topicContent: string;
  sourceUrl?: string;
  pillars: ClassificationPillar[];
}): Promise<ClassificationResult> {
  const { topicContent, sourceUrl, pillars } = params;

  if (pillars.length === 0) {
    throw new Error('At least one pillar is required for classification');
  }

  console.log(`🔍 Classifying topic: "${topicContent.slice(0, 50)}..."`);

  const startTime = Date.now();

  // Build the prompt
  const systemPrompt = buildClassificationSystemPrompt(pillars);
  const userPrompt = buildClassificationUserPrompt(topicContent, sourceUrl);

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: DEFAULT_CONFIG.classification.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: DEFAULT_CONFIG.classification.temperature,
    max_tokens: DEFAULT_CONFIG.classification.max_tokens,
    response_format: { type: 'json_object' },
  });

  const completion = response.choices[0].message.content;
  if (!completion) {
    throw new Error('No completion received from OpenAI');
  }

  // Parse the JSON response
  const parsed = JSON.parse(completion);

  const classificationTime = Date.now() - startTime;

  console.log(`✅ Classification complete!`);
  console.log(`   Pillar: ${parsed.pillarName}`);
  console.log(`   Confidence: ${parsed.confidenceScore}%`);
  console.log(`   Time: ${classificationTime}ms`);

  return {
    topicContent,
    pillarId: parsed.pillarId,
    pillarName: parsed.pillarName,
    confidenceScore: parsed.confidenceScore,
    reasoning: parsed.reasoning,
    suggestedHashtags: parsed.suggestedHashtags || [],
    relevanceScore: parsed.relevanceScore,
  };
}

/**
 * Classify multiple topics in batch (more efficient)
 */
export async function classifyTopicsBatch(params: {
  topics: Array<{ content: string; sourceUrl?: string }>;
  pillars: ClassificationPillar[];
}): Promise<BatchClassificationResult> {
  const { topics, pillars } = params;

  if (pillars.length === 0) {
    throw new Error('At least one pillar is required for classification');
  }

  if (topics.length === 0) {
    throw new Error('At least one topic is required for classification');
  }

  console.log(`🔍 Batch classifying ${topics.length} topics...`);

  const startTime = Date.now();

  // Build the prompt
  const systemPrompt = buildBatchClassificationSystemPrompt(pillars);
  const userPrompt = buildBatchClassificationUserPrompt(topics);

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: DEFAULT_CONFIG.classification.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: DEFAULT_CONFIG.classification.temperature,
    max_tokens: DEFAULT_CONFIG.classification.max_tokens * topics.length, // Scale with topic count
    response_format: { type: 'json_object' },
  });

  const completion = response.choices[0].message.content;
  if (!completion) {
    throw new Error('No completion received from OpenAI');
  }

  // Parse the JSON response
  const parsed = JSON.parse(completion);

  const classificationTime = Date.now() - startTime;
  const results: ClassificationResult[] = parsed.classifications.map((c: any, index: number) => ({
    topicContent: topics[index].content,
    pillarId: c.pillarId,
    pillarName: c.pillarName,
    confidenceScore: c.confidenceScore,
    reasoning: c.reasoning,
    suggestedHashtags: c.suggestedHashtags || [],
    relevanceScore: c.relevanceScore,
  }));

  const averageConfidence =
    results.reduce((sum, r) => sum + r.confidenceScore, 0) / results.length;

  console.log(`✅ Batch classification complete!`);
  console.log(`   Topics classified: ${results.length}`);
  console.log(`   Average confidence: ${Math.round(averageConfidence)}%`);
  console.log(`   Time: ${classificationTime}ms`);

  return {
    results,
    metadata: {
      model: DEFAULT_CONFIG.classification.model,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      estimatedCost: calculateClassificationCost(
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      ),
      classificationTime,
      totalTopics: topics.length,
      averageConfidence: Math.round(averageConfidence),
    },
  };
}

/**
 * Build system prompt for single topic classification
 */
function buildClassificationSystemPrompt(pillars: ClassificationPillar[]): string {
  const pillarsList = pillars
    .map(
      (p) =>
        `- **${p.name}** (ID: ${p.id})
  ${p.description ? `Description: ${p.description}` : ''}
  ${p.tone ? `Tone: ${p.tone}` : ''}
  ${p.targetAudience ? `Audience: ${p.targetAudience}` : ''}`
    )
    .join('\n\n');

  return `You are an expert content strategist specializing in LinkedIn content classification.

**AVAILABLE CONTENT PILLARS:**

${pillarsList}

**YOUR TASK:**
Analyze the given topic and classify it into the most appropriate content pillar.

**CLASSIFICATION CRITERIA:**
1. **Relevance:** How well does the topic align with the pillar's focus?
2. **Audience Match:** Does it resonate with the pillar's target audience?
3. **Tone Alignment:** Does it fit the pillar's tone/style?
4. **Content Fit:** Is this something the pillar should cover?

**CONFIDENCE SCORE (0-100):**
- 90-100: Perfect match, highly confident
- 80-89: Strong match, confident
- 70-79: Good match, somewhat confident
- 60-69: Acceptable match, less confident
- <60: Weak match, low confidence (flag for manual review)

**RELEVANCE SCORE (0-100):**
Rate how relevant and valuable this topic is for LinkedIn content:
- 90-100: Highly relevant, trending, valuable
- 70-89: Relevant, worth covering
- 50-69: Somewhat relevant
- <50: Low relevance, may skip

**OUTPUT FORMAT (JSON):**
{
  "pillarId": "uuid",
  "pillarName": "Pillar Name",
  "confidenceScore": 85,
  "reasoning": "Brief explanation (1-2 sentences)",
  "suggestedHashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "relevanceScore": 90
}`;
}

/**
 * Build user prompt for single topic classification
 */
function buildClassificationUserPrompt(topicContent: string, sourceUrl?: string): string {
  let prompt = `**TOPIC TO CLASSIFY:**\n\n${topicContent}\n\n`;

  if (sourceUrl) {
    prompt += `**SOURCE:** ${sourceUrl}\n\n`;
  }

  prompt += `Analyze this topic and return ONLY valid JSON with the classification result.`;

  return prompt;
}

/**
 * Build system prompt for batch classification
 */
function buildBatchClassificationSystemPrompt(pillars: ClassificationPillar[]): string {
  const pillarsList = pillars
    .map(
      (p) =>
        `- **${p.name}** (ID: ${p.id})
  ${p.description ? `Description: ${p.description}` : ''}
  ${p.tone ? `Tone: ${p.tone}` : ''}
  ${p.targetAudience ? `Audience: ${p.targetAudience}` : ''}`
    )
    .join('\n\n');

  return `You are an expert content strategist specializing in LinkedIn content classification.

**AVAILABLE CONTENT PILLARS:**

${pillarsList}

**YOUR TASK:**
Classify each topic into the most appropriate content pillar.

**OUTPUT FORMAT (JSON):**
{
  "classifications": [
    {
      "pillarId": "uuid",
      "pillarName": "Pillar Name",
      "confidenceScore": 85,
      "reasoning": "Brief explanation",
      "suggestedHashtags": ["tag1", "tag2"],
      "relevanceScore": 90
    }
    // ... one for each topic
  ]
}`;
}

/**
 * Build user prompt for batch classification
 */
function buildBatchClassificationUserPrompt(
  topics: Array<{ content: string; sourceUrl?: string }>
): string {
  let prompt = `**TOPICS TO CLASSIFY:**\n\n`;

  topics.forEach((topic, index) => {
    prompt += `${index + 1}. ${topic.content}\n`;
    if (topic.sourceUrl) {
      prompt += `   Source: ${topic.sourceUrl}\n`;
    }
    prompt += `\n`;
  });

  prompt += `Classify each topic and return ONLY valid JSON.`;

  return prompt;
}

/**
 * Calculate estimated cost for classification
 */
function calculateClassificationCost(inputTokens: number, outputTokens: number): number {
  // GPT-4o-mini pricing: $0.150 input, $0.600 output per 1M tokens
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.6;
  return inputCost + outputCost;
}

/**
 * Determine if classification needs manual review
 */
export function needsManualReview(result: ClassificationResult): boolean {
  // Flag for review if confidence or relevance is low
  return result.confidenceScore < 60 || result.relevanceScore < 50;
}

/**
 * Get review recommendation
 */
export function getReviewRecommendation(result: ClassificationResult): string {
  if (result.confidenceScore >= 90 && result.relevanceScore >= 90) {
    return 'Excellent classification! No review needed.';
  }

  if (result.confidenceScore >= 80 && result.relevanceScore >= 70) {
    return 'Good classification. Quick review recommended.';
  }

  if (result.confidenceScore >= 70 && result.relevanceScore >= 60) {
    return 'Acceptable classification. Review recommended.';
  }

  if (result.confidenceScore < 60) {
    return 'Low confidence. Manual review required.';
  }

  if (result.relevanceScore < 50) {
    return 'Low relevance. Consider skipping this topic.';
  }

  return 'Review recommended for best results.';
}
