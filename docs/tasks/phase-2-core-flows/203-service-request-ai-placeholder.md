# Task 203 — Service Request + AI Placeholder

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Build the `/app/homeowner/request` route: a two-step service request flow with a mock AI analysis card. Step 1 is a form where the homeowner describes their need; a mock AI card appears inline after they type, showing a pulsing "Analyzing…" animation before revealing the detected category and a group suggestion. Step 2 is a posted confirmation with a group-forming progress card. No real AI or backend involved.

## Why This Task Comes Now

Tasks 201 and 202 completed the homeowner tab experience. The "+ New request" button on the dashboard routes to `/app/homeowner/request`, which currently 404s. This task wires that button to a real screen and brings the product's core AI value proposition to life visually without building anything real.

## Visual Reference

Screens 2–4 of `docs/design-reference/image copy.png` (Flow 02 — Homeowner flow) show the request-posted confirmation and group-forming state. Use them as reference for tone and card layout. The AI analysis card itself is an inline card as specified in `docs/decision-log/001-initial-ux-direction.md` ("typing animation and static placeholder response").

---

## User-Facing Behavior

### Step 1 — Form

`/app/homeowner/request` renders:

1. **Page header:** back chevron (routes to `/app/homeowner/dashboard`) on the left + "New request" heading centered.

2. **Description card:** white `bg-card rounded-card shadow-card p-4`:
   - Label: `text-xs font-semibold text-muted uppercase tracking-wide` — "What do you need done?"
   - Textarea: `w-full rounded-xl border border-divider bg-surface p-3 text-sm text-foreground resize-none h-28 mt-2 focus:outline-none focus:border-primary` — placeholder "e.g. My kitchen sink has been leaking for a week…"

3. **AI analysis card** — appears only when `text.length >= 10`. Two sub-states:
   - **Analyzing sub-state** (`aiState === "analyzing"`): dark navy card `bg-foreground rounded-card p-4` with:
     - Header row: `✦ AI` label (`text-xs font-semibold text-primary`) + "Analyzing your request" text (`text-sm text-white/80`) on the same line
     - Below: three pulsing dots animation (CSS `@keyframes` pulse, staggered `animation-delay`). Each dot is `w-2 h-2 rounded-full bg-primary/60 inline-block`.
   - **Result sub-state** (`aiState === "result"`): same dark navy card, but body changes to:
     - "Detected category:" label + a pill chip showing the category (`bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full`)
     - Below: `<GroupSuggestionCard>` (see component spec below)

4. **"Post request" button:** `<Button variant="primary" className="w-full">Post request</Button>`. Disabled when `text.trim().length === 0`. When clicked: button text changes to "Posting…" for 800ms, then advances to Step 2.

The bottom tab bar (from the app shell layout) is visible. No specific tab is "active" on this route since it's not a tab root — all tabs remain gray/inactive.

---

### Step 2 — Confirmation

After posting, the page switches to show:

1. **Check icon:** centered 56×56 circle `bg-primary/10` containing a checkmark inline SVG (`text-primary`, stroke-based, 28×28). Below it: `"Request posted!"` heading (`text-xl font-bold text-foreground text-center`) + category label (`text-sm text-muted text-center`).

2. **Group forming card:** dark navy `bg-foreground rounded-card p-5 text-white`:
   - Header: `"Group forming"` (`text-sm font-semibold text-white/70 uppercase tracking-wide`)
   - Title: detected service title or the user's typed description (truncated to 40 chars if needed)
   - Neighbor count: `"3 of 8 neighbors joined"` (`text-2xl font-bold` for "3", `text-sm text-white/70` for the rest)
   - Progress bar: `w-full h-1.5 rounded-full bg-white/20 mt-2` with inner `h-full rounded-full bg-primary` at `width: 37.5%` (3/8)
   - Timer row: `"⏱ 32h 16m remaining"` (`text-xs text-white/60 mt-2`)
   - Neighborhood: `"📍 Oakwood Heights"` (`text-xs text-white/60`)

3. **Action buttons:**
   - Primary: `<Button variant="primary" className="w-full">Back to dashboard</Button>` — `onClick={() => router.push("/app/homeowner/dashboard")}`
   - Secondary: full-width outlined button `<button className="w-full h-12 rounded-xl border border-divider text-sm font-medium text-muted bg-card">Invite a neighbor</button>` — no-op

