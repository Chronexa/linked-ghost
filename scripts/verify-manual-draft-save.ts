
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { generatedDrafts, users, pillars } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

async function main() {
    console.log('🧪 Verifying Manual Draft Save Logic (POST /api/drafts)...');

    try {
        // 1. Simulating User and Pillar Retrieval (Authentication & Context)
        const user = await db.query.users.findFirst();
        if (!user) throw new Error('No user found');
        console.log(`👤 User: ${user.id}`);

        // Logic from route.ts: Resolve Pillar if not provided
        let effectivePillarId;
        const firstPillar = await db.query.pillars.findFirst({
            where: and(eq(pillars.userId, user.id), eq(pillars.status, 'active'))
        });
        if (!firstPillar) throw new Error('No active pillar found');
        effectivePillarId = firstPillar.id;
        console.log(`🏛️  Pillar Resolved: ${effectivePillarId}`);

        // 2. Simulating Validated Body
        const validationData = {
            content: "This is a manually saved draft content for verification.",
            userPerspective: "Testing manual save",
            status: "draft"
        };

        // 3. Simulating DB Insert with .returning() (The Fix)
        console.log('📝 Attempting DB Insert with .returning()...');

        const [newDraft] = await db.insert(generatedDrafts).values({
            userId: user.id,
            pillarId: effectivePillarId,
            topicId: null, // Optional
            fullText: validationData.content,
            userPerspective: validationData.userPerspective,
            hook: validationData.content.substring(0, 50),
            status: validationData.status as any,
            metadata: { source: 'manual_verification' },
            variantLetter: 'A',
            characterCount: validationData.content.length,
        }).returning();

        if (!newDraft) {
            throw new Error('❌ Insert failed to return data! .returning() might be missing or broken.');
        }

        console.log('✅ Draft Saved Successfully!');
        console.log(`🆔 ID: ${newDraft.id}`);
        console.log(`📄 Content: ${newDraft.fullText}`);

        // 4. Cleanup
        await db.delete(generatedDrafts).where(eq(generatedDrafts.id, newDraft.id));
        console.log('🧹 Cleanup complete.');

    } catch (e: any) {
        console.error('❌ Verification FAILED:', e);
        process.exit(1);
    }
    process.exit(0);
}

main().catch(console.error);
