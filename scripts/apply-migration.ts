import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔄 Applying migration: Add updated_at to classified_topics...');
    try {
        await db.execute(sql`ALTER TABLE classified_topics ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL`);
        console.log('✅ Migration applied successfully!');
    } catch (e: any) {
        if (e.message?.includes('already exists')) {
            console.log('ℹ️  Column already exists, skipping.');
        } else {
            console.error('❌ Migration failed:', e.message);
        }
    }
    process.exit(0);
}

main();
