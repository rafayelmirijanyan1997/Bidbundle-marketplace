# Review: Task 204 — Bidding Room

**Date:** 2026-04-24
**Reviewer:** Claude Code (senior advisor)
**Task file:** `docs/tasks/phase-2-core-flows/204-bidding-room.md`

---

## Summary Verdict

**Accepted.** Build passes. All 3 steps render correctly at 375px. Bid selection updates the button amount dynamically. Confirm and confirmation screens are well-structured and match the spec. No new libraries or tokens added.

---

## Playwright UI Check Performed

- Viewport tested: 375×812 (iPhone mobile, full-page on Steps 1 and 3)
- Route tested: `/app/homeowner/bidding-room`
- Console errors: only known favicon.ico 404

---

## What Works

**Step 1 — Bid list:**
- Header: back chevron + "Bidding room" + "⏱ 32h 16m" timer ✓
- Dark navy request summary card: "Plumbing leak inspection · Oakwood Heights · 3 of 8 neighbors" ✓
- "Bids received" header + "3 bids · save up to $85" ✓
- 3 bid cards: ProFix PP (selected/blue border, BEST badge, $490, 2d, ★4.9, 128 jobs), AquaFlow AF ($530, 3d, ★4.7), PipePro PC ($575, 4d, ★4.5) ✓
- Clicking AquaFlow → blue border moves, button reads "Accept bid — $530" ✓
- Clicking ProFix → blue border returns, button reads "Accept bid — $490" ✓
- AI recommendation card: "✦ AI recommendation" header + static ProFix recommendation text ✓
- No bottom tab highlighted (correct — not a tab root) ✓

**Step 2 — Confirm booking:**
- "Confirm booking" heading + back chevron ✓
- Provider card: initials tile, name, rating + jobs, divider, grid with $amount + X days ✓
- Savings card (orange tint): savings amount + vs. solo price comparison ✓
- "Confirm booking" button ✓; "← Back to bids" link ✓
- Clicking confirm → ~900ms delay → Step 3 ✓

**Step 3 — Booking confirmed:**
- Blue checkmark on light blue circle ✓
- "Booking confirmed!" heading + "PipePro Co · Plumbing" subtitle ✓
- Dark navy SERVICE DETAILS card: provider name, 3-col stats ($575 AMOUNT · 4d ESTIMATED · ★4.5 RATING), 📍 Oakwood Heights ✓
- Savings card: "You saved $0 with your community · 3 neighbors in this group bid" ✓
- "Track my service" blue button ✓
- "Leave a review when the service is complete" muted text ✓

---

## Issues Found

None blocking.

---

## Notes

- The "$0 saved" on Step 3 is correct behavior — PipePro was selected (equal to solo price). When selecting ProFix ($490), savings would show "$85". The savings calculation is correctly derived from `soloPrice - selectedBid.amount`.
- The "Track my service" button is correctly a no-op — tracking screen is out of scope for Phase 2.

---

## Missing Requirements

None. All acceptance criteria met.

---

## UX / Responsive Concerns

None. Cards are well-proportioned, touch targets are adequate, and the flow feels natural end-to-end.

---

## Code Quality Concerns

None. Clean TypeScript, proper derived state, no `any`.

---

## Required Fixes for Codex

None.

---

## Optional Improvements (not required now)

- In Phase 5 polish: link the "Live bidding" chip on ServiceRequestCard and active bids in BidHistoryCard directly to `/app/homeowner/bidding-room`.
- In Phase 5: "Track my service" can route to a service tracking screen.
- The savings card showing "$0" when the most expensive bid is selected is technically correct but visually odd — could add a minimum floor of "$0" label or hide it. Minor; acceptable for now.

---

## Final Recommendation

**Accept Task 204.** The complete homeowner Phase 2 core flow is done:
- Dashboard (Home tab) ✓
- New Request → AI Analysis → Posted ✓
- Bidding Room → Confirm → Booking Confirmed ✓
- Bids / Chat / Profile tabs ✓

Next: **Task 301 — Provider Dashboard** (first provider-side screen, matching `docs/design-reference/image copy 3.png`).
