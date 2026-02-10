/**
 * Perplexity API Integration
 * Content discovery and research using Perplexity's Sonar models
 */

// Lazy initialization
let _perplexityApiKey: string | null = null;

function getPerplexityApiKey(): string {
  if (!_perplexityApiKey) {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not set in environment variables');
    }
    _perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  }
  return _perplexityApiKey;
}

/**
 * Available Perplexity models
 */
export const PERPLEXITY_MODELS = {
  SONAR: 'sonar',
  SONAR_PRO: 'sonar-pro',
  SONAR_REASONING: 'sonar-reasoning',
} as const;

/**
 * Search result from Perplexity
 */
export interface PerplexitySearchResult {
  content: string;
  sources: PerplexitySource[];
  citations: string[];
  model: string;
  tokensUsed: {
    input: number;
    output: number;
  };
}

/**
 * Source citation from Perplexity
 */
export interface PerplexitySource {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Discovered topic from Perplexity
 */
export interface DiscoveredTopic {
  content: string;
  sources: PerplexitySource[];
  relevanceScore: number;
  trendingScore: number;
  summary: string;
  keyPoints: string[];
  suggestedHashtags: string[];
}

/**
 * Research result with multiple topics
 */
export interface ResearchResult {
  query: string;
  topics: DiscoveredTopic[];
  metadata: {
    model: string;
    tokensUsed: number;
    estimatedCost: number;
    searchTime: number;
  };
}

/**
 * Search Perplexity for content on a specific query
 */
export async function searchPerplexity(params: {
  query: string;
  model?: keyof typeof PERPLEXITY_MODELS;
  maxTokens?: number;
}): Promise<PerplexitySearchResult> {
  const { query, model = 'SONAR_PRO', maxTokens = 1000 } = params;

  console.log(`🔍 Searching Perplexity for: "${query.slice(0, 50)}..."`);

  const startTime = Date.now();
  const apiKey = getPerplexityApiKey();

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODELS[model],
        messages: [
          {
            role: 'system',
            content: 'You are a helpful research assistant that provides accurate, up-to-date information with citations.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.2,
        return_citations: true,
        return_related_questions: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const searchTime = Date.now() - startTime;
    console.log(`✅ Search complete (${searchTime}ms)`);

    // Extract content and citations
    const content = data.choices[0].message.content;
    const citations = data.citations || [];

    // Parse sources from citations
    const sources: PerplexitySource[] = citations.map((citation: string, index: number) => ({
      title: `Source ${index + 1}`,
      url: citation,
      snippet: undefined,
    }));

    return {
      content,
      sources,
      citations,
      model: data.model,
      tokensUsed: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Perplexity search error:', error);
    throw error;
  }
}

/**
 * Discover trending topics in a specific domain
 */
export async function discoverTopics(params: {
  domain: string;
  pillarContext?: string;
  count?: number;
}): Promise<ResearchResult> {
  const { domain, pillarContext, count = 5 } = params;

  console.log(`🔍 Discovering ${count} trending topics in "${domain}"`);

  const startTime = Date.now();

  // Build research query
  const query = buildDiscoveryQuery(domain, count, pillarContext);

  // Search Perplexity
  const result = await searchPerplexity({
    query,
    model: 'SONAR_PRO',
    maxTokens: 2000,
  });

  // Parse topics from content
  const topics = parseTopicsFromContent(result.content, result.sources);

  const searchTime = Date.now() - startTime;

  console.log(`✅ Discovered ${topics.length} topics`);

  return {
    query: domain,
    topics,
    metadata: {
      model: result.model,
      tokensUsed: result.tokensUsed.input + result.tokensUsed.output,
      estimatedCost: calculatePerplexityCost(
        result.tokensUsed.input,
        result.tokensUsed.output
      ),
      searchTime,
    },
  };
}

/**
 * Research a specific topic in depth
 */
export async function researchTopic(params: {
  topic: string;
  pillarContext?: string;
}): Promise<DiscoveredTopic> {
  const { topic, pillarContext } = params;

  console.log(`📚 Researching topic: "${topic.slice(0, 50)}..."`);

  // Build research query
  const query = buildResearchQuery(topic, pillarContext);

  // Search Perplexity
  const result = await searchPerplexity({
    query,
    model: 'SONAR_PRO',
    maxTokens: 1500,
  });

  // Parse single topic
  const discoveredTopic = parseSingleTopic(result.content, topic, result.sources);

  console.log(`✅ Research complete`);
  console.log(`   Relevance: ${discoveredTopic.relevanceScore}%`);
  console.log(`   Trending: ${discoveredTopic.trendingScore}%`);

  return discoveredTopic;
}

/**
 * Build discovery query for trending topics
 */
function buildDiscoveryQuery(domain: string, count: number, pillarContext?: string): string {
  let query = `What are the top ${count} trending topics, news, and discussions about ${domain} right now? `;
  
  if (pillarContext) {
    query += `Focus on topics relevant to: ${pillarContext}. `;
  }

  query += `For each topic, provide:
1. A clear, specific topic title
2. Why it's trending/relevant
3. Key insights or data points
4. Potential angle for LinkedIn content

Format as a numbered list.`;

  return query;
}

/**
 * Build research query for a specific topic
 */
function buildResearchQuery(topic: string, pillarContext?: string): string {
  let query = `Research this topic in depth: "${topic}". `;

  if (pillarContext) {
    query += `Context: ${pillarContext}. `;
  }

  query += `Provide:
1. Current state and recent developments
2. Key data points, statistics, or facts
3. Different perspectives or angles
4. Why this matters for professionals
5. Actionable insights

Be specific and cite recent sources.`;

  return query;
}

/**
 * Parse topics from Perplexity content
 */
function parseTopicsFromContent(content: string, sources: PerplexitySource[]): DiscoveredTopic[] {
  const topics: DiscoveredTopic[] = [];

  // Split content into sections (assuming numbered list)
  const sections = content.split(/\n(?=\d+\.)/);

  sections.forEach((section) => {
    if (section.trim().length < 50) return; // Skip empty or too short sections

    // Extract topic title (first line)
    const lines = section.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return;

    const titleMatch = lines[0].match(/^\d+\.\s*(.+)/);
    const topicTitle = titleMatch ? titleMatch[1].trim() : lines[0].trim();

    // Extract key points
    const keyPoints: string[] = [];
    lines.forEach((line) => {
      if (line.match(/^[-•*]/) || line.match(/^\d+\./)) {
        keyPoints.push(line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      }
    });

    // Simple relevance scoring based on content length and structure
    const relevanceScore = Math.min(95, 70 + keyPoints.length * 5);
    const trendingScore = Math.min(90, 60 + Math.floor(Math.random() * 30));

    // Extract hashtags (simple extraction)
    const hashtags = extractHashtagsFromText(section);

    topics.push({
      content: topicTitle,
      sources: sources.slice(0, 3), // Top 3 sources
      relevanceScore,
      trendingScore,
      summary: section.slice(0, 300).trim(),
      keyPoints: keyPoints.slice(0, 5),
      suggestedHashtags: hashtags.slice(0, 5),
    });
  });

  return topics.slice(0, 10); // Max 10 topics
}

/**
 * Parse a single researched topic
 */
function parseSingleTopic(
  content: string,
  originalTopic: string,
  sources: PerplexitySource[]
): DiscoveredTopic {
  // Extract key points from content
  const keyPoints: string[] = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    if (line.match(/^[-•*]/) || line.match(/^\d+\./)) {
      const point = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (point.length > 20) {
        keyPoints.push(point);
      }
    }
  });

  // Determine scores based on content quality
  const hasData = content.match(/\d+%|statistics|data|study|research/i) ? 15 : 0;
  const hasRecent = content.match(/recent|latest|2026|2025|trending/i) ? 15 : 0;
  const hasDepth = content.length > 500 ? 10 : content.length > 300 ? 5 : 0;

  const relevanceScore = Math.min(95, 60 + hasData + hasRecent + hasDepth);
  const trendingScore = Math.min(90, 50 + hasRecent + 20);

  // Extract hashtags
  const hashtags = extractHashtagsFromText(originalTopic + ' ' + content);

  return {
    content: originalTopic,
    sources,
    relevanceScore,
    trendingScore,
    summary: content.slice(0, 500).trim(),
    keyPoints: keyPoints.slice(0, 7),
    suggestedHashtags: hashtags.slice(0, 5),
  };
}

/**
 * Extract potential hashtags from text
 */
function extractHashtagsFromText(text: string): string[] {
  const hashtags = new Set<string>();

  // Common tech/business keywords
  const keywords = [
    'AI', 'SaaS', 'Startup', 'Product', 'Leadership', 'Tech',
    'Innovation', 'Growth', 'Business', 'Marketing', 'Sales',
    'Engineering', 'Design', 'Data', 'Analytics', 'Strategy',
  ];

  keywords.forEach((keyword) => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      hashtags.add(keyword);
    }
  });

  // Extract capitalized words (potential proper nouns)
  const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
  words.forEach((word) => {
    if (word.length > 3 && !word.match(/^(The|This|That|With|From|About)$/)) {
      hashtags.add(word);
    }
  });

  return Array.from(hashtags).slice(0, 10);
}

/**
 * Calculate estimated cost for Perplexity API
 */
function calculatePerplexityCost(inputTokens: number, outputTokens: number): number {
  // Perplexity Sonar Pro pricing (example - verify actual pricing)
  // Assuming $0.001 per 1k tokens for both input and output
  const inputCost = (inputTokens / 1000) * 0.001;
  const outputCost = (outputTokens / 1000) * 0.001;
  return inputCost + outputCost;
}

/**
 * Test Perplexity connection
 */
export async function testPerplexityConnection(): Promise<boolean> {
  try {
    const result = await searchPerplexity({
      query: 'What is AI?',
      maxTokens: 100,
    });

    console.log('✅ Perplexity connection successful');
    console.log(`   Model: ${result.model}`);
    console.log(`   Content length: ${result.content.length} chars`);

    return true;
  } catch (error) {
    console.error('❌ Perplexity connection failed:', error);
    return false;
  }
}
