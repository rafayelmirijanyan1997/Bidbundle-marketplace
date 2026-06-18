# MB-2 — UI Primitives & Tab Navigator

**Status:** Completed
**Depends on:** MB-1 complete and verified

---

## Goal

Build the complete shared component library and the custom floating pill
tab navigator. Every screen in MB-3 through MB-6 uses these primitives.
No screens are built yet — this task ends with a showcase screen that
renders every component so Claude can visually verify them before any
real screens are built.

## Why This Task Comes Now

Getting primitives right before screens prevents rework. If Button,
SurfaceCard, or TabBar have issues, fixing them in one place is far
cheaper than fixing them across 15 screens.

---

## Components to Build

### src/components/ui/Button.tsx

Props: `variant` (primary | secondary | amber | ghost | danger),
`size` (md | sm), `onPress`, `disabled`, `loading`, `children`

Visual specs:
- `primary`: bg-primary, white text, rounded-xl, h-12, font-sans-semibold
- `amber`: bg-accent, white text — used as the main CTA
- `secondary`: bg-card, border border-divider, fg text
- `ghost`: transparent, primary text
- `danger`: bg-red-50, red-600 text
- All variants: `activeOpacity={0.82}`, scale press animation via
  Animated.spring (scale to 0.975 on press, back to 1 on release)
- `disabled`: opacity 0.4, no press response
- `loading`: shows ActivityIndicator in place of children

### src/components/ui/Input.tsx

Props: `label`, `error`, `hint`, `prefixIcon`, all TextInput props

Visual specs:
- Label: 13px DMSans_600SemiBold, color fg/80
- Container: h-12, rounded-[10px], border border-divider, bg-card
- Focus state: border-primary + blue ring (2px shadow with primary/15)
- Error state: border-red-400
- Placeholder: muted/50 color
- Implemented with `useState` for focus tracking

### src/components/ui/Card.tsx

Props: `children`, `onPress?`, `style?`

- White background, rounded-[14px], shadow-card
- If `onPress` provided: wraps in TouchableOpacity with
  `activeOpacity={0.97}` and slightly elevated shadow on press

### src/components/ui/SurfaceCard.tsx

Props: `children`, `style?`

Dark navy card (`#152033`) with:
- Subtle noise grain overlay using a semi-transparent PNG pattern tile
  (create a 64x64 tileable noise asset at `assets/grain.png` or use
  a base64-encoded inline ImageBackground)
- Border radius 14px
- Deep shadow: `{ shadowColor: '#152033', shadowOffset: {0,8},
  shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 }`

### src/components/ui/Badge.tsx

Props: `label`, `variant` (live | grouping | draft | verified |
pending | ineligible | success | amber | primary)

Each variant maps to a background/text color pair. Rounded-full,
11px text, horizontal padding 8px, vertical 3px.

### src/components/ui/StepDots.tsx

Props: `total`, `current`

Renders animated step indicator. Current step = wide pill (20px wide,
8px tall, primary color). Past steps = small circle (8px, primary/40).
Future steps = small circle (8px, divider). Width animates with
Animated.spring.

### src/components/layout/TabBar.tsx

Custom tab bar component passed as `tabBar` prop to Expo Router's
`<Tabs>` navigator.

Visual specs:
- Floating pill: `position: 'absolute'`, bottom: 12, left: 12, right: 12
- Height: 62px
- Background: white 88% opacity + `BlurView` from `expo-blur`
  (intensity: 40, tint: 'light')
- Border: 1px solid divider
- Border radius: 18px
- Shadow: `{ shadowColor: '#1a1714', shadowOffset: {0,8},
  shadowOpacity: 0.14, shadowRadius: 24, elevation: 10 }`
- Each tab: flex:1, column layout, icon + label
- Active tab icon: wrapped in dark navy rounded rect (36x32, 
  borderRadius 10, bg surface), white icon color
- Active tab label: surface color, 10px DMSans_600SemiBold
- Inactive: muted/70 color, no background behind icon

Tab icons (inline SVG paths via react-native-svg):
- Home, Chat, Bids (document), Reviews (star), Community (people),
  Reports (bar chart), Profile (person)

### src/components/ui/Divider.tsx

A gradient-fade horizontal divider — transparent → white/10 → transparent.
Used inside SurfaceCard to separate header from stats. Implemented with
a LinearGradient (expo-linear-gradient).

---

## Showcase Screen

**src/app/(onboarding)/get-started.tsx** (replaces the MB-1 placeholder)

A vertical scroll showing:
1. SurfaceCard with user initials, Fraunces italic stats (2 / $310 / 14)
2. Card with a ServiceRequest row
3. All Button variants in a column
4. Input fields (empty, focused, error states)
5. Badge variants grid
6. StepDots at step 1, 2, 3 (three rows)
7. Color swatch row

---

## Files Codex Creates

```
src/components/
  ui/
    Button.tsx
    Input.tsx
    Card.tsx
    SurfaceCard.tsx
    Badge.tsx
    StepDots.tsx
    Divider.tsx
  layout/
    TabBar.tsx
assets/
  grain.png               ← 64x64 tileable noise texture
```

Also installs:
```
npx expo install expo-blur expo-linear-gradient react-native-svg
```

---

## Acceptance Criteria

1. Showcase screen renders all components without errors
2. SurfaceCard shows dark navy background with visible grain overlay
3. TabBar renders as a floating pill with blur — not a flat bar
4. Active tab has dark navy pill behind icon, inactive tabs are gray
5. Button press animation is visible (scale down on press)
6. Input shows blue ring on focus
7. StepDots animate when current prop changes
8. All fonts render correctly (Fraunces italic for display text,
   DM Sans for labels and body)
9. Zero TypeScript errors

---

## Out of Scope

- No role-specific tab sets yet (TabBar takes generic tabs in MB-2)
- No navigation between real screens
- No mock data rendered (placeholder data only in showcase)

---

## Codex Implementation Prompt

```
Implement MB-2 UI primitives for the NeighBid Expo project at /neighbid-mobile/.
Build every component exactly as specified in the MB-2 task spec.

Critical requirements:
1. Button: use Animated.spring for press scale (0.975), all 5 variants
2. SurfaceCard: dark navy #152033 with tileable grain texture overlay
   using ImageBackground with a semi-transparent grain asset
3. TabBar: floating pill using expo-blur BlurView, absolute positioning
   12px from bottom, active tab has dark navy rounded rect behind icon
4. Input: controlled focus state with useState, primary border + ring on focus
5. StepDots: Animated.spring width transition for current step pill
6. All components TypeScript, all props typed, no `any`
7. Install expo-blur, expo-linear-gradient, react-native-svg

Replace the MB-1 verification placeholder at
src/app/(onboarding)/get-started.tsx with the component showcase screen.
The showcase must render all components so they can be visually verified.
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Task approved by user. Status: Approved → In Progress. Codex invoked via `codex exec --dangerously-bypass-approvals-and-sandbox`.
- 2026-04-25: Codex completed implementation. All 8 component files created, grain.png added, expo-blur/expo-linear-gradient/react-native-svg installed. Showcase screen replaced MB-1 placeholder at `src/app/(onboarding)/get-started.tsx`. Zero TypeScript errors. All 9 acceptance criteria verified by Claude review. Status: Completed.
