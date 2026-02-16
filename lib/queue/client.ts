import { Redis } from 'ioredis';

// Helper to construct Redis URL from Upstash REST Env Vars if needed
function getRedisUrl(): string | undefined {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    // Fallback: Construct TCP URL from Upstash REST variables
    // Pattern: rediss://default:<TOKEN>@<HOST>:6379
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const dbUrl = new URL(process.env.UPSTASH_REDIS_REST_URL);
            const host = dbUrl.hostname;
            const port = 6379; // Standard Upstash port
            const token = process.env.UPSTASH_REDIS_REST_TOKEN;

            console.log('🔌 Auto-configuring Redis from Upstash REST credentials...');
            const redisUrl = `rediss://default:${token}@${host}:${port}`;
            console.log(`   Constructed URL: rediss://default:***@${host}:${port}`);
            return redisUrl;
        } catch (e) {
            console.warn('⚠️ Failed to parse UPSTASH_REDIS_REST_URL for Redis connection fallback', e);
        }
    }

    return undefined;
}

// Create a singleton Redis connection for queues (ioredis)
// Note: BullMQ requires ioredis, not @upstash/redis
let _redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
    if (!_redisConnection) {
        const redisUrl = getRedisUrl();

        if (!redisUrl) {
            throw new Error(
                'Redis Connection Failed: Missing REDIS_URL and could not derive from UPSTASH_REDIS_REST_URL. Please set REDIS_URL environment variable.'
            );
        }

        _redisConnection = new Redis(redisUrl, {
            maxRetriesPerRequest: null, // Required by BullMQ
            enableReadyCheck: false,    // Faster startup
            // Check specifically for rediss protocol for TLS
            tls: redisUrl.startsWith('rediss://') ? {} : undefined,
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
    const redisUrl = getRedisUrl();

    if (!redisUrl) {
        throw new Error('Redis Configuration Missing during subscriber creation');
    }

    return new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });
}
