import { Job } from 'bullmq';
import { db } from '@/lib/db';
import { rawTopics, classifiedTopics, pillars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ClassificationJobData {
    topicId: string;
}

/**
 * Handle topic classification job
 * Uses OpenAI to tag topics with user pillars
 */
export async function classificationJob(job: Job<ClassificationJobData>) {
    const { topicId } = job.data;

    try {
        console.log(`🏷️ Classifying topic: ${topicId}`);

        // Fetch topic
        const topic = await db.query.rawTopics.findFirst({
            where: eq(rawTopics.id, topicId),
            with: {
                user: {
                    with: {
                        pillars: true,
                    },
                },
            },
        });

        if (!topic || !topic.user) {
            console.warn(`Topic or User for ${topicId} not found.`);
            return;
        }

        if (topic.user.pillars.length === 0) {
            console.warn(`User ${topic.userId} has no pillars. Skipping classification.`);
            return;
        }

        // Call OpenAI classification (in real implementation: import { classifyTopic } from '@/lib/ai/classifiers')
        // We'll mock this for now to unblock
        const mockPillar = topic.user.pillars[0]; // Just pick the first one
        const context = `Content about ${topic.content}`;

        console.log(`   Assigning to pillar: ${mockPillar.name}`);

        // Update status in raw_topics
        await db.update(rawTopics)
            .set({ status: 'classified', processedAt: new Date() })
            .where(eq(rawTopics.id, topicId));

        // Store in classified_topics
        await db.insert(classifiedTopics).values({
            userId: topic.userId,
            rawTopicId: topicId,
            pillarId: mockPillar.id,
            pillarName: mockPillar.name,
            source: topic.source,
            sourceUrl: topic.sourceUrl,
            content: topic.content,
            aiScore: 85, // Mock score
            hookAngle: 'analytical', // Mock hook angle
            reasoning: 'Matches pillar perfectly.',
            keyPoints: (topic.rawData as any)?.keyPoints || [],
            suggestedHashtags: (topic.rawData as any)?.suggestedHashtags || [],
            status: 'classified',
        });

        return { success: true, classificationId: topicId };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Classification failed for topic ${topicId}:`, error.message);
            throw error;
        } else {
            console.error(`❌ Classification failed for topic ${topicId}: Unknown error`, error);
            throw new Error('Unknown error during classification');
        }
    }
}
