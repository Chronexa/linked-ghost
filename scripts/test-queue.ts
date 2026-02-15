import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🧪 Testing Queue System...');

    // Use dynamic imports to ensure env vars are loaded first
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');
    const { researchJob } = await import('@/lib/queue/jobs/research');
    const { enqueueResearch } = await import('@/lib/queue');
    const { eq } = await import('drizzle-orm');

    // 1. Fetch a test user
    const user = await db.query.users.findFirst();
    if (!user) {
        console.error('❌ No user found. Create a user first.');
        return;
    }
    console.log(`👤 Using user: ${user.fullName} (${user.id})`);

    // 2. Trigger Research (Direct Call for debugging logic)
    console.log('\n--- Test 1: Direct Job Logic (Research) ---');
    try {
        const jobResult = await researchJob({ data: { userId: user.id } } as any);
        console.log('✅ Research Direct Success:', jobResult);
    } catch (error) {
        console.error('❌ Research logic failed:', error);
    }

    // 3. Trigger Classification (Simulation)
    console.log('\n--- Test 2: Enqueue Job (Real Queue) ---');
    try {
        // Just enqueue, don't wait for result (worker must be running separately)
        await enqueueResearch(user.id);
        console.log('✅ Job enqueued successfully. Check worker logs.');
    } catch (error) {
        console.error('❌ Enqueue failed:', error);
    }

    process.exit(0);
}

main().catch(console.error);
