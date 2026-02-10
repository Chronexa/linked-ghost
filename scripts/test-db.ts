#!/usr/bin/env tsx

/**
 * Test database connection
 * Run: npm run db:test
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { testConnection } from '../lib/db';

async function main() {
  console.log('🧪 Testing database connection...\n');

  const isConnected = await testConnection();

  if (isConnected) {
    console.log('\n✅ Database is ready to use!');
    process.exit(0);
  } else {
    console.log('\n❌ Database connection failed. Please check:');
    console.log('  1. DATABASE_URL is set in .env.local');
    console.log('  2. Supabase project is running');
    console.log('  3. Connection string is correct');
    console.log('  4. Your IP is allowed in Supabase');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error testing database:', error);
  process.exit(1);
});
