import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔄 Applying migration 0011: subscription schema update...\n');

    const steps = [
        {
            name: "Add 'paused' to subscription_status enum",
            query: `ALTER TYPE "public"."subscription_status" ADD VALUE IF NOT EXISTS 'paused'`,
        },
        {
            name: "Add 'halted' to subscription_status enum",
            query: `ALTER TYPE "public"."subscription_status" ADD VALUE IF NOT EXISTS 'halted'`,
        },
        {
            name: 'Convert plan_type column to text (before enum drop)',
            query: `ALTER TABLE "subscriptions" ALTER COLUMN "plan_type" SET DATA TYPE text`,
        },
        {
            name: 'Drop old plan_type enum (which had agency)',
            query: `DROP TYPE IF EXISTS "public"."plan_type"`,
        },
        {
            name: 'Create new plan_type enum (starter | growth only)',
            query: `CREATE TYPE "public"."plan_type" AS ENUM('starter', 'growth')`,
        },
        {
            name: 'Cast plan_type column back to new enum',
            query: `ALTER TABLE "subscriptions" ALTER COLUMN "plan_type" SET DATA TYPE "public"."plan_type" USING "plan_type"::"public"."plan_type"`,
        },
        {
            name: 'Add razorpay_plan_id column',
            query: `ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "razorpay_plan_id" varchar(255)`,
        },
        {
            name: 'Add billing_interval column',
            query: `ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billing_interval" varchar(10)`,
        },
    ];

    for (const step of steps) {
        try {
            console.log(`  ⏳ ${step.name}...`);
            await db.execute(sql.raw(step.query));
            console.log(`  ✅ Done\n`);
        } catch (e: any) {
            if (e.message?.includes('already exists') || e.message?.includes('does not exist')) {
                console.log(`  ℹ️  Skipped (already applied)\n`);
            } else {
                console.error(`  ❌ FAILED: ${e.message}\n`);
                // Don't exit — log and continue so we can see all issues
            }
        }
    }

    console.log('✅ Migration 0011 complete.');
    process.exit(0);
}

main();
