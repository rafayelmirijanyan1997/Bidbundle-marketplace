# MB-5 — Provider Experience

**Status:** Completed
**Depends on:** MB-2 and MB-3 complete (MB-4 not required)

---

## Goal

Build the complete service provider flow: four bottom tabs (Dashboard,
Bids, Reviews, Profile) with working Submit Bid and Notify Me interactions.

---

## Tab Group Setup

**src/app/(provider)/_layout.tsx**

```tsx
<Tabs tabBar={(props) => <TabBar {...props} role="provider" />}>
  <Tabs.Screen name="index"   options={{ title: 'Home' }} />
  <Tabs.Screen name="bids"    options={{ title: 'Bids' }} />
  <Tabs.Screen name="reviews" options={{ title: 'Reviews' }} />
  <Tabs.Screen name="profile" options={{ title: 'Me' }} />
</Tabs>
```

TabBar icons: Home, Bids (document), Reviews (star), Me (person)

---

## Screens

### src/app/(provider)/index.tsx — Dashboard

ScrollView, paddingBottom 88.

Sections:
1. **ProviderSummaryCard** — SurfaceCard: initials avatar, business name,
   VERIFIED badge, tagline, stat row (Revenue / Jobs / Rating in Fraunces italic)
2. **"Available jobs" header** with animated orange pulse dot + LIVE badge
3. **JobOpportunityCard list** from mockJobOpportunities:

   **Live card** (status === 'live'):
   - Job title, neighbor count, neighborhood, budget range (Fraunces italic)
   - "LIVE" amber chip top-right
   - "Submit bid →" amber Button
   - Press: 700ms loading ("Submitting…") → green success state
     "✓ Bid submitted!" with green bg (stays shown, button disappears)

   **Upcoming card** (status !== 'live'):
   - "UPCOMING" muted chip
   - Countdown text
   - "Notify me when bidding opens" button (amber outline style)
   - Press: toggles to "✓ You'll be notified" (success green state, stays)

### src/app/(provider)/bids.tsx — My Bids

FlatList with ListHeaderComponent:
- "My bids" Fraunces italic heading
- "5 bids · $5,605 total" subtext
- Filter chips: All / Active / Won / Past

ProviderBidCard per item:
- Category initial tile (colored bg based on status)
- Title + neighborhood + status badge
- Amount (Fraunces italic) + date
- Won: emerald badge; Active: amber badge; Lost: red-50 badge

Empty state card when filter yields no results.

### src/app/(provider)/reviews.tsx — Reviews

ScrollView, paddingBottom 88.

Header card:
- Large rating number (Fraunces italic, 40px)
- 5-star row (svg stars, filled/unfilled)
- "{N} reviews" subtext

ReviewCard list:
- Colored avatar (letter initial, color derived from initial)
- Reviewer name + date
- Star row (proper SVG stars)
- Review text body (DM Sans, muted)

### src/app/(provider)/profile.tsx — Profile

ScrollView.

Sections:
1. SurfaceCard: avatar, name, VERIFIED badge, tagline, review count
2. Stats row: Earnings / Win rate / Rating
3. Settings list (same pattern as homeowner profile)
4. Sign out button → clears AsyncStorage, router.replace to onboarding

---

## Components Created

```
src/components/provider/
  ProviderSummaryCard.tsx
  JobOpportunityCard.tsx
  ProviderBidCard.tsx
  ReviewCard.tsx
```

---

## Acceptance Criteria

1. All four provider tabs render from their tabs
2. ProviderSummaryCard shows grain-textured dark card
3. "Submit bid" on live jobs: loading → green success state
4. "Notify me" on upcoming jobs: toggles to confirmed state
5. Bids filter chips update the FlatList correctly
6. Reviews show proper star SVGs (not emoji)
7. Sign out clears role and redirects to onboarding
8. Zero TypeScript errors

---

## Out of Scope

- No real bid submission
- No bid amount input (future)
- Provider registration flow (reuses onboarding role picker)

---

## Codex Implementation Prompt

```
Implement MB-5 provider experience for /neighbid-mobile/.

Build all four provider tabs following the MB-5 task spec.

Critical requirements:
1. (provider)/_layout.tsx uses Expo Router <Tabs> with custom TabBar,
   role="provider"
2. JobOpportunityCard: live card has Submit bid amber button with
   700ms loading state then green success "✓ Bid submitted!" view
3. Upcoming card has "Notify me" button that toggles to green confirmed
4. ReviewCard: use react-native-svg star paths (filled/unfilled),
   NOT emoji or text stars
5. All mock data from src/data/mock/
6. paddingBottom: 88 on all ScrollViews to clear floating tab bar
7. Zero TypeScript errors
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Task approved by user. Codex invoked via `codex exec --dangerously-bypass-approvals-and-sandbox`.
- 2026-04-25: Codex completed implementation. All 9 files created: 4 tab screens, _layout.tsx, and 4 provider components. All 8 acceptance criteria verified by Claude review. Zero TypeScript errors. Status: Completed.
