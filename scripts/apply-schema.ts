#!/usr/bin/env tsx

/**
 * Apply database schema directly
 * Run: tsx scripts/apply-schema.ts
 */

import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🚀 Applying database schema...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    // Read the migration SQL file
    const migrationFile = join(process.cwd(), 'lib/db/migrations/0000_minor_black_bolt.sql');
    const migrationSQL = readFileSync(migrationFile, 'utf-8');

    console.log('📄 Executing SQL migration...\n');

    // Execute the SQL
    await sql.unsafe(migrationSQL);

    console.log('\n✅ Database schema applied successfully!');
    console.log('\n📊 Created tables:');
    console.log('  - users');
    console.log('  - profiles');
    console.log('  - pillars');
    console.log('  - voice_examples');
    console.log('  - raw_topics');
    console.log('  - classified_topics');
    console.log('  - generated_drafts');
    console.log('  - subscriptions');
    console.log('  - usage_tracking');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error applying schema:', error);
    await sql.end();
    process.exit(1);
  }
}

main();
