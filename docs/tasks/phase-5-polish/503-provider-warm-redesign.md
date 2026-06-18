# Task 503 — Provider Warm Redesign

**Status:** Completed

## Owner
Codex, after Claude approval.

## Goal
Replace the placeholder provider pages with fully designed warm-palette pages that match
`claude_website_designs/provider-home.jsx`, `provider-bids.jsx`, `provider-reviews.jsx`,
and `provider-profile.jsx` exactly.

## Why This Task Comes Now
Task 502 completed the homeowner warm redesign. The provider role pages are still thin
placeholders (~80 lines each). The same warm design system (cream, terracotta, sage,
ink tokens) is already installed in `globals.css`. No token or sidebar changes are needed —
only the four page files require rewriting.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/app/app/provider/dashboard/page.tsx` | Full rewrite |
| `src/app/app/provider/bids/page.tsx` | Full rewrite |
| `src/app/app/provider/reviews/page.tsx` | Full rewrite |
| `src/app/app/provider/profile/page.tsx` | Full rewrite |

No changes to globals.css, layout, or sidebar — all tokens and the sidebar are already
correct from Task 502.

---

## Design Source Files

Read these files in full before implementing:
- `claude_website_designs/provider-home.jsx`
- `claude_website_designs/provider-bids.jsx`
- `claude_website_designs/provider-reviews.jsx`
- `claude_website_designs/provider-profile.jsx`

The shared design token reference is `claude_website_designs/tokens.css`.
CSS variable names map directly to the custom properties already in `src/app/globals.css`.

---

## Implementation Notes

### Shared patterns across all provider pages

**Page wrapper:**
```tsx
<div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
```

**Topbar pattern:**
```tsx
<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "28px 36px 20px", gap: 16 }}>
  <div>
    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 4px", color: "var(--ink-900)" }}>...</h1>
    <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>...</p>
  </div>
  <div style={{ display: "flex", gap: 10 }}>...</div>
