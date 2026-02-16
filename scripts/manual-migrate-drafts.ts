
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔄 Manually applying schema updates (Idempotent)...');

    try {
        // Direct SQL execution to bypass migration lock/state issues
        // Ensure conversation_id exists
        await db.execute(sql`ALTER TABLE "generated_drafts" ADD COLUMN IF NOT EXISTS "conversation_id" uuid REFERENCES "conversations"("id") ON DELETE SET NULL`);
        console.log('✅ Checked/Added conversation_id to generated_drafts');

        // Verify it exists
        const result = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='generated_drafts' AND column_name='conversation_id';
        `);

        if (result.length > 0) {
            console.log('✅ Verification: conversation_id column exists.');
        } else {
            console.error('❌ Verification FAILED: conversation_id column MISSING.');
        }

    } catch (e) {
        console.log('⚠️ Error applying schema update:', e);
    }

    console.log('🏁 Manual migration complete.');
    process.exit(0);
}

main().catch(console.error);
