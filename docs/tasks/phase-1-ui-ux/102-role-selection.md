# Task 102 — Sign up / Role Selection / Area Verification

**Status:** Completed

## Owner

Codex, after Claude approval.

## Goal

Build `/get-started` as a single-route, three-step onboarding flow that matches `docs/design-reference/image.png` screens 2–4 ("Sign up", "Choose role", "Verify area") on mobile, and scales cleanly on desktop. After the user completes all three steps, persist the selected role to mock/local state and route them to the role-appropriate placeholder destination.

## Why This Task Comes Now

Task 101 (Landing Page) was accepted on 2026-04-24. All three CTAs on `/` currently link to `/get-started`, which 404s. `/get-started` is the only gap between the public landing page and the Phase 2 homeowner flow (Task 201). Decision log 001 approved a **single** `/get-started` route with role stored in mock/local state — no real auth in Phase 1. The binding visual reference is `docs/design-reference/image.png` (screens 2, 3, 4).

## User-Facing Behavior

A visitor navigating to `/get-started` sees a three-step onboarding flow.

**Step 1 — Create account (mock):** form with Full name, Email, Password, Phone fields; primary "Continue" button; "or" divider; secondary "Continue with Google" button (no-op placeholder); fine-print terms text at the bottom.

**Step 2 — Choose role:** three role cards (Homeowner / Service Provider / HOA Admin) with an "As a {role}:" benefits bullet list below the cards that updates with the selected role; "Step 2 of 3" indicator; "Continue" button.

**Step 3 — Verify area:** mock map placeholder (dot-grid with blue target, no real map), pre-filled address field, community radius slider, orange "Residency requirement" notice card, green "You qualify" success card, "Step 3 of 3" indicator, "Confirm my area" button.

On completing Step 3, the selected role is saved to `localStorage` and the user is routed to:

- Homeowner → `/app/homeowner/dashboard`
- Service Provider → `/app/provider/jobs`
- HOA Admin → `/app/admin/dashboard`

All three destinations will 404 until Tasks 201+. Expected for Phase 1.

Back chevron on Steps 2 and 3 returns to the prior step without losing entered values.

## Pages / Components Involved

- `src/app/get-started/page.tsx` — new — client component that orchestrates the three-step flow (step state, form state, role state, routing on complete)
- `src/components/onboarding/SignupStep.tsx` — new — Step 1 UI
- `src/components/onboarding/RoleStep.tsx` — new — Step 2 UI
- `src/components/onboarding/VerifyAreaStep.tsx` — new — Step 3 UI
- `src/components/ui/Input.tsx` — new — minimal labeled text input primitive (second `ui/` primitive after `Button`)
- `src/utils/onboardingState.ts` — new — `UserRole` type + small `saveRole` / `getRole` localStorage helpers

The existing `Navbar` is rendered only inside `src/app/page.tsx` (confirmed). `AppShell` is just a canvas-background wrapper, so `/get-started` will naturally not render a navbar. Do not touch `AppShell` or `Navbar`.

## Files Likely to Inspect

- `CLAUDE.md`
- `docs/tasks/phase-1-ui-ux/102-role-selection.md` (this file)
- `docs/01-design-ux/design-direction.md`
- `docs/01-design-ux/claude-proposed-sitemap.md`
- `docs/decision-log/001-initial-ux-direction.md`
- `docs/design-reference/image.png` — **binding visual reference: screens 2 ("Sign up"), 3 ("Choose role"), 4 ("Verify area")**
- `src/components/ui/Button.tsx` — reuse, do not modify
- `src/app/layout.tsx`, `src/app/page.tsx` — to confirm layout conventions
- `tailwind.config.ts` — confirm available tokens before adding any styles

## Files Likely to Modify / Create

```
src/app/get-started/page.tsx                    (create)
src/components/onboarding/SignupStep.tsx        (create)
src/components/onboarding/RoleStep.tsx          (create)
src/components/onboarding/VerifyAreaStep.tsx    (create)
src/components/ui/Input.tsx                     (create)
src/utils/onboardingState.ts                    (create)
```

