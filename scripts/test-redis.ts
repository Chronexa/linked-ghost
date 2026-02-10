#!/usr/bin/env tsx

/**
 * Test Redis connection
 * Run: npm run redis:test
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { testRedisConnection, redis, cache, cacheKeys } from '../lib/redis';

async function main() {
  console.log('🧪 Testing Redis connection...\n');

  const isConnected = await testRedisConnection();

  if (!isConnected) {
    console.log('\n❌ Redis connection failed. Please check:');
    console.log('  1. REDIS_URL is set in .env.local');
    console.log('  2. Upstash Redis database is running');
    console.log('  3. Connection string is correct');
    process.exit(1);
  }

  console.log('\n🧪 Testing cache operations...\n');

  // Test basic cache operations
  const testKey = cacheKeys.user('test-user-123');
  const testData = { name: 'Test User', email: 'test@example.com' };

  // SET
  console.log('Setting cache key:', testKey);
  await cache.set(testKey, testData, 60);

  // GET
  console.log('Getting cache key:', testKey);
  const retrieved = await cache.get(testKey);
  console.log('Retrieved data:', retrieved);

  // EXISTS
  const exists = await cache.exists(testKey);
  console.log('Key exists:', exists);

  // DELETE
  console.log('Deleting cache key:', testKey);
  await cache.del(testKey);

  const existsAfterDel = await cache.exists(testKey);
  console.log('Key exists after delete:', existsAfterDel);

  console.log('\n✅ Redis is ready to use!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error testing Redis:', error);
  process.exit(1);
});
