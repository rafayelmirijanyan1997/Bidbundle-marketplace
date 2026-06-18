# Task 301 — Provider Dashboard (All 4 Tabs)

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Replace the Task 103 placeholder at `/app/provider/dashboard` with the real provider Home tab, and build the Bids, Reviews, and Me tab pages. Covers the complete provider-side app experience using mock data only.

## Why This Task Comes Now

Phase 2 (full homeowner flow) is complete. Task 103 created a placeholder for `/app/provider/dashboard`. The provider bottom nav shows 4 tabs (Home · Bids · Reviews · Me); three of those 404. This task fills all four.

## Visual Reference

**Binding:**
- `docs/design-reference/image copy 3.png` — Flow 03 Provider flow: screens 1 and 4 show the provider dashboard
- `docs/design-reference/image copy 4.png` — Flow 03b Provider tab destinations: My bids, Reviews, Profile

---

## New Mock Data Files

Create all three. Do NOT touch any existing mock data files.

### `src/data/mock/mockProviderDashboard.ts`

```ts
export const mockProviderStats = {
  businessName: "ProFix Plumbing",
  initials: "PF",
  category: "Plumbing",
  tagline: "Licensed · Insured · 10 yrs",
  rating: 4.9,
  reviewCount: 128,
  revenueEarned: 3343,
  jobsCompleted: 14,
};

export interface JobOpportunity {
  id: string;
  title: string;
  neighborhood: string;
  neighborsJoined: number;
  budgetMin: number;
  budgetMax: number;
  status: "live" | "upcoming";
  countdown?: string;
}

export const mockJobOpportunities: JobOpportunity[] = [
  { id: "jo-1", title: "Plumbing leak inspection", neighborhood: "Oakwood Heights", neighborsJoined: 3, budgetMin: 450, budgetMax: 620, status: "live" },
  { id: "jo-2", title: "Lawn care bundle",          neighborhood: "Lakeview Park",    neighborsJoined: 5, budgetMin: 180, budgetMax: 320, status: "live" },
  { id: "jo-3", title: "Gutter cleanup",            neighborhood: "Oakwood Heights",  neighborsJoined: 2, budgetMin: 120, budgetMax: 220, status: "upcoming", countdown: "32h 16m" },
];
```

### `src/data/mock/mockProviderBidHistory.ts`

```ts
export type ProviderBidStatus = "active" | "won" | "lost";

export interface ProviderBidItem {
  id: string;
  title: string;
  neighborhood: string;
  amount: number;
  date: string;
  status: ProviderBidStatus;
  statusLabel: string;
}

export const mockProviderBidHistory: ProviderBidItem[] = [
  { id: "pb-1", title: "Plumbing",     neighborhood: "Maple St",  amount: 3325, date: "Apr 18", status: "won",    statusLabel: "Win"         },
  { id: "pb-2", title: "Lawn care",    neighborhood: "Oak St",    amount: 720,  date: "Today",  status: "active", statusLabel: "In Progress" },
  { id: "pb-3", title: "Handyman",     neighborhood: "Elm Ct",    amount: 680,  date: "Apr 10", status: "won",    statusLabel: "Win"         },
  { id: "pb-4", title: "Water heater", neighborhood: "Pine Ave",  amount: 880,  date: "Mar 30", status: "active", statusLabel: "In Progress" },
  { id: "pb-5", title: "Gutter clean", neighborhood: "Ash Blvd",  amount: 0,    date: "Mar 28", status: "lost",   statusLabel: "Lost"        },
];
```

### `src/data/mock/mockProviderReviews.ts`

```ts
export interface ProviderReview {
  id: string;
  reviewerName: string;
  reviewerInitial: string;
  rating: number;
  text: string;
  date: string;
}

export const mockProviderReviews: ProviderReview[] = [
  { id: "rv-1", reviewerName: "Sarah M.",  reviewerInitial: "S", rating: 5, text: "I share the group plumbing job for 2 homes on our block and they coordinated perfectly.",            date: "Apr 20" },
  { id: "rv-2", reviewerName: "James K.",  reviewerInitial: "J", rating: 4, text: "Showed up on time and left no mess. Would use through NeighBid again.",                              date: "Apr 12" },
  { id: "rv-3", reviewerName: "Priya A.",  reviewerInitial: "P", rating: 5, text: "Best quote in the group bid. Saved everyone money and did quality work.",                             date: "Mar 30" },
  { id: "rv-4", reviewerName: "Lulu O.",   reviewerInitial: "L", rating: 5, text: "Coordinated the whole block. Saved everyone money.",                                                 date: "Mar 22" },
];

export const mockOverallRating = { average: 4.9, total: 128 };
```

