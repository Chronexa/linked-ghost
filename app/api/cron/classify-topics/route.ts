import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rawTopics } from '@/lib/db/schema';
import { enqueueClassification } from '@/lib/queue';
import { eq, lt } from 'drizzle-orm';

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
        console.log('⏰ Starting Batch Classification Cron Job...');

        // 2. Fetch pending topics (limit 50 per run to avoid overload)
        const newTopics = await db.query.rawTopics.findMany({
            where: eq(rawTopics.status, 'new'),
            limit: 50,
            orderBy: (topics, { desc }) => [desc(topics.createdAt)],
        });

        console.log(`   Found ${newTopics.length} new topics.`);

        // 3. Enqueue classification jobs
        let enqueuedCount = 0;
        for (const topic of newTopics) {
            await enqueueClassification(topic.id);
            enqueuedCount++;
        }

        console.log(`✅ Enqueued ${enqueuedCount} classification jobs.`);

        return NextResponse.json({
            success: true,
            data: {
                topicsProcessed: enqueuedCount,
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
