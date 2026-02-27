/**
 * Quality Gate
 * Runs QualityMetrics through configurable thresholds.
 * Variants that fail the gate get flagged — they're still shown to the user
 * but with warnings and pushed to the bottom of the ranking.
 */

import { QualityMetrics } from './quality-metrics';

// ============================================================================
// TYPES
// ============================================================================

export interface QualityThresholds {
    minOverallScore: number;         // default 40
    maxClicheCount: number;          // default 3
    maxLinkedinAiPatternCount: number; // default 2
    minHookQualityScore: number;     // default 30
    minReadabilityScore: number;     // default 30
}

export interface QualityGateResult {
    /** Whether the variant passed all quality checks */
    passed: boolean;
    /** The overall quality score */
    score: number;
    /** Human-readable failure reasons */
    failures: string[];
    /** Actionable suggestions for improvement */
    suggestions: string[];
    /** Grade label for display */
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_THRESHOLDS: QualityThresholds = {
    minOverallScore: 40,
    maxClicheCount: 3,
    maxLinkedinAiPatternCount: 2,
    minHookQualityScore: 30,
    minReadabilityScore: 30,
};

// ============================================================================
// GATE LOGIC
// ============================================================================

/**
 * Run quality metrics through the gate.
 * Returns pass/fail, failure reasons, and improvement suggestions.
 */
export function runQualityGate(
    metrics: QualityMetrics,
    thresholds?: Partial<QualityThresholds>
): QualityGateResult {
    const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
    const failures: string[] = [];
    const suggestions: string[] = [];

    // Check overall score
    if (metrics.overallScore < t.minOverallScore) {
        failures.push(`Overall quality score (${metrics.overallScore}) is below minimum (${t.minOverallScore})`);
        suggestions.push('Add specific data points, names, or examples to increase specificity');
    }

    // Check clichés
    if (metrics.clicheCount > t.maxClicheCount) {
        failures.push(`Too many cliché phrases (${metrics.clicheCount}, max ${t.maxClicheCount})`);
        suggestions.push('Replace generic terms like "game-changer" or "leverage" with specific language');
    }

    // Check LinkedIn AI patterns
    if (metrics.linkedinAiPatternCount > t.maxLinkedinAiPatternCount) {
        failures.push(`Uses ${metrics.linkedinAiPatternCount} LinkedIn AI patterns (max ${t.maxLinkedinAiPatternCount})`);
        suggestions.push('Avoid overused LinkedIn hooks like "Here\'s the thing" or "Unpopular opinion"');
    }

    // Check hook quality
    if (metrics.hookQualityScore < t.minHookQualityScore) {
        failures.push(`Hook quality (${metrics.hookQualityScore}) is below minimum (${t.minHookQualityScore})`);
        suggestions.push('Start with a question, a surprising number, or a personal story to grab attention');
    }

    // Check readability
    if (metrics.readabilityScore < t.minReadabilityScore) {
        failures.push(`Readability score (${metrics.readabilityScore}) is below minimum (${t.minReadabilityScore})`);
        suggestions.push('Break up long paragraphs and add spacing between sections for mobile readers');
    }

    // Low personal pronoun ratio (authenticity warning)
    if (metrics.personalPronounRatio < 2) {
        suggestions.push('Add more personal perspective — use "I", "my", or "we" to sound authentic');
    }

    const passed = failures.length === 0;
    const grade = getGrade(metrics.overallScore);

    return { passed, score: metrics.overallScore, failures, suggestions, grade };
}

/**
 * Convert an overall score to a letter grade.
 */
function getGrade(score: number): QualityGateResult['grade'] {
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    if (score >= 35) return 'D';
    return 'F';
}
