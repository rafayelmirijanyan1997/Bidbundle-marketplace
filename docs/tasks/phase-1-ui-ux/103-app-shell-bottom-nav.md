# Task 103 — App Shell Layout + Bottom Tab Navigation

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Create the nested `/app` route layout in Next.js App Router and rebuild `BottomNav` into a role-aware, screenshot-faithful component. Every Phase 2+ screen (`/app/homeowner/*`, `/app/provider/*`, `/app/admin/*`) will inherit this layout automatically, so the bottom tab bar appears on all post-onboarding screens without each screen needing to wire it up individually.

## Why This Task Comes Now

Task 101 (landing page) and Task 102 (onboarding) are complete or in progress. Both correctly have no bottom nav. Task 201 (homeowner dashboard) is next. Before any app screen is built, the layout that all app screens share must exist. The current `BottomNav.tsx` is an unstyled stub. `AppShell.tsx` has no nav at all. If we build Task 201 without this foundation, every app screen will need to add its own nav wiring — the wrong approach.

## User-Facing Behavior

On any route under `/app/*`, the bottom tab bar is always visible on mobile. It is fixed to the bottom of the screen. It reads the saved role from `localStorage` and shows the correct tabs for that role. The active tab matches the current page and is highlighted in blue. Tapping an inactive tab navigates to the tab's root route. The content area above the bar scrolls normally and is not obscured by the bar.

**Homeowner tabs (in order):**
1. Home → `/app/homeowner/dashboard`
2. Chat → `/app/homeowner/chat`
3. Bids → `/app/homeowner/bids`
4. Me → `/app/homeowner/profile`

**Service Provider tabs (in order):**
1. Home → `/app/provider/dashboard`
2. Bids → `/app/provider/bids`
3. Reviews → `/app/provider/reviews`
4. Me → `/app/provider/profile`

**HOA Admin tabs (in order):**
1. Home → `/app/admin/dashboard`
2. Community → `/app/admin/community`
3. Reports → `/app/admin/reports`
4. Me → `/app/admin/profile`

On desktop (≥ 768px): the bottom tab bar is replaced by a sticky top bar that renders the same tabs as horizontal text links + icons. It sits at the top of the `bg-canvas` content area, below the browser chrome. No mobile-style fixed bottom bar on desktop.

## Visual Reference

**Binding references:** `docs/design-reference/image copy 2.png` (Homeowner tab bar) and `docs/design-reference/image copy 4.png` (Provider tab bar).

From those screenshots, the bottom bar is:
- White / near-white background (`bg-surface`)
- A single thin top border in `border-divider`
- Four tabs, equally spaced (`grid grid-cols-4`)
- Each tab: icon centered above a short label
- **Active tab:** icon + label both in `text-primary` (blue)
- **Inactive tab:** icon + label both in `text-muted` (gray)
- Fixed to the bottom of the viewport on mobile, full-width
- Safe-area bottom inset applied (`pb-safe` or `padding-bottom: env(safe-area-inset-bottom)`)
- Tab bar height: approximately `h-16` (64px) before safe-area inset

Icons are simple inline SVGs (no icon library). Each is approximately 24×24. Use stroke-based outlines, not filled paths, to match the reference aesthetic.

Icon shapes:
- **Home:** classic house outline (pentagon roof + rectangle body + door rectangle)
- **Chat / Community:** speech bubble outline (rounded rectangle + small triangle tail at bottom-left)
- **Bids:** a simple stack of three horizontal lines (list icon) OR a gavel silhouette — use the list/document icon since the screenshots show a document-like icon for Bids
- **Reviews:** five-point star outline
- **Reports:** bar chart (three vertical rectangles of increasing height)
- **Me / Profile:** person silhouette (circle head + arc shoulders)

## Pages / Components Involved

- `src/app/app/layout.tsx` — **new** — nested layout; renders `AppBottomNav` + content wrapper
- `src/components/layout/AppBottomNav.tsx` — **new** — role-aware bottom tab bar (replaces the existing stub)
- `src/app/app/homeowner/dashboard/page.tsx` — **new** — placeholder only (`<p>Homeowner dashboard coming soon</p>`)
- `src/app/app/provider/dashboard/page.tsx` — **new** — placeholder only
- `src/app/app/admin/dashboard/page.tsx` — **new** — placeholder only

