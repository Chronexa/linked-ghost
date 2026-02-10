# AI Integration Guide

## Overview

ContentPilot AI uses OpenAI's GPT-4o and text-embedding models to power intelligent content generation, voice analysis, and topic classification.

## 🎯 Core AI Features

### 1. Voice Profile Analysis

**Purpose:** Analyze user's past LinkedIn posts to understand their unique writing style and voice.

**How it works:**
1. User provides 3-10 examples of their best LinkedIn posts
2. System generates embeddings (1536-dimensional vectors) for each post using `text-embedding-3-small`
3. Embeddings are compared to calculate voice consistency
4. Master voice profile is created by averaging all embeddings
5. Confidence score (0-100) indicates how consistent the writing style is

**Implementation:**
```typescript
// lib/ai/embeddings.ts
import { generateEmbeddings, calculateVoiceConsistency, averageEmbedding } from '@/lib/ai/embeddings';

// Generate embeddings for voice examples
const embeddings = await generateEmbeddings(postTexts);

// Calculate consistency score (0-100)
const score = calculateVoiceConsistency(embeddings);

// Create master voice profile
const masterProfile = averageEmbedding(embeddings);
```

**API Endpoint:**
```bash
POST /api/voice/analyze
```

**Response:**
```json
{
  "confidenceScore": 85,
  "examplesAnalyzed": 5,
  "recommendation": "Great voice profile! Consider adding 1-2 more examples for even better results.",
  "insights": {
    "embeddingDimensions": 1536,
    "averagePostLength": 450,
    "shortestPost": 280,
    "longestPost": 650
  }
}
```

**Confidence Score Interpretation:**
- **90-100**: Excellent! Voice is highly consistent
- **80-89**: Great voice profile, very usable
- **70-79**: Good, may benefit from more examples
- **60-69**: Fair, add more examples
- **<60**: Inconsistent or insufficient data

---

### 2. Embeddings & Similarity

**What are embeddings?**
Embeddings are numerical representations of text that capture semantic meaning. Similar texts have similar embeddings.

**Models:**
- `text-embedding-3-small`: 1536 dimensions, $0.020 per 1M tokens
- `text-embedding-3-large`: 3072 dimensions, $0.130 per 1M tokens (higher quality)

**Cosine Similarity:**
Measures how similar two embeddings are:
- **1.0**: Identical
- **0.9-1.0**: Very similar (same voice/style)
- **0.7-0.9**: Similar (related topics)
- **0.5-0.7**: Somewhat similar
- **<0.5**: Different

**Usage:**
```typescript
import { cosineSimilarity, findMostSimilar } from '@/lib/ai/embeddings';

// Compare two texts
const similarity = cosineSimilarity(embedding1, embedding2);

// Find most similar from a list
const { index, similarity } = findMostSimilar(targetEmbedding, candidateEmbeddings);
```

---

### 3. Draft Generation (Coming Soon)

**Purpose:** Generate LinkedIn posts that match user's voice and pillar themes.

**Planned Flow:**
1. User selects a topic (e.g., "Product-Market Fit for SaaS")
2. System retrieves topic details and associated pillar
3. Loads user's voice profile (master embedding)
4. Generates 3 draft variants (A, B, C) using GPT-4o
5. Compares drafts to voice profile using similarity scoring
6. Returns drafts ranked by voice match

**Models:**
- `gpt-4o`: Best quality, $2.50/$10.00 per 1M tokens (input/output)
- `gpt-4o-mini`: Fast & cheap, $0.15/$0.60 per 1M tokens

**Configuration:**
```typescript
// lib/ai/openai.ts
export const DEFAULT_CONFIG = {
  generation: {
    model: 'gpt-4o',
    temperature: 0.7,  // 0 = deterministic, 1 = creative
    max_tokens: 1500,
  },
};
```

---

### 4. Topic Classification (Coming Soon)

**Purpose:** Automatically classify discovered topics into user's content pillars.

**Planned Flow:**
1. System discovers trending topics (Perplexity, Reddit, etc.)
2. Each topic is classified using GPT-4o-mini
3. AI assigns topic to best-matching pillar
4. Confidence score (0-100) indicates classification certainty
5. Topics with low confidence are flagged for manual review

**Configuration:**
```typescript
// lib/ai/openai.ts
export const DEFAULT_CONFIG = {
  classification: {
    model: 'gpt-4o-mini',
    temperature: 0.3,  // Lower = more consistent
    max_tokens: 1000,
  },
};
```

---

## 📊 Cost Management

### Pricing (as of 2024)

**Chat Models:**
- GPT-4o: $2.50 (input) / $10.00 (output) per 1M tokens
- GPT-4o-mini: $0.15 (input) / $0.60 (output) per 1M tokens

**Embeddings:**
- text-embedding-3-small: $0.020 per 1M tokens
- text-embedding-3-large: $0.130 per 1M tokens

### Estimated Costs per Operation

**Voice Analysis (5 examples):**
- ~2,500 tokens × $0.020 = $0.00005 (**$0.05 per 1000 analyses**)

**Draft Generation (3 variants):**
- Input: ~1,000 tokens × $2.50 = $0.0025
- Output: ~1,500 tokens × $10.00 = $0.015
- **Total: ~$0.0175 per generation** (~57 generations per $1)