---

## Category Detection Logic

Client-side keyword matching (no API). Define this function in `page.tsx`:

```ts
function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (/plumb|leak|pipe|drain|faucet/.test(t)) return "Plumbing";
  if (/lawn|grass|mow|garden|landscap|trim/.test(t)) return "Landscaping";
  if (/clean|sweep|dust|vacuum/.test(t)) return "Cleaning";
  if (/gutter|roof|exterior|paint|window/.test(t)) return "Exterior";
  return "General";
}
```

Also define a helper to find a matching existing group from `mockServiceRequests`:

```ts
import { mockServiceRequests } from "@/data/mock/mockServiceRequests";

function findMatchingGroup(category: string) {
  return mockServiceRequests.find(
    (r) => r.category === category && r.status === "live" || r.status === "grouping"
  ) ?? null;
}
```

---

## GroupSuggestionCard Component

```tsx
// src/components/homeowner/GroupSuggestionCard.tsx
// Props: { matchedRequest: ServiceRequest | null; category: string }
```

**When `matchedRequest` is not null (join existing group):**

White `bg-card rounded-xl p-3 mt-3`:
- Top row: `"Nearby group found"` badge (`bg-accent/15 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full`)
- Title: `matchedRequest.title` (`text-sm font-semibold text-foreground mt-1.5`)
- Details row: `"3 neighbors · {matchedRequest.neighborhood}"` (`text-xs text-muted`)
- Budget: `"${matchedRequest.budgetMin}–$${matchedRequest.budgetMax}"` (`text-xs text-foreground font-medium`)
- CTA pill at bottom: `"Join this group →"` (`text-xs font-semibold text-primary`) — no-op, clicking does not navigate

**When `matchedRequest` is null (start new group):**

White `bg-card rounded-xl p-3 mt-3`:
- Badge: `"Start a new group"` (`bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full`)
- Body: `"Be the first in Oakwood Heights to request {category} services."` (`text-sm text-foreground mt-1.5`)
- CTA: `"Create group →"` (`text-xs font-semibold text-primary`) — no-op

---

## Page State Machine

```tsx
// src/app/app/homeowner/request/page.tsx
"use client"
```

State:
```ts
const [text, setText] = useState("");
const [step, setStep] = useState<"form" | "posted">("form");
const [aiState, setAiState] = useState<"idle" | "analyzing" | "result">("idle");
const [detectedCategory, setDetectedCategory] = useState("General");
const [isPosting, setIsPosting] = useState(false);
```

`useEffect` watching `text`:
- If `text.trim().length >= 10`: set `aiState` to `"analyzing"`, start a `setTimeout` of 1500ms → set `aiState` to `"result"`, update `detectedCategory` via `detectCategory(text)`.
- If `text.trim().length < 10`: set `aiState` to `"idle"`, clear any pending timeout.
- Clean up timeout on unmount.

Post handler:
```ts
function handlePost() {
  if (!text.trim()) return;
  setIsPosting(true);
  setTimeout(() => {
    setIsPosting(false);
    setStep("posted");
  }, 800);
}
```

Container: `max-w-lg mx-auto px-5 py-6 pb-24 space-y-4`

---

## Files to Create

```
src/app/app/homeowner/request/page.tsx          (create)
src/components/homeowner/GroupSuggestionCard.tsx (create)
```

No other new files needed — `Button` from `src/components/ui/Button.tsx` is reused. No new mock data files. No new layout files.

