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

        // Relaxed Constraint: Allow generation with fewer examples (warn or use generic)
        // if (examples.length < 3) { ... } -> Removed strict check

        const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
        // Relaxed Constraint: Allow generation without embedding
        // if (!profile?.voiceEmbedding) { ... } -> Removed strict check

        // Check usage limits before generation
        const usageCheck = await checkUsageLimit(user.id, 'generate_post');
        if (!usageCheck.allowed) {
            return errors.rateLimit(`Usage limit reached for your ${usageCheck.plan} plan.`);
        }

        // 4. Generate Drafts
        const genResult = await retry(
            () => generateDraftVariants({
                topicTitle: topicContent,
                topicDescription: sources?.map((s: any) => s.snippet).join('\n') || undefined,
                userPerspective: userPerspective || "Write an engaging LinkedIn post about this topic.",
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
                numVariants: 2,
                userInstructions: profile?.defaultInstructions ?? undefined,
                userId: user.id,
            }),
            { maxAttempts: 3, delayMs: 1000, exponentialBackoff: true, retryOn: isRetryableError }
        );

        // 5. Insert Drafts
        const draftsToInsert = genResult.variants.map((variant: any) => ({
            userId: user.id,
            topicId: newTopic.id,
            pillarId: effectivePillarId!,
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

        const createdDrafts = await db.insert(generatedDrafts).values(draftsToInsert).returning();

        // Increment usage
        await incrementUsage(user.id, 'generate_post', 2);

        // 6. Save User & Assistant Messages
        // If perspective was provided in this step, log it as user message logic
        // Actually, if we came here via "userPerspective" param, we should record that user input
        // The previous step might have been just "select topic", so we need a new user message for the perspective
        if (userPerspective) {
            await db.insert(conversationMessages).values({
                conversationId,
                userId: user.id,
                role: 'user',
                content: userPerspective,
                messageType: 'text',
            });
        } else if (skipPerspective) {
            await db.insert(conversationMessages).values({
                conversationId,
                userId: user.id,
                role: 'user',
                content: "Skipped perspective (clicked 'Use Default Angle')",
                messageType: 'text',
            });
        } else {
            // If we came here directly (skipPerspective implied or just one-shot),
            // we might want to log "Selected topic..." if it wasn't logged in Case 1.
            // But the Logic splits: verify if this is a follow-up or first-time
            // Assuming this endpoint is called either 1) to Select (Case 1) or 2) to Confirm (Case 2)
            // If userPerspective/skip is provided, it's likely a follow-up.
            // We'll trust the client to call effectively.
        }

        const [assistantDraftMessage] = await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'assistant',
            content: `I've drafted two posts for you about "${topicContent}".`,
            messageType: 'draft_variants',
            metadata: {
                drafts: createdDrafts.map((d, i) => ({
                    ...d,
                    style: genResult.variants[i].style,
                    voiceMatchScore: genResult.variants[i].voiceMatchScore,
                    qualityWarnings: genResult.variants[i].qualityWarnings
                }))
            }
        }).returning();

        // Update conversation
        await db.update(conversations).set({
            lastMessagePreview: `Generated drafts for "${topicContent}"`,
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return responses.created({
            drafts: createdDrafts,
            messageId: assistantDraftMessage.id
        });

    } catch (error) {
        console.error('Error in select-topic:', error);
        return errors.internal('Failed to process topic selection');
    }
});
