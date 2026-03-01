/**
 * Voice DNA Extraction
 * Uses GPT-4o as an ANALYZER (not generator) to extract structured
 * writing patterns from a user's voice examples.
 *
 * This goes deeper than embedding-based cosine similarity:
 * - Cosine similarity says "this FEELS like you"
 * - Voice DNA says "this IS STRUCTURED like you"
 */

import { openai, DEFAULT_CONFIG } from './openai';

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceDNA {
    /** Average words per sentence */
    avgSentenceLength: number;
    /** Vocabulary complexity */
    vocabularyLevel: 'simple' | 'moderate' | 'technical';
    /** Recurring expressions the user tends to use */
    signaturePhrases: string[];
    /** Structural patterns detected across examples */
    structuralPatterns: {
        usesLists: boolean;
        usesStories: boolean;
        usesData: boolean;
        usesQuestions: boolean;
        usesOneLiners: boolean;
    };
    /** Primary emotional tone (e.g. "analytical with occasional candor") */
    emotionalTone: string;
    /** How they typically open posts */
    openingStyle: string;
    /** How they typically close posts */
    closingStyle: string;
    /** Average lines per paragraph */
    avgParagraphLength: number;
    /** Formatting preferences */
    formattingPreferences: {
        usesEmojis: boolean;
        usesBoldText: boolean;
        usesHashtags: boolean;
        avgHashtagCount: number;
    };
    /** Short summary of the voice personality */
    voicePersonality: string;

    // ── Extended fields for Apify-powered analysis (optional for backward compat) ──
    /** Dominant hook type detected from post openings */
    dominantHookType?: 'number' | 'story' | 'contrarian' | 'question' | 'bold' | 'relatable';
    /** Detected voice archetype */
    detectedArchetype?: 'expert' | 'storyteller' | 'contrarian' | 'educator';
    /** 3-5 tone attribute keywords */
    toneAttributes?: string[];
    /** Actual first lines from top posts as hook examples */
    hookExamples?: string[];
    /** Common CTA pattern */
    ctaPattern?: 'question' | 'statement' | 'call-to-action' | 'none';
    /** Plain English analysis summary for display to user */
    analysisNotes?: string;
    /** Confidence score 0-100 based on number of posts analyzed */
    confidenceScore?: number;

    // ── New Enriched Profile Fields ──
    /** Inferred industry based on posts and profile */
    industry?: string;
    /** Short 1-2 sentence career highlight summary */
    careerHighlights?: string;
    /** Inferred audience/network composition (e.g. ['Founders', 'Investors']) */
    networkComposition?: string[];
}

// ============================================================================
// EXTRACTION
// ============================================================================

const VOICE_DNA_SYSTEM_PROMPT = `You are an expert linguistic analyst specializing in professional writing style analysis.
Your job is to examine a set of LinkedIn posts written by the same person and extract their EXACT writing DNA — the structural and stylistic patterns that make their writing unique.

You must return ONLY valid JSON matching the exact schema provided. No markdown, no explanation, just pure JSON.`;

const VOICE_DNA_USER_PROMPT = `Analyze the following LinkedIn posts, all written by the same person. Extract their writing DNA:

{{examples}}

Return a JSON object with this EXACT structure:
{
  "avgSentenceLength": <number, average words per sentence across all posts>,
  "vocabularyLevel": "<'simple' | 'moderate' | 'technical'>",
  "signaturePhrases": ["<recurring expressions they use, max 10>"],
  "structuralPatterns": {
    "usesLists": <boolean>,
    "usesStories": <boolean>,
    "usesData": <boolean>,
    "usesQuestions": <boolean>,
    "usesOneLiners": <boolean>
  },
  "emotionalTone": "<2-5 word description, e.g. 'analytical with occasional candor'>",
  "openingStyle": "<how they typically start posts, e.g. 'leads with bold statement'>",
  "closingStyle": "<how they typically end posts, e.g. 'ends with reflective question'>",
  "avgParagraphLength": <number, average lines per paragraph>,
  "formattingPreferences": {
    "usesEmojis": <boolean>,
    "usesBoldText": <boolean>,
    "usesHashtags": <boolean>,
    "avgHashtagCount": <number>
  },
  "voicePersonality": "<1-2 sentence summary of their unique voice personality>"
}

Be precise. Base every field on evidence from the posts, not assumptions.
Return ONLY valid JSON.`;

