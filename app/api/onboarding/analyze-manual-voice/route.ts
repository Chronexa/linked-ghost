/**
 * POST /api/onboarding/analyze-manual-voice
 * ─────────────────────────────────────────────────────────────────
 * Fallback endpoint for when Apify scraping fails or the user
 * signed up without LinkedIn. Accepts pasted posts and runs
 * the existing Voice DNA extraction + pillar generation.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { profiles, voiceExamples, pillars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { extractVoiceDNA } from '@/lib/ai/voice-dna';
import { generatePillarsFromText } from '@/lib/ai/pillar-generator';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { ensureUserExists } from '@/lib/api/ensure-user';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { posts, role, industry, topics } = body;

        if (!posts || !Array.isArray(posts) || posts.length < 1) {
            return new NextResponse('At least 1 post is required', { status: 400 });
        }

        // Filter out empty posts
        const validPosts = posts.filter((p: string) => p && p.trim().length > 50);
        if (validPosts.length === 0) {
            return new NextResponse('Posts must be at least 50 characters', { status: 400 });
        }

        console.log(`[Manual Voice] Analyzing ${validPosts.length} posts for user ${userId}`);

        // Ensure user + profile rows exist before inserting FK-constrained data
        const userOk = await ensureUserExists(userId);
        if (!userOk) {
            return new NextResponse('Failed to create user record. Please sign out and back in.', { status: 500 });
        }
        // Upsert profile (may not exist if Clerk webhook didn't fire)
        await db.insert(profiles).values({
            userId,
            scraperStatus: 'skipped',
        }).onConflictDoNothing();

        // 1. Extract Voice DNA
        const voiceDNA = await extractVoiceDNA(validPosts);
        const embedding = await generateEmbedding(JSON.stringify(voiceDNA));

        // 2. Store voice examples
        const exampleInserts = validPosts.map((postText: string) => ({
            userId,
            postText,
            characterCount: postText.length,
            source: 'manual_paste',
            status: 'active',
            engagementWeight: 1,
        }));
        await db.insert(voiceExamples).values(exampleInserts);

        // 3. Generate pillars (if role/industry/topics provided)
        let generatedPillars: any[] = [];
        if (role && industry) {
            const pillarResults = await generatePillarsFromText(
                role,
                industry,
                topics || [],
                validPosts
            );

            if (pillarResults.length > 0) {
                const pillarInserts = pillarResults.map((pillar, index) => ({
                    userId,
                    name: pillar.name,
                    slug: pillar.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                    description: pillar.description,
                    targetAudience: pillar.targetAudience,
                    emoji: pillar.emoji,
                    exampleTopics: pillar.exampleTopics,
                    sortOrder: index,
                    status: 'suggested' as const,
                }));

                await db.insert(pillars).values(pillarInserts);
                generatedPillars = pillarResults;
            }
        }

        // 4. Update profile
        await db.update(profiles).set({
            voiceDna: voiceDNA,
            voiceEmbedding: embedding,
            voiceConfidenceScore: validPosts.length >= 3 ? 65 : 40,
            scraperStatus: 'skipped',
            voiceDnaExtractedAt: new Date(),
            pillarsGeneratedAt: generatedPillars.length > 0 ? new Date() : undefined,
            updatedAt: new Date(),
        }).where(eq(profiles.userId, userId));

        return NextResponse.json({
            success: true,
            voiceDNA,
            pillars: generatedPillars,
            postsAnalyzed: validPosts.length,
        });
    } catch (error: any) {
        console.error('[MANUAL_VOICE_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
