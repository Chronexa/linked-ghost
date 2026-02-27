/**
 * LinkedIn Import — BullMQ Job Handler
 * ─────────────────────────────────────────────────────────────────
 * Orchestrates the full LinkedIn scraping + AI analysis pipeline:
 *
 * 1. Scrape posts via Apify
 * 2. Scrape profile via Apify
 * 3. Store posts as voice examples with engagement data
 * 4. Extract Voice DNA (engagement-weighted)
 * 5. Auto-generate 4 content pillars
 * 6. Update profile with results
 *
 * This job is enqueued from the Clerk webhook on user.created
 * when a LinkedIn URL is available.
 */

import { Job } from 'bullmq';
import { db } from '@/lib/db';
import { profiles, voiceExamples, pillars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { scrapeLinkedInPosts, scrapeLinkedInProfile } from '@/lib/apify/linkedin-scraper';
import { extractVoiceDNAFromApify } from '@/lib/ai/voice-dna';
import { generateContentPillars } from '@/lib/ai/pillar-generator';
import { generateEmbedding } from '@/lib/ai/embeddings';

export interface LinkedInImportJobData {
    userId: string;
    linkedinUrl: string;
    clerkId: string;
}

/**
 * Main job handler — registered in worker.ts
 */
export async function linkedInImportJob(job: Job<LinkedInImportJobData>): Promise<void> {
    const { userId, linkedinUrl } = job.data;
    console.log(`\n🔗 [LinkedIn Import] Starting for user ${userId}: ${linkedinUrl}`);

    try {
        // Mark as running
        await db.update(profiles).set({
            scraperStatus: 'running',
            scraperJobId: job.id,
            updatedAt: new Date(),
        }).where(eq(profiles.userId, userId));

        // ── Step 1: Scrape posts ────────────────────────────────────
        const postsResult = await scrapeLinkedInPosts(linkedinUrl);

        if (!postsResult.success || !postsResult.data || postsResult.data.length === 0) {
            console.warn(`[LinkedIn Import] Scraping failed for ${userId}: ${postsResult.error}`);
            await db.update(profiles).set({
                scraperStatus: 'failed',
                updatedAt: new Date(),
            }).where(eq(profiles.userId, userId));
            return; // User will be redirected to manual voice input
        }

        const scrapedPosts = postsResult.data;
        console.log(`[LinkedIn Import] ${scrapedPosts.length} posts scraped`);

        // ── Step 2: Scrape profile (non-blocking) ───────────────────
        const profileResult = await scrapeLinkedInProfile(linkedinUrl);
        const scrapedProfile = profileResult.success ? profileResult.data! : null;

        if (scrapedProfile) {
            console.log(`[LinkedIn Import] Profile scraped: ${scrapedProfile.firstName} ${scrapedProfile.lastName}`);
        }

        // ── Step 3: Store posts as voice examples ───────────────────
        // Sort by engagement, top 3 get weight=3
        const sortedPosts = [...scrapedPosts].sort(
            (a, b) =>
                (b.engagement.likes + b.engagement.comments) -
                (a.engagement.likes + a.engagement.comments)
        );

        const voiceExampleInserts = sortedPosts.map((post, index) => ({
            userId,
            postText: post.content,
            characterCount: post.content.length,
            source: 'apify_scrape',
            engagementScore: post.engagement.likes + post.engagement.comments,
            engagementWeight: index < 3 ? 3 : 1,
            postDate: post.postedAt?.timestamp ? new Date(post.postedAt.timestamp) : null,
            rawApifyData: post as any,
            status: 'active',
        }));

        await db.insert(voiceExamples).values(voiceExampleInserts);
        console.log(`[LinkedIn Import] ${voiceExampleInserts.length} voice examples stored`);

        // ── Step 4: Extract Voice DNA (engagement-weighted) ─────────
        const voiceDNA = await extractVoiceDNAFromApify(scrapedPosts);
        const embedding = await generateEmbedding(JSON.stringify(voiceDNA));

        // ── Step 5: Auto-generate content pillars ───────────────────
        const generatedPillars = await generateContentPillars(scrapedProfile, scrapedPosts);

        // Insert pillars with status='suggested'
        if (generatedPillars.length > 0) {
            const pillarInserts = generatedPillars.map((pillar, index) => ({
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
            console.log(`[LinkedIn Import] ${pillarInserts.length} pillars generated`);
        }

        // ── Step 6: Update profile with all results ─────────────────
        const profileUpdate: Record<string, any> = {
            scraperStatus: 'success',
            voiceDna: voiceDNA,
            voiceEmbedding: embedding,
            voiceConfidenceScore: voiceDNA.confidenceScore || 50,
            preferredHookType: voiceDNA.dominantHookType || null,
            voiceArchetype: voiceDNA.detectedArchetype || null,
            linkedinScrapedAt: new Date(),
            voiceDnaExtractedAt: new Date(),
            pillarsGeneratedAt: new Date(),
            updatedAt: new Date(),
        };

        // Merge scraped profile data if available
        if (scrapedProfile) {
            profileUpdate.fullName = `${scrapedProfile.firstName} ${scrapedProfile.lastName}`.trim();
            profileUpdate.linkedinHeadline = scrapedProfile.headline;
            profileUpdate.linkedinSummary = scrapedProfile.about;  // Apify uses 'about', not 'summary'
            // Extract role from headline (e.g. "Co-Founder Chronexa - Enterprise AI | Product Lead InvestMates")
            profileUpdate.currentRole = scrapedProfile.headline?.split(' | ')[0]?.split(' - ')[0] || null;
            profileUpdate.companyName = scrapedProfile.currentPosition?.[0]?.companyName || null;
            profileUpdate.location = scrapedProfile.location?.linkedinText || null;
        }

        await db.update(profiles).set(profileUpdate).where(eq(profiles.userId, userId));

        console.log(`✅ [LinkedIn Import] Completed for user ${userId}`);
    } catch (err: any) {
        console.error(`❌ [LinkedIn Import] Fatal error for user ${userId}:`, err);
        await db.update(profiles).set({
            scraperStatus: 'failed',
            updatedAt: new Date(),
        }).where(eq(profiles.userId, userId));
        throw err; // Re-throw so BullMQ marks the job as failed and retries
    }
}
