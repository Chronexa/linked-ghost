/**
 * Seed default prompt templates into DB. Run after migrations.
 * Idempotent: inserts only when key is missing.
 */
import 'dotenv/config';
import { db } from '../lib/db';
import { promptTemplates } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { DEFAULT_PROMPTS } from '../lib/prompts/defaults';
import { PROMPT_KEYS } from '../lib/prompts/store';

const SEED = [
  { key: PROMPT_KEYS.RESEARCH_SYSTEM, name: 'Research (system)', defaultFor: 'research' },
  { key: PROMPT_KEYS.RESEARCH_USER, name: 'Research (user query)', defaultFor: 'research' },
  { key: PROMPT_KEYS.CLASSIFICATION_SYSTEM, name: 'Classification (system)', defaultFor: 'classification' },
  { key: PROMPT_KEYS.CLASSIFICATION_USER, name: 'Classification (user)', defaultFor: 'classification' },
  { key: PROMPT_KEYS.DRAFT_SYSTEM, name: 'Draft generation (system)', defaultFor: 'draft_system' },
  { key: PROMPT_KEYS.DRAFT_USER, name: 'Draft generation (user)', defaultFor: 'draft_user' },
] as const;

async function main() {
  for (const { key, name, defaultFor } of SEED) {
    const existing = await db.query.promptTemplates.findFirst({ where: eq(promptTemplates.key, key) });
    if (existing) {
      console.log(`Skip (exists): ${key}`);
      continue;
    }
    const body = DEFAULT_PROMPTS[key as keyof typeof DEFAULT_PROMPTS];
    await db.insert(promptTemplates).values({
      key,
      name,
      body,
      defaultFor,
      updatedAt: new Date(),
    });
    console.log(`Seeded: ${key}`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
