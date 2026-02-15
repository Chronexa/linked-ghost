# Handoff: LinkedIn Post Quality Improvements

**Date:** February 13, 2026  
**Context:** Work completed in Cursor; codebase will be continued in Google IDX.

---

## 1. Summary

### Goal today
Improve **LinkedIn draft generation quality** by fixing three audit items and resolving production errors so the app (including research workflow) works for manual testing.

### Problems solved
1. **Poor LinkedIn formatting** — Prompts didn’t enforce LinkedIn-style structure (short hook, short paragraphs, ideal length, white space).
2. **Prompt/code mismatch** — Prompt said “Generate 3 variants” while the app only requested 2, wasting tokens and confusing the model.
3. **Validation not in production** — `validatePost()` existed but only ran in tests; bad drafts (e.g. too long, missing hook) were saved without warnings.
4. **App crashes / research broken** — `POST /api/chat/research-ideas` and `GET /api/user` returned 500 because the DB was missing profile columns (`default_instructions`, `linkedin_headline`, `linkedin_summary`).

---

## 2. Changes Made

### Prompts & resolution

| File | What changed | Why |
|------|----------------|-----|
| `lib/prompts/defaults.ts` | **Draft system/user templates:** Hook “1–2 punchy lines (under 100 characters)”; body “Short paragraphs — 2–3 lines MAX per paragraph. Use double line breaks between paragraphs”; length “800–1300 characters (LinkedIn’s engagement sweet spot)”; CTA and hashtags clarified. Quality checklist updated to include length, hook, paragraph rules, line breaks, 3–5 hashtags. Replaced “Generate 3 LinkedIn post variants (A, B, C)” with “Generate {{numVariants}} LinkedIn post variants”. | Enforce LinkedIn best practices and make variant count dynamic. |
| `lib/prompts/generation-prompts.ts` | Same **structure/formatting** rules as above in the fallback prompt (used when DB/store prompt isn’t available). | Keep fallback aligned with defaults. |
| `lib/prompts/resolve.ts` | Added `numVariants?: number` to `PromptContext`. | So templates can use `{{numVariants}}`. |

### Generation & validation

| File | What changed | Why |
|------|----------------|-----|
| `lib/ai/generation.ts` | **DraftVariant:** optional `qualityWarnings?: string[]`. In the loop that builds variants: after creating each `post`, call `validatePost(post)`; if invalid, set `qualityWarnings = validation.errors` and `console.warn`; attach `qualityWarnings` to each variant. **Prompts:** Both `getPrompt(PROMPT_KEYS.DRAFT_SYSTEM, …)` and `getPrompt(PROMPT_KEYS.DRAFT_USER, …)` now receive `numVariants` in context. Removed the old `systemPrompt.replace(/3 variants/g, …)` hack. | Run validation in production and surface issues without rejecting drafts; use real variant count in prompts. |

### API routes (draft responses)

| File | What changed | Why |
|------|----------------|-----|
| `app/api/chat/select-topic/route.ts` | Include `qualityWarnings: genResult.variants[i].qualityWarnings` in each draft in the response. | Client can show “Needs editing” and tooltips. |
| `app/api/topics/[id]/generate/route.ts` | Same: include `qualityWarnings` from `genResult.variants[index]` in the draft payload. | Same. |
| `app/api/chat/regenerate-drafts/route.ts` | Same: `qualityWarnings: genResult.variants[i].qualityWarnings` when mapping created drafts. | Same. |
| `app/api/chat/write-from-scratch/route.ts` | Same: pass through `qualityWarnings` from generation result. | Same. |

### UI

| File | What changed | Why |
|------|----------------|-----|
| `components/chat/messages/DraftVariantsMessage.tsx` | **Draft type:** added `qualityWarnings?: string[]`. When `currentDraft.qualityWarnings?.length` is set, render a **“Needs editing”** badge (warning variant) next to the voice match badge; `title={currentDraft.qualityWarnings.join(' • ')}` for tooltip. Fixed voice match badge to use `!= null` so 0% still shows. | Show validation issues on drafts without blocking the user. |

### Database / migrations

