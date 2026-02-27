/**
 * Auto Content Pillar Generator
 * ─────────────────────────────────────────────────────────────────
 * Uses GPT-4o to generate 4 content pillars from scraped LinkedIn
 * profile data and post topics. Pillars are created with status
 * 'suggested' and await user confirmation.
 */

import { openai, DEFAULT_CONFIG } from './openai';
import type { ApifyPost, ApifyProfile } from '@/lib/apify/linkedin-scraper';

export interface GeneratedPillar {
    name: string;           // 2-4 words, e.g. "SaaS Growth Strategies"
    description: string;    // 1 sentence explaining what this pillar covers
    targetAudience: string; // who reads these posts
    exampleTopics: string[]; // 3 specific post ideas for this pillar
    emoji: string;          // single relevant emoji for UI display
}

const PILLAR_SYSTEM_PROMPT = `You are an expert LinkedIn content strategist.
Your job is to analyze a professional's profile and recent posts, then generate
exactly 4 content pillars they should consistently write about on LinkedIn.

Rules:
- Pillar names must be specific, not generic. Bad: "Personal Brand". Good: "Founder War Stories"
- Each pillar must be distinct — no overlap in topics
- Example topics must be SPECIFIC post ideas, not just themes
- Return exactly 4 pillars
- Return ONLY valid JSON — no explanation, no markdown fences`;

const PILLAR_USER_PROMPT = `Analyze this professional and generate 4 content pillars:

PROFESSIONAL PROFILE:
Name: {{name}}
Headline: {{headline}}
About: {{about}}
Industry: {{industry}}
Current Role: {{role}} at {{company}}

SAMPLE FROM RECENT POSTS:
{{postSummaries}}

Return a JSON object with this structure:
{
  "pillars": [
    {
      "name": "<2-4 word pillar name>",
      "description": "<1 sentence: what content goes in this pillar>",
      "targetAudience": "<who reads these posts, 1 sentence>",
      "exampleTopics": ["<specific post idea 1>", "<specific post idea 2>", "<specific post idea 3>"],
      "emoji": "<single emoji that represents this pillar>"
    }
  ]
}`;

/**
 * Generate 4 content pillars from scraped LinkedIn data.
 * Falls back to a simpler prompt if profile data is missing.
 */
export async function generateContentPillars(
    profile: ApifyProfile | null,
    posts: ApifyPost[]
): Promise<GeneratedPillar[]> {
    // Extract post topics for context (first 200 chars of each)
    const postSummaries = posts
        .slice(0, 10)
        .map((p) => p.content.substring(0, 200))
        .join('\n---\n');

    const userPrompt = PILLAR_USER_PROMPT
        .replace('{{name}}', profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown')
        .replace('{{headline}}', profile?.headline || 'Not available')
        .replace('{{about}}', profile?.about?.substring(0, 500) || 'Not available')
        .replace('{{industry}}', 'Inferred from headline')
        .replace('{{role}}', profile?.headline?.split(' | ')[0] || 'Not specified')
        .replace('{{company}}', profile?.currentPosition?.[0]?.companyName || 'Not specified')
        .replace('{{postSummaries}}', postSummaries || 'No posts available');

    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model,
        messages: [
            { role: 'system', content: PILLAR_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
    });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error('No response from GPT-4o for pillar generation');

    const parsed = JSON.parse(raw);

    // GPT-4o with json_object may wrap array in an object
    const pillars: GeneratedPillar[] = Array.isArray(parsed)
        ? parsed
        : parsed.pillars || parsed.data || Object.values(parsed);

    // Validate and return at most 4
    return pillars.slice(0, 4).map((p) => ({
        name: p.name || 'Untitled Pillar',
        description: p.description || '',
        targetAudience: p.targetAudience || '',
        exampleTopics: Array.isArray(p.exampleTopics) ? p.exampleTopics.slice(0, 3) : [],
        emoji: p.emoji || '📝',
    }));
}

/**
 * Generate pillars from text-only input (manual fallback when no Apify data).
 * Uses the existing inferProfileData style but focused on pillars.
 */
export async function generatePillarsFromText(
    role: string,
    industry: string,
    topics: string[],
    postTexts: string[]
): Promise<GeneratedPillar[]> {
    const fakeProfile: ApifyProfile = {
        firstName: '',
        lastName: '',
        headline: `${role} in ${industry}`,
        about: `Expertise areas: ${topics.join(', ')}`,
        publicIdentifier: '',
        linkedinUrl: '',
        currentPosition: [{ companyName: '' }],
    };

    const fakePosts: ApifyPost[] = postTexts.map((text, i) => ({
        type: 'post',
        id: `manual-${i}`,
        linkedinUrl: '',
        content: text,
        author: { publicIdentifier: '', name: '', info: '', linkedinUrl: '' },
        postedAt: { timestamp: Date.now(), date: new Date().toISOString() },
        engagement: { likes: 0, comments: 0, shares: 0 },
    }));

    return generateContentPillars(fakeProfile, fakePosts);
}
