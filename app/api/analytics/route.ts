/**
 * Analytics API - Dashboard stats
 * GET /api/analytics - Aggregated content stats for the current user
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { rateLimit } from '@/lib/api/rate-limit';
import { db } from '@/lib/db';
import { generatedDrafts, pillars } from '@/lib/db/schema';
import { eq, and, gte, sql, desc, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';


/**
 * GET /api/analytics
 * Returns draft counts, pillar distribution, and recent activity
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const limited = await rateLimit(req, user.id, 'authenticated');
    if (limited) return limited;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total drafts
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generatedDrafts)
      .where(eq(generatedDrafts.userId, user.id));

    // Drafts created this month
    const [thisMonthResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generatedDrafts)
      .where(
        and(
          eq(generatedDrafts.userId, user.id),
          gte(generatedDrafts.createdAt, startOfMonth)
        )
      );

    // Approved/scheduled/posted count
    const [approvedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generatedDrafts)
      .where(
        and(
          eq(generatedDrafts.userId, user.id),
          inArray(generatedDrafts.status, ['approved', 'scheduled', 'posted'])
        )
      );

    // Per-pillar stats: pillar name + draft count + avg estimated engagement
    const pillarStatsRows = await db
      .select({
        pillarId: generatedDrafts.pillarId,
        pillarName: pillars.name,
        postCount: sql<number>`count(*)::int`,
        avgEngagement: sql<number>`round(avg(${generatedDrafts.estimatedEngagement}))::int`,
      })
      .from(generatedDrafts)
      .leftJoin(pillars, eq(generatedDrafts.pillarId, pillars.id))
      .where(eq(generatedDrafts.userId, user.id))
      .groupBy(generatedDrafts.pillarId, pillars.name)
      .orderBy(desc(sql`count(*)`));

    const totalDrafts = totalResult?.count ?? 0;
    const pillarStats = pillarStatsRows.map((row) => ({
      name: row.pillarName || 'Unknown',
      posts: row.postCount,
      avgScore: row.avgEngagement ?? null,
      percentage: totalDrafts > 0 ? Math.round((row.postCount / totalDrafts) * 100) : 0,
    }));

    // Top pillar by post count
    const topPillar = pillarStats[0]?.name ?? '—';
    const topPillarPosts = pillarStats[0]?.posts ?? 0;

    // Average estimated engagement across all drafts
    const [avgEngagementRow] = await db
      .select({
        avgEngagement: sql<number>`round(avg(${generatedDrafts.estimatedEngagement}))::int`,
      })
      .from(generatedDrafts)
      .where(eq(generatedDrafts.userId, user.id));

    // Recent drafts (last 10)
    const recentDrafts = await db
      .select({
        id: generatedDrafts.id,
        fullText: generatedDrafts.fullText,
        pillarName: pillars.name,
        createdAt: generatedDrafts.createdAt,
        estimatedEngagement: generatedDrafts.estimatedEngagement,
        status: generatedDrafts.status,
      })
      .from(generatedDrafts)
      .leftJoin(pillars, eq(generatedDrafts.pillarId, pillars.id))
      .where(eq(generatedDrafts.userId, user.id))
      .orderBy(desc(generatedDrafts.createdAt))
      .limit(10);

    return responses.ok({
      totalDrafts,
      draftsThisMonth: thisMonthResult?.count ?? 0,
      approvedOrPosted: approvedResult?.count ?? 0,
      avgScore: avgEngagementRow?.avgEngagement ?? null,
      topPillar,
      topPillarPosts,
      pillarStats,
      recentDrafts: recentDrafts.map((d) => ({
        id: d.id,
        text: d.fullText?.slice(0, 80) + (d.fullText && d.fullText.length > 80 ? '...' : ''),
        pillar: d.pillarName,
        date: d.createdAt ? new Date(d.createdAt).toISOString().slice(0, 10) : null,
        score: d.estimatedEngagement,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return errors.internal('Failed to fetch analytics');
  }
});
