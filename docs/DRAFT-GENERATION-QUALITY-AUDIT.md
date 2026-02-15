# Draft Generation Quality Audit

**Purpose:** Understand the current LinkedIn draft generation system to recommend quality improvements.  
**Scope:** Prompts, voice matching, structure, model settings, and code paths.

---

## 1. Draft generation prompt

### 1.1 Where is the draft generation prompt?

- **Primary:** DB table `prompt_templates` (keys `draft_system`, `draft_user`). Loaded at runtime via `lib/prompts/store.ts` → `getPrompt(PROMPT_KEYS.DRAFT_SYSTEM | DRAFT_USER, context)`.
- **Fallback:** `lib/prompts/defaults.ts` (export `DEFAULT_PROMPTS.draft_system`, `draft_user`) when no DB row exists.
- **Secondary fallback:** `lib/prompts/generation-prompts.ts` (export `GENERATION_PROMPTS`) used by in-code `buildSystemPrompt` / `buildUserPrompt` in `lib/ai/generation.ts` when `getPrompt` throws or returns empty.

**Files:** `lib/prompts/store.ts`, `lib/prompts/defaults.ts`, `lib/prompts/generation-prompts.ts`, `lib/ai/generation.ts`.

### 1.2 What variables does it use?

Resolved via `getPrompt(key, context)` → `resolve(template, context)` in `lib/prompts/resolve.ts` ({{variable}} substitution).

**DRAFT_SYSTEM:**
- `{{pillarName}}`, `{{pillarContext}}` (built from pillar description, tone, targetAudience, customPrompt)
- `{{userInstructions}}` (profile `defaultInstructions`; optional)

**DRAFT_USER:**
- `{{topicTitle}}`, `{{topicDescription}}` (topic + optional description/snippets)
- `{{voiceExamples}}` – concatenation of up to **3** voice example post texts: `Example 1:\n{postText}\n\n---\n` etc.
- `{{userPerspective}}` – user’s angle / perspective for the post

**Snippet (generation.ts):**
```ts
systemPrompt = await getPrompt(PROMPT_KEYS.DRAFT_SYSTEM, {
  pillarName,
  pillarContext,
  userInstructions: userInstructions ? `\n**USER INSTRUCTIONS:** ${userInstructions}` : '',
});
userPrompt = await getPrompt(PROMPT_KEYS.DRAFT_USER, {
  topicTitle,
  topicDescription: topicDescriptionText,
  voiceExamples: voiceExamplesText,  // from voiceExamples.slice(0, 3)
  userPerspective,
});
systemPrompt = systemPrompt.replace(/3 variants/g, `${numVariants} variants`);
```

### 1.3 Is there a quality checklist in the prompt?

**Yes, in the default draft_system template (lib/prompts/defaults.ts):**
- One line: **"QUALITY CHECKLIST:** No clichés; clear CTA; length 200-600 characters; scroll-stopping hook; 3-5 relevant hashtags."

**Structure requirements in the same prompt:**
- Hook: 1–2 lines, scroll-stopping
- Body: 5–8 lines
- CTA: 1–2 lines
- Hashtags: 3–5
- Length: 200–600 characters

### 1.4 Actual prompt text (defaults)

**draft_system (lib/prompts/defaults.ts lines 68–115):**
```
You are an expert LinkedIn ghostwriter specializing in authentic, engaging content.

**CONTENT PILLAR:** {{pillarName}}
{{pillarContext}}

**YOUR TASK:**
Generate 3 LinkedIn post variants (A, B, C) that:
1. Match the user's authentic writing voice (study the examples provided)
2. Cover the topic thoroughly and insightfully
3. Engage the target audience with actionable insights
4. Follow LinkedIn best practices (hooks, storytelling, CTAs)

**VARIANT STYLES:**
- Variant A: Narrative/storytelling style (personal, relatable)
- Variant B: Analytical/data-driven style (insights, frameworks)
- Variant C: Conversational/question-based style (engaging, interactive)

**STRUCTURE REQUIREMENTS:**
- Hook: Compelling opening (1-2 lines, stops the scroll)
- Body: Main content (insights, story, data - 5-8 lines)
- CTA: Call to action (question, request for engagement - 1-2 lines)
- Hashtags: 3-5 relevant hashtags
- Length: 200-600 characters (LinkedIn sweet spot)

**IMPORTANT:**
- Match the user's voice patterns from their examples
- Avoid clichés ("game-changer", "unlock", "secret sauce")
- Be authentic, not corporate
- Use line breaks for readability
- Make it scroll-stopping

**QUALITY CHECKLIST:** No clichés; clear CTA; length 200-600 characters; scroll-stopping hook; 3-5 relevant hashtags.

**OUTPUT FORMAT (JSON):** { "variants": [ { "letter": "A", "style": "narrative", "hook": "...", "body": "...", "cta": "...", "fullText": "...", "hashtags": ["...", "..."] } ] }
{{userInstructions}}
```

