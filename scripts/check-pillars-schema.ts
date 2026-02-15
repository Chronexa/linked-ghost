import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '@/lib/db';

async function main() {
    console.log('Checking pillars table columns...');

    const result = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'pillars'
  `);

    console.log('Columns found:', result);
}

main().catch(console.error);
