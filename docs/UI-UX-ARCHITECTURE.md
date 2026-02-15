# ContentPilot AI – UI/UX Architecture

## Navigation hierarchy and routing

| Route | Label (sidebar / breadcrumb) | Purpose |
|-------|------------------------------|--------|
| `/dashboard` | Dashboard | Home: stats, “Classify Now” CTA, recent activity |
| `/topics` | Topics | Discovery (raw list + detail) and Classified (pillar tabs + grid) |
| `/topics/new` | Add Topic | Manual topic input |
| `/topics/[id]` | Detail | Single topic (if used) |
| `/drafts` | Generated | List of generated drafts |
| `/drafts/[id]` | Detail | 3-column variant review (A/B/C) + context |
| `/settings` | Settings | Tabs: Content Pillars, Voice Training, Integrations, Billing |
| `/analytics` | History | Past posts, analytics |
| `/pillars` | (linked from Settings) | Full pillars management |
| `/voice` | (linked from Settings) | Full voice examples management |

**Primary nav (sidebar, 240px / 64px collapsed):** Dashboard → Topics → Generated → Settings → History.  
**Header:** Breadcrumb (path-based), global search (⌘K), notifications, user avatar.

## Layout structure

- **Shell:** `AppShell` wraps all authenticated pages.
- **Sidebar:** Fixed left, 240px (expanded) / 64px (icon-only). Hidden below `md` (768px). Collapse state persisted in `localStorage` (`contentpilot_sidebar_collapsed`).
- **Header:** Sticky 64px, breadcrumb + search + actions.
- **Main:** Padding 24px (`p-6`), max-width 1440px centered, warm background (`bg-background`).
- **Mobile (< 768px):** Sidebar hidden; fixed **bottom navigation** with same 5 items; main full width; extra bottom padding so content clears the bar.

## Responsive breakpoints and behavior

- **Desktop-first:** Min-width 1024px for full layout; 768px+ for sidebar.
- **Tablet (768–1023px):** Sidebar visible (can be collapsed to icons). Generated/draft detail stacks or stays multi-column as space allows.
- **Mobile (< 768px):** Bottom nav only; single-column layouts; list/detail and 3-column variant views stack vertically; touch-friendly targets.

Tailwind: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. Shell uses `md` for sidebar vs bottom nav and content offset.

## Accessibility (WCAG 2.1 AA)

- **Focus:** All interactive elements use visible focus (e.g. `focus:ring-2 focus:ring-brand/20 focus:ring-offset-2`). No `outline: none` without a replacement.
- **Labels:** Icons in nav and actions have `aria-label` or `aria-hidden="true"` with adjacent text. Form inputs use `<label>` or `aria-label`.
- **Landmarks:** `<main>`, `<nav aria-label="…">`, `<header role="banner">`, breadcrumb `aria-label="Breadcrumb"`.
- **Current page:** Sidebar and bottom nav use `aria-current="page"` on the active route.
- **Contrast:** Design tokens (brand, charcoal, background) are used so text/UI meet ≥4.5:1 where required. `text-charcoal-light` for secondary text.
- **Keyboard:** Primary actions (Classify, Generate, Approve) are buttons/links. Search documents ⌘K. No keyboard traps in modals or panels.

## Component state variations

- **Buttons:** Default, hover, focus, disabled, loading (`isLoading` + `loadingText`). Primary (brand), secondary (outline), ghost, destructive (red).
- **Cards:** Default; hover (e.g. `card-hover`: slight lift + shadow); clickable use `cursor-pointer`.
- **Nav items:** Default, hover (light tint), active (brand background + shadow).
- **Empty states:** Illustration area, short copy, clear CTA (e.g. “Go to Discovery”).
- **Loading:** Skeleton loaders preferred for lists/cards; progress or toasts for AI actions (e.g. “Classifying 12 topics…”).

## Design system usage

- **Colors:** `brand`, `success`, `warning`, `error`, `background`, `surface`, `charcoal`, `border` from `tailwind.config` and `globals.css`.
- **Typography:** Sans (Inter), display (Space Grotesk).
- **Components:** `.card`, `.card-hover`, `.btn-primary`, `.btn-secondary`, `.input`, `.textarea`, `.select`, badge variants; reuse from `components/ui` and `app/globals.css`.
