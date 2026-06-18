# NeighBid — Claude Proposed Sitemap

This sitemap must now follow the provided screenshot references.
The mobile layout structure and visual language in those screenshots overrides the older dark-dashboard assumptions.

## Navigation Architecture

### Public Website
Top navbar: logo left, links center, "Get Started" CTA right.
On mobile: simplify the landing page header, but keep the visual language aligned with the splash/signup references.

### App Shell (mock-authenticated)
- **Desktop**: desktop can use wider layouts, but should still feel like an expanded version of the mobile screenshots
- **Mobile**: bottom navigation bar, max 4–5 items per role, matching the screenshot style
- Role is set on the role selection page and stored in local/mock state.

---

## Page Hierarchy

### Public Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing Page | Hero, problem, how it works, savings preview, role CTA |
| `/get-started` | Sign up / Role Selection | Create account, choose Homeowner, Provider, or HOA Admin |

> "How it works" lives as a scroll section on the landing page, not a separate route.
> A dedicated `/how-it-works` route can be added in Phase 5 Polish if needed.

---

### Homeowner App

| Route | Page | Purpose |
|-------|------|---------|
| `/app/homeowner/signup` | Homeowner Signup | Account creation styled like the reference signup screen |
| `/app/homeowner/role` | Choose Role | Homeowner selection card |
| `/app/homeowner/verify` | Verify Area | Map-style verification placeholder matching reference |
| `/app/homeowner/dashboard` | Homeowner Dashboard | Summary chips, live bidding banner, community cards |
| `/app/homeowner/ai` | AI Assistant | Chat-like request guidance flow |
| `/app/homeowner/request/:id` | Request Posted | Confirmation state with countdown and next actions |
| `/app/homeowner/community` | Neighborhood Chat | Shared thread with joined neighbors and updates |
| `/app/homeowner/bids` | Your Bids | Ranked bid cards and accept action |
| `/app/homeowner/booking/:id` | Confirm Booking | Booking confirmation and provider summary |
| `/app/homeowner/tracking/:id` | Service Tracking | Progress checklist, route/progress line, savings summary |
| `/app/homeowner/profile` | Profile | Metrics, payment placeholder, notifications, support |

**Homeowner bottom nav (mobile):** Home · Chat · Bids · Profile

---

### Provider App

| Route | Page | Purpose |
|-------|------|---------|
| `/app/provider/jobs` | Jobs / Bidding Open | Open neighborhood jobs list with orange urgency banner |
| `/app/provider/jobs/:id` | Upcoming Opportunity | Detail view with timing, pricing range, and notify action |
| `/app/provider/jobs/:id/bid` | Submit / Revise Bid | Bid entry screen with large central price input |
| `/app/provider/dashboard` | Provider Dashboard | Revenue summary, win rate, active bids, group alerts |
| `/app/provider/bids` | My Bids | Active / won / lost segmented list |
| `/app/provider/reviews` | Reviews | Customer review list |
| `/app/provider/profile` | Provider Profile | Earnings, win rate, rating, settings rows |

**Provider bottom nav (mobile):** Home · Jobs · Reviews · Profile

---

### HOA Admin App

| Route | Page | Purpose |
|-------|------|---------|
| `/app/admin/onboarding` | Admin Preview Onboarding | Community setup, role explanation |
| `/app/admin/dashboard` | Community Dashboard | Participation rates, active services, recent activity |
| `/app/admin/eligibility` | Eligibility Review | Homeowner verification queue placeholder |
| `/app/admin/analytics` | Service Analytics | Category breakdowns, bid participation charts |
| `/app/admin/savings` | Savings Overview | Estimated community savings, mock data |
| `/app/admin/settings` | Settings | Admin profile placeholder |

**Admin bottom nav (mobile):** Dashboard · Eligibility · Analytics · Savings · Settings

---

## Shared Patterns

### AI Assistant Placeholder
Appears as a chat-like inline surface within:
- Homeowner AI screen (`/app/homeowner/ai`) — suggests service categories
- Request posted flow — confirms grouping and countdown
- Bids and booking flow — explains recommended provider or savings

The AI panel shows a loading/typing animation with a placeholder response. No real AI.

### Empty States
Every list page must have a designed empty state (first time user, no data yet).

### Loading States
Skeleton cards instead of spinners where possible. Keeps the UI feeling fast.

### Error States
Simple inline error messages, no crash pages in Phase 1.

---

## Responsive Behavior Summary

| Element | Desktop | Mobile |
|---------|---------|--------|
| Public nav | Expanded header from same theme | Simplified splash/signup header |
| App nav | Expanded from mobile tab structure | Bottom tab bar |
| Cards | Wider versions of mobile cards | Single column |
| Bid screens | Multi-column only when necessary | Stacked sections |
| Forms | Centered but visually consistent with mobile cards | Full width |
| AI Panel | Inline panel or split area | Inline chat card |

---

## Out of Scope (Phase 1)

- Real authentication (no login/signup flow)
- Real database queries
- Real AI parsing
- Real-time WebSocket bidding
- Payment or escrow flow
- Map-based neighbourhood verification
- Native iOS/Android
- Email or push notifications
- Provider document upload verification

---

## First 5 Codex Implementation Tasks (after sitemap approval)

1. **Task 002** — Rebuild Frontend Foundation for the screenshot-based light mobile theme
2. **Task 101** — Splash + Landing Page based on the reference intro screen
3. **Task 102** — Signup, role selection, and area verification flow
4. **Task 201** — Homeowner dashboard, AI chat, and request-posted flow
5. **Task 202** — Homeowner chat, bids, booking, and service tracking flow
