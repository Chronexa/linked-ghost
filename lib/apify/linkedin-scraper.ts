/**
 * Apify LinkedIn Scraper Service
 * ─────────────────────────────────────────────────────────────────
 * Wraps the two HarvestAPI actors for LinkedIn scraping:
 *   - linkedin-profile-posts:   Scrapes a user's recent posts ($2/1k posts)
 *   - linkedin-profile-scraper: Scrapes profile data ($4/1k profiles)
 *
 * This is the ONLY file that communicates with Apify. All other code
 * imports from here.
 */

// ─────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS (matching actual Apify HarvestAPI output)
// ─────────────────────────────────────────────────────────────────

export interface ApifyPost {
    type: string;
    id: string;
    linkedinUrl: string;
    content: string;
    author: {
        publicIdentifier: string;
        name: string;
        info: string;        // This is the headline
        linkedinUrl: string;
        avatar?: { url: string };
    };
    postedAt: {
        timestamp: number;
        date: string;
    };
    engagement: {
        likes: number;
        comments: number;
        shares: number;
    };
    document?: {
        title: string;       // For carousel/PDF posts
    };
}

export interface ApifyProfile {
    firstName: string;
    lastName: string;
    headline: string;
    about: string;         // The "About" section (Apify uses 'about', NOT 'summary')
    publicIdentifier: string;
    linkedinUrl: string;
    connectionsCount?: number;
    followerCount?: number;
    location?: {
        linkedinText: string;
        countryCode?: string;
        parsed?: {
            city?: string;
            state?: string;
            country?: string;
        };
    };
    currentPosition?: Array<{
        companyName: string;
        companyLinkedinUrl?: string;
        dateRange?: {
            start?: { month: number; year: number };
            end?: { month: number; year: number } | null;
        };
    }>;
    skills?: any[];
    profilePicture?: {
        url: string;
    };
}

export interface ScraperResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    errorCode?: 'timeout' | 'private_profile' | 'rate_limit' | 'not_found' | 'unknown';
}

// ─────────────────────────────────────────────────────────────────
// APIFY REST API HELPERS
// We use raw fetch() instead of apify-client to avoid serverless
// compatibility issues on Vercel.
// ─────────────────────────────────────────────────────────────────

const APIFY_BASE = 'https://api.apify.com/v2';

function getApifyToken(): string {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error('APIFY_TOKEN environment variable is not set');
    return token;
}

/**
 * Run an Apify actor and wait for it to finish, then retrieve dataset items.
 */
async function runActorAndGetItems<T>(
    actorId: string,
    input: Record<string, unknown>,
    timeoutMs: number = 60000
): Promise<T[]> {
    const token = getApifyToken();

    // Start the actor run synchronously (waitForFinish)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        // Start run (Apify will wait up to waitForFinish seconds before returning)
        const waitSecs = Math.floor(timeoutMs / 1000);
        const runRes = await fetch(
            `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&waitForFinish=${waitSecs}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
                signal: controller.signal,
            }
        );

        if (!runRes.ok) {
            const errText = await runRes.text().catch(() => 'Unknown error');
            throw new Error(`Apify actor ${actorId} returned ${runRes.status}: ${errText}`);
        }

        const runData = await runRes.json();
        const datasetId = runData?.data?.defaultDatasetId;

        if (!datasetId) {
            throw new Error('No dataset ID returned from Apify run');
        }

        // Fetch dataset items
        const datasetRes = await fetch(
            `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json`,
            { signal: controller.signal }
        );

        if (!datasetRes.ok) {
            throw new Error(`Failed to fetch Apify dataset: ${datasetRes.status}`);
        }

        return (await datasetRes.json()) as T[];
    } finally {
        clearTimeout(timeout);
    }
}

// ─────────────────────────────────────────────────────────────────
// POSTS SCRAPER
// Actor: harvestapi/linkedin-profile-posts
// Cost: ~$0.002 per 10 posts
// ─────────────────────────────────────────────────────────────────

export async function scrapeLinkedInPosts(
    linkedinUrl: string
): Promise<ScraperResult<ApifyPost[]>> {
    try {
        console.log(`[Apify] Scraping posts for: ${linkedinUrl}`);

        const actorId = process.env.APIFY_ACTOR_POSTS || 'harvestapi~linkedin-profile-posts';
        const items = await runActorAndGetItems<ApifyPost>(
            actorId,
            {
                profileUrls: [linkedinUrl],
                maxPosts: 10,
                includeReposts: false,     // Only original content for voice training
                scrapeComments: false,     // Not needed for voice DNA
                scrapeReactions: false,    // Not needed
            },
            45000 // 45 second timeout
        );

        // Filter: only text posts with sufficient content
        const validPosts = items.filter(
            (post) => post.content && post.content.trim().length > 50
        );

        console.log(`[Apify] Found ${validPosts.length} valid posts (${items.length} total)`);

        if (validPosts.length === 0) {
            return { success: false, error: 'No public posts found', errorCode: 'not_found' };
        }

        return { success: true, data: validPosts };
    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error('[Apify Posts] Timeout');
            return { success: false, error: 'Scraping timed out', errorCode: 'timeout' };
        }
        if (err.message?.includes('404') || err.message?.includes('private')) {
            return { success: false, error: 'Profile is private or not found', errorCode: 'private_profile' };
        }
        if (err.message?.includes('429')) {
            return { success: false, error: 'Rate limited', errorCode: 'rate_limit' };
        }
        console.error('[Apify Posts Error]', err);
        return { success: false, error: err.message, errorCode: 'unknown' };
    }
}

// ─────────────────────────────────────────────────────────────────
// PROFILE SCRAPER
// Actor: harvestapi/linkedin-profile-scraper
// Cost: ~$0.004 per profile
// ─────────────────────────────────────────────────────────────────

export async function scrapeLinkedInProfile(
    linkedinUrl: string
): Promise<ScraperResult<ApifyProfile>> {
    try {
        console.log(`[Apify] Scraping profile for: ${linkedinUrl}`);

        const actorId = process.env.APIFY_ACTOR_PROFILE || 'harvestapi~linkedin-profile-scraper';
        const items = await runActorAndGetItems<ApifyProfile>(
            actorId,
            { urls: [linkedinUrl] },
            30000 // 30 second timeout
        );

        if (!items || items.length === 0) {
            return { success: false, error: 'No profile data returned', errorCode: 'not_found' };
        }

        console.log(`[Apify] Profile scraped: ${items[0].firstName} ${items[0].lastName}`);
        return { success: true, data: items[0] };
    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error('[Apify Profile] Timeout');
            return { success: false, error: 'Scraping timed out', errorCode: 'timeout' };
        }
        console.error('[Apify Profile Error]', err);
        return { success: false, error: err.message, errorCode: 'unknown' };
    }
}
