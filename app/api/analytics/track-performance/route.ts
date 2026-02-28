/**
 * Track Post Performance API
 * POST /api/analytics/track-performance
 * Records engagement metrics for published LinkedIn posts.
 * Core endpoint for the engagement feedback loop.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { postPerformance, generatedDrafts, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

import {
    classifyPerformance,
    getUserAverages,
    analyzeWinningPatterns,
} from '@/lib/ai/engagement-learning';

const performanceSchema = z.object({
    draftId: z.string().uuid(),
    likes: z.number().int().min(0),
    comments: z.number().int().min(0),
    reposts: z.number().int().min(0).optional().default(0),
    impressions: z.number().int().min(0).optional().default(0),
    postedAt: z.string().datetime().optional(),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const validation = await validateBody(req, performanceSchema);
        if (!validation.success) return validation.error;

        const { draftId, likes, comments, reposts, impressions, postedAt } = validation.data;

        // Verify draft belongs to user
        const draft = await db.query.generatedDrafts.findFirst({
            where: and(
                eq(generatedDrafts.id, draftId),
                eq(generatedDrafts.userId, user.id)
            ),
        });

        if (!draft) return errors.notFound('Draft');

        // Get user averages for relative classification
        const userAvgs = await getUserAverages(user.id);

        // Classify performance
        const { engagementRate, tier } = classifyPerformance({
            likes,
            comments,
            reposts: reposts ?? 0,
            impressions: impressions ?? 0,
            userAverages: userAvgs ?? undefined,
        });

        console.log(`📊 Performance tracked: ${tier} (${likes} likes, ${comments} comments, rate: ${engagementRate})`);

        // Upsert performance record (one per draft)
        const existing = await db.query.postPerformance.findFirst({
            where: and(
                eq(postPerformance.draftId, draftId),
                eq(postPerformance.userId, user.id)
            ),
        });

        let record;
        if (existing) {
            [record] = await db.update(postPerformance).set({
                likes,
                comments,
                reposts,
                impressions,
                engagementRate,
                performanceTier: tier,
                measuredAt: new Date(),
                updatedAt: new Date(),
            }).where(eq(postPerformance.id, existing.id)).returning();
        } else {
            [record] = await db.insert(postPerformance).values({
                userId: user.id,
                draftId,
                likes,
                comments,
                reposts,
                impressions,
                engagementRate,
                performanceTier: tier,
                postText: draft.fullText,
                postedAt: postedAt ? new Date(postedAt) : new Date(),
                measuredAt: new Date(),
            }).returning();
        }

        // Update the draft's posted status
        await db.update(generatedDrafts).set({
            status: 'posted',
            postedAt: postedAt ? new Date(postedAt) : new Date(),
            updatedAt: new Date(),
        }).where(eq(generatedDrafts.id, draftId));

        // If this is a top performer, trigger winning pattern re-analysis
        let patterns = null;
        if (tier === 'top_performer') {
            console.log('🏆 Top performer detected! Triggering pattern analysis...');
            try {
                patterns = await analyzeWinningPatterns(user.id);
                if (patterns) {
                    // Store winning patterns on the profile for prompt injection
                    await db.update(profiles).set({
                        // Store in metadata field since we have it available
                        updatedAt: new Date(),
                    }).where(eq(profiles.userId, user.id));

                    // Also update the performance record with patterns
                    await db.update(postPerformance).set({
                        winningPatterns: patterns,
                    }).where(eq(postPerformance.id, record.id));
                }
            } catch (err) {
                console.error('⚠️ Pattern analysis failed (non-fatal):', err);
            }
        }

        return responses.ok({
            id: record.id,
            performanceTier: tier,
            engagementRate: engagementRate / 100, // Return as percentage
            userAverages: userAvgs,
            winningPatterns: patterns,
        });

    } catch (error) {
        console.error('Error tracking performance:', error);
        return errors.internal('Failed to track performance');
    }
});
