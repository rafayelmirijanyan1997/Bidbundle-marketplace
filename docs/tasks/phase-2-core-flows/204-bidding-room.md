# Task 204 — Bidding Room

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Build `/app/homeowner/bidding-room` as a 3-step mock flow: (1) bid list with selectable provider cards, (2) booking confirmation, (3) booking confirmed success screen. All data from mock. No WebSocket, no backend, no payments.

## Why This Task Comes Now

Task 203 completed the service request + AI placeholder. The natural end of the homeowner journey is selecting a winning bid and confirming a booking. This task completes the Phase 2 homeowner core flow end-to-end.

## Visual Reference

**Binding:** `docs/design-reference/image copy.png` screens 4–7 (Homeowner flow — Bids received, Confirm booking, Booking confirmed, Service tracking). Use these for card layout, badge style, and confirmation tone.

---

## New Mock Data File

Create `src/data/mock/mockBiddingRoom.ts` (new file — do not touch existing mock files):

```ts
export interface BidRoomEntry {
  id: string;
  providerName: string;
  providerInitials: string;
  rating: number;
  jobsCompleted: number;
  amount: number;
  estimatedDays: number;
  isLeading: boolean;
}

export const mockBiddingRoomRequest = {
  title: "Plumbing leak inspection",
  category: "Plumbing",
  neighborhood: "Oakwood Heights",
  neighborsJoined: 3,
  neighborsTotal: 8,
  soloPrice: 575,      // what solo booking would cost (for savings calc)
  countdown: "32h 16m",
};

export const mockBiddingRoomBids: BidRoomEntry[] = [
  { id: "br-1", providerName: "ProFix Plumbing",   providerInitials: "PP", rating: 4.9, jobsCompleted: 128, amount: 490, estimatedDays: 2, isLeading: true  },
  { id: "br-2", providerName: "AquaFlow Services",  providerInitials: "AF", rating: 4.7, jobsCompleted: 87,  amount: 530, estimatedDays: 3, isLeading: false },
  { id: "br-3", providerName: "PipePro Co",         providerInitials: "PC", rating: 4.5, jobsCompleted: 62,  amount: 575, estimatedDays: 4, isLeading: false },
];
```

---

## BidCard Component

```tsx
// src/components/homeowner/BidCard.tsx
// Props: { bid: BidRoomEntry; isSelected: boolean; onSelect: () => void }
```

Outer: `<button>` with `aria-pressed={isSelected}` and `w-full text-left`:
- Selected: `bg-card rounded-card p-4 border-2 border-primary shadow-card relative`
- Unselected: `bg-card rounded-card p-4 border border-divider shadow-card relative`

Inner layout: `flex items-center gap-3`

- **"BEST" badge** (only when `bid.isLeading`): absolute top-2 right-2, `bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full` — "BEST"

- **Initials tile** (flex-none, 40×40, `rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm`): `{bid.providerInitials}`

- **Center** (flex-1 min-w-0):
  - Provider name: `text-sm font-semibold text-foreground`
  - Rating + jobs row: `flex items-center gap-2 mt-0.5`
    - Star rating: `text-xs text-accent font-medium` — `★ {bid.rating}`
    - Jobs: `text-xs text-muted` — `{bid.jobsCompleted} jobs`

- **Right** (flex-none, flex flex-col items-end gap-0.5):
  - Amount: `text-base font-bold text-foreground` — `$${bid.amount}`
  - Days: `text-xs text-muted` — `{bid.estimatedDays}d est.`

---

## Page State Machine

```tsx
// src/app/app/homeowner/bidding-room/page.tsx
"use client"
```

State:
```ts
const [step, setStep] = useState<"bids" | "confirm" | "confirmed">("bids");
const [selectedBidId, setSelectedBidId] = useState<string>("br-1"); // default to leading
const [isConfirming, setIsConfirming] = useState(false);
```

Derived:
```ts
const selectedBid = mockBiddingRoomBids.find(b => b.id === selectedBidId)!;
const savings = mockBiddingRoomRequest.soloPrice - selectedBid.amount;
```

Confirm handler:
```ts
function handleConfirm() {
  setIsConfirming(true);
  setTimeout(() => { setIsConfirming(false); setStep("confirmed"); }, 900);
}
```