The existing `src/components/layout/BottomNav.tsx` stub should be left in place (do not delete it) but is no longer used by any layout. The new component is `AppBottomNav.tsx`.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-1-ui-ux/103-app-shell-bottom-nav.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/design-reference/image copy 2.png` — binding visual reference (homeowner tabs)
- `docs/design-reference/image copy 4.png` — binding visual reference (provider tabs)
- `src/app/layout.tsx` — understand the root layout structure
- `src/components/layout/AppShell.tsx` — understand existing canvas wrapper
- `src/utils/onboardingState.ts` — for `getRole()` (will exist after Task 102 lands; see note below)
- `tailwind.config.ts` — confirm available tokens

**Important:** `src/utils/onboardingState.ts` will be created by Task 102. If it does not exist yet when Codex runs this task, Codex must create it with the same exports specified in Task 102:

```ts
export type UserRole = "homeowner" | "provider" | "admin";
export function saveRole(role: UserRole): void;
export function getRole(): UserRole | null;
```

Both functions must guard `typeof window !== "undefined"` before touching `localStorage`. Storage key: `"neighbid.role"`.

## Files Likely to Modify / Create

```
src/app/app/layout.tsx                          (create)
src/components/layout/AppBottomNav.tsx          (create)
src/app/app/homeowner/dashboard/page.tsx        (create — placeholder)
src/app/app/provider/dashboard/page.tsx         (create — placeholder)
src/app/app/admin/dashboard/page.tsx            (create — placeholder)
src/utils/onboardingState.ts                    (create only if Task 102 has not created it yet)
```

Do not modify: `AppShell.tsx`, `BottomNav.tsx`, `Navbar.tsx`, `Button.tsx`, `layout.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, mock data, services, types, or `cn.ts`.

## App Shell Layout Spec (`src/app/app/layout.tsx`)

```tsx
"use client"

// Renders children above the fixed bottom nav on mobile.
// On desktop (md+) the AppBottomNav renders as a sticky top bar instead.
// Content area uses pb-20 on mobile to avoid being hidden behind the fixed bar.
```

Structure:
```
<div className="min-h-screen bg-canvas flex flex-col">
  {/* Desktop top bar — hidden on mobile */}
  <div className="hidden md:block">
    <AppBottomNav orientation="top" />
  </div>

  {/* Scrollable content area */}
  <main className="flex-1 pb-20 md:pb-0">
    {children}
  </main>

  {/* Mobile bottom bar — hidden on desktop */}
  <div className="md:hidden">
    <AppBottomNav orientation="bottom" />
  </div>
</div>
```

The layout must be a client component because `AppBottomNav` reads from `localStorage` via `getRole()`.

## AppBottomNav Spec (`src/components/layout/AppBottomNav.tsx`)

```tsx
"use client"
```

Props:
```ts
interface AppBottomNavProps {
  orientation: "bottom" | "top";
}
```

Behavior:
1. On mount, call `getRole()`. Default to `"homeowner"` if null (covers direct URL access before onboarding).
2. Call `usePathname()` from `next/navigation` to determine the active tab.
3. Render the tabs for the detected role (see tab lists above).
4. A tab is **active** if `pathname.startsWith(tab.href)`.

**Bottom orientation (`orientation="bottom"`):**
```
fixed bottom-0 left-0 right-0 z-50
bg-surface border-t border-divider
h-16 (plus safe-area inset via style prop)
grid grid-cols-{n}   (n = number of tabs for this role)
```

Each tab cell:
```
flex flex-col items-center justify-center gap-0.5 py-2 cursor-pointer
text-primary (active) | text-muted (inactive)
```

Icon: 24×24 inline SVG, `currentColor` stroke.
Label: `text-[10px] font-medium`.

Apply safe-area bottom inset via inline style: `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}`.

**Top orientation (`orientation="top"`):**
```
sticky top-0 z-50
bg-surface border-b border-divider
h-14 px-6
flex items-center gap-6
```

Each tab: `flex items-center gap-1.5 text-sm font-medium` with same active/inactive color logic.

Use `next/link` for all tab links (not `<a>` tags).

## Placeholder Dashboard Pages

Each placeholder page must:
- Begin with `"use client"` only if needed (static placeholder can be a server component)
- Render a minimal centered message so the route resolves without a 404

Example for `src/app/app/homeowner/dashboard/page.tsx`:
```tsx
export default function HomeownerDashboardPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted text-sm">Homeowner dashboard — coming in Task 201</p>
    </div>
  );
}
```

Same pattern for provider and admin dashboards.

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- Bottom bar visible and correct on 375px mobile.
- Bottom bar hidden and top bar visible on 768px+.
- Content area has enough bottom padding (`pb-20`) on mobile so nothing is obscured by the fixed bar.
- Only use existing theme tokens: `surface`, `primary`, `muted`, `divider`, `canvas`. No new tokens.
- Do not edit `tailwind.config.ts`.