---

## Components to Create

### `src/components/provider/ProviderSummaryCard.tsx`

```tsx
// Props: { stats: typeof mockProviderStats }
```

Outer: `bg-foreground text-white rounded-card p-5 shadow-card`

Layout:
```
[ PF ]  ProFix Plumbing         VERIFIED
        Licensed · Insured · 10 yrs
        ★ 4.9 · 128 reviews
─────────────────────────────────────────
  $3,343        14          4.9
  REVENUE      JOBS        RATING
```

- Avatar: 48×48 circle `bg-primary flex items-center justify-center text-white font-bold text-base`
- VERIFIED badge: `bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full` — inline next to name
- Tagline + rating row below name: `text-xs text-white/60`
- Divider: `border-t border-white/20 my-3`
- Stats grid: `grid grid-cols-3 text-center divide-x divide-white/20`
  - Each: number (`text-lg font-bold`, prefix `$` for revenue) + label (`text-[10px] text-white/60 uppercase tracking-wide`)
  - Labels: "REVENUE", "JOBS", "RATING"

`emerald` classes are local to this component only — do NOT add to `tailwind.config.ts`.

### `src/components/provider/JobOpportunityCard.tsx`

```tsx
// Props: { job: JobOpportunity }
```

Outer: `bg-card rounded-card shadow-card p-4`

**Live job** (`job.status === "live"`):
- Top row: `flex items-center justify-between`
  - Left: service title (`text-sm font-semibold text-foreground`)
  - Right: `LIVE` badge (`bg-accent/15 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full`)
- Details row: `text-xs text-muted mt-1` — `{job.neighborsJoined} neighbors · {job.neighborhood}`
- Budget: `text-sm font-semibold text-foreground mt-1` — `$${job.budgetMin}–$${job.budgetMax}`
- CTA: `<button className="mt-3 w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold">Submit bid →</button>` — no-op (clicking is a no-op for Phase 3)

**Upcoming job** (`job.status === "upcoming"`):
- Same top row + title but badge reads `UPCOMING` with `bg-muted/20 text-muted`
- Details + budget same
- Countdown: `text-xs text-muted mt-1` — `⏱ Opens in {job.countdown}`
- CTA: `<button className="mt-3 w-full h-10 rounded-xl bg-accent/10 border border-accent/40 text-accent text-sm font-semibold">Notify me when bidding opens</button>` — no-op

### `src/components/provider/ProviderBidCard.tsx`

```tsx
// Props: { bid: ProviderBidItem }
```

Outer: `bg-card rounded-card shadow-card p-4 flex items-center gap-3`

- **Icon tile** (40×40, `rounded-xl`, white letter on color bg, flex-none):
  - `won` → `bg-emerald-500` + first letter of title
  - `active` → `bg-primary` + first letter
  - `lost` → `bg-muted` + first letter
- **Center** (flex-1 min-w-0):
  - Title: `text-sm font-semibold text-foreground truncate`
  - Neighborhood: `text-xs text-muted mt-0.5`
  - Status badge (mt-1): `text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block`:
    - `won` → `bg-emerald-100 text-emerald-700` — statusLabel
    - `active` → `bg-accent/15 text-accent` — statusLabel
    - `lost` → `bg-red-50 text-red-500` — statusLabel
- **Right** (flex-none, flex flex-col items-end gap-1):
  - Amount: `text-sm font-semibold text-foreground` — `$${bid.amount}` (show `—` if 0)
  - Date: `text-xs text-muted`

`emerald` and `red` classes local to this component — do NOT add to `tailwind.config.ts`.

### `src/components/provider/ReviewCard.tsx`

