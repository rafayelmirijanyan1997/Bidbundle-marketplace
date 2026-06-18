# Task 302 — HOA Admin Preview (All 4 Tabs)

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Replace the Task 103 placeholder at `/app/admin/dashboard` with a real HOA admin Home tab, and build the Community, Reports, and Me tab pages. Covers the complete admin-side app experience using mock data only.

## Why This Task Comes Now

Phase 2 (homeowner) and Task 301 (provider) are complete. The admin route `/app/admin/dashboard` still shows the Task 103 placeholder text. The admin bottom nav has 4 tabs (Home · Community · Reports · Me); three of those 404. This task completes the third role and closes out all core Phase 2/3 UI work.

## Visual Reference

No dedicated admin screenshots exist in `docs/design-reference/`. Derive all visual design from the existing design system: dark navy summary cards, white rounded content cards, blue primary actions, orange accent for alerts and savings callouts — same tokens and card patterns used in the homeowner and provider dashboards.

---

## New Mock Data File

Create `src/data/mock/mockAdminDashboard.ts` (new file — do not touch any existing mock files):

```ts
export const mockAdminStats = {
  communityName: "Oakwood Heights HOA",
  adminName: "Lance Silva",
  adminInitials: "LS",
  totalMembers: 14,
  activeBids: 3,
  monthlySavings: 310,
  totalSavingsAllTime: 1840,
};

export interface CommunityMember {
  id: string;
  name: string;
  address: string;
  joinDate: string;
  eligibility: "verified" | "pending" | "ineligible";
}

export const mockCommunityMembers: CommunityMember[] = [
  { id: "m-1",  name: "Sarah Miller",   address: "12 Maple St",   joinDate: "Jan 2024", eligibility: "verified"   },
  { id: "m-2",  name: "James Kim",      address: "14 Maple St",   joinDate: "Feb 2024", eligibility: "verified"   },
  { id: "m-3",  name: "Priya Raman",    address: "18 Maple St",   joinDate: "Mar 2024", eligibility: "verified"   },
  { id: "m-4",  name: "David Chen",     address: "22 Cedar Lane", joinDate: "Mar 2024", eligibility: "pending"    },
  { id: "m-5",  name: "Aisha Patel",    address: "30 Cedar Lane", joinDate: "Apr 2024", eligibility: "pending"    },
  { id: "m-6",  name: "Tom Nguyen",     address: "8 Oak Ave",     joinDate: "Apr 2024", eligibility: "ineligible" },
];

export interface ActivityItem {
  id: string;
  description: string;
  time: string;
  type: "bid" | "join" | "saving";
}

export const mockRecentActivity: ActivityItem[] = [
  { id: "a-1", description: "ProFix Plumbing submitted a bid on Plumbing leak inspection", time: "18m ago",  type: "bid"     },
  { id: "a-2", description: "David Chen applied to join Oakwood Heights community",        time: "2h ago",   type: "join"    },
  { id: "a-3", description: "Lawn care group bid saved $130 across 5 homes",              time: "Yesterday", type: "saving"  },
];

export const mockSavingsReport = {
  categories: [
    { name: "Plumbing",     saved: 490, bids: 1 },
    { name: "Landscaping",  saved: 275, bids: 2 },
    { name: "Exterior",     saved: 220, bids: 1 },
    { name: "Cleaning",     saved: 140, bids: 1 },
    { name: "Handyman",     saved: 120, bids: 1 },
  ],
};
```

---

## Components to Create

### `src/components/admin/AdminSummaryCard.tsx`

```tsx
// Props: { stats: typeof mockAdminStats }
```

Outer: `bg-foreground text-white rounded-card p-5 shadow-card`

Layout:
```
[ LS ]  Lance Silva               Admin
        Oakwood Heights HOA
─────────────────────────────────────────────
    14            3          $310
  MEMBERS     ACTIVE BIDS   SAVED/MONTH
```

- Avatar: 48×48 circle `bg-primary`, white bold initials
- Role badge: `bg-white/10 text-white/70 text-[10px] font-semibold px-2 py-0.5 rounded-full` — "Admin"
- Community name: `text-xs text-white/60 mt-0.5`
- Divider + 3-col stats grid (same pattern as homeowner/provider summary cards)
- Stat labels: "MEMBERS", "ACTIVE BIDS", "SAVED/MONTH" (prefix monthlySavings with `$`)