**Topic Classification:**
- Input: ~500 tokens × $0.15 = $0.000075
- Output: ~200 tokens × $0.60 = $0.00012
- **Total: ~$0.0002 per classification** (~5,000 classifications per $1)

### Cost Optimization

1. **Batch Requests:** Use `generateEmbeddings(texts[])` for multiple texts
2. **Caching:** Cache voice profiles, pillar embeddings
3. **Model Selection:** Use GPT-4o-mini for classification, GPT-4o for generation
4. **Token Limits:** Set `max_tokens` to prevent runaway costs
5. **Rate Limiting:** Enforce API rate limits per user tier

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...

# Optional: Override default models
OPENAI_CHAT_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Model Configuration

```typescript
// lib/ai/openai.ts
export const OPENAI_MODELS = {
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
  EMBEDDING_SMALL: 'text-embedding-3-small',
  EMBEDDING_LARGE: 'text-embedding-3-large',
};
```

---

## 🧪 Testing

### Test Voice Analysis

```bash
npx tsx scripts/test-voice-analysis.ts
```

**Expected Output:**
```
✅ OpenAI connection successful
✅ Generated 3 embeddings (1536 dimensions)
✅ Voice Consistency: 85/100
✅ All tests passed!
```

### Test Embeddings

```typescript
import { generateEmbedding, cosineSimilarity } from '@/lib/ai/embeddings';

const emb1 = await generateEmbedding("I love building SaaS products");
const emb2 = await generateEmbedding("Building software is my passion");

const similarity = cosineSimilarity(emb1, emb2);
console.log(`Similarity: ${(similarity * 100).toFixed(2)}%`);
```

### Health Check

```bash
curl http://localhost:3003/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "up",
    "redis": "up",
    "openai": "up"
  }
}
```

---

## 🚀 Usage Examples

### 1. Analyze User Voice

```typescript
// Client-side
const response = await fetch('/api/voice/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});

const data = await response.json();
console.log(`Voice Confidence: ${data.confidenceScore}/100`);
console.log(`Recommendation: ${data.recommendation}`);
```

### 2. Add Voice Examples

```typescript
// Add a new voice example
await fetch('/api/voice/examples', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postText: "Your LinkedIn post text here...",
    pillarId: "optional-pillar-id",
  }),
});

// Then re-analyze voice
await fetch('/api/voice/analyze', { method: 'POST' });
```

### 3. Generate Embeddings Manually

```typescript
import { generateEmbedding } from '@/lib/ai/embeddings';

const embedding = await generateEmbedding("Your text here");
// Returns: number[] (1536 dimensions)
```

---

## 🔐 Security & Best Practices

### API Key Management
- ✅ Store in `.env.local` (never commit to Git)
- ✅ Use lazy initialization in `lib/ai/openai.ts`
- ✅ Rotate keys regularly
- ✅ Monitor usage on OpenAI dashboard

### Rate Limiting
- Voice analysis: 10 requests/hour (authenticated)
- Draft generation: 5 requests/hour (authenticated)
- Classification: 20 requests/hour (authenticated)

### Error Handling
```typescript
try {
  const embeddings = await generateEmbeddings(texts);
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle authentication error
  } else if (error.message.includes('rate limit')) {
    // Handle rate limit error
  } else {
    // Generic error
  }
}
```

### Data Privacy
- Voice embeddings are stored in user's own database
- Never share user's voice profile with other users
- Embeddings cannot be reverse-engineered to original text
- GDPR-compliant: embeddings are deleted when user is deleted

---

## 📈 Monitoring & Analytics

### Track AI Usage

```typescript
// Track in usage_tracking table
await db.insert(usageTracking).values({
  userId,
  month: '2026-02',
  voiceAnalyses: 1,
});
```

### Monitor Costs

```typescript
import { estimateCost, PRICING } from '@/lib/ai/openai';

const cost = estimateCost(
  1000,  // input tokens
  500,   // output tokens
  'gpt4o'
);

console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

### Performance Metrics
- Voice analysis: ~500-1000ms
- Single embedding: ~200-400ms
- Batch embeddings (5): ~600-800ms
- Draft generation: ~3-5 seconds

---

## 🐛 Troubleshooting

### "OpenAI API key is invalid or missing"
```bash
# Check .env.local
grep OPENAI_API_KEY .env.local

# Test connection
npx tsx scripts/test-voice-analysis.ts
```

### "Failed to generate embeddings"
- Check OpenAI API status: https://status.openai.com
- Verify API key has sufficient credits
- Check rate limits on OpenAI dashboard

### "Voice consistency score too low"
- Add more voice examples (5-10 recommended)
- Ensure examples are authentic (written by user)
- Examples should be similar in style and tone
- Remove outliers or off-brand posts

---

## 🔮 Roadmap

### Phase 2.1 (Current)
- ✅ Voice profile analysis with embeddings
- ✅ Confidence score calculation
- ✅ OpenAI integration wrapper

### Phase 2.2 (Next)
- 🔄 Draft generation with GPT-4o
- 🔄 Voice matching for drafts
- 🔄 A/B/C variant generation

### Phase 2.3 (Future)
- 🔄 Topic classification
- 🔄 Perplexity integration
- 🔄 Background job queues
- 🔄 Voice retraining scheduler

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [OpenAI Pricing](https://openai.com/pricing)

---

**Last Updated:** February 9, 2026
**Version:** 1.0.0
**Status:** ✅ Voice Analysis Complete, Draft Generation In Progress
