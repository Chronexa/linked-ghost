import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

const isRevert = process.argv.includes('--revert');

async function up() {
    console.log('⬆️  Running UP migration: Removing legacy profile fields...\n');
    const steps = [
        { name: 'Drop target_audience', query: `ALTER TABLE "profiles" DROP COLUMN IF EXISTS "target_audience"` },
        { name: 'Drop content_goal', query: `ALTER TABLE "profiles" DROP COLUMN IF EXISTS "content_goal"` },
        { name: 'Drop custom_goal', query: `ALTER TABLE "profiles" DROP COLUMN IF EXISTS "custom_goal"` },
        { name: 'Drop writing_style', query: `ALTER TABLE "profiles" DROP COLUMN IF EXISTS "writing_style"` },
    ];

    for (const step of steps) {
        try {
            console.log(`  ⏳ ${step.name}...`);
            await db.execute(sql.raw(step.query));
            console.log(`  ✅ Done\n`);
        } catch (e: any) {
            console.error(`  ❌ FAILED: ${e.message}\n`);
        }
    }
    console.log('✅ UP migration complete. Legacy fields removed.');
}

async function down() {
    console.log('⬇️  Running DOWN migration: Restoring legacy profile fields...\n');
    const steps = [
        { name: 'Restore target_audience', query: `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "target_audience" text` },
        { name: 'Restore content_goal', query: `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "content_goal" text` },
        { name: 'Restore custom_goal', query: `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "custom_goal" text` },
        { name: 'Restore writing_style', query: `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "writing_style" text` },
    ];

    for (const step of steps) {
        try {
            console.log(`  ⏳ ${step.name}...`);
            await db.execute(sql.raw(step.query));
            console.log(`  ✅ Done\n`);
        } catch (e: any) {
            console.error(`  ❌ FAILED: ${e.message}\n`);
        }
    }
    console.log('✅ DOWN migration complete. Legacy fields restored.');
}

async function main() {
    if (isRevert) {
        await down();
    } else {
        await up();
    }
    process.exit(0);
}

main();
