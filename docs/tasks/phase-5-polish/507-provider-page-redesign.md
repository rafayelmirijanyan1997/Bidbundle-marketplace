# Task 507 — Provider Pages Redesign (Job Feed, Messages, Schedule, Earnings)

**Status:** Completed

## Goal

Full rewrite of 4 provider pages to match the updated design files in
`claude_website_designs/`. Each file must be ported faithfully as TSX using
inline styles and the warm design tokens already in `globals.css`.

## Design source files (READ ALL BEFORE IMPLEMENTING)

- `claude_website_designs/provider-jobfeed.jsx`
- `claude_website_designs/provider-messages.jsx`
- `claude_website_designs/provider-schedule.jsx`
- `claude_website_designs/provider-earnings.jsx`

## Files to rewrite

| File | Action |
|------|--------|
| `src/app/app/provider/job-feed/page.tsx` | Full rewrite |
| `src/app/app/provider/messages/page.tsx` | Full rewrite |
| `src/app/app/provider/schedule/page.tsx` | Full rewrite |
| `src/app/app/provider/earnings/page.tsx` | Full rewrite |

---

## Shared rules

- All pages: `"use client"` at top, `var(--bg-app)` wrapper, `minHeight: "100vh"`
- All inline styles use CSS custom properties from globals.css
- No new component imports — all SVG icons defined inline per file
- Preserve existing hooks: `useProviderJobFeed`, `useProviderMessages`, `useProviderSchedule`, `useProviderEarnings` where they exist
- Keep loading/empty states already wired in each page
- The `ProviderSidebar` from the JSX designs is NOT needed (sidebar comes from AppBottomNav)

## Color/token reference (all already in globals.css)

```
--bg-app: #FBF7F1          --bg-card: #FFFFFF
--ink-900: #1F1A14         --ink-700: #3D362B
--ink-500: #6E6557         --ink-400: #8C8273
--cream-50: #FBF7F1        --cream-100: #F5EFE5
--cream-200: #EDE4D3       --cream-300: #E0D4BD
--terracotta-600: #C2552B  --terracotta-500: #D26B3F
--terracotta-400: #E08758  --terracotta-100: #F7DDCB
--terracotta-50: #FBEEE3
--sage-700: #4A6A4D        --sage-600: #5C7E60
--sage-500: #7A9A7E        --sage-100: #DCE7DD
--sage-50: #EBF1EC
--gold-600: #B8862B        --gold-500: #D6A23E
--gold-100: #F2E2B8        --gold-50: #F8EFD6
--plum-600: #7A4A6E        --plum-100: #E5D2DF
--border-warm: #ECE3D2     --border-warm-strong: #D7CFBF
--shadow-warm-sm: 0 1px 2px rgba(31,26,20,0.04), 0 1px 1px rgba(31,26,20,0.03)
--font-display: Fraunces   --font-body: Plus Jakarta Sans
```

## Avatar colour gradients

```
av-sage:       linear-gradient(135deg,#7A9A7E,#4A6A4D)
av-plum:       linear-gradient(135deg,#B07AA0,#7A4A6E)
av-blue:       linear-gradient(135deg,#6F8DB8,#3F608E)
av-gold:       linear-gradient(135deg,#D6A23E,#B8862B)
av-terracotta: linear-gradient(135deg,#E08758,#C2552B)
```

---

## Page 1 — Job Feed (`provider-jobfeed.jsx`)

**Layout:** Topbar + scroll area with `display:grid, gridTemplateColumns:"1fr 320px", gap:22`

### Topbar
- h1: "Job feed"
- subtitle: "5 live group RFPs · 3 closing today · matched to your trades & 8 mi service area"
- Right buttons: Search ghost | Saved quiet (count 4) | Auto-bid settings primary

### Left column

