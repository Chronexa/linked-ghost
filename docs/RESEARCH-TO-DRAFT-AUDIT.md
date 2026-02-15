# Research → Draft Generation Flow – Audit

**Scope:** From “Research ideas” (or topic cards) through topic selection, perspective step, and draft generation to the draft variants UI.  
**Purpose:** List potential issues so improvements don’t break existing behaviour.

---

## 1. Flow overview

1. **Trigger:** Dashboard “Research ideas” → new conversation with `initialTrigger: 'research'` → `searchIdeas(conversationId)` (no `query` or `pillarId`).
2. **Research API:** `POST /api/chat/research-ideas` → Perplexity discovery → save user message (research_request) + assistant message (topic_cards with `metadata.topics`).
3. **Select topic:** User clicks Select (with or without “Add your points”) → `selectTopic(conversationId, topicContent, sources, userPerspective?, skipPerspective?)`.
4. **Select-topic API (Case 1):** If no perspective and not skip → insert user + `perspective_request` message, return `requiresPerspective: true`. Client refetches messages.
5. **Perspective step:** User enters text (min 20 chars) and “Generate Post”, or “Skip” → `selectTopic(..., perspective)` or `selectTopic(..., undefined, true)`.
6. **Select-topic API (Case 2):** Resolve pillar (or first active), create classified topic, load voice examples + profile, `generateDraftVariants`, insert drafts, insert user + `draft_variants` message, return `{ drafts, messageId }`. Client refetches.
7. **Draft UI:** `DraftVariantsMessage` shows tabs (Variant A/B), Copy, Edit, “Regenerate with different angle”, “Select This”.

---

## 2. Issues found

### 2.1 Fixed: Source shape (name vs title)

- **Was:** Select-topic validated `sources[].name`; research topics use Perplexity `title` → 422, draft generation never ran.
- **Status:** Fixed in `app/api/chat/select-topic/route.ts`: source schema accepts `name` or `title` and normalises to `name`.

### 2.2 “Regenerate with different angle” does not regenerate drafts

- **Where:** `ChatInterface.tsx` → `DraftVariantsMessage` `onRegenerate`:
  - Currently: `handleSend(\`Please regenerate drafts for topic ${msg.metadata?.drafts?.[0]?.topicId}...\`)` → sends a **plain user text message**.
  - There is no handler that interprets that text and calls `POST /api/chat/regenerate-drafts`.
- **Impact:** Button only adds a chat message; drafts are not regenerated. `regenerateDrafts(conversationId, topicId, userPerspective)` exists in `use-chat.ts` but is never used from the draft UI.
- **Suggested fix:** Either:
  - Wire “Regenerate with different angle” to a small flow (e.g. prompt for new angle, then `regenerateDrafts(conversationId, topicId, newAngle)` and append the new draft_variants message), or
  - Add a dedicated “Regenerate” that calls the regenerate-drafts API with the current topic id and a default or previously used perspective.

**Files:** `components/chat/ChatInterface.tsx` (draft_variants case), `lib/hooks/use-chat.ts` (`regenerateDrafts`), `app/api/chat/regenerate-drafts/route.ts`.

### 2.3 Draft “Save” does not persist edits

- **Where:** `DraftVariantsMessage.tsx` → `handleEditSave` only clears local edit state and shows “Edit saved” toast. It does not call `PATCH /api/drafts/:id` (or equivalent).
- **Impact:** Edited text is lost on refresh or when messages are refetched.
- **Suggested fix:** Call the drafts API to update `editedText` (or the field the API expects) when the user saves; optionally show the edited version in the UI and keep it in sync with the server.

**Files:** `components/chat/messages/DraftVariantsMessage.tsx`, `app/api/drafts/[id]/route.ts`, API client for drafts.

### 2.4 Optimistic “Selected topic” message not rolled back on error

- **Where:** `ChatInterface.tsx` → `handleSelectTopic`: on success it refetches; on catch it only `console.error`s. The optimistic user message (“Selected topic: …”) is never removed.
- **Impact:** User sees “Selected topic: X” with no follow-up (perspective prompt or drafts) and may be confused. They do get `toast.error('Failed to process topic')` from `use-chat.ts`.
- **Suggested fix:** In `handleSelectTopic`’s catch, remove the optimistic message (e.g. filter by `tempId`) so the list matches server state.

**Files:** `components/chat/ChatInterface.tsx`.

### 2.5 Pillar not carried from research to draft generation

- **Where:** Research can be triggered with `pillarId` (API supports it; Dashboard does not pass it). The topic_cards message does not store `pillarId`. When the user selects a topic, the client never sends `pillarId`; select-topic falls back to the **first active pillar**.
- **Impact:** If research were pillar-scoped (e.g. from a future UI), the chosen pillar would not be used for draft generation; the first pillar would always be used.
- **Suggested fix:** When saving the topic_cards message in research-ideas, add `pillarId` (and optionally `pillarName`) to `metadata`. When rendering topic cards or when calling select-topic, pass that `pillarId` in the request body so the same pillar is used for classification and generation.

**Files:** `app/api/chat/research-ideas/route.ts` (store pillarId in topic_cards metadata), `components/chat/ChatInterface.tsx` and/or TopicCardsMessage (pass pillarId into selectTopic), `lib/hooks/use-chat.ts` (add pillarId to selectTopic if needed), `app/api/chat/select-topic/route.ts` (already uses body pillarId when present).

### 2.6 Voice / profile preconditions can fail with a generic message

