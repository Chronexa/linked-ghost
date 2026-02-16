
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from '@/lib/db';
import { sql, eq, and } from 'drizzle-orm';
import { usageTracking } from '@/lib/db/schema';
import { incrementUsage } from '@/lib/ai/usage';

async function runCTOVerification() {
    console.log('🛡️  CTO VERIFICATION PROTOCOL INITIATED...\n');
    let failures = 0;

    // 1. Schema Integrity Check
    console.log('1️⃣  Verifying Schema Integrity...');
    try {
        const result: any[] = await db.execute(sql`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'usage_tracking' 
            AND indexdef LIKE '%UNIQUE%';
        `);

        const hasConstraint = result.some(r => r.indexname.includes('user_id_month') || r.indexdef.includes('(user_id, month)'));

        if (hasConstraint) {
            console.log('   ✅ Unique Constraint CONFIRMED on (user_id, month)');
        } else {
            console.error('   ❌ CRITICAL FAILURE: Unique Constraint MISSING');
            console.log('      Found indexes:', result.map(r => r.indexname).join(', '));
            failures++;
        }
    } catch (e) {
        console.error('   ❌ Schema check failed execution:', e);
        failures++;
    }

    // 2. Logic Simulation (The "Smoke Test")
    console.log('\n2️⃣  Simulating Usage Tracking Logic...');
    const TEST_USER_ID = 'cto_test_user_' + Date.now();
    // incrementUsage uses current month, so we must query for it
    const date = new Date();
    const TEST_MONTH = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    try {
        // 0. Create Parent User (Foreign Key Requirement)
        console.log('   0. Creating Test User Identity...');
        await db.execute(sql`
            INSERT INTO users (id, email, full_name, status)
            VALUES (${TEST_USER_ID}, 'cto_test@example.com', 'CTO Test User', 'active')
            ON CONFLICT (id) DO NOTHING
        `);

        // A. First Insert (Create)
        console.log('   A. Attempting Initial Record Creation...');
        await incrementUsage(TEST_USER_ID, 'generate_post', 1);

        const recordA = await db.execute(sql`
            SELECT * FROM usage_tracking 
            WHERE user_id = ${TEST_USER_ID} AND month = ${TEST_MONTH}
        `);

        if (recordA.length === 1 && (recordA[0] as any).posts_generated === 1) {
            console.log('      ✅ Initial Insert Successful (Count: 1)');
        } else {
            console.error('      ❌ Initial Insert FAILED');
            failures++;
        }

        // B. Second Insert (Upsert/Increment) - THIS is where it failed before
        console.log('   B. Attempting Increment (Triggering ON CONFLICT)...');
        await incrementUsage(TEST_USER_ID, 'generate_post', 2);

        const recordB = await db.execute(sql`
            SELECT * FROM usage_tracking 
            WHERE user_id = ${TEST_USER_ID} AND month = ${TEST_MONTH}
        `);

        if (recordB.length === 1 && (recordB[0] as any).posts_generated === 3) { // 1 + 2 = 3
            console.log('      ✅ Increment Successful (Count: 3)');
        } else {
            console.error(`      ❌ Increment FAILED. Expected 3, got ${(recordB[0] as any)?.posts_generated}`);
            failures++;
        }

    } catch (e) {
        console.error('   ❌ Logic simulation failed exception:', e);
        failures++;
    } finally {
        // Cleanup
        console.log('   🧹 Cleaning up test data...');
        await db.execute(sql`DELETE FROM usage_tracking WHERE user_id = ${TEST_USER_ID}`);
        await db.execute(sql`DELETE FROM users WHERE id = ${TEST_USER_ID}`);
    }

    // Summary
    console.log('\n' + '='.repeat(40));
    if (failures === 0) {
        console.log('✅ PROTOCOL PASSED. SYSTEM INTEGRITY VERIFIED.');
        process.exit(0);
    } else {
        console.error(`❌ PROTOCOL FAILED. ${failures} CRITICAL ERROR(S) FOUND.`);
        process.exit(1);
    }
}

runCTOVerification();
