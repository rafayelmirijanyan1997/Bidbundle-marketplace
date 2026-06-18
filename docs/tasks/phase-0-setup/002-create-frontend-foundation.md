# Task 002 — Create Frontend Foundation

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Rebuild the NeighBid responsive website foundation using the screenshot-based mobile design direction. Establish the folder structure, design system tokens, mock data, and placeholder services so all future Codex tasks have a consistent base to build on.

## Why This Task Comes Now

The previous frontend foundation was intentionally reset because the product now needs to follow the provided screenshot references instead of the earlier dark-theme direction. Every subsequent page task depends on this corrected foundation.

## User-Facing Behavior

A user can open the app in a browser and see a minimal NeighBid shell:
- Screenshot-aligned light app background
- Navy summary/header surface with NeighBid branding
- A placeholder message or skeleton indicating the app is loading
- No errors or broken layouts on desktop or mobile

## Pages / Components Involved

- App shell layout (root layout file)
- Placeholder home page
- No full pages yet — foundation only

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-0-setup/002-create-frontend-foundation.md`
- `docs/01-design-ux/claude-proposed-sitemap.md`
- `docs/decision-log/001-initial-ux-direction.md`

## Files Likely to Create

```
package.json
next.config.ts (or next.config.js)
tailwind.config.ts
tsconfig.json
postcss.config.js

src/
  app/
    layout.tsx          ← root layout, screenshot-based theme, font
    page.tsx            ← placeholder home (redirects to landing or shows shell)
    globals.css         ← Tailwind base + CSS custom properties for theme tokens

  components/
    ui/                 ← empty folder, future shared primitives
    layout/
      AppShell.tsx      ← placeholder mobile-first shell
      Navbar.tsx        ← public top navbar placeholder
      BottomNav.tsx     ← mobile bottom nav placeholder

  data/
    mock/
      mockUsers.ts
      mockServiceRequests.ts
      mockBids.ts
      mockProviders.ts

  services/
    aiRoutingService.placeholder.ts
    databaseService.placeholder.ts
    notificationService.placeholder.ts

  types/
    index.ts            ← shared TypeScript interfaces (User, ServiceRequest, Bid, Provider)

  utils/
    cn.ts               ← className utility (clsx + tailwind-merge)
```

## Responsive Design Requirements

- Warm light app background close to the screenshot reference
- Dark navy surface for summary/header areas
- Bright blue primary accent for action buttons
- Orange highlight accent for urgency, savings, and live bidding states
- Mobile-first Tailwind classes throughout
- Root layout must render correctly at 375px (mobile) and 1280px (desktop)
- No horizontal scroll on any viewport

## AI / Database Placeholder Requirements

Create these files with exported stub functions — no real logic:

```ts
// aiRoutingService.placeholder.ts
export async function parseServiceRequest(text: string) {
  return { category: 'mock', suggestedGroup: null };
}

// databaseService.placeholder.ts
export async function fetchUserData(userId: string) {
  return null;
}

// notificationService.placeholder.ts
export async function sendNotification(userId: string, message: string) {
  return { sent: false };
}
```

## Acceptance Criteria

- [x] `npm install` completes without errors
- [x] `npm run dev` starts the dev server and the app opens in a browser
- [x] `npm run build` completes without errors
- [x] Root layout applies the screenshot-based light mobile theme and base font
- [x] App renders without layout errors at 375px and 1280px width
- [x] Mock data files exist and export typed arrays
- [x] Placeholder service files exist and export stub functions
- [x] TypeScript types file exists with User, ServiceRequest, Bid, Provider interfaces
- [x] `cn` utility exists in `src/utils/cn.ts`
- [x] No real auth, AI, or database logic present

## Test Steps

1. Run `npm install`
2. Run `npm run dev` — open browser, confirm app loads, no console errors
3. Open browser DevTools, set viewport to 375px — confirm no horizontal scroll and screenshot-aligned light theme
4. Set viewport to 1280px — confirm layout holds
5. Run `npm run build` — confirm zero errors

## Out of Scope

- Full landing page (Task 101)
- Role selection page (Task 102)
- Any dashboard or flow pages
- Real authentication
- Real database connection
- Real AI integration
- Animation or advanced transitions
- Full design system component library

## Codex Implementation Prompt

```
Read CLAUDE.md and docs/tasks/phase-0-setup/002-create-frontend-foundation.md before starting.

Also read:
- docs/01-design-ux/claude-proposed-sitemap.md
- docs/decision-log/001-initial-ux-direction.md

Your task is to scaffold the NeighBid frontend website foundation. This is a Next.js (App Router) + Tailwind CSS project. TypeScript is required.

Create the folder structure and files listed in the task spec exactly. Do not add pages, components, or features beyond what is listed.

Key requirements:
1. The theme must follow the screenshot reference: warm light background, dark navy surfaces, blue primary CTAs, orange highlight states. Apply via CSS custom properties or Tailwind config.
2. Root layout.tsx must set the screenshot-based app theme, a clean sans-serif font, and a <body> with the theme applied.
3. src/app/page.tsx should render a minimal placeholder aligned with the screenshot theme — just the NeighBid name and a subtitle like "Loading your neighbourhood..." styled with the new visual direction.
4. Mock data files must export typed arrays using the interfaces in src/types/index.ts. Populate each with 2–3 realistic mock entries.
5. Placeholder service files must export stub async functions as shown in the task spec. Add a console.warn("[placeholder]") inside each stub so developers know it is not real.
6. The cn utility in src/utils/cn.ts must use clsx and tailwind-merge.
7. Run npm run build at the end. Fix any TypeScript or build errors before finishing.
8. Do not install unnecessary packages. Stick to: next, react, react-dom, typescript, tailwindcss, postcss, autoprefixer, clsx, tailwind-merge.

