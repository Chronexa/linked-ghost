
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function main() {

    const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name='generated_drafts';
    `);

    console.log('generated_drafts columns:', result);
    process.exit(0);
}

main().catch(console.error);
