/**
 * Quality Metrics Engine
 * Automated scoring for LinkedIn content quality, specificity, and credibility.
 */

import { Profile } from '@/lib/db/schema';

export interface QualityMetrics {
    specificityScore: number;      // 0-100: presence of concrete details vs generic claims
    credibilityScore: number;      // 0-100: use of industry terminology from profile
    clicheCount: number;           // Count of banned phrases
    personalPronounRatio: number;  // "I/my/our" usage (should be >5% for authenticity)
    overallScore: number;          // Weighted average
}

// Banned/Weak phrases that indicate generic AI output
const CLICHÉ_LIST = [
    'game-changer', 'unlock', 'secret sauce', 'dive deep', 'landscape',
    'realm', 'tapestry', 'beacon', 'unleash', 'harness', 'leverage',
    'elevate', 'mastery', 'symphony', 'testament', 'delve', 'ensure',
    'crucial', 'vital', 'paramount', 'underscore', 'foster', 'cultivate'
];

// Vague words that reduce specificity score
const VAGUE_WORDS = [
    'things', 'stuff', 'various', 'many', 'several', 'aspects',
    'factors', 'elements', 'components', 'issues', 'problems', 'solutions'
];

/**
 * Score generated content against profile context
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
            personalPronounRatio: 0,
            overallScore: 0
        };
    }

    // 1. Specificity Score
    // Penalty for vague words, bonus for numbers/digits
    let vagueCount = 0;
    VAGUE_WORDS.forEach(word => {
        const findings = text.match(new RegExp(`\\b${word}\\b`, 'g'));
        if (findings) vagueCount += findings.length;
    });

    const numberCount = (content.match(/\d+/g) || []).length;
    const properNouns = (content.match(/[A-Z][a-z]+/g) || []).filter(w => !['The', 'This', 'When'].includes(w)).length;

    // Base score 50, -5 per vague word, +5 per number, +2 per proper noun
    let specificityScore = 50 - (vagueCount * 5) + (numberCount * 5) + (properNouns * 2);
    specificityScore = Math.min(100, Math.max(0, specificityScore));

    // 2. Credibility Score
    // Bonus for using words from profile expertise and industry
    let credibilityHits = 0;
    const expertiseTerms = Array.isArray(profile?.keyExpertise) ? profile?.keyExpertise : [];

    expertiseTerms.forEach(term => {
        if (term && text.includes(term.toLowerCase())) credibilityHits += 2;
    });

    if (profile?.industry && text.includes(profile.industry.toLowerCase())) credibilityHits += 3;
    if (profile?.currentRole && text.includes(profile.currentRole.toLowerCase())) credibilityHits += 3;

    // Base 40, +10 per hit
    let credibilityScore = 40 + (credibilityHits * 10);
    credibilityScore = Math.min(100, Math.max(0, credibilityScore));

    // 3. Cliche Count
    let clicheCount = 0;
    CLICHÉ_LIST.forEach(phrase => {
        if (text.includes(phrase)) clicheCount++;
    });

    // 4. Personal Pronoun Ratio
    const personalPronouns = ['i', 'my', 'me', 'we', 'our', 'us'];
    let pronounCount = 0;
    words.forEach(word => {
        if (personalPronouns.includes(word)) pronounCount++;
    });
    const personalPronounRatio = (pronounCount / wordCount) * 100;

    // 5. Overall Score
    // Weighted: Specificity (40%), Credibility (40%), Cliche Penalty (-10 per cliche)
    let overallScore = (specificityScore * 0.4) + (credibilityScore * 0.4) + (personalPronounRatio > 3 ? 20 : 0);
    overallScore -= (clicheCount * 10);
    overallScore = Math.min(100, Math.max(0, overallScore));

    return {
        specificityScore,
        credibilityScore,
        clicheCount,
        personalPronounRatio: Math.round(personalPronounRatio * 10) / 10,
        overallScore: Math.round(overallScore)
    };
}
