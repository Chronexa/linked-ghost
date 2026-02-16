import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { conversationMessages, conversations, classifiedTopics, generatedDrafts, voiceExamples, pillars, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { generateDraftVariants, estimateEngagement } from '@/lib/ai/generation';
import { retry, isRetryableError } from '@/lib/utils/retry';
import { checkUsageLimit, incrementUsage } from '@/lib/ai/usage';

const writeFromScratchSchema = z.object({
    conversationId: z.string().uuid(),
    rawThoughts: z.string().min(10, "Please provide at least 10 characters of thoughts"),
    pillarId: z.string().uuid().optional(),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const validation = await validateBody(req, writeFromScratchSchema);
        if (!validation.success) return validation.error;

        const { conversationId, rawThoughts, pillarId } = validation.data;

        // Check usage limits
        const usageCheck = await checkUsageLimit(user.id, 'generate_post');
        if (!usageCheck.allowed) {
            return errors.rateLimit(`Usage limit reached for your ${usageCheck.plan} plan.`);
        }

        // Verify conversation
        const conversation = await db.query.conversations.findFirst({
            where: and(eq(conversations.id, conversationId), eq(conversations.userId, user.id))
        });
        if (!conversation) return errors.notFound('Conversation');

        // Resolve Pillar
        let effectivePillarId = pillarId;
        if (!effectivePillarId) {
            const firstPillar = await db.query.pillars.findFirst({
                where: and(eq(pillars.userId, user.id), eq(pillars.status, 'active'))
            });
            if (!firstPillar) return errors.badRequest('Referenced pillar not found and no active pillars available.');
            effectivePillarId = firstPillar.id;
        }

        const pillar = await db.query.pillars.findFirst({ where: eq(pillars.id, effectivePillarId) });
        if (!pillar) return errors.notFound('Pillar');

        // Save user message
        await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'user',
            content: rawThoughts,
            messageType: 'text',
            metadata: { flow: 'write-from-scratch', pillarId: effectivePillarId }
        });

        // Create Classified Topic (Ad-hoc)
        // Use first 50 chars as "title"
        const topicTitle = rawThoughts.length > 50 ? rawThoughts.substring(0, 50) + "..." : rawThoughts;

        const [newTopic] = await db.insert(classifiedTopics).values({
            userId: user.id,
            pillarId: effectivePillarId,
            pillarName: pillar.name,
            source: 'manual',
            content: topicTitle,
            status: 'classified',
            aiScore: 100,
            hookAngle: 'storytelling',
        }).returning();

        // Prepare generation
        const allExamples = await db.select().from(voiceExamples)
            .where(and(eq(voiceExamples.userId, user.id), eq(voiceExamples.status, 'active')))
            .limit(20);

        const examples = allExamples.sort((a, b) => {
            const aPriority = a.pillarId === effectivePillarId ? 0 : 1;
            const bPriority = b.pillarId === effectivePillarId ? 0 : 1;
            if (aPriority !== bPriority) return aPriority - bPriority;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 10);

        // Relaxed Constraint
        // if (examples.length < 3) return errors.badRequest('Need at least 3 voice examples.');

        const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
        // Relaxed Constraint
        // if (!profile?.voiceEmbedding) return errors.badRequest('Voice not trained.');

        // Generate
        const genResult = await retry(
            () => generateDraftVariants({
                topicTitle: topicTitle,
                topicDescription: "User's raw thoughts: " + rawThoughts,
                userPerspective: "CORE CONTENT / RAW THOUGHTS:\n" + rawThoughts + "\n\nINSTRUCTION: Expand these thoughts into a full post.", // Explicit instruction
                pillarName: pillar.name,
                pillarDescription: pillar.description || undefined,
                pillarTone: pillar.tone || undefined,
                targetAudience: pillar.targetAudience || profile?.targetAudience || undefined,
                customPrompt: pillar.customPrompt || undefined,
                voiceExamples: examples.map((ex) => ({
                    postText: ex.postText,
                    embedding: ex.embedding as number[] | undefined,
                })),
                masterVoiceEmbedding: (profile?.voiceEmbedding as number[]) || undefined,
                numVariants: 1, // Default to single draft
                userId: user.id,
            }),
            { maxAttempts: 3, delayMs: 1000, exponentialBackoff: true, retryOn: isRetryableError }
        );

        // Save Drafts
        const draftsToInsert = genResult.variants.map((variant: any) => ({
            userId: user.id,
            conversationId, // Link back to conversation
            topicId: newTopic.id,
            pillarId: effectivePillarId!,
            userPerspective: rawThoughts,
            variantLetter: variant.variantLetter,
            fullText: variant.post.fullText,
            hook: variant.post.hook,
            body: variant.post.body,
            cta: variant.post.cta,
            hashtags: variant.post.hashtags,
            characterCount: variant.post.characterCount,
            estimatedEngagement: estimateEngagement(variant.post),
            status: 'draft' as const,
            qualityWarnings: variant.qualityWarnings,
        }));

        const createdDrafts = await db.insert(generatedDrafts).values(draftsToInsert as any).returning();

        // Increment usage
        await incrementUsage(user.id, 'generate_post', 2);

        const [assistantResponse] = await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'assistant',
            content: `I've turned your thoughts into two posts.`,
            messageType: 'draft_variants',
            metadata: {
                drafts: createdDrafts.map((d, i) => ({ ...d, style: genResult.variants[i].style, voiceMatchScore: genResult.variants[i].voiceMatchScore, qualityWarnings: genResult.variants[i].qualityWarnings }))
            }
        }).returning();

        await db.update(conversations).set({
            title: topicTitle,
            lastMessagePreview: "Generated drafts from scratch",
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return responses.created({ drafts: createdDrafts, messageId: assistantResponse.id, topicId: newTopic.id });

    } catch (error) {
        console.error("Error in write-from-scratch:", error);
        return errors.internal("Failed to generate from scratch");
    }
});
