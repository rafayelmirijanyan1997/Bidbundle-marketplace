# Task 101 — Splash + Landing Page

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Replace the foundation's placeholder home page with a responsive splash + landing page that matches the reference splash screen in `docs/design-reference/image.png` (screen 1 — "Splash"). The mobile version should closely match the screenshot. The desktop version should use the same design system, expanded: top navbar, centered splash composition, and a short "How it works" scroll section with a final role CTA.

## Why This Task Comes Now

The foundation from Task 002 is verified and accepted, but the app currently renders only a placeholder. Task 101 is the first real page: the public entry point. Decision log 001 approved a single-scroll landing page (no separate `/how-it-works` route). Per the sitemap, the CTA routes to `/get-started`, which will be built in Task 102.

## User-Facing Behavior

A visitor opening `/` should see:

- **On mobile (375px):** a screenshot-faithful splash — dark navy rounded hero card filling most of the viewport, NeighBid logo tile, brand name, tagline, three metric chips, an orange-accented savings highlight card, a primary blue "Get started" button, and a secondary "Already have an account? Sign in" link below.
- **On desktop (1280px+):** a warm off-white canvas with a top navbar (logo left, "Get Started" CTA right — no secondary nav links yet), the splash composition centered in a max-width container with more breathing room, followed by a compact "How it works" scroll section (3 steps) and a simple footer. Same theme language and components as mobile.

Clicking "Get started" navigates to `/get-started` (that route will 404 until Task 102 — expected).

## Pages / Components Involved

- `src/app/page.tsx` — replaces the Task 002 placeholder with the splash + landing composition
- `src/components/layout/Navbar.tsx` — flesh out from placeholder: logo + "Get Started" CTA (desktop), logo-only on mobile
- `src/components/marketing/Splash.tsx` — new — the navy hero card + metric chips + orange savings highlight + CTA
- `src/components/marketing/HowItWorks.tsx` — new — 3-step scroll section for desktop and below-fold on mobile
- `src/components/marketing/Footer.tsx` — new — minimal footer with brand + copyright
- `src/components/ui/Button.tsx` — new — primary + secondary variants using the theme tokens (this is the first `ui/` primitive; keep it minimal)

