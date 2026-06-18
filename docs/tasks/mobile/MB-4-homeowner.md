# MB-4 — Homeowner Experience

**Status:** Completed
**Depends on:** MB-2 and MB-3 complete

---

## Goal

Build the complete homeowner flow: four bottom tabs (Dashboard, Chat,
Bids, Profile) plus two full-screen flows pushed over the tabs
(New Request with AI category detection, and Bidding Room with the
full accept → confirm → confirmed → track cycle).

## Why This Task Comes Now

The homeowner is the primary user of NeighBid. This is the deepest
and most important experience in the app. It is built before provider
and admin because it validates the core product loop end-to-end.

---

## Tab Group Setup

**src/app/(homeowner)/_layout.tsx**

Expo Router `<Tabs>` with the custom `TabBar` component:
```tsx
<Tabs tabBar={(props) => <TabBar {...props} role="homeowner" />}>
  <Tabs.Screen name="index"   options={{ title: 'Home' }} />
  <Tabs.Screen name="chat"    options={{ title: 'Chat' }} />
  <Tabs.Screen name="bids"    options={{ title: 'Bids' }} />
  <Tabs.Screen name="profile" options={{ title: 'Me' }} />
</Tabs>
```

TabBar receives `role="homeowner"` and shows:
Home (house), Chat (speech bubble), Bids (document), Me (person)

---

## Screens

### src/app/(homeowner)/index.tsx — Dashboard

ScrollView with bottom padding 88px (clears floating tab bar).

Sections (top to bottom):
1. **UserSummaryCard** — SurfaceCard with initials avatar, name, address,
   HOA badge, stats row (Active / Saved / Neighbors) in Fraunces italic
2. **AiPromptCard** — SurfaceCard, tappable, navigates to `/request`
   on press. Shows "What do you need done?", faux input row, amber Start button
3. **Neighborhood bids header** — "Neighborhood bids" label + live pulse dot + LIVE badge
4. **ServiceRequestCard list** — from mockServiceRequests
   - Live cards navigate to `/bidding-room` on press
   - Grouping/Draft cards are non-interactive
5. **Savings banner** — green tinted row "You saved $310 · 14 neighbors"
6. **+ New request button** — amber Button, full width, navigates to `/request`

### src/app/(homeowner)/chat.tsx — Chat

ScrollView.

Sections:
1. **Active bid banner** — primary/5 tinted card with title "1 active group bid",
   subtitle, chevron. Navigates to `/bidding-room` on press.
2. **Empty state card** — chat icon in primary/10 circle, "Chat with your
   neighbors" heading, descriptor text "Group chat unlocks when a bid goes live"

### src/app/(homeowner)/bids.tsx — Bids

FlatList (better performance than ScrollView for lists).

Header (rendered via ListHeaderComponent):
- "Your bids" Fraunces italic heading
- "$310 total saved" subtext
- Filter chips row (All / Active / Won / Past) — horizontal ScrollView,
  active chip has primary background

List items: BidHistoryCard
- Category tile (colored rounded square, initial letter)
- Title + provider name + status badge
- Amount + date right-aligned
- Empty state card when filter has no results

### src/app/(homeowner)/profile.tsx — Profile

ScrollView.

Sections:
1. ProfileCard (SurfaceCard) — avatar, name, address, join date, badges
2. Stats row card (Saved / Neighbors / Active Bids)
3. Settings list (TouchableOpacity rows with chevron):
   - Payment method (Visa •••• 4242)
   - Notifications
   - Address & service area
   - Help & support
   - About NeighBid
4. Sign out button (red, navigates to `/`) — uses router.replace('/')
   and calls AsyncStorage.removeItem('neighbid.role')

### src/app/request.tsx — New Request (Modal Screen)

Presented as a full-screen modal pushed over the tab group.
Stack screen, header: "New request" with back chevron.

**Step: form**
- Label "WHAT DO YOU NEED DONE?" (DM Sans semibold, small caps)
- TextInput multiline, 112px tall, canvas background, warm border
  focus ring, placeholder text
- AI detection:
  - Idle: nothing shown
  - Analyzing (after 10+ chars, 1.4s debounce): SurfaceCard with
    animated three-dot pulse loader
  - Result: SurfaceCard with detected category badge + GroupSuggestionCard
- "Post request" amber Button — disabled when empty, shows "Posting…"
  with 800ms delay then transitions to posted state

**Step: posted**
- Success state: green circle checkmark, "Request posted!", category + neighborhood
- Group forming card (SurfaceCard): title, 3/8 neighbors progress bar,
  countdown, location
