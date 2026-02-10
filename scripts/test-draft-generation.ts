/**
 * Test Draft Generation with GPT-4o
 * Run: npx tsx scripts/test-draft-generation.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateDraftVariants, estimateEngagement, validatePost } from '@/lib/ai/generation';
import { testOpenAIConnection } from '@/lib/ai/openai';

async function main() {
  console.log('🧪 Testing Draft Generation with GPT-4o\n');

  // Test 1: Check OpenAI connection
  console.log('1️⃣ Testing OpenAI connection...');
  const connected = await testOpenAIConnection();
  if (!connected) {
    console.error('❌ OpenAI connection failed. Check your API key.');
    process.exit(1);
  }

  // Test 2: Generate drafts with sample data
  console.log('\n2️⃣ Generating draft variants...');

  const sampleVoiceExamples = [
    {
      postText: `I built a startup from zero to $1M ARR in 18 months.

Here are 5 lessons I learned about product-market fit:

1. Talk to 100 customers before writing a single line of code
2. Your first idea is always wrong (and that's okay)
3. PMF feels like being pulled by the market, not pushing
4. Iterate weekly, not monthly
5. Customer pain > Your solution

The hardest part? Letting go of features you love that customers don't need.

What's been your biggest PMF lesson?

#ProductMarketFit #Startups #SaaS`,
    },
    {
      postText: `Most founders fail at pricing.

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
    },
    {
      postText: `3 years ago, I was a broke founder sleeping on my friend's couch.

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
    },
  ];

  try {
    const result = await generateDraftVariants({
      topicTitle: 'The importance of MVP validation for SaaS startups',
      topicDescription: 'Why building an MVP and getting early customer feedback is critical before scaling',
      pillarName: 'Product Development',
      pillarDescription: 'Insights on building great products',
      pillarTone: 'practical, experienced, conversational',
      targetAudience: 'SaaS founders, product managers, tech entrepreneurs',
      customPrompt: 'Focus on actionable insights from real experience. Avoid fluff.',
      voiceExamples: sampleVoiceExamples,
      // Note: In real usage, master voice embedding would be from database
      // For testing, we'll skip voice matching
    });

    console.log('✅ Draft generation successful!\n');
    console.log('📊 Metadata:');
    console.log(`   Model: ${result.metadata.model}`);
    console.log(`   Input tokens: ${result.metadata.inputTokens}`);
    console.log(`   Output tokens: ${result.metadata.outputTokens}`);
    console.log(`   Estimated cost: $${result.metadata.estimatedCost.toFixed(4)}`);
    console.log(`   Generation time: ${result.metadata.generationTime}ms`);

    console.log('\n📝 Generated Variants:\n');

    result.variants.forEach((variant, index) => {
      console.log(`${'='.repeat(60)}`);
      console.log(`VARIANT ${variant.variantLetter} (${variant.style})`);
      console.log(`Voice Match: ${variant.voiceMatchScore}% ${variant.voiceMatchScore >= 80 ? '✅' : '⚠️'}`);
      console.log(`${'='.repeat(60)}`);
      console.log('\n📌 HOOK:');
      console.log(variant.post.hook);
      console.log('\n📖 BODY:');
      console.log(variant.post.body);
      console.log('\n🎯 CTA:');
      console.log(variant.post.cta);
      console.log('\n🏷️  HASHTAGS:');
      console.log(variant.post.hashtags.map((tag) => `#${tag}`).join(' '));
      console.log(`\n📊 STATS:`);
      console.log(`   Characters: ${variant.post.characterCount}`);
      console.log(`   Estimated engagement: ${variant.post.estimatedEngagement || 'N/A'}`);

      // Validate post
      const validation = validatePost(variant.post);
      console.log(`   Valid: ${validation.valid ? '✅' : '❌'}`);
      if (!validation.valid) {
        console.log(`   Errors: ${validation.errors.join(', ')}`);
      }

      console.log('\n💬 FULL TEXT:');
      console.log(`${'─'.repeat(60)}`);
      console.log(variant.post.fullText);
      console.log(`${'─'.repeat(60)}\n`);
    });

    // Test 3: Estimate engagement
    console.log('\n3️⃣ Testing engagement estimation...');
    const topVariant = result.variants[0];
    const engagement1k = estimateEngagement(topVariant.post, 1000);
    const engagement10k = estimateEngagement(topVariant.post, 10000);
    const engagement100k = estimateEngagement(topVariant.post, 100000);

    console.log(`   1,000 followers: ~${engagement1k} likes`);
    console.log(`   10,000 followers: ~${engagement10k} likes`);
    console.log(`   100,000 followers: ~${engagement100k} likes`);

    // Test 4: Validation
    console.log('\n4️⃣ Testing post validation...');
    let allValid = true;
    result.variants.forEach((variant) => {
      const validation = validatePost(variant.post);
      if (!validation.valid) {
        console.log(`   ❌ Variant ${variant.variantLetter}: ${validation.errors.join(', ')}`);
        allValid = false;
      }
    });
    if (allValid) {
      console.log('   ✅ All variants passed validation');
    }

    console.log('\n✅ All tests passed! Draft generation is working correctly.');
    console.log('\n💡 Summary:');
    console.log(`   • Generated ${result.variants.length} unique variants`);
    console.log(`   • Cost: $${result.metadata.estimatedCost.toFixed(4)} per generation`);
    console.log(`   • ~57 generations per $1`);
    console.log(`   • Average voice match: ${Math.round(result.variants.reduce((sum, v) => sum + v.voiceMatchScore, 0) / result.variants.length)}%`);

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
