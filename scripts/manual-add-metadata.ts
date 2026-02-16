
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔄 Manually adding metadata column to generated_drafts...');

    try {
        // Direct SQL execution to add metadata column
        await db.execute(sql`ALTER TABLE "generated_drafts" ADD COLUMN IF NOT EXISTS "metadata" jsonb`);
        console.log('✅ Added metadata column to generated_drafts');

        // Verification
        const result = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='generated_drafts' AND column_name='metadata';
        `);

        if (result.length > 0) {
            console.log('✅ Verification: metadata column exists.');
        } else {
            console.error('❌ Verification FAILED: metadata column MISSING.');
        }

    } catch (e) {
        console.log('⚠️ Error applying schema update:', e);
    }

    console.log('🏁 Manual migration complete.');
    process.exit(0);
}

main().catch(console.error);
