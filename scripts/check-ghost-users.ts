import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔍 Checking for ghost onboarded users...');

    try {
        const result = await db.execute(sql.raw(`
            SELECT 
                u.id AS user_id,
                u.email,
                u.full_name,
                p.onboarding_completed_at,
                (p.voice_dna IS NULL) AS missing_voice_dna,
                COUNT(pl.id) AS active_pillar_count
            FROM profiles p
            JOIN users u ON u.id = p.user_id
            LEFT JOIN pillars pl ON pl.user_id = p.user_id AND pl.status = 'active'
            WHERE p.onboarding_completed_at IS NOT NULL
            GROUP BY 
                u.id, 
                u.email, 
                u.full_name, 
                p.onboarding_completed_at, 
                p.voice_dna
            HAVING 
                p.voice_dna IS NULL 
                OR COUNT(pl.id) = 0
            ORDER BY 
                p.onboarding_completed_at DESC;
        `));

        console.log(`\nFound ${result.length} ghost users.\n`);

        if (result.length > 0) {
            console.table(result);
        }
    } catch (e: any) {
        console.error('❌ Failed to run query:', e.message);
    }

    process.exit(0);
}

main();