Container (all steps): `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

---

## Step 1 — Bid List

Layout order:

**1. Header row** (`flex items-center justify-between mb-2`):
- Left: back chevron button (`onClick={() => router.back()}`, `aria-label="Back"`, same style as Task 203: `w-8 h-8 rounded-full bg-card border border-divider text-muted`) + `<h1 className="text-lg font-bold text-foreground ml-2">Bidding room</h1>`
- Right: `<span className="text-xs text-muted">⏱ {mockBiddingRoomRequest.countdown}</span>`

**2. Request summary card** (`bg-foreground rounded-card p-3`):
- `<p className="text-sm font-semibold text-white">{mockBiddingRoomRequest.title}</p>`
- `<p className="text-xs text-white/60 mt-0.5">{mockBiddingRoomRequest.neighborhood} · {mockBiddingRoomRequest.neighborsJoined} of {mockBiddingRoomRequest.neighborsTotal} neighbors</p>`

**3. Section header** (`flex items-center justify-between mt-2`):
- `<h2 className="text-sm font-semibold text-foreground">Bids received</h2>`
- `<span className="text-xs text-muted">{mockBiddingRoomBids.length} bids · save up to ${savings}</span>`
  (savings here = `mockBiddingRoomRequest.soloPrice - Math.min(...mockBiddingRoomBids.map(b => b.amount))`)

**4. Bid cards** (`space-y-3`):
- One `<BidCard>` per entry in `mockBiddingRoomBids`
- `isSelected={selectedBidId === bid.id}`
- `onSelect={() => setSelectedBidId(bid.id)}`

**5. AI recommendation card** (`bg-card rounded-card shadow-card p-4`):
- Header: `<span className="text-xs font-semibold text-primary">✦ AI recommendation</span>`
- Body: `<p className="text-sm text-foreground mt-1">ProFix Plumbing offers the best value — highest rating (4.9★) at the lowest price in this group bid.</p>`

**6. Accept bid button**:
```tsx
<Button variant="primary" className="w-full"
  onClick={() => setStep("confirm")}
  disabled={!selectedBidId}>
  Accept bid — ${selectedBid?.amount}
</Button>
```

---

## Step 2 — Confirm Booking

Layout order:

**1. Header** (`flex items-center gap-3`):
- Back chevron (`onClick={() => setStep("bids")}`) + `<h1>Confirm booking</h1>`

**2. Selected provider card** (`bg-card rounded-card shadow-card p-4`):
- Initials tile (48×48, `bg-primary`, white bold text) + provider name (`text-base font-semibold`) + rating + jobs
- Divider: `border-t border-divider my-3`
- Details row: `grid grid-cols-2 gap-2 text-center`
  - Left cell: `text-lg font-bold text-foreground` — `$${selectedBid.amount}` + `text-xs text-muted` — "Bid amount"
  - Right cell: `text-lg font-bold text-foreground` — `${selectedBid.estimatedDays} days` + `text-xs text-muted` — "Estimated"

**3. Savings card** (`bg-accent/10 border border-accent/40 rounded-card p-3`):
- `<p className="text-sm font-medium text-accent">You save $${savings} by booking with your community</p>`
- `<p className="text-xs text-muted mt-0.5">vs. booking alone at $${mockBiddingRoomRequest.soloPrice}</p>`

**4. Confirm button**:
```tsx
<Button variant="primary" className="w-full"
  onClick={handleConfirm}
  disabled={isConfirming}>
  {isConfirming ? "Confirming…" : "Confirm booking"}
</Button>
```

**5. Cancel link** (below button, centered):
```tsx
<button onClick={() => setStep("bids")}
  className="w-full text-center text-sm text-muted py-2">
  ← Back to bids
</button>
```

---

## Step 3 — Booking Confirmed

Layout order:

**1. Checkmark + headings** (`flex flex-col items-center text-center gap-2 py-4`):
- 56×56 circle `bg-primary/10`: checkmark inline SVG (stroke, `text-primary`, 28×28, same as Task 203)
- `<h2 className="text-xl font-bold text-foreground">Booking confirmed!</h2>`
- `<p className="text-sm text-muted">{selectedBid.providerName} · {mockBiddingRoomRequest.category}</p>`

**2. Service details card** (`bg-foreground rounded-card p-5 text-white`):
- `<p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Service details</p>`
- Provider name: `text-base font-semibold mt-1`
- Row of 3 stats (`grid grid-cols-3 text-center border-t border-white/20 mt-3 pt-3 divide-x divide-white/20`):
  - `$${selectedBid.amount}` / "Amount"
  - `${selectedBid.estimatedDays}d` / "Estimated"
  - `★ ${selectedBid.rating}` / "Rating"
- Neighborhood: `<p className="text-xs text-white/60 mt-3">📍 {mockBiddingRoomRequest.neighborhood}</p>`

**3. Community savings card** (`bg-accent/10 border border-accent/40 rounded-card p-3`):
- `<p className="text-sm font-medium text-accent">You saved $${savings} with your community</p>`
- `<p className="text-xs text-muted mt-0.5">{mockBiddingRoomRequest.neighborsJoined} neighbors in this group bid</p>`

**4. Track my service button**:
```tsx
<Button variant="primary" className="w-full">
  Track my service
