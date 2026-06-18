# Task 201 — Homeowner Dashboard (Home Tab)

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Replace the Task 103 placeholder at `/app/homeowner/dashboard` with the real homeowner Home tab: a dark navy user summary card, a live service request feed from mock data, an AI prompt placeholder card, and a "New request" CTA. Also add thin placeholder pages for the Chat, Bids, and Me tabs so the bottom nav links resolve without 404.

## Why This Task Comes Now

Phase 1 is complete (landing page, onboarding, app shell). The app shell layout with bottom tabs is live. Task 201 is the first screen a homeowner lands on after completing onboarding. It must show real UI from mock data so the product feels tangible.

## User-Facing Behavior

A homeowner who arrives at `/app/homeowner/dashboard` sees:

1. **User summary card** — dark navy rounded card at the top of the page with: a circle avatar showing initials (`LS`), the user name (`Lance Silva`), the neighborhood (`123 Maple St · Oakwood Heights`), and three inline stats: `2 Active` · `$310 Saved` · `14 Neighbors`.

2. **AI prompt card** — a white card below the summary with a placeholder text area ("Describe a home service you need…") and a disabled blue "Let AI route it →" button. Tapping is a no-op. A small muted caption: "AI matching coming soon".

3. **Neighborhood bids feed** — a section header "Neighborhood bids" with an orange `LIVE` pill badge on the right. Below it, three service request cards from mock data.

4. **Service request cards** — one per `mockServiceRequests` entry. Each card contains:
   - Left: 40×40 category icon tile (rounded-xl, white letter on colored bg): Plumbing = `bg-primary`, Landscaping = `bg-accent`, Exterior = `bg-foreground`
   - Center-top: service title (bold, `text-sm`)
   - Center-bottom: neighborhood name (`text-xs text-muted`)
   - Right-top: budget range (`$budgetMin–$budgetMax`, `text-sm font-semibold`)
   - Right-bottom: status chip — `live` = orange pill "Live bidding", `grouping` = blue pill "Grouping", `draft` = gray pill "Draft"

5. **Community savings banner** — an orange accent card at the bottom of the feed: "You saved $310 with group bids · 14 neighbors joined". Full width, `rounded-card`, `bg-accent/10 border border-accent/40`.

6. **New request button** — full-width blue `<Button variant="primary">` below the savings banner. Label: "+ New request". Clicking is a no-op for now (routes to `/app/homeowner/request` which will 404 — expected until Task 203).

The bottom tab bar is already rendered by the Task 103 app shell layout. The Home tab is active.

## Pages / Components Involved

- `src/app/app/homeowner/dashboard/page.tsx` — **replace placeholder** with real dashboard content
- `src/components/homeowner/UserSummaryCard.tsx` — **new** — dark navy card
- `src/components/homeowner/ServiceRequestCard.tsx` — **new** — single request card
- `src/components/homeowner/RequestFeed.tsx` — **new** — section header + list of cards + savings banner + CTA
- `src/components/homeowner/AiPromptCard.tsx` — **new** — placeholder AI input card
- `src/app/app/homeowner/bids/page.tsx` — **new placeholder** ("Your bids — coming in Task 202")
- `src/app/app/homeowner/chat/page.tsx` — **new placeholder** ("Community chat — coming in Task 202")
- `src/app/app/homeowner/profile/page.tsx` — **new placeholder** ("Profile — coming in Task 202")

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-2-core-flows/201-homeowner-dashboard.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/decision-log/001-initial-ux-direction.md`
- `docs/design-reference/image copy.png` — **binding visual reference: first screen (Dashboard)**
- `docs/design-reference/image copy 2.png` — tab bar and bids/profile tab reference
- `src/app/app/layout.tsx` — confirm the app shell layout (do not modify)
- `src/components/layout/AppBottomNav.tsx` — confirm tab hrefs (do not modify)
- `src/components/ui/Button.tsx` — reuse, do not modify
- `src/data/mock/mockServiceRequests.ts` — source of truth for request data
- `src/data/mock/mockUsers.ts` — source of truth for user data
- `src/types/index.ts` — confirm ServiceRequest and User types
- `tailwind.config.ts` — confirm available tokens before adding any styles

## Files Likely to Modify / Create

```
src/app/app/homeowner/dashboard/page.tsx       (replace placeholder)
src/components/homeowner/UserSummaryCard.tsx   (create)
src/components/homeowner/ServiceRequestCard.tsx (create)
src/components/homeowner/RequestFeed.tsx       (create)
src/components/homeowner/AiPromptCard.tsx      (create)
src/app/app/homeowner/bids/page.tsx            (create — placeholder)
src/app/app/homeowner/chat/page.tsx            (create — placeholder)
src/app/app/homeowner/profile/page.tsx         (create — placeholder)
```

Do not modify: `AppBottomNav.tsx`, `AppShell.tsx`, `BottomNav.tsx`, `Navbar.tsx`, `Button.tsx`, `layout.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, mock data files, services, types, or `cn.ts`.

