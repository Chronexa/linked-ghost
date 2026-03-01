/**
 * POST /api/onboarding/confirm-profile
 * ─────────────────────────────────────────────────────────────────
 * Final step in onboarding: user confirms their profile, pillars,
 * and voice archetype. This endpoint:
 *   1. Activates confirmed pillars (suggested → active)
 *   2. Saves any archetype overrides
 *   3. Sets Clerk onboardingComplete = true
 *   4. Triggers the Magic Moment (first draft generation)
 *   5. Returns the conversationId for redirect to /drafts/[id]
 */

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { profiles, pillars, voiceExamples } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { triggerMagicMoment } from '@/lib/ai/magic-moment';
import { ensureUserExists } from '@/lib/api/ensure-user';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Ensure user + profile exist (handles local dev where Clerk webhook doesn't fire)
        await ensureUserExists(userId);
        await db.insert(profiles).values({
            userId,
            scraperStatus: 'skipped',
        }).onConflictDoNothing();

        const body = await req.json();
        const {
            confirmedPillarIds,  // string[] — IDs of pillars user wants to keep
            removedPillarIds,    // string[] — IDs of pillars user wants to discard
            voiceArchetype,      // optional override: 'expert' | 'storyteller' | 'contrarian' | 'educator'
            role,                // optional override from manual flow
            industry,            // optional override from manual flow
        } = body;

        // 1. Activate confirmed pillars
        if (confirmedPillarIds && confirmedPillarIds.length > 0) {
            await db.update(pillars)
                .set({ status: 'active', updatedAt: new Date() })
                .where(and(
                    eq(pillars.userId, userId),
                    inArray(pillars.id, confirmedPillarIds)
                ));
        }

        // 2. Remove discarded pillars (soft delete → inactive)
        if (removedPillarIds && removedPillarIds.length > 0) {
            await db.update(pillars)
                .set({ status: 'inactive', updatedAt: new Date() })
                .where(and(
                    eq(pillars.userId, userId),
                    inArray(pillars.id, removedPillarIds)
                ));
        }

        // 3. Update profile with overrides
        const profileUpdate: Record<string, any> = {
            profileCompleteness: 100,
            onboardingCompletedAt: new Date(),
            updatedAt: new Date(),
        };

        if (voiceArchetype) profileUpdate.voiceArchetype = voiceArchetype;
        if (role) profileUpdate.currentRole = role;
        if (industry) profileUpdate.industry = industry;

        await db.update(profiles)
            .set(profileUpdate)
            .where(eq(profiles.userId, userId));

        // 4. Set Clerk metadata to prevent redirect loop
        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(userId, {
                publicMetadata: { onboardingComplete: true },
            });
        } catch (authErr) {
            console.error('[ConfirmProfile] Clerk metadata update failed:', authErr);
        }

        // 5. Trigger Magic Moment (NON-BLOCKING)
        // Fire-and-forget: don't let magic moment errors block onboarding completion
        // The draft will generate in the background via BullMQ/direct job
        try {
            const profile = await db.query.profiles.findFirst({
                where: eq(profiles.userId, userId),
            });
            const uniqueAngle = profile?.uniqueAngle || profile?.linkedinHeadline || 'My professional perspective';
            const userExamples = await db.query.voiceExamples.findMany({
                where: eq(voiceExamples.userId, userId),
                limit: 3,
            });
            const voiceTexts = userExamples.map((ex) => ex.postText);

            // Fire and forget — don't await the full result
            triggerMagicMoment(userId, uniqueAngle, voiceTexts)
                .then((result) => console.log(`[ConfirmProfile] Magic moment result:`, result))
                .catch((err) => console.error('[ConfirmProfile] Magic moment failed (non-blocking):', err));
        } catch (mmErr) {
            console.error('[ConfirmProfile] Magic moment setup failed (non-blocking):', mmErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Onboarding confirmed. Your AI ghostwriter is ready.',
        });
    } catch (error: any) {
        console.error('[CONFIRM_PROFILE_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
