/**
 * POST /api/onboarding/start-scraping
 * ─────────────────────────────────────────────────────────────────
 * Called from the LinkedIn URL input screen for non-OAuth users,
 * AND from the loading screen for LinkedIn OAuth users whose job
 * hasn't started yet (scraperStatus === 'pending').
 *
 * Always fires the import job directly (non-blocking) so it works
 * on localhost without a running BullMQ worker.
 * In production with USE_BACKGROUND_WORKER=true, also enqueues to BullMQ.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { profiles, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserExists } from '@/lib/api/ensure-user';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { linkedinUrl: providedUrl } = body;

        // If no URL provided in body, look up the one already on the profile
        let linkedinUrl = providedUrl;
        if (!linkedinUrl) {
            const profile = await db.query.profiles.findFirst({
                where: eq(profiles.userId, userId),
            });
            linkedinUrl = profile?.linkedinUrl;
        }

        if (!linkedinUrl || !String(linkedinUrl).includes('linkedin.com')) {
            return new NextResponse('Invalid or missing LinkedIn URL', { status: 400 });
        }

        // Ensure user row exists — MUST happen before profile UPSERT due to FK constraint.
        // Uses onConflictDoUpdate(email) to handle re-registration with same email (new Clerk ID).
        const userOk = await ensureUserExists(userId);
        if (!userOk) {
            return new NextResponse('Failed to create user record. Please try signing out and back in.', { status: 500 });
        }

        // UPSERT profile: create if missing, update if exists
        await db.insert(profiles).values({
            userId,
            linkedinUrl,
            scraperStatus: 'running',
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: profiles.userId,
            set: {
                linkedinUrl,
                scraperStatus: 'running',
                updatedAt: new Date(),
            },
        });
        console.log(`[StartScraping] Profile upserted for ${userId} with scraperStatus=running`);

        let enqueuedToBullMQ = false;

        // Attempt to enqueue to BullMQ for reliable background processing on Railway
        try {
            const { enqueueLinkedInImport } = await import('@/lib/queue');
            await enqueueLinkedInImport(userId, linkedinUrl, userId);
            console.log(`[StartScraping] Successfully queued to BullMQ for Railway worker: ${userId}`);
            enqueuedToBullMQ = true;
        } catch (err) {
            console.error('[StartScraping] BullMQ enqueue failed (falling back to direct Vercel execution):', err);
        }

        // Only fire the direct job IF BullMQ enqueue failed
        // This prevents Vercel from killing the direct job and falsely marking the status as 'failed'
        if (!enqueuedToBullMQ) {
            try {
                const { linkedInImportJob } = await import('@/lib/queue/jobs/linkedin-import');
                linkedInImportJob({ id: `direct-${userId}`, data: { userId, linkedinUrl, clerkId: userId } } as any)
                    .catch((err: any) => {
                        console.error('[StartScraping] Direct job failed:', err);
                        // Update status to failed so the loading screen falls back to manual
                        db.update(profiles).set({ scraperStatus: 'failed', updatedAt: new Date() })
                            .where(eq(profiles.userId, userId)).catch(() => { });
                    });
                console.log(`[StartScraping] Direct job fired for ${userId}: ${linkedinUrl}`);
            } catch (err) {
                console.error('[StartScraping] Failed to fire direct job:', err);
            }
        }

        return NextResponse.json({ success: true, message: 'Scraping started' });
    } catch (error: any) {
        console.error('[START_SCRAPING_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