**draft_user (lib/prompts/defaults.ts lines 117–126):**
```
**TOPIC:** {{topicTitle}}
{{topicDescription}}

**USER'S WRITING VOICE (study these examples):**

{{voiceExamples}}

Now generate 3 LinkedIn post variants (A, B, C) on the topic "{{topicTitle}}" that match this authentic voice.
Return ONLY valid JSON matching the format specified in the system prompt.

**USER'S PERSPECTIVE:**
{{userPerspective}}
```

**What could be improved (prompt):**
- Defaults say "3 variants" and "A, B, C" but production calls use `numVariants: 2`; only the phrase "3 variants" is replaced with "2 variants". Variant style list and draft_user still say "3 variants (A, B, C)" → can confuse the model when asking for 2.
- Length guidance is 200–600 characters; LinkedIn allows up to 3000. Consider clarifying “sweet spot” vs “hard max” and optionally allowing longer when needed.
- No explicit “short paragraphs (2–3 lines max)” in the default; only “Use line breaks for readability”.
- No explicit “under 1300 characters” rule (often cited as ideal); prompt uses 200–600 only.
- Quality checklist is a single line; could be expanded (e.g. one bullet per item) or moved to a post-parse validation step.

---

## 2. Voice matching

### 2.1 How many voice examples does generation use?

- **In the prompt:** Only **3** examples. `lib/ai/generation.ts` does `voiceExamples.slice(0, 3)` and builds `voiceExamplesText` from those.
- **Passed into the function:** Up to **10** (callers pass `examples.slice(0, 10)` from DB). So 10 are available for selection, but only the first 3 after sorting are used in the prompt.

**Snippet (lib/ai/generation.ts):**
```ts
const selectedExamples = voiceExamples.slice(0, 3);
const voiceExamplesText = selectedExamples
  .map((ex, i) => `Example ${i + 1}:\n${ex.postText}\n\n---\n`)
  .join('\n');
```

### 2.2 How are they selected?

**In both select-topic and topics/[id]/generate:**
1. Load up to 20 active voice examples for the user.
2. Sort in memory: **same pillar first**, then **newest first** (by `createdAt`).
3. Take first **10**.
4. Generation then uses first **3** of those 10 for the prompt.

**Snippet (app/api/chat/select-topic/route.ts):**
```ts
const examples = allExamples
  .sort((a, b) => {
    const aPriority = a.pillarId === effectivePillarId ? 0 : 1;
    const bPriority = b.pillarId === effectivePillarId ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
  .slice(0, 10);
```

So: same-pillar examples first, then by recency; no embedding-based “most similar to topic” selection.

### 2.3 Is there voice confidence scoring?

- **At generation time:** Yes. After generating each variant, the code computes a **voice match score** (0–100) by embedding the draft’s `fullText`, comparing to the profile’s `voiceEmbedding` (master) with cosine similarity, then `Math.round(similarity * 100)`. If `masterVoiceEmbedding` is missing, the score defaults to **50**.
- **In the product:** Profile has `voiceConfidenceScore` and `voiceEmbedding` from “Analyze voice” (voice/analyze). That analysis uses the same embeddings and consistency logic; the same embedding is used as the “master” for draft voice match.

**Snippet (lib/ai/generation.ts):**
```ts
let voiceMatchScore = 50; // Default
if (masterVoiceEmbedding) {
  const draftEmbedding = await generateEmbedding(post.fullText);
  const similarity = cosineSimilarity(draftEmbedding, masterVoiceEmbedding);
  voiceMatchScore = Math.round(similarity * 100);
}
```

### 2.4 What happens if the user has 0 voice examples?

- **Draft generation is never called with 0.** Both select-topic and topics/[id]/generate (and regenerate-drafts, write-from-scratch) check `examples.length < 3` and return **400** with a message like “You need at least 3 voice training examples. Please add more in Voice Training.”
- So the runtime never hits “0 examples” in the prompt; the minimum is 3.