- Two buttons: "Back to dashboard" (amber), "Invite a neighbor" (secondary,
  toggles to "✓ Invite sent!" on press)

**GroupSuggestionCard** sub-component:
- If matchedRequest: amber "Nearby group found" badge, title, neighbors,
  budget, "Join this group →" button (navigates to bidding-room)
- If no match: primary "Start a new group" badge, descriptor text,
  "Create group →" button (navigates back to dashboard)

### src/app/bidding-room.tsx — Bidding Room (Modal Screen)

Full-screen stack screen pushed over tabs.

**Step: bids**
- Header: back button + "Bidding room" + amber countdown chip
- SurfaceCard: request title + neighborhood + neighbor count
- "Bids received" label + "3 bids · save up to $85" right-aligned
- BidCard list (3 cards, FlatList or map):
  - Selected card: 2px amber border, amber avatar bg, amber price,
    amber "Selected" row at bottom
  - Unselected: dark navy avatar, normal divider border
  - Leading bid: amber "BEST" pill top-right
- AI recommendation card (white Card, blue sparkle icon)
- "Accept bid — $490" amber Button

**Step: confirm**
- Back button + "Confirm booking"
- Provider card: avatar, name, rating, jobs count
- Stats grid: bid amount / estimated days (canvas bg rounded squares)
- Savings banner: amber tinted "You save $85 with your community"
- "Confirm booking" amber Button (900ms loading → confirmed)
- "← Back to bids" ghost text button

**Step: confirmed**
- Green circle checkmark (80px)
- "Booking confirmed!" Fraunces italic heading
- provider name + category subtext
- SurfaceCard: service details grid (Amount / Est. / Rating), location
- Savings banner
- "Track my service" amber Button → navigates to `/(homeowner)/bids`
- "Leave a review when the service is complete" ghost caption

---

## Components Created

```
src/components/homeowner/
  UserSummaryCard.tsx
  AiPromptCard.tsx
  ServiceRequestCard.tsx
  BidCard.tsx
  BidHistoryCard.tsx
  GroupSuggestionCard.tsx
  RequestFeed.tsx
  ProfileCard.tsx
```

---

## Acceptance Criteria

1. Dashboard, Chat, Bids, Profile all render from their tabs
2. Floating tab bar shows correct icons, active tab highlights correctly
3. Tapping "Plumbing leak inspection" (live) navigates to bidding room
4. Tapping AiPromptCard navigates to request screen
5. "Post request" flow: form → analyzing (dots) → result → posted state
6. Bidding room: select different bids, amber border updates
7. Accept bid → confirm → confirming spinner → confirmed screen
8. "Track my service" navigates to the Bids tab
9. Profile "Sign out" clears AsyncStorage and goes to onboarding
10. FlatList in Bids tab scrolls smoothly without jank
11. All modals dismiss properly with back button

---

## Out of Scope

- No real AI calls (mock category detection with regex)
- No push notifications
- No chat messages (static empty state)

---

## Codex Implementation Prompt

```
Implement MB-4 homeowner experience for /neighbid-mobile/.

Build all four homeowner tabs and the two modal screens (request,
bidding-room) following the MB-4 task spec exactly.

Critical requirements:
1. (homeowner)/_layout.tsx uses Expo Router <Tabs> with custom TabBar
   component from src/components/layout/TabBar.tsx, role="homeowner"
2. Dashboard ScrollView has paddingBottom: 88 to clear the floating tab bar
3. AiPromptCard: tappable SurfaceCard that navigates to /request
4. request.tsx: TextInput with 1.4s debounce AI detection using the same
   regex logic from the web app (plumb|leak → Plumbing, etc.)
5. Bidding room selected state: 2px amber border, amber avatar background,
   amber price text, amber "Selected" row with checkmark
6. Confirmed state: large green circle checkmark (Ionicons check or SVG path)
7. "Track my service" uses router.push('/(homeowner)/bids')
8. Profile sign out: AsyncStorage.removeItem('neighbid.role') then
   router.replace('/(onboarding)/get-started')
9. All mock data from src/data/mock/ — no hardcoded values
10. Zero TypeScript errors
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Task approved by user. Codex invoked via `codex exec --dangerously-bypass-approvals-and-sandbox`.
- 2026-04-25: Codex completed implementation. All 14 files created: 4 tab screens, _layout.tsx, request.tsx, bidding-room.tsx, and 7 homeowner components. All 11 acceptance criteria verified by Claude review. Zero TypeScript errors. Status: Completed.
