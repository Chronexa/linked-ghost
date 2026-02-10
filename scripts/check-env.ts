#!/usr/bin/env tsx

/**
 * Check if all required environment variables are set
 * Run: npm run check-env
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'OPENAI_API_KEY',
  'PERPLEXITY_API_KEY',
];

const optionalEnvVars = [
  'CLERK_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

function main() {
  console.log('🔍 Checking environment variables...\n');

  let allSet = true;
  let missingVars: string[] = [];

  // Check required variables
  console.log('📌 Required variables:');
  requiredEnvVars.forEach((varName) => {
    const isSet = !!process.env[varName];
    const status = isSet ? '✅' : '❌';
    console.log(`${status} ${varName}`);

    if (!isSet) {
      allSet = false;
      missingVars.push(varName);
    }
  });

  // Check optional variables
  console.log('\n📎 Optional variables (for later phases):');
  optionalEnvVars.forEach((varName) => {
    const isSet = !!process.env[varName];
    const status = isSet ? '✅' : '⚪️';
    console.log(`${status} ${varName}`);
  });

  console.log('\n' + '='.repeat(50));

  if (allSet) {
    console.log('\n✅ All required environment variables are set!');
    console.log('   You can proceed with database setup.');
    process.exit(0);
  } else {
    console.log('\n❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log('\n📖 Please check BACKEND-SETUP-GUIDE.md for instructions.');
    process.exit(1);
  }
}

main();
