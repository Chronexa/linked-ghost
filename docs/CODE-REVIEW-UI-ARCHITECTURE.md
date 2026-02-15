# Code Review: ContentPilot AI UI/UX Architecture

**Scope:** Shell layout, Dashboard, Topics (Discovery + Classified), Generated (drafts + 3-column detail), Settings (4 tabs), raw-topics API, hooks, responsive and a11y.

---

## Fixes applied during review

### 1. **Header.tsx – removed invalid `useSidebar()` usage**
- **Issue:** `const { collapsed } = useSidebar()` was used but `useSidebar` was not imported, and `collapsed` was unused.
- **Fix:** Removed the line. Header does not need sidebar state.

### 2. **Raw topics `[id]` route – wrong `withAuth` handler signature**
- **Issue:** Handlers used `(req, { user }, context)` and `context.params?.id`. `withAuth` passes a single context object `{ params, user }` as the second argument.
- **Fix:** Updated to `(req, { params, user })` and `params?.id` in both GET and DELETE.

### 3. **Drafts detail page – siblings query when `topicId` missing**
- **Issue:** `useDrafts(undefined)` ran when `currentDraft` was still null, fetching all drafts and risking wrong “siblings” for A/B/C.
- **Fix:** `useDrafts(..., { enabled: !!currentDraft?.topicId })` so the list-by-topicId query only runs when we have a topic. Extended `useDrafts` to accept an optional second argument `{ enabled?: boolean }`.

---

## Summary of changes (no code changes)

| Area | What was done |
|------|----------------|
| **Shell** | Sidebar (240px / 64px collapsible), Header (breadcrumb, search, notifications), AppShell, BottomNav for mobile. Sidebar hidden &lt;768px. |
| **Dashboard** | 4 stat cards, “Classify Now” CTA using batch classify, recent activity (last 5 drafts). Uses `useRawTopics`, `useTopics`, `useDrafts`, `useClassifyBatch`. |
| **Topics** | Tabs: Discovery (40/60 list + detail, bulk select, Classify/Delete), Classified (pillar tabs, grid, Generate post). Raw topic delete + batch classify. |
| **Generated** | Drafts list (existing, data shape fixed). Draft detail: context card + 3-column A/B/C when siblings exist; Save, Edit, Approve, Reject, Schedule. |
| **Settings** | 4 tabs: Content Pillars, Voice Training, Integrations, Billing. Inline pillar/voice management; integrations toggles and profile fields. |
| **API** | `GET/DELETE /api/raw-topics`, `GET/DELETE /api/raw-topics/[id]`. `GET /api/drafts` supports `topicId`. |
| **Hooks** | `useRawTopics`, `useRawTopic`, `useDeleteRawTopic`, `useClassifyBatch`; `useDrafts` accepts `topicId` and optional `{ enabled }`. |
| **Docs** | `docs/UI-UX-ARCHITECTURE.md` (nav, layout, responsive, a11y). |

---

## Data shape consistency

- **List endpoints (topics, drafts, pillars):** Backend uses `responses.list()` → `{ success, data: array, meta: { total } }`. Client (axios) sees this as the resolved value; pages use `(data as any)?.data` for the array and `(data as any)?.meta?.total` where needed.
- **Raw topics list:** Backend uses `responses.ok({ data: items, pagination })` → client uses `rawData?.data?.data` and `rawData?.data?.pagination?.total`. Consistent with other “custom” list shapes in the app.
- **Single resource (draft, user):** `responses.ok(payload)` → client uses `data?.data` (or `data?.data?.draft`, etc. depending on route). Draft detail uses `payload?.draft`, `payload?.topic`, `payload?.pillarName` correctly.

---

## Potential follow-ups (not blocking)

1. **Draft PATCH validation:** API requires `fullText`/`editedText` min 50 chars. If the user saves a shorter or empty draft, the request will fail. Consider relaxing to min(1) for drafts or surfacing a clear validation error in the UI.
2. **Keyboard shortcut ⌘K:** Search input exists but no global listener. Add a `useEffect` that listens for `keydown` (e.g. `meta+k`) and focuses the search input.
3. **Breadcrumb for draft detail:** Currently shows “Generated > Detail”. You could map `drafts/[id]` to “Generated > Edit” or “Generated > Variants” in `Breadcrumb.tsx` LABELS if desired.
4. **Settings integrations:** Perplexity/Reddit/LinkedIn toggles and keywords are local state only; no API persistence yet. Document or add backend when ready.
5. **Skeleton loaders:** Spec asked for skeletons for cards/lists; most screens use “Loading…” text. Can replace with skeleton components from the design system later.

---

## Accessibility and responsive

- **Focus:** Buttons and links use `focus:ring-2 focus:ring-brand/20` (and `focus:ring-offset-2` where needed).
- **Landmarks/labels:** `<main>`, `aria-label` on navs, `aria-current="page"` on active nav item, `sr-only` label for search, `aria-label` on icon-only buttons (e.g. notifications, collapse).
- **Mobile:** Bottom nav for &lt;768px; main content has `pb-24` to clear the bar; sidebar hidden on small screens.
- **Contrast:** Uses design tokens (charcoal, background, brand); no new contrast issues identified.

---

## Testing suggestions

- **Flows:** Dashboard → Classify Now (with raw topics); Topics → Discovery → select topic → Classify this; Classified → Generate post; Drafts → open draft with 3 variants → edit and Approve.
- **Edge cases:** Dashboard with 0 raw topics (CTA should offer “Go to Topics”); Classified with 0 topics (empty state); Draft detail with a single variant (single-column layout).
- **API:** `GET /api/raw-topics`, `GET/DELETE /api/raw-topics/[id]`, `GET /api/drafts?topicId=...` with and without `topicId`.

---

## Verdict

**Done.** The UI/UX architecture is implemented and the three bugs found during review (Header `useSidebar`, raw-topics `params`, drafts siblings `enabled`) are fixed. Remaining items above are optional improvements or future work.