## UserSummaryCard Spec

```tsx
// src/components/homeowner/UserSummaryCard.tsx
// Props: { name: string; neighborhood: string; address: string; activeCount: number; savedAmount: number; neighborCount: number }
```

Visual structure (dark navy = `bg-foreground text-white rounded-card p-5 shadow-card`):

```
┌─────────────────────────────────────────┐
│  [LS]  Lance Silva              (avatar) │
│        123 Maple St · Oakwood Heights   │
│  ─────────────────────────────────────  │
│   2          $310         14            │
│  Active      Saved      Neighbors       │
└─────────────────────────────────────────┘
```

- Avatar: 44×44 circle, `bg-primary`, white bold initials (`text-sm font-bold`), top-left of card.
- Name: `text-base font-semibold` white, next to avatar.
- Neighborhood line: `text-xs` white/70 opacity.
- Divider: `border-t border-white/20 my-3`.
- Stats row: `grid grid-cols-3 text-center`. Each stat: large number (`text-lg font-bold` white) + label below (`text-[10px] text-white/60 uppercase tracking-wide`).

## AiPromptCard Spec

```tsx
// src/components/homeowner/AiPromptCard.tsx
// No props needed — static placeholder
```

White card (`bg-card rounded-card shadow-card p-4`):

```
┌──────────────────────────────────────────┐
│  ✦ What do you need done?                │
│  ┌────────────────────────────────────┐  │
│  │ Describe a home service you need…  │  │
│  └────────────────────────────────────┘  │
│  [Let AI route it →]   AI matching soon  │
└──────────────────────────────────────────┘
```

- Title: small `text-xs font-semibold text-primary uppercase tracking-wide` with a `✦` glyph prefix.
- Textarea: `w-full rounded-xl border border-divider bg-surface p-3 text-sm text-muted resize-none h-16` — read-only/disabled.
- CTA row: blue `<Button variant="primary" disabled className="opacity-60 cursor-not-allowed text-sm py-2">Let AI route it →</Button>` on the left + `<span className="text-xs text-muted">AI matching coming soon</span>` on the right.
- Use `flex items-center justify-between gap-2` for the CTA row.

## ServiceRequestCard Spec

```tsx
// src/components/homeowner/ServiceRequestCard.tsx
// Props: { request: ServiceRequest }
```

White card (`bg-card rounded-card shadow-card p-4 flex items-center gap-3`):

- **Icon tile** (left, flex-none): 40×40 `rounded-xl flex items-center justify-center text-white font-bold text-sm`:
  - `Plumbing` → `bg-primary` + "P"
  - `Landscaping` → `bg-accent` + "L"
  - `Exterior` → `bg-foreground` + "E"
  - Any other → `bg-muted` + first letter of category
- **Center** (`flex-1 min-w-0`):
  - Title: `text-sm font-semibold text-foreground truncate`
  - Neighborhood: `text-xs text-muted mt-0.5`
- **Right** (`flex flex-col items-end gap-1 flex-none`):
  - Budget: `text-sm font-semibold text-foreground` — formatted as `$budgetMin–$budgetMax`
  - Status chip (`text-[10px] font-semibold px-2 py-0.5 rounded-full`):
    - `live` → `bg-accent/15 text-accent` + "Live bidding"
    - `grouping` → `bg-primary/10 text-primary` + "Grouping"
    - `draft` → `bg-muted/20 text-muted` + "Draft"

## RequestFeed Spec

```tsx
// src/components/homeowner/RequestFeed.tsx
// Props: { requests: ServiceRequest[] }
```