- **Where:** Select-topic (Case 2) returns:
  - `400` “You need at least 3 voice training examples. Please add more in Voice Training.”
  - `400` “Voice profile not trained. Please analyze your voice first.”
- **Impact:** Correct behaviour, but the user only sees the toast “Failed to process topic” unless the UI surfaces the response body. New users may not know they must add 3+ examples and run “Analyze voice” first.
- **Suggested fix:** Surface the API error message in the toast (e.g. use `res.json()` and show `error.message` or a known message string) so users see the exact reason. Optionally, before calling select-topic from the perspective step, check voice readiness and show an inline hint or block the action with a clear CTA.

**Files:** `lib/hooks/use-chat.ts` (selectTopic error handling), `app/api/chat/select-topic/route.ts`.

### 2.7 Perspective form only on “latest” message

- **Where:** `ChatInterface` renders `PerspectiveRequestMessage` only when `isLatest` (i.e. `index === messages.length - 1`) for a `perspective_request` message.
- **Impact:** If there were multiple perspective_request messages (e.g. two selects in a row), only the latest would show the form. Current flow (one select → one perspective request) is fine; this is an edge case if the product later allows multiple pending perspective requests.
- **Suggested fix:** Only if you support multiple pending requests: show a form per perspective_request and pass the correct `msg.metadata` into each, or resolve by conversation ordering and “active” state.

**Files:** `components/chat/ChatInterface.tsx`.

### 2.8 DraftVariantsMessage “Select This” has no handler

- **Where:** `DraftVariantsMessage` receives `onSelect?: (draft: Draft) => void` but in `ChatInterface` it is not passed: `<DraftVariantsMessage drafts={...} onRegenerate={...} />`.
- **Impact:** “Select This” button does nothing (no navigation to draft editor, no “use this draft” action). Drafts are created in DB and visible in the conversation only.
- **Suggested fix:** Pass `onSelect` that e.g. navigates to `/drafts/:id` or opens a modal to approve/schedule the draft, and ensure the draft id is available on the draft object (it is, from metadata.drafts).

**Files:** `components/chat/ChatInterface.tsx`, `components/chat/messages/DraftVariantsMessage.tsx`.

### 2.9 Research-ideas “regenerate” flag unused

- **Where:** `POST /api/chat/research-ideas` body accepts `regenerate: boolean` but the handler does not use it (no different behaviour when true).
- **Impact:** “Generate different ideas” still works (it calls the same API again and gets new topics), but the backend could use `regenerate` e.g. to avoid re-inserting a duplicate user message or to vary the prompt.
- **Suggested fix:** Optional: when `regenerate === true`, do not insert a new user message, or append `additionalInstructions` in a way that clearly signals “variation” in the prompt.

**Files:** `app/api/chat/research-ideas/route.ts`.

### 2.10 Topic content length / sanitisation

- **Where:** Select-topic only validates `topicContent` non-empty (min length 1). It is used in DB inserts and in the generation prompt.
- **Impact:** Very long content could stress prompts or UI; no explicit max length or sanitisation. Low risk if Perplexity topics are short.
- **Suggested fix:** Optional: add a reasonable max length (e.g. 2000) and trim in the schema or handler.

**Files:** `app/api/chat/select-topic/route.ts`.

---

## 3. Summary table

| # | Issue | Severity | Status / suggestion |
|---|--------|----------|----------------------|
| 2.1 | Source `name` vs `title` | High | Fixed |
| 2.2 | Regenerate button only sends text, doesn’t call regenerate-drafts API | High | Wire to `regenerateDrafts` or dedicated flow |
| 2.3 | Draft edit “Save” doesn’t persist | Medium | Call drafts PATCH on save |
| 2.4 | Optimistic message not removed on select-topic error | Low | Remove temp message in catch |
| 2.5 | Pillar not carried research → select-topic | Medium (when pillar-scoped research exists) | Store and pass pillarId |
| 2.6 | Voice/preconditions errors not surfaced in UI | Medium | Show API error in toast or inline |
| 2.7 | Perspective form only for latest message | Low (edge case) | Document or support multiple forms |
| 2.8 | “Select This” (draft) has no handler | Medium | Add onSelect → e.g. /drafts/:id |
| 2.9 | `regenerate` in research-ideas unused | Low | Optional: use in handler |
| 2.10 | topicContent length not bounded | Low | Optional: max length + trim |

---

## 4. File reference

- **Research:** `app/api/chat/research-ideas/route.ts`, `lib/hooks/use-chat.ts` (searchIdeas, regenerateResearch), `components/chat/ChatInterface.tsx` (initialTrigger), `lib/ai/perplexity.ts`.
- **Topic cards:** `components/chat/messages/TopicCardsMessage.tsx`, message type `topic_cards`, `metadata.topics`.
- **Select + perspective:** `app/api/chat/select-topic/route.ts`, `components/chat/ChatInterface.tsx` (handleSelectTopic, perspective_request branch), `components/chat/messages/PerspectiveRequestMessage.tsx`.
- **Drafts in chat:** `app/api/chat/select-topic/route.ts` (Case 2), `components/chat/messages/DraftVariantsMessage.tsx`, message type `draft_variants`, `metadata.drafts`.
- **Regenerate drafts:** `app/api/chat/regenerate-drafts/route.ts`, `lib/hooks/use-chat.ts` (regenerateDrafts).
- **Conversation messages:** `app/api/conversations/[id]/messages/route.ts` (GET returns full rows including `metadata`), `lib/hooks/use-conversations.ts`.

---

**Last updated:** From codebase audit of the research → draft generation flow.
