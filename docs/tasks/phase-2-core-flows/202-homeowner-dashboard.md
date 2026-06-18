# Task 202 — Homeowner Bids, Chat, and Profile Tabs

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Replace the three remaining placeholder tab pages (`/app/homeowner/bids`, `/app/homeowner/chat`, `/app/homeowner/profile`) with real, screenshot-faithful screens. Together with Task 201, this completes the homeowner app experience in Phase 2.

## Why This Task Comes Now

Task 201 (Homeowner Dashboard Home tab) was accepted. The bottom nav shows four tabs; three still route to placeholder text. This task fills them in.

## Visual Reference

**Binding reference:** `docs/design-reference/image copy 2.png` (Flow 02b — Homeowner tab destinations).

- Left phone = Bids tab ("Your bids")
- Right phone = Profile tab

Chat tab is not shown in the reference — use a designed empty state (see spec below).

---

## Bids Tab (`/app/homeowner/bids`)

### User-Facing Behavior

The homeowner sees a page titled "Your bids" with a sub-heading showing total count and savings. Below that, a row of filter pills (All / Active / Won / Past). Below the filters, a scrollable list of bid history cards. The "All" filter is selected by default and shows all bids. Tapping another filter shows only bids matching that status. Tapping a card is a no-op for now.

### Mock Data

Create `src/data/mock/mockBidHistory.ts` (new file — do not touch existing mock files):

```ts
export type BidStatus = "active" | "won" | "past";

export interface BidHistoryItem {
  id: string;
  title: string;
  category: string;
  provider: string;
  amount: number;
  date: string;       // display string, e.g. "18m ago", "Today", "Apr 10", "Mar 28"
  status: BidStatus;
  statusLabel: string; // e.g. "In Progress", "Complete", "Saved", "Expired"
}

export const mockBidHistory: BidHistoryItem[] = [
  { id: "bh-1", title: "Plumbing leak inspection", category: "Plumbing",   provider: "ProFix Plumbing",    amount: 490, date: "18m ago", status: "active", statusLabel: "In Progress" },
  { id: "bh-2", title: "Lawn care bundle",          category: "Landscaping",provider: "GreenThumb Co",     amount: 275, date: "Today",  status: "active", statusLabel: "In Progress" },
  { id: "bh-3", title: "House cleaning",            category: "Cleaning",   provider: "SparkleClean",      amount: 140, date: "Apr 10", status: "won",    statusLabel: "Complete"    },
  { id: "bh-4", title: "Gutter repair",             category: "Exterior",   provider: "AllWeather Crew",   amount: 330, date: "Mar 28", status: "past",   statusLabel: "Saved"       },
];
```

### BidHistoryCard Component

```tsx
// src/components/homeowner/BidHistoryCard.tsx
// Props: { item: BidHistoryItem }
```

Layout: `bg-card rounded-card shadow-card p-4 flex items-center gap-3`

- **Icon tile** (flex-none, 40×40, `rounded-xl`, white letter on colored bg):
  - Plumbing → `bg-primary` + "P"
  - Landscaping → `bg-accent` + "L"
  - Cleaning → `bg-primary/70` + "C"
  - Exterior → `bg-foreground` + "E"
  - default → `bg-muted` + first letter
- **Center** (flex-1 min-w-0):
  - Title: `text-sm font-semibold text-foreground truncate`
  - Provider: `text-xs text-muted mt-0.5 truncate`
  - Status badge (inline, `mt-1`):
    - `active` → `bg-accent/15 text-accent` — statusLabel
    - `won` → `bg-emerald-100 text-emerald-700` — statusLabel
    - `past` → `bg-muted/20 text-muted` — statusLabel
    - Badge classes: `text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block`
- **Right** (flex-none, flex flex-col items-end gap-1):
  - Amount: `text-sm font-semibold text-foreground` — `$amount`
  - Date: `text-xs text-muted`

### Bids Page

```tsx
// src/app/app/homeowner/bids/page.tsx
"use client"
```

Structure (`max-w-lg mx-auto px-5 py-6 pb-24`):

1. **Page header** (`mb-4`):
   - `<h1 className="text-xl font-bold text-foreground">Your bids</h1>`
   - `<p className="text-xs text-muted mt-0.5">4 services · $310 total saved</p>`

2. **Filter pills** (`flex gap-2 mb-4 overflow-x-auto`):
   Four pills: "All" | "Active" | "Won" | "Past". Each is a `<button>`:
   - Selected: `bg-primary text-white`
   - Unselected: `bg-card border border-divider text-muted`
   - Classes: `px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap`
   - Active pill = controlled by `useState<BidStatus | "all">("all")`