Structure:
1. Section header row: `flex items-center justify-between mb-3`
   - Left: `<h2 className="text-sm font-semibold text-foreground">Neighborhood bids</h2>`
   - Right: `<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent uppercase tracking-wide">LIVE</span>`
2. Cards list: `space-y-3` — one `<ServiceRequestCard>` per request.
3. Community savings banner: full-width card below the list:
   - `bg-accent/10 border border-accent/40 rounded-card p-3 mt-3`
   - Text: `"You saved $310 with group bids · 14 neighbors joined"` — `text-sm font-medium text-accent`
4. New request button: `<Button variant="primary" className="w-full mt-4">+ New request</Button>` — `onClick` calls `router.push("/app/homeowner/request")` (will 404 until Task 203; expected).

## Dashboard Page Spec

```tsx
// src/app/app/homeowner/dashboard/page.tsx
"use client"
```

Layout: `<div className="px-5 py-6 space-y-4 max-w-lg mx-auto">`

Order of children:
1. `<UserSummaryCard name="Lance Silva" address="123 Maple St" neighborhood="Oakwood Heights" activeCount={2} savedAmount={310} neighborCount={14} />`
2. `<AiPromptCard />`
3. `<RequestFeed requests={mockServiceRequests} />`

Use `useRouter` from `next/navigation` in `RequestFeed` for the "New request" button. The page itself can just compose the three components with no extra logic.

## Placeholder Tab Pages

All three follow this pattern (no "use client" needed — static server components):

```tsx
// src/app/app/homeowner/bids/page.tsx
export default function HomeownerBidsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted text-sm">Your bids — coming in Task 202</p>
    </div>
  );
}
```

Same for `chat/page.tsx` ("Community chat — coming in Task 202") and `profile/page.tsx` ("Profile — coming in Task 202").

## Desktop Adaptation

- Outer container: `max-w-lg mx-auto px-5 py-6` — narrow single column centered on canvas background.
- No desktop-specific layout changes needed. The top bar from Task 103 already handles desktop nav.
- Cards fill the container width naturally.

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- `max-w-lg mx-auto` contains all content.
- `pb-24` on the page container ensures content is not obscured by the fixed bottom nav on mobile.
- Touch targets (cards, buttons) at least 44px tall.
- Use only existing theme tokens: `canvas`, `surface`, `card`, `primary`, `accent`, `foreground`, `muted`, `divider`, `rounded-card`, `shadow-card`. No new tokens. Do not edit `tailwind.config.ts`.

## AI / Database Placeholder Requirements

