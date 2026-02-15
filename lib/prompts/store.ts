/**
 * Centralised prompt store: load templates from DB (with fallback to code defaults).
 * Mirrors n8n + Airtable pattern: prompts stored in DB, resolved at runtime with variables.
 */

import { db } from '@/lib/db';
import { promptTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { resolve, type PromptContext } from './resolve';
import { DEFAULT_PROMPTS } from './defaults';

export const PROMPT_KEYS = {
  RESEARCH_SYSTEM: 'research_system',
  RESEARCH_USER: 'research_user',
  CLASSIFICATION_SYSTEM: 'classification_system',
  CLASSIFICATION_USER: 'classification_user',
  DRAFT_SYSTEM: 'draft_system',
  DRAFT_USER: 'draft_user',
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];

/**
 * Get template body by key. Returns DB template if present, else default from code.
 */
export async function getPromptTemplate(key: string): Promise<string> {
  const row = await db.query.promptTemplates.findFirst({
    where: eq(promptTemplates.key, key),
    columns: { body: true },
  });
  if (row?.body) return row.body;
  const defaultBody = DEFAULT_PROMPTS[key as keyof typeof DEFAULT_PROMPTS];
  return typeof defaultBody === 'string' ? defaultBody : '';
}

/**
 * Get resolved prompt: load template by key, then resolve with context.
 */
export async function getPrompt(key: PromptKey, context: PromptContext): Promise<string> {
  const template = await getPromptTemplate(key);
  return resolve(template, context);
}
