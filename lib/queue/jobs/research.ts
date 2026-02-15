import { Job } from 'bullmq';
import { db } from '@/lib/db'; // Correct path to db
import { rawTopics, pillars, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { discoverTopics } from '@/lib/ai/perplexity';

interface ResearchJobData {
    userId: string;
}

/**
 * Handle daily research job
 * Triggered by cron, uses Perplexity API
 */
export async function researchJob(job: Job<ResearchJobData>) {
    const { userId } = job.data;

    try {
        console.log(`🔎 Researching topics for user: ${userId}`);

        // Fetch user's active pillars
        const userPillars = await db.query.pillars.findMany({
            where: and(eq(pillars.userId, userId), eq(pillars.status, 'active')),
        });

        // Fetch user profile for targeted research (Phase 18.2)
        const userProfile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        let domain = 'Tech Trends & Business Strategy'; // Default fallback
        let pillarName = 'General Professional Interest'; // Default fallback

        if (userPillars.length > 0) {
            // Pick a random pillar to research or rotate (for now random is fine)
            const randomPillar = userPillars[Math.floor(Math.random() * userPillars.length)];
            pillarName = randomPillar.name;
            // Use pillar name + description/audience as the search domain context
            domain = `${randomPillar.name} ${randomPillar.targetAudience ? `for ${randomPillar.targetAudience}` : ''}`;
        } else {
            console.log('⚠️ No active pillars found for user. Using default fallback topics.');
        }

        console.log(`   Searching Perplexity for: ${domain} (Pillar: ${pillarName})`);

        // Call Perplexity
        const result = await discoverTopics({
            domain,
            pillarContext: pillarName,
            count: 5,
            profile: userProfile, // Pass profile for Tier 1/2 research
        });

        console.log(`   Discovered ${result.topics.length} topics`);

        // Store in DB
        if (result.topics.length > 0) {
            const topicInserts = result.topics.map((t) => ({
                userId,
                source: 'perplexity' as const,
                sourceUrl: t.sources[0]?.url || null,
                content: t.content,
                rawData: t,
                status: 'new' as const,
            }));

            await db.insert(rawTopics).values(topicInserts);
        }

        return { researchCount: result.topics.length };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Research failed for user ${userId}:`, error.message);
            throw error; // Retries handled by BullMQ
        } else {
            console.error(`❌ Research failed for user ${userId}: Unknown error`, error);
            throw new Error('Unknown error during research');
        }
    }
}