### `src/components/admin/ActivityCard.tsx`

```tsx
// Props: { item: ActivityItem }
```

Outer: `bg-card rounded-card shadow-card p-4 flex items-start gap-3`

- **Icon** (flex-none, 36×36, `rounded-full flex items-center justify-center`):
  - `bid` → `bg-primary/10 text-primary` — document list inline SVG (same style as Bids nav icon)
  - `join` → `bg-accent/10 text-accent` — person inline SVG
  - `saving` → `bg-emerald-50 text-emerald-600` — checkmark inline SVG
- **Content** (flex-1):
  - Description: `text-sm text-foreground leading-snug`
  - Time: `text-xs text-muted mt-1`

`emerald` classes local to this component only — do NOT add to `tailwind.config.ts`.

### `src/components/admin/MemberCard.tsx`

```tsx
// Props: { member: CommunityMember }
```

Outer: `bg-card rounded-card shadow-card p-4 flex items-center gap-3`

- **Avatar** (flex-none, 40×40, `rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm`): first letter of name
- **Center** (flex-1 min-w-0):
  - Name: `text-sm font-semibold text-foreground`
  - Address + join date: `text-xs text-muted mt-0.5`
- **Right** (flex-none):
  - Eligibility badge (`text-[10px] font-semibold px-2 py-1 rounded-full`):
    - `verified` → `bg-emerald-100 text-emerald-700` — "Verified"
    - `pending` → `bg-accent/15 text-accent` — "Pending"
    - `ineligible` → `bg-red-50 text-red-500` — "Ineligible"

`emerald` and `red` classes local to this component — do NOT add to `tailwind.config.ts`.

### `src/components/admin/SavingsBarChart.tsx`

```tsx
// Props: { categories: typeof mockSavingsReport.categories }
```

A purely CSS bar chart — no chart library.

Outer: `bg-card rounded-card shadow-card p-4 space-y-3`

For each category:
```
Plumbing          $490
████████░░░░░░  (proportional bar)
```

- Row: `flex items-center justify-between mb-1`
  - Category name: `text-xs font-medium text-foreground`
  - Amount: `text-xs font-semibold text-foreground`
- Bar track: `w-full h-2 rounded-full bg-muted/20`
- Bar fill: `h-full rounded-full bg-primary` with `width: (saved / maxSaved * 100)%` computed inline

`maxSaved` = `Math.max(...categories.map(c => c.saved))`

---

## Pages to Create / Replace

### Admin Home tab — `src/app/app/admin/dashboard/page.tsx`

Replaces Task 103 placeholder. Server component.

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. `<AdminSummaryCard stats={mockAdminStats} />`
2. **Eligibility alert card** (when any member has `eligibility === "pending"`):
   `bg-accent/10 border border-accent/40 rounded-card p-4`
   - Title: `text-sm font-semibold text-accent` — "2 members pending eligibility"
   - Body: `text-xs text-muted mt-1` — "David Chen and Aisha Patel need HOA eligibility review."
   - CTA link: `text-xs font-semibold text-primary mt-2 block` — "Review eligibility →" (no-op)
3. **Recent activity section**:
   - Header: `<h2 className="text-sm font-semibold text-foreground">Recent activity</h2>`
   - `space-y-3` — one `<ActivityCard>` per `mockRecentActivity` entry

### Admin Community tab — `src/app/app/admin/community/page.tsx`

New page. Client component (filter state).

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. `<h1 className="text-xl font-bold text-foreground">Community</h1>`
2. Sub-heading: `<p className="text-xs text-muted mt-0.5">14 members · 2 pending review</p>`
3. Filter pills (`flex gap-2 mb-4 overflow-x-auto`):
   - "All" | "Verified" | "Pending" | "Ineligible"
   - `useState<"all" | CommunityMember["eligibility"]>("all")`
   - Same pill styles as homeowner/provider filter pills
4. Filtered member list (`space-y-3`): one `<MemberCard>` per filtered member

### Admin Reports tab — `src/app/app/admin/reports/page.tsx`

