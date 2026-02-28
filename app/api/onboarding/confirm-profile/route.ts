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

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

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

        // 5. Trigger Magic Moment
        // Get user's unique angle from profile for the first draft
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        const uniqueAngle = profile?.uniqueAngle || profile?.linkedinHeadline || 'My professional perspective';

        // Get voice example texts for the draft
        const userExamples = await db.query.voiceExamples.findMany({
            where: eq(voiceExamples.userId, userId),
            limit: 3,
        });
        const voiceTexts = userExamples.map((ex) => ex.postText);

        const magicResult = await triggerMagicMoment(userId, uniqueAngle, voiceTexts);

        return NextResponse.json({
            success: true,
            conversationId: magicResult.conversationId,
            message: 'Onboarding confirmed. Your AI ghostwriter is ready.',
        });
    } catch (error: any) {
        console.error('[CONFIRM_PROFILE_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
