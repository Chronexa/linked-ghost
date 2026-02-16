import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { conversationMessages, conversations, classifiedTopics, generatedDrafts, voiceExamples, pillars, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { estimateEngagement } from '@/lib/ai/generation';
import { enqueueGeneration } from '@/lib/queue';
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
    },
    userPerspective: userPerspective || "Write an engaging LinkedIn post about this topic.",
        voiceExamples: examples.map((ex) => ({
            postText: ex.postText,
            embedding: ex.embedding, // Pass embedding if available, otherwise worker might need to re-fetch or generate? Worker has logic.
        })),
        });

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
