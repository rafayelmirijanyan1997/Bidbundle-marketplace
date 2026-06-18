# Task 506 — Provider Missing Pages + Sidebar

**Status:** Completed

## Owner
Codex, after Claude approval.

## Goal
Add 4 missing provider nav items (Job feed, Schedule, Messages, Earnings) that appear
in the sidebar design image. Update `AppBottomNav.tsx` with the full 8-item provider
nav matching the image, and build all 4 new page files using the warm design system
(cream canvas, terracotta, sage, ink tokens already in globals.css).

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/components/layout/AppBottomNav.tsx` | Update provider nav to 8 items + badge support + new icons |
| `src/app/app/provider/job-feed/page.tsx` | CREATE |
| `src/app/app/provider/schedule/page.tsx` | CREATE |
| `src/app/app/provider/messages/page.tsx` | CREATE |
| `src/app/app/provider/earnings/page.tsx` | CREATE |

---

## Change 1 — `AppBottomNav.tsx`

### 1a — Update `TabDefinition` interface to support optional badge

```ts
interface TabDefinition {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  badge?: number;
}
```

### 1b — Replace the provider array in `tabsByRole`

```ts
provider: [
  { href: "/app/provider/dashboard",  icon: HomeIcon,      label: "Home"      },
  { href: "/app/provider/job-feed",   icon: JobFeedIcon,   label: "Job feed",  badge: 5 },
  { href: "/app/provider/bids",       icon: BidsIcon,      label: "My bids"   },
  { href: "/app/provider/schedule",   icon: ScheduleIcon,  label: "Schedule"  },
  { href: "/app/provider/messages",   icon: MessagesIcon,  label: "Messages",  badge: 3 },
  { href: "/app/provider/reviews",    icon: ReviewsIcon,   label: "Reviews"   },
  { href: "/app/provider/earnings",   icon: EarningsIcon,  label: "Earnings"  },
  { href: "/app/provider/profile",    icon: ProfileIcon,   label: "Profile"   },
],
```

### 1c — Add 4 new icon components (add alongside existing icon functions at the bottom of the file)

```tsx
function JobFeedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v4M10 14h4" />
    </IconFrame>
  );
}
function ScheduleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </IconFrame>
  );
}
function MessagesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
      <path d="M4 12h4l2 3h4l2-3h4" />
    </IconFrame>
  );
}
function EarningsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </IconFrame>
  );
}
```

### 1d — Update the sidebar Link render to show badge

Inside the provider nav `tabs.map(...)` block in the sidebar branch, after `<span style={{ flex: 1 }}>{tab.label}</span>`, replace the hardcoded Chat badge with a generic badge based on `tab.badge`:

```tsx
{tab.badge ? (
  <span
    style={{
      height: 18,
      minWidth: 18,
      padding: "0 6px",
      borderRadius: 999,
      background: "var(--terracotta-600)",
      color: "white",
      fontSize: 11,
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {tab.badge}
  </span>
) : null}
```

The homeowner Chat badge (currently hardcoded as `tab.label === "Chat"`) should be
migrated to use `tab.badge` instead — add `badge: 3` to the homeowner Chat tab definition.

---

## Change 2 — Job Feed page

**File:** `src/app/app/provider/job-feed/page.tsx`

**Layout:** Topbar + filter strip + hero featured job + job list cards

```tsx
"use client";
import Link from "next/link";
```

**Topbar:**
- h1: "Job feed"  
- subtitle: "5 new matches this week · sorted by fit"
- Right: filter chips (pill buttons) for "All trades" (active/dark), "Plumbing", "Lawn care", "Handyman" + ghost btn "Set alerts"

**Filter chips style (active):**
`{ height:30, padding:"0 14px", borderRadius:999, background:"var(--ink-900)", color:"white", fontSize:13, fontWeight:600, border:0, cursor:"pointer" }`

**Filter chips style (inactive):**
`{ height:30, padding:"0 14px", borderRadius:999, background:"transparent", color:"var(--ink-700)", fontSize:13, fontWeight:600, border:"1px solid var(--border-warm-strong)", cursor:"pointer" }`

**Featured job card** (full-width hero, same as provider dashboard hero card):
```
Background: linear-gradient(135deg, var(--terracotta-50), white)
Border: 1px solid var(--border-warm)
Border-radius: 18px
Padding: 0 overflow:hidden

Top section (padding 24px 28px):
  - Row: "Top match · 96%" terracotta-dot chip + "Plumbing" neutral chip + "Closes in 6h 12m" ink-500 text
  - Title (Fraunces 26px): "Plumbing leak inspection — 3 homes"
  - Sub (ink-500): "Maple St · Oakwood Heights · 2.1 mi away"
  - Right side: eyebrow "Bid range", numeral "$450–620" terracotta, sub "Est. $570 revenue" sage-700

Bottom section (padding 16px 28px 22px, flex space-between):
  - Left: 3 avatar stack (SM:#E08758, JK:#7A9A7E, AP:#B07AA0 each 26x26) + "3 neighbors joined · 2 are repeat customers"
  - Right: "View details" ghost-sm + "Submit bid →" primary btn
```

**Job list** — section heading "All matches · 5" (eyebrow) then 5 card rows:

Each card: `card` style, padding 16px 22px, grid `auto 1fr auto auto`, gap 18, alignItems center

| # | Colour | Icon | Title | Details | Range | Match | Button |
|---|---|---|---|---|---|---|---|
| 1 | av-sage | Leaf | Lawn care bundle | 6 homes · Lakeview Park · 3.4 mi · ends 23h | $180–320 | 88% | "Bid" primary-sm |
| 2 | av-plum | Broom | Gutter cleanup | 2 homes · Oakwood Heights · 1.8 mi · ends 32h | $120–220 | 81% | "Notify me" ghost-sm (gold chip "Opens soon") |
| 3 | av-blue | Wrench | Water heater service | 4 homes · Pine Ave · 4.0 mi · ends 2d | $680–1,100 | 74% | "Bid" primary-sm |
| 4 | av-gold | Broom | Driveway pressure wash | 5 homes · Cedar Ln · 2.6 mi · ends 3d | $320–480 | 68% | "Bid" primary-sm |
| 5 | av-terracotta | Wrench | HVAC filter change | 8 homes · Oak Ridge · 5.1 mi · ends 4d | $240–360 | 61% | "Bid" primary-sm |

Avatar styles (40x40, borderRadius 11):
- av-sage: `linear-gradient(135deg,#7A9A7E,#4A6A4D)`
- av-plum: `linear-gradient(135deg,#B07AA0,#7A4A6E)`
- av-blue: `linear-gradient(135deg,#6F8DB8,#3F608E)`
- av-gold: `linear-gradient(135deg,#D6A23E,#B8862B)`
- av-terracotta: `linear-gradient(135deg,#E08758,#C2552B)`

Status chip for "Live" jobs:
`{ background:"var(--sage-50)", color:"var(--sage-700)", display:"inline-flex", alignItems:"center", gap:6, height:24, padding:"0 10px", borderRadius:999, fontSize:12, fontWeight:600 }` + 6px dot

---

## Change 3 — Schedule page

**File:** `src/app/app/provider/schedule/page.tsx`

**Layout:** Topbar + week strip + today's timeline + upcoming section

**Topbar:**
- h1: "Schedule"
- subtitle: "7 jobs this week · $4,200 est. revenue"
- Right: "← Prev" ghost-sm + "This week" ghost-sm + "Next →" ghost-sm + "Add job" primary btn

**Week strip** (7-day tabs, full-width card, padding 12px 20px, flex gap 6):
Each day: `{ flex:1, textAlign:"center", padding:"10px 6px", borderRadius:12, cursor:"pointer" }`
Active (Tue): `{ background:"var(--terracotta-600)", color:"white" }`
Inactive: `{ background:"transparent", color:"var(--ink-700)" }`
Day label: `{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }`
Date number (Fraunces, 22px)
Show 7 days: Mon 28, Tue 29 (active), Wed 30, Thu 1, Fri 2, Sat 3, Sun 4

**Today's jobs** — section eyebrow "Today · Tue Apr 29" + "Full calendar →" terracotta link

Timeline: 4 job rows (grid `70px auto 1fr auto` gap 16, padding 16px 22px, borderTop per row after first)

| Time | Dur | Bar colour | Title | Sub | Chip |
|---|---|---|---|---|---|
| 9:00 AM | 2h | sage-500 | Lawn care — Oak St | Block of 5 · GreenThumb crew | "En route" sage |
| 11:30 AM | 1h | terracotta-500 | Gutter inspection | Solo · Quick check | "Up next" terra |
| 1:30 PM | 1.5h | terracotta-500 | Plumbing leak — Maple St | Block of 3 · Inspection only | "Scheduled" terra |
| 4:00 PM | 3h | gold-500 | Water heater — Pine Ave | Block of 4 · Service call | "Scheduled" gold |

Color bar: `{ width:4, height:36, borderRadius:2 }` in the specified colour

Status chips use correct colour:
- sage: bg=sage-50, color=sage-700
- terra: bg=terracotta-50, color=terracotta-600
- gold: bg=gold-50, color=gold-600

**Upcoming section** — eyebrow "Coming up · Next 6 days" + 3 compact rows (grid `60px 1fr auto`, padding 12px 22px, borderTop per row, borderBottom on card)

| Day | Jobs | Revenue |
|---|---|---|
| Wed Apr 30 | 2 jobs | $680 est. |
| Thu May 1 | 1 job | $420 est. |
| Fri May 2 | 3 jobs | $1,240 est. |

Each row: day (Fraunces, 16px) + job count chip (sage) + revenue (terracotta-600, Fraunces, 16px)

---

## Change 4 — Messages page

**File:** `src/app/app/provider/messages/page.tsx`

**Layout:** Full two-pane (no topbar), same structure as homeowner chat page.
Height: `calc(100vh)`, grid `300px 1fr`, overflow hidden.

**Left pane** (threads):
- Header padding 24px 20px 14px:
  - "Messages" (Fraunces 24px) + "3 unread" terracotta chip
  - Search field (cream-100 bg, rounded-lg, search icon + placeholder "Search clients, jobs…")
- Thread list sections:

**Section "Unread · 3"** (eyebrow):
3 thread rows (padding 12, borderRadius 12, flex gap 10):
| Initials | Grad | Name | Preview | Time | Dot |
|---|---|---|---|---|---|
| SM | plum | Sarah M. | "When can your team start?" | 12m | terra dot |
| JK | blue | James K. | "Thanks for the quick quote!" | 1h | terra dot |
| AP | sage | Aisha P. · HOA | "New group RFP for your block" | 3h | terra dot |

**Section "Earlier"** (eyebrow):
2 thread rows:
| Initials | Grad | Name | Preview | Time |
|---|---|---|---|---|
| LO | gold | Lulu O. | "Great work last week!" | 2d |
| MC | terracotta | Maria C. | "Can you fit us in May?" | 4d |

**Right pane** (conversation — white bg):
- Header: SM avatar (plum, 40x40) + "Sarah M." bold + "Homeowner · Oakwood Heights" muted + "sage · Online" chip
- Messages area (flex col, gap 18, padding 24px 28px, overflow-y auto):
  - Date label "Today" (centered, ink-400)
  - Provider bubble (cream-100 bg, borderRadius "4px 18px 18px 18px"): "Hi Sarah — yes we can fit you in. What's the issue exactly?"
  - Customer bubble (terracotta-600 bg white text, borderRadius "18px 4px 18px 18px"): "Pipe under the kitchen sink. Slow leak, maybe 2 weeks now."
  - Provider bubble: "Got it. I can come Wed morning — I'll confirm the time once I check with my crew. Rough estimate for leak inspection is $90–140 depending on access."
  - Customer bubble: "Perfect. Should I add my neighbor at 105 — she has the same issue?"
  - Provider bubble: "Absolutely, group bookings save everyone money. Have her message me too or I'll include her in the bid."
- Composer (border-top border-warm, padding 14px 28px 22px, white bg):
  - Quick reply chips: "Sounds good!", "I'll check my schedule", "Can you share a quote?"
  - Input bar (cream-100 bg, rounded 22px, paperclip icon + placeholder "Reply to Sarah…" + terracotta send circle btn)

---

## Change 5 — Earnings page

**File:** `src/app/app/provider/earnings/page.tsx`

**Layout:** Topbar + two-column scroll (1.6fr 1fr, gap 22)

**Topbar:**
- h1: "Earnings"
- subtitle: "30-day revenue · last updated today"
- Right: "Export CSV" ghost btn + "This month" ghost btn

**Left column:**

**1. Revenue card** (card style, padding 0):
Card header (padding 24px 24px 16px, borderBottom border-warm):
- Eyebrow: "REVENUE · LAST 30 DAYS"
- Row: "$12,420" numeral terracotta-600 fontSize 38 + sage chip "+18% vs last mo"
- Sub: "$3,545 this week · 14 jobs completed"

SVG chart (full width, height 130, preserveAspectRatio none):
```tsx
<svg viewBox="0 0 300 110" width="100%" height="130" preserveAspectRatio="none" style={{ display:"block" }}>
  <defs>
    <linearGradient id="earn-grad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#E08758" stopOpacity="0.28"/>
      <stop offset="100%" stopColor="#E08758" stopOpacity="0"/>
    </linearGradient>
  </defs>
  <path d="M0 80 L25 70 L50 75 L75 55 L100 60 L125 45 L150 50 L175 35 L200 38 L225 25 L250 30 L275 18 L300 22 L300 110 L0 110 Z" fill="url(#earn-grad)"/>
  <path d="M0 80 L25 70 L50 75 L75 55 L100 60 L125 45 L150 50 L175 35 L200 38 L225 25 L250 30 L275 18 L300 22" fill="none" stroke="#C2552B" strokeWidth="2" strokeLinejoin="round"/>
  <circle cx="300" cy="22" r="4" fill="#C2552B"/>
  <circle cx="300" cy="22" r="8" fill="#C2552B" fillOpacity="0.18"/>
</svg>
```

Card footer (padding 16px 24px, grid `repeat(3,1fr)`, borderTop border-warm):
| Label | Value | Color |
|---|---|---|
| Pending payout | $1,820 | ink-900 |
| Win rate | 92% | terracotta-600 |
| Avg. job lead | 3.2d | ink-900 |

**2. Job breakdown table** (card):
Header (padding 18px 22px, flex space-between):
- Eyebrow "COMPLETED JOBS · 14"
- "Sort: Recent ↓" ghost-sm

6 rows (grid `auto 1fr auto auto`, padding 14px 22px, borderTop per row after first):

| Avatar | Title | Date | Amount | Status |
|---|---|---|---|---|
| P (sage) | Plumbing leak · Maple St · 3 homes | Apr 28 | $3,325 | sage chip "Won" |
| L (blue) | Lawn care bundle · Oak St · 6 homes | Apr 26 | $720 | gold chip "In progress" |
| H (sage) | Handyman block · Elm Ct · 2 homes | Apr 22 | $680 | sage chip "Won" |
| W (blue) | Water heater service · Pine Ave · 4 homes | Apr 18 | $880 | sage chip "Won" |
| G (plum) | Gutter clean · Ash Blvd · 2 homes | Apr 14 | — | neutral chip "Lost" |
| D (gold) | Driveway pressure wash · Cedar Ln · 5 homes | Apr 10 | $480 | sage chip "Won" |

Avatar: 36x36, borderRadius 10. Amount: Fraunces 17px, ink-900 (or ink-400 for lost).

**Right column:**

**1. Next payout card** (gradient terracotta-50 → cream-100, borderRadius 22, border border-warm, padding 24):
- Eyebrow: "NEXT PAYOUT"
- "$1,820" (Fraunces 38, terracotta-600)
- "Tue, May 5 · Direct deposit" (ink-500, 12px)
- Divider
- 4 rows (flex space-between, 13px):
  - Completed jobs · **6**
  - Gross earnings · **$2,015**
  - Platform fee · −$195 (ink-500)
  - Tips received · +$0 (ink-500)
- "View full breakdown" quiet-sm btn (white bg, full width, marginTop 12)

**2. Monthly summary cards** (grid 2-col, gap 12):
4 stat cards (card style, padding 18px, position relative, overflow hidden):
- "$47.2k" / "YTD earnings" / terracotta-600 / terracotta-500 bottom bar
- "128" / "Total reviews" / gold-600 / gold-500 bar
- "4.9" / "Avg. rating" / sage-700 / sage-500 bar
- "89%" / "Completion rate" / ink-900 / ink-200 bar

Each: eyebrow label, numeral in colour (fontSize 30), sub text (ink-500), 3px absolute bottom bar.

**3. Payment settings card** (card-pad):
Eyebrow "PAYMENT SETTINGS" (marginBottom 12)
2 rows (flex, gap 12, alignItems center, borderTop on second row, padding 12px 0):
Row 1: sage icon bg (bank icon SVG) + "Direct deposit" bold + "•••• 7821 · Tue/Fri" muted + "Edit" ghost-sm
Row 2: gold icon bg (shield icon) + "1099 documents" bold + "Tax year 2025 ready" muted + "Download" ghost-sm

---

## Shared patterns

Use these exact values from globals.css — do NOT redeclare tokens:

```tsx
const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-warm)",
  borderRadius: 18,
  boxShadow: "var(--shadow-warm-sm)",
};

// Button variants
const btnPrimary = { display:"inline-flex", alignItems:"center", gap:8, height:38, padding:"0 16px", borderRadius:999, fontSize:14, fontWeight:600, cursor:"pointer", background:"var(--terracotta-600)", color:"white", border:0, fontFamily:"var(--font-body)", boxShadow:"0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)" };
const btnGhost = { display:"inline-flex", alignItems:"center", gap:8, height:38, padding:"0 16px", borderRadius:999, fontSize:14, fontWeight:600, cursor:"pointer", background:"transparent", color:"var(--ink-700)", border:"1px solid var(--border-warm-strong)", fontFamily:"var(--font-body)" };
const btnSmGhost = { display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", background:"transparent", color:"var(--ink-700)", border:"1px solid var(--border-warm-strong)", fontFamily:"var(--font-body)" };
const btnSmPrimary = { display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", background:"var(--terracotta-600)", color:"white", border:0, fontFamily:"var(--font-body)" };
const btnSmQuiet = { display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", background:"var(--cream-100)", color:"var(--ink-900)", border:0, fontFamily:"var(--font-body)" };

// Eyebrow
const eyebrow = { fontSize:11, textTransform:"uppercase" as const, letterSpacing:"0.10em", color:"var(--ink-400)", fontWeight:600 };

// Numeral (Fraunces display font)
const numeral = { fontFamily:"var(--font-display)", fontWeight:500, letterSpacing:"-0.02em" };
```

All pages use `"use client"` at top and `<div style={{ background:"var(--bg-app)", minHeight:"100vh" }}>` as the wrapper.

---

## Acceptance Criteria

- [ ] Provider sidebar shows 8 items: Home, Job feed (badge 5), My bids, Schedule, Messages (badge 3), Reviews, Earnings, Profile
- [ ] Correct icons for all 8 items
- [ ] Badges display as terracotta pills with white text
- [ ] `/app/provider/job-feed` — featured job card + 5 job list rows + filter chips
- [ ] `/app/provider/schedule` — week strip + 4 timeline rows + 3 upcoming rows
- [ ] `/app/provider/messages` — two-pane layout, 5 threads left, conversation right with composer
- [ ] `/app/provider/earnings` — revenue SVG chart + 6 job breakdown rows + payout card + 4 stat cards
- [ ] All pages use cream canvas, warm card style, consistent with existing provider pages
- [ ] `tsc --noEmit` passes with zero errors

## Out of Scope
- Real data / API wiring
- Homeowner or admin pages

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-06 | Approved | Spec written by Claude based on sidebar image + warm system |
| 2026-05-06 | Completed | Codex implemented all 5 changes. tsc clean. Playwright passed all 4 pages + sidebar. |
