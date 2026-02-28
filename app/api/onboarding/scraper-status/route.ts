/**
 * GET /api/onboarding/scraper-status
 * ─────────────────────────────────────────────────────────────────
 * Polled by the frontend loading screen every 2 seconds.
 * Returns the current state of the LinkedIn scraper pipeline.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { profiles, voiceExamples, pillars } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';


export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get profile with scraper status
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        if (!profile) {
            // Return 200 with a status the frontend can handle — NOT 404
            // 404 causes the polling loop to silently ignore and keep retrying forever
            return NextResponse.json({
                scraperStatus: 'not_found',
                postsFound: 0,
                pillarsGenerated: 0,
                voiceArchetype: null,
                voiceDna: null,
                fullName: null,
                linkedinHeadline: null,
            });
        }

        // Count posts scraped
        const [postsResult] = await db
            .select({ total: count() })
            .from(voiceExamples)
            .where(and(
                eq(voiceExamples.userId, userId),
                eq(voiceExamples.source, 'apify_scrape')
            ));

        // Count suggested pillars
        const [pillarsResult] = await db
            .select({ total: count() })
            .from(pillars)
            .where(and(
                eq(pillars.userId, userId),
                eq(pillars.status, 'suggested')
            ));

        return NextResponse.json({
            scraperStatus: profile.scraperStatus || 'pending',
            postsFound: postsResult?.total || 0,
            pillarsGenerated: pillarsResult?.total || 0,
            voiceArchetype: profile.voiceArchetype || null,
            voiceDna: profile.voiceDna || null,
            fullName: profile.fullName || null,
            linkedinHeadline: profile.linkedinHeadline || null,
        });
    } catch (error: any) {
        console.error('[SCRAPER_STATUS_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