The existing `BottomNav.tsx` remains a placeholder — it is used by the app shell, not the public landing.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-1-ui-ux/101-landing-page.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/01-design-ux/claude-proposed-sitemap.md`
- `docs/decision-log/001-initial-ux-direction.md`
- `docs/design-reference/image.png` — **binding visual reference for the splash (screen 1)**
- `docs/design-reference/image copy.png`, `image copy 2.png`, etc. — secondary visual context

## Files Likely to Modify / Create

```
src/app/page.tsx                       (modify — replace placeholder)
src/components/layout/Navbar.tsx       (modify — flesh out from placeholder)
src/components/marketing/Splash.tsx    (create)
src/components/marketing/HowItWorks.tsx (create)
src/components/marketing/Footer.tsx    (create)
src/components/ui/Button.tsx           (create — first ui/ primitive)
```

Do not create any other new files. Do not move or rename existing files. Do not touch `AppShell.tsx`, `BottomNav.tsx`, mock data, services, types, `cn.ts`, `globals.css`, or any config files.

## Splash Composition (binding — mobile 375px reference)

Match `image.png` screen 1 as closely as reasonable:

1. **Hero card** — full-width dark navy rounded-rectangle surface, generous vertical padding, takes most of the viewport height on mobile. Use `bg-surface` + `rounded-card` + `shadow-card` from the foundation tokens.
2. **Logo tile** — a blue rounded square (approx `56×56`) centered horizontally, containing a bold white "N". Use `bg-primary` + white text.
3. **Brand name** — "NeighBid" in white, bold, large (~`text-3xl`), centered below logo.
4. **Tagline** — "Community powered savings. Bid together, save together." in muted white (~70% opacity), small (`text-sm`), centered, two lines max.
5. **Metric chips row** — three dark-tinted rounded tiles in a horizontal row, each with:
   - a small colored initial circle (H blue, L orange, P purple — use `bg-primary`, `bg-accent`, and a neutral for the third)
   - a bold white number on top
   - a muted white label underneath
   - Use these three entries (static mock content for now):
     - `H` · `14` · `members`
     - `L` · `$310` · `avg saved`
     - `P` · `47` · `providers`
6. **Savings highlight card** — white rounded card *inside* the navy hero (not outside), with:
   - a small orange pill/badge on the top-left ("Save up to 40%")
   - headline text in dark: "Save up to 40% on home services"
   - body text (two lines, muted dark): "Neighbours grouping the same service. Providers bid competitively for the whole group."
7. **Primary CTA** — full-width blue button ("Get started") inside the hero card, `bg-primary` text-white, `rounded-xl`, `h-12`. Wrap with a Next.js `<Link href="/get-started">`.
8. **Secondary link** — centered below the hero card (outside the navy surface), light muted text: "Already have an account? <Sign in>" where "Sign in" is styled as a link in `--color-primary`. For now, "Sign in" can be a `<Link href="/get-started">` too (no separate sign-in route yet — decision log 001 allows this).

## Desktop Adaptation (1280px+)

- **Top navbar:** full-width, `sticky top-0`, transparent or light canvas background with soft bottom border. Left: NeighBid wordmark (no logo tile needed — keep navbar light). Right: a small "Get Started" primary-variant Button linking to `/get-started`. No center nav links in Phase 1.
- **Splash section:** centered in a `max-w-md` (or similar narrow) container, same composition as mobile. Surround it with generous vertical whitespace (`py-20` or similar). The navy card should feel like a focal centerpiece, not a stretched banner.
- **How it works:** below the splash, in a `max-w-5xl` container, three cards in a row (stack to single column on mobile). Content:
  1. **"Describe what you need"** — "Tell NeighBid the service you want. Our AI suggests a category and checks if neighbours need the same thing." (use `bg-card`, `shadow-card`, `rounded-card`)
  2. **"Get grouped automatically"** — "Neighbours on the same request form a group so providers can quote the whole job at once."
  3. **"Compare and confirm"** — "Providers bid transparently. You pick the one you trust, neighbours save together."
  Each card should have a small colored number badge (1 blue, 2 orange, 3 neutral dark) at the top.
- **Footer:** compact, `border-t border-divider`, `text-sm text-muted`, single line: "© 2026 NeighBid · Community powered savings" centered. No links in Phase 1.

## Responsive Design Requirements

- No horizontal scroll at 375px, 768px, 1024px, or 1280px.
- The splash composition must be usable at 375px — everything fits without touching the viewport edges (use `px-5` on the outer container).
- Buttons are at least `h-12` on mobile (touch-friendly).
- Navbar hides the "Get Started" CTA on mobile (below `sm` breakpoint) — on mobile the hero CTA is the primary action; a second CTA in the navbar would be redundant.
- Use only the theme tokens already defined in `tailwind.config.ts` (`canvas`, `surface`, `primary`, `accent`, `card`, `divider`, `muted`, `foreground`, `rounded-card`, `shadow-card`). Do not introduce new colors or shadows.

## AI / Database Placeholder Requirements

None. This is a public static landing page. No service calls.

## Acceptance Criteria

- [x] `npm run build` passes with zero errors.
- [x] `/` renders the splash on mobile matching the `image.png` screen 1 composition.
- [x] `/` renders the expanded desktop layout with navbar + splash + "How it works" + footer.
- [x] "Get started" button links to `/get-started` (404 is expected — Task 102 will build it).
- [x] "Sign in" link also routes to `/get-started` for now (single entry point per decision log 001).
- [x] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [x] All colors, radii, and shadows come from the existing theme tokens (no hard-coded hex values in components).
- [x] No console errors beyond the existing `favicon.ico` 404.
- [x] TypeScript: zero errors. No `any`, no `@ts-ignore`.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev` — open `http://localhost:3000`.
3. Resize to 375×812 — visually compare against `docs/design-reference/image.png` screen 1. Hero card should fill most of the viewport, all elements present.
4. Resize to 1280×800 — confirm navbar, centered splash, "How it works" three-up, and footer are visible and aligned.
5. Click "Get started" — confirm navigation to `/get-started` (404 expected).
6. Click "Sign in" link — confirm same navigation.
7. Check DevTools console — only the known `favicon.ico` 404, no other errors or warnings.

## Out of Scope

- Real sign-up / sign-in (Task 102 builds `/get-started`)
- Role selection UI (Task 102)
- Separate `/how-it-works` route (deferred to Phase 5 if ever needed)
- Animations, scroll-triggered effects, or video hero
- Real AI copy generation
- SEO metadata beyond the existing `<title>` / `<description>` in root layout
- Favicon (will be addressed as part of Task 101 follow-up or Task 102)
- Dark mode toggle
- Any bottom nav on the landing page (bottom nav is for the app shell only)
- Any additional `ui/` primitives beyond `Button.tsx`

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-1-ui-ux/101-landing-page.md (this file),
then docs/01-design-ux/design-direction.md, docs/decision-log/001-initial-ux-direction.md,
and the screenshot docs/design-reference/image.png — screen 1 ("Splash") is the binding
visual reference.

Build the responsive splash + landing page. Touch only these files:

MODIFY:
- src/app/page.tsx                     (replace placeholder with splash + landing composition)
- src/components/layout/Navbar.tsx     (flesh out from placeholder per the task spec)

CREATE:
- src/components/marketing/Splash.tsx
- src/components/marketing/HowItWorks.tsx
- src/components/marketing/Footer.tsx
- src/components/ui/Button.tsx         (primary + secondary variants, minimal, uses theme tokens)

