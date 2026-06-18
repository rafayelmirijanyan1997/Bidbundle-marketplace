# NeighBid Mobile — Full Implementation Plan

## Project Context

Convert the existing NeighBid Next.js web app into a native Android app using
React Native + Expo. The mobile app is a separate project at `/neighbid-mobile/`
alongside the existing web app. It shares the same design language, mock data
structure, and TypeScript types, but all UI is rewritten as native React Native
components.

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Expo SDK 51 | Managed workflow, no ejecting needed |
| Routing | Expo Router v3 | File-based, mirrors Next.js App Router mental model |
| Styling | NativeWind v4 | Tailwind className syntax in RN, reduces rewrite cost |
| Fonts | @expo-google-fonts/fraunces + dm-sans | Exact same fonts as web |
| Storage | @react-native-async-storage/async-storage | Replaces localStorage |
| Navigation | Expo Router tabs + stack | Bottom tabs + screen pushes |
| Types | TypeScript throughout | Shared with web types |
| Data | Mock data copied from web src/data/mock/ | No backend in phase 1 |

## Directory Structure (final state)

```
/neighbid-mobile/
├── app.json                        # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── global.css                      # NativeWind base
├── index.ts                        # Expo entry
│
└── src/
    ├── app/                        # Expo Router screens
    │   ├── _layout.tsx             # Root layout (fonts, theme)
    │   ├── index.tsx               # Splash / redirect
    │   │
    │   ├── (onboarding)/           # Onboarding group (no tabs)
    │   │   ├── _layout.tsx
    │   │   ├── get-started.tsx     # Step controller
    │   │   ├── signup.tsx
    │   │   ├── role.tsx
    │   │   └── verify-area.tsx
    │   │
    │   ├── (homeowner)/            # Homeowner tab group
    │   │   ├── _layout.tsx         # Bottom tab navigator
    │   │   ├── index.tsx           # Dashboard
    │   │   ├── chat.tsx
    │   │   ├── bids.tsx
    │   │   └── profile.tsx
    │   │
    │   ├── (provider)/             # Provider tab group
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx           # Dashboard
    │   │   ├── bids.tsx
    │   │   ├── reviews.tsx
    │   │   └── profile.tsx
    │   │
    │   ├── (admin)/                # Admin tab group
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx           # Dashboard
    │   │   ├── community.tsx
    │   │   ├── reports.tsx
    │   │   └── profile.tsx
    │   │
    │   ├── request.tsx             # New request flow (modal)
    │   └── bidding-room.tsx        # Bidding room (modal)
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx            # Light card
    │   │   ├── SurfaceCard.tsx     # Dark navy card
    │   │   ├── Badge.tsx           # Status chips
    │   │   └── StepDots.tsx        # Onboarding progress
    │   │
    │   ├── layout/
    │   │   └── TabBar.tsx          # Custom floating pill tab bar
    │   │
    │   ├── homeowner/
    │   │   ├── UserSummaryCard.tsx
    │   │   ├── AiPromptCard.tsx
    │   │   ├── ServiceRequestCard.tsx
    │   │   ├── BidCard.tsx
    │   │   ├── BidHistoryCard.tsx
    │   │   ├── GroupSuggestionCard.tsx
    │   │   └── RequestFeed.tsx
    │   │
    │   ├── provider/
    │   │   ├── ProviderSummaryCard.tsx
    │   │   ├── JobOpportunityCard.tsx
    │   │   ├── ProviderBidCard.tsx
    │   │   └── ReviewCard.tsx
    │   │
    │   └── admin/
    │       ├── AdminSummaryCard.tsx
    │       ├── ActivityCard.tsx
    │       ├── MemberCard.tsx
    │       └── SavingsBarChart.tsx
    │
    ├── data/
    │   └── mock/                   # Copied from web src/data/mock/
    │       ├── mockServiceRequests.ts
    │       ├── mockBids.ts
    │       ├── mockBiddingRoom.ts
    │       ├── mockBidHistory.ts
    │       ├── mockProviderDashboard.ts
    │       ├── mockProviderBidHistory.ts
    │       ├── mockProviderReviews.ts
    │       └── mockAdminDashboard.ts
    │
    ├── types/
    │   └── index.ts                # Copied from web src/types/
    │
    ├── utils/
    │   └── onboardingState.ts      # AsyncStorage version
    │
    └── theme/
        ├── colors.ts               # CSS var equivalents as JS constants
        ├── typography.ts           # Font families, sizes, weights
        └── spacing.ts              # Spacing scale
```

---

## Task Sequence

### MB-1 — Project Scaffold & Foundation
**Status:** Pending
**Depends on:** Nothing

Sets up the entire Expo project, installs all dependencies, configures
NativeWind, Expo Router, Google Fonts, TypeScript, and theme constants.
Also copies mock data and types from the web project. Ends with a single
working screen showing fonts and colors are live.

---

### MB-2 — UI Primitives & Tab Navigator
**Status:** Pending
**Depends on:** MB-1

Builds all shared UI building blocks: Button, Input, Card, SurfaceCard,
Badge, StepDots, and the custom floating pill TabBar component. These
are used by every screen in MB-3 through MB-6. No screens yet — just
the component library with a Storybook-style showcase screen to verify
each primitive.

---

### MB-3 — Onboarding Flow
**Status:** Pending
**Depends on:** MB-2

Three-screen onboarding stack: Signup form, Role selector, Verify area.
Saves role to AsyncStorage. Redirects to the correct tab group on finish.
Matches the web design exactly: Fraunces italic headline, step dots, dark
surface icon, amber CTA.

---

### MB-4 — Homeowner Experience
**Status:** Pending
**Depends on:** MB-2, MB-3

All four homeowner tabs (Dashboard, Chat, Bids, Profile) plus the two
full-screen flows pushed on top (New Request with AI detection, Bidding
Room with accept/confirm/confirmed states). This is the deepest task —
it covers the entire primary user journey.

---

### MB-5 — Provider Experience
**Status:** Pending
**Depends on:** MB-2, MB-3

All four provider tabs (Dashboard, Bids, Reviews, Profile). The Submit Bid
interaction (loading → submitted state) and Notify Me toggle are
implemented. Matches web provider screens.

---

### MB-6 — Admin Experience
**Status:** Pending
**Depends on:** MB-2, MB-3

All four admin tabs (Dashboard, Community, Reports, Profile). The
Approve/Decline inline action on MemberCard is implemented. The
SavingsBarChart is a native progress-bar implementation (no SVG library
needed). The Review Eligibility link from the dashboard navigates to
the Community tab.

---

## Acceptance Criteria (applies to all tasks)

1. `npx expo start` runs without errors
2. All screens visible on Android emulator or Expo Go on a physical device
3. No TypeScript errors (`tsc --noEmit` passes)
4. Floating pill tab bar renders correctly with active state highlight
5. Fraunces and DM Sans fonts load (no fallback rendering on first frame)
6. Dark navy surface cards render with visible grain texture
7. All interactive buttons produce a visual response (press state)
8. No dead buttons — every tappable element either navigates, changes
   state, or shows a meaningful response

## Task Update Log

- 2026-04-25: Plan created. MB-1 through MB-6 defined. Ready for MB-1 approval.
