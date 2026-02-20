import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { generatedDrafts, users, pillars, classifiedTopics, conversationMessages, conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function main() {
    console.log('🧪 Verifying Select-Topic Backend Flow (Sync Fallback)...');

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
            title: 'Test Select Topic Conversation'
        });

        // 2. Simulate "Classified Topic" Creation
        const topicContent = "Artificial Intelligence in 2026";
        const sources = [{ snippet: "AI is cool.", url: "https://example.com" }];

        const [newTopic] = await db.insert(classifiedTopics).values({
            userId: user.id,
            pillarId: pillar.id,
            pillarName: pillar.name,
            source: 'perplexity',
            content: topicContent,
            status: 'classified',
            aiScore: 85,
            hookAngle: 'analytical',
            keyPoints: sources ? { sources } : undefined,
        }).returning();

        console.log('✅ Topic Created:', newTopic.id);

        // 3. Simulate Draft Generation Result (Mocking the AI call)
        const mockVariants = [
            {
                variantLetter: 'A',
                style: 'narrative',
                voiceMatchScore: 90,
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

        // 4. Insert Drafts (The fix target matching `select-topic/route.ts` line 215)
        const userPerspective = "This is my custom perspective";

        const draftInserts = mockVariants.map((variant: any) => ({
            userId: user.id,
            conversationId, // Verifying this constraint doesn't fail
            topicId: newTopic.id,
            pillarId: pillar.id,
            userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
            variantLetter: variant.variantLetter,
            fullText: variant.post.fullText,
            hook: variant.post.hook,
            body: variant.post.body,
            cta: variant.post.cta,
            hashtags: variant.post.hashtags,
            characterCount: variant.post.characterCount,
            estimatedEngagement: variant.metadata?.estimatedEngagement || 0,
            status: 'draft' as const,
        }));

        console.log('📝 Attempting to insert Select-Topic sync drafts...');
        const createdDrafts = await db.insert(generatedDrafts).values(draftInserts as any).returning();

        console.log('✅ Drafts Inserted Successfully!');
        console.log('🆔 Draft ID:', createdDrafts[0].id);
        console.log('🔗 Topic ID:', createdDrafts[0].topicId);

        // 5. Cleanup
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
