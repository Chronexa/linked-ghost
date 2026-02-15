import * as dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is required');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL);

    try {
        console.log('🔄 Adding columns to profiles table...');

        // Add columns one by one, ignore if exists (though postgres doesn't have "IF NOT EXISTS" for columns easily in one line without plpgsql, we can just try/catch individually or use a block)
        // Actually, simple ALTER TABLE works. If it fails (already exists), we catch it.

        const columns = [
            `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "perplexity_enabled" boolean DEFAULT true`,
            `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "reddit_enabled" boolean DEFAULT false`,
            `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "reddit_keywords" text`,
            `ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "manual_only" boolean DEFAULT false`
        ];

        for (const query of columns) {
            try {
                await sql.unsafe(query);
                console.log(`✅ Executed: ${query}`);
            } catch (e: any) {
                console.warn(`⚠️ Failed (might exist): ${query}`, e.message);
            }
        }

        console.log('✅ Migration complete');
        await sql.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await sql.end();
        process.exit(1);
    }
}

main().catch(console.error);
