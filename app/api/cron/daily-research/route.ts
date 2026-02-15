import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { enqueueResearch } from '@/lib/queue';
import { eq, gte, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Secret token verification for Cron Jobs
function verifyCron(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return false;
    }
    return true;
}

export async function POST(req: NextRequest) {
    // 1. Verify Authentication
    if (!verifyCron(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('⏰ Starting Daily Research Cron Job...');

        // 2. Fetch all active users (logged in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = await db.query.users.findMany({
            where: and(
                eq(users.status, 'active'),
                gte(users.lastLoginAt, sevenDaysAgo)
            ),
            columns: { id: true, email: true },
        });

        console.log(`   Found ${activeUsers.length} active users.`);

        // 3. Enqueue jobs for each user
        let enqueuedCount = 0;
        for (const user of activeUsers) {
            // Add research job to BullMQ
            await enqueueResearch(user.id);
            enqueuedCount++;
        }

        console.log(`✅ Enqueued ${enqueuedCount} research jobs.`);

        return NextResponse.json({
            success: true,
            data: {
                usersProcessed: enqueuedCount,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Cron job failed:', error.message);
            return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
        } else {
            console.error('❌ Cron job failed:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
}