New page. Server component.

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. `<h1 className="text-xl font-bold text-foreground">Reports</h1>`
2. **Overview stats card** (`bg-card rounded-card shadow-card p-4 grid grid-cols-2 gap-4`):
   - 4 cells, each: value (`text-xl font-bold text-foreground`) + label (`text-xs text-muted uppercase tracking-wide mt-0.5`):
     - `$1,840` / "Total saved"
     - `3` / "Active bids"
     - `14` / "Members"
     - `92%` / "Avg win rate"
3. **Savings by category** section:
   - Header: `<h2 className="text-sm font-semibold text-foreground">Savings by category</h2>`
   - `<SavingsBarChart categories={mockSavingsReport.categories} />`
4. **All-time savings banner** (`bg-primary rounded-card p-4 text-white text-center`):
   - `<p className="text-2xl font-bold">$1,840</p>`
   - `<p className="text-xs text-white/70 mt-1">saved by Oakwood Heights this year</p>`

### Admin Me tab — `src/app/app/admin/profile/page.tsx`

New page. Server component.

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

1. `<h1 className="text-xl font-bold text-foreground">Profile</h1>`
2. Dark navy admin card (`bg-foreground text-white rounded-card p-5 shadow-card`):
   - "LS" avatar (48×48, `bg-primary rounded-full`)
   - "Lance Silva" + "Admin" badge (`bg-white/10 text-white/70 text-[10px] rounded-full px-2 py-0.5`)
   - Community: `text-xs text-white/60` — "Oakwood Heights HOA"
3. Stats row (white card, `grid grid-cols-3 divide-x divide-divider`):
   - `14` MEMBERS · `3` ACTIVE BIDS · `$310` SAVED
4. Settings menu (same structure as homeowner/provider — 5 rows):
   | Label | Subtitle |
   |---|---|
   | Community settings | Eligibility rules |
   | Notifications | Push, Email |
   | Address & area | Oakwood Heights |
   | Help & support | FAQ, Contact |
   | About NeighBid | v1.1 |
5. Sign out button (same red text pattern as other roles)

---

## Files to Create

```
src/data/mock/mockAdminDashboard.ts              (create)
src/components/admin/AdminSummaryCard.tsx        (create)
src/components/admin/ActivityCard.tsx            (create)
src/components/admin/MemberCard.tsx              (create)
src/components/admin/SavingsBarChart.tsx         (create)
src/app/app/admin/dashboard/page.tsx             (replace placeholder)
src/app/app/admin/community/page.tsx             (create)
src/app/app/admin/reports/page.tsx               (create)
src/app/app/admin/profile/page.tsx               (create)
```

Do not modify: `AppBottomNav.tsx`, `AppShell.tsx`, `layout.tsx`, `Button.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, any existing mock data files, services, types, `cn.ts`, or any existing homeowner/provider components.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-3-ai-db-placeholders/302-hoa-admin-preview.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `src/app/app/layout.tsx` — do not modify
- `src/components/homeowner/UserSummaryCard.tsx` — reference dark card pattern
- `src/components/homeowner/SettingsMenu.tsx` — reference settings menu pattern
- `src/components/provider/ProviderSummaryCard.tsx` — reference dark card pattern
- `tailwind.config.ts` — confirm tokens

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- All pages: `max-w-lg mx-auto px-5 py-6 pb-24`.
- `emerald` and `red-50/red-500` classes may be used locally in admin components only. Do NOT add to `tailwind.config.ts`.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/admin/dashboard` renders the Home tab (no placeholder text): AdminSummaryCard, eligibility alert, 3 activity cards.
- [ ] `/app/admin/community` renders "Community" heading, sub-heading, 4 filter pills, 6 member cards.
- [ ] Filter "Verified" → 3 cards; "Pending" → 2 cards; "Ineligible" → 1 card; "All" → 6 cards.
- [ ] Member cards: correct eligibility badge colors (green verified, orange pending, red ineligible).
- [ ] `/app/admin/reports` renders stats grid (4 cells), SavingsBarChart (5 categories), all-time savings banner.
- [ ] SavingsBarChart: proportional CSS bars, Plumbing longest at $490.
- [ ] `/app/admin/profile` renders admin dark navy card, 3 stats, 5 settings rows, Sign out.
- [ ] On all admin pages: correct tab active in bottom nav (Home/Community/Reports/Me).
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] No new libraries. No new theme tokens. No modifications to protected files.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, DevTools → iPhone 14 (390×844).
3. `/app/admin/dashboard`: AdminSummaryCard (dark navy, LS, Lance Silva, Admin badge, 14/3/$310 stats). Orange eligibility alert card with "2 members pending". 3 activity cards.
4. `/app/admin/community`: "Community" heading, "14 members · 2 pending review". 4 filter pills. 6 member cards visible on "All".
5. Tap "Verified" → 3 cards (Sarah, James, Priya — green badges). "Pending" → 2 (David, Aisha — orange). "Ineligible" → 1 (Tom — red). "All" → 6.
6. `/app/admin/reports`: 4-cell stats grid ($1,840/3/14/92%). SavingsBarChart with 5 categories, Plumbing bar longest. Blue savings banner at bottom.
7. `/app/admin/profile`: dark navy card, LS avatar, "Lance Silva", "Admin" badge, community name. Stats: 14 / 3 / $310. 5 settings rows. Sign out (red).
8. On each page: correct tab highlighted blue (Home/Community/Reports/Me).
9. Resize to 1280×800 — all pages centered, top nav, no scroll.
10. Navigate to `/app/homeowner/dashboard` and `/app/provider/dashboard` — both still render correctly.