Do not modify: `AppBottomNav.tsx`, `AppShell.tsx`, `layout.tsx`, `Button.tsx`, `globals.css`, `tailwind.config.ts`, `tsconfig.json`, any existing mock data files, services, types, or `cn.ts`.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-2-core-flows/203-service-request-ai-placeholder.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/decision-log/001-initial-ux-direction.md`
- `docs/design-reference/image copy.png` — screens 2–4 for tone reference
- `src/app/app/layout.tsx` — do not modify
- `src/components/ui/Button.tsx` — reuse, do not modify
- `src/data/mock/mockServiceRequests.ts` — read for `findMatchingGroup`
- `src/types/index.ts` — `ServiceRequest` type
- `tailwind.config.ts` — confirm tokens

## CSS Dots Animation

Since `globals.css` must not be modified, define the keyframe animation using a Tailwind `arbitrary value` or an inline `<style>` tag scoped to the component. The simplest approach: use a `<style>` JSX tag inside the component with the keyframes, then reference the class name. Keep it minimal:

```tsx
// Inside AiAnalysisCard or page.tsx:
<style>{`
  @keyframes nbPulse {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1);   }
  }
  .nb-dot { animation: nbPulse 1.2s ease-in-out infinite; }
  .nb-dot:nth-child(2) { animation-delay: 0.2s; }
  .nb-dot:nth-child(3) { animation-delay: 0.4s; }
`}</style>
```

---

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- `max-w-lg mx-auto px-5 py-6 pb-24` on all viewports.
- Textarea is touch-friendly (`h-28` minimum).
- Use only existing theme tokens. No new tokens. Do not edit `tailwind.config.ts`.
- The `<style>` JSX tag for the dots animation is acceptable (no globals.css change).

## AI / Database Placeholder Requirements

- No real AI API call. Category detection is regex-based, client-side.
- No form submission to any server.
- All group data comes from `mockServiceRequests`.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/app/homeowner/request` renders without 404.
- [ ] Step 1: textarea present, "Post request" disabled with empty text.
- [ ] Typing 10+ chars: AI card appears showing pulsing dots animation.
- [ ] After ~1.5s: AI card shows detected category chip + `GroupSuggestionCard`.
- [ ] Typing "plumbing" → category "Plumbing" → "Nearby group found" card showing the matching request.
- [ ] Typing "cleaning" → category "Cleaning" → "Start a new group" card.
- [ ] Clicking "Post request" with valid text: button shows "Posting…" for ~800ms, then transitions to Step 2.
- [ ] Step 2: checkmark icon, "Request posted!" heading, category label, dark navy group forming card with neighbor count + progress bar + timer + neighborhood, "Back to dashboard" + "Invite a neighbor" buttons.
- [ ] "Back to dashboard" routes to `/app/homeowner/dashboard`.
- [ ] Clearing the textarea resets `aiState` to idle (AI card disappears).
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] Bottom tab bar visible but no tab highlighted blue (not a tab root route).
- [ ] No new libraries. No new tokens. No modifications to protected files.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev`, DevTools → iPhone 14 (390×844).
3. Navigate to `/app/homeowner/request` directly. Confirm: header with back chevron + "New request", textarea, disabled "Post request" button.
4. Type "My kitchen sink has been leaking". Confirm AI card appears with pulsing dots.
5. Wait ~1.5s. Confirm AI card switches to: "Plumbing" category chip + "Nearby group found" suggestion card (Plumbing leak inspection, Oakwood Heights, $450–$620).
6. Clear the textarea. Confirm AI card disappears.
7. Type "I need lawn care". Confirm AI card shows "Landscaping" → "Nearby group found" (Lawn care bundle).
8. Clear. Type "my house needs cleaning". Confirm "Cleaning" → "Start a new group" card.
9. Navigate to `/app/homeowner/dashboard`, click "+ New request". Confirm it routes to `/app/homeowner/request` (not 404).
10. Type anything 10+ chars, wait for AI result. Click "Post request". Confirm button shows "Posting…" briefly, then Step 2 renders.
11. Step 2: check icon, "Request posted!", group forming card with 3/8 neighbors, 37.5% progress bar, "32h 16m remaining", "Oakwood Heights".
12. Click "Back to dashboard" → routes back to `/app/homeowner/dashboard`.
13. Resize to 1280×800: layout is centered, top nav visible, no bottom bar visible, no horizontal scroll.
14. Confirm `/`, `/get-started`, `/app/homeowner/dashboard` all still render correctly.

## Out of Scope

- Real AI/LLM API call
- Real group creation or database write
- Invite neighbor functionality
- Bid room / booking flow (Task 204)
- Provider-side view of the request
- Form validation beyond non-empty
- Server-side routing or session state
- Any new npm dependencies

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-2-core-flows/203-service-request-ai-placeholder.md (this file),
then docs/01-design-ux/design-direction.md, and docs/decision-log/001-initial-ux-direction.md.

Visual reference: docs/design-reference/image copy.png — screens 2–4 for tone/card style.

Also read before starting:
- src/app/app/layout.tsx                   (do NOT modify)
- src/components/ui/Button.tsx             (do NOT modify)
- src/data/mock/mockServiceRequests.ts     (do NOT modify)
- src/types/index.ts                       (do NOT modify)
- tailwind.config.ts                       (do NOT modify)

CREATE these files only:

1. src/app/app/homeowner/request/page.tsx
   "use client"
   State: text (string), step ("form"|"posted"), aiState ("idle"|"analyzing"|"result"),
          detectedCategory (string, default "General"), isPosting (boolean).

   detectCategory(text): regex keyword matching → "Plumbing"|"Landscaping"|"Cleaning"|"Exterior"|"General"
     plumb|leak|pipe|drain|faucet → Plumbing
     lawn|grass|mow|garden|landscap|trim → Landscaping
     clean|sweep|dust|vacuum → Cleaning
     gutter|roof|exterior|paint|window → Exterior
     default → General

   findMatchingGroup(category): searches mockServiceRequests for a request where
     r.category === category AND (r.status === "live" OR r.status === "grouping").
     Returns the first match or null.

   useEffect watching text:
     - text.trim().length >= 10 → setAiState("analyzing"), setTimeout(1500, () => {
         setDetectedCategory(detectCategory(text));
         setAiState("result");
       })
     - text.trim().length < 10 → setAiState("idle"); clearTimeout(ref)
     - cleanup on unmount

   handlePost():
     setIsPosting(true); setTimeout(800, () => { setIsPosting(false); setStep("posted"); })

   STEP 1 layout (max-w-lg mx-auto px-5 py-6 pb-24 space-y-4):
     a) Header: flex items-center gap-3
        - Back chevron: <button onClick={() => router.push("/app/homeowner/dashboard")}
            aria-label="Back" className="flex items-center justify-center w-8 h-8 rounded-full
            bg-card border border-divider text-muted">‹</button>
        - <h1 className="text-lg font-bold text-foreground">New request</h1>
     b) Description card: bg-card rounded-card shadow-card p-4
        - label: text-xs font-semibold text-muted uppercase tracking-wide — "What do you need done?"
        - <textarea className="w-full rounded-xl border border-divider bg-surface p-3 text-sm
            text-foreground resize-none h-28 mt-2 focus:outline-none focus:border-primary"
            placeholder="e.g. My kitchen sink has been leaking for a week…"
            value={text} onChange={e => setText(e.target.value)} />
     c) AI analysis card (only when aiState !== "idle"):
        Outer: bg-foreground rounded-card p-4
        Header row (flex items-center gap-2): 
          <span className="text-xs font-semibold text-primary">✦ AI</span>
          <span className="text-sm text-white/80">
            {aiState === "analyzing" ? "Analyzing your request…" : "Request analyzed"}
          </span>
        When aiState === "analyzing":
          Include the <style> tag for @keyframes nbPulse and .nb-dot classes.
          Show 3 dots: <div className="flex gap-1.5 mt-2">
            <span className="nb-dot w-2 h-2 rounded-full bg-primary/60 inline-block" />
            <span className="nb-dot w-2 h-2 rounded-full bg-primary/60 inline-block" />
            <span className="nb-dot w-2 h-2 rounded-full bg-primary/60 inline-block" />
          </div>
        When aiState === "result":
          Show: <span className="text-xs text-white/60 mt-2 block">Detected category:</span>
                <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5
                  rounded-full mt-1 inline-block">{detectedCategory}</span>
          Then: <GroupSuggestionCard matchedRequest={findMatchingGroup(detectedCategory)}
                  category={detectedCategory} />
     d) Post button:
        <Button variant="primary" className="w-full" disabled={!text.trim() || isPosting}
          onClick={handlePost}>
          {isPosting ? "Posting…" : "Post request"}
        </Button>

   STEP 2 layout (max-w-lg mx-auto px-5 py-6 pb-24 space-y-4):
     a) Check icon + headings (flex flex-col items-center text-center gap-2 py-4):
        - 56×56 circle bg-primary/10: checkmark inline SVG (stroke, text-primary, 28×28)
          Checkmark path: <polyline points="6 12 10 16 18 8" /> (adjust for viewBox 0 0 24 24)
        - <h2 className="text-xl font-bold text-foreground">Request posted!</h2>
        - <p className="text-sm text-muted">{detectedCategory} · Oakwood Heights</p>
     b) Group forming card: bg-foreground rounded-card p-5 text-white
        - <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Group forming</p>
        - <p className="text-base font-semibold mt-1 truncate">{text.slice(0, 40)}{text.length > 40 ? "…" : ""}</p>
        - Neighbor row: <div className="flex items-baseline gap-1 mt-3">
            <span className="text-2xl font-bold">3</span>
            <span className="text-sm text-white/70">of 8 neighbors joined</span>
          </div>
        - Progress bar: <div className="w-full h-1.5 rounded-full bg-white/20 mt-2">
            <div className="h-full rounded-full bg-primary" style={{ width: "37.5%" }} />
          </div>
        - <p className="text-xs text-white/60 mt-2">⏱ 32h 16m remaining</p>
        - <p className="text-xs text-white/60">📍 Oakwood Heights</p>
     c) <Button variant="primary" className="w-full"
          onClick={() => router.push("/app/homeowner/dashboard")}>
          Back to dashboard
        </Button>
     d) <button className="w-full h-12 rounded-xl border border-divider text-sm font-medium
          text-muted bg-card">Invite a neighbor</button>

2. src/components/homeowner/GroupSuggestionCard.tsx
   Props: { matchedRequest: ServiceRequest | null; category: string }
   Import ServiceRequest from "@/types"
   When matchedRequest:
     bg-card rounded-xl p-3 mt-3
     Badge: bg-accent/15 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full — "Nearby group found"
     Title: text-sm font-semibold text-foreground mt-1.5 — matchedRequest.title
     Details: text-xs text-muted — "3 neighbors · {matchedRequest.neighborhood}"
     Budget: text-xs font-medium text-foreground — "${matchedRequest.budgetMin}–${matchedRequest.budgetMax}"
     CTA: text-xs font-semibold text-primary mt-1 block — "Join this group →"
   When !matchedRequest:
     bg-card rounded-xl p-3 mt-3
     Badge: bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full — "Start a new group"
     Body: text-sm text-foreground mt-1.5 — "Be the first in Oakwood Heights to request {category} services."
     CTA: text-xs font-semibold text-primary mt-1 block — "Create group →"

Constraints:
- Do NOT add any npm packages.
- Do NOT add new Tailwind tokens or edit tailwind.config.ts.
- Do NOT modify globals.css — use a scoped <style> JSX tag for the dot animation keyframes.
- Do NOT modify AppBottomNav, layout.tsx, Button.tsx, any mock data, types, services, or cn.ts.
- "use client" on page.tsx only (GroupSuggestionCard can be a server component since it takes no event handlers).

Run `npm run build` at the end. Fix any TypeScript or build errors.
Report: list every file created or modified, full build output, any deviations.
```

