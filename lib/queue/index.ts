import { Queue } from 'bullmq';
import { getRedisConnection } from './client';
import { QUEUE_NAMES } from './worker';

// Queue map
const queues: Record<string, Queue> = {};

/**
 * Get or create a BullMQ queue instance
 * @param queueName - Use QUEUE_NAMES constant
 */
export function getQueue(queueName: string): Queue {
    if (!queues[queueName]) {
        queues[queueName] = new Queue(queueName, {
            connection: getRedisConnection(),
        });
    }
    return queues[queueName];
}

/**
 * Add a job to a specific queue
 *
 * @param queueName - Target queue name
 * @param jobData - Data payload for the job
 * @param jobId - (Optional) Custom job ID for idempotency/tracking
 * @param opts - (Optional) Queue options like delay
 */
export async function addJob<T = any>(
    queueName: string,
    jobData: T,
    jobId?: string,
    opts?: { delay?: number; priority?: number }
) {
    const queue = getQueue(queueName);

    // Job options
    const jobOpts = {
        jobId, // Use custom ID if provided (e.g. topic-uuid)
        removeOnComplete: true, // Auto-cleanup successful jobs
        removeOnFail: 100, // Keep last 100 failed jobs for debugging
        attempts: 3, // Retry logic
        backoff: {
            type: 'exponential',
            delay: 5000, // Wait 5s, then 10s, then 20s
        },
        ...opts,
    };

    await queue.add(queueName, jobData, jobOpts);
    console.log(`📥 Added job to ${queueName}: ${jobId || 'auto-generated'}`);
}

/**
 * Convenience functions for specific queues
 */

// Add research job (daily cron)
export async function enqueueResearch(userId: string) {
    return addJob(QUEUE_NAMES.RESEARCH, { userId }, `research-${userId}-${Date.now()}`);
}

// Add classification job (batch processing)
export async function enqueueClassification(topicId: string) {
    return addJob(QUEUE_NAMES.CLASSIFICATION, { topicId }, `classify-${topicId}`);
}

// Add generation job (draft creation)
export async function enqueueGeneration(draftParams: any) {
    return addJob(QUEUE_NAMES.GENERATION, draftParams);
}

// Add LinkedIn import job (triggered on user.created if LinkedIn URL available)
export async function enqueueLinkedInImport(userId: string, linkedinUrl: string, clerkId: string) {
    return addJob(
        QUEUE_NAMES.LINKEDIN_IMPORT,
        { userId, linkedinUrl, clerkId },
        `linkedin-import-${userId}`
    );
}
