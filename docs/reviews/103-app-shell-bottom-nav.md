# Review: Task 103 — App Shell Layout + Bottom Tab Navigation

**Date:** 2026-04-24
**Reviewer:** Claude Code (senior advisor)
**Task file:** `docs/tasks/phase-1-ui-ux/103-app-shell-bottom-nav.md`

---

## Summary Verdict

**Accepted.** Build passes. All three roles render the correct bottom tab bar on mobile and a top nav bar on desktop. The landing page and onboarding routes are unaffected. One approved deviation from spec (token choice for tab bar background).

---

## Playwright UI Check Performed

- Viewports tested: 375×812 (iPhone mobile), 1280×800 (desktop)
- Routes tested: `/app/homeowner/dashboard`, `/app/provider/dashboard`, `/app/admin/dashboard`, `/` (landing)
- Console errors: only the known `favicon.ico` 404 — no runtime or hydration errors

---

## What Works

- `npm run build` passes with zero TypeScript errors. 7 static routes generated.
- `/app/homeowner/dashboard`: bottom nav shows **Home · Chat · Bids · Me** at 375px. Home is blue/active, others are gray/muted. Icons are correct stroke-style SVGs.
- `/app/provider/dashboard`: bottom nav shows **Home · Bids · Reviews · Me**. Correct role-specific tabs.
- `/app/admin/dashboard`: bottom nav shows **Home · Community · Reports · Me**. Correct role-specific tabs.
- Desktop (1280px): no bottom bar; top nav bar shows tabs as horizontal icon+text links. Home is blue/active.
- Landing page (`/`): completely unaffected — no bottom nav, original Navbar and Splash intact.
- Nested layout correctly scoped: only `/app/*` routes inherit the shell.
- Safe-area inset applied inline via `env(safe-area-inset-bottom)`.
- `pb-20` on the main content area prevents content being obscured by fixed bottom bar.
- `AppBottomNav` correctly falls back to role inferred from current pathname before defaulting to `homeowner`, meaning direct URL access to `/app/provider/*` renders provider tabs even before onboarding.

---

## Issues Found

None blocking.

---

## Missing Requirements

None.

---

## UX / Responsive Concerns

None. Tab bar matches the reference screenshots (light background, blue active, gray inactive, icon + label, equally spaced).

---

## Code Quality Concerns

None. Clean TypeScript, no `any`, no `@ts-ignore`. Components are well-structured. `IconFrame` abstraction keeps SVG boilerplate DRY.

---

## Approved Deviations

- **`bg-card` instead of `bg-surface` for tab bar background.** The `surface` token resolves to the dark navy header color. The design references and spec both require a white/light tab bar. `bg-card` (white) is the correct choice. This is a token naming issue — the spec referenced the wrong token. Accepted.

---

## Required Fixes for Codex

None.

---

## Optional Improvements (not required now)

- The `BottomNav.tsx` stub still exists. It can be deleted in a future cleanup pass (Phase 5 polish task).
- Badge/notification counts on tabs can be added in Phase 5 once real data exists.

---

## Final Recommendation

**Accept Task 103.** The app shell foundation is in place. All Phase 2+ screens will automatically inherit the bottom tab layout by being placed under `src/app/app/`. Next task: **Task 102** (onboarding `/get-started` flow) or **Task 201** (homeowner dashboard).
