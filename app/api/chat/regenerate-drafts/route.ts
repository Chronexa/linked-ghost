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
import { canRegenerate, incrementUsage } from '@/lib/ai/usage';

const regenerateSchema = z.object({
    conversationId: z.string().uuid(),
    topicId: z.string().uuid(),
    userPerspective: z.string().min(1),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const validation = await validateBody(req, regenerateSchema);
        if (!validation.success) return validation.error;

        const { conversationId, topicId, userPerspective } = validation.data;

        // Check regeneration limit from subscription plan
        const regenCheck = await canRegenerate(user.id);
        if (!regenCheck.allowed) {
            return errors.paymentRequired(regenCheck.reason || `Regeneration limit reached. Upgrade your plan for unlimited regenerations.`);
        }

        // Verify conversation
        const conversation = await db.query.conversations.findFirst({
            where: and(eq(conversations.id, conversationId), eq(conversations.userId, user.id))
        });
        if (!conversation) return errors.notFound('Conversation');

        // Get Topic & Pillar
        const topic = await db.query.classifiedTopics.findFirst({
            where: and(eq(classifiedTopics.id, topicId), eq(classifiedTopics.userId, user.id))
        });
        if (!topic) return errors.notFound('Topic');

        const pillar = await db.query.pillars.findFirst({ where: eq(pillars.id, topic.pillarId) });
        // Pillar might be deleted? fallback?
        // If pillar deleted, we might have issues. Assume valid for now.

        const allExamples = await db.select().from(voiceExamples)
            .where(and(eq(voiceExamples.userId, user.id), eq(voiceExamples.status, 'active')))
            .limit(20);

        // Sort examples logic...
        const examples = allExamples.sort((a, b) => {
            const aPriority = a.pillarId === topic.pillarId ? 0 : 1;
            const bPriority = b.pillarId === topic.pillarId ? 0 : 1;
            if (aPriority !== bPriority) return aPriority - bPriority;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 10);

        if (examples.length < 3) return errors.badRequest('Need at least 3 voice examples.');

        const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
        if (!profile?.voiceEmbedding) return errors.badRequest('Voice not trained.');

        // Generate
        const genResult = await retry(
            () => generateDraftVariants({
                topicTitle: topic.content,
                topicDescription: topic.sourceUrl || undefined,
                userPerspective,
                pillarName: pillar?.name || 'General',
                pillarDescription: pillar?.description || undefined,
                pillarTone: pillar?.tone || undefined,
                targetAudience: pillar?.targetAudience || profile.targetAudience || undefined,
                customPrompt: pillar?.customPrompt || undefined,
                voiceExamples: examples.map((ex) => ({
                    postText: ex.postText,
                    embedding: ex.embedding as number[] | undefined,
                })),
                masterVoiceEmbedding: profile.voiceEmbedding as number[],
                numVariants: 2,
                userId: user.id,
            }),
            { maxAttempts: 3, delayMs: 1000, exponentialBackoff: true, retryOn: isRetryableError }
        );

        // Transaction: Delete old, Insert new
        const createdDrafts = await db.transaction(async (tx) => {
            await tx.delete(generatedDrafts).where(and(
                eq(generatedDrafts.topicId, topicId),
                eq(generatedDrafts.userId, user.id),
                eq(generatedDrafts.status, 'draft')
            ));

            const draftsToInsert = genResult.variants.map((variant: any) => ({
                userId: user.id,
                topicId,
                pillarId: topic.pillarId,
                userPerspective,
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

            return await tx.insert(generatedDrafts).values(draftsToInsert).returning();
        });

        // Increment usage
        await incrementUsage(user.id, 'regenerate_post', 2);

        // Save message
        const [assistantResponse] = await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'assistant',
            content: `Regenerated drafts with perspective: "${userPerspective}"`,
            messageType: 'draft_variants',
            metadata: {
                drafts: createdDrafts.map((d, i) => ({ ...d, style: genResult.variants[i].style, voiceMatchScore: genResult.variants[i].voiceMatchScore, qualityWarnings: genResult.variants[i].qualityWarnings }))
            }
        }).returning();

        await db.update(conversations).set({
            lastMessagePreview: "Regenerated drafts",
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return responses.created({ drafts: createdDrafts, messageId: assistantResponse.id, topicId });

    } catch (error) {
        console.error("Error in regenerate-drafts:", error);
        return errors.internal("Failed to regenerate drafts");
    }
});
