
import * as dotenv from 'dotenv';
import path from 'path';
// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function applyFix() {
    console.log('🔧 Applying DB Fix...');
    try {
        // Add constraint. Use explicit name to match schema.ts definition if possible, 
        // though schema.ts uses "uniqueIndex" which might generate a different name than manual constraint.
        // Let's use the standard name format: table_column_unique
        // usage_tracking_user_id_month_unique was the name in the prompt.

        await db.execute(sql`
            ALTER TABLE "usage_tracking" 
            ADD CONSTRAINT "usage_tracking_user_id_month_unique" 
            UNIQUE("user_id", "month");
        `);
        console.log('✅ Successfully added unique constraint.');
    } catch (error: any) {
        // 42P07: duplicate_object (constraint already exists)
        if (error.code === '42P07') {
            console.log('⚠️ Constraint or index already exists.');
        } else {
            console.error('❌ Failed:', error);
            // Log strict error details
            if (error.routine) console.log('Routine:', error.routine);
            process.exit(1);
        }
    }
    process.exit(0);
}

applyFix().catch(console.error);
