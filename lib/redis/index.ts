import { Redis } from '@upstash/redis';

// Lazy initialization of Redis client
let _redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!_redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in environment variables');
    }

    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

// Export a proxy that lazily initializes the client
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const client = getRedisClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Separate Redis client for queue (if configured)
export const queueRedis = redis;

// Cache helper functions
export const cache = {
  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get<T>(key);
    } catch (error) {
      console.error(`Redis GET error for key "${key}":`, error);
      return null;
    }
  },

  // Set cache value with TTL (in seconds)
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.error(`Redis SET error for key "${key}":`, error);
    }
  },

  // Delete cache key
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key "${key}":`, error);
    }
  },

  // Delete keys matching pattern
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Redis DEL PATTERN error for pattern "${pattern}":`, error);
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key "${key}":`, error);
      return false;
    }
  },

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key "${key}":`, error);
      return 0;
    }
  },

  // Set expiry on existing key
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await redis.expire(key, seconds);
    } catch (error) {
      console.error(`Redis EXPIRE error for key "${key}":`, error);
    }
  },
};

// Cache key builders (consistent naming convention)
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userPillars: (userId: string) => `user:${userId}:pillars`,
  userSubscription: (userId: string) => `user:${userId}:subscription`,
  topic: (topicId: string) => `topic:${topicId}`,
  draft: (draftId: string) => `draft:${draftId}`,
  pendingTopics: (userId: string) => `user:${userId}:topics:pending`,
  pendingDrafts: (userId: string) => `user:${userId}:drafts:pending`,
  usageThisMonth: (userId: string, month: string) => `usage:${userId}:${month}`,
  rateLimit: (userId: string, endpoint: string) => `ratelimit:${userId}:${endpoint}`,
};

// Rate limiting helper
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  limit: number,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = cacheKeys.rateLimit(userId, endpoint);

  try {
    const current = await redis.incr(key);

    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining };
  } catch (error: any) {
    // If Upstash quota is exceeded, just log a warning and fail open
    if (error?.message?.includes('ERR max requests limit exceeded')) {
      console.warn('Redis rate limit quota exceeded. Failing open.');
    } else {
      console.error('Rate limit check error:', error);
    }
    // On error, allow the request (fail open)
    return { allowed: true, remaining: limit };
  }
}

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.set('test:connection', 'ok', { ex: 10 });
    const result = await redis.get('test:connection');
    await redis.del('test:connection');

    if (result === 'ok') {
      console.log('✅ Redis connection successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}