**What could be improved (voice):**
- Only 3 examples in the prompt may be limiting for strong voice match; consider 5 or making it configurable.
- Selection is pillar + recency only; no semantic “closest to this topic” choice.
- If profile has no `voiceEmbedding` (user never ran “Analyze voice”), generation still runs but voice match score is fixed at 50; consider requiring analysis or surfacing “Voice not trained” in the UI when score is 50.

---

## 3. Post structure

### 3.1 Does the prompt enforce LinkedIn best practices?

| Practice | In prompt? | Detail |
|----------|------------|--------|
| Hook (first line grabs attention) | Yes | “Hook: Compelling opening (1-2 lines, stops the scroll)” |
| Short paragraphs (2–3 lines max) | Partially | “Use line breaks for readability”; no explicit “2–3 lines max per paragraph” |
| Clear CTA | Yes | “CTA: Call to action (question, request for engagement - 1-2 lines)” and in quality checklist |
| Hashtags | Yes | “3-5 relevant hashtags” and in checklist |
| Length (e.g. under 1300) | Partially | Prompt says “200-600 characters (LinkedIn sweet spot)”; no 1300 or 3000 max stated in prompt |

**Code-level validation (lib/ai/generation.ts `validatePost`):**
- Max length 3000, min 50.
- Hook present and ≥10 chars.
- Body present and ≥50 chars.
- Hashtags ≤10.

**Important:** `validatePost()` is **not** called in the production generation path (select-topic, topics/[id]/generate, regenerate-drafts). It is only used in `scripts/test-draft-generation.ts`. So generated posts are stored without validation; bad structure (e.g. no hook, too long) can still be saved.

### 3.2 Are variants actually different?

- **Prompt:** Asks for distinct styles: A = narrative, B = analytical, C = conversational. When `numVariants` is 2, only the number “3” in “3 variants” is replaced with “2”; the A/B/C style list is unchanged, so the model may still think in terms of A/B/C and produce 2 of the 3 styles.
- **No per-variant seed or temperature tweak:** A single API call returns all variants in one JSON; temperature is fixed (0.7) for the whole call, so variety depends entirely on the model and prompt.
- **Ordering:** Variants are **sorted by voice match score (desc)** before returning, so the order the user sees is by “best voice match” first, not A/B/C.

**What could be improved (structure):**
- Add explicit “2–3 lines per paragraph” (or similar) to the prompt.
- Add a hard “under 1300 characters” and/or “under 3000” in the prompt if desired.
- Call `validatePost()` after parsing and either reject/retry or flag drafts that fail (e.g. store validation result or show warnings in UI).
- When `numVariants === 2`, update prompt to ask explicitly for “2 variants” and specify which two styles (e.g. A and B only) to avoid confusion.

---

## 4. Generation settings

### 4.1 Which OpenAI model is used?

- **Draft generation:** `OPENAI_MODELS.GPT4O` (`gpt-4o`). Set in `lib/ai/openai.ts` → `DEFAULT_CONFIG.generation.model`.

**Snippet (lib/ai/openai.ts):**
```ts
generation: {
  model: OPENAI_MODELS.GPT4O,  // 'gpt-4o'
  temperature: 0.7,
  max_tokens: 1500,
},
```

### 4.2 Temperature and max tokens

- **Temperature:** **0.7** (higher = more creative).
- **Max tokens:** **1500** for the completion (enough for 2–3 posts in one JSON).

### 4.3 Post-processing (formatting cleanup)

- **None.** The code parses the JSON and maps to `LinkedInPost` (fullText, hook, body, cta, hashtags, characterCount). No trimming, normalising of line breaks, or stripping of markdown. If the model returns extra whitespace or different line endings, they are kept.

**Snippet (lib/ai/generation.ts):**
```ts
const post: LinkedInPost = {
  fullText: variant.fullText,
  hook: variant.hook,
  body: variant.body,
  cta: variant.cta,
  hashtags: variant.hashtags || [],
  characterCount: variant.fullText.length,
};
```

**What could be improved (settings):**
- Optional post-processing: trim each field, normalise `\n`, ensure `fullText` is consistent with hook+body+cta if you ever want to reconstruct from parts.
- Consider a slightly lower temperature (e.g. 0.5–0.6) if drafts are too loose or off-voice; keep 0.7 if the goal is more variety.