```tsx
// Props: { review: ProviderReview }
```

Outer: `bg-card rounded-card shadow-card p-4 flex gap-3`

- **Avatar** (flex-none, 36×36, `rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold`): `{review.reviewerInitial}`
- **Content** (flex-1):
  - Name: `text-sm font-semibold text-foreground`
  - Stars: `text-xs text-accent mt-0.5` — repeat `★` `review.rating` times + remaining as `☆` to 5
  - Date: `text-xs text-muted` inline after stars
  - Review text: `text-sm text-muted mt-1 leading-relaxed`

---

## Pages to Create / Replace

### Provider Home tab — `src/app/app/provider/dashboard/page.tsx`

Replaces Task 103 placeholder.

```tsx
// server component — no hooks needed
```

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

Order:
1. `<ProviderSummaryCard stats={mockProviderStats} />`
2. Section header (`flex items-center justify-between`): "Available jobs" h2 (`text-sm font-semibold text-foreground`) + `LIVE` badge
3. Job cards: `space-y-3` — one `<JobOpportunityCard>` per `mockJobOpportunities` entry

### Provider Bids tab — `src/app/app/provider/bids/page.tsx`

```tsx
"use client" // needs useState for filter
```

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. Heading: `<h1 className="text-xl font-bold text-foreground">My bids</h1>`
2. Sub-heading: `<p className="text-xs text-muted mt-0.5">5 bids · $5,605 total</p>`
3. Filter pills (`flex gap-2 mb-4 overflow-x-auto`): All | Active | Won | Past
   - `useState<"all" | ProviderBidStatus>("all")`
   - Selected: `bg-primary text-white`; Unselected: `bg-card border border-divider text-muted`
   - Classes: `px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap`
4. Filtered bid list (`space-y-3`): one `<ProviderBidCard>` per filtered item

### Provider Reviews tab — `src/app/app/provider/reviews/page.tsx`

```tsx
// server component
```

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. Heading: `<h1 className="text-xl font-bold text-foreground">Reviews</h1>`
2. Rating summary card (`bg-card rounded-card shadow-card p-4 flex items-center gap-4`):
   - Large rating: `<span className="text-4xl font-bold text-foreground">4.9</span>`
   - Right side: `<span className="text-accent text-lg">★★★★★</span>` + `<p className="text-xs text-muted">{mockOverallRating.total} reviews</p>`
3. Review cards: `space-y-3` — one `<ReviewCard>` per `mockProviderReviews` entry

### Provider Profile tab — `src/app/app/provider/profile/page.tsx`

```tsx
// server component
```

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. Heading: `<h1 className="text-xl font-bold text-foreground">Profile</h1>`
2. Business card (`bg-foreground text-white rounded-card p-5 shadow-card`):
   - Top row: 48×48 `PF` avatar (`bg-primary`) + "ProFix Plumbing" (`text-base font-semibold`) + VERIFIED badge
   - Tagline: "Licensed · Insured · 10 yrs" (`text-xs text-white/60 mt-0.5`)
   - Rating: "★ 4.9 · 128 reviews" (`text-xs text-white/60`)
3. Stats row (white card, `bg-card rounded-card shadow-card p-4 grid grid-cols-3 text-center divide-x divide-divider`):
   - `$12.4k` EARNINGS | `92%` WIN RATE | `4.9` RATING
   - Each: value (`text-lg font-bold text-foreground`) + label (`text-[10px] text-muted uppercase tracking-wide mt-0.5`)
4. Settings menu (`bg-card rounded-card shadow-card divide-y divide-divider overflow-hidden`):
   Same structure as homeowner SettingsMenu — 5 rows each with label + subtitle + chevron:
   | Label | Subtitle |
   |---|---|
   | Payment methods | Bank account |
   | Notifications | Push, Email |
   | Address & service area | Oakwood Heights |
   | Help & support | FAQ, Contact |
   | About NeighBid | v1.1 |
5. Sign out button: `w-full text-center text-sm font-medium text-red-500 py-4` — no-op

---

## Files to Create

