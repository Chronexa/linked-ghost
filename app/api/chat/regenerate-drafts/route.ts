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

        // Create a placeholder message first
        const [assistantDraftMessage] = await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'assistant',
            content: `Regenerating drafts...`,
            messageType: 'text',
            metadata: {
                status: 'processing',
                type: 'draft_generation_in_progress'
            }
        }).returning();

        // Enqueue the heavy lifting
        try {
            if (process.env.USE_BACKGROUND_WORKER !== 'true') {
                throw new Error('SYNC_FALLBACK_REQUESTED_BY_ENV');
            }

            console.log('🚀 Enqueuing generation job for regenerate-drafts:', conversationId);
            const { enqueueGeneration } = await import('@/lib/queue');
            await enqueueGeneration({
                userId: user.id,
                conversationId,
                messageId: assistantDraftMessage.id,
                topicId: topicId,
                pillarId: topic.pillarId,
                pillarContext: {
                    name: pillar?.name || 'General',
                    description: pillar?.description || undefined,
                    tone: pillar?.tone || undefined,
                    targetAudience: pillar?.targetAudience || undefined,
                    customPrompt: pillar?.customPrompt || undefined,
                },
                topicContent: {
                    title: topic.content,
                    summary: topic.sourceUrl || undefined,
                },
                userPerspective,
                voiceExamples: examples.map((ex) => ({
                    postText: ex.postText,
                    embedding: ex.embedding,
                })),
                numVariants: 2,
            });
            console.log('✅ Job successfully enqueued');

        } catch (queueError: any) {
            console.error('❌ Failed to enqueue regenerate-drafts job:', queueError);
            console.warn('⚠️ Switching to SYNCHRONOUS generation fallback.');
            try {
                // Generate
                const genResult = await retry(
                    () => generateDraftVariants({
                        topicTitle: topic.content,
                        topicDescription: topic.sourceUrl || undefined,
                        userPerspective,
                        pillarName: pillar?.name || 'General',
                        pillarDescription: pillar?.description || undefined,
                        pillarTone: pillar?.tone || undefined,
                        targetAudience: pillar?.targetAudience || undefined,
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
                        conversationId,
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
                        embedding: variant.draftEmbedding ?? null,
                        status: 'draft' as const,
                        qualityWarnings: variant.qualityWarnings,
                    }));

                    return await tx.insert(generatedDrafts).values(draftsToInsert).returning();
                });

                // Update message to Done
                await db.update(conversationMessages).set({
                    content: `Regenerated drafts with perspective: "${userPerspective}"`,
                    messageType: 'draft_variants',
                    metadata: {
                        drafts: createdDrafts.map((d, i) => ({
                            ...d,
                            style: genResult.variants[i].style,
                            voiceMatchScore: genResult.variants[i].voiceMatchScore,
                            qualityWarnings: genResult.variants[i].qualityWarnings,
                            qualityMetrics: genResult.variants[i].qualityMetrics,
                            qualityGateResult: genResult.variants[i].qualityGateResult,
                            compositeScore: genResult.variants[i].compositeScore,
                            deduplicationResult: genResult.variants[i].deduplicationResult,
                        }))
                    }
                }).where(eq(conversationMessages.id, assistantDraftMessage.id));

                await incrementUsage(user.id, 'regenerate_post', 1);

                await db.update(conversations).set({
                    lastMessagePreview: "Regenerated drafts",
                    updatedAt: new Date()
                }).where(eq(conversations.id, conversationId));

                return responses.ok({
                    messageId: assistantDraftMessage.id,
                    status: 'completed',
                    topicId
                });

            } catch (syncError) {
                console.error("❌ Synchronous fallback also failed:", syncError);
                await db.update(conversationMessages).set({
                    content: "I encountered an error while regenerating your drafts. Please try again.",
                    metadata: { error: syncError instanceof Error ? syncError.message : String(syncError) }
                }).where(eq(conversationMessages.id, assistantDraftMessage.id));
                throw syncError;
            }
        }

        // Increment usage
        await incrementUsage(user.id, 'regenerate_post', 2);

        await db.update(conversations).set({
            lastMessagePreview: "Regenerating drafts...",
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return responses.accepted({
            messageId: assistantDraftMessage.id,
            status: 'processing',
            topicId
        });

    } catch (error) {
        console.error("Error in regenerate-drafts:", error);
        return errors.internal("Failed to regenerate drafts");
    }
});
