#!/usr/bin/env tsx
/**
 * Applies migration 0006 profile columns so research-ideas and /api/user work.
 * Run: npx tsx scripts/apply-profile-columns.ts
 * Requires: .env.local with DATABASE_URL
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Applying missing profile columns (default_instructions, linkedin_headline, linkedin_summary)...\n');

  for (const stmt of [
    sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "default_instructions" text`,
    sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_headline" varchar(500)`,
    sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_summary" text`,
  ]) {
    try {
      await db.execute(stmt);
    } catch (e: unknown) {
      const err = e as { message?: string };
      if (!err.message?.includes('already exists')) throw e;
    }
  }
  console.log('Profile columns added (or already present).');

  try {
    await db.execute(sql`CREATE TYPE "voice_example_source" AS ENUM('own_post', 'reference')`);
    console.log('Enum voice_example_source created.');
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err.message?.includes('already exists')) {
      console.log('Enum voice_example_source already exists.');
    } else {
      throw e;
    }
  }

  try {
    await db.execute(sql`
      ALTER TABLE "voice_examples"
      ADD COLUMN IF NOT EXISTS "source" "voice_example_source" NOT NULL DEFAULT 'own_post'
    `);
    console.log('voice_examples.source column added (or already present).');
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err.message?.includes('already exists')) {
      console.log('voice_examples.source already exists.');
    } else {
      throw e;
    }
  }

  console.log('\nDone. Restart the dev server and try research / profile again.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
