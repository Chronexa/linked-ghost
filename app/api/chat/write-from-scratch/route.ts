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

export const dynamic = 'force-dynamic';


// Export max duration to prevent serverless timeouts during fallback AI generation
export const maxDuration = 60;

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

        // 4. Enqueue Generation Job (Async)
        // Create a placeholder message first
        const [assistantDraftMessage] = await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'assistant',
            content: `I'm drafting potential posts for you from scratch. This may take a minute...`,
            messageType: 'text',
            metadata: {
                flow: 'write-from-scratch',
                topicId: newTopic.id,
                pillarId: effectivePillarId,
                status: 'processing',
                type: 'draft_generation_in_progress'
            }
        }).returning();

        // Enqueue the heavy lifting
        try {
            if (process.env.USE_BACKGROUND_WORKER !== 'true') {
                throw new Error('SYNC_FALLBACK_REQUESTED_BY_ENV');
            }

            console.log('🚀 Enqueuing generation job for write-from-scratch:', conversationId);
            const { enqueueGeneration } = await import('@/lib/queue');
            await enqueueGeneration({
                userId: user.id,
                conversationId,
                messageId: assistantDraftMessage.id,
                topicId: newTopic.id,
                pillarId: effectivePillarId,
                pillarContext: {
                    name: pillar.name,
                    description: pillar.description || undefined,
                    tone: pillar.tone || undefined,
                    targetAudience: pillar.targetAudience || undefined,
                    customPrompt: pillar.customPrompt || undefined,
                },
                topicContent: {
                    title: topicTitle,
                    summary: "User's raw thoughts: " + rawThoughts,
                },
                userPerspective: "CORE CONTENT / RAW THOUGHTS:\n" + rawThoughts + "\n\nINSTRUCTION: Expand these thoughts into a full post.",
                voiceExamples: examples.map((ex) => ({
                    postText: ex.postText,
                    embedding: ex.embedding,
                })),
                numVariants: 1,
            });
            console.log('✅ Job successfully enqueued');
        } catch (queueError: any) {
            console.error('❌ Failed to enqueue write-from-scratch job:', queueError);
            console.warn('⚠️ Switching to SYNCHRONOUS generation fallback.');
            try {
                // Generate
                const genResult = await retry(
                    () => generateDraftVariants({
                        topicTitle: topicTitle,
                        topicDescription: "User's raw thoughts: " + rawThoughts,
                        userPerspective: "CORE CONTENT / RAW THOUGHTS:\n" + rawThoughts + "\n\nINSTRUCTION: Expand these thoughts into a full post.", // Explicit instruction
                        pillarName: pillar.name,
                        pillarDescription: pillar.description || undefined,
                        pillarTone: pillar.tone || undefined,
                        targetAudience: pillar.targetAudience || undefined,
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
                    embedding: variant.draftEmbedding ?? null,
                    status: 'draft' as const,
                    qualityWarnings: variant.qualityWarnings,
                }));

                const createdDrafts = await db.insert(generatedDrafts).values(draftsToInsert as any).returning();

                // 3. Update Message to "Done"
                await db.update(conversationMessages).set({
                    content: `I've drafted posts for you from scratch.`,
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

                await incrementUsage(user.id, 'generate_post', 1);

                // 4. Update Conversation Preview
                await db.update(conversations).set({
                    lastMessagePreview: "Generated drafts from scratch",
                    updatedAt: new Date()
                }).where(eq(conversations.id, conversationId));

                console.log('✅ Synchronous fallback completed successfully.');

                return responses.ok({
                    messageId: assistantDraftMessage.id,
                    status: 'completed'
                });

            } catch (syncError) {
                console.error("❌ Synchronous fallback also failed:", syncError);
                await db.update(conversationMessages).set({
                    content: "I encountered an error while generating from your thoughts. Please try again.",
                    metadata: { error: syncError instanceof Error ? syncError.message : String(syncError) }
                }).where(eq(conversationMessages.id, assistantDraftMessage.id));
                throw syncError;
            }
        }

        // Increment usage
        await incrementUsage(user.id, 'generate_post', 2);

        await db.update(conversations).set({
            title: topicTitle,
            lastMessagePreview: "Generating drafts from scratch...",
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return responses.accepted({
            messageId: assistantDraftMessage.id,
            status: 'processing'
        });

    } catch (error) {
        console.error("Error in write-from-scratch:", error);
        return errors.internal("Failed to generate from scratch");
    }
});