- AI prompt card is entirely static — no service calls, no state.
- All data comes from `mockServiceRequests` and hardcoded user values. No `fetch`, no `useEffect` for data loading.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/homeowner/dashboard` renders the full dashboard (no placeholder text).
- [ ] UserSummaryCard: dark navy card, initials avatar, name, neighborhood, 3 stats visible.
- [ ] AiPromptCard: white card with disabled textarea and disabled CTA.
- [ ] RequestFeed: "Neighborhood bids" header with LIVE badge, 3 service request cards matching mock data, savings banner, "+ New request" button.
- [ ] Each ServiceRequestCard shows correct icon tile color, title, neighborhood, budget range, and status chip per mock data.
- [ ] `/app/homeowner/bids` renders "Your bids" placeholder (no 404).
- [ ] `/app/homeowner/chat` renders "Community chat" placeholder (no 404).
- [ ] `/app/homeowner/profile` renders "Profile" placeholder (no 404).
- [ ] Bottom tab bar visible on mobile; Home tab is active (blue) on the dashboard route.
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] No new libraries added to `package.json`.
- [ ] No new theme tokens added to `tailwind.config.ts`.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.
- [ ] Landing page (`/`) and onboarding (`/get-started`) still render correctly.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, DevTools → iPhone 14 (390×844).
3. Navigate to `/app/homeowner/dashboard`.
4. Confirm UserSummaryCard: dark navy bg, "LS" avatar, "Lance Silva", "Oakwood Heights", stats 2 / $310 / 14.
5. Confirm AiPromptCard below it: white card, disabled textarea, disabled blue CTA.
6. Confirm RequestFeed: "Neighborhood bids" header + LIVE badge, 3 cards.
7. Card 1: blue "P" tile, "Plumbing leak inspection", "Oakwood Heights", "$450–$620", orange "Live bidding" chip.
8. Card 2: orange "L" tile, "Lawn care bundle", "Lakeview Park", "$180–$320", blue "Grouping" chip.
9. Card 3: dark "E" tile, "Gutter cleanup", "Oakwood Heights", "$120–$220", gray "Draft" chip.
10. Confirm savings banner: orange-tinted card with "$310" savings text.
11. Click "+ New request" → navigates to `/app/homeowner/request` (404 expected).
12. Navigate back. Tap "Bids" tab → `/app/homeowner/bids` placeholder renders.
13. Tap "Chat" tab → `/app/homeowner/chat` placeholder renders.
14. Tap "Me" tab → `/app/homeowner/profile` placeholder renders.
15. Resize to 1280×800: content is centered, top nav bar visible, no bottom bar, no horizontal scroll.
16. Navigate to `/` — landing page unaffected. Navigate to `/get-started` — onboarding unaffected.

## Out of Scope

- Real service request creation flow (Task 203)
- Bids tab with real content (Task 202)
- Profile tab with real content (Task 202)
- Chat tab with real content (later phase)
- AI routing (Phase 6)
- Real auth / user data (Phase 6)
- Animations, skeleton loaders, empty states (Phase 5 polish)
- Any new npm dependencies
- Any new theme tokens or global CSS changes

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-2-core-flows/201-homeowner-dashboard.md (this file),
then docs/01-design-ux/design-direction.md.

Visual references (binding):
- docs/design-reference/image copy.png — first screen is the homeowner dashboard
- docs/design-reference/image copy 2.png — tab destinations reference

Also read before starting:
- src/app/app/layout.tsx                         (do NOT modify)
- src/components/layout/AppBottomNav.tsx         (do NOT modify)
- src/components/ui/Button.tsx                   (do NOT modify)
- src/data/mock/mockServiceRequests.ts           (do NOT modify)
- src/data/mock/mockUsers.ts                     (do NOT modify)
- src/types/index.ts                             (do NOT modify)
- tailwind.config.ts                             (do NOT modify)

Your job: replace the placeholder dashboard and add the homeowner tab pages.

CREATE or REPLACE these files only:

1. src/app/app/homeowner/dashboard/page.tsx
   "use client"
   - Imports: UserSummaryCard, AiPromptCard, RequestFeed, mockServiceRequests
   - Outer div: className="px-5 py-6 pb-24 space-y-4 max-w-lg mx-auto"
   - Renders in order: <UserSummaryCard />, <AiPromptCard />, <RequestFeed requests={mockServiceRequests} />
   - Hardcoded user values: name="Lance Silva" address="123 Maple St" neighborhood="Oakwood Heights" activeCount={2} savedAmount={310} neighborCount={14}

2. src/components/homeowner/UserSummaryCard.tsx
   Props: { name: string; address: string; neighborhood: string; activeCount: number; savedAmount: number; neighborCount: number }
   - Outer: bg-foreground text-white rounded-card p-5 shadow-card
   - Top row: 44×44 circle avatar (bg-primary, white bold initials — first letter of each name word) + name (text-base font-semibold) + address·neighborhood below (text-xs opacity-70)
   - Divider: border-t border-white/20 my-3
   - Stats row: grid grid-cols-3 text-center — each: large number (text-lg font-bold) + label (text-[10px] text-white/60 uppercase tracking-wide)
   - Labels: "Active", "Saved" (prefix value with $), "Neighbors"

3. src/components/homeowner/AiPromptCard.tsx
   - No props
   - bg-card rounded-card shadow-card p-4
   - Header: text-xs font-semibold text-primary uppercase tracking-wide — "✦ What do you need done?"
   - Textarea: w-full rounded-xl border border-divider bg-surface p-3 text-sm text-muted resize-none h-16 mt-2 — placeholder "Describe a home service you need…" readOnly
   - CTA row (mt-3 flex items-center justify-between gap-2):
     Left: <Button variant="primary" disabled className="opacity-60 cursor-not-allowed text-sm py-2 px-4">Let AI route it →</Button>
     Right: <span className="text-xs text-muted">AI matching coming soon</span>

4. src/components/homeowner/ServiceRequestCard.tsx
   Props: { request: ServiceRequest } — import ServiceRequest from "@/types"
   - bg-card rounded-card shadow-card p-4 flex items-center gap-3
   - Icon tile (flex-none w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm):
     Plumbing → bg-primary | Landscaping → bg-accent | Exterior → bg-foreground | default → bg-muted
     Letter = first letter of request.category
   - Center (flex-1 min-w-0):
     title: text-sm font-semibold text-foreground truncate
     neighborhood: text-xs text-muted mt-0.5
   - Right (flex flex-col items-end gap-1 flex-none):
     budget: text-sm font-semibold text-foreground — "${{budgetMin}}–${{budgetMax}}"
     status chip (text-[10px] font-semibold px-2 py-0.5 rounded-full):
       live → bg-accent/15 text-accent — "Live bidding"
       grouping → bg-primary/10 text-primary — "Grouping"
       draft → bg-muted/20 text-muted — "Draft"

5. src/components/homeowner/RequestFeed.tsx
   "use client" (needs useRouter for New request button)
   Props: { requests: ServiceRequest[] }
   - Section header row (flex items-center justify-between mb-3):
     "Neighborhood bids" h2 (text-sm font-semibold text-foreground)
     LIVE badge (text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent uppercase tracking-wide)
   - Cards: space-y-3, one <ServiceRequestCard> per request
   - Savings banner (bg-accent/10 border border-accent/40 rounded-card p-3 mt-3):
     text-sm font-medium text-accent — "You saved $310 with group bids · 14 neighbors joined"
   - New request button (mt-4):
     <Button variant="primary" className="w-full" onClick={() => router.push("/app/homeowner/request")}>
       + New request
     </Button>

6. src/app/app/homeowner/bids/page.tsx — placeholder, server component:
   <div className="flex items-center justify-center min-h-[60vh]">
     <p className="text-muted text-sm">Your bids — coming in Task 202</p>
   </div>

7. src/app/app/homeowner/chat/page.tsx — same pattern, "Community chat — coming in Task 202"

8. src/app/app/homeowner/profile/page.tsx — same pattern, "Profile — coming in Task 202"

Key constraints:
- Do NOT add any npm packages.
- Do NOT add new Tailwind tokens or edit tailwind.config.ts.
- Do NOT modify AppBottomNav, AppShell, BottomNav, Navbar, Button, layout.tsx, globals.css, any mock data, types, services, or cn.ts.
- All data is hardcoded mock — no fetch, no useEffect for data.
- "use client" only where useRouter or useState is actually used.

Run `npm run build` at the end. Fix any TypeScript or build errors.
Verify that / and /get-started still render correctly and are unaffected.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/app/app/homeowner/dashboard/page.tsx` (replaced placeholder), `src/components/homeowner/UserSummaryCard.tsx`, `AiPromptCard.tsx`, `ServiceRequestCard.tsx`, `RequestFeed.tsx`, `src/app/app/homeowner/bids/page.tsx`, `chat/page.tsx`, `profile/page.tsx`
- **Build:** `npm run build` passed zero errors. 11 static pages generated.
- **Playwright review:** Passed at 375×812 and 1280×800. Dark navy summary card with LS avatar, name, neighborhood, 3 stats. AI prompt card with disabled textarea and CTA. Three service request cards from mock data with correct colors, budgets, and status chips. Orange savings banner. Top nav visible on desktop, bottom tabs on mobile with Home active.
- **Review file:** `docs/reviews/201-homeowner-dashboard.md`
- **Next task:** Task 202 — Homeowner Bids, Chat, and Profile tabs.

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Phase 1 complete (Tasks 101, 102, 103). This replaces the skeletal 201 "onboarding" placeholder with the real homeowner dashboard. Original 201 file was superseded by Task 102 (onboarding flow already built). Dashboard is the first real Phase 2 screen.
- **Design reference:** `docs/design-reference/image copy.png` (first screen) and `image copy 2.png` (tab destinations).
- **Scope decision:** Home tab dashboard only. Bids/Chat/Profile tabs remain as placeholders until Task 202.
- **Next step:** Playwright review after Codex completes — check all 3 service request cards, user summary card, AI prompt card, and tab navigation at 375px and 1280px.