3. **Bid list** (`space-y-3`):
   - Filter `mockBidHistory` by selected filter (`"all"` shows all)
   - One `<BidHistoryCard>` per item

---

## Profile Tab (`/app/homeowner/profile`)

### User-Facing Behavior

The homeowner sees their profile with a dark navy user card (avatar, name, neighborhood, join date, verified badge, rating), a three-stat row, and a settings list. "Sign out" is a red text button at the bottom — clicking is a no-op (no real auth).

### ProfileCard Component

```tsx
// src/components/homeowner/ProfileCard.tsx
// Props: { initials: string; name: string; address: string; joinDate: string; rating: number; servicesBooked: number }
```

Outer: `bg-foreground text-white rounded-card p-5 shadow-card`

Layout:
```
[ LS avatar ]  Lance Silva
               123 Maple St · Oakwood Heights · 5 Nov 2024
               [✓ VERIFIED]   [★ 4.0 · 3 services booked]
```

- Avatar: 48×48 circle `bg-primary flex items-center justify-center text-white font-bold text-base`
- Name: `text-base font-semibold`
- Address/date line: `text-xs text-white/70 mt-0.5`
- Badge row (`flex gap-2 mt-2 flex-wrap`):
  - Verified: `bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full` — "✓ VERIFIED"
  - Rating: `bg-primary/20 text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full` — `★ {rating} · {servicesBooked} services booked`

### Stats Row

Identical structure to the dashboard `UserSummaryCard` stats row, but rendered on a white `bg-card rounded-card shadow-card p-4` surface instead of inside the dark card.

Three stats: `$310 Saved` · `7 Neighbors` · `3 Active bids`

Grid: `grid grid-cols-3 text-center divide-x divide-divider`

Each cell: number in `text-lg font-bold text-foreground` + label in `text-[10px] text-muted uppercase tracking-wide mt-0.5`

### Settings Menu

```tsx
// src/components/homeowner/SettingsMenu.tsx
// No props — static list
```

White card `bg-card rounded-card shadow-card divide-y divide-divider overflow-hidden`:

Each row is a `<button className="w-full flex items-center justify-between px-4 py-3.5 text-left">`:
- Left: label (`text-sm font-medium text-foreground`) + subtitle below (`text-xs text-muted mt-0.5`)
- Right: `›` chevron (`text-muted text-lg leading-none`)

Rows:
| Label | Subtitle |
|---|---|
| Payment method | May 2027 |
| Notifications | Push, Email |
| Address & service area | 123 Maple St |
| Help & support | FAQ, Contact |
| About NeighBid | v1.1 |

Below the menu card, a separate "Sign out" `<button className="w-full text-center text-sm font-medium text-red-500 py-4">Sign out</button>` — clicking is a no-op.

### Profile Page

```tsx
// src/app/app/homeowner/profile/page.tsx
// Can be a server component — no hooks needed (no filtering state)
```

Structure (`max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`):

1. `<h1 className="text-xl font-bold text-foreground">Profile</h1>`
2. `<ProfileCard initials="LS" name="Lance Silva" address="123 Maple St · Oakwood Heights" joinDate="5 Nov 2024" rating={4.0} servicesBooked={3} />`
3. Stats row (inline, not a separate component — just a `<div className="bg-card rounded-card shadow-card p-4 grid grid-cols-3 text-center divide-x divide-divider">`)
4. `<SettingsMenu />`

---

## Chat Tab (`/app/homeowner/chat`)

### User-Facing Behavior

The chat tab is not in the design references. Render a designed empty state — not a placeholder line, but a real screen with an icon, heading, and context message.

### Chat Page

```tsx
// src/app/app/homeowner/chat/page.tsx
// Server component — no hooks needed
```

Structure (`max-w-lg mx-auto px-5 py-6 pb-24`):

1. `<h1 className="text-xl font-bold text-foreground mb-6">Community chat</h1>`
2. Centered empty state (`flex flex-col items-center justify-center py-16 text-center gap-3`):
   - Icon: 56×56 circle `bg-primary/10 flex items-center justify-center rounded-full` containing a chat bubble inline SVG (24×24, `text-primary`, stroke-based — same style as the AppBottomNav chat icon)
   - Heading: `text-base font-semibold text-foreground` — "Chat with your neighbors"
   - Body: `text-sm text-muted max-w-xs` — "Community chat opens when a group bid goes live. You'll be notified when neighbors join your request."
3. An info card (`bg-primary/5 border border-primary/20 rounded-card p-4 mt-4`):
   - `text-sm text-primary font-medium` — "1 active group bid"
   - `text-xs text-muted mt-1` — "Plumbing leak inspection · Oakwood Heights"

---

## Files to Create / Modify

