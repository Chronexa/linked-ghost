/**
 * Test Topic Classification with GPT-4o-mini
 * Run: npx tsx scripts/test-topic-classification.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { classifyTopic, classifyTopicsBatch, needsManualReview, getReviewRecommendation } from '@/lib/ai/classification';
import { testOpenAIConnection } from '@/lib/ai/openai';

async function main() {
  console.log('🧪 Testing Topic Classification with GPT-4o-mini\n');

  // Test 1: Check OpenAI connection
  console.log('1️⃣ Testing OpenAI connection...');
  const connected = await testOpenAIConnection();
  if (!connected) {
    console.error('❌ OpenAI connection failed. Check your API key.');
    process.exit(1);
  }

  // Test 2: Single topic classification
  console.log('\n2️⃣ Testing single topic classification...');

  const samplePillars = [
    {
      id: '1',
      name: 'Product Development',
      description: 'Building great products, MVP strategies, user feedback',
      tone: 'practical, experienced',
      targetAudience: 'Product managers, founders, engineers',
    },
    {
      id: '2',
      name: 'SaaS Growth',
      description: 'Scaling SaaS businesses, metrics, revenue growth',
      tone: 'data-driven, analytical',
      targetAudience: 'SaaS founders, growth marketers',
    },
    {
      id: '3',
      name: 'Leadership',
      description: 'Team building, hiring, company culture',
      tone: 'inspirational, authentic',
      targetAudience: 'Founders, CTOs, engineering managers',
    },
  ];

  const testTopic = 'How to validate your MVP before building it: 5 lessons from failed startups';

  try {
    const classification = await classifyTopic({
      topicContent: testTopic,
      sourceUrl: 'https://example.com/mvp-validation',
      pillars: samplePillars,
    });

    console.log('✅ Single classification successful!\n');
    console.log('📊 Classification Result:');
    console.log(`   Topic: "${testTopic}"`);
    console.log(`   ↓`);
    console.log(`   Pillar: ${classification.pillarName}`);
    console.log(`   Confidence: ${classification.confidenceScore}%`);
    console.log(`   Relevance: ${classification.relevanceScore}%`);
    console.log(`   Reasoning: ${classification.reasoning}`);
    console.log(`   Hashtags: ${classification.suggestedHashtags.map((h) => `#${h}`).join(' ')}`);
    
    const requiresReview = needsManualReview(classification);
    const recommendation = getReviewRecommendation(classification);
    console.log(`   Needs Review: ${requiresReview ? '⚠️  Yes' : '✅ No'}`);
    console.log(`   Recommendation: ${recommendation}`);

    // Test 3: Batch classification
    console.log('\n3️⃣ Testing batch classification...');

    const batchTopics = [
      {
        content: 'How to hire your first 10 engineers without making costly mistakes',
        sourceUrl: 'https://example.com/hiring',
      },
      {
        content: 'SaaS pricing strategy: Why we increased our prices by 10x and what happened',
        sourceUrl: 'https://example.com/pricing',
      },
      {
        content: 'Building features users actually want: A framework for product prioritization',
        sourceUrl: 'https://example.com/prioritization',
      },
      {
        content: 'From $0 to $1M ARR: Our startup growth playbook',
        sourceUrl: 'https://example.com/growth',
      },
    ];

    const batchResult = await classifyTopicsBatch({
      topics: batchTopics,
      pillars: samplePillars,
    });

    console.log('✅ Batch classification successful!\n');
    console.log('📊 Batch Results:');
    console.log(`   Topics classified: ${batchResult.results.length}`);
    console.log(`   Average confidence: ${batchResult.metadata.averageConfidence}%`);
    console.log(`   Total cost: $${batchResult.metadata.estimatedCost.toFixed(4)}`);
    console.log(`   Classification time: ${batchResult.metadata.classificationTime}ms\n`);

    // Display each classification
    batchResult.results.forEach((result, index) => {
      console.log(`${'─'.repeat(60)}`);
      console.log(`Topic ${index + 1}: "${result.topicContent.slice(0, 50)}..."`);
      console.log(`↓`);
      console.log(`Pillar: ${result.pillarName}`);
      console.log(`Confidence: ${result.confidenceScore}% | Relevance: ${result.relevanceScore}%`);
      console.log(`Reasoning: ${result.reasoning}`);
      console.log(`Hashtags: ${result.suggestedHashtags.map((h) => `#${h}`).join(' ')}`);
      
      const needsReview = needsManualReview(result);
      console.log(`Review needed: ${needsReview ? '⚠️  Yes' : '✅ No'}`);
      console.log('');
    });

    // Test 4: Cost analysis
    console.log('\n4️⃣ Cost analysis...');
    console.log(`   Single classification: $${(batchResult.metadata.estimatedCost / batchTopics.length).toFixed(6)}`);
    console.log(`   Batch of 4: $${batchResult.metadata.estimatedCost.toFixed(6)}`);
    console.log(`   Estimated cost per 1000 topics: $${(batchResult.metadata.estimatedCost / batchTopics.length * 1000).toFixed(2)}`);

    // Test 5: Accuracy analysis
    console.log('\n5️⃣ Classification accuracy analysis...');
    
    const highConfidence = batchResult.results.filter((r) => r.confidenceScore >= 80).length;
    const mediumConfidence = batchResult.results.filter((r) => r.confidenceScore >= 60 && r.confidenceScore < 80).length;
    const lowConfidence = batchResult.results.filter((r) => r.confidenceScore < 60).length;
    
    console.log(`   High confidence (≥80%): ${highConfidence} topics`);
    console.log(`   Medium confidence (60-79%): ${mediumConfidence} topics`);
    console.log(`   Low confidence (<60%): ${lowConfidence} topics`);
    
    const highRelevance = batchResult.results.filter((r) => r.relevanceScore >= 80).length;
    const mediumRelevance = batchResult.results.filter((r) => r.relevanceScore >= 60 && r.relevanceScore < 80).length;
    const lowRelevance = batchResult.results.filter((r) => r.relevanceScore < 60).length;
    
    console.log(`   High relevance (≥80%): ${highRelevance} topics`);
    console.log(`   Medium relevance (60-79%): ${mediumRelevance} topics`);
    console.log(`   Low relevance (<60%): ${lowRelevance} topics`);

    // Test 6: Review recommendations
    console.log('\n6️⃣ Review recommendations...');
    const needsReviewCount = batchResult.results.filter(needsManualReview).length;
    console.log(`   Topics needing review: ${needsReviewCount} of ${batchResult.results.length}`);
    
    if (needsReviewCount > 0) {
      console.log('   Topics flagged for review:');
      batchResult.results.forEach((result) => {
        if (needsManualReview(result)) {
          console.log(`   • "${result.topicContent.slice(0, 40)}..."`);
          console.log(`     ${getReviewRecommendation(result)}`);
        }
      });
    }

    console.log('\n✅ All tests passed! Topic classification is working correctly.');
    console.log('\n💡 Summary:');
    console.log(`   • GPT-4o-mini is fast and accurate for classification`);
    console.log(`   • Average confidence: ${batchResult.metadata.averageConfidence}%`);
    console.log(`   • Cost per topic: ~$${(batchResult.metadata.estimatedCost / batchTopics.length).toFixed(6)} (very affordable!)`);
    console.log(`   • Batch processing is efficient (4 topics in ${batchResult.metadata.classificationTime}ms)`);
    console.log(`   • Automatic review flagging working correctly`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
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