Do not modify anything else. Do not touch `AppShell.tsx`, `BottomNav.tsx`, `Navbar.tsx`, `Button.tsx`, `layout.tsx`, mock data, services, types, `cn.ts`, `globals.css`, or any config files.

## Step 1 — Sign up (mobile 375px reference)

Match `image.png` screen 2 as closely as reasonable:

1. **Header:** small back chevron on the left (disabled/hidden on Step 1 since it's the entry); centered bold "Create account" heading (~`text-2xl`); muted subtitle "Join your neighborhood" below.
2. **Form:** single column of labeled inputs, each rendered via the new `<Input>` primitive (white card-style, `h-12`, `rounded-xl`, `border-divider`):
   - Full name — placeholder `Lance Dsilva`, `type="text"`
   - Email — placeholder `lance@email.com`, `type="email"`
   - Password — obscured dots, `type="password"`
   - Phone — placeholder `+1 (215) 555-0192`, `type="tel"`
3. **Primary CTA:** full-width blue "Continue" button (`<Button variant="primary">`), enabled only when all four fields are non-empty. No deeper validation.
4. **Divider:** centered thin "or" divider line between Continue and the Google button.
5. **Secondary CTA:** "Continue with Google" — outlined card-style button with a Google "G" mark. Render the `G` as a simple inline SVG or a single-letter glyph styled in Google's brand blue. Do NOT add any icon library. Clicking it is a no-op (no form advance).
6. **Terms text:** two-line fine-print at the bottom, muted small text: "By continuing, you agree to the Terms of Service and Privacy Policy. NeighBid is a neighborhood bid comparison tool."

No real authentication. Google button is a visual placeholder only.

## Step 2 — Choose role (mobile 375px reference)

Match `image.png` screen 3 (extended to three cards):

1. **Header:** `<` back chevron (returns to Step 1, preserving values); centered "Choose your role" heading; muted subtitle "How will you use NeighBid?".
2. **Role cards:** three vertically-stacked card buttons (full-width, `bg-card`, `rounded-card`, `shadow-card`, `p-4`). Each card contains:
   - **Icon tile** on the left (40×40, `rounded-xl`, bold white single letter):
     - Homeowner — `H` on `bg-primary`
     - Service Provider — `P` on `bg-accent`
     - HOA Admin — `A` on `bg-foreground`
   - **Title + one-line subtitle** to the right:
     - Homeowner — "I want to book services" / short body: "Join community bids, get group pricing discounts on home services."
     - Service Provider — "I provide services" / short body: "Get bulk job alerts, bid competitively, grow your business."
     - HOA Admin — "I manage a community" / short body: "Oversee participation, approve eligibility, track savings."
   - **Selected state:** card has `border-2 border-primary` plus a blue `SELECTED` pill with a check icon in the top-right corner.
   - **Unselected state:** `border border-divider`, no pill.
3. **Default selection:** Homeowner. Only one role can be selected at a time (radio-group behavior). Cards are keyboard-focusable buttons.
4. **Benefits list:** below the cards, an "As a {role}:" compact section with three checkmark bullets that swaps based on selection:
   - Homeowner:
     - Join the neighborhood bids
     - Track bookings end-to-end
     - Chat with verified neighbors
   - Service Provider:
     - Get alerts on new group jobs
     - Bid competitively to win more work
     - Build reputation with real reviews
   - HOA Admin:
     - Oversee community participation
     - Approve homeowner eligibility
     - Track savings and analytics
5. **Step indicator:** small muted text near the bottom: `Step 2 of 3`, centered.
6. **Primary CTA:** full-width blue "Continue" button.

## Step 3 — Verify area (mobile 375px reference)

Match `image.png` screen 4:

1. **Header:** `<` back chevron (returns to Step 2); centered "Verify your area" heading; muted subtitle "Confirm your location".
2. **Mock map placeholder:** a `rounded-card` panel (~`h-[180px]`) with:
   - Soft dot-grid background (CSS `background-image: radial-gradient(...)` or a simple inline SVG tile)
   - A blue target/pin centered (concentric circles; implement with inline SVG — no libraries)
   - Subtle muted border
3. **Address field:** labeled "Your address"; pre-filled value `123 Maple St, Oakwood Heights`. Editable but not validated. Render via the `<Input>` primitive with an inline home-icon SVG prefix.
4. **Community radius slider:** labeled "Community radius" on the left, value `6 miles` on the right. Native `<input type="range" min="1" max="10" step="1">` defaulting to `6`. Styled to match the neutral surface; value updates live as the slider moves.
5. **Orange residency notice card** (`bg-accent/10 border border-accent/40 rounded-card p-3`):
   - Title: "Residency requirement"
   - Body: "Must have lived 6+ months to join group bids"
6. **Green "You qualify" success card** (always rendered for the mock):
   - Title: "You qualify — verified 14 months"
   - Body: "USPS address verified · HOA member"
   - **Styling exception:** since no `success` / green token exists in `tailwind.config.ts`, use `bg-emerald-50 border border-emerald-200 text-emerald-900` (Tailwind default palette). Keep this usage **local to `VerifyAreaStep.tsx`** — do NOT add a new theme token.
7. **Step indicator:** small muted text near the bottom: `Step 3 of 3`, centered.
8. **Primary CTA:** full-width blue "Confirm my area" button that on click:
   1. Calls `saveRole(role)` from `src/utils/onboardingState.ts`
   2. Calls `router.push(...)` to the role-appropriate destination

## Desktop Adaptation (1280px+)

Reuse the same composition, centered in a `max-w-md` container on the `bg-canvas` background with `py-12` top/bottom whitespace. No separate desktop-only layout. The onboarding flow should feel like a focused phone-width card on desktop — mirroring how Task 101's splash is centered on desktop.

The global `AppShell` (from `src/app/layout.tsx`) already provides `bg-canvas` and `min-h-screen`, so Codex only needs to wrap the page content in a `max-w-md mx-auto px-5` container.

No navbar on `/get-started` — the existing Navbar is scoped to `/` only (rendered inside `src/app/page.tsx`, not `layout.tsx`).

## Role-Based Routing

After "Confirm my area":

```
Homeowner        → /app/homeowner/dashboard   (expected 404 until Task 201)
Service Provider → /app/provider/jobs         (expected 404 until Task 301)
HOA Admin        → /app/admin/dashboard       (expected 404 until Task 401)
```

Use `next/navigation`'s `useRouter().push(...)`. Use `next/link` only for back-chevron nav (if any); step-to-step nav stays internal to the page via local state.

## State Management

`src/utils/onboardingState.ts` exports:

```ts
export type UserRole = "homeowner" | "provider" | "admin";
export function saveRole(role: UserRole): void;  // writes to localStorage under "neighbid.role"
export function getRole(): UserRole | null;      // reads from localStorage; returns null if unset or unavailable
```

Both functions must be SSR-safe: guard `typeof window` before touching `localStorage`.

Within `/get-started/page.tsx`, manage with local `useState`:

- `step: 1 | 2 | 3` (default 1)
- `signup: { fullName, email, password, phone }` (default empty strings)
- `role: UserRole` (default `"homeowner"`)
- `address: string` (default `"123 Maple St, Oakwood Heights"`)
- `radius: number` (default `6`)

`page.tsx` and each step component should begin with `"use client"` since they use hooks and the router.

No React Context, no state management library, no form library.

## Responsive Design Requirements

- No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- Outer container: `max-w-md mx-auto px-5` on all breakpoints; add `py-12` on desktop.
- Inputs are at least `h-12` on mobile (touch-friendly).
- Role cards stack vertically on all breakpoints.
- Use only the existing theme tokens (`canvas`, `surface`, `primary`, `accent`, `card`, `divider`, `muted`, `foreground`, `rounded-card`, `shadow-card`). Only exception: the green "You qualify" card uses Tailwind default `emerald-50/200/900` as described above. Do NOT introduce new theme tokens or edit `tailwind.config.ts`.

## AI / Database Placeholder Requirements

None. This is a mock onboarding flow. No service calls. The Google sign-in button is a visual placeholder only.

## Acceptance Criteria

- [ ] `npm run build` passes with zero errors.
- [ ] `/get-started` renders without 404 and shows Step 1 by default.
- [ ] Step 1 matches `image.png` screen 2: header, four labeled inputs, Continue, "or" divider, Google button, terms text.
- [ ] Step 1 "Continue" is disabled while any of the four fields is empty, enabled when all four have non-empty values.
- [ ] Step 2 matches `image.png` screen 3 extended to three cards: three role cards, Homeowner selected by default, "As a {role}:" benefits bullets update as selection changes, `Step 2 of 3` indicator, "Continue" CTA.
- [ ] Only one role can be selected at a time; selected card has blue border and "SELECTED" pill.
- [ ] Step 3 matches `image.png` screen 4: header, mock map with blue target on dot-grid, address field (pre-filled), community radius slider (default `6`, value shown on the right), orange residency notice card, green "You qualify" card, `Step 3 of 3` indicator, "Confirm my area" CTA.
- [ ] Clicking "Confirm my area" writes the selected role to `localStorage` under `neighbid.role` and routes to the role-appropriate destination.
- [ ] Back chevron on Steps 2 and 3 returns to the prior step without losing entered values.
- [ ] No horizontal scroll at 375 / 768 / 1024 / 1280 px.
- [ ] All colors, radii, and shadows come from existing theme tokens, **except** the green success card which may use `emerald-50 / emerald-200 / emerald-900` local to `VerifyAreaStep.tsx`.
- [ ] No new theme tokens added to `tailwind.config.ts`.
- [ ] No new libraries added to `package.json`.
- [ ] No console errors beyond the existing `favicon.ico` 404 and the expected 404 after final navigation.
- [ ] TypeScript: zero errors. No `any`, no `@ts-ignore`.
- [ ] Landing page (`/`) still renders correctly; its CTAs still route to `/get-started` and now land on Step 1 (not 404).

## Test Steps

1. `npm run build` — zero errors.
2. `npm run dev` — open `http://localhost:3000/get-started`.
3. At 375×812: confirm Step 1 matches `image.png` screen 2 (header, four inputs, Continue, "or" divider, Google button, terms).
4. Confirm Continue is disabled with empty fields; fill all four → Continue enables. Click → Step 2 renders (matches screen 3 extended).
5. Default role is Homeowner. Click "Service Provider" → benefits bullets swap; click "HOA Admin" → bullets swap; click Homeowner → back to default.
6. Click Continue → Step 3 renders (matches screen 4). Confirm mock map, address pre-fill, slider default `6`, orange and green cards.
7. Move slider → `N miles` value updates live.
8. Click back chevron → Step 2 still has the previously selected role. Click back again → Step 1 still has the previously entered form values.
9. Advance to Step 3, click "Confirm my area" → routes to `/app/homeowner/dashboard` (404 expected). Open DevTools → `localStorage['neighbid.role']` equals `homeowner`.
10. Navigate back to `/get-started`, change role to Service Provider, complete flow → routes to `/app/provider/jobs`, localStorage value updates to `provider`.
11. Repeat for HOA Admin → routes to `/app/admin/dashboard`, localStorage value is `admin`.
12. Resize to 1280×800: flow is centered in a narrow (`max-w-md`) column with generous vertical whitespace, on the canvas background, no navbar.
13. Navigate back to `/` → landing page still renders correctly, all three CTAs still route to `/get-started` → Step 1.
14. DevTools console during the full flow: only the known `favicon.ico` 404 and the final destination 404. No hydration, runtime, or Tailwind warnings.

## Out of Scope

- Real authentication, signup persistence, session management (Phase 6)
- Real password strength meters, email verification, SMS code verification
- Real Google OAuth (button is a visual placeholder; clicking is a no-op)
- Real map library (map is a CSS/SVG mock)
- Real address autocomplete or geocoding
- Form validation beyond non-empty required-field enablement
- Animations between steps (cross-fades, slide-ins, etc.)
- Server-side persistence or API calls
- Building `/app/homeowner/dashboard`, `/app/provider/jobs`, or `/app/admin/dashboard` — those remain 404 until Phase 2/3 tasks
- Any new theme tokens or global CSS changes
- Any new dependencies
- Any additional `ui/` primitives beyond `Input.tsx`
- Editing `Button.tsx`, `Navbar.tsx`, `AppShell.tsx`, or `layout.tsx`
- Adding a favicon (deferred; can ship with a later polish pass)

## Codex Implementation Prompt

```
Read CLAUDE.md, then docs/tasks/phase-1-ui-ux/102-role-selection.md (this file),
then docs/01-design-ux/design-direction.md, docs/decision-log/001-initial-ux-direction.md,
and the screenshot docs/design-reference/image.png — screens 2 ("Sign up"), 3 ("Choose role"),
and 4 ("Verify area") are the binding visual references.

Also read src/app/layout.tsx, src/app/page.tsx, src/components/ui/Button.tsx, and
tailwind.config.ts before starting, so you understand existing conventions and tokens.

Build the /get-started three-step onboarding flow. Touch ONLY these files:

CREATE:
- src/app/get-started/page.tsx                 (client component; orchestrates steps 1-3)
- src/components/onboarding/SignupStep.tsx     (Step 1)
- src/components/onboarding/RoleStep.tsx       (Step 2)
- src/components/onboarding/VerifyAreaStep.tsx (Step 3)
- src/components/ui/Input.tsx                  (minimal labeled text input primitive)
- src/utils/onboardingState.ts                 (UserRole type + SSR-safe localStorage helpers)

Key constraints:

1. Mobile (375px) must match docs/design-reference/image.png screens 2, 3, 4 closely.
   See the Step 1 / Step 2 / Step 3 sections of the task spec for binding details.

2. Desktop (1280px+): same composition, centered in a max-w-md container with py-12
   vertical whitespace. No separate desktop layout. No navbar on /get-started (Navbar is
   rendered inside src/app/page.tsx only, not in layout.tsx).

3. Theme tokens only. The ONE allowed exception is the green "You qualify" card, which
   may use Tailwind default emerald-50 / emerald-200 / emerald-900 — keep that usage
   local to VerifyAreaStep.tsx. Do NOT add tokens to tailwind.config.ts.

4. Reuse src/components/ui/Button.tsx (primary + secondary variants). Do NOT modify it.

5. Input primitive: labeled white card-style input (label on top, input below), supports
   text / email / password / tel types, full-width, h-12, rounded-xl, border border-divider,
   focus:border-primary. Accept a prefixIcon prop (ReactNode) used on Step 3's address field.
   Minimal — no advanced validation UI.

6. State: useState within page.tsx for step (1|2|3), signup form (fullName/email/password/phone),
   role (default "homeowner"), address (default "123 Maple St, Oakwood Heights"), radius (6).
   Role is persisted to localStorage ONLY when "Confirm my area" is clicked on Step 3.

7. onboardingState.ts exports:
     export type UserRole = "homeowner" | "provider" | "admin";
     export function saveRole(role: UserRole): void;
     export function getRole(): UserRole | null;
   Both must guard `typeof window !== "undefined"` before touching localStorage.
   Storage key: "neighbid.role".

8. Step 3 "Confirm my area" calls saveRole(role), then router.push() to:
     homeowner  → /app/homeowner/dashboard
     provider   → /app/provider/jobs
     admin      → /app/admin/dashboard
   All three will 404 — that is expected for Phase 1.

9. Back chevron on Steps 2 and 3 decrements local step state — do NOT use router.back()
   (that would leave the route entirely). Form state must be preserved across back/forward
   within the flow.

10. Do NOT introduce any new libraries (no icons lib, no map lib, no form lib, no class-variance
    helper, no radix). Use Tailwind, native inputs, inline SVG only.

11. Do NOT edit layout.tsx, Navbar.tsx, BottomNav.tsx, AppShell.tsx, Button.tsx, globals.css,
    tailwind.config.ts, tsconfig.json, mock data, services, types, or cn.ts.

12. All step components and page.tsx begin with "use client" (they use hooks + router).

13. Accessibility baseline: role cards are <button> elements with aria-pressed; radius slider
    has an associated <label>; address input has a visible label; back chevron is a <button>
    with aria-label="Back". No ARIA beyond what's natural.

14. Run `npm run build` at the end. Fix any TypeScript or build errors.

15. Verify that after your changes, the landing page / still renders correctly and its CTAs
    still route to /get-started, landing on Step 1 (not 404).

Do not add real auth, Google OAuth, AI, database, animations, map libraries, or additional
pages.
```

## Task Update Log

### 2026-04-24 — Detailed spec written after high-level approval

- **Status:** Pending
- **Context:** Task 101 was accepted today. The 101 review explicitly recommended proceeding to Task 102. The user approved the high-level plan for Task 102 (a three-step `/get-started` onboarding: signup + role + area verification). The prior skeletal spec in this file (role selection only, no acceptance detail, no Codex prompt) has been fully replaced with a screenshot-faithful three-step spec modeled on `docs/design-reference/image.png` screens 2–4.
- **Design decisions reflected in the spec:**
  - Single `/get-started` route orchestrates all three steps via client-side step state — consistent with decision log 001 ("Single `/get-started` route for role selection").
  - Three roles (Homeowner / Service Provider / HOA Admin). The reference screenshot only shows Homeowner + Service Provider; HOA Admin follows the same card pattern with a neutral-dark icon tile.
  - No real auth, map, or OAuth. All three are mock/placeholder.
  - Role persists to `localStorage` under `neighbid.role` via a small SSR-safe utility.
  - Back navigation preserves form state (it's local state within a single route, not `router.back()`).
  - Only one new `ui/` primitive (`Input.tsx`) beyond the Task 101 `Button`. No new libraries.
- **Next step:** Final user confirmation of this detailed spec, then delegate implementation to Codex.
- **Review plan:** After Codex finishes, run `npm run build`, then a Playwright pass at 375×812, 768×800, and 1280×800. Verify each step matches the binding screenshot, back navigation preserves state, `neighbid.role` is written on Step 3 completion, role-based routing lands on the correct 404ing placeholder, and the landing page (`/`) is unaffected.

### 2026-04-24 — Completed and accepted

- **Status:** Completed
- **Files created:** `src/app/get-started/page.tsx`, `src/components/onboarding/SignupStep.tsx`, `src/components/onboarding/RoleStep.tsx`, `src/components/onboarding/VerifyAreaStep.tsx`, `src/components/ui/Input.tsx`
- **Build:** `npm run build` passed zero errors. 8 static pages generated including `/get-started`.
- **Playwright review:** Passed at 375×812 (mobile) and 1280×800 (desktop).
  - Step 1: form renders correctly, Continue disabled when fields empty, enables on fill, Google button present, terms text present.
  - Step 2: three role cards, Homeowner selected by default with blue border + SELECTED pill, benefits list updates, Step 2 of 3 indicator.
  - Step 3: mock map with blue target on dot-grid, address pre-filled, slider at 6 miles, orange residency card, green qualify card, Step 3 of 3, Confirm my area CTA.
  - Desktop: centered max-w-md column, no bottom nav, canvas background.
  - No horizontal scroll at either viewport.
- **Review file:** `docs/reviews/102-role-selection.md`
- **Next task:** Task 201 — Homeowner Dashboard.

### 2026-04-24 — Approved, delegating to Codex

- **Status:** In Progress
- **Context:** User approved the rewritten spec. Handing implementation to Codex via the codex-rescue subagent with instructions to follow the spec's "Codex Implementation Prompt" section verbatim and report back with files created, build output, and any deviations.
- **Review plan unchanged:** `npm run build` + Playwright at 375 / 768 / 1280; verify step-by-step screenshot fidelity, state preservation across back nav, `localStorage["neighbid.role"]` persistence, role-based routing, and that the landing page is unaffected.