**Filter row** (flex, gap 6, flexWrap wrap):
- Trade pills: "All trades" (active: ink-900 bg, white text), "Plumbing", "HVAC", "Lawn", "Cleaning", "Handyman" (inactive: transparent bg, ink-700)
- Separator (1px × 22px, border-warm)
- Filter pills: "Within 5 mi" ghost-sm, "$500+" ghost-sm, "Closing today" ghost-sm
- flex:1 spacer
- "Sort: Best match ↓" ghost-sm

**Featured job card** (card style, padding:0, overflow:hidden, position:relative):

Chips overlaid top-left (position absolute, top 16, left 16):
- "Top match · 96%" terracotta-dot chip
- "Closes in 6h 12m" gold chip

Banner (height 130, gradient linear-gradient(135deg, terracotta-100, cream-200 60%, sage-100)):
- SVG of 8 schematic houses (exact SVG from design file)

Body (padding 20px 28px 22px):
- Left: Fraunces 26px title "Whole-block plumbing inspection"
- Sub: "Maple St · Oakwood Heights · 2.1 mi · 8 homes" (ink-500, 13px)
- Description paragraph: "HOA-led inspection ahead of spring..." (ink-700, 14px, lh 1.55)
- Right: eyebrow "Bid range", numeral "$1,800–2,400" terracotta-600 30px, sage "+~$2,100 likely revenue"
Bottom row (flex space-between):
- 4 neighbour avatars (#E08758, #7A9A7E, #B07AA0, #5C7E60 each 28px) + "+4" neutral avatar
- "8 neighbors joined · 3 are repeat customers" text
- Save ghost-sm | View details quiet-sm | Submit bid primary

**Job list** (flex col, gap 10):
7 rows, each card (padding 16px 22px, grid `auto 1fr 100px 130px auto`, gap 18, alignItems center):

| # | av | Icon | Title | Tag | Loc/homes/ends | Match% bar | Range | Buttons |
|---|---|---|---|---|---|---|---|---|
| 1 | av-sage | Leaf | Lawn care · 8-week season | sage "Recurring" | Lakeview Park · 3.4 mi · 6h · ends 23h | 88% | $1,440–2,560 | Save ghost / Bid primary |
| 2 | av-plum | Broom | Gutter cleanup | terracotta "New" | Oakwood Heights · 1.8 mi · 2h · ends 32h | 81% | $240–440 | |
| 3 | av-blue | Wrench | Water heater service | gold "High value" | Pine Ave · 4.0 mi · 4h · ends 2d 4h | 74% | $2,720–4,400 | |
| 4 | av-gold | Broom | Driveway pressure wash | sage "Repeat block" | Cedar Ln · 2.8 mi · 5h · ends 3d | 70% | $540–820 | |
| 5 | av-terracotta | Wrench | Backflow testing | (none) | Birch Ct · 5.1 mi · ends 4d | 68% | $640–960 | |
| 6 | av-sage | Leaf | Tree trimming · seasonal | (none) | Willow Way · 2.4 mi · ends 5d | 64% | $960–1,400 | |
| 7 | av-blue | Wrench | HVAC tune-up bundle | plum "Cross-trade" | Sycamore Dr · 3.9 mi · ends 6d | 62% | $1,120–1,680 | |

Match% column shows: a horizontal progress bar (h:5, cream-200 bg, terracotta-500 fill at `match%` width) + "88%" text (ink-500, 11px, fontWeight 600) + "match score" label below (ink-400, 11px)

### Right rail (320px, flex col, gap 14)

**Auto-bid card** (card-pad, background linear-gradient(160deg, sage-50, white)):
- Eyebrow: "Auto-bid is ON" (ON in sage-700)
- Sub: "We'll draft a quote when a job matches ≥85% within 5 mi. You approve before sending."
- 2 buttons: Pause quiet-sm (white bg) | Edit rules ghost-sm

**Closing soon card** (card-pad):
- Eyebrow: "Closing soon"
- 3 rows: "Plumbing inspection" + "6h 12m" terracotta chip | "Lawn care · 8-week" + "23h" gold chip | "Gutter cleanup" + "32h" gold chip

**Service map card** (card-pad):
- Eyebrow: "Service map"
- Map SVG (exact from design: 280×140, sage terrain path, dashed gold road, terracotta radius circle, 6 job dots, center marker)
- Footer: "Radius: 8 mi" + "Adjust →" terracotta link

**Bidding tip card** (card-pad, cream-100 bg):
- Fraunces 16px "Bidding tip"
- "Crews who quote within 2 hours of a group RFP win 3.4× more often."

---

## Page 2 — Messages (`provider-messages.jsx`)

**Layout:** full height, THREE-column grid: `340px 1fr 300px`, overflow:hidden, NO topbar wrapper.

Wrap the whole page: `<div style={{ height:"calc(100vh)", display:"grid", gridTemplateColumns:"340px 1fr 300px", overflow:"hidden", background:"var(--bg-app)" }}>`

### Column 1 — Thread list (340px, white bg, borderRight border-warm)

Header (padding 22px 22px 14px):
- Fraunces h1 "Inbox" (24px) + "4 unread · 7 active threads" (ink-500, 12px)
- Search input (height 36, borderRadius 10, cream-50 bg, border border-warm, search icon absolute left 12)
- Filter chips row: "All" (ink-900 bg, white) | "Unread 4" (terracotta count) | "Active jobs"

Thread rows (7 total, grid `auto 1fr auto`, gap 12, borderBottom, padding 12px 22px):
Active thread (Sarah M.) has: `background: cream-100, borderLeft: "3px solid var(--terracotta-500)"`
Inactive threads: `borderLeft: "3px solid transparent"`

| mk | av | name | preview | time | job tag | unread |
|---|---|---|---|---|---|---|
| SM | av-plum | Sarah M. | When can your team start? | 12m | Plumbing · 3 homes | 2 terracotta |
| JK | av-blue | James K. | Thanks for the quick quote! | 1h | Inspection · solo | 1 |
| AP | av-sage | Aisha P. · HOA | New group RFP for your block | 3h | Block service | 1 |
| DL | av-gold | David L. | Receipt received, thanks ProFix! | Yest | Water heater | — |
| PA | av-terracotta | Priya A. | Could we move the appt to Friday? | Mon | Drain repair | — |
| LO | av-gold | Lulu O. | Left a 5-star review! | Mar 22 | Block service · 8 | — |
| TB | av-blue | Tom B. | No water in the kitchen... | Mar 18 | Emergency call | — |

Each row: avatar (36×36, fontSize 12) | name+preview+job-chip | unread chip

### Column 2 — Active conversation (flex col, cream-50 bg)

Header (padding 18px 28px, white bg, borderBottom, flex space-between):
- Left: SM avatar (40×40 av-plum) + "Sarah Morrison" (Fraunces 18px) + "Verified neighbor" sage-dot chip + "Maple St · Plumbing inspection · 3 homes" sub
- Right: "View bid" ghost-sm | "Schedule visit" quiet-sm

Messages area (flex:1, overflowY auto, padding 24px 28px, flex col, gap 12):
- Date label "Today · April 29" (centered, cream-100 bg, borderRadius 999, ink-400)
- 5 messages alternating them/me:
  - "them" bubble: white bg, border border-warm, borderBottomLeftRadius 4
  - "me" bubble: terracotta-600 bg, white text, box-shadow terracotta, borderBottomRightRadius 4
  - Full message text from design file
- Typing indicator: 3 dots (5×5 circles, ink-300) + "Sarah is typing…" (12px, ink-500)

Composer (padding 18, borderTop, white bg):
- Quick-reply chips: "Send Friday confirmation" (terracotta-50 bg, terracotta-600 text, spark icon) | "📅 Share calendar invite" | "💵 Send updated quote"
- Input bar (flex, padding 10px 14px, cream-50 bg, border border-warm, borderRadius 14): paperclip icon | input "Reply to Sarah…" | Send primary-sm button

### Column 3 — Context rail (300px, white bg, borderLeft, padding 22, flex col, gap 18, overflowY auto)

**Job context** section:
- Eyebrow "Job context"
- Card (cream-50 bg): "Plumbing inspection" bold 14px | "Maple St · 3 homes" muted | divider | key-value rows:
  - Bid amount · $570 (numeral)
  - Status · "Awaiting decision" gold chip (height 18, fontSize 10)
  - Submitted · Apr 27

**About Sarah** section:
- Eyebrow "About Sarah"
- Key-value rows (fontSize 12): Member since Aug 2023 | Jobs together 2 | Avg payment 6 days | Rating left for you ★ 4.9 avg

**Shared files** section:
- Eyebrow "Shared files"
- 2 file rows (cream-50 bg, borderRadius 8, padding 8px 10px, fontSize 12): paperclip icon + filename
  - quote-april.pdf
  - before-photos.zip

---

## Page 3 — Schedule (`provider-schedule.jsx`)

**Layout:** Topbar + scroll area with `display:grid, gridTemplateColumns:"1fr 300px", gap:22`

### Topbar
- h1: "Schedule"
- subtitle: "Apr 28 – May 4 · 12 jobs · 28 hrs booked"
- Right: ← back ghost | Today quiet | → forward ghost | separator | Day/Week/Month toggle (cream-100 bg, borderRadius 10, padding 3; active "Week" = white bg + shadow-sm) | "+ Block time" primary

### Left — Calendar grid (card, padding:0, overflow:hidden)

**Day header row** (grid `60px repeat(7,1fr)`, borderBottom):
- First cell: "EDT" label (11px uppercase, ink-400)
- 7 day cells (padding 14px 16px, textAlign center, borderLeft border-warm each):
  - Day label: "Mon"/"Tue" etc. (11px uppercase, ink-500, fontWeight 600)
  - Date number: Fraunces numeral 22px (terracotta-600 for today Tue 29, else ink-900)
  - Job count: "2 jobs" (11px, ink-500)

**Grid body** (position:relative, grid `60px repeat(7,1fr)`, height:540):
- Time column (flex col): 6 hour labels ["8 AM","10 AM","12 PM","2 PM","4 PM","6 PM"] each flex:1, borderTop border-warm, fontSize 10, ink-400, textAlign right, fontFamily var(--font-mono)
- 7 day columns each (position:relative, borderLeft, height:540):
  - Today column (Tue, index 1): background rgba(194,85,43,0.025)
  - 6 empty slot dividers (height:90, borderTop:1px solid border-warm)
  - Event blocks positioned absolutely: `top: event.start * 90px, left:4, right:4, height:(event.h*90-4)px`
  - Event block style: `background: tone bg color, borderLeft: 3px solid tone fg color, borderRadius:8, padding:8px 10px`
  - Event title: toneFg color, fontWeight 700, 12px
  - Event sub: ink-700, 11px
  - Today's current-time indicator: absolute div at `top:235`, borderTop `2px solid terracotta-500` + 8px circle dot left:-5

**Event data** (exact from design, 10 events):
```
day:1,start:0.5,h:1.5 → "Lawn — Oak St" / "5 homes" / sage
day:1,start:2.7,h:1.5 → "Plumbing — Maple" / "3 homes" / terracotta
day:1,start:4.0,h:2.0 → "Water heater — Pine" / "4 homes" / gold
day:0,start:1.0,h:2.0 → "Gutter clean" / "2 homes" / gold
day:0,start:3.5,h:1.5 → "Inspection" / "1 home" / plum
day:2,start:0.7,h:1.8 → "Backflow tests" / "4 homes" / terracotta
day:2,start:3.2,h:1.5 → "Lawn — Cedar Ln" / "6 homes" / sage
day:3,start:0.3,h:2.5 → "Block plumbing" / "8 homes" / terracotta
day:3,start:3.5,h:1.0 → "Drain repair" / "1 home" / terracotta
day:4,start:1.0,h:3.0 → "HVAC tune-up" / "7 homes" / plum
```

Tone colour mapping:
- sage bg: sage-100, fg: sage-700
- terracotta bg: terracotta-100, fg: terracotta-600
- gold bg: gold-100, fg: gold-600
- plum bg: plum-100, fg: plum-600

### Right rail (300px, flex col, gap 14)

**Today's run card** (card-pad):
- Eyebrow "Today · Tue Apr 29"
- Numeral "3 jobs · 5 hrs" (26px) + "Est. revenue $1,450" (ink-500)
- Divider
- 3 job rows (grid `4px 1fr`, gap 12): left coloured bar (4px wide, tone fg colour, borderRadius 2) + time numeral + title + dur/distance + tone status chip
  - 9:00 / Lawn — Oak St / 2h · 0.4 mi / sage "En route"
  - 13:30 / Plumbing — Maple / 1.5h · 2.1 mi / terracotta "Up next"
  - 16:00 / Water heater — Pine / 2h · 4.0 mi / gold "Scheduled"

**Availability card** (card-pad):
- "Open for new jobs" (13px bold) + "Auto-accept up to 2/day" (11px muted)
- Toggle ON (40×22, sage-500 bg, white circle right)
- Divider
- Key-value rows (12px): Working hours 7 AM–6 PM | Days off Sun | Buffer 30 min

**Conflicts card** (card-pad, cream-100 bg):
- "3 conflicts detected" (13px bold)
- "Thu has 4 jobs in 2-hr windows. Consider buffer."
- "Auto-resolve" quiet-sm button (white bg, full width)

---

## Page 4 — Earnings (`provider-earnings.jsx`)

**Layout:** Topbar + scroll area with `display:grid, gridTemplateColumns:"1fr 320px", gap:22`

### Topbar
- h1: "Earnings"
- subtitle: "April 2026 · 14 jobs · $12,420 gross"
- Right: Download CSV ghost | Tax docs quiet | Forecast primary (spark icon)

### Left column (flex col, gap 18)

**Headline + chart card** (card-pad):
- Row: Left = eyebrow "Gross revenue · 6 mo" + numeral "$54,720" (48px terracotta-600) + "+18% MoM" sage-dot chip + sub "Net after fees: $49,248 · 84 jobs · avg $651/job" (13px ink-500 with bold net value)
- Right = Week/30d/6mo/Year toggle (cream-100 bg, borderRadius 10, padding 3; "6mo" active = white bg + shadow-sm)

**Bar chart** (height 220, flex alignItems flex-end, gap 18, position relative):
- Background gridlines overlay (absolute, inset 0, flex col justify space-between, pointer-events none):
  - 4 rows: "$15k", "$10k", "$5k", "$0" (10px, ink-400, font-mono, width 36) + dashed divider line
- Left spacer (width 36)
- 6 month bars: Nov($6,800), Dec($7,200), Jan($8,100), Feb($9,400), Mar($10,800), Apr($12,420)
  - Each: flex:1, flex col, gap 8, position relative, zIndex 1
  - Bar: height = (value/max)*90%, gradient `to top, terracotta-600 to terracotta-400` for Apr, else `to top, cream-300 to terracotta-100`
  - Apr bar has tooltip: absolute, top:-32, centered, ink-900 bg, white text, "$12,420"
  - Month label: 11px, ink-500, fontWeight 600

**Revenue by trade + Win/loss grid** (grid 1.5fr 1fr, gap 18):

Left — "Revenue by trade" card (card-pad):
- 4 trade rows with progress bars:
  - Plumbing & leaks $6,840 (55%) terracotta-500
  - Water heaters $2,980 (24%) gold-500
  - Drain cleaning $1,640 (13%) sage-500
  - Inspections $960 (8%) plum-600
  - Each: title + amount + % right-aligned, bar (height 8, cream-200 bg, tone fill)

Right — "Win/loss" card (card-pad):
- SVG donut chart (160×160): grey circle (stroke cream-200, sw 20) + coloured arc (terracotta-500, dasharray 377, dashoffset 30, rotate -90deg, round linecap)
- Centre: "92%" numeral (32px terracotta-600) + "win rate" (11px ink-500)
- Divider
- Key-value rows (12px): Bids submitted 38 | Won 35 | Avg time to bid 1h 42m

**Transactions card** (card, padding 0):
- Header (padding 18px 22px): eyebrow "Transactions · April" + chips: All(ink-900/white) | Income | Fees | Pending
- Divider
- 7 transaction rows (grid `60px 1fr auto auto`, gap 14, borderTop on each after first):
  | Date | Title + sub | Status chip | Amount |
  |Apr 28|Plumbing inspection / Maple St · 3 homes|gold Pending|+$570|
  |Apr 26|Lawn care bundle / Oak St · 5 homes|sage Cleared|+$720|
  |Apr 24|Platform fee / April invoice|neutral Auto|−$195|
  |Apr 22|Water heater service / Pine Ave · 4 homes|sage Cleared|+$880|
  |Apr 18|Block plumbing / Maple St · 3 homes|sage Cleared|+$3,325|
  |Apr 12|Tip from James K. / Inspection|sage Cleared|+$50|
  |Apr 10|Handyman block / Elm Ct · 2 homes|sage Cleared|+$680|
  
  Amount: sage-700 for positive, ink-500 for negative. Use `+` or `−` prefix.

### Right rail (320px, flex col, gap 14)

**Next payout card** (card-pad, background linear-gradient(160deg, terracotta-600, terracotta-500), color white, border:0):
- Eyebrow "Next payout" (rgba(255,255,255,0.75), uppercase, 11px)
- "$1,820" numeral (38px, white)
- "Tue, May 5 · Direct deposit" (12px, rgba(255,255,255,0.85))
- Divider (borderColor rgba(255,255,255,0.2))
- Key-value rows (13px): Cleared $2,015 | Platform fee −$195 | Tips +$0
- "View payout breakdown" button-sm (white bg, terracotta-600 text, full width)

**YTD summary card** (card-pad):
- Eyebrow "YTD summary"
- Key-value rows (12px): Gross $54,720 | Net $49,248 | Tips $1,140 | Tax set-aside $11,800
- "Download 1099" quiet-sm (full width)

**Goal card** (card-pad):
- Eyebrow "Goal · April"
- "$12,420" numeral (22px) + "of $14,000" (ink-500 12px)
- Progress bar (cream-200 bg, terracotta-sage gradient fill at 88%)
- "$1,580 to go · 3 days left" (11px, sage-700, bold)

**Forecast card** (card-pad, cream-100 bg):
- Row: spark icon (terracotta-600) + "Forecast" (Fraunces 16px)
- "Based on your last 6 months and 5 active bids, you're on pace for $13,800 in May." (13px, ink-700; $13,800 bold terracotta-600)

---

## Acceptance Criteria

- [ ] Job feed: 2-column layout, featured card with SVG banner + 8 home icons, match% progress bars on each row, right rail (auto-bid, closing soon, service map SVG, tip)
- [ ] Messages: 3-column layout, thread list with left-border active state, context rail with job details + client info + files
- [ ] Schedule: week calendar grid (7 columns, time labels, positioned event blocks with tone colours, current-time indicator), today run sheet
- [ ] Earnings: 6-bar chart with gridlines + Apr tooltip, revenue by trade bars, donut SVG win/loss, transactions table, terracotta gradient payout card
- [ ] All warm tokens (cream canvas, terracotta accent, warm shadows)
- [ ] `tsc --noEmit` zero errors

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude from new design files |
| 2026-05-07 | Completed | Claude implemented directly (Codex sandboxed). tsc clean. Playwright passed all 4 pages. |