```
src/data/mock/mockBidHistory.ts                  (create — new mock file)
src/components/homeowner/BidHistoryCard.tsx      (create)
src/components/homeowner/ProfileCard.tsx         (create)
src/components/homeowner/SettingsMenu.tsx        (create)
src/app/app/homeowner/bids/page.tsx              (replace placeholder)
src/app/app/homeowner/profile/page.tsx           (replace placeholder)
src/app/app/homeowner/chat/page.tsx              (replace placeholder)
```

Do not modify: `AppBottomNav.tsx`, `AppShell.tsx`, `Navbar.tsx`, `Button.tsx`, `layout.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, any existing mock data files, services, types, or `cn.ts`.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-2-core-flows/202-homeowner-dashboard.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/design-reference/image copy 2.png` — binding visual reference
- `src/app/app/layout.tsx` — do not modify
- `src/components/layout/AppBottomNav.tsx` — reference the chat icon SVG shape for reuse in empty state
- `src/components/ui/Button.tsx` — reuse if needed
- `src/components/homeowner/UserSummaryCard.tsx` — reference for dark navy card pattern
- `src/components/homeowner/ServiceRequestCard.tsx` — reference for card pattern
- `tailwind.config.ts` — confirm tokens

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- All pages use `max-w-lg mx-auto px-5 py-6 pb-24`.
- Filter pills on Bids tab use `overflow-x-auto` to scroll horizontally if needed on very small screens.
- Use only existing theme tokens except the `emerald-*` classes used locally in `BidHistoryCard` and `ProfileCard` (same pattern as Task 102's green card — keep local to the component, do not add to `tailwind.config.ts`).
- Do not add new tokens to `tailwind.config.ts`.

## AI / Database Placeholder Requirements

None. All data is static mock.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/homeowner/bids` renders "Your bids" with sub-heading, 4 filter pills, and 4 bid history cards.
- [ ] Filter pills work: tapping "Active" shows only the 2 active bids; "Won" shows 1; "Past" shows 1; "All" shows all 4.
- [ ] Each bid card shows category tile (correct color), title, provider, status badge (correct color), amount, date.
- [ ] `/app/homeowner/profile` renders the ProfileCard (dark navy), stats row, settings menu, Sign out button.
- [ ] ProfileCard shows "LS" initials, "Lance Silva", address, join date, VERIFIED badge, rating.
- [ ] Settings menu shows 5 rows each with label + subtitle + chevron.
- [ ] `/app/homeowner/chat` renders "Community chat" heading, empty state with icon + heading + body, and the info card.
- [ ] Bottom tab bar visible on all three pages; correct tab is blue/active.
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] No new libraries added to `package.json`.
- [ ] No new theme tokens added to `tailwind.config.ts`.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.
- [ ] Landing page and `/get-started` and `/app/homeowner/dashboard` all still render correctly.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, DevTools → iPhone 14 (390×844).
3. `/app/homeowner/bids`: confirm heading, sub-heading, 4 filter pills. "All" selected (blue). 4 cards visible.
4. Tap "Active" → 2 cards (Plumbing, Lawn care). Tap "Won" → 1 card (House cleaning, "Complete" green badge). Tap "Past" → 1 card (Gutter repair). Tap "All" → all 4 back.
5. Verify card details: icon tile colors, provider names, amounts, dates, status badge colors.
6. `/app/homeowner/profile`: dark navy ProfileCard with LS avatar, "Lance Silva", VERIFIED + rating badges. Stats row: $310 / 7 / 3. Settings menu: 5 rows with correct subtitles. Sign out button (red text).
7. `/app/homeowner/chat`: "Community chat" heading. Centered empty state with icon, heading, body. Info card with "1 active group bid" in blue tint.
8. On each tab page: correct tab highlighted blue in bottom nav.
9. Resize to 1280×800: top nav visible, content centered, correct tab active.
10. Navigate to `/app/homeowner/dashboard` — still renders correctly. Navigate to `/` and `/get-started` — both unaffected.

## Out of Scope

- Real chat functionality
- Real bid detail pages (tapping a bid card)
- Real settings screens
- Real sign-out / auth
- Provider or admin tab pages (separate tasks)
- Animations or skeleton loaders (Phase 5)

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-2-core-flows/202-homeowner-dashboard.md (this file),
then docs/01-design-ux/design-direction.md.

Visual reference (binding): docs/design-reference/image copy 2.png
(left phone = Bids tab, right phone = Profile tab)

Also read before starting:
- src/app/app/layout.tsx                           (do NOT modify)
- src/components/layout/AppBottomNav.tsx           (do NOT modify — but reference its chat icon SVG for the empty state)
- src/components/homeowner/UserSummaryCard.tsx     (do NOT modify — reference dark card pattern)
- src/components/homeowner/ServiceRequestCard.tsx  (do NOT modify — reference card pattern)
- src/components/ui/Button.tsx                     (do NOT modify)
- tailwind.config.ts                               (do NOT modify)

CREATE these files:

1. src/data/mock/mockBidHistory.ts
   Export: BidStatus type, BidHistoryItem interface, mockBidHistory array.
   See the "Mock Data" section in the task spec for the exact types and 4 entries.

2. src/components/homeowner/BidHistoryCard.tsx
   Props: { item: BidHistoryItem }
   See "BidHistoryCard Component" section for layout spec.
   Note: "won" status badge may use Tailwind default emerald-100 / emerald-700 locally.
   Do NOT add emerald to tailwind.config.ts.

3. src/components/homeowner/ProfileCard.tsx
   Props: { initials, name, address, joinDate, rating, servicesBooked }
   Dark navy card matching the Profile screen in image copy 2.png.
   Note: verified badge may use emerald-500/20 and emerald-300 locally.

4. src/components/homeowner/SettingsMenu.tsx
   No props. Static list of 5 settings rows, each a full-width button with label + subtitle + chevron.
   See "Settings Menu" section for the exact 5 rows.

5. src/app/app/homeowner/bids/page.tsx   ("use client" — needs useState for filter)
   Replaces the existing placeholder.
   - "Your bids" heading + "4 services · $310 total saved" sub-heading
   - 4 filter pills: All | Active | Won | Past — controlled via useState<"all" | BidStatus>
   - Filtered list of <BidHistoryCard> items from mockBidHistory
   - Container: max-w-lg mx-auto px-5 py-6 pb-24

6. src/app/app/homeowner/profile/page.tsx   (server component — no hooks)
   Replaces the existing placeholder.
   - "Profile" heading
   - <ProfileCard initials="LS" name="Lance Silva" address="123 Maple St · Oakwood Heights" joinDate="5 Nov 2024" rating={4.0} servicesBooked={3} />
   - Inline stats row (grid grid-cols-3, white card): $310 Saved | 7 Neighbors | 3 Active bids
   - <SettingsMenu />
   - Sign out button: w-full text-center text-sm font-medium text-red-500 py-4 — no-op onClick

7. src/app/app/homeowner/chat/page.tsx   (server component — no hooks)
   Replaces the existing placeholder.
   - "Community chat" heading
   - Centered empty state: icon circle (bg-primary/10, chat bubble SVG inline, text-primary) + heading + body text
   - Info card (bg-primary/5 border border-primary/20 rounded-card p-4): "1 active group bid" / "Plumbing leak inspection · Oakwood Heights"

Constraints:
- Do NOT add any npm packages.
- Do NOT add new Tailwind tokens or edit tailwind.config.ts.
- Do NOT modify AppBottomNav, layout.tsx, any existing homeowner components, existing mock files, types, services, globals.css, or cn.ts.
- "use client" only where useState is used (bids page only).
- Emerald classes may be used inline in BidHistoryCard and ProfileCard only — do not add to config.

Run `npm run build` at the end. Fix any TypeScript or build errors before reporting.
Report: list every file created or modified, full build output, and any deviations from spec.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/data/mock/mockBidHistory.ts`, `src/components/homeowner/BidHistoryCard.tsx`, `ProfileCard.tsx`, `SettingsMenu.tsx`
- **Files modified:** `src/app/app/homeowner/bids/page.tsx`, `chat/page.tsx`, `profile/page.tsx`, `src/app/layout.tsx`
- **Build:** Passed with zero errors. 11 static pages.
- **Playwright review:** All three tabs passed at 375×812. Bids: 4 cards all correct, filter pills work (Won shows 1 card, Active shows 2, Past shows 1, All shows 4). Profile: dark navy card, LS avatar, VERIFIED badge, stats row, 5 settings rows, red Sign out. Chat: chat icon, heading, body, info card with Chat tab active.
- **Approved deviation:** `src/app/layout.tsx` had Inter font import removed by Codex due to sandbox Google Fonts block. Visual impact minimal; Inter can be restored in Phase 5 polish.
- **Review file:** `docs/reviews/202-homeowner-tabs.md`
- **Next task:** Task 203 — Service Request + AI Placeholder, or Task 301 — Provider Dashboard.

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Task 201 (Homeowner Home tab) accepted. This task fills the three remaining placeholder tab pages. Visual reference is `docs/design-reference/image copy 2.png`.
- **Scope:** Bids tab (filter + cards), Profile tab (profile card + stats + settings), Chat tab (designed empty state).
- **New mock file:** `mockBidHistory.ts` — created new, not modifying existing mocks.
- **Next step:** Playwright review after Codex — check filter pills on Bids, ProfileCard rendering, Chat empty state, correct tab active on each page.
