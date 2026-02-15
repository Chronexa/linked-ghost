import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rawTopics, classifiedTopics, generatedDrafts } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/get-user';

/**
 * GET /api/user/stats
 * Returns aggregated dashboard statistics in a single request
 * Replaces client-side aggregation of 100+ topics
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Run all COUNT queries in parallel for performance
        const [
            pendingResult,
            classifiedResult,
            draftsResult,
            monthlyResult,
        ] = await Promise.all([
            // Count pending raw topics
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(rawTopics)
                .where(and(eq(rawTopics.userId, user.id), eq(rawTopics.status, 'new'))),

            // Count classified topics
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(classifiedTopics)
                .where(eq(classifiedTopics.userId, user.id)),

            // Count drafts and approval rate
            db
                .select({
                    total: sql<number>`count(*)::int`,
                    approved: sql<number>`count(*) filter (where status in ('approved', 'scheduled', 'posted'))::int`,
                })
                .from(generatedDrafts)
                .where(eq(generatedDrafts.userId, user.id)),

            // Count posts this month
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(generatedDrafts)
                .where(
                    and(
                        eq(generatedDrafts.userId, user.id),
                        gte(generatedDrafts.createdAt, sql`date_trunc('month', CURRENT_DATE)`)
                    )
                ),
        ]);

        const pendingTopics = pendingResult[0]?.count || 0;
        const classifiedTopicsCount = classifiedResult[0]?.count || 0;
        const totalDrafts = draftsResult[0]?.total || 0;
        const approvedDrafts = draftsResult[0]?.approved || 0;
        const postsThisMonth = monthlyResult[0]?.count || 0;

        const approvalRate = totalDrafts > 0
            ? Math.round((approvedDrafts / totalDrafts) * 100)
            : 0;

        return NextResponse.json({
            data: {
                pendingTopics,
                classifiedTopics: classifiedTopicsCount,
                generatedPosts: totalDrafts,
                approvalRate,
                postsThisMonth,
            },
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