## Task Update Log

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/app/app/homeowner/request/page.tsx`, `src/components/homeowner/GroupSuggestionCard.tsx`
- **Build:** Zero errors.
- **Playwright review:** Passed at 375×812. Step 1: form renders correctly, button disabled with empty text, AI card appears on 10+ chars with "✦ AI · Analyzing your request" + detected "Plumbing" category chip + "Nearby group found" suggestion card showing correct mock data. Step 2: checkmark, "Request posted!", "GROUP FORMING" dark navy card with "3 of 8 neighbors joined", progress bar, timer, neighborhood, "Back to dashboard" + "Invite a neighbor" buttons. No tab highlighted in bottom nav.
- **Review file:** `docs/reviews/203-service-request.md`
- **Next task:** Task 204 — Bidding Room, or Task 301 — Provider Dashboard.

### 2026-04-24 — Spec written, delegated to Codex

- **Status:** In Progress
- **Context:** Tasks 201 and 202 completed the full homeowner tab experience. The "+ New request" dashboard CTA routes to `/app/homeowner/request` which 404s. This task builds that route with a two-step mock AI flow.
- **Design decisions:**
  - Two steps in one route (form → posted) via local `useState` — no new routes.
  - AI analysis is fully mock: 1.5s timeout, regex keyword matching.
  - CSS dots animation scoped via JSX `<style>` tag (no globals.css change).
  - `GroupSuggestionCard` uses `mockServiceRequests` to find a matching live/grouping request.
- **Next step:** Playwright review — test typing "plumbing" vs "cleaning", AI state transitions, posting flow, Step 2 card.
