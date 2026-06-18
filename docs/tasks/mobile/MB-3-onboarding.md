# MB-3 — Onboarding Flow

**Status:** Completed
**Depends on:** MB-2 complete and verified

---

## Goal

Build the three-screen onboarding flow: Signup form, Role selector, and
Verify Area. On completion, save the chosen role to AsyncStorage and
navigate to the correct tab group. The flow matches the web design exactly
but uses native inputs, pickers, and transitions.

## Why This Task Comes Now

Onboarding is the entry gate to every other screen. MB-4 through MB-6
all depend on a role being saved and a valid redirect from index.tsx.

---

## Screens

### src/app/(onboarding)/get-started.tsx (Step Controller)

This screen owns the step state (1 | 2 | 3) and renders the correct
step component. It is NOT a navigator — just a single screen with
conditional rendering, identical to the web's get-started/page.tsx.

State:
- `step: 1 | 2 | 3`
- `signup: { fullName, email, password, phone }`
- `role: UserRole` (default: 'homeowner')
- `address: string`
- `radius: number` (1–10)

On step 3 confirm: call `saveRole(role)` then
`router.replace('/(homeowner)')` / `/(provider)` / `/(admin)`.

### Screen 1 — Signup

Layout (ScrollView):
- Vertical center with KeyboardAvoidingView
- Dark navy SurfaceCard logo mark (N, Fraunces italic)
- Fraunces italic "Create account" h1 (24px)
- "Join your neighborhood — it's free" subtext (DM Sans 13px muted)
- Input fields: Full name, Email, Password, Phone
  - Each uses the ui/Input component
  - Password input: secureTextEntry
  - Phone: keyboardType="phone-pad"
- StepDots (current=1)
- "Step 1 of 3" right-aligned label
- Button (amber) "Continue" — disabled until all fields non-empty
- Divider with "or" label
- Google SSO button (TouchableOpacity, white bg, border, Google logo SVG)
- Legal text (DM Sans 11px muted)

### Screen 2 — Role Selector

Layout (ScrollView):
- Back chevron (absolute left)
- Fraunces italic "Choose your role" h1
- "How will you use NeighBid?" subtext
- Three role cards (TouchableOpacity):
  - Homeowner: primary blue badge
  - Service Provider: amber badge
  - HOA Admin: dark navy badge
  - Selected card: 2px amber border + amber "Selected" chip
  - Each card shows title, subtitle, body text
- Benefits section (white bg rounded card):
  - "As a homeowner:" label
  - Three benefit rows with primary/10 check circles
- StepDots (current=2) + "Step 2 of 3"
- Button (amber) "Continue"

### Screen 3 — Verify Area

Layout (ScrollView):
- Back chevron
- Fraunces italic "Your area" h1
- Map placeholder (View, 160px tall, light blue tiled background
  with dot grid pattern using a repeating gradient, centered pin SVG,
  neighborhood label chip top-right)
- Input: "Your address" with HomeIcon prefix
- Community radius: label + animated radius pill + Slider component
  (use @react-native-community/slider)
- Verified status card (green tinted, check icon, "verified 14 months")
- Residency requirement card (amber tinted)
- StepDots (current=3) + "Step 3 of 3"
- Button (amber) "Confirm my area"

---

## Navigation Spec

```
(onboarding)/
  _layout.tsx  → Stack navigator, no header shown
  get-started.tsx → all 3 steps rendered here
```

On finish → `router.replace` to one of:
- `/(homeowner)` → homeowner tab group root
- `/(provider)` → provider tab group root
- `/(admin)` → admin tab group root

---

## Additional Dependency

```
npx expo install @react-native-community/slider
```

---

## Files Codex Creates / Modifies

```
src/app/(onboarding)/
  _layout.tsx            ← Stack with no header
  get-started.tsx        ← Step controller + all 3 steps
```

---

## Acceptance Criteria

1. All three steps render and scroll without clipping on a 390×844 screen
2. Back button on steps 2 and 3 returns to previous step
3. "Continue" on step 1 is disabled until all four fields have text
4. Role cards show amber border on selected, update on tap
5. Slider on step 3 updates the radius value (1–10)
6. Tapping "Confirm my area" on step 3 saves role to AsyncStorage
7. App redirects to the correct tab group after confirm
8. Reopening the app (with role saved) skips onboarding and goes
   directly to the saved role's tab group
9. KeyboardAvoidingView keeps inputs visible above keyboard
10. Zero TypeScript errors

---

## Out of Scope

- No real address geocoding
- No Google OAuth
- No backend API call
- Slider install only — no other new dependencies

---

## Codex Implementation Prompt

```
Implement MB-3 onboarding flow for /neighbid-mobile/.

Build src/app/(onboarding)/get-started.tsx as a single screen
that renders three steps (Signup, Role, VerifyArea) with useState.

Critical requirements:
1. KeyboardAvoidingView on signup step so inputs are not hidden by keyboard
2. Role cards: selected card has 2px amber border (#d97706), amber "Selected"
   chip top-right, amber check icon
3. Slider uses @react-native-community/slider, min=1 max=10 step=1
4. Map placeholder: 160px View with backgroundColor '#e8f0fe' and a
   repeating dot pattern using multiple small absolute Views
5. On finish: await saveRole(role) then router.replace to correct tab group
6. Back button uses router.back() or just decrements the step counter
7. StepDots imported from src/components/ui/StepDots
8. All Inputs use src/components/ui/Input
9. Button uses src/components/ui/Button variant="amber"
10. Zero TypeScript errors, no any
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Task approved by user. Codex invoked via `codex exec --dangerously-bypass-approvals-and-sandbox`.
- 2026-04-25: Codex completed implementation. `_layout.tsx` (Stack, no header) and `get-started.tsx` (3-step flow) created. `@react-native-community/slider` installed. All 10 acceptance criteria verified by Claude review. Zero TypeScript errors. Status: Completed.