Key constraints:
1. Mobile (375px) must match docs/design-reference/image.png screen 1 closely: dark navy
   rounded hero card, NeighBid blue logo tile with white "N", brand name, tagline, three
   metric chips (H·14·members, L·$310·avg saved, P·47·providers), orange-accented "Save
   up to 40%" white card INSIDE the hero, full-width blue "Get started" button, and a
   centered "Already have an account? Sign in" link BELOW the hero card (outside the navy
   surface).
2. Desktop (1280px+) adds a sticky top navbar (wordmark left, small "Get Started" CTA
   right, hidden on mobile), centers the splash in a narrow container with vertical
   whitespace, then renders a three-card "How it works" section, then a minimal footer.
3. Both CTAs ("Get started" button and "Sign in" link) use Next.js <Link> to /get-started.
   That route will 404 for now — Task 102 will build it.
4. Use only the theme tokens already in tailwind.config.ts (canvas, surface, primary,
   accent, card, divider, muted, foreground, rounded-card, shadow-card). Do not add new
   colors or shadows. Do not introduce any new libraries.
5. No horizontal scroll at 375 / 768 / 1024 / 1280 px.
6. Button component: two variants only — primary (bg-primary, white text, h-12,
   rounded-xl, full-width option via className pass-through) and secondary (transparent
   with primary-colored text). Accept an `asChild`-like pattern only if trivial, otherwise
   simply accept `className` and render a <button> or support being wrapped by a Link.
   Keep it small — this is not the full design system.
7. Do not edit AppShell.tsx, BottomNav.tsx, globals.css, tailwind.config.ts, tsconfig.json,
   mock data, services, types, or cn.ts.
8. Run npm run build at the end. Fix any TypeScript or build errors.

Do not add real auth, AI, database, animations, or additional pages.
```

## Task Update Log

### 2026-04-24 — Task spec rewritten against screenshot reference

- **Status:** Pending
- **Context:** The prior version of this task file (generic hero / problem / how-it-works / trust-section SaaS layout) predated the design reset in Task 002. It has been fully replaced with a screenshot-faithful splash + landing spec modeled on `docs/design-reference/image.png` screen 1, per the approved task sequence in decision log 001 and the sitemap in `claude-proposed-sitemap.md`.
- **Next step:** User approval, then delegate to Codex.

### 2026-04-24 — Approved, delegating to Codex

- **Status:** In Progress
- **Context:** User approved the rewritten spec. Handing implementation to Codex via the codex-rescue subagent.
- **Review plan:** After Codex finishes, run `npm run build`, then Playwright pass at 375×812 and 1280×800 to compare the mobile splash against `docs/design-reference/image.png` screen 1 and verify the desktop navbar + "How it works" + footer composition, and that both CTAs link to `/get-started`.

### 2026-04-24 — Codex implementation + Claude review + accepted

- **Status:** Completed
- **What Codex completed:** Delivered the splash + landing page. Two files modified (`src/app/page.tsx`, `src/components/layout/Navbar.tsx`), four files created (`src/components/marketing/Splash.tsx`, `HowItWorks.tsx`, `Footer.tsx`, `src/components/ui/Button.tsx`). No other files touched.
- **Key implementation details:** `Splash.tsx` builds the navy hero card with the logo tile, brand name, tagline, three metric chips (H/L/P · 14/$310/47), orange-badged "Save up to 40%" white card inside the hero, full-width "Get started" CTA, and the "Sign in" secondary link below the hero. `HowItWorks.tsx` renders three cards (1 blue / 2 orange / 3 neutral-dark badges) with the spec copy. `Navbar.tsx` is sticky with `border-divider` bottom border and backdrop blur; the "Get Started" CTA is hidden below `sm`. `Button.tsx` is minimal with `primary` / `secondary` variants and an `as="button" | "span"` prop so it can be nested inside Next.js `<Link>` without invalid nested-interactive HTML.
- **Local verification:** `npm run build` passed (`/` route now 8.83 kB, up from 137 B placeholder). Playwright visual check at 375×812, 768×800, 1280×800 all clean — composition matches `docs/design-reference/image.png` screen 1 closely on mobile, desktop adds the navbar + "How it works" three-up + footer as specified. Accessibility snapshot confirmed all three CTAs (navbar "Get Started", hero "Get started", secondary "Sign in") link to `/get-started`. Click-through on the hero CTA navigates to `/get-started` with a 404 (expected — Task 102 target). Console contains only the known `favicon.ico` 404 and the expected `/get-started` 404 after navigation; no hydration, runtime, or Tailwind warnings.
- **Review file:** `docs/reviews/101-landing-page.md`
- **Deferred follow-ups (not owned by this task):** hide navbar entirely on `/` below `sm` for tighter screenshot fidelity (Phase 5 polish); add `favicon.ico` (can ship with Task 102); consider a typed `Metric` interface if metric data becomes dynamic later.
- **Next task:** Task 102 — Sign up / Role selection / Area verification (`/get-started` and sub-flow).
