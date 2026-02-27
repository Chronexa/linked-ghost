import { Worker, Job, JobType } from 'bullmq';
import { getRedisConnection, createRedisConnection } from './client';
import { researchJob } from './jobs/research';
import { classificationJob } from './jobs/classification';
import { generationJob } from './jobs/generation';
import { linkedInImportJob } from './jobs/linkedin-import';

// Define queue names to prevent typos
export const QUEUE_NAMES = {
    RESEARCH: 'content-research',
    CLASSIFICATION: 'topic-classification',
    GENERATION: 'post-generation',
    VOICE_EMBEDDING: 'voice-embedding',
    LINKEDIN_IMPORT: 'linkedin-import',
};

// Define job types interface
interface JobHandler {
    (job: Job): Promise<any>;
}

// Map queue names to their specific handlers
const handlers: Record<string, JobHandler> = {
    [QUEUE_NAMES.RESEARCH]: researchJob,
    [QUEUE_NAMES.CLASSIFICATION]: classificationJob,
    [QUEUE_NAMES.GENERATION]: generationJob,
    [QUEUE_NAMES.VOICE_EMBEDDING]: async (job: Job) => { console.log('Mock voice embedding processing for', job.data) },
    [QUEUE_NAMES.LINKEDIN_IMPORT]: linkedInImportJob,
};

// Store active workers to prevent duplicate initialization
const workers: Record<string, Worker> = {};

/**
 * Initialize a worker for a specific queue
 */
export function initWorker(queueName: string) {
    if (workers[queueName]) {
        console.log(`Worker for ${queueName} already running.`);
        return workers[queueName];
    }

    const handler = handlers[queueName];
    if (!handler) {
        throw new Error(`No handler defined for queue: ${queueName}`);
    }

    console.log(`🚀 Starting worker for queue: ${queueName}`);

    const worker = new Worker(queueName, handler, {
        connection: createRedisConnection(), // BullMQ needs dedicated connection for workers
        concurrency: 5, // Process 5 jobs at once (adjust based on CPU/API limits)
        limiter: {
            max: 10, // Max 10 jobs
            duration: 1000, // Per second
        },
    });

    worker.on('completed', (job: Job) => {
        console.log(`✅ Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
        console.error(`❌ Job ${job?.id} failed in queue ${queueName}:`, err);
    });

    worker.on('error', (err: Error) => {
        console.error(`❌ Worker error in queue ${queueName}:`, err);
    });

    workers[queueName] = worker;
    return worker;
}

/**
 * Initialize all defined workers
 * Call this function on app startup (e.g., in instrumentation.ts or api route)
 */
export function initAllWorkers() {
    Object.keys(handlers).forEach((queueName) => {
        initWorker(queueName);
    });
}