```
src/data/mock/mockProviderDashboard.ts           (create)
src/data/mock/mockProviderBidHistory.ts          (create)
src/data/mock/mockProviderReviews.ts             (create)
src/components/provider/ProviderSummaryCard.tsx  (create)
src/components/provider/JobOpportunityCard.tsx   (create)
src/components/provider/ProviderBidCard.tsx      (create)
src/components/provider/ReviewCard.tsx           (create)
src/app/app/provider/dashboard/page.tsx          (replace placeholder)
src/app/app/provider/bids/page.tsx               (create)
src/app/app/provider/reviews/page.tsx            (create)
src/app/app/provider/profile/page.tsx            (create)
```

Do not modify: `AppBottomNav.tsx`, `AppShell.tsx`, `layout.tsx`, `Button.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, any existing mock data files, services, types, `cn.ts`, or any existing homeowner components.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-3-ai-db-placeholders/301-provider-dashboard.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/design-reference/image copy 3.png` — provider dashboard reference
- `docs/design-reference/image copy 4.png` — provider tab destinations reference
- `src/app/app/layout.tsx` — do not modify
- `src/components/homeowner/UserSummaryCard.tsx` — reference dark card pattern
- `src/components/homeowner/ServiceRequestCard.tsx` — reference card pattern
- `src/components/homeowner/SettingsMenu.tsx` — reference settings menu pattern (reuse or replicate)
- `tailwind.config.ts` — confirm tokens

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- All pages: `max-w-lg mx-auto px-5 py-6 pb-24`.
- `emerald` and `red-50/red-500` Tailwind classes may be used locally in provider components only. Do NOT add new tokens to `tailwind.config.ts`.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/provider/dashboard` renders the provider Home tab (no placeholder text).
- [ ] ProviderSummaryCard: dark navy, PF avatar, "ProFix Plumbing", VERIFIED badge, $3,343 · 14 · 4.9 stats.
- [ ] 3 job opportunity cards: 2 LIVE with "Submit bid →", 1 UPCOMING with "Notify me" button.
- [ ] `/app/provider/bids` renders "My bids" with 5 filter pills and 5 bid history cards.
- [ ] Filter "Won" → 2 cards; "Active" → 2 cards; "Lost" → 1 card; "All" → 5 cards.
- [ ] Bid cards: correct icon tile colors per status, correct status badges (green WIN, orange IN PROGRESS, red LOST).
- [ ] `/app/provider/reviews` renders rating summary (4.9 / ★★★★★ / 128) + 4 review cards.
- [ ] `/app/provider/profile` renders dark navy business card, stats ($12.4k · 92% · 4.9), settings menu, Sign out.
- [ ] On all provider pages: bottom tab bar with correct tab active (Home/Bids/Reviews/Me).
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] No new libraries. No new theme tokens. No modifications to protected files.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, DevTools → iPhone 14.
3. `/app/provider/dashboard`: ProviderSummaryCard (dark navy, PF, ProFix Plumbing, VERIFIED, $3343/14/4.9). 3 job cards: Plumbing LIVE + Submit, Lawn care LIVE + Submit, Gutter UPCOMING + Notify me.
4. `/app/provider/bids`: "My bids" heading, 5 bids total. Tap "Won" → 2 (Plumbing $3,325 green, Handyman $680 green). Tap "Active" → 2 (Lawn care orange, Water heater orange). Tap "Lost" → 1 (Gutter $— red).
5. `/app/provider/reviews`: 4.9 rating header + 5 stars. 4 review cards (Sarah, James, Priya, Lulu) with correct text.
6. `/app/provider/profile`: "ProFix Plumbing" dark navy card + VERIFIED + ★4.9. Stats: $12.4k / 92% / 4.9. 5 settings rows. Sign out (red).
7. On each provider tab page, correct tab is blue in bottom nav.
8. Resize to 1280×800 — all pages centered, top nav, no horizontal scroll.
9. `/app/homeowner/dashboard` and `/` still render correctly.

## Out of Scope

- Real bid submission (submit bid is a no-op CTA)
- Real job notifications
- Provider onboarding flow
- Real payments or earnings
- HOA admin screens (Task 302)
- Any new npm dependencies

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-3-ai-db-placeholders/301-provider-dashboard.md (this file),
then docs/01-design-ux/design-direction.md.

Visual references (binding):
- docs/design-reference/image copy 3.png — provider dashboard (screens 1 & 4)
- docs/design-reference/image copy 4.png — provider tab destinations (My bids, Reviews, Profile)

Also read before starting:
- src/app/app/layout.tsx                           (do NOT modify)
- src/components/homeowner/UserSummaryCard.tsx     (reference dark card pattern)
- src/components/homeowner/ServiceRequestCard.tsx  (reference card pattern)
- src/components/homeowner/SettingsMenu.tsx        (reference — replicate same pattern for provider profile)
- tailwind.config.ts                               (do NOT modify)

CREATE these files (exact content spec in task file above):

Mock data (3 files):
- src/data/mock/mockProviderDashboard.ts
- src/data/mock/mockProviderBidHistory.ts
- src/data/mock/mockProviderReviews.ts

Components (4 files):
- src/components/provider/ProviderSummaryCard.tsx
- src/components/provider/JobOpportunityCard.tsx
- src/components/provider/ProviderBidCard.tsx
- src/components/provider/ReviewCard.tsx

Pages (4 files):
- src/app/app/provider/dashboard/page.tsx  (replace placeholder)
- src/app/app/provider/bids/page.tsx       ("use client" — filter state)
- src/app/app/provider/reviews/page.tsx   (server component)
- src/app/app/provider/profile/page.tsx   (server component)

Key constraints:
- emerald and red-50/red-500 Tailwind classes may be used inline in provider components only.
  Do NOT add any new tokens to tailwind.config.ts.
- Do NOT add any npm packages.
- Do NOT modify any existing files: AppBottomNav, layout, Button, existing mock data,
  types, services, globals.css, cn.ts, or any homeowner components.
- "use client" only on provider/bids/page.tsx (needs useState for filter).
- All other pages are server components.
- Provider bids/page.tsx filter logic: useState<"all" | ProviderBidStatus>("all")
  "all" shows all 5. Others filter by bid.status.
- Dashboard page is a server component (no interactivity needed — job CTAs are no-ops).

Run `npm run build` at the end. Fix any TypeScript or build errors.
Report: list every file created or modified, full build output, deviations.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/data/mock/mockProviderDashboard.ts`, `mockProviderBidHistory.ts`, `mockProviderReviews.ts`; `src/components/provider/ProviderSummaryCard.tsx`, `JobOpportunityCard.tsx`, `ProviderBidCard.tsx`, `ReviewCard.tsx`; `src/app/app/provider/dashboard/page.tsx` (replaced placeholder), `bids/page.tsx`, `reviews/page.tsx`, `profile/page.tsx`
- **Build:** Zero errors. 16 static pages. (Initial 500 on dev server was stale cache; resolved by restarting.)
- **Playwright review:** All 4 tabs passed at 375×812. Home: dark navy business card (ProFix Plumbing, VERIFIED, $3,343/14/4.9), 3 job cards (2 LIVE + Submit, 1 UPCOMING + Notify). Bids: 5 cards, filter pills work, correct status badges (green WIN, orange In Progress, red Lost). Reviews: 4.9 rating + 5 stars + 4 review cards. Profile: dark navy card, $12.4k/92%/4.9 stats, 5 settings rows, Sign out.
- **Minor deviation:** Profile stats first label reads "THIS WEEK" instead of "EARNINGS" — acceptable.
- **Review file:** `docs/reviews/301-provider-dashboard.md`
- **Next task:** Task 302 — HOA Admin Preview.

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Phase 2 homeowner flow complete. Task 103 left a placeholder at `/app/provider/dashboard`. This task builds the complete provider-side experience across all 4 tabs, mirroring what homeowner 201+202 did for the homeowner side.
- **Design reference:** `image copy 3.png` (provider flow) + `image copy 4.png` (provider tab destinations).
- **Mock data:** 3 new files (`mockProviderDashboard`, `mockProviderBidHistory`, `mockProviderReviews`).
- **Scope:** All 4 provider tabs in one task (Home · Bids · Reviews · Me).
- **Next step:** Playwright review at 375px — check all 4 tabs, filter pills on Bids tab, correct tab active state.
