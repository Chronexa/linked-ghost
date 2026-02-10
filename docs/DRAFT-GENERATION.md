# Draft Generation Guide

## Overview

ContentPilot AI generates LinkedIn posts using GPT-4o that match your authentic writing voice. The system creates 3 unique variants for each topic, ranks them by voice similarity, and provides engagement estimates.

---

## 🎯 How It Works

### 1. Input Requirements

**Minimum:**
- ✅ Topic title (required)
- ✅ Content pillar (required)
- ✅ 3+ voice training examples (required)
- ✅ Trained voice profile (required)

**Optional (improves quality):**
- Topic description
- Pillar tone/style guide
- Target audience
- Custom instructions

### 2. Generation Process

```
1. Load user's voice profile (master embedding)
2. Load 3-10 voice examples (prioritize pillar-specific)
3. Build dynamic GPT-4o prompt with context
4. Generate 3 variants (A, B, C) with different styles
5. Calculate voice match score for each variant
6. Rank by voice similarity
7. Store in database with metadata
```

### 3. Output Structure

Each variant includes:
- **Hook:** Compelling opening (1-2 lines)
- **Body:** Main content (5-8 lines)
- **CTA:** Call to action (1-2 lines)
- **Hashtags:** 3-5 relevant tags
- **Voice Match Score:** 0-100% similarity to your voice
- **Style Type:** narrative | analytical | conversational

---

## 📊 Variant Styles

### Variant A: Narrative/Storytelling
**Characteristics:**
- Personal stories and experiences
- Relatable, human-focused
- "I" voice, first-person perspective
- Emotional connection

**Example Hook:**
> I once spent 6 months building a feature nobody wanted.

**Best for:** Personal branding, founder stories, lessons learned

---

### Variant B: Analytical/Data-Driven
**Characteristics:**
- Facts, frameworks, and data
- Structured insights
- Authority and expertise
- Actionable takeaways

**Example Hook:**
> 60% of startups fail due to lack of market need.

**Best for:** Thought leadership, industry insights, how-to guides

---

### Variant C: Conversational/Question-Based
**Characteristics:**
- Engaging questions
- Interactive and accessible
- Two-way dialogue
- Community-building

**Example Hook:**
> Ever launched an MVP and realized it missed the mark?

**Best for:** Community engagement, discussions, polls

---

## 🤖 GPT-4o Prompt Engineering

### System Prompt Structure

```typescript
You are an expert LinkedIn ghostwriter specializing in authentic content.

CONTENT PILLAR: {pillarName}
DESCRIPTION: {pillarDescription}
TONE: {pillarTone}
TARGET AUDIENCE: {targetAudience}
CUSTOM INSTRUCTIONS: {customPrompt}

YOUR TASK:
Generate 3 LinkedIn post variants (A, B, C) that:
1. Match the user's authentic writing voice
2. Cover the topic thoroughly
3. Engage the target audience
4. Follow LinkedIn best practices

VARIANT STYLES:
- A: Narrative/storytelling
- B: Analytical/data-driven
- C: Conversational/question-based

STRUCTURE:
- Hook: 1-2 lines (stops the scroll)
- Body: 5-8 lines (insights, story, data)
- CTA: 1-2 lines (engagement request)
- Hashtags: 3-5 relevant tags
- Length: 200-600 characters

OUTPUT FORMAT: JSON
```

### User Prompt Structure

```typescript
TOPIC: {topicTitle}
DESCRIPTION: {topicDescription}

USER'S WRITING VOICE (study these examples):

Example 1:
{voiceExample1}

Example 2:
{voiceExample2}

Example 3:
{voiceExample3}

Now generate 3 variants matching this voice.
```

---

## 🎯 Voice Matching Algorithm

### How Voice Match Score Works

1. **Generate Embedding:** Convert draft text to 1536-dimensional vector
2. **Compare to Master:** Calculate cosine similarity with user's master voice profile
3. **Convert to Score:** Multiply similarity (0-1) by 100 to get percentage
4. **Rank Variants:** Sort by highest voice match

