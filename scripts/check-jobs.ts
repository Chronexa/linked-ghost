import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ? `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${new URL(process.env.UPSTASH_REDIS_REST_URL).hostname}:6379` : process.env.REDIS_URL;

const connection = new Redis(redisUrl as string);
const queue = new Queue('linkedin-import', { connection });

async function check() {
  const failed = await queue.getFailed(0, 5);
  console.log('Failed jobs:', failed.map(j => ({ id: j.id, failedReason: j.failedReason })));
  process.exit(0);
}
check();