</Button>
```
(no-op — tracking screen is out of scope)

**5. Review link** (centered below button):
```tsx
<p className="text-center text-xs text-muted py-2">
  Leave a review when the service is complete
</p>
```

---

## Files to Create

```
src/data/mock/mockBiddingRoom.ts                (create — new mock data)
src/components/homeowner/BidCard.tsx            (create)
src/app/app/homeowner/bidding-room/page.tsx     (create)
```

Do not modify: `AppBottomNav.tsx`, `AppShell.tsx`, `layout.tsx`, `Button.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, any existing mock data files, services, types, or `cn.ts`. Do not modify any existing homeowner components.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-2-core-flows/204-bidding-room.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/design-reference/image copy.png` — screens 4–7
- `src/app/app/layout.tsx` — do not modify
- `src/components/ui/Button.tsx` — reuse, do not modify
- `src/components/homeowner/UserSummaryCard.tsx` — reference dark card pattern
- `tailwind.config.ts` — confirm tokens

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- `max-w-lg mx-auto px-5 py-6 pb-24` on all viewports.
- Bid cards stack vertically — no grid on any breakpoint.
- Only existing theme tokens. No new tokens. Do not edit `tailwind.config.ts`.

## AI / Database Placeholder Requirements

- No real AI. The "AI recommendation" card is a static white card with hardcoded text.
- No payment processing — "Confirm booking" just advances local state.
- All data from `mockBiddingRoom.ts`.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/homeowner/bidding-room` renders without 404.
- [ ] Step 1: request summary dark navy card, 3 bid cards, ProFix has "BEST" badge, default selection on ProFix (blue border), AI recommendation card, "Accept bid — $490" button.
- [ ] Clicking a different bid card selects it (blue border moves, button amount updates to match).
- [ ] Clicking "Accept bid" advances to Step 2.
- [ ] Step 2: selected provider card with amount + days, savings card showing correct $savings, "Confirm booking" button.
- [ ] "Back to bids" link on Step 2 returns to Step 1 with selection preserved.
- [ ] Clicking "Confirm booking" shows "Confirming…" for ~900ms then advances to Step 3.
- [ ] Step 3: checkmark, "Booking confirmed!", service details dark navy card with 3 stats, savings card, "Track my service" button, review text.
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] Bottom tab bar visible but no tab highlighted blue (not a tab root route).
- [ ] No new libraries. No new tokens. No modifications to protected files.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, DevTools → iPhone 14 (390×844).
3. Navigate to `/app/homeowner/bidding-room`.
4. Step 1: confirm dark navy request summary card. Confirm 3 bid cards: ProFix $490 (BEST badge, selected/blue border), AquaFlow $530, PipePro $575.
5. Tap AquaFlow card → blue border moves to AquaFlow, button reads "Accept bid — $530".
6. Tap ProFix card → blue border back to ProFix. Confirm AI recommendation card visible.
7. Click "Accept bid — $490" → Step 2 renders.
8. Step 2: provider card shows "ProFix Plumbing", $490, 2 days. Savings card shows $85 saved vs $575.
9. Click "← Back to bids" → returns to Step 1 with ProFix still selected.
10. Re-accept → Step 2 again. Click "Confirm booking" → shows "Confirming…" ~900ms → Step 3.
11. Step 3: checkmark, "Booking confirmed!", "ProFix Plumbing · Plumbing". Dark navy service details: $490, 2d, ★4.9. Savings card: "You saved $85 with your community".
12. "Track my service" button present. Review text present.
13. Resize to 1280×800: content centered, top nav bar, no bottom bar, no scroll.
14. Confirm `/app/homeowner/dashboard`, `/app/homeowner/bids`, and `/app/homeowner/request` still render correctly.

## Out of Scope

- Real payment processing
- Real-time bidding / WebSocket
- Service tracking screen (Phase 3+)
- Review submission flow
- Linking dashboard service cards or bid history cards to this route (Phase 5 polish)
- Any new npm dependencies

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-2-core-flows/204-bidding-room.md (this file),
then docs/01-design-ux/design-direction.md.

Visual reference (binding): docs/design-reference/image copy.png — screens 4–7
(Bids received, Confirm booking, Booking confirmed, Service tracking tone).

Also read before starting:
- src/app/app/layout.tsx                   (do NOT modify)
- src/components/ui/Button.tsx             (do NOT modify)
- src/components/homeowner/UserSummaryCard.tsx  (reference dark card pattern — do NOT modify)
- tailwind.config.ts                       (do NOT modify)

CREATE these files only:

1. src/data/mock/mockBiddingRoom.ts
   Export: BidRoomEntry interface, mockBiddingRoomRequest object, mockBiddingRoomBids array.
   See the "New Mock Data File" section for exact values.