## AI / Database Placeholder Requirements

None. `getRole()` reads from `localStorage` only.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/homeowner/dashboard` renders the homeowner placeholder (no 404).
- [ ] `/app/provider/dashboard` renders the provider placeholder (no 404).
- [ ] `/app/admin/dashboard` renders the admin placeholder (no 404).
- [ ] At 375px, the bottom tab bar is fixed to the bottom of the viewport, full-width, white background with top border.
- [ ] Homeowner role: four tabs — Home, Chat, Bids, Me — with correct hrefs.
- [ ] Provider role: four tabs — Home, Bids, Reviews, Me — with correct hrefs.
- [ ] Admin role: four tabs — Home, Community, Reports, Me — with correct hrefs.
- [ ] Active tab (matching current pathname) renders in blue (`text-primary`); others in gray (`text-muted`).
- [ ] At 768px+, bottom bar is hidden and a top bar renders instead with the same tabs.
- [ ] Content area is not obscured by the fixed bottom bar at 375px.
- [ ] Landing page (`/`) is unaffected — no bottom nav.
- [ ] Onboarding (`/get-started`) is unaffected — no bottom nav.
- [ ] No new libraries added to `package.json`.
- [ ] No new theme tokens added to `tailwind.config.ts`.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.
- [ ] Safe-area bottom inset applied via inline style (not a Tailwind class).

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, open Chrome DevTools → set device to iPhone 14 (390×844).
3. Navigate to `http://localhost:3000/app/homeowner/dashboard`.
4. Confirm: bottom tab bar visible, white bg, 4 tabs (Home · Chat · Bids · Me), Home tab active (blue), others gray.
5. Tap "Bids" tab → routes to `/app/homeowner/bids` (404 expected beyond placeholder). Confirm Bids tab is now blue.
6. Navigate to `http://localhost:3000/app/provider/dashboard`.
7. Confirm: 4 tabs (Home · Bids · Reviews · Me). Home is blue.
8. Navigate to `http://localhost:3000/app/admin/dashboard`.
9. Confirm: 4 tabs (Home · Community · Reports · Me). Home is blue.
10. Switch DevTools to 1280×800 desktop. Confirm: no bottom bar, top bar visible with same tabs as links.
11. Navigate to `http://localhost:3000` (landing page). Confirm: no bottom bar, landing page unaffected.
12. Navigate to `http://localhost:3000/get-started`. Confirm: no bottom bar, onboarding unaffected.
13. Scroll content on `/app/homeowner/dashboard` at 375px. Confirm: content scrolls, bar stays fixed at bottom, content not hidden behind bar.

## Out of Scope

- Real authentication or session management
- Building actual dashboard content (that is Task 201+)
- A sidebar navigation for desktop (top bar is sufficient for Phase 1)
- Animated tab transitions
- Badge/notification counts on tabs
- Any changes to the landing page, onboarding flow, Navbar, Button, AppShell, or root layout
- Any new dependencies

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-1-ui-ux/103-app-shell-bottom-nav.md (this file),
then docs/01-design-ux/design-direction.md, and the two visual references:
docs/design-reference/image copy 2.png (homeowner tab bar) and
docs/design-reference/image copy 4.png (provider tab bar).

Also read: src/app/layout.tsx, src/components/layout/AppShell.tsx,
tailwind.config.ts, and src/utils/onboardingState.ts (if it exists).

Your job is to build the /app nested route shell with a role-aware bottom tab bar.

CREATE these files:

1. src/app/app/layout.tsx
   - "use client"
   - Wraps children in a full-height flex column (min-h-screen bg-canvas)
   - On mobile (< md): renders <AppBottomNav orientation="bottom" /> below a <main> with pb-20
   - On desktop (md+): renders <AppBottomNav orientation="top" /> above a <main> with no bottom padding
   - Uses Tailwind responsive classes to show/hide each orientation (hidden md:block / md:hidden)

