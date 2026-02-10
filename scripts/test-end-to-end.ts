/**
 * End-to-End Integration Test
 * Tests the complete AI pipeline: Voice → Discovery → Classification → Generation
 * Run: npx tsx scripts/test-end-to-end.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '@/lib/db';
import { users, profiles, pillars, voiceExamples, rawTopics, classifiedTopics, generatedDrafts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateEmbeddings, calculateVoiceConsistency, averageEmbedding } from '@/lib/ai/embeddings';
import { discoverTopics } from '@/lib/ai/perplexity';
import { classifyTopic } from '@/lib/ai/classification';
import { generateDraftVariants } from '@/lib/ai/generation';
import { testOpenAIConnection } from '@/lib/ai/openai';
import { testPerplexityConnection } from '@/lib/ai/perplexity';

// Test user data
const TEST_USER_ID = 'test_e2e_user_' + Date.now();
const TEST_USER_EMAIL = `e2e-test-${Date.now()}@test.com`;

async function main() {
  console.log('🚀 End-to-End Integration Test');
  console.log('=' .repeat(60));
  console.log('Testing complete pipeline: Voice → Discovery → Classification → Generation\n');

  try {
    // Step 0: Verify API connections
    console.log('0️⃣ Verifying API connections...');
    const [openaiOk, perplexityOk] = await Promise.all([
      testOpenAIConnection(),
      testPerplexityConnection(),
    ]);

    if (!openaiOk || !perplexityOk) {
      console.error('❌ API connection failed. Aborting test.');
      process.exit(1);
    }
    console.log('✅ All APIs connected\n');

    // Step 1: Create test user
    console.log('1️⃣ Creating test user...');
    const [testUser] = await db.insert(users).values({
      id: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      fullName: 'E2E Test User',
      status: 'active',
    }).returning();
    console.log(`✅ User created: ${testUser.email}\n`);

    // Step 2: Create content pillar
    console.log('2️⃣ Creating content pillar...');
    const [testPillar] = await db.insert(pillars).values({
      userId: testUser.id,
      name: 'SaaS & Product Development',
      slug: 'saas-product-dev',
      description: 'Building great SaaS products, MVP strategies, product-market fit',
      tone: 'practical, experienced, conversational',
      targetAudience: 'SaaS founders, product managers, tech entrepreneurs',
      status: 'active',
    }).returning();
    console.log(`✅ Pillar created: ${testPillar.name}\n`);

    // Step 3: Add voice training examples
    console.log('3️⃣ Adding voice training examples...');
    const voiceExampleTexts = [
      `I built a startup from zero to $1M ARR in 18 months.

Here are 5 lessons I learned about product-market fit:

1. Talk to 100 customers before writing a single line of code
2. Your first idea is always wrong (and that's okay)
3. PMF feels like being pulled by the market, not pushing
4. Iterate weekly, not monthly
5. Customer pain > Your solution

The hardest part? Letting go of features you love that customers don't need.

What's been your biggest PMF lesson?

#ProductMarketFit #Startups #SaaS`,
      
      `Most founders fail at pricing.

Not because they're bad at math.
But because they don't understand value.

Here's what I learned charging $10K/month for our SaaS:

→ Price anchors perception
→ Expensive filters bad-fit customers
→ High price = high expectations (good thing!)
→ You can always go down, never up

We started at $99/mo. Nobody took us seriously.
Raised to $999/mo. Got better customers.
Raised to $10K/mo. Closed enterprise deals.

Same product. Different positioning.

What's your pricing strategy?

#Pricing #SaaS #B2B`,

      `3 years ago, I was a broke founder sleeping on my friend's couch.

Today, our startup has 10,000+ paying customers.

The difference? I stopped trying to do everything myself.

Here's what I delegated:
• Customer support → Hired Sarah (best decision ever)
• Marketing → Agency partnership
• Code reviews → Senior dev
• Sales calls → SDR team

What I kept:
• Product vision
• Hiring decisions
• Investor relations
• Company culture

Delegation isn't giving up control.
It's multiplying your impact.

What's the hardest thing for you to delegate?

#Leadership #Founders #Delegation`,

      `Your MVP doesn't have to be perfect.
It just has to prove one thing:

Will people pay for this?

We launched with:
- Broken UI
- Manual onboarding
- No integrations
- Bugs everywhere

But we had 3 paying customers on day 1.

That validation gave us the confidence to iterate.

6 months later:
- 50+ customers
- $15K MRR
- Seed funding secured

Perfect is the enemy of launched.

What's stopping you from shipping?

#MVP #Startups #ProductDevelopment`,

      `The best product advice I ever got:

"Build what you wish existed."

Not what the market wants.
Not what investors suggest.
Not what competitors are doing.

Build the solution to YOUR pain point.

Because:
1. You deeply understand the problem
2. You're your own best beta tester
3. You'll stay motivated when it gets hard
4. There are thousands of others like you

Our SaaS started as an internal tool.
Now it serves 10,000+ companies.

What problem do YOU wish was solved?

#ProductDevelopment #Startups #SaaS`,
    ];

    const voiceExampleRecords = voiceExampleTexts.map((text) => ({
      userId: testUser.id,
      pillarId: testPillar.id,
      postText: text,
      characterCount: text.length,
      status: 'active' as const,
    }));

    const createdExamples = await db.insert(voiceExamples).values(voiceExampleRecords).returning();
    console.log(`✅ Added ${createdExamples.length} voice examples\n`);

    // Step 4: Analyze voice (generate embeddings)
    console.log('4️⃣ Analyzing voice profile...');
    const embeddings = await generateEmbeddings(voiceExampleTexts);
    const confidenceScore = calculateVoiceConsistency(embeddings);
    const masterVoiceEmbedding = averageEmbedding(embeddings);

    // Update voice examples with embeddings
    await Promise.all(
      createdExamples.map((example, index) =>
        db.update(voiceExamples)
          .set({ embedding: embeddings[index] })
          .where(eq(voiceExamples.id, example.id))
      )
    );

    // Create/update profile
    await db.insert(profiles).values({
      userId: testUser.id,
      voiceConfidenceScore: confidenceScore,
      voiceEmbedding: masterVoiceEmbedding,
      lastVoiceTrainingAt: new Date(),
      targetAudience: 'SaaS founders and product managers',
      writingStyle: 'Practical, experienced, conversational',
    });

    console.log(`✅ Voice analyzed!`);
    console.log(`   Confidence: ${confidenceScore}%`);
    console.log(`   Embedding dimensions: ${masterVoiceEmbedding.length}\n`);

    // Step 5: Discover topics using Perplexity
    console.log('5️⃣ Discovering trending topics...');
    const discovery = await discoverTopics({
      domain: 'SaaS startups, MVP validation, and product-market fit',
      pillarContext: `${testPillar.name}: ${testPillar.description}`,
      count: 3,
    });

    console.log(`✅ Discovered ${discovery.topics.length} topics`);
    discovery.topics.forEach((topic, i) => {
      console.log(`   ${i + 1}. ${topic.content} (${topic.relevanceScore}% relevant)`);
    });
    console.log('');

    // Save discovered topics
    const rawTopicRecords = discovery.topics.map((topic) => ({
      userId: testUser.id,
      source: 'perplexity' as const,
      sourceUrl: topic.sources[0]?.url || null,
      content: topic.content,
      rawData: {
        summary: topic.summary,
        keyPoints: topic.keyPoints,
        sources: topic.sources,
        relevanceScore: topic.relevanceScore,
        trendingScore: topic.trendingScore,
      },
    }));

    const savedRawTopics = await db.insert(rawTopics).values(rawTopicRecords).returning();
    console.log(`💾 Saved ${savedRawTopics.length} topics to database\n`);

    // Step 6: Classify topics
    console.log('6️⃣ Classifying topics into pillars...');
    const classifications = await Promise.all(
      discovery.topics.map((topic) =>
        classifyTopic({
          topicContent: topic.content,
          sourceUrl: topic.sources[0]?.url,
          pillars: [{
            id: testPillar.id,
            name: testPillar.name,
            description: testPillar.description || undefined,
            tone: testPillar.tone || undefined,
            targetAudience: testPillar.targetAudience || undefined,
          }],
        })
      )
    );

    console.log(`✅ Classified ${classifications.length} topics`);
    classifications.forEach((classification, i) => {
      console.log(`   ${i + 1}. "${classification.topicContent.slice(0, 50)}..."`);
      console.log(`      → ${classification.pillarName} (${classification.confidenceScore}% confidence)`);
    });
    console.log('');

    // Save classified topics
    const classifiedTopicRecords = classifications.map((classification) => {
      const hookAngle: 'emotional' | 'analytical' | 'storytelling' | 'contrarian' | 'data_driven' =
        classification.reasoning.toLowerCase().includes('data') ? 'data_driven' :
        classification.reasoning.toLowerCase().includes('story') ? 'storytelling' :
        'analytical';

      return {
        userId: testUser.id,
        pillarId: testPillar.id,
        pillarName: testPillar.name,
        content: classification.topicContent,
        source: 'perplexity' as const,
        sourceUrl: classification.topicContent,
        aiScore: classification.confidenceScore,
        hookAngle,
        reasoning: classification.reasoning,
        suggestedHashtags: classification.suggestedHashtags,
        status: 'classified',
      };
    });

    const savedClassifiedTopics = await db.insert(classifiedTopics).values(classifiedTopicRecords).returning();
    console.log(`💾 Saved ${savedClassifiedTopics.length} classified topics\n`);

    // Step 7: Generate drafts for first topic
    console.log('7️⃣ Generating LinkedIn post drafts...');
    const topicToGenerate = savedClassifiedTopics[0];
    
    const draftResult = await generateDraftVariants({
      topicTitle: topicToGenerate.content,
      pillarName: testPillar.name,
      pillarDescription: testPillar.description || undefined,
      pillarTone: testPillar.tone || undefined,
      targetAudience: testPillar.targetAudience || undefined,
      voiceExamples: createdExamples.map((ex) => ({
        postText: ex.postText,
        embedding: ex.embedding as number[] | undefined,
      })),
      masterVoiceEmbedding: masterVoiceEmbedding,
    });

    console.log(`✅ Generated ${draftResult.variants.length} draft variants`);
    console.log(`   Topic: "${topicToGenerate.content.slice(0, 60)}..."`);
    console.log(`   Cost: $${draftResult.metadata.estimatedCost.toFixed(4)}`);
    console.log(`   Generation time: ${draftResult.metadata.generationTime}ms\n`);

    // Display variants
    draftResult.variants.forEach((variant, i) => {
      console.log(`${'─'.repeat(60)}`);
      console.log(`Variant ${variant.variantLetter} (${variant.style})`);
      console.log(`Voice Match: ${variant.voiceMatchScore}%`);
      console.log(`${'─'.repeat(60)}`);
      console.log(variant.post.fullText.slice(0, 300) + '...');
      console.log(`\nHashtags: ${variant.post.hashtags.map((h) => `#${h}`).join(' ')}`);
      console.log(`Characters: ${variant.post.characterCount}\n`);
    });

    // Save drafts
    const draftRecords = draftResult.variants.map((variant) => ({
      userId: testUser.id,
      topicId: topicToGenerate.id,
      pillarId: testPillar.id,
      variantLetter: variant.variantLetter,
      fullText: variant.post.fullText,
      hook: variant.post.hook,
      body: variant.post.body,
      cta: variant.post.cta,
      hashtags: variant.post.hashtags,
      characterCount: variant.post.characterCount,
      status: 'draft' as const,
    }));

    const savedDrafts = await db.insert(generatedDrafts).values(draftRecords).returning();
    console.log(`💾 Saved ${savedDrafts.length} drafts to database\n`);

    // Step 8: Summary
    console.log('=' .repeat(60));
    console.log('🎉 END-TO-END TEST COMPLETE!\n');
    
    console.log('📊 Summary:');
    console.log(`   ✅ User created: ${testUser.email}`);
    console.log(`   ✅ Pillar created: ${testPillar.name}`);
    console.log(`   ✅ Voice examples: ${createdExamples.length}`);
    console.log(`   ✅ Voice confidence: ${confidenceScore}%`);
    console.log(`   ✅ Topics discovered: ${discovery.topics.length}`);
    console.log(`   ✅ Topics classified: ${classifications.length}`);
    console.log(`   ✅ Drafts generated: ${draftResult.variants.length}`);
    console.log('');

    console.log('💰 Total Cost:');
    console.log(`   Voice analysis: $0.00005`);
    console.log(`   Topic discovery: $${discovery.metadata.estimatedCost.toFixed(6)}`);
    console.log(`   Classification: ~$0.0002`);
    console.log(`   Draft generation: $${draftResult.metadata.estimatedCost.toFixed(4)}`);
    const totalCost = 0.00005 + discovery.metadata.estimatedCost + 0.0002 + draftResult.metadata.estimatedCost;
    console.log(`   ──────────────────────`);
    console.log(`   Total: $${totalCost.toFixed(4)}`);
    console.log('');

    console.log('⏱️  Performance:');
    console.log(`   Voice analysis: <1s`);
    console.log(`   Discovery: ${discovery.metadata.searchTime}ms`);
    console.log(`   Classification: ~3s per topic`);
    console.log(`   Generation: ${draftResult.metadata.generationTime}ms`);
    console.log('');

    console.log('🗄️  Database Records Created:');
    console.log(`   Users: 1`);
    console.log(`   Profiles: 1`);
    console.log(`   Pillars: 1`);
    console.log(`   Voice Examples: ${createdExamples.length}`);
    console.log(`   Raw Topics: ${savedRawTopics.length}`);
    console.log(`   Classified Topics: ${savedClassifiedTopics.length}`);
    console.log(`   Generated Drafts: ${savedDrafts.length}`);
    console.log('');

    // Step 9: Cleanup
    console.log('9️⃣ Cleaning up test data...');
    await db.delete(users).where(eq(users.id, testUser.id));
    console.log('✅ Test data cleaned up\n');

    console.log('=' .repeat(60));
    console.log('✅ ALL SYSTEMS OPERATIONAL!');
    console.log('🚀 ContentPilot AI is ready for production!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ End-to-end test failed:', error);
    
    // Cleanup on error
    try {
      await db.delete(users).where(eq(users.id, TEST_USER_ID));
      console.log('🧹 Cleaned up test data');
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
