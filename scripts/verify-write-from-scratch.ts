
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { generatedDrafts, users, pillars, classifiedTopics, conversationMessages, conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function main() {
    console.log('🧪 Verifying Write-From-Scratch Backend Flow...');

    try {
        // 1. Setup Data
        const user = await db.query.users.findFirst();
        if (!user) throw new Error('No user found');
        const pillar = await db.query.pillars.findFirst({ where: eq(pillars.userId, user.id) });
        if (!pillar) throw new Error('No pillar found');

        console.log(`👤 Using User: ${user.id}`);
        console.log(`🏛️ Using Pillar: ${pillar.id}`);

        const conversationId = randomUUID();
        // Create a dummy conversation first (schema requirement)
        await db.insert(conversations).values({
            id: conversationId,
            userId: user.id,
            title: 'Test Scratch Conversation'
        });

        // 2. Simulate "Classified Topic" Creation (Ad-hoc)
        const rawThoughts = "These are my raw thoughts for verification.";
        const topicTitle = "Verification Topic";

        const [newTopic] = await db.insert(classifiedTopics).values({
            userId: user.id,
            pillarId: pillar.id,
            pillarName: pillar.name,
            source: 'manual',
            content: topicTitle,
            status: 'classified',
            aiScore: 100,
            hookAngle: 'storytelling',
        }).returning();

        console.log('✅ Topic Created:', newTopic.id);

        // 3. Simulate Draft Generation Result (Mock)
        const mockVariants = [
            {
                variantLetter: 'A',
                post: {
                    fullText: "Variant A content...",
                    hook: "Hook A",
                    body: "Body A",
                    cta: "CTA A",
                    hashtags: ["test", "verification"],
                    characterCount: 50,
                },
                qualityWarnings: [],
                metadata: { estimatedEngagement: 100 }
            }
        ];

        // 4. Insert Drafts (The fix target)
        // Mimicking route.ts logic exactly
        const draftsToInsert = mockVariants.map((variant: any) => ({
            userId: user.id,
            conversationId,
            topicId: newTopic.id,
            pillarId: pillar.id,
            userPerspective: rawThoughts,
            variantLetter: variant.variantLetter,
            fullText: variant.post.fullText,
            hook: variant.post.hook,
            body: variant.post.body,
            cta: variant.post.cta,
            hashtags: variant.post.hashtags,
            characterCount: variant.post.characterCount,
            estimatedEngagement: variant.metadata.estimatedEngagement,
            status: 'draft' as const,
            qualityWarnings: variant.qualityWarnings,
        }));

        console.log('📝 Attempting to insert Scratch drafts...');
        const createdDrafts = await db.insert(generatedDrafts).values(draftsToInsert as any).returning();

        console.log('✅ Drafts Inserted Successfully!');
        console.log('🆔 Draft ID:', createdDrafts[0].id);
        console.log('🔗 Topic ID:', createdDrafts[0].topicId);

        // 5. Cleanup
        await db.delete(conversationMessages).where(eq(conversationMessages.conversationId, conversationId));
        await db.delete(generatedDrafts).where(eq(generatedDrafts.id, createdDrafts[0].id));
        await db.delete(classifiedTopics).where(eq(classifiedTopics.id, newTopic.id));
        await db.delete(conversations).where(eq(conversations.id, conversationId));

        console.log('🧹 Cleanup complete.');

    } catch (e: any) {
        console.error('❌ Verification FAILED:', e);
        process.exit(1);
    }
    process.exit(0);
}

main().catch(console.error);