2. src/components/homeowner/BidCard.tsx
   Props: { bid: BidRoomEntry; isSelected: boolean; onSelect: () => void }
   Full-width selectable button card. See "BidCard Component" section.
   Selected = border-2 border-primary. Unselected = border border-divider.
   "BEST" badge absolute top-2 right-2 when bid.isLeading.
   Layout: initials tile (40×40, bg-primary, rounded-xl) + center (name, rating, jobs) + right (amount, days).

3. src/app/app/homeowner/bidding-room/page.tsx
   "use client"
   State: step ("bids"|"confirm"|"confirmed"), selectedBidId (default "br-1"), isConfirming.
   Derived: selectedBid = mockBiddingRoomBids.find(b => b.id === selectedBidId)!
            savings = mockBiddingRoomRequest.soloPrice - selectedBid.amount
   Container: max-w-lg mx-auto px-5 py-6 pb-24 space-y-4

   STEP "bids":
     - Header: flex items-center justify-between — back chevron (router.back()) + "Bidding room" h1 + timer span
     - Request summary: bg-foreground rounded-card p-3 — title + neighborhood + neighbors count
     - Section header: flex justify-between — "Bids received" h2 + bids count + max savings
     - Bid cards: space-y-3, one <BidCard> per bid
     - AI recommendation: bg-card rounded-card shadow-card p-4 — "✦ AI recommendation" header + static text
     - Accept button: "Accept bid — $490" (updates to reflect selectedBid.amount), onClick setStep("confirm")

   STEP "confirm":
     - Header: back chevron (setStep("bids")) + "Confirm booking" h1
     - Provider card: bg-card rounded-card shadow-card p-4
       - Top: initials tile (48×48) + name + rating + jobs
       - Divider
       - Grid cols-2: amount + estimated days
     - Savings card: bg-accent/10 border border-accent/40 rounded-card p-3
       - "You save $${savings} by booking with your community"
       - "vs. booking alone at $${soloPrice}"
     - Confirm button: "Confirm booking" → isConfirming=true, setTimeout 900ms → setStep("confirmed")
     - Back link: "← Back to bids" button (setStep("bids"))

   STEP "confirmed":
     - Checkmark icon (56×56 circle bg-primary/10, inline SVG polyline checkmark, text-primary)
     - "Booking confirmed!" h2 + provider·category p
     - Dark navy service card (bg-foreground rounded-card p-5 text-white):
       - "SERVICE DETAILS" label
       - Provider name
       - 3-col stats grid: $amount | Xd | ★rating
       - Neighborhood
     - Savings card (bg-accent/10 border border-accent/40):
       - "You saved $${savings} with your community"
       - "{neighborsJoined} neighbors in this group bid"
     - "Track my service" Button (primary, no-op)
     - "Leave a review when the service is complete" p (text-center text-xs text-muted)

Constraints:
- Do NOT add any npm packages.
- Do NOT add new Tailwind tokens or edit tailwind.config.ts.
- Do NOT modify any existing files: layout.tsx, AppBottomNav, Button, any mock data, types, services, globals.css, cn.ts, or any existing homeowner components.
- "use client" on page.tsx only.

Run `npm run build` at the end. Fix any TypeScript or build errors.
Report: list every file created or modified, full build output, any deviations.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/data/mock/mockBiddingRoom.ts`, `src/components/homeowner/BidCard.tsx`, `src/app/app/homeowner/bidding-room/page.tsx`
- **Build:** Zero errors. 13 static pages.
- **Playwright review:** Passed at 375×812. Step 1: 3 bid cards, ProFix BEST badge, selection switches correctly and updates button amount. Step 2: provider card with amount+days grid, savings card, confirm button, back link. Step 3: checkmark, "Booking confirmed!", dark navy SERVICE DETAILS card with 3-col stats, savings card, "Track my service" button, review text.
- **Note:** "$0 saved" when selecting PipePro Co is correct behavior (solo price = PipePro amount). Selecting ProFix shows $85 savings.
- **Review file:** `docs/reviews/204-bidding-room.md`
- **Phase 2 homeowner complete.** Next: Task 301 — Provider Dashboard.

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Task 203 (Service Request + AI Placeholder) accepted. This completes the homeowner core flow: bid list → confirm → booking confirmed.
- **Design reference:** `docs/design-reference/image copy.png` screens 4–7.
- **Mock data:** New `mockBiddingRoom.ts` file with 3 provider bids for the plumbing request.
- **3 steps in 1 route:** `bids` → `confirm` → `confirmed`, all via local `useState`.
- **Next step:** Playwright review — check bid selection behavior, savings calc, Step 2 provider card, Step 3 confirmation.
