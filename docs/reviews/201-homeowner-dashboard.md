# Review: Task 201 — Homeowner Dashboard (Home Tab)

**Date:** 2026-04-24
**Reviewer:** Claude Code (senior advisor)
**Task file:** `docs/tasks/phase-2-core-flows/201-homeowner-dashboard.md`

---

## Summary Verdict

**Accepted.** Build passes. Dashboard renders correctly at 375px and 1280px. All mock data renders correctly. Screenshot fidelity is high — closely matches `docs/design-reference/image copy.png` first screen. No new libraries or tokens added.

---

## Playwright UI Check Performed

- Viewports tested: 375×812 (iPhone mobile, full-page), 1280×800 (desktop viewport)
- Routes tested: `/app/homeowner/dashboard`
- Console errors: only the known `favicon.ico` 404 — no runtime or hydration errors on fresh load

---

## What Works

- `npm run build` passes with zero TypeScript errors. 11 static pages generated.
- **UserSummaryCard (375px):** Dark navy card, blue "LS" circle avatar, "Lance Silva" name, "123 Maple St · Oakwood Heights" subtitle, divider line, 3 stats: `2 ACTIVE · $310 SAVED · 14 NEIGHBORS` — all visible and styled correctly.
- **AiPromptCard (375px):** White card, "✦ WHAT DO YOU NEED DONE?" header in blue, dark navy textarea with placeholder text, "Let AI route it →" disabled blue button, "AI matching coming soon" muted label.
- **RequestFeed (375px):** "Neighborhood bids" header with orange `LIVE` badge. Three service request cards:
  - Card 1: Blue `P` tile · "Plumbing leak inspec…" · Oakwood Heights · `$450–$620` · orange "Live bidding" chip ✓
  - Card 2: Orange `L` tile · "Lawn care bundle" · Lakeview Park · `$180–$320` · blue "Grouping" chip ✓
  - Card 3: Dark `E` tile · "Gutter cleanup" · Oakwood Heights · `$120–$220` · gray "Draft" chip ✓
- **Savings banner:** Orange-tinted card: "You saved $310 with group bids · 14 neighbors joined" ✓
- **Bottom nav (375px):** Home tab blue/active, Chat, Bids, Me tabs visible ✓
- **Desktop (1280px):** Top nav bar with Home active. Content centered in narrow column on canvas background. Full card titles visible (no truncation at this width). All sections render correctly.
- No horizontal scroll at either viewport.

---

## Issues Found

None blocking.

---

## Missing Requirements

None. All acceptance criteria met.

---

## UX / Responsive Concerns

None. The dashboard matches the design reference closely. The AI prompt card textarea uses a dark navy background (`bg-surface` maps to the dark token) — visually distinct from the surrounding white card, which is intentional and matches the spec.

---

## Code Quality Concerns

None. Clean TypeScript, no `any`, no `@ts-ignore`. Components are well-separated with clear props. Mock data imported directly — no fetching.

---

## Required Fixes for Codex

None.

---

## Optional Improvements (not required now)

- "+ New request" button is partially hidden under the fixed bottom nav at 375px (visible when scrolling). A `pb-24` is applied — sufficient for now; can be refined in Phase 5 polish.
- Card title truncation with `truncate` class works correctly on mobile. Desktop shows full titles — acceptable.

---

## Final Recommendation

**Accept Task 201.** The homeowner Home tab is complete and production-quality. Next task: **Task 202 — Homeowner Bids, Chat, and Profile tabs** (filling in the three remaining placeholder tab pages).
