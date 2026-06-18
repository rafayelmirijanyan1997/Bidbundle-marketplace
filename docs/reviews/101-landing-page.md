# Review — Task 101: Splash + Landing Page

**Date:** 2026-04-24
**Reviewer:** Claude Code
**Verdict:** Accepted

---

## Summary

Codex built a screenshot-faithful mobile splash that matches `docs/design-reference/image.png` screen 1, plus a clean desktop adaptation with a sticky navbar, centered splash, three-card "How it works" section, and minimal footer. Build passes with zero errors. All three CTAs route to `/get-started` correctly. Theme tokens are used throughout — no hard-coded hex values in components. Only six files were touched, exactly as specified.

---

## Playwright UI Check

- **Mobile (375×812):** Dark navy rounded hero card fills most of the viewport. Blue logo tile with white "N", bold "NeighBid" brand name, centered tagline. Three metric chips in a row: H(blue) · 14 · members / L(orange) · $310 · avg saved / P(neutral) · 47 · providers. Orange "Save up to 40%" pill on a white card inside the hero; headline and body text render correctly. Full-width blue "Get started" button. "Already have an account? Sign in" link below the hero (outside the navy surface). "How it works" section below with three stacked numbered cards. Footer centered. Screenshot: `task-101-mobile.png`.
- **Tablet (768×800):** Navbar shows full version with the "Get Started" CTA. Splash stays narrow and centered. Screenshot: `task-101-tablet.png`.
- **Desktop (1280×800):** Sticky top navbar (wordmark left, "Get Started" CTA right) with a soft bottom border. Splash centered in a narrow container with generous vertical whitespace. "How it works" renders as three cards in a row (max-w-5xl). Footer at the bottom with a top border. Screenshot: `task-101-desktop.png`.
- **No horizontal scroll** at 375 / 768 / 1024 / 1280 px.

---

## What Works

- Build: `npm run build` passes. `/` is now 8.83 kB (up from 137 B placeholder — expected).
- **Navigation:** All three CTAs link to `/get-started` as specified — verified via accessibility snapshot and a click-through on the hero "Get started" button (routes to `/get-started`, 404 as expected; Task 102 will build it).
- **File scope:** Exactly 6 files touched (2 modified, 4 created). No stray files. Protected files (`AppShell`, `BottomNav`, `globals.css`, Tailwind/TS config, mock data, services, types, `cn.ts`) untouched.
- **Screenshot fidelity:** Mobile composition closely matches `image.png` screen 1 — navy hero, logo tile, tagline, three metric chips with the correct initials and values (14 / $310 / 47), orange-badged "Save up to 40%" card inside the hero, full-width primary CTA, and the "Sign in" link below the hero surface.
- **Theme discipline:** Components use only the existing tokens (`bg-surface`, `bg-primary`, `bg-accent`, `bg-card`, `text-foreground`, `text-muted`, `border-divider`, `rounded-card`, `shadow-card`). No hard-coded hex values in any of the six touched files.
- **HowItWorks numbered badges:** 1 blue, 2 orange, 3 neutral-dark — matches spec.
- **Button component:** minimal, two variants (`primary`, `secondary`), accepts `className` pass-through for size overrides.
- **Navbar:** sticky, `border-b border-divider`, canvas background with subtle backdrop blur. "Get Started" CTA hidden on mobile (`hidden sm:inline-flex`) — as specified.

---

## Issues Found

None blocking.

---

## Missing Requirements

None.

---

## UX / Responsive Concerns

- **Minor duplication on mobile (observation, not a fix):** On mobile the top navbar shows the "NeighBid" wordmark, and the splash hero card below it also shows "NeighBid" prominently. This duplication is mild because the navbar wordmark is small and compact, and the spec I wrote explicitly said "wordmark left, small CTA right (hidden on mobile)" — which Codex followed correctly. The reference screenshot has no external navbar on mobile (the splash is shown inside a phone mock). If we want a tighter match to the reference, a future polish task could hide the navbar entirely on mobile for the landing route only. Deferring to Phase 5 polish.
- The splash hero's internal padding feels slightly tight against the savings highlight card on very small viewports, but it doesn't overflow. Acceptable.

---

## Code Quality Concerns

- **`Button as="span"` pattern:** Codex added an `as: "button" | "span"` prop to `Button` so it can be nested inside `<Link>` without creating invalid nested-interactive HTML (a `<button>` inside an `<a>` is invalid). This is a small, defensible deviation from a strict "render a button only" implementation — it's minimal and avoids the common Next.js anti-pattern. Accept as-is. When Task 102 needs form submission buttons (actual `<button type="submit">`), the same component works without changes.
- All three marketing components are function components with inline data arrays at module scope — simple and idiomatic. No prop drilling, no unnecessary abstractions. Good discipline.
- `Splash.tsx` uses the metrics array pattern with `badgeClassName` strings — this is fine at three items. If metrics become dynamic later, a typed `Metric` interface in `src/types/index.ts` would be worth adding; not needed now.

---

## Required Fixes for Codex

None.

---

## Optional Improvements (not blocking)

- Hide navbar on `/` below `sm` breakpoint to more closely match the reference screenshot composition (defer to Phase 5 polish).
- Add `src/app/favicon.ico` to clear the last remaining console 404 (deferred — can ship with Task 102 or as a tiny standalone).
- Consider a `<Metric>` typed interface if metric data becomes dynamic in future tasks (not needed now).

---

## Final Recommendation

**Accepted. Proceed to Task 102 — Sign up / Role selection / Area verification.**
