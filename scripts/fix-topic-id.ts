
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔄 Manually fixing generated_drafts schema...');

    try {
        // Direct SQL execution to fix topic_id constraint
        await db.execute(sql`ALTER TABLE "generated_drafts" ALTER COLUMN "topic_id" DROP NOT NULL`);
        console.log('✅ Altered generated_drafts: topic_id is now nullable');

        // Verification
        const result = await db.execute(sql`
            SELECT is_nullable 
            FROM information_schema.columns 
            WHERE table_name='generated_drafts' AND column_name='topic_id';
        `);

        if (result.length > 0 && result[0].is_nullable === 'YES') {
            console.log('✅ Verification: topic_id is nullable.');
        } else {
            console.error('❌ Verification FAILED: topic_id is likely still NOT NULL.');
            console.log('Result:', result);
        }

    } catch (e) {
        console.log('⚠️ Error applying schema update:', e);
    }

    console.log('🏁 Manual migration complete.');
    process.exit(0);
}

main().catch(console.error);