2. src/components/layout/AppBottomNav.tsx
   - "use client"
   - Props: { orientation: "bottom" | "top" }
   - On mount reads getRole() from src/utils/onboardingState.ts. Defaults to "homeowner" if null.
   - Uses usePathname() from next/navigation to detect active tab.
   - Tab definitions per role:
     Homeowner: Home(/app/homeowner/dashboard), Chat(/app/homeowner/chat), Bids(/app/homeowner/bids), Me(/app/homeowner/profile)
     Provider:  Home(/app/provider/dashboard),  Bids(/app/provider/bids),  Reviews(/app/provider/reviews), Me(/app/provider/profile)
     Admin:     Home(/app/admin/dashboard), Community(/app/admin/community), Reports(/app/admin/reports), Me(/app/admin/profile)
   - Active tab: pathname.startsWith(tab.href)
   - Active color: text-primary. Inactive: text-muted.
   - Bottom orientation: fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-divider h-16 grid grid-cols-{n}
     Each cell: flex flex-col items-center justify-center gap-0.5 py-2
     Apply safe-area inset: style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
   - Top orientation: sticky top-0 z-50 bg-surface border-b border-divider h-14 px-6 flex items-center gap-6
     Each item: flex items-center gap-1.5 text-sm font-medium
   - Use next/link for all tab links (not <a> tags).
   - Icons: 24x24 inline SVGs using currentColor stroke (no icon library). Draw:
     Home = house (pentagon roof + rectangle body + small door)
     Chat = speech bubble (rounded-rectangle + bottom-left triangle tail)
     Bids = document list (rectangle outline + three short horizontal lines inside)
     Me = person (circle head + arc for shoulders)
     Reviews = five-point star outline
     Community = speech bubble (same as Chat)
     Reports = bar chart (three vertical rects of increasing height)
   - Tab label: text-[10px] font-medium below the icon.

3. src/app/app/homeowner/dashboard/page.tsx — placeholder:
   export default function HomeownerDashboardPage() {
     return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Homeowner dashboard — coming in Task 201</p></div>;
   }

4. src/app/app/provider/dashboard/page.tsx — same pattern, "Provider dashboard — coming in Task 301"

5. src/app/app/admin/dashboard/page.tsx — same pattern, "Admin dashboard — coming in Task 401"

6. src/utils/onboardingState.ts — ONLY create this if it does not already exist. If it exists, do not touch it.
   If creating: export type UserRole = "homeowner" | "provider" | "admin";
   export function saveRole(role: UserRole): void { if (typeof window === "undefined") return; localStorage.setItem("neighbid.role", role); }
   export function getRole(): UserRole | null { if (typeof window === "undefined") return null; return (localStorage.getItem("neighbid.role") as UserRole) ?? null; }

Do NOT modify: AppShell.tsx, BottomNav.tsx (the old stub — leave it alone), Navbar.tsx,
Button.tsx, layout.tsx (root), globals.css, tailwind.config.ts, tsconfig.json, mock data,
services, types, or cn.ts.

Do NOT add any new npm packages.
Do NOT add new Tailwind theme tokens.

After creating all files, run `npm run build`. Fix any TypeScript or build errors before finishing.
Verify that navigating to / and /get-started still works (no bottom nav on those routes).
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/app/app/layout.tsx`, `src/components/layout/AppBottomNav.tsx`, `src/app/app/homeowner/dashboard/page.tsx`, `src/app/app/provider/dashboard/page.tsx`, `src/app/app/admin/dashboard/page.tsx`, `src/utils/onboardingState.ts`
- **Build:** `npm run build` passed with zero errors. 7 static pages generated.
- **Playwright review:** Passed at 375×812 (mobile) and 1280×800 (desktop). All three roles render correct tabs. Bottom nav fixed on mobile; top bar on desktop. Landing page unaffected.
- **One notable deviation:** `bg-card` used instead of `bg-surface` for tab bar background — the `surface` token maps to dark navy, which would clash. `card` is white and matches the reference screenshots. Accepted.
- **Review file:** `docs/reviews/103-app-shell-bottom-nav.md`
- **Next task:** Task 102 (onboarding flow) or Task 201 (homeowner dashboard) — Task 103 foundation is ready.

### 2026-04-24 — Task created and approved

- **Status:** Approved
- **Context:** User confirmed that the mobile experience must feel like an app with bottom tabs matching `docs/design-reference/image copy 2.png` and `image copy 4.png`. The existing `BottomNav.tsx` is an unstyled stub and no `/app` nested layout exists. This task creates the foundation before Task 201 (homeowner dashboard) can be built.
- **Design decisions:**
  - Next.js nested layout at `src/app/app/layout.tsx` so all app routes inherit the bar automatically.
  - New `AppBottomNav.tsx` rather than modifying the old stub, to keep the old file intact.
  - Role-aware tabs: homeowner (Home/Chat/Bids/Me), provider (Home/Bids/Reviews/Me), admin (Home/Community/Reports/Me).
  - Desktop: same tabs rendered as a sticky top bar (not a sidebar) for Phase 1 simplicity.
  - Safe-area inset applied inline to support modern phones without adding new Tailwind config.
- **Next step:** Delegate to Codex, then Playwright review at 375px and 1280px.
