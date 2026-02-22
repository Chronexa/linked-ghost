import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { conversationMessages, conversations, classifiedTopics, generatedDrafts, voiceExamples, pillars, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { estimateEngagement, generateDraftVariants } from '@/lib/ai/generation';
import { enqueueGeneration } from '@/lib/queue';
import { canGeneratePost, incrementUsage } from '@/lib/ai/usage';

// Export max duration to prevent serverless timeouts during fallback AI generation
export const maxDuration = 60;

// Research topics use PerplexitySource { title, url, snippet }; accept either name or title
const sourceSchema = z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional(),
    snippet: z.string().optional(),
});

const selectTopicSchema = z.object({
    conversationId: z.string().uuid(),
    topicContent: z.string().min(1),
    sources: z.array(sourceSchema).optional(),
    pillarId: z.string().uuid().optional(),
    userPerspective: z.string().optional(),
    skipPerspective: z.boolean().optional(),
});

function normalizeSources(sources: Array<{ name?: string; title?: string; url?: string; snippet?: string }> | undefined) {
    return sources?.map((s) => ({
        name: s.name ?? s.title ?? 'Source',
        url: s.url,
        snippet: s.snippet,
    }));
}

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const validation = await validateBody(req, selectTopicSchema);
        if (!validation.success) return validation.error;

        const raw = validation.data;
        const sources = normalizeSources(raw.sources);
        const { conversationId, topicContent, pillarId, userPerspective, skipPerspective } = raw;

        // Verify conversation exists
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.userId, user.id)
            ),
        });

        if (!conversation) return errors.notFound('Conversation');

        // Case 1: Prompt for perspective if not provided and not skipped
        if (!userPerspective && !skipPerspective) {
            // Save user selection
            await db.insert(conversationMessages).values({
                conversationId,
                userId: user.id,
                role: 'user',
                content: `I'll write about "${topicContent}"`,
                messageType: 'text',
                metadata: { topicContent, sources, pillarId },
            });

            // Save assistant prompt
            const [assistantMessage] = await db.insert(conversationMessages).values({
                conversationId,
                userId: user.id,
                role: 'assistant',
                content: `Great choice! What's your unique perspective or take on this? Or you can skip to let me suggest an angle.`,
                messageType: 'perspective_request',
                metadata: { topicContent, sources, pillarId }, // Pass context forward
            }).returning();

            return responses.ok({
                requiresPerspective: true,
                messageId: assistantMessage.id
            });
        }

        // Case 2: Generate drafts (Perspective provided or skipped)

        // 1. Resolve Pillar (Required for classifiedTopics)
        let effectivePillarId = pillarId;
        if (!effectivePillarId) {
            // Fallback: Use user's first active pillar or a default
            const firstPillar = await db.query.pillars.findFirst({
                where: and(eq(pillars.userId, user.id), eq(pillars.status, 'active'))
            });
            if (!firstPillar) return errors.badRequest('Referenced pillar not found and no active pillars available.');
            effectivePillarId = firstPillar.id;
        }

        const pillar = await db.query.pillars.findFirst({
            where: eq(pillars.id, effectivePillarId),
        });

        if (!pillar) return errors.notFound('Pillar');

        // 2. Create Ad-hoc Classified Topic
        const [newTopic] = await db.insert(classifiedTopics).values({
            userId: user.id,
            pillarId: effectivePillarId,
            pillarName: pillar.name,
            source: 'perplexity',
            content: topicContent,
            status: 'classified',
            aiScore: 85, // Default high score for selected topic
            hookAngle: 'analytical', // Default for ad-hoc topic
            keyPoints: sources ? { sources } : undefined,
        }).returning();

        // 3. Prepare for Generation (Voice examples, profile)
        // Reuse logic from /api/topics/[id]/generate
        const allExamples = await db.select().from(voiceExamples)
            .where(and(eq(voiceExamples.userId, user.id), eq(voiceExamples.status, 'active')))
            .limit(20);

        const examples = allExamples
            .sort((a, b) => {
                const aPriority = a.pillarId === effectivePillarId ? 0 : 1;
                const bPriority = b.pillarId === effectivePillarId ? 0 : 1;
                if (aPriority !== bPriority) return aPriority - bPriority;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 10);

        const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

        // Check post generation limit from subscription plan
        const usageCheck = await canGeneratePost(user.id);
        if (!usageCheck.allowed) {
            return errors.paymentRequired(usageCheck.reason || 'Post limit reached. Upgrade your plan to generate more posts.');
        }

        // 4. Enqueue Generation Job (Async)
        // Create a placeholder message first
        const [assistantDraftMessage] = await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'assistant',
            content: `I'm drafting potential posts for you about "${topicContent}". This may take a minute...`,
            messageType: 'text',
            metadata: {
                topicContent,
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

            console.log('🚀 Enqueuing generation job for conversation:', conversationId);
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
                    targetAudience: pillar.targetAudience || profile?.targetAudience || undefined,
                    customPrompt: pillar.customPrompt || undefined,
                },
                topicContent: {
                    title: topicContent,
                    summary: sources?.map((s: any) => s.snippet).join('\n') || undefined,
                },
                userPerspective: userPerspective || "Write an engaging LinkedIn post about this topic.",
                voiceExamples: examples.map((ex) => ({
                    postText: ex.postText,
                    embedding: ex.embedding,
                })),
                numVariants: 1,
            });
            console.log('✅ Job successfully enqueued');
        } catch (queueError: any) {
            console.error('❌ Failed to enqueue generation job:', queueError);

            // FALLBACK: Run synchronously if queue is unavailable for ANY reason
            // (env bypass, Redis limits, connection refused, etc.)
            console.warn('⚠️ Switching to SYNCHRONOUS generation fallback.');

            try {
                // 1. Run Generation Direct
                const result = await generateDraftVariants({
                    topicTitle: topicContent,
                    topicDescription: sources?.map((s: any) => s.snippet).join('\n') || undefined,
                    userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
                    pillarName: pillar.name,
                    pillarDescription: pillar.description || undefined,
                    pillarTone: pillar.tone || undefined,
                    targetAudience: pillar.targetAudience || profile?.targetAudience || undefined,
                    customPrompt: pillar.customPrompt || undefined,
                    voiceExamples: examples.map((ex) => ({
                        postText: ex.postText,
                        embedding: ex.embedding as number[] | undefined,
                    })),
                    userId: user.id,
                    numVariants: 1
                });

                // 2. Save Drafts
                const draftInserts = result.variants.map((variant) => ({
                    userId: user.id,
                    conversationId,
                    topicId: newTopic.id,
                    pillarId: effectivePillarId,
                    userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
                    variantLetter: variant.variantLetter,
                    fullText: variant.post.fullText,
                    hook: variant.post.hook,
                    body: variant.post.body,
                    cta: variant.post.cta,
                    hashtags: variant.post.hashtags,
                    characterCount: variant.post.characterCount,
                    estimatedEngagement: estimateEngagement(variant.post),
                    status: 'draft' as const,
                }));

                const createdDrafts = await db.insert(generatedDrafts).values(draftInserts).returning();

                // 3. Update Message to "Done"
                await db.update(conversationMessages).set({
                    content: `I've drafted posts for you about "${topicContent}".`,
                    messageType: 'draft_variants',
                    metadata: {
                        drafts: createdDrafts.map((d, i) => ({
                            ...d,
                            style: result.variants[i].style,
                            voiceMatchScore: result.variants[i].voiceMatchScore,
                            qualityWarnings: result.variants[i].qualityWarnings
                        }))
                    }
                }).where(eq(conversationMessages.id, assistantDraftMessage.id));

                // 4. Update Conversation Preview
                await db.update(conversations).set({
                    lastMessagePreview: `Generated drafts for "${topicContent}"`,
                    updatedAt: new Date()
                }).where(eq(conversations.id, conversationId));

                // 5. Increment usage
                await incrementUsage(user.id, 'generate_post', 1);

                console.log('✅ Synchronous fallback completed successfully.');

                return responses.ok({
                    messageId: assistantDraftMessage.id,
                    status: 'completed'
                });

            } catch (syncError) {
                console.error('❌ Synchronous fallback also failed:', syncError);
                // Update the message to show error state
                await db.update(conversationMessages).set({
                    content: "I encountered an error while generating your draft. Please try again.",
                    metadata: { error: syncError instanceof Error ? syncError.message : String(syncError) }
                }).where(eq(conversationMessages.id, assistantDraftMessage.id));
                throw syncError;
            }
        }

        // Increment usage (we assume success or handle refund in worker on failure?)
        // Better to increment here to prevent abuse.
        await incrementUsage(user.id, 'generate_post', 2);

        // Update conversation
        await db.update(conversations).set({
            lastMessagePreview: `Generating drafts for "${topicContent}"...`,
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return responses.accepted({
            messageId: assistantDraftMessage.id,
            status: 'processing'
        });

    } catch (error) {
        console.error('Error in select-topic:', error);
        return errors.internal('Failed to process topic selection');
    }
});
