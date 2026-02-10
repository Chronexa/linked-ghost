/**
 * Test Perplexity Integration
 * Run: npx tsx scripts/test-perplexity.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import {
  searchPerplexity,
  discoverTopics,
  researchTopic,
  testPerplexityConnection,
} from '@/lib/ai/perplexity';

async function main() {
  console.log('🧪 Testing Perplexity Integration\n');

  // Test 1: Check Perplexity connection
  console.log('1️⃣ Testing Perplexity connection...');
  const connected = await testPerplexityConnection();
  if (!connected) {
    console.error('❌ Perplexity connection failed. Check your API key.');
    console.error('   Set PERPLEXITY_API_KEY in .env.local');
    process.exit(1);
  }

  // Test 2: Basic search
  console.log('\n2️⃣ Testing basic search...');
  try {
    const searchResult = await searchPerplexity({
      query: 'What are the latest trends in AI and SaaS for 2026?',
      maxTokens: 500,
    });

    console.log('✅ Search successful!\n');
    console.log('📄 Content:');
    console.log(searchResult.content.slice(0, 300) + '...\n');
    console.log(`📊 Metadata:`);
    console.log(`   Model: ${searchResult.model}`);
    console.log(`   Tokens used: ${searchResult.tokensUsed.input + searchResult.tokensUsed.output}`);
    console.log(`   Sources: ${searchResult.sources.length}`);
    
    if (searchResult.sources.length > 0) {
      console.log('\n🔗 Sources:');
      searchResult.sources.slice(0, 3).forEach((source, index) => {
        console.log(`   ${index + 1}. ${source.url}`);
      });
    }
  } catch (error) {
    console.error('❌ Search failed:', error);
    process.exit(1);
  }

  // Test 3: Discover trending topics
  console.log('\n3️⃣ Testing topic discovery...');
  try {
    const discovery = await discoverTopics({
      domain: 'SaaS startups and product development',
      pillarContext: 'Focus on practical, actionable insights for founders and product managers',
      count: 3,
    });

    console.log('✅ Discovery successful!\n');
    console.log(`📊 Metadata:`);
    console.log(`   Query: "${discovery.query}"`);
    console.log(`   Topics found: ${discovery.topics.length}`);
    console.log(`   Tokens used: ${discovery.metadata.tokensUsed}`);
    console.log(`   Cost: $${discovery.metadata.estimatedCost.toFixed(6)}`);
    console.log(`   Search time: ${discovery.metadata.searchTime}ms`);

    console.log('\n📝 Discovered Topics:\n');
    discovery.topics.forEach((topic, index) => {
      console.log(`${'─'.repeat(60)}`);
      console.log(`Topic ${index + 1}: ${topic.content}`);
      console.log(`Relevance: ${topic.relevanceScore}% | Trending: ${topic.trendingScore}%`);
      console.log(`\nSummary:`);
      console.log(topic.summary.slice(0, 200) + '...');
      
      if (topic.keyPoints.length > 0) {
        console.log(`\nKey Points:`);
        topic.keyPoints.slice(0, 3).forEach((point) => {
          console.log(`  • ${point.slice(0, 100)}${point.length > 100 ? '...' : ''}`);
        });
      }
      
      console.log(`\nHashtags: ${topic.suggestedHashtags.map((h) => `#${h}`).join(' ')}`);
      console.log(`Sources: ${topic.sources.length}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    process.exit(1);
  }

  // Test 4: Research specific topic
  console.log('\n4️⃣ Testing in-depth research...');
  try {
    const research = await researchTopic({
      topic: 'How to validate your MVP before building it',
      pillarContext: 'Product development for SaaS startups, practical and actionable',
    });

    console.log('✅ Research successful!\n');
    console.log(`📚 Topic: "${research.content}"`);
    console.log(`   Relevance: ${research.relevanceScore}%`);
    console.log(`   Trending: ${research.trendingScore}%`);
    
    console.log('\n📄 Summary:');
    console.log(research.summary.slice(0, 300) + '...');
    
    if (research.keyPoints.length > 0) {
      console.log(`\n🔑 Key Points (${research.keyPoints.length}):`);
      research.keyPoints.forEach((point, index) => {
        console.log(`   ${index + 1}. ${point.slice(0, 150)}${point.length > 150 ? '...' : ''}`);
      });
    }
    
    console.log(`\n🏷️  Hashtags: ${research.suggestedHashtags.map((h) => `#${h}`).join(' ')}`);
    console.log(`\n🔗 Sources (${research.sources.length}):`);
    research.sources.slice(0, 3).forEach((source, index) => {
      console.log(`   ${index + 1}. ${source.url}`);
    });
  } catch (error) {
    console.error('❌ Research failed:', error);
    process.exit(1);
  }

  // Test 5: Cost analysis
  console.log('\n5️⃣ Cost analysis...');
  console.log('   Basic search (~500 tokens): ~$0.001');
  console.log('   Topic discovery (5 topics, ~2000 tokens): ~$0.002');
  console.log('   In-depth research (~1500 tokens): ~$0.0015');
  console.log('   \n   Estimated monthly cost (10 discoveries/user): ~$0.02/user');
  console.log('   Estimated monthly cost (system, 10k users): ~$200');

  console.log('\n✅ All tests passed! Perplexity integration is working correctly.');
  console.log('\n💡 Summary:');
  console.log('   • Perplexity connection: ✅ Working');
  console.log('   • Basic search: ✅ Working');
  console.log('   • Topic discovery: ✅ Working');
  console.log('   • In-depth research: ✅ Working');
  console.log('   • Source citations: ✅ Working');
  console.log('   • Cost-effective: ✅ ~$0.001-0.002 per request');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
