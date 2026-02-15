#!/usr/bin/env tsx
/**
 * Safe Migration Script - Adds user_perspective column
 * This handles the case where column might already exist
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function applyMigration() {
    console.log('🔧 Applying Migration: Add user_perspective column\n');

    try {
        // Step 1: Check if column already exists
        const result: any = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'generated_drafts' 
      AND column_name = 'user_perspective'
    `);

        const columns = Array.isArray(result) ? result : (result.rows || []);

        if (columns.length > 0) {
            console.log('✅ Column already exists - no action needed!');
            process.exit(0);
        }

        // Step 2: Add the column
        console.log('📝 Adding column...');
        await db.execute(sql`
      ALTER TABLE "generated_drafts" 
      ADD COLUMN "user_perspective" text NOT NULL DEFAULT ''
    `);

        console.log('✅ Migration complete!');
        console.log('\n🎯 Next: Restart your dev server to pick up changes');

        process.exit(0);

    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

applyMigration();