| File | What changed | Why |
|------|----------------|-----|
| `lib/db/migrations/meta/_journal.json` | Added journal entry for migration **0006_prompt_templates** (idx 6, tag `0006_prompt_templates`). | So Drizzle knows about the migration that adds profile columns and prompt_templates. |
| `scripts/apply-profile-columns.ts` | **New script.** Applies: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS` for `default_instructions`, `linkedin_headline`, `linkedin_summary`; creates enum `voice_example_source` and adds `voice_examples.source` if missing. | One-off way to add missing columns so research-ideas and /api/user stop 500’ing when migration hadn’t been run. |

---

## 3. New Features / Fixes

### LinkedIn formatting rules in prompts
- **Hook:** 1–2 punchy lines, under 100 characters.
- **Body:** 2–3 lines MAX per paragraph; double line breaks between paragraphs.
- **Length:** 800–1300 characters (stated as LinkedIn’s engagement sweet spot).
- **CTA and hashtags:** Clear CTA; 3–5 relevant hashtags.
- Quality checklist in the prompt reflects these rules; old “5–8 lines” body rule removed.

### Dynamic `numVariants` in generation
- **PromptContext** includes `numVariants`; templates use `{{numVariants}}`.
- When `numVariants: 2`, the prompt says “Generate 2 variants”; when 3, “Generate 3 variants.”
- All draft-generation API routes pass `numVariants` (currently 2) into the generation layer.

### `validatePost()` in production
- Every generated draft is validated with `validatePost()` before being returned.
- If invalid: `qualityWarnings` is set to the validation error messages; draft is still returned (Option A: warn, don’t reject).
- Server logs: `⚠️ Draft variant X quality warnings: [...]` for invalid variants.

### Quality warnings UI
- **DraftVariantsMessage:** If a draft has `qualityWarnings`, a “Needs editing” badge is shown; hover shows the warning messages.
- Draft type in that component includes `qualityWarnings?: string[]`.

### Database fix (research + /api/user)
- Migration **0006** was in the repo but not in the journal; DB was missing profile columns.
- Journal updated; **`scripts/apply-profile-columns.ts`** was added and run to add `default_instructions`, `linkedin_headline`, `linkedin_summary` (and voice_examples enum/column) so research-ideas and profile/user routes work.

---

## 4. What Still Needs Attention

### TODOs in code
- No new TODOs were added in the codebase for these changes.

### Known / possible issues
- **prompt_templates table:** The script `apply-profile-columns.ts` does **not** create the `prompt_templates` table (that’s in `0006_prompt_templates.sql`). If any code path relies on that table and it doesn’t exist, you may see errors. If so, run the full migration (e.g. `npm run db:migrate`) or `npm run db:push` (interactive) to sync schema.
- **Icons:** Build reports 404s for `favicon-16x16.png`, `icon-192.png`, `avatar-placeholder.png`; these are pre-existing and not related to today’s work.

### Suggestions for next steps
- Run a full migration or `db:push` once to ensure `prompt_templates` and any other 0006 objects exist if needed.
- Manually test: generate a draft that intentionally fails validation (e.g. very long post) to confirm the “Needs editing” badge and tooltip.
- Optionally add a “Needs editing” indicator on the drafts list page (e.g. `/drafts`) if drafts are stored with `qualityWarnings`.

---

## 5. How to Test

### 1. LinkedIn formatting (prompts)
- **Steps:** Dashboard → start or open a conversation → trigger draft generation (e.g. select a topic and generate).
- **Check:** Generated posts have short hooks (~1–2 lines, under ~100 chars), body paragraphs of 2–3 lines with double line breaks, length roughly 800–1300 characters, clear CTA and 3–5 hashtags.

### 2. Dynamic numVariants
- **Steps:** Same flow; code is set to `numVariants: 2` in select-topic, topics/[id]/generate, regenerate-drafts, write-from-scratch.
- **Check:** Exactly two variants are returned (e.g. A and B). Optional: temporarily log the resolved prompt and confirm it says “Generate 2 variants” (not “3”).

### 3. validatePost() and quality warnings
- **Steps:** Generate drafts as usual. To force a warning, you’d need a model response that violates rules (e.g. no hook, or length outside 50–3000); or inspect server logs after generation.
- **Check:** For invalid variants, server log shows `⚠️ Draft variant X quality warnings: [...]`. In the UI, that variant shows the **“Needs editing”** badge; hovering shows the warning messages.

### 4. Research workflow and /api/user (DB fix)
- **Steps:** Restart dev server after running `apply-profile-columns.ts`. Open dashboard with `?trigger=research` (or start research from UI). Open Profile / My Account.
- **Check:** No “Failed to research ideas” toast; research-ideas request returns 200. `/api/user` returns 200 and profile data loads (no 500).

### Quick command reference
```bash
# If you need to re-apply profile columns (e.g. new DB)
npx tsx scripts/apply-profile-columns.ts

# Restart dev server after DB changes
npm run dev
```

---

## Code snippets for reference

### PromptContext with numVariants (lib/prompts/resolve.ts)
```typescript
numVariants?: number;
```

### Template placeholder (lib/prompts/defaults.ts)
```text
Generate {{numVariants}} LinkedIn post variants ...
```

### Validation and qualityWarnings (lib/ai/generation.ts)
```typescript
const qualityWarnings = validation.valid ? undefined : validation.errors;
if (qualityWarnings?.length) {
  console.warn(`⚠️ Draft variant ${variant.letter} quality warnings:`, qualityWarnings);
}
// ... variant pushed with qualityWarnings
```

### UI badge (DraftVariantsMessage.tsx)
```tsx
{currentDraft.qualityWarnings?.length ? (
  <Badge variant="warning" ... title={currentDraft.qualityWarnings.join(' • ')}>
    Needs editing
  </Badge>
) : null}
```

---

*End of handoff document.*
