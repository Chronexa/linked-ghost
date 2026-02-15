
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function auditDatabase() {
    console.log('🔍 Starting Database Audit...\n');

    try {
        // 1. Connection Check
        const startTime = Date.now();
        await db.execute(sql`SELECT 1`);
        const duration = Date.now() - startTime;
        console.log(`✅ Connection: OK (${duration}ms)`);

        // 2. Schema Check - generated_drafts
        console.log('\n📊 Checking schema: generated_drafts');
        const draftsResult: any = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'generated_drafts'
    `);

        // Postgres.js returns the array of rows directly
        const draftsColumns = Array.isArray(draftsResult) ? draftsResult : (draftsResult.rows || []);

        const hasUserPerspective = draftsColumns.some((row: any) => row.column_name === 'user_perspective');

        if (hasUserPerspective) {
            console.log('  ✅ user_perspective column exists');
        } else {
            console.error('  ❌ CRITICAL: user_perspective column MISSING');
        }

        // 3. Schema Check - profiles
        console.log('\n📊 Checking schema: profiles');
        const profileResult: any = await db.execute(sql`
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'profiles'
    `);

        const profileColumns = Array.isArray(profileResult) ? profileResult : (profileResult.rows || []);

        // List found columns for manual verification
        console.log('  Found columns:', profileColumns.map((r: any) => r.column_name).join(', '));

        // 4. Schema Check - classified_topics
        console.log('\n📊 Checking schema: classified_topics');
        const topicsResult: any = await db.execute(sql`
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'classified_topics'
    `);

        const topicsColumns = Array.isArray(topicsResult) ? topicsResult : (topicsResult.rows || []);
        console.log('  Found columns:', topicsColumns.map((r: any) => r.column_name).join(', '));

        console.log('\n✅ Audit Complete');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Audit Failed:', error);
        process.exit(1);
    }
}

auditDatabase();
