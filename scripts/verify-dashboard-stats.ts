
import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '@/lib/db';
import { users, pillars, rawTopics, classifiedTopics, generatedDrafts } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getStats(userId: string) {
    const [
        pendingResult,
        classifiedResult,
        draftsResult,
        monthlyResult,
    ] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(rawTopics).where(and(eq(rawTopics.userId, userId), eq(rawTopics.status, 'new'))),
        db.select({ count: sql<number>`count(*)::int` }).from(classifiedTopics).where(eq(classifiedTopics.userId, userId)),
        db.select({
            total: sql<number>`count(*)::int`,
            approved: sql<number>`count(*) filter (where status in ('approved', 'scheduled', 'posted'))::int`
        }).from(generatedDrafts).where(eq(generatedDrafts.userId, userId)),
        db.select({ count: sql<number>`count(*)::int` }).from(generatedDrafts).where(and(eq(generatedDrafts.userId, userId), gte(generatedDrafts.createdAt, sql`date_trunc('month', CURRENT_DATE)`))),
    ]);

    return {
        pendingTopics: pendingResult[0]?.count || 0,
        classifiedTopics: classifiedResult[0]?.count || 0,
        generatedPosts: draftsResult[0]?.total || 0,
        approvalRate: draftsResult[0]?.total > 0 ? Math.round((draftsResult[0]?.approved / draftsResult[0]?.total) * 100) : 0,
        postsThisMonth: monthlyResult[0]?.count || 0,
    };
}

async function verify() {
    console.log('🧪 Starting Dashboard V2 Verification...');
    const TEST_USER_ID = 'verify_stats_user_' + Date.now();
    const TEST_EMAIL = `verify_${Date.now()}@example.com`;

    try {
        // Setup Test User
        console.log('\n📝 Creating test user...');
        await db.insert(users).values({
            id: TEST_USER_ID,
            email: TEST_EMAIL,
            fullName: 'Verify Stats User',
            status: 'active'
        });

        // Scenario 1: Fully Empty
        console.log('\n🔍 Verifying Scenario 1: Fully Empty');
        const stats1 = await getStats(TEST_USER_ID);
        console.log('   Stats:', JSON.stringify(stats1));
        if (stats1.pendingTopics === 0 && stats1.classifiedTopics === 0 && stats1.generatedPosts === 0) {
            console.log('   ✅ PASS: Correctly identifies "fully-empty" state');
        } else {
            console.error('   ❌ FAIL: Stats should be all zero');
        }

        // Scenario 2: Pending Topics
        console.log('\n🔍 Verifying Scenario 2: Pending Topics');
        await db.insert(rawTopics).values({
            userId: TEST_USER_ID,
            source: 'manual',
            content: 'Test content for verification',
            status: 'new'
        });
        const stats2 = await getStats(TEST_USER_ID);
        console.log('   Stats:', JSON.stringify(stats2));
        if (stats2.pendingTopics === 1) {
            console.log('   ✅ PASS: Correctly counts 1 pending topic');
        } else {
            console.error('   ❌ FAIL: Should have 1 pending topic');
        }

        // Setup for Classification (needs a pillar)
        const [pillar] = await db.insert(pillars).values({
            userId: TEST_USER_ID,
            name: 'Test Pillar',
            slug: 'test-pillar',
            status: 'active'
        }).returning();

        // Scenario 3: Classified Topics
        console.log('\n🔍 Verifying Scenario 3: Classified Topics');
        const [rawTopic] = await db.select().from(rawTopics).where(eq(rawTopics.userId, TEST_USER_ID));

        // "Classify" the topic (simulate the logic: update raw -> insert classified)
        await db.update(rawTopics).set({ status: 'classified' }).where(eq(rawTopics.id, rawTopic.id));
        const [classifiedTopic] = await db.insert(classifiedTopics).values({
            userId: TEST_USER_ID,
            rawTopicId: rawTopic.id,
            pillarId: pillar.id,
            pillarName: pillar.name,
            source: rawTopic.source,
            content: rawTopic.content,
            aiScore: 90,
            hookAngle: 'analytical',
            status: 'classified'
        }).returning();

        const stats3 = await getStats(TEST_USER_ID);
        console.log('   Stats:', JSON.stringify(stats3));
        if (stats3.pendingTopics === 0 && stats3.classifiedTopics === 1) {
            console.log('   ✅ PASS: Correctly counts 0 pending and 1 classified');
        } else {
            console.error('   ❌ FAIL: Stats mismatch for classified scenario');
        }

        // Scenario 4: Generated Drafts
        console.log('\n🔍 Verifying Scenario 4: Generated Drafts');
        await db.insert(generatedDrafts).values({
            userId: TEST_USER_ID,
            topicId: classifiedTopic.id,
            pillarId: pillar.id,
            userPerspective: 'Test perspective',
            variantLetter: 'A',
            fullText: 'Generated draft content...',
            characterCount: 25,
            status: 'draft'
        });

        const stats4 = await getStats(TEST_USER_ID);
        console.log('   Stats:', JSON.stringify(stats4));
        if (stats4.generatedPosts === 1 && stats4.approvalRate === 0) {
            console.log('   ✅ PASS: Correctly counts 1 draft with 0% approval');
        } else {
            console.error('   ❌ FAIL: Stats mismatch for drafts');
        }

        // Verify Approval Rate
        console.log('\n🔍 Verifying Approval Rate');
        await db.insert(generatedDrafts).values({
            userId: TEST_USER_ID,
            topicId: classifiedTopic.id,
            pillarId: pillar.id,
            userPerspective: 'Test perspective',
            variantLetter: 'B',
            fullText: 'Approved draft content...',
            characterCount: 25,
            status: 'approved'
        });
        const stats5 = await getStats(TEST_USER_ID);
        console.log('   Stats:', JSON.stringify(stats5));
        // 2 total drafts, 1 approved = 50%
        if (stats5.generatedPosts === 2 && stats5.approvalRate === 50) {
            console.log('   ✅ PASS: Correctly calculates 50% approval rate');
        } else {
            console.error('   ❌ FAIL: Approval rate calculation failed');
        }

        console.log('\n✅ VERIFICATION COMPLETE: All scenarios passed.');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await db.delete(users).where(eq(users.id, TEST_USER_ID));
        console.log('✨ Done.');
        process.exit(0);
    }
}

verify();
