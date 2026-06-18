# Decision Log 001 — Initial UX Direction

**Date:** 2026-04-24
**Author:** Claude Code (senior advisor)

---

## Decision: Sidebar (desktop) + Bottom Nav (mobile) for app shell

**Superseded:** The original desktop-sidebar-first direction is no longer the primary visual model.
The new reference is the provided mobile screenshot set with bottom-tab navigation and light-theme app surfaces.

**Why:** The screenshot reference establishes the desired product feel more clearly than the earlier abstract dashboard direction. The product should now be designed mobile-first and screenshot-faithful.

**Rejected:** A dark desktop-shell aesthetic as the primary system.

---

## Decision: Single `/get-started` route for role selection

**Chosen:** `/get-started` as the only entry to the app. Role stored in mock/local state. No auth required in Phase 1.

**Why:** Keeps onboarding simple. Real auth is Phase 6. A single entry point makes routing predictable — every role flows from the same page.

**Rejected:** Separate `/homeowner`, `/provider`, `/admin` landing pages — too much duplication for Phase 1.

---

## Decision: "How it works" as landing page scroll section, not a separate route

**Chosen:** Scroll section on `/`.

**Why:** For Phase 1, a single-page scroll is faster to build and easier to maintain. If SEO or direct linking becomes important in Phase 5, a standalone `/how-it-works` page can be added.

---

## Decision: AI assistant as floating panel / inline card (placeholder only)

**Chosen:** AI panel appears inline or as a bottom sheet on mobile. Shows typing animation and static placeholder response.

**Why:** Makes the AI vision tangible without building anything real. Homeowners should feel the product's core value (AI routing requests and matching groups) during Phase 1 even with mock data.

**Rejected:** No AI presence at all — would make the product feel incomplete to stakeholders reviewing the prototype.

---

## Decision: Skeleton cards over spinners for loading states

**Chosen:** Skeleton placeholder cards.

**Why:** Skeleton loading feels faster and more modern. Matches the "strong dashboard feel" from the design direction. Spinners feel dated and disorienting in card-heavy layouts.

---

## Decision: Empty states designed from the start

**Chosen:** Every list/grid page must have a designed empty state.

**Why:** First-time users will always hit empty states. Designing them upfront prevents ugly blank pages and gives Codex clear acceptance criteria. Empty states also set the right content hierarchy for populated states.

---

## Decision: Screenshot theme becomes the binding visual reference

**Chosen:** The screenshot set is now the binding design reference for mobile layout structure, color system, and component hierarchy.

**Required visual cues:**

- warm off-white background
- dark navy summary/header cards
- bright blue CTA buttons
- orange urgency and savings accents
- white rounded cards
- compact mobile spacing
- light bottom navigation with blue active state

**Why:** This gives Claude and Codex a concrete target and removes ambiguity from the earlier generic design direction.

---

## Technology Recommendation (for Task 002)

- **Framework:** Next.js (App Router) — supports responsive layouts, easy routing, good Tailwind integration
- **Styling:** Tailwind CSS — fast iteration, consistent spacing, mobile-first utilities
- **Mock data:** `/src/data/mock/` folder — mockUsers, mockServiceRequests, mockBids, mockProviders
- **Placeholder services:** `/src/services/` — aiRoutingService.placeholder.ts, databaseService.placeholder.ts, notificationService.placeholder.ts
- **Theme:** Screenshot-based light mobile theme with dark navy surfaces, blue primary actions, and orange highlight states

---

## Approved Task Sequence

1. Task 002 — Rebuild Frontend Foundation for screenshot-faithful mobile theme
2. Task 101 — Splash / landing intro
3. Task 102 — Signup, role selection, and area verification
4. Task 201 — Homeowner dashboard and AI request flow
5. Task 202 — Homeowner bids, booking, and service tracking

Remaining Phase 2, 3, and later tasks follow after homeowner core is stable.