</div>
```

**Scroll area:**
```tsx
<div style={{ padding: "0 36px 36px" }}>
```

**Card style:**
```tsx
const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-warm)",
  borderRadius: 18,
  boxShadow: "var(--shadow-warm-sm)",
};
```

**Button styles:**
```tsx
// Primary
{ display:"inline-flex", alignItems:"center", gap:8, height:38, padding:"0 16px", borderRadius:999, fontSize:14, fontWeight:600, cursor:"pointer", background:"var(--terracotta-600)", color:"white", border:0, fontFamily:"var(--font-body)", boxShadow:"0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)" }
// Ghost
{ display:"inline-flex", alignItems:"center", gap:8, height:38, padding:"0 16px", borderRadius:999, fontSize:14, fontWeight:600, cursor:"pointer", background:"transparent", color:"var(--ink-700)", border:"1px solid var(--border-warm-strong)", fontFamily:"var(--font-body)" }
// Small primary
{ display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", background:"var(--terracotta-600)", color:"white", border:0, fontFamily:"var(--font-body)" }
// Small ghost
{ display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", background:"transparent", color:"var(--ink-700)", border:"1px solid var(--border-warm-strong)", fontFamily:"var(--font-body)" }
// Small quiet
{ display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", background:"var(--cream-100)", color:"var(--ink-900)", border:0, fontFamily:"var(--font-body)" }
```

**Eyebrow label:**
```tsx
<div style={{ fontSize:11, textTransform:"uppercase" as const, letterSpacing:"0.10em", color:"var(--ink-400)", fontWeight:600 }}>
```

**Chip pattern:**
```tsx
// Terracotta chip with dot
<span style={{ display:"inline-flex", alignItems:"center", gap:6, height:24, padding:"0 10px", borderRadius:999, fontSize:12, fontWeight:600, background:"var(--terracotta-50)", color:"var(--terracotta-600)" }}>
  <span style={{ width:6, height:6, borderRadius:3, background:"currentColor" }} /> Label
</span>
// Sage chip with dot
<span style={{ display:"inline-flex", alignItems:"center", gap:6, height:24, padding:"0 10px", borderRadius:999, fontSize:12, fontWeight:600, background:"var(--sage-50)", color:"var(--sage-700)" }}>
  <span style={{ width:6, height:6, borderRadius:3, background:"currentColor" }} /> Label
</span>
// Gold chip
<span style={{ display:"inline-flex", alignItems:"center", gap:6, height:24, padding:"0 10px", borderRadius:999, fontSize:12, fontWeight:600, background:"var(--gold-50)", color:"var(--gold-600)" }}>
  Label
</span>
// Neutral chip
<span style={{ display:"inline-flex", alignItems:"center", height:24, padding:"0 10px", borderRadius:999, fontSize:12, fontWeight:600, background:"var(--cream-100)", color:"var(--ink-700)", border:"1px solid var(--border-warm)" }}>
  Label
</span>
```

**Avatar style:**
```tsx
// Color variants:
// av-sage:       linear-gradient(135deg,#7A9A7E,#4A6A4D)
// av-blue:       linear-gradient(135deg,#6F8DB8,#3F608E)
// av-plum:       linear-gradient(135deg,#B07AA0,#7A4A6E)
// av-gold:       linear-gradient(135deg,#D6A23E,#B8862B)
// av-terracotta: linear-gradient(135deg,#E08758,#C2552B)
```

**Numeral (display font for numbers):**
```tsx
style={{ fontFamily:"var(--font-display)", fontWeight:500, letterSpacing:"-0.02em" }}
```

### PIcon — provider-specific icons (define these inline in each file that uses them)

```tsx
function PIconInbox() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/><path d="M4 12h4l2 3h4l2-3h4"/></svg>;
}
function PIconDollar() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function PIconCal() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function PIconBriefcase() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v4M10 14h4"/></svg>;
}
```

### Shared small icons (define in each file)

```tsx
function IconPlus() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>; }
function IconArrowR() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>; }
function IconSearch() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>; }
function IconEdit() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z"/><path d="M14 5l2.5 2.5"/></svg>; }
function IconStar() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>; }
function IconShield() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>; }
function IconBell() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>; }
function IconPin() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>; }
function IconUser() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>; }
function IconSpark() { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>; }
function IconLeaf() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-9 7-14 16-14-1 9-5 16-14 16a4 4 0 0 1-2-2z"/><path d="M5 19l8-8"/></svg>; }
function IconBroom() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-7 7H6v-7z"/><path d="M6 14l-3 6 6-3"/></svg>; }
function IconWrench() { return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6a4 4 0 0 1 5 5l-9 9-4 1 1-4 9-9z"/></svg>; }
```

---

## Page Implementations

### 1. `src/app/app/provider/dashboard/page.tsx`

Port `claude_website_designs/provider-home.jsx` faithfully.

**Layout:** Topbar + two-column scroll grid (`1.6fr 1fr`, gap 22px).

**Left column (top to bottom):**

1. **Hero opportunity card** — card with terracotta-50 gradient header, "Top match · 96%" chip + "Plumbing" chip + "Closes in 6h 12m" text. Fraunces title "Plumbing leak inspection — 3 homes". Bid range "$450–620" in terracotta, "Est. $570 revenue" in sage. Bottom row: 3 avatar stack + "3 neighbors joined · 2 are repeat customers" text + "View details" ghost button + "Submit bid →" primary button.

2. **Smart job feed** — eyebrow "Smart job feed" + "Matched to your trades & service area" subtitle + "See all 5 →" terracotta link. Three job cards (grid `auto 1fr auto auto`):
   - Lawn care bundle · 6 homes · av-sage · "$180–320" · 88% match · "Bid" primary sm
   - Gutter cleanup · 2 homes · av-plum · "$120–220" · 81% match · "Notify me" ghost sm (chip-gold "Opens soon")
   - Water heater service · 4 homes · av-blue · "$680–1,100" · 74% match · "Bid" primary sm

3. **Today's schedule card** — eyebrow "Today · Tue Apr 30" + "Full schedule →" link. Three rows (grid `70px auto 1fr auto`):
   - 9:00 AM / 2h · sage left-bar · "Lawn care — Oak St" / "Block of 5 · GreenThumb crew" · sage chip "En route"
   - 1:30 PM / 1.5h · terracotta left-bar · "Plumbing leak — Maple St" / "Block of 3 · Inspection only" · terracotta chip "Up next"
   - 4:00 PM / 3h · gold left-bar · "Water heater — Pine Ave" / "Block of 4 · Service call" · gold chip "Scheduled"
   
   Schedule left-bar: `width:4, height:36, borderRadius:2, background` — use explicit colors: sage → `var(--sage-500)`, terracotta → `var(--terracotta-500)`, gold → `var(--gold-500)`.
   
   Schedule status chips: use correct color per tone — sage = sage-50/sage-700, terracotta = terracotta-50/terracotta-600, gold = gold-50/gold-600.

**Right column (top to bottom):**

1. **Revenue card** (`card-pad`) — eyebrow "Revenue · last 30 days" + sage chip "+18% vs last mo". Numeral "$12,420" terracotta-600 fontSize 38. Sub "3,545 this week · 14 jobs completed". SVG revenue chart (height 110):
```tsx
<svg viewBox="0 0 300 110" width="100%" height="110" preserveAspectRatio="none">
  <defs>
    <linearGradient id="ph-grad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stopColor="#E08758" stopOpacity="0.32"/>
      <stop offset="100%" stopColor="#E08758" stopOpacity="0"/>
    </linearGradient>
  </defs>
  <path d="M0 80 L25 70 L50 75 L75 55 L100 60 L125 45 L150 50 L175 35 L200 38 L225 25 L250 30 L275 18 L300 22 L300 110 L0 110 Z" fill="url(#ph-grad)"/>
  <path d="M0 80 L25 70 L50 75 L75 55 L100 60 L125 45 L150 50 L175 35 L200 38 L225 25 L250 30 L275 18 L300 22" fill="none" stroke="#C2552B" strokeWidth="2" strokeLinejoin="round"/>
  <circle cx="300" cy="22" r="4" fill="#C2552B"/>
  <circle cx="300" cy="22" r="8" fill="#C2552B" fillOpacity="0.18"/>
</svg>
```
Below divider: 3-column mini stats grid: "$1,820" / Pending payout · "92%" (terracotta) / Win rate · "3.2d" / Avg. job lead.

2. **2-column stat cards:**
   - "Jobs completed" / "14" (sage-700) / "this month"
   - "Avg. rating" / "4.9" (gold-600) / "★ 128 reviews"

3. **Recent messages card** — eyebrow + terracotta chip "3 unread". Three message rows (grid `auto 1fr auto`): avatar + name + preview truncated + time + unread dot (terracotta-500 7px circle). Avatars: SM/av-plum, JK/av-blue, AP/av-sage.

---

### 2. `src/app/app/provider/bids/page.tsx`

Port `claude_website_designs/provider-bids.jsx` faithfully.

**Layout:** Topbar + scroll area (single column).

**Topbar:** "My bids" / "6 bids · $5,605 won this month · 92% win rate" / Search ghost + "Quick bid" primary.

**Stats strip** (4 cards, `repeat(4,1fr)`, bottom color bar):
- Pending · "1" · terracotta-600 · terracotta-500 bar
- Won · "3" · sage-700 · sage-500 bar
- Win rate · "92%" · gold-600 · gold-500 bar
- Avg bid value · "$934" · ink-900 · ink-200 bar

**Filter tabs** — same pattern as homeowner bids: All(6 active), Pending(1), Active(2), Won(2), Lost(1) + Sort ghost btn.

**Bid rows** (6 rows, `card`, grid `auto 1fr auto auto auto`):
```
Avatar(40x40,r11) | title + address | status chip | amount+date | "Open →" ghost-sm
```

| # | Initials | av | Title | Address | Status | Amount | Date |
|---|---|---|---|---|---|---|---|
| 1 | P | av-sage | Plumbing leak | Maple St · 3 homes | Won (sage dot) | $3,325 | Apr 18 |
| 2 | L | av-blue | Lawn care bundle | Oak St · 6 homes | In progress (gold) | $720 | Today |
| 3 | H | av-sage | Handyman block | Elm Ct · 2 homes | Won (sage dot) | $680 | Apr 10 |
| 4 | W | av-blue | Water heater service | Pine Ave · 4 homes | In progress (gold) | $880 | Mar 30 |
| 5 | G | av-plum | Gutter clean | Ash Blvd · 2 homes | Lost (neutral) | — (ink-400) | Mar 26 |
| 6 | D | av-gold | Driveway pressure wash | Cedar Ln · 5 homes | Awaiting decision (terra dot) | Pending | 8h left |

Status chip colors:
- Won: sage-50 bg, sage-700 text, dot
- In progress: gold-50 bg, gold-600 text
- Lost: cream-100 bg, ink-700 text, border-warm border
- Awaiting decision: terracotta-50 bg, terracotta-600 text, dot

---

### 3. `src/app/app/provider/reviews/page.tsx`

Port `claude_website_designs/provider-reviews.jsx` faithfully.

**Layout:** Topbar + scroll area two-column (`1fr 2fr`, gap 22).

**Topbar:** "Reviews" / "128 verified reviews from NeighBid neighbors" / "Reply settings" ghost btn with edit icon.

**Left column:**
1. **Overall rating card** (gradient `linear-gradient(160deg, white, var(--cream-100))`):
   - Eyebrow "Overall"
   - "4.9" numeral in gold-600 fontSize 56, 5 gold stars, "128 reviews · 30d"
   - Horizontal divider
   - Star distribution bars (5★ to 1★): grid `20px 1fr 36px`:
     - 5★ · 84% fill (gold-500) · 108
     - 4★ · 11% · 14
     - 3★ · 3% · 4
     - 2★ · 1% · 1
     - 1★ · 1% · 1

2. **"What neighbors mention" card** — keyword chips with count in ink-400:
   On time(92), Clean work(78), Communication(64), Fair price(58), Coordinated block(41), Friendly(33)

3. **Trend card** — eyebrow "Trend" · "+0.2 ★" numeral + " vs last 90d" in sage-700. SVG trend line:
```tsx
<svg viewBox="0 0 200 60" width="100%" height="50" preserveAspectRatio="none" style={{ marginTop: 8 }}>
  <path d="M0 40 L25 38 L50 35 L75 30 L100 28 L125 22 L150 20 L175 16 L200 12" fill="none" stroke="#B8862B" strokeWidth="2"/>
  <circle cx="200" cy="12" r="3" fill="#B8862B"/>
</svg>
```

**Right column:**
Filter chips row: "All" (ink-900 bg, white text) · "5★ only" (neutral) · "Needs reply 2" (terracotta count) · flex-1 spacer · "Sort: Recent" ghost-sm.

Four review cards (card-pad):
Each: avatar (40x40) + name + "Verified neighbor" sage chip (h18, fs10) + date right-aligned + star row (gold filled, ink-200 empty) + tag text (ink-500 fs11) + review text (ink-700, fs14, lh1.55) + "Reply publicly" quiet-sm + "Thank privately" ghost-sm.

| # | Initials | av | Name | Date | Stars | Tag |
|---|---|---|---|---|---|---|
| 1 | SM | av-plum | Sarah M. | Apr 20 | 5 | Plumbing · group of 3 |
| 2 | JK | av-blue | James K. | Apr 12 | 4 | Inspection · solo |
| 3 | PA | av-terracotta | Priya A. | Mar 30 | 5 | Plumbing · group of 5 |
| 4 | LO | av-gold | Lulu O. | Mar 22 | 5 | Block service · 8 homes |

---

### 4. `src/app/app/provider/profile/page.tsx`

Port `claude_website_designs/provider-profile.jsx` faithfully.

**Layout:** Topbar + scroll area two-column (`1.5fr 1fr`, gap 22, alignItems start).

**Topbar:** "Profile & business" / "Public profile, payouts, service area, notifications" / "Edit public profile" ghost + "Verified · Insured" sage-dot chip (h30).

**Left column:**

1. **Identity banner card** (overflow hidden):
   - 88px gradient header: `linear-gradient(135deg, var(--terracotta-100), var(--cream-200) 50%, var(--sage-100))`
   - marginTop -36, padding 0 28px 24px
   - Avatar: 76x76, av-terracotta, "PF", border 4px white, shadow-warm-md, Fraunces font
   - Name "ProFix Plumbing" (Fraunces fs24) + "Verified" sage-dot chip
   - Sub: "Licensed · Insured · 10 yrs · Oakwood Heights area" (ink-500 fs13)
   - Rating row: 5 gold stars + "4.9" ink-900 bold + "· 128 reviews · 14 mo on NeighBid"

2. **Performance card** (card-pad) — eyebrow "Performance · last 90 days". 4-col grid of PStat:
   - "$12.4k" / Earnings / terracotta-600
   - "92%" / Win rate / sage-700
   - "4.9" / Rating / gold-600
   - "3.2d" / Avg lead / ink-900

3. **Settings list card** — 8 rows (grid `auto 1fr auto`, padding 14px 22px, borderBottom):
   | Icon | Title | Subtitle | Tone (icon bg/color) |
   |---|---|---|---|
   | PIconDollar | Payment methods | Bank account •••• 7821 · Direct deposit Tue/Fri | sage |
   | IconBell | Notifications | Push & Email · job alerts within 5 mi | terracotta |
   | IconPin | Service area & trades | Oakwood Heights · 8 mi · 4 trades | gold |
   | PIconCal | Working hours | Mon–Sat · 7:00 AM – 6:00 PM | sage |
   | IconShield | Documents | License, insurance, W-9 · all current | sage |
   | PIconBriefcase | Quote templates | 4 saved · last edited Apr 18 | terracotta |
   | IconUser | Crew & team | 3 members · 1 pending invite | gold |
   | IconSpark | Help & support | FAQ, Contact · 24h response | ink (cream-100 bg, ink-700 color) |
   
   Icon container: 36x36, borderRadius 10. Tone colors:
   - sage: bg=sage-50, color=sage-700
   - terracotta: bg=terracotta-50, color=terracotta-600
   - gold: bg=gold-50, color=gold-600
   - ink: bg=cream-100, color=ink-700
   
   Right arrow: ink-400.

4. **Sign out card** — same pattern as homeowner profile.

**Right column (sticky top:0):**

1. **Next payout card** — gradient `linear-gradient(160deg, var(--terracotta-50), var(--cream-100))`, borderRadius 22, border border-warm:
   - Eyebrow "Next payout"
   - "$1,820" numeral terracotta-600 fontSize 38
   - "Tue, May 5 · Direct deposit" ink-500 fs12
   - Horizontal divider
   - 4 rows (justifyContent space-between, fs13):
     - Completed jobs · 6 (bold)
     - Gross earnings · $2,015 (bold)
     - Platform fee · −$195 (ink-500)
     - Tips received · +$0 (ink-500)
   - "View full payout breakdown" quiet-sm button (background white, full width, marginTop 12)

2. **Verification status card** (card-pad) — eyebrow + 4 rows (flex, gap 10):
   Each: 22x22 circle (sage-50 bg, sage-700 color) with check icon · title bold fs13 · sub ink-500 fs11
   - Business license · Verified · expires Aug 2027
   - Liability insurance · Verified · $2M coverage
   - Background check · Verified · Mar 2026
   - HOA partnerships · 3 active · Oakwood, Pinecrest, Lakeview

3. **Trades offered card** (card-pad) — eyebrow + flex wrap chips (gap 6):
   4 terracotta chips: Plumbing, Drain cleaning, Water heaters, Leak detection
   1 neutral dashed chip: "+ Add"

---

## Acceptance Criteria

- [ ] Provider dashboard has hero card, 3-item job feed, today's schedule with color bars, revenue SVG chart, stat cards, inbox preview
- [ ] Provider bids has 4-stat strip, tabs, 6 bid rows with correct status chip colors
- [ ] Provider reviews has rating summary with distribution bars, keyword tags, trend SVG line, 4 review cards
- [ ] Provider profile has identity banner, 4-col performance stats, 8-row settings list, payout card, verification rows, trades chips
- [ ] All pages use cream canvas (`var(--bg-app)`), terracotta primary, warm card style
- [ ] `tsc --noEmit` passes with zero errors

## Out of Scope
- Homeowner pages (already done in Task 502)
- Admin pages
- Sidebar changes
- Real data / API wiring
- Mobile app

## Test Steps
1. `npm run dev` from project root
2. Navigate through `/app/provider/dashboard`, `/bids`, `/reviews`, `/profile`
3. Check visual match to design files
4. Run `tsc --noEmit`

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-04-30 | Approved | Spec written by Claude, delegated to Codex |
| 2026-04-30 | Completed | Codex implemented all 4 files. tsc --noEmit passes. Playwright review passed all 4 pages. |
