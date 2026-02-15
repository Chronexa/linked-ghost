import { Redis } from 'ioredis';

// Reuse the existing Redis URL from environment variables
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    throw new Error('REDIS_URL is not defined in environment variables');
}

// Create a singleton Redis connection for queues (ioredis)
// Note: BullMQ requires ioredis, not @upstash/redis
let _redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
    if (!_redisConnection) {
        _redisConnection = new Redis(REDIS_URL as string, {
            maxRetriesPerRequest: null, // Required by BullMQ
            enableReadyCheck: false,    // Faster startup
            tls: REDIS_URL!.startsWith('rediss://') ? {} : undefined, // Check specifically for rediss protocol
        });

        _redisConnection.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        _redisConnection.on('ready', () => {
            console.log('✅ Connected to Redis for Queues');
        });
    }
    return _redisConnection;
}

// Separate connection for subscribers (BullMQ needs separate connections)
export function createRedisConnection(): Redis {
    return new Redis(REDIS_URL!, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        tls: REDIS_URL?.startsWith('rediss://') ? {} : undefined,
    });
}
