/**
 * Quality Metrics Engine v2
 * Multi-dimensional scoring for LinkedIn content quality.
 * Measures: specificity, credibility, clichés, LinkedIn AI patterns,
 * hook quality, readability, and personal pronoun ratio.
 */

import { Profile } from '@/lib/db/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface QualityMetrics {
    specificityScore: number;         // 0-100: concrete details vs generic claims
    credibilityScore: number;         // 0-100: industry terminology from profile
    clicheCount: number;              // Count of generic AI phrases
    linkedinAiPatternCount: number;   // Count of "sounds like AI on LinkedIn" patterns
    hookQualityScore: number;         // 0-100: scroll-stopping power
    readabilityScore: number;         // 0-100: paragraph length, white space, structure
    personalPronounRatio: number;     // "I/my/our" usage (should be >5% for authenticity)
    overallScore: number;             // Weighted composite
}

// ============================================================================
// DETECTION LISTS
// ============================================================================

// Generic AI clichés (words that scream "AI wrote this")
const CLICHÉ_LIST = [
    'game-changer', 'unlock', 'secret sauce', 'dive deep', 'landscape',
    'realm', 'tapestry', 'beacon', 'unleash', 'harness', 'leverage',
    'elevate', 'mastery', 'symphony', 'testament', 'delve', 'ensure',
    'crucial', 'vital', 'paramount', 'underscore', 'foster', 'cultivate',
    'synergy', 'paradigm shift', 'disruptive', 'holistic', 'robust',
    'scalable', 'cutting-edge', 'best-in-class', 'world-class',
    'thought leader', 'move the needle', 'low-hanging fruit', 'deep dive',
    'ecosystem', 'empower', 'drive impact', 'at the end of the day',
    'double down', 'circle back', 'it goes without saying',
    'needless to say', 'in today\'s world', 'in this day and age',
    'the reality is', 'truth be told', 'the bottom line',
    'take it to the next level', 'razor-sharp focus',
];

// LinkedIn-specific AI patterns ("sounds like every other LinkedIn AI post")
const LINKEDIN_AI_PATTERNS = [
    'here\'s the thing', 'let me be honest', 'hot take',
    'i\'ll say it louder', 'read that again', 'agree?',
    'this is the way', 'unpopular opinion', 'nobody talks about',
    'the truth is', 'here\'s what i learned', 'here\'s why',
    'stop doing this', 'most people don\'t realize', 'let that sink in',
    'here are 5', 'here are 7', 'here are 10', 'here\'s my take',
    'controversial opinion', 'i was today years old',
    'the biggest mistake', 'the #1 reason', 'if you\'re not doing this',
    'save this post', 'bookmark this', 'share with someone who',
    'drop a 🔥 if you agree', 'who else feels this way',
    'i posted this and', 'my linkedin went viral',
    'this post got me', 'the algorithm showed me',
];

// Vague words that indicate low specificity
const VAGUE_WORDS = [
    'things', 'stuff', 'various', 'many', 'several', 'aspects',
    'factors', 'elements', 'components', 'issues', 'problems', 'solutions',
    'important', 'interesting', 'great', 'amazing', 'awesome', 'incredible',
    'fantastic', 'wonderful', 'significant', 'substantial', 'relevant',
];

// ============================================================================
// CORE SCORING
// ============================================================================

/**
 * Score generated content against profile context.
 * Returns multi-dimensional quality metrics.
 */
export function scoreGeneratedContent(
    content: string,
    profile: Partial<Profile> | null
): QualityMetrics {
    const text = content.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    const wordCount = words.length;

    if (wordCount === 0) {
        return {
            specificityScore: 0,
            credibilityScore: 0,
            clicheCount: 0,
            linkedinAiPatternCount: 0,
            hookQualityScore: 0,
            readabilityScore: 0,
            personalPronounRatio: 0,
            overallScore: 0
        };
    }

    // 1. Specificity Score — concrete details vs generic claims
    const specificityScore = calculateSpecificity(content, text, words);

    // 2. Credibility Score — use of profile terminology
    const credibilityScore = calculateCredibility(text, profile);

    // 3. Cliché Count — generic AI phrases
    const clicheCount = countMatches(text, CLICHÉ_LIST);

    // 4. LinkedIn AI Pattern Count — "sounds like AI on LinkedIn"
    const linkedinAiPatternCount = countMatches(text, LINKEDIN_AI_PATTERNS);

    // 5. Hook Quality Score — scroll-stopping power of first line
    const hookQualityScore = scoreHookQuality(content);

    // 6. Readability Score — paragraph length, structure, whitespace
    const readabilityScore = scoreReadability(content);

    // 7. Personal Pronoun Ratio
    const personalPronouns = ['i', 'my', 'me', 'we', 'our', 'us'];
    let pronounCount = 0;
    words.forEach(word => {
        if (personalPronouns.includes(word)) pronounCount++;
    });
    const personalPronounRatio = (pronounCount / wordCount) * 100;

    // 8. Overall Score — weighted composite
    let overallScore =
        (specificityScore * 0.20) +
        (credibilityScore * 0.20) +
        (hookQualityScore * 0.25) +
        (readabilityScore * 0.15) +
        (personalPronounRatio > 3 ? 15 : 0) +  // Authenticity bonus
        5;  // Base points

    // Penalties
    overallScore -= (clicheCount * 5);
    overallScore -= (linkedinAiPatternCount * 8);  // Heavier penalty for LinkedIn AI patterns

    overallScore = Math.min(100, Math.max(0, overallScore));

    return {
        specificityScore,
        credibilityScore,
        clicheCount,
        linkedinAiPatternCount,
        hookQualityScore,
        readabilityScore,
        personalPronounRatio: Math.round(personalPronounRatio * 10) / 10,
        overallScore: Math.round(overallScore)
    };
}

