# MB-6 — Admin Experience

**Status:** Completed
**Depends on:** MB-2 and MB-3 complete (MB-4 and MB-5 not required)

---

## Goal

Build the complete HOA admin flow: four bottom tabs (Dashboard, Community,
Reports, Profile) with working Approve/Decline member actions and a native
bar chart for the savings report.

---

## Tab Group Setup

**src/app/(admin)/_layout.tsx**

```tsx
<Tabs tabBar={(props) => <TabBar {...props} role="admin" />}>
  <Tabs.Screen name="index"     options={{ title: 'Home' }} />
  <Tabs.Screen name="community" options={{ title: 'Community' }} />
  <Tabs.Screen name="reports"   options={{ title: 'Reports' }} />
  <Tabs.Screen name="profile"   options={{ title: 'Me' }} />
</Tabs>
```

TabBar icons: Home, Community (people), Reports (bar chart), Me (person)

---

## Screens

### src/app/(admin)/index.tsx — Dashboard

ScrollView, paddingBottom 88.

Sections:
1. **AdminSummaryCard** — SurfaceCard: admin initials, name, Admin badge,
   community name, stat row (Members / Active Bids / Saved/mo in Fraunces italic)
2. **Pending members alert card** (only if pendingMembers.length > 0):
   - Amber tinted border card
   - "{N} members pending review" heading
   - Names subtext
   - Amber count badge (right)
   - "Review eligibility →" link → navigates to community tab
     (use `router.push('/(admin)/community')`)
3. **Recent activity header**
4. **ActivityCard list** from mockRecentActivity:
   - Icon in colored circle (bid: primary, join: amber, saving: green)
   - Description text
   - Time subtext

### src/app/(admin)/community.tsx — Community

FlatList with ListHeaderComponent.

Header:
- "Community" Fraunces italic heading
- "14 members · 2 pending review" subtext
- Filter chips: All / Verified / Pending / Ineligible

MemberCard per item:
- Initial letter avatar (primary/10 bg)
- Name + address + join date
- Eligibility badge (verified: green, pending: amber, ineligible: red)
- **Pending cards only**: show Approve + Decline buttons row below the
  member info (blue "Approve", red outline "Decline")
- Tapping Approve: sets that member's local state to 'verified',
  hides the buttons, shows Verified badge
- Tapping Decline: sets to 'ineligible', hides buttons, shows
  Ineligible badge

### src/app/(admin)/reports.tsx — Reports

ScrollView, paddingBottom 88.

Sections:
1. **Stats grid** — 2×2 grid card:
   - Total saved ($1,840)
   - Active bids (3)
   - Members (14)
   - Avg win rate (92%)
   All values in Fraunces italic bold.

2. **"Savings by category" header**

3. **SavingsBarChart** — native implementation:
   For each category in mockSavingsReport.categories:
   - Category name (left) + amount (right) — small row header
   - A View with primary background animated to the correct percentage width
   - Use Animated.timing (duration 600ms, easing.out) to animate bars
     on mount
   - No external chart library needed

4. **Total savings hero card**:
   - primary background, full-width rounded card
   - "$1,840" in Fraunces italic (28px, white)
   - "saved by Oakwood Heights this year" (DM Sans, white/70)

### src/app/(admin)/profile.tsx — Profile

ScrollView.

Sections:
1. SurfaceCard: admin initials, name, Admin badge, community name
2. Stats row: Members / Active Bids / Saved
3. Settings list
4. Sign out → clears AsyncStorage, router.replace to onboarding

---

## Components Created

```
src/components/admin/
  AdminSummaryCard.tsx
  ActivityCard.tsx
  MemberCard.tsx        ← includes Approve/Decline state
  SavingsBarChart.tsx   ← native Animated bars
```

---

## Acceptance Criteria

1. All four admin tabs render correctly
2. Pending alert on dashboard links to Community tab
3. Community filter chips correctly show/hide members by eligibility
4. Approve button on pending member: shows Verified badge, hides buttons
5. Decline button: shows Ineligible badge, hides buttons
6. SavingsBarChart bars animate in on mount (600ms)
7. Reports stats show Fraunces italic numbers
8. Sign out clears role and goes to onboarding
9. ActivityCard icons render in correct colors (not all the same)
10. Zero TypeScript errors

---

## Out of Scope

- No real eligibility API
- No push notification to members
- No export/download for reports

---

## Codex Implementation Prompt

```
Implement MB-6 admin experience for /neighbid-mobile/.

Build all four admin tabs following the MB-6 task spec.

Critical requirements:
1. (admin)/_layout.tsx uses Expo Router <Tabs> with custom TabBar,
   role="admin"
2. Dashboard pending alert: "Review eligibility →" uses
   router.push('/(admin)/community'), NOT href="#"
3. MemberCard: pending cards only show Approve/Decline buttons.
   Tapping Approve/Decline updates local useState for that card's
   eligibility — no page reload needed.
4. SavingsBarChart: use React Native Animated.Value with Animated.timing
   (600ms, Easing.out(Easing.cubic)) to animate bar widths on component mount.
   No external chart library.
5. All mock data from src/data/mock/mockAdminDashboard.ts
6. paddingBottom: 88 on all ScrollViews
7. Zero TypeScript errors
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Task approved by user. Codex invoked via `codex exec --dangerously-bypass-approvals-and-sandbox`.
- 2026-04-25: Codex completed implementation. All 9 files created: 4 tab screens, _layout.tsx, and 4 admin components. All 10 acceptance criteria verified by Claude review. Zero TypeScript errors. Status: Completed.
