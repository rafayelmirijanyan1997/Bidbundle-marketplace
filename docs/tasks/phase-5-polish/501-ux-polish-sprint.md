# Task 501 — UX Polish Sprint

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Fix one routing bug and apply focused UX polish across all three roles: restore the Inter font, fix a stat label, add empty states to all filter list views, and wire up the live bid cards on the homeowner dashboard so tapping "Live bidding" navigates to the bidding room.

## Why This Task Comes Now

Tasks 201–302 completed all three role experiences. A QA sweep at 375px, 768px, and 1280px revealed these items before the product can be considered stable for demo or stakeholder review.

---

## Fix 1 — Provider Routing Bug

**File:** `src/utils/onboardingState.ts`

The provider destination is currently hardcoded as `/app/provider/jobs`. That route does not exist. The correct route is `/app/provider/dashboard`.

Change:
```ts
// Before
provider: "/app/provider/jobs"

// After
provider: "/app/provider/dashboard"
```

**File:** `src/app/get-started/page.tsx`

Same fix — wherever `destinationByRole` maps `provider`, change the value to `/app/provider/dashboard`.

---

## Fix 2 — Restore Inter Font

**File:** `src/app/layout.tsx`

The `next/font/google` Inter import was removed by a previous Codex run. Restore it:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// In RootLayout:
<html lang="en" className={inter.className}>
```

---

## Fix 3 — Provider Profile Stat Label

**File:** `src/app/app/provider/profile/page.tsx`

The first stat in the stats row currently reads "THIS WEEK". Change the label to "EARNINGS":

Find the stat row and update the label text from whatever Codex wrote (e.g. "THIS WEEK", "This Week", "Revenue") to `"EARNINGS"`.

---

## Fix 4 — Empty States for Filter Lists

Add a consistent empty state card that appears when a filter returns 0 results. The empty state is a centered card (`bg-card rounded-card shadow-card p-8 flex flex-col items-center text-center gap-2`):
- A 48×48 circle `bg-muted/20` containing a simple inline SVG (a document with an X, or a magnifying glass — use a simple 3-line document with a cross through it, stroke-based, `text-muted`)
- Heading: `text-sm font-semibold text-foreground` — `"No {filterLabel} bids"` or `"No {filterLabel} members"`
- Body: `text-xs text-muted` — `"Nothing here yet."`

Apply to these three files:

### `src/app/app/homeowner/bids/page.tsx`
After filtering `mockBidHistory`, if the result array is empty, show the empty state instead of the list.
- Heading: `"No {filter === "all" ? "bids" : filter} bids"`
- Body: `"Nothing here yet."`

### `src/app/app/provider/bids/page.tsx`
Same pattern.
- Heading: `"No {filter === "all" ? "bids" : filter} bids"`
- Body: `"Nothing here yet."`

### `src/app/app/admin/community/page.tsx`
Same pattern.
- Heading: `"No {filter === "all" ? "members" : filter} members"`
- Body: `"Nothing here yet."`

Inline the empty state JSX directly in each page — do NOT create a shared component for this (it is simple enough to inline and the three pages differ slightly in copy).

---

## Fix 5 — Wire Live Bid Cards to Bidding Room

**File:** `src/components/homeowner/ServiceRequestCard.tsx`

Currently the service request card is a plain `<article>`. Wrap it in a `next/link` `<Link>` when `request.status === "live"`, routing to `/app/homeowner/bidding-room`. When status is not `"live"`, keep it as a non-interactive `<article>`.

Change the component to accept no new props — use `next/link`'s `<Link>` around the card:

```tsx
import Link from "next/link";

// If status === "live":
return (
  <Link href="/app/homeowner/bidding-room" className="block">
    <article className="...existing classes...">
      {/* existing card content */}
    </article>
  </Link>
);