// ============================================================================
// INDIVIDUAL SCORING FUNCTIONS
// ============================================================================

function calculateSpecificity(original: string, text: string, words: string[]): number {
    let vagueCount = 0;
    VAGUE_WORDS.forEach(word => {
        const findings = text.match(new RegExp(`\\b${word}\\b`, 'g'));
        if (findings) vagueCount += findings.length;
    });

    const numberCount = (original.match(/\d+/g) || []).length;
    const properNouns = (original.match(/[A-Z][a-z]+/g) || [])
        .filter(w => !['The', 'This', 'When', 'Here', 'What', 'How', 'Why', 'That', 'But', 'And', 'For'].includes(w))
        .length;
    const percentages = (original.match(/\d+%/g) || []).length;
    const dollarAmounts = (original.match(/\$[\d,]+/g) || []).length;

    // Base score 50, -5 per vague word, +5 per number, +2 per proper noun, +8 per percentage/dollar
    let score = 50 - (vagueCount * 5) + (numberCount * 5) + (properNouns * 2) + (percentages * 8) + (dollarAmounts * 8);
    return Math.min(100, Math.max(0, score));
}

function calculateCredibility(text: string, profile: Partial<Profile> | null): number {
    let credibilityHits = 0;
    const expertiseTerms = Array.isArray(profile?.keyExpertise) ? profile?.keyExpertise : [];

    expertiseTerms.forEach(term => {
        if (term && text.includes(term.toLowerCase())) credibilityHits += 2;
    });

    if (profile?.industry && text.includes(profile.industry.toLowerCase())) credibilityHits += 3;
    if (profile?.currentRole && text.includes(profile.currentRole.toLowerCase())) credibilityHits += 3;
    if (profile?.companyName && text.includes(profile.companyName.toLowerCase())) credibilityHits += 2;

    // Base 40, +10 per hit
    return Math.min(100, Math.max(0, 40 + (credibilityHits * 10)));
}

function countMatches(text: string, patterns: string[]): number {
    let count = 0;
    patterns.forEach(phrase => {
        if (text.includes(phrase)) count++;
    });
    return count;
}

/**
 * Score the hook (first line) quality.
 * A great hook stops the scroll.
 */
function scoreHookQuality(content: string): number {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return 0;

    const hook = lines[0].trim();
    const hookLower = hook.toLowerCase();
    let score = 30; // base

    // Question in first line → very engaging
    if (hook.includes('?')) score += 20;

    // Number/data in first line → credible
    if (/\d/.test(hook)) score += 15;

    // Short and punchy hook (under 100 chars) → better
    if (hook.length <= 100) score += 10;
    if (hook.length <= 60) score += 5;  // extra bonus for very short

    // Story opener — pulls reader in
    const storyOpeners = ['i was', 'last week', 'last month', 'last year', 'yesterday', 'two years ago', 'when i', 'the day i', 'i remember'];
    if (storyOpeners.some(opener => hookLower.startsWith(opener))) score += 15;

    // Bold/provocative statement
    const boldMarkers = ['nobody', 'everyone', 'stop', 'never', 'always', 'the biggest', 'the worst', 'the best'];
    if (boldMarkers.some(marker => hookLower.includes(marker))) score += 10;

    // Penalty: Generic openers
    const genericOpeners = ['in today\'s', 'in this day', 'as a professional', 'as we all know', 'it\'s no secret', 'we all know'];
    if (genericOpeners.some(opener => hookLower.startsWith(opener))) score -= 20;

    // Penalty: Too long hook (>200 chars)
    if (hook.length > 200) score -= 15;

    return Math.min(100, Math.max(0, score));
}

/**
 * Score readability and visual structure.
 * LinkedIn is mobile-first — posts need breathing room.
 */
function scoreReadability(content: string): number {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    const totalChars = content.length;
    let score = 50; // base

    // Paragraph breaks — essential for mobile reading
    const doubleBreaks = (content.match(/\n\n/g) || []).length;
    if (doubleBreaks >= 3) score += 15;
    else if (doubleBreaks >= 1) score += 5;
    else score -= 15; // Wall of text penalty

    // Average paragraph length (lines between double breaks)
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 0) {
        const avgParagraphLines = nonEmptyLines.length / paragraphs.length;
        if (avgParagraphLines <= 3) score += 15;  // Short paragraphs = good
        else if (avgParagraphLines <= 5) score += 5;
        else score -= 10; // Long paragraphs = bad on mobile
    }

    // Optimal post length for LinkedIn (800-1500 chars is sweet spot)
    if (totalChars >= 800 && totalChars <= 1500) score += 15;
    else if (totalChars >= 500 && totalChars <= 2000) score += 5;
    else if (totalChars < 200) score -= 15; // Too short
    else if (totalChars > 2500) score -= 10; // Too long

    // Wall of text detection (>5 consecutive non-empty lines)
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    for (const line of lines) {
        if (line.trim().length > 0) {
            currentConsecutive++;
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
            currentConsecutive = 0;
        }
    }
    if (maxConsecutive > 5) score -= 15;

    return Math.min(100, Math.max(0, score));
}
