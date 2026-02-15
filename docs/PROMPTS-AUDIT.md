# Prompts audit: locations, variables, and single source of truth

**Purpose:** List every AI prompt, where it lives, which variables are supported, and which are user-editable. Use this when changing prompt behaviour or adding new placeholders.

**Last updated:** February 2026

---

## 1. Research (Perplexity)

| Item | Location | Variables | User-editable |
|------|----------|-----------|----------------|
| **System prompt** | `lib/prompts/defaults.ts` (key `research_system`); DB `prompt_templates` | `userInstructions` (from profile.defaultInstructions) | Yes (profile); template editable in DB |
| **User prompt (discovery)** | `lib/prompts/defaults.ts` (key `research_user`); DB `prompt_templates` | `domain`, `count`, `pillarContext`, `userInstructions`, `additionalInstructions` | Yes (profile + request); template in DB |

**Used in:**  
- `app/api/chat/research-ideas/route.ts` – resolves via `getPrompt(PROMPT_KEYS.RESEARCH_SYSTEM/USER)` with context from profile, pillar, request.  
- `app/api/discover/route.ts` – same.  
- `lib/ai/perplexity.ts` – `discoverTopics({ systemPrompt?, userQuery? })`; when not provided, falls back to `buildDiscoveryQuery(domain, count, pillarContext)`.

**Variable source of truth:**  
- `domain`, `count`, `pillarContext`: from API request and pillar row.  
- `userInstructions`: `profiles.default_instructions`.  
- `additionalInstructions`: request body (e.g. regenerate research).

---

## 2. Research single-topic (Perplexity)

| Item | Location | Variables | User-editable |
|------|----------|-----------|----------------|
| **Query** | Hardcoded in `lib/ai/perplexity.ts` `buildResearchQuery(topic, pillarContext)` | `topic`, `pillarContext` | No (code only) |

**Used in:** `app/api/discover/research/route.ts`, `lib/ai/perplexity.ts` `researchTopic()`.

**Note:** Can be moved to prompt store later (e.g. `research_single_user` template with `{{topic}}`, `{{pillarContext}}`, `{{userInstructions}}`).

---

## 3. Classification (OpenAI)

| Item | Location | Variables | User-editable |
|------|----------|-----------|----------------|
| **System prompt** | `lib/prompts/defaults.ts` (key `classification_system`); DB `prompt_templates` | `pillarsList` (built from pillars in code), `userInstructions` | Template in DB; list built in `lib/ai/classification.ts` |
| **User prompt (single)** | `lib/prompts/defaults.ts` (key `classification_user`) | `topicContent`, `sourceUrl` (e.g. `**SOURCE:** {{sourceUrl}}`) | Template in DB |

**Used in:** `lib/ai/classification.ts` – `buildClassificationSystemPrompt` / `buildClassificationUserPrompt` currently build strings in code; plan is to load from store and pass `pillarsList`, `topicContent`, `sourceUrl`, `userInstructions`.

**Variable source of truth:**  
- `pillarsList`: built from `pillars` table (name, id, description, tone, targetAudience).  
- `topicContent`, `sourceUrl`: from request / topic row.  
- `userInstructions`: `profiles.default_instructions`.

---

## 4. Classification (batch)

| Item | Location | Variables | User-editable |
|------|----------|-----------|----------------|
| **System / user** | Built in code in `lib/ai/classification.ts` | Pillars list, list of topics (content + optional sourceUrl) | No (code only) |

**Note:** Can add `classification_batch_system` / `classification_batch_user` templates with `{{pillarsList}}`, `{{topicsList}}` (or keep building topic list in code).

---

## 5. Draft generation (OpenAI)

| Item | Location | Variables | User-editable |
|------|----------|-----------|----------------|
| **System prompt** | `lib/prompts/defaults.ts` (key `draft_system`); DB `prompt_templates` | `pillarName`, `pillarContext` (description, tone, targetAudience, customPrompt), `userInstructions` | Pillar fields + profile; template in DB |
| **User prompt** | `lib/prompts/defaults.ts` (key `draft_user`); DB `prompt_templates` | `topicTitle`, `topicDescription`, `voiceExamples`, `userPerspective` | Topic + voice examples + user input; template in DB |

**Used in:** `lib/ai/generation.ts` – `buildSystemPrompt` / `buildUserPrompt` use `GENERATION_PROMPTS` from `lib/prompts/generation-prompts.ts`; plan is to switch to `getPrompt(DRAFT_SYSTEM/USER, context)` with same variables.

**Variable source of truth:**  
- `pillarName`, `pillarContext`: from `pillars` (name, description, tone, targetAudience, customPrompt).  
- `topicTitle`, `topicDescription`: from classified topic.  
- `voiceExamples`: from `voice_examples.post_text` (formatted in code).  
- `userPerspective`: from request / chat flow.  
- `userInstructions`: `profiles.default_instructions`.

---

## 6. Resolver and placeholders

**File:** `lib/prompts/resolve.ts`  
- `interpolate(template, vars)` – replaces `{{key}}` with `vars[key]` (empty string if missing).  
- `resolve(template, context)` – typed alias.

**File:** `lib/prompts/store.ts`  
- `getPromptTemplate(key)` – returns body from DB or `DEFAULT_PROMPTS[key]`.  
- `getPrompt(key, context)` – loads template then resolves with context.

**Supported placeholder names (PromptContext):**  
domain, count, pillarName, pillarContext, userInstructions, timeRange, audience, topic, additionalInstructions, pillarsList, topicContent, sourceUrl, topicTitle, topicDescription, voiceExamples, userPerspective, customInstructions, description, tone, targetAudience, linkedInHeadline, linkedInSummary, fullName, about, currentRole, and any other key passed in context.

---

## 7. Summary table

| Prompt use | Template key(s) | Where used | Variables (key) |
|------------|-----------------|------------|-----------------|
| Perplexity research (discover) | `research_system`, `research_user` | research-ideas, discover | domain, count, pillarContext, userInstructions, additionalInstructions |
| Perplexity research (single) | (code) | discover/research | topic, pillarContext |
| Classification (single) | `classification_system`, `classification_user` | classification.ts | pillarsList, topicContent, sourceUrl, userInstructions |
| Classification (batch) | (code) | classification.ts | pillarsList, topics list |
| Draft generation | `draft_system`, `draft_user` | generation.ts | pillarName, pillarContext, topicTitle, topicDescription, voiceExamples, userPerspective, userInstructions |

---

## 8. Editing prompts

- **Global defaults:** Stored in `prompt_templates` (seed via `scripts/seed-prompt-templates.ts`). Edit in DB or add a Settings / Admin UI for "Prompt templates".  
- **User-level instructions:** `profiles.default_instructions` – injected as `{{userInstructions}}` where templates support it.  
- **Pillar-level:** `pillars.custom_prompt` – used in draft generation as part of pillar context.