### Score Interpretation

- **90-100%:** Perfect match! Sounds exactly like you
- **80-89%:** Excellent match, highly authentic
- **70-79%:** Good match, minor adjustments may help
- **60-69%:** Fair match, consider regenerating
- **<60%:** Poor match, check voice examples quality

### Improving Voice Match

1. **Add more voice examples** (5-10 recommended)
2. **Use consistent writing style** in examples
3. **Match examples to pillar topic** when possible
4. **Ensure examples are authentic** (actually written by you)
5. **Remove outliers** (posts that don't represent your style)

---

## 💰 Cost Analysis

### GPT-4o Pricing (as of 2024)

**Per 1M Tokens:**
- Input: $2.50
- Output: $10.00

### Typical Generation Costs

**Average Draft Generation:**
- Input tokens: ~900 (prompt + examples)
- Output tokens: ~800 (3 variants)
- **Total cost: ~$0.0106 per generation**
- **~94 generations per $1**

**Monthly Estimates (per user):**
- Light usage (10 generations/month): ~$0.11
- Medium usage (50 generations/month): ~$0.53
- Heavy usage (200 generations/month): ~$2.12

**System Scale:**
- 1,000 users (avg 50 gen/mo): ~$530/month
- 10,000 users (avg 50 gen/mo): ~$5,300/month

### Cost Optimization Tips

1. **Cache voice examples** - Don't regenerate embeddings
2. **Limit prompt length** - Use 3-5 examples max
3. **Batch requests** - Generate multiple topics in one session
4. **Use temperature wisely** - 0.7 is balanced
5. **Set max_tokens limit** - Prevent runaway generations

---

## 📈 Performance Metrics

### Latency

**Breakdown:**
- Database queries: 100-200ms
- Voice embedding generation: 200-400ms per variant
- GPT-4o generation: 8-15 seconds
- Voice matching: 600-1200ms (3 variants)
- Database writes: 100-200ms

**Total:** 10-17 seconds per generation

### Optimization Strategies

1. **Parallel voice matching** - Calculate all 3 simultaneously
2. **Cache voice profile** - Store in Redis (1hr TTL)
3. **Batch embed requests** - Generate 3 embeddings together
4. **Async processing** - Move to background job for scale

---

## 🔒 Quality Assurance

### Automatic Validation

```typescript
✅ Character count: 50-3000
✅ Hook length: 10+ characters
✅ Body length: 50+ characters
✅ Hashtags: 0-10 tags
✅ Structure: Hook + Body + CTA present
```

### Content Safety

- OpenAI moderation API (automatic)
- Profanity filtering
- Brand safety checks
- LinkedIn TOS compliance

### Manual Review Flags

System flags for review if:
- Voice match < 60%
- Estimated engagement < 50% of average
- Contains sensitive keywords
- Duplicate content detected

---

## 🚀 API Usage

### Request

```bash
POST /api/topics/{topicId}/generate
Authorization: Bearer {clerk-token}
```

### Response

```json
{
  "success": true,
  "data": {
    "message": "3 draft variants generated successfully using GPT-4o",
    "drafts": [
      {
        "id": "uuid",
        "variantLetter": "A",
        "fullText": "...",
        "hook": "...",
        "body": "...",
        "cta": "...",
        "hashtags": ["MVP", "Startups"],
        "characterCount": 533,
        "estimatedEngagement": 42,
        "voiceMatchScore": 87,
        "style": "narrative",
        "status": "draft",
        "createdAt": "2026-02-09T..."
      }
      // B and C variants...
    ],
    "topic": {
      "id": "uuid",
      "content": "MVP validation for SaaS startups",
      "pillarName": "Product Development"
    },
    "metadata": {
      "model": "gpt-4o",
      "inputTokens": 896,
      "outputTokens": 831,
      "estimatedCost": 0.0106,
      "generationTime": 12388
    }
  }
}
```

### Error Responses

```json
// Not enough voice examples
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "You need at least 3 voice training examples"
  }
}

// Voice not trained
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Voice profile not trained. Please analyze your voice first"
  }
}

// Rate limit exceeded
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "OpenAI rate limit exceeded. Please try again in a few moments"
  }
}
```

---

## 🧪 Testing

### Test Generation Locally

```bash
# Run comprehensive test
npx tsx scripts/test-draft-generation.ts
```

**Expected output:**
```
✅ OpenAI connection successful
✅ Generated 3 unique variants
✅ Cost: $0.0106 per generation
✅ All variants passed validation
✅ Average voice match: 87%
```

### Test with cURL

```bash
# First, get a topic ID
curl http://localhost:3003/api/topics \
  -H "Authorization: Bearer {clerk-token}"

# Generate drafts
curl -X POST http://localhost:3003/api/topics/{topicId}/generate \
  -H "Authorization: Bearer {clerk-token}"
```

---

## 🎓 Best Practices

### For Best Results

1. **Train voice first** - Analyze 5-10 quality examples
2. **Match pillar to topic** - More relevant voice examples
3. **Provide context** - Use topic descriptions
4. **Review all variants** - Different styles resonate differently
5. **Iterate on feedback** - Learn from engagement data

### Common Pitfalls

❌ **Skipping voice training** - Results in generic, corporate tone
❌ **Using inconsistent examples** - Confuses the AI
❌ **Not providing pillar context** - Generic output
❌ **Accepting first draft** - Review all 3 variants!
❌ **Ignoring voice match scores** - Higher scores = more authentic

### Pro Tips

💡 **Use pillar-specific examples** - Voice varies by topic
💡 **A/B test different variants** - Track engagement metrics
💡 **Edit before posting** - AI is assistant, not replacement
💡 **Add personal touches** - Emoji, formatting, your flair
💡 **Retrain voice regularly** - Your style evolves

---

## 🔮 Future Enhancements

### Planned Features

- **Regenerate specific variant** - Don't like B? Regenerate just that one
- **Custom variant styles** - Define your own beyond A/B/C
- **Multi-language support** - Generate in any language
- **Image suggestions** - AI-recommended visuals
- **Optimal posting time** - Based on audience data
- **A/B testing mode** - Post variants, track performance
- **Learning from engagement** - Improve over time
- **Tone adjustment slider** - Make more formal/casual
- **Length preferences** - Short/medium/long variants

---

## 📞 Troubleshooting

### "Generation taking too long"
- Expected: 10-17 seconds
- Check OpenAI status: https://status.openai.com
- Verify network connection

### "Voice match scores too low"
- Add more voice training examples
- Ensure examples match pillar topic
- Review example quality (authentic?)
- Re-analyze voice profile

### "Drafts don't sound like me"
- Check voice confidence score (should be 80+)
- Ensure training examples are authentic
- Provide pillar-specific custom prompt
- Try regenerating with different examples

### "Cost higher than expected"
- Check input token count (reduce examples?)
- Verify max_tokens setting (1500 default)
- Monitor usage in OpenAI dashboard
- Consider caching voice profiles

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Generation success rate**
2. **Average voice match scores**
3. **Cost per generation**
4. **Generation latency**
5. **Variant selection preferences**
6. **Actual vs estimated engagement**

### Dashboard Metrics

```typescript
{
  totalGenerations: 1234,
  avgVoiceMatch: 85,
  avgCost: 0.0106,
  avgLatency: 12400,
  variantPreferences: {
    A: 35%, // Narrative
    B: 40%, // Analytical
    C: 25%  // Conversational
  }
}
```

---

**Last Updated:** February 9, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

*For more information, see:*
- `docs/AI-INTEGRATION.md` - Complete AI guide
- `lib/ai/generation.ts` - Source code
- `scripts/test-draft-generation.ts` - Test suite