/**
 * Extract structured Voice DNA from a set of writing examples.
 * Uses GPT-4o to analyze patterns rather than generate content.
 */
export async function extractVoiceDNA(postTexts: string[]): Promise<VoiceDNA> {
    if (postTexts.length < 1) {
        throw new Error('At least 1 voice example required for Voice DNA extraction');
    }

    console.log(`🧬 Extracting Voice DNA from ${postTexts.length} examples...`);

    // Format examples for the prompt
    const examplesText = postTexts
        .map((text, i) => `--- Post ${i + 1} ---\n${text}\n`)
        .join('\n');

    const userPrompt = VOICE_DNA_USER_PROMPT.replace('{{examples}}', examplesText);

    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model, // GPT-4o for analysis quality
        messages: [
            { role: 'system', content: VOICE_DNA_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.2, // Low temp for consistent analysis
        max_tokens: 1000,
        response_format: { type: 'json_object' },
    });

    const completion = response.choices[0].message.content;
    if (!completion) {
        throw new Error('No Voice DNA analysis received from OpenAI');
    }

    const parsed = JSON.parse(completion) as VoiceDNA;

    // Validate and sanitize key fields
    const voiceDNA: VoiceDNA = {
        avgSentenceLength: typeof parsed.avgSentenceLength === 'number' ? parsed.avgSentenceLength : 15,
        vocabularyLevel: ['simple', 'moderate', 'technical'].includes(parsed.vocabularyLevel)
            ? parsed.vocabularyLevel
            : 'moderate',
        signaturePhrases: Array.isArray(parsed.signaturePhrases)
            ? parsed.signaturePhrases.slice(0, 10)
            : [],
        structuralPatterns: {
            usesLists: !!parsed.structuralPatterns?.usesLists,
            usesStories: !!parsed.structuralPatterns?.usesStories,
            usesData: !!parsed.structuralPatterns?.usesData,
            usesQuestions: !!parsed.structuralPatterns?.usesQuestions,
            usesOneLiners: !!parsed.structuralPatterns?.usesOneLiners,
        },
        emotionalTone: parsed.emotionalTone || 'professional',
        openingStyle: parsed.openingStyle || 'direct statement',
        closingStyle: parsed.closingStyle || 'call to action',
        avgParagraphLength: typeof parsed.avgParagraphLength === 'number' ? parsed.avgParagraphLength : 2,
        formattingPreferences: {
            usesEmojis: !!parsed.formattingPreferences?.usesEmojis,
            usesBoldText: !!parsed.formattingPreferences?.usesBoldText,
            usesHashtags: !!parsed.formattingPreferences?.usesHashtags,
            avgHashtagCount: typeof parsed.formattingPreferences?.avgHashtagCount === 'number'
                ? parsed.formattingPreferences.avgHashtagCount
                : 3,
        },
        voicePersonality: parsed.voicePersonality || 'Professional with a personal touch',
    };

    console.log(`✅ Voice DNA extracted successfully`);
    console.log(`   Vocabulary: ${voiceDNA.vocabularyLevel}`);
    console.log(`   Tone: ${voiceDNA.emotionalTone}`);
    console.log(`   Opener: ${voiceDNA.openingStyle}`);
    console.log(`   Closer: ${voiceDNA.closingStyle}`);
    console.log(`   Signature phrases: ${voiceDNA.signaturePhrases.length}`);

    return voiceDNA;
}

// ============================================================================
// APIFY-POWERED EXTRACTION (with engagement weighting)
// ============================================================================

import type { ApifyPost, ApifyProfile } from '@/lib/apify/linkedin-scraper';

/**
 * Extract Voice DNA from Apify-scraped posts and profile with engagement weighting.
 * Top 3 posts by engagement are weighted 3x more heavily in the analysis.
 * Also infers industry, career highlights, and network composition from the profile + posts.
 */