---

## 5. Current issues (TODOs / FIXMEs / quality)

### 5.1 lib/ai/generation.ts

- **Duplicate / late import:** There is an `import { GENERATION_PROMPTS, interpolate } from '@/lib/prompts/generation-prompts';` around line 219, after the main `generateDraftVariants` logic. It is used by `buildSystemPrompt` and `buildUserPrompt`. Works but is unusual; could move to top of file.
- **validatePost not used in production:** `validatePost()` is exported and used only in the test script. No validation of generated posts before DB insert in select-topic, topics/[id]/generate, or regenerate-drafts.
- **No retry on invalid JSON or missing fields:** If `parsed.variants` is missing or a variant is malformed, the code can throw or produce incomplete data; there’s no try/catch around parse or field access with a retry or fallback.

### 5.2 app/api/chat/select-topic/route.ts

- **numVariants: 2:** Only 2 drafts are requested; prompt text is adjusted only for “3 variants” → “2 variants”. User prompt and variant style list still reference “3 variants (A, B, C)”.
- **Voice examples:** Same pillar + recency, then first 10; generation uses first 3. No TODOs in this file related to quality.

### 5.3 app/api/topics/[id]/generate/route.ts

- Same voice selection and `numVariants: 2` as select-topic. No FIXMEs/TODOs about quality in the snippet read.

### 5.4 app/api/voice/examples/[id]/route.ts (DELETE)

- **TODO:** “Trigger voice retraining if this was an active example” (retrain-voice-profile job). Unrelated to draft quality but affects voice data over time.

**What could be improved (issues):**
- Run `validatePost()` on each variant and either: (a) filter out invalid ones and only persist valid, or (b) persist but attach validation errors to the draft (e.g. metadata or a “warnings” field) for the UI.
- Add a try/catch around JSON parse and variant mapping; on failure, optionally retry once with a “return valid JSON only” nudge.
- Move the generation-prompts import to the top of `generation.ts`.
- When `numVariants === 2`, explicitly ask for “2 variants” and name the two styles (e.g. A and B) in both system and user prompts.

---

## 6. Summary table

| Area | Current implementation | Possible improvement |
|------|-------------------------|----------------------|
| Prompt location | DB `prompt_templates` + defaults.ts + generation-prompts.ts | Keep; ensure DB templates stay in sync with defaults |
| Prompt variables | pillarName, pillarContext, topicTitle, topicDescription, voiceExamples (3), userPerspective, userInstructions | Add e.g. linkedInHeadline/summary for tone if desired |
| Quality checklist | One line in system prompt (no clichés, CTA, length, hook, hashtags) | Expand in prompt or enforce via validatePost + UI |
| Voice examples count | 3 in prompt; 10 passed in, 3 selected (pillar + recency) | Use 5 in prompt or add embedding-based selection |
| Voice with 0 examples | N/A (blocked at API: need ≥3) | — |
| Voice confidence | Score 0–100 from embedding similarity; default 50 if no profile embedding | Require “Analyze voice” or show “Voice not trained” when 50 |
| Hook / CTA / Hashtags | Enforced in prompt text only | Add validatePost in pipeline; optionally reject or flag |
| Short paragraphs | “Line breaks for readability” only | Add “2–3 lines per paragraph” (or similar) |
| Length | 200–600 in prompt; validatePost allows 50–3000 | Align prompt with 1300/3000 if needed; use validatePost |
| Model / temp / tokens | gpt-4o, 0.7, 1500 | Optional: lower temp; keep tokens |
| Post-processing | None | Optional: trim, normalise newlines |
| validatePost | Only in test script | Call in production path; store result or warnings |
| 2 vs 3 variants | Only “3 variants” replaced with “2”; A/B/C still in prompt | Request “2 variants” and name the two styles explicitly |

---

**File reference**

- Prompts: `lib/prompts/defaults.ts`, `lib/prompts/store.ts`, `lib/prompts/resolve.ts`, `lib/prompts/generation-prompts.ts`
- Generation: `lib/ai/generation.ts`, `lib/ai/openai.ts`, `lib/ai/embeddings.ts`
- Routes: `app/api/chat/select-topic/route.ts`, `app/api/topics/[id]/generate/route.ts`, `app/api/chat/regenerate-drafts/route.ts`
- Validation: `lib/ai/generation.ts` (`validatePost`, `estimateEngagement`)