## Out of Scope

- Real eligibility approval workflow
- Real community management
- Notification sending
- Real analytics or data aggregation
- Any new npm dependencies

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-3-ai-db-placeholders/302-hoa-admin-preview.md (this file),
then docs/01-design-ux/design-direction.md.

No dedicated admin design screenshots exist. Derive design from the same system used in
homeowner and provider dashboards: dark navy summary cards, white rounded content cards,
blue primary actions, orange accent for alerts.

Also read before starting:
- src/app/app/layout.tsx                           (do NOT modify)
- src/components/homeowner/UserSummaryCard.tsx     (reference dark card pattern)
- src/components/homeowner/SettingsMenu.tsx        (reference settings pattern)
- src/components/provider/ProviderSummaryCard.tsx  (reference dark card + badge pattern)
- tailwind.config.ts                               (do NOT modify)

CREATE these files only:

Mock data (1 file):
- src/data/mock/mockAdminDashboard.ts
  Export: mockAdminStats, CommunityMember interface, mockCommunityMembers (6 members),
  ActivityItem interface, mockRecentActivity (3 items), mockSavingsReport.
  See the "New Mock Data File" section for exact values.

Components (4 files):
- src/components/admin/AdminSummaryCard.tsx
  Props: { stats: typeof mockAdminStats }
  Dark navy card — same structure as ProviderSummaryCard but with:
  "Admin" badge instead of VERIFIED, stats: MEMBERS/ACTIVE BIDS/SAVED/MONTH

- src/components/admin/ActivityCard.tsx
  Props: { item: ActivityItem }
  White card with icon circle (type-based color) + description + time.
  Icon shapes (inline SVG, 20×20, stroke-based, currentColor):
    bid → document list (3 horizontal lines in rectangle)
    join → person (circle head + arc)
    saving → checkmark (polyline)
  emerald classes may be used for "saving" type icon bg — local to this component only.

- src/components/admin/MemberCard.tsx
  Props: { member: CommunityMember }
  White card: initial avatar + name + address/joinDate + eligibility badge.
  Badge colors: verified → emerald-100/emerald-700, pending → accent/15/accent, ineligible → red-50/red-500.
  emerald and red classes local to this component only.

- src/components/admin/SavingsBarChart.tsx
  Props: { categories: { name: string; saved: number; bids: number }[] }
  Server component. CSS-only bar chart — no chart library.
  For each category: row with name + amount, then bar track + fill.
  Bar fill width = (saved / maxSaved * 100) + "%" as inline style.
  bg-primary for bar fills.

Pages (4 files):
- src/app/app/admin/dashboard/page.tsx (server component — replace Task 103 placeholder)
  1. <AdminSummaryCard stats={mockAdminStats} />
  2. Orange eligibility alert card (bg-accent/10 border border-accent/40 rounded-card p-4):
     Title: "2 members pending eligibility" (text-sm font-semibold text-accent)
     Body: "David Chen and Aisha Patel need HOA eligibility review." (text-xs text-muted mt-1)
     CTA: "Review eligibility →" (text-xs font-semibold text-primary mt-2 block) — no-op
  3. Section header: "Recent activity" h2
  4. space-y-3: one <ActivityCard> per mockRecentActivity entry