export async function extractVoiceDNAFromApify(posts: ApifyPost[], profile: ApifyProfile | null = null): Promise<VoiceDNA> {
    if (posts.length === 0) {
        throw new Error('No posts provided for Voice DNA extraction');
    }

    console.log(`🧬 Extracting Voice DNA from ${posts.length} Apify posts (engagement-weighted) + profile...`);

    // Sort by total engagement descending
    const sortedPosts = [...posts].sort(
        (a, b) =>
            (b.engagement.likes + b.engagement.comments) -
            (a.engagement.likes + a.engagement.comments)
    );

    const top3 = sortedPosts.slice(0, 3);
    const rest = sortedPosts.slice(3);

    // Build the engagement-weighted prompt
    let postsContext = `TOP PERFORMING POSTS (weight these 3x more in your analysis):\n`;
    top3.forEach((p, i) => {
        postsContext += `\n--- Post ${i + 1} (${p.engagement.likes} likes, ${p.engagement.comments} comments) ---\n${p.content}\n`;
    });

    if (rest.length > 0) {
        postsContext += `\nOTHER POSTS (weight these 1x):\n`;
        rest.forEach((p, i) => {
            postsContext += `\n--- Post ${i + 4} ---\n${p.content}\n`;
        });
    }

    let profileContext = '';
    if (profile) {
        profileContext = `\nAUTHOR PROFILE CONTEXT:\nHeadline: ${profile.headline || 'Unknown'}\nAbout: ${profile.about || 'Unknown'}\nCurrent Role: ${profile.currentPosition?.[0]?.companyName || 'Unknown'}\n`;
    }

    const extendedPrompt = `Analyze the following LinkedIn posts and profile from a single author. Extract their Voice DNA and infer their professional positioning.\n\nIMPORTANT: Weight the top performing posts 3x more heavily when making judgments.${profileContext}\n\n${postsContext}\n\nReturn a JSON object with this EXACT structure:\n{\n  "avgSentenceLength": <number>,\n  "vocabularyLevel": "<'simple' | 'moderate' | 'technical'>",\n  "signaturePhrases": ["<recurring expressions, max 10>"],\n  "structuralPatterns": {\n    "usesLists": <boolean>,\n    "usesStories": <boolean>,\n    "usesData": <boolean>,\n    "usesQuestions": <boolean>,\n    "usesOneLiners": <boolean>\n  },\n  "emotionalTone": "<2-5 word description>",\n  "openingStyle": "<how they typically start posts>",\n  "closingStyle": "<how they typically end posts>",\n  "avgParagraphLength": <number>,\n  "formattingPreferences": {\n    "usesEmojis": <boolean>,\n    "usesBoldText": <boolean>,\n    "usesHashtags": <boolean>,\n    "avgHashtagCount": <number>\n  },\n  "voicePersonality": "<1-2 sentence summary>",\n  "dominantHookType": "<'number' | 'story' | 'contrarian' | 'question' | 'bold' | 'relatable'>",\n  "detectedArchetype": "<'expert' | 'storyteller' | 'contrarian' | 'educator'>",\n  "toneAttributes": ["<3-5 tone keywords, e.g. 'data-driven', 'authoritative'>"],\n  "hookExamples": ["<actual first lines from top 3 posts, copy verbatim>"],\n  "ctaPattern": "<'question' | 'statement' | 'call-to-action' | 'none'>",\n  "analysisNotes": "<1-2 sentence plain English description of this person's writing style>",\n  "confidenceScore": <number 0-100: 10 posts=85, 5 posts=65, 2 posts=40, 1 post=25>,\n  "industry": "<1-3 words inferred from profile/posts e.g. 'B2B SaaS'>",\n  "careerHighlights": "<1-2 sentence summary of their career traction/notable experience>",\n  "networkComposition": ["<1-2 word role description of people who likely read their posts, e.g. 'Founders', 'Engineers', max 3>"]\n}\n\nReturn ONLY valid JSON.`;

    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model,
        messages: [
            { role: 'system', content: VOICE_DNA_SYSTEM_PROMPT },
            { role: 'user', content: extendedPrompt },
        ],
        temperature: 0.15,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    });

    const completion = response.choices[0].message.content;
    if (!completion) {
        throw new Error('No Voice DNA analysis received from OpenAI');
    }

    const parsed = JSON.parse(completion);

    // Build the full VoiceDNA with both legacy and new fields
    const voiceDNA: VoiceDNA = {
        avgSentenceLength: typeof parsed.avgSentenceLength === 'number' ? parsed.avgSentenceLength : 15,
        vocabularyLevel: ['simple', 'moderate', 'technical'].includes(parsed.vocabularyLevel)
            ? parsed.vocabularyLevel : 'moderate',
        signaturePhrases: Array.isArray(parsed.signaturePhrases) ? parsed.signaturePhrases.slice(0, 10) : [],
        structuralPatterns: {
            usesLists: !!parsed.structuralPatterns?.usesLists,
            usesStories: !!parsed.structuralPatterns?.usesStories,
            usesData: !!parsed.structuralPatterns?.usesData,
            usesQuestions: !!parsed.structuralPatterns?.usesQuestions,
            usesOneLiners: !!parsed.structuralPatterns?.usesOneLiners,
        },
        emotionalTone: parsed.emotionalTone || 'professional',
        openingStyle: parsed.openingStyle || 'direct statement',
        closingStyle: parsed.closingStyle || 'call to action',
        avgParagraphLength: typeof parsed.avgParagraphLength === 'number' ? parsed.avgParagraphLength : 2,
        formattingPreferences: {
            usesEmojis: !!parsed.formattingPreferences?.usesEmojis,
            usesBoldText: !!parsed.formattingPreferences?.usesBoldText,
            usesHashtags: !!parsed.formattingPreferences?.usesHashtags,
            avgHashtagCount: typeof parsed.formattingPreferences?.avgHashtagCount === 'number'
                ? parsed.formattingPreferences.avgHashtagCount : 3,
        },
        voicePersonality: parsed.voicePersonality || 'Professional with a personal touch',
        // Extended fields
        dominantHookType: parsed.dominantHookType || 'bold',
        detectedArchetype: parsed.detectedArchetype || 'expert',
        toneAttributes: Array.isArray(parsed.toneAttributes) ? parsed.toneAttributes.slice(0, 5) : [],
        hookExamples: Array.isArray(parsed.hookExamples) ? parsed.hookExamples.slice(0, 3) : [],
        ctaPattern: parsed.ctaPattern || 'question',
        analysisNotes: parsed.analysisNotes || '',
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 50,
        industry: parsed.industry || '',
        careerHighlights: parsed.careerHighlights || '',
        networkComposition: Array.isArray(parsed.networkComposition) ? parsed.networkComposition.slice(0, 3) : [],
    };

    console.log(`✅ Apify Voice DNA extracted: archetype=${voiceDNA.detectedArchetype}, hook=${voiceDNA.dominantHookType}, confidence=${voiceDNA.confidenceScore}`);
    return voiceDNA;
}