Do not add real authentication, database calls, or AI logic.
```

---

## Task Update Log

### 2026-04-24 — Reset after design change

- **Status:** Pending
- **What changed:** The previously scaffolded frontend foundation was intentionally removed.
- **Why:** The design direction changed. Future implementation must follow the provided screenshot-based mobile theme and structure instead of the earlier dark-theme foundation.
- **Key references:** `docs/01-design-ux/design-direction.md`, `docs/01-design-ux/claude-proposed-sitemap.md`, `docs/decision-log/001-initial-ux-direction.md`
- **Review file:** `docs/reviews/002-create-frontend-foundation.md` remains historical only and should not be treated as the current implementation state.
- **Next task:** Re-approve and rebuild Task 002 using the new screenshot-aligned design direction.

### 2026-04-24 — Approved for rebuild

- **Status:** Approved
- **Context:** User re-approved Task 002 to rebuild the frontend foundation with the screenshot-aligned mobile light theme. Previous scaffold is confirmed absent from the project root (no `package.json`, no `src/`, no Next.js config present).
- **Next step:** Delegate implementation to Codex using the Codex Implementation Prompt in this file.
- **Review plan:** After Codex finishes, run `npm install` + `npm run build`, then Playwright pass at 375px and 1280px to verify no horizontal scroll, warm off-white canvas, dark navy surface, and bottom-nav visibility on mobile.

### 2026-04-24 — Codex rebuild + Claude review

- **Status:** Changes Requested
- **What Codex completed:** Scaffolded Next.js 14 App Router + TypeScript + Tailwind foundation. All 21 files from the spec were written. Theme tokens defined as CSS custom properties in `globals.css` and mirrored into `tailwind.config.ts` (`canvas`, `surface`, `primary`, `accent`, `card`, `divider`, `muted`, `foreground`, plus `card` radius and `card` shadow). Inter font wired via `next/font/google`. `AppShell` wraps children with `bg-canvas min-h-screen`. `next.config.mjs` (not `.ts`) used — prior reset lesson applied.
- **Key files changed:** `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`, `src/app/{layout.tsx,page.tsx,globals.css}`, `src/components/layout/{AppShell,Navbar,BottomNav}.tsx`, `src/components/ui/.gitkeep`, `src/data/mock/{mockUsers,mockServiceRequests,mockBids,mockProviders}.ts`, `src/services/{aiRoutingService,databaseService,notificationService}.placeholder.ts`, `src/types/index.ts`, `src/utils/cn.ts`.
- **Local verification:** `npm install` passed (119 packages; a `next@14.2.30` security advisory surfaced — noted as optional). `npm run build` passed with zero errors. Playwright pass at 1280×800 and 375×812 both rendered the screenshot-aligned light canvas with the dark navy "NeighBid" heading and muted subtitle, no horizontal scroll, no hydration warnings. Only console error was a `favicon.ico` 404 — cosmetic.
- **Review file:** `docs/reviews/002-create-frontend-foundation-v2.md`
- **Required follow-up (single fix):** The three placeholder service files export functions under the wrong names. The spec requires `parseServiceRequest(text)`, `fetchUserData(userId)`, `sendNotification(userId, message)`; Codex emitted `aiRoutingService(input)`, `databaseService(entityId)`, `notificationService(userId, message)` instead. Rename the exports and argument labels to match the spec, keep the `console.warn("[placeholder]…")` guards and return shapes. Everything else is accepted as-is.
- **Optional follow-ups (defer to later tasks):** bump `next` past the 14.2.30 advisory before Phase 2; add `favicon.ico` during Task 101.
- **Next step:** Send Codex back with the one required fix, then re-verify and accept.

### 2026-04-24 — Codex fix applied + accepted

- **Status:** Completed
- **What Codex completed:** Renamed the three placeholder service exports to match the spec: `parseServiceRequest(text)` in `aiRoutingService.placeholder.ts`, `fetchUserData(userId)` in `databaseService.placeholder.ts`, `sendNotification(userId, message)` in `notificationService.placeholder.ts`. Each stub keeps its `console.warn("[placeholder]…")` guard and the return shape from the spec.
- **Key files changed:** `src/services/aiRoutingService.placeholder.ts`, `src/services/databaseService.placeholder.ts`, `src/services/notificationService.placeholder.ts`.
- **Local verification:** Grep for the old wrapper names (`aiRoutingService`, `databaseService`, `notificationService` used as identifiers) across `src/` returned zero matches — no stray call sites. `npm run build` passed with zero errors; route output unchanged (137 B for `/`).
- **Review file:** `docs/reviews/002-create-frontend-foundation-v2.md` remains the canonical review for this rebuild; required fix is resolved.
- **Deferred follow-ups (not owned by this task):** bump `next` past the `14.2.30` security advisory before Phase 2; add `src/app/favicon.ico` during Task 101 to clear the only remaining console 404.
- **Next task:** Task 101 — Landing Page.