- src/app/app/admin/community/page.tsx ("use client" — filter state)
  useState<"all" | CommunityMember["eligibility"]>("all")
  Heading + sub-heading + 4 filter pills (All/Verified/Pending/Ineligible) + filtered member list.
  Filter pills: same pattern as homeowner bids and provider bids pages.

- src/app/app/admin/reports/page.tsx (server component)
  1. Heading "Reports"
  2. 4-cell stats grid (grid grid-cols-2 gap-4 bg-card rounded-card shadow-card p-4):
     $1,840 TOTAL SAVED | 3 ACTIVE BIDS | 14 MEMBERS | 92% AVG WIN RATE
  3. "Savings by category" h2 + <SavingsBarChart categories={mockSavingsReport.categories} />
  4. Blue savings banner (bg-primary rounded-card p-4 text-white text-center):
     "$1,840" text-2xl font-bold + "saved by Oakwood Heights this year" text-xs text-white/70 mt-1

- src/app/app/admin/profile/page.tsx (server component)
  1. Heading "Profile"
  2. Dark navy card (bg-foreground rounded-card p-5 shadow-card text-white):
     LS avatar (48×48, bg-primary, rounded-full) + "Lance Silva" + "Admin" badge (bg-white/10 text-white/70 text-[10px] px-2 py-0.5 rounded-full)
     Community: "Oakwood Heights HOA" (text-xs text-white/60 mt-0.5)
  3. Stats row (bg-card rounded-card shadow-card p-4 grid grid-cols-3 divide-x divide-divider text-center):
     14 MEMBERS | 3 ACTIVE BIDS | $310 SAVED
  4. Settings menu (bg-card rounded-card shadow-card divide-y divide-divider overflow-hidden):
     5 rows — same <button w-full flex items-center justify-between px-4 py-3.5> pattern:
     Community settings/Eligibility rules | Notifications/Push Email |
     Address & area/Oakwood Heights | Help & support/FAQ Contact | About NeighBid/v1.1
  5. Sign out button (text-red-500) — no-op

Constraints:
- Do NOT add any npm packages.
- Do NOT add new Tailwind tokens or edit tailwind.config.ts.
- Do NOT modify any existing files: AppBottomNav, layout, Button, existing mock data,
  types, services, globals.css, cn.ts, or existing homeowner/provider components.
- "use client" only on community/page.tsx.
- emerald and red-50/red-500 may be used locally in admin components — do NOT add to config.

Run `npm run build` at the end. Fix any TypeScript or build errors.
Report: list every file created, full build output, deviations.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/data/mock/mockAdminDashboard.ts`; `src/components/admin/AdminSummaryCard.tsx`, `ActivityCard.tsx`, `MemberCard.tsx`, `SavingsBarChart.tsx`; `src/app/app/admin/dashboard/page.tsx` (replaced placeholder), `community/page.tsx`, `reports/page.tsx`, `profile/page.tsx`
- **Build:** Zero errors. 19 static pages.
- **Playwright review:** All 4 tabs passed at 375×812. Home: dark navy card (LS/Lance Silva/Admin badge/14·3·$310), orange eligibility alert, 3 activity cards with typed icons. Community: 6 member cards, filter pills work (Verified→3, Pending→2, Ineligible→1). Reports: 4-cell stats grid, CSS bar chart (Plumbing longest at $490, bars proportional), blue $1,840 savings banner. Profile: dark navy card, stats, 5 settings rows, Sign out.
- **Review file:** `docs/reviews/302-hoa-admin-preview.md`
- **All 3 roles complete.** Phase 2/3 UI work is done.

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Task 301 (full provider experience) accepted. This task completes the third and final role, giving every role a fully working app experience.
- **No dedicated design screenshots:** Admin UI derived from the same design system as homeowner/provider.
- **4 tabs:** Home (dashboard + activity) · Community (member list + filter) · Reports (analytics + CSS bar chart) · Me (profile + settings).
- **Next step:** Playwright review — check all 4 tabs, community filter pills, SavingsBarChart proportions, eligibility badges.