// Otherwise:
return (
  <article className="...existing classes...">
    {/* existing card content */}
  </article>
);
```

Add `cursor-pointer` to the article className when it's a link so the tap target is clear.

---

## Files to Modify

```
src/utils/onboardingState.ts                        (Fix 1 — provider route)
src/app/get-started/page.tsx                        (Fix 1 — provider route)
src/app/layout.tsx                                  (Fix 2 — Inter font)
src/app/app/provider/profile/page.tsx               (Fix 3 — stat label)
src/app/app/homeowner/bids/page.tsx                 (Fix 4 — empty state)
src/app/app/provider/bids/page.tsx                  (Fix 4 — empty state)
src/app/app/admin/community/page.tsx                (Fix 4 — empty state)
src/components/homeowner/ServiceRequestCard.tsx      (Fix 5 — bidding room link)
```

No new files. Do not modify any other files. Do not add new npm packages. Do not edit `tailwind.config.ts`.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-5-polish/501-ux-polish-sprint.md` (this file)
- `src/utils/onboardingState.ts` — read current provider destination
- `src/app/get-started/page.tsx` — read current destinationByRole
- `src/app/layout.tsx` — read current state before restoring font
- `src/app/app/provider/profile/page.tsx` — find the stat label
- `src/app/app/homeowner/bids/page.tsx` — read filter logic to add empty state
- `src/app/app/provider/bids/page.tsx` — same
- `src/app/app/admin/community/page.tsx` — same
- `src/components/homeowner/ServiceRequestCard.tsx` — read current card structure

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] Completing onboarding as "Service Provider" routes to `/app/provider/dashboard` (not 404).
- [ ] App renders in Inter font (system font fallback until Google Fonts loads — no visual regression).
- [ ] Provider profile stats row: first stat label reads "EARNINGS" not "THIS WEEK".
- [ ] On homeowner Bids tab, selecting "Won" or "Past" with 0 matching items shows the empty state card instead of a blank space. (Current mock data has results for Won and Past, so test this by selecting a filter that would logically be empty — verify the conditional logic is correct by reading the code.)
- [ ] Same empty state logic in place on Provider Bids and Admin Community tabs.
- [ ] Tapping the "Plumbing leak inspection" (Live bidding) card on `/app/homeowner/dashboard` navigates to `/app/homeowner/bidding-room`.
- [ ] The "Lawn care bundle" (Grouping) and "Gutter cleanup" (Draft) cards are NOT clickable links.
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`.
3. Navigate to `/get-started`, complete onboarding selecting "Service Provider" → should land on `/app/provider/dashboard` (not `/app/provider/jobs`).
4. Check DevTools console — font load requests for Inter should appear from Google Fonts.
5. Navigate to `/app/provider/profile` — first stat label reads "EARNINGS".
6. Navigate to `/app/homeowner/bids` — tap each filter. On any filter that returns 0 results in the future, verify the conditional renders the empty state. Read the code to confirm the `filteredItems.length === 0` branch exists.
7. Same check for `/app/provider/bids` and `/app/admin/community`.
8. Navigate to `/app/homeowner/dashboard` — tap the "Plumbing leak inspection" card → navigates to `/app/homeowner/bidding-room`. Tap "Lawn care bundle" → no navigation (it's not a link). Tap "Gutter cleanup" → no navigation.
9. Confirm no horizontal scroll at 375px and 1280px across the homeowner dashboard, provider dashboard, and admin dashboard.

## Out of Scope

- Two-column desktop layout for dashboards
- Skeleton loading states
- Accessibility audit
- Copy polish beyond the label fix
- Animations or transitions
- Any new features

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-5-polish/501-ux-polish-sprint.md (this file).

This is a polish/bugfix task. Make ONLY these 5 targeted changes:

FIX 1 — Provider routing bug:
  In src/utils/onboardingState.ts: find the provider destination string and change it
  from "/app/provider/jobs" to "/app/provider/dashboard".
  In src/app/get-started/page.tsx: find the destinationByRole map and change
  provider value from "/app/provider/jobs" to "/app/provider/dashboard".

FIX 2 — Restore Inter font:
  In src/app/layout.tsx: add back the next/font/google Inter import and apply
  the className to the <html> element:
    import { Inter } from "next/font/google";
    const inter = Inter({ subsets: ["latin"], display: "swap" });
    <html lang="en" className={inter.className}>

FIX 3 — Provider profile stat label:
  In src/app/app/provider/profile/page.tsx: find the first stat label in the
  stats row (currently "THIS WEEK" or similar) and change it to "EARNINGS".

FIX 4 — Empty states for filter lists (3 files):
  In src/app/app/homeowner/bids/page.tsx:
    After computing the filteredItems array, add a conditional:
    if (filteredItems.length === 0) return a centered empty state card:
      <div className="bg-card rounded-card shadow-card p-8 flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8"
               viewBox="0 0 24 24">
            <rect x="5" y="3" width="14" height="18" rx="2"/>
            <path d="M9 9h6M9 12h6M9 15h4"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-foreground">No {filter === "all" ? "bids" : filter} bids</p>
        <p className="text-xs text-muted">Nothing here yet.</p>
      </div>
  Apply the identical pattern to src/app/app/provider/bids/page.tsx.
  Apply the same pattern to src/app/app/admin/community/page.tsx but with copy
  "No {filter === "all" ? "members" : filter} members".

FIX 5 — Wire live service cards to bidding room:
  In src/components/homeowner/ServiceRequestCard.tsx:
    Import Link from "next/link".
    Read the current component structure.
    Wrap the existing article in a <Link href="/app/homeowner/bidding-room"> only
    when request.status === "live". Add "cursor-pointer" to the article className
    for live cards. For non-live cards, keep the existing non-interactive article.

Do NOT create any new files.
Do NOT add any npm packages.
Do NOT edit tailwind.config.ts or globals.css.
Do NOT modify any other file beyond the 8 listed above.

Run `npm run build` at the end and fix any TypeScript errors.
Report: list every file modified, build output, deviations.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files modified:** `src/app/get-started/page.tsx`, `src/app/layout.tsx`, `src/app/app/provider/profile/page.tsx`, `src/app/app/homeowner/bids/page.tsx`, `src/app/app/provider/bids/page.tsx`, `src/app/app/admin/community/page.tsx`, `src/components/homeowner/ServiceRequestCard.tsx`
- **Build:** Zero errors. 19 static pages.
- **Playwright review:** All 5 fixes verified. Provider routing → `/app/provider/dashboard` confirmed. "EARNINGS" label confirmed on provider profile. Plumbing card link to `/app/homeowner/bidding-room` confirmed via DOM query. Empty state conditional (`filteredItems.length === 0`) present in all 3 filter pages. Inter font import restored in layout.tsx.
- **Review file:** `docs/reviews/501-ux-polish-sprint.md`

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Phase 2/3 complete (all 3 roles). QA sweep at 375/768/1280px identified these 5 items. All are targeted fixes — no new features.
- **Issues addressed:** Provider 404 routing bug, missing Inter font, stat label typo, empty state gaps, bidding room not linked from dashboard.
- **Next step:** Playwright review — verify provider onboarding destination, Inter font loading, stat label, empty state conditional, live card navigation.
