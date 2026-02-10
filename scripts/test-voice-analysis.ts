/**
 * Test Voice Analysis with OpenAI Embeddings
 * Run: npx tsx scripts/test-voice-analysis.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '@/lib/db';
import { voiceExamples, profiles, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateEmbeddings, calculateVoiceConsistency, averageEmbedding, cosineSimilarity } from '@/lib/ai/embeddings';
import { testOpenAIConnection } from '@/lib/ai/openai';

async function main() {
  console.log('🧪 Testing Voice Analysis with OpenAI Embeddings\n');

  // Test 1: Check OpenAI connection
  console.log('1️⃣ Testing OpenAI connection...');
  const connected = await testOpenAIConnection();
  if (!connected) {
    console.error('❌ OpenAI connection failed. Check your API key.');
    process.exit(1);
  }

  // Test 2: Generate sample embeddings
  console.log('\n2️⃣ Testing embedding generation...');
  const sampleTexts = [
    'I built a startup from zero to $1M ARR in 18 months. Here are 5 lessons I learned about product-market fit.',
    'Product-market fit is not a destination, it\'s a journey. Here\'s what most founders get wrong about PMF.',
    'Three years ago, I struggled to find product-market fit. Today, our startup has 10,000+ paying customers. Here\'s our story.',
  ];

  try {
    const embeddings = await generateEmbeddings(sampleTexts);
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    console.log(`   Dimensions: ${embeddings[0].length}`);

    // Test 3: Calculate similarity
    console.log('\n3️⃣ Testing similarity calculation...');
    const similarity12 = cosineSimilarity(embeddings[0], embeddings[1]);
    const similarity13 = cosineSimilarity(embeddings[0], embeddings[2]);
    const similarity23 = cosineSimilarity(embeddings[1], embeddings[2]);

    console.log(`   Similarity (1 ↔ 2): ${(similarity12 * 100).toFixed(2)}%`);
    console.log(`   Similarity (1 ↔ 3): ${(similarity13 * 100).toFixed(2)}%`);
    console.log(`   Similarity (2 ↔ 3): ${(similarity23 * 100).toFixed(2)}%`);

    // Test 4: Calculate voice consistency
    console.log('\n4️⃣ Testing voice consistency score...');
    const consistencyScore = calculateVoiceConsistency(embeddings);
    console.log(`   Voice Consistency: ${consistencyScore}/100`);

    // Test 5: Calculate average embedding (voice profile)
    console.log('\n5️⃣ Testing voice profile creation...');
    const masterProfile = averageEmbedding(embeddings);
    console.log(`   Master Profile Dimensions: ${masterProfile.length}`);
    console.log(`   Profile created successfully ✅`);

    // Test 6: Test with real database (if user exists)
    console.log('\n6️⃣ Testing with database...');
    const allUsers = await db.select().from(users).limit(1);

    if (allUsers.length > 0) {
      const testUser = allUsers[0];
      console.log(`   Found test user: ${testUser.email}`);

      // Get voice examples
      const examples = await db
        .select()
        .from(voiceExamples)
        .where(eq(voiceExamples.userId, testUser.id));

      if (examples.length >= 3) {
        console.log(`   Found ${examples.length} voice examples`);
        console.log('   Analyzing...');

        const texts = examples.map((ex) => ex.postText);
        const exampleEmbeddings = await generateEmbeddings(texts);
        const score = calculateVoiceConsistency(exampleEmbeddings);
        const profile = averageEmbedding(exampleEmbeddings);

        console.log(`   ✅ Analysis complete!`);
        console.log(`   Voice Confidence Score: ${score}/100`);
        console.log(`   Master Profile: ${profile.length} dimensions`);

        // Update database
        console.log('   Updating database...');
        
        // Update individual embeddings
        await Promise.all(
          examples.map((example, index) =>
            db
              .update(voiceExamples)
              .set({ embedding: exampleEmbeddings[index] })
              .where(eq(voiceExamples.id, example.id))
          )
        );

        // Update profile
        await db
          .update(profiles)
          .set({
            voiceConfidenceScore: score,
            voiceEmbedding: profile,
            lastVoiceTrainingAt: new Date(),
          })
          .where(eq(profiles.userId, testUser.id));

        console.log(`   ✅ Database updated successfully!`);
      } else {
        console.log(`   ⚠️  User only has ${examples.length} examples (need 3+)`);
      }
    } else {
      console.log('   ℹ️  No users in database yet');
    }

    console.log('\n✅ All tests passed! Voice analysis is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