// ============================================================================
// PROMPT INJECTION
// ============================================================================

/**
 * Convert Voice DNA into a prompt section for injection into generation prompts.
 * Returns empty string if no Voice DNA exists.
 */
export function buildVoiceDNAPromptSection(voiceDNA: VoiceDNA | null | undefined): string {
    if (!voiceDNA) return '';

    const structureTraits: string[] = [];
    if (voiceDNA.structuralPatterns.usesLists) structureTraits.push('bullet/numbered lists');
    if (voiceDNA.structuralPatterns.usesStories) structureTraits.push('personal stories');
    if (voiceDNA.structuralPatterns.usesData) structureTraits.push('data & statistics');
    if (voiceDNA.structuralPatterns.usesQuestions) structureTraits.push('rhetorical questions');
    if (voiceDNA.structuralPatterns.usesOneLiners) structureTraits.push('one-line paragraphs');

    const formatTraits: string[] = [];
    if (voiceDNA.formattingPreferences.usesEmojis) formatTraits.push('emojis');
    if (voiceDNA.formattingPreferences.usesBoldText) formatTraits.push('bold text');
    if (voiceDNA.formattingPreferences.usesHashtags) formatTraits.push(`${voiceDNA.formattingPreferences.avgHashtagCount} hashtags`);

    let section = `\n\n**VOICE DNA (match these structural patterns exactly):**\n`;
    section += `- Sentence length: ~${voiceDNA.avgSentenceLength} words per sentence\n`;
    section += `- Vocabulary: ${voiceDNA.vocabularyLevel}\n`;
    section += `- Paragraph length: ~${voiceDNA.avgParagraphLength} lines each\n`;
    section += `- Emotional tone: ${voiceDNA.emotionalTone}\n`;
    section += `- Opens posts with: ${voiceDNA.openingStyle}\n`;
    section += `- Closes posts with: ${voiceDNA.closingStyle}\n`;

    if (structureTraits.length > 0) {
        section += `- Structural patterns: ${structureTraits.join(', ')}\n`;
    }

    if (formatTraits.length > 0) {
        section += `- Formatting: uses ${formatTraits.join(', ')}\n`;
    }

    if (voiceDNA.signaturePhrases.length > 0) {
        section += `- Signature phrases to naturally weave in: "${voiceDNA.signaturePhrases.slice(0, 5).join('", "')}"\n`;
    }

    section += `- Voice personality: ${voiceDNA.voicePersonality}\n`;

    return section;
}
