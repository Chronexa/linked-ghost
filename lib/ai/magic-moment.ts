/**
 * Magic Moment — Shared utility
 * ─────────────────────────────────────────────────────────────────
 * Creates the user's first AI-generated draft immediately after
 * onboarding. This function is called by both the Apify path
 * (confirm-profile) and the manual fallback path (infer route).
 *
 * Extracted from infer/route.ts to avoid duplication.
 */

import { db } from '@/lib/db';
import { pillars, conversations, conversationMessages, classifiedTopics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface MagicMomentResult {
    conversationId?: string;
    error?: string;
}

/**
 * Create a conversation + topic + placeholder message and optionally
 * enqueue background generation. Returns the conversationId for redirect.
 */
export async function triggerMagicMoment(
    userId: string,
    uniqueAngle: string,
    voiceExampleTexts: string[]
): Promise<MagicMomentResult> {
    try {
        // Find the user's primary pillar
        const mainPillar = await db.query.pillars.findFirst({
            where: eq(pillars.userId, userId),
        });

        if (!mainPillar) {
            console.warn('[MagicMoment] No pillars found for user, skipping');
            return { error: 'No pillars found' };
        }

        // Create conversation
        const [conversation] = await db.insert(conversations).values({
            userId,
            title: 'Your First Automated Draft',
        }).returning({ id: conversations.id });

        // Create topic based on unique angle
        const [newTopic] = await db.insert(classifiedTopics).values({
            userId,
            pillarId: mainPillar.id,
            pillarName: mainPillar.name,
            source: 'manual',
            content: 'Introductory post: ' + uniqueAngle,
            status: 'classified',
            aiScore: 100,
            hookAngle: 'storytelling',
        }).returning();

        // Create assistant placeholder message
        const [assistantMsg] = await db.insert(conversationMessages).values({
            conversationId: conversation.id,
            userId,
            role: 'assistant',
            content: `I'm preparing your first magical draft based on your new profile...`,
            messageType: 'text',
            metadata: {
                flow: 'write-from-scratch',
                topicId: newTopic.id,
                pillarId: mainPillar.id,
                status: 'processing',
                type: 'draft_generation_in_progress',
            },
        }).returning();

        const jobData = {
            userId,
            conversationId: conversation.id,
            messageId: assistantMsg.id,
            topicId: newTopic.id,
            pillarId: mainPillar.id,
            pillarContext: {
                name: mainPillar.name,
                description: mainPillar.description,
                targetAudience: mainPillar.targetAudience,
            },
            topicContent: {
                title: 'My perspective on ' + mainPillar.name,
                summary: 'Write a high-impact introductory post leveraging my unique angle: ' + uniqueAngle,
            },
            userPerspective: 'Write a high-impact introductory post.',
            voiceExamples: voiceExampleTexts.map((postText) => ({
                postText,
                embedding: [],
            })),
            numVariants: 1,
        };

        // ALWAYS fire the job directly (non-blocking) so it works without a BullMQ worker.
        // This prevents Vercel 504 timeouts because we don't await the job's completion.
        try {
            const { generationJob } = await import('@/lib/queue/jobs/generation');
            // Fire and forget
            generationJob({ id: `magic-${conversation.id}`, data: jobData } as any)
                .catch((err: any) => console.error('[MagicMoment] Direct job failed:', err));
            console.log(`✨ Magic Moment generation fired asynchronously for ${conversation.id}`);
        } catch (err) {
            console.error('[MagicMoment] Failed to fire direct job:', err);
        }

        // Also enqueue to BullMQ if worker is running (for production scalability)
        if (process.env.USE_BACKGROUND_WORKER === 'true') {
            try {
                const { enqueueGeneration } = await import('@/lib/queue');
                await enqueueGeneration(jobData);
                console.log(`[MagicMoment] Also queued to BullMQ for ${conversation.id}`);
            } catch (queueErr) {
                console.error('[MagicMoment] Failed to enqueue:', queueErr);
            }
        }

        console.log(`✨ Magic Moment created: conversation=${conversation.id}`);
        return { conversationId: conversation.id };
    } catch (err: any) {
        console.error('[MagicMoment] Error:', err);
        return { error: err.message };
    }
}
