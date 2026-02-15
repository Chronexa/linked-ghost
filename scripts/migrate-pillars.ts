import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

async function main() {
    console.log('Adding cta and positioning columns to pillars table...');

    await db.execute(sql`
    ALTER TABLE pillars 
    ADD COLUMN IF NOT EXISTS cta text,
    ADD COLUMN IF NOT EXISTS positioning text;
  `);

    console.log('Migration completed successfully.');
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
