/**
 * Prompt resolver: interpolate template with context variables.
 * Single source of truth for {{variable}} substitution across research, classification, draft.
 */

export type PromptContext = {
  // Research
  domain?: string;
  count?: number;
  pillarName?: string;
  pillarContext?: string;
  userInstructions?: string;
  timeRange?: string;
  audience?: string;
  topic?: string;
  additionalInstructions?: string;
  // Classification
  pillarsList?: string;
  topicContent?: string;
  sourceUrl?: string;
  // Draft
  pillarName_draft?: string;
  topicTitle?: string;
  topicDescription?: string;
  voiceExamples?: string;
  userPerspective?: string;
  customInstructions?: string;
  numVariants?: number;
  description?: string;
  tone?: string;
  targetAudience?: string;
  // Profile / LinkedIn (for personalisation)
  linkedInHeadline?: string;
  linkedInSummary?: string;
  fullName?: string;
  about?: string;
  currentRole?: string;
  [key: string]: string | number | undefined;
};

/**
 * Interpolate {{key}} placeholders in template with context values.
 * Missing keys are replaced with empty string.
 */
export function interpolate(template: string, vars: PromptContext | Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

/**
 * Resolve a template string with context. Alias for interpolate with typed context.
 */
export function resolve(template: string, context: PromptContext): string {
  return interpolate(template, context);
}
