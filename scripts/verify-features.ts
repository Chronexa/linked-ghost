
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { generatedDrafts, users, classifiedTopics, pillars, conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('🧪 Starting Feature Verification Suite...');

    // 1. Setup Test Data
    console.log('\n--- 1. Setting up Test Data ---');
    // Find a real user/topic/pillar to use, or create mocks if needed.
    // Ideally we use a real user from the DB to avoid constraint errors.
    const user = await db.query.users.findFirst();
    if (!user) {
        console.error('❌ No users found in DB. Cannot run verification.');
        process.exit(1);
    }
    console.log(`✅ Using User: ${user.id}`);

    let pillar = await db.query.pillars.findFirst({ where: eq(pillars.userId, user.id) });
    if (!pillar) {
        console.log('⚠️ No pillars found. Creating mock pillar...');
        const [newPillar] = await db.insert(pillars).values({
            userId: user.id,
            name: 'Mock Pillar',
            slug: 'mock-pillar',
            status: 'active',
        }).returning();
        pillar = newPillar;
    }
    console.log(`✅ Using Pillar: ${pillar.id}`);

    let topic = await db.query.classifiedTopics.findFirst({ where: eq(classifiedTopics.userId, user.id) });
    if (!topic) {
        console.log('⚠️ No classified topics found. Creating mock topic...');
        const [newTopic] = await db.insert(classifiedTopics).values({
            userId: user.id,
            pillarId: pillar.id,
            pillarName: pillar.name,
            source: 'manual',
            content: 'Mock Topic Content for Verification',
            aiScore: 85,
            hookAngle: 'contrarian',
            status: 'classified',
        }).returning();
        topic = newTopic;
    }
    console.log(`✅ Using Topic: ${topic.id}`);

    const conversation = await db.query.conversations.findFirst({ where: eq(conversations.userId, user.id) });
    if (!conversation) {
        console.log('⚠️ No conversation found. Creating one...');
        // allow creates if missing
        const [newConv] = await db.insert(conversations).values({
            userId: user.id,
            title: 'Test Conversation',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        console.log(`✅ Created Test Conversation: ${newConv.id}`);
    } else {
        console.log(`✅ Using Conversation: ${conversation.id}`);
    }
    const conversationId = conversation?.id;


    // 2. Simulate Draft Creation (Generation)
    console.log('\n--- 2. Simulating Draft Generation ---');
    const [draft] = await db.insert(generatedDrafts).values({
        userId: user.id,
        conversationId: conversationId,
        topicId: topic.id,
        pillarId: pillar.id,
        userPerspective: 'Test perspective',
        variantLetter: 'A',
        fullText: 'Original Text Content',
        hook: 'Original Hook',
        body: 'Original Body',
        cta: 'Original CTA',
        hashtags: ['test'],
        characterCount: 100,
        estimatedEngagement: 50,
        status: 'draft',
    }).returning();
    console.log(`✅ Draft Created: ${draft.id} | Content: "${draft.fullText}"`);


    // 3. Verify Edit & Save
    console.log('\n--- 3. Verifying Edit & Save ---');
    const newText = 'Edited Text Content';
    await db.update(generatedDrafts)
        .set({ editedText: newText, updatedAt: new Date() })
        .where(eq(generatedDrafts.id, draft.id));

    const updatedDraft = await db.query.generatedDrafts.findFirst({
        where: eq(generatedDrafts.id, draft.id)
    });

    if (updatedDraft?.editedText === newText) {
        console.log(`✅ Edit Saved Successfully: "${updatedDraft.editedText}"`);
    } else {
        console.error(`❌ Edit Failed. Expected "${newText}", got "${updatedDraft?.editedText}"`);
    }

    // 4. Verify Regeneration (Simulation)
    // Regeneration effectively deletes old drafts for a topic and creates new ones.
    console.log('\n--- 4. Verifying Regeneration Logic (Delete & Re-create) ---');

    // Simulate "Regenerate" by deleting this draft and creating a new one
    await db.delete(generatedDrafts).where(eq(generatedDrafts.id, draft.id));
    const deletedDraftCheck = await db.query.generatedDrafts.findFirst({ where: eq(generatedDrafts.id, draft.id) });

    if (!deletedDraftCheck) {
        console.log('✅ Old Draft Deleted (Standard Regeneration Behavior)');
    } else {
        console.error('❌ Old Draft Not Deleted.');
    }

    const [regeneratedDraft] = await db.insert(generatedDrafts).values({
        userId: user.id,
        conversationId: conversationId,
        topicId: topic.id,
        pillarId: pillar.id,
        userPerspective: 'Regenerated perspective',
        variantLetter: 'A',
        fullText: 'Regenerated Text Content',
        hook: 'Regenerated Hook',
        body: 'Regenerated Body',
        cta: 'Regenerated CTA',
        hashtags: ['regen'],
        characterCount: 120,
        estimatedEngagement: 60,
        status: 'draft',
    }).returning();
    console.log(`✅ New Draft Created (Regenerated): ${regeneratedDraft.id}`);


    // 5. Verify Deletion
    console.log('\n--- 5. Verifying Deletion ---');
    await db.delete(generatedDrafts).where(eq(generatedDrafts.id, regeneratedDraft.id));
    const finalCheck = await db.query.generatedDrafts.findFirst({ where: eq(generatedDrafts.id, regeneratedDraft.id) });

    if (!finalCheck) {
        console.log('✅ Draft Permanently Deleted');
    } else {
        console.error('❌ Draft Deletion Failed');
    }

    console.log('\n🎉 Feature Suite Complete.');
    process.exit(0);
}

main().catch(console.error);
