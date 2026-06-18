# NeighBid — Session Startup Prompt

Read this file at the start of every session before doing anything else.

---

## What This Project Is

NeighBid is a community-powered home services bidding platform.
Neighbors group the same service request. Providers bid competitively for
the whole group. Everyone saves.

Three user roles: **Homeowner**, **Service Provider**, **HOA Admin**.

---

## Two Active Codebases

| Codebase | Location | Tech |
|----------|----------|------|
| Web app  | `/` (repo root) | Next.js 14, Tailwind CSS, TypeScript |
| Mobile app | `/neighbid-mobile/` | Expo SDK 51, Expo Router, NativeWind, TypeScript |

Both share the same warm design language: Fraunces display font, Plus Jakarta Sans body,
warm dark sidebar (`#221C16`), terracotta accent (`#C2552B`), cream canvas (`#FBF7F1`).

---

## Completed Work

### Web App — Fully Redesigned + Backend Connected

#### Design system (warm community aesthetic)
- Canvas: `#FBF7F1` cream, Sidebar: `#221C16` warm dark, Terracotta `#C2552B` primary
- Buttons: pill-shaped (borderRadius 999px), Fraunces display + Plus Jakarta Sans body
- Landing page: Instrument Serif + Inter, scroll reveal animations

#### All redesigned pages
- **Landing**: Full redesign with Instrument Serif hero, bid animation, scroll reveals
- **Homeowner**: Dashboard (cold start + real data), Chat, Bids (accept/decline), Profile
- **Provider**: Dashboard (cold start), Job Feed (featured hero + match bars), Messages (3-column), Schedule (calendar grid), Earnings (bar chart + donut), Bids, Reviews, Profile
- Additional provider pages: Job Feed, Schedule, Messages, Earnings (all redesigned May 7)

#### Backend API (FastAPI + SQLite, port 8000)

| Task | Status | What it built |
|------|--------|---------------|
| API-1 | ✅ Done | FastAPI scaffold, SQLite, Alembic |
| API-2 | ✅ Done | JWT auth (register/login/refresh) |
| API-3 | ✅ Done | Service requests + bids CRUD |
| API-4 | ✅ Done | Community + admin endpoints |
| API-6a | ✅ Done | Provider backend (profiles, schedule, messages, reviews, earnings) |
| API-6b/c | ✅ Done | Frontend API client + auth state + all provider pages wired |
| API-6d | ✅ Done | Homeowner backend + all homeowner pages wired |
| API-7 | ✅ Done | AI chat endpoints (OpenAI gpt-4o-mini, per-user memory, group channels) |
| API-8 | ✅ Done | Recommendation engine (bid scoring, job matching, group opportunities, bid price suggestion) |

#### Frontend wiring
- `src/lib/api.ts` — fetch wrapper with auth
- `src/lib/auth.ts` — JWT storage, login, register, fetchMe
- `src/hooks/` — useAuth, useProviderDashboard, useProviderJobFeed, useProviderBids, useProviderMessages, useProviderSchedule, useProviderEarnings, useProviderReviews, useProviderProfile, useHomeownerDashboard, useHomeownerRequests, useHomeownerBids, useHomeownerChat, useHomeownerProfile

#### Key backend facts
- Server: `uvicorn main:app --port 8000` from `api/` directory
- DB: `api/neighbid.db` (SQLite)
- OpenAI key: set in `api/.env` as `OPENAI_API_KEY`
- AI endpoints: `/ai/chat`, `/ai/group/{channel_id}`, `/ai/history`, `/ai/memory`
- Recommendation endpoints: `/recommendations/bids/{id}`, `/recommendations/jobs`, `/recommendations/bid-price/{id}`, `/recommendations/groups`, `/recommendations/summary`
- Group channels auto-created when a provider submits their first bid on a request

#### Testing
- `tests/test_e2e.py` — 101 tests, all passing (auth, bidding, multi-user, chat, reviews, schedule, role enforcement)

### Mobile App — DONE (MB-1 through MB-6)
All 6 mobile tasks complete. Expo app at `/neighbid-mobile/`.

---

## Current Task

**API-9 — AI Features Round 2** is the next task.

Full plan: `docs/tasks/api/API-9-ai-features-round2.md`

### Sub-tasks (all Pending):

| ID | Feature | Who | Status |
|---|---|---|---|
| 9a | Smart Request Writer | Homeowner | **START HERE** |
| 9b | Bid Drafter | Provider | Pending |
| 9c | Quote Summariser (PDF/image) | Homeowner | Pending |
| 9d | Smart Scheduling AI | Provider | Pending |
| 9e | Proactive Group Alerts | Homeowner | Pending |
| 9f | AI Dispute Mediator | Both | Pending |
| 9g | Demand Forecasting | HOA Admin | Pending |

### Session build order:
- **Session 1**: 9a + 9b (request writer + bid drafter — quickest wins)
- **Session 2**: 9c + 9d (quote summariser + smart scheduling)
- **Session 3**: 9e (proactive alerts — needs new Notification model)
- **Session 4**: 9f + 9g (dispute mediator + demand forecasting)

---

## Where to Find Everything

| What you need | Where to look |
|---------------|---------------|
| Web app pages | `src/app/` |
| Web hooks | `src/hooks/` |
| API client | `src/lib/api.ts`, `src/lib/auth.ts` |
| Sidebar | `src/components/layout/AppBottomNav.tsx` |
| Design tokens | `src/app/globals.css` |
| API backend | `api/` |
| AI router | `api/routers/ai.py` |
| Recommendation engine | `api/services/recommender.py` |
| All task specs | `docs/tasks/` |
| AI Round 2 plan | `docs/tasks/api/API-9-ai-features-round2.md` |
| Design files | `claude_website_designs/` |

---

## Active Design Decisions

- **Canvas**: `#FBF7F1` cream (`--bg-app`)
- **Sidebar**: `#221C16` warm dark, terracotta active state (bg fill + left 3px border)
- **Primary accent**: Terracotta `#C2552B` (`--terracotta-600`)
- **Body font**: Plus Jakarta Sans (`--font-body`) for app pages; Inter for landing page
- **Display font**: Fraunces for app headings; Instrument Serif for landing hero
- **Buttons**: pill-shaped (`borderRadius: 999`), `h-38` standard
- **Cards**: `--border-warm` border, `--shadow-warm-sm`, `borderRadius: 18`
- **All colors via CSS vars**: inline styles with `var(--terracotta-600)` etc.
- **Neighborhood card in sidebar**: homeowner-only section showing Oakwood Heights

---

## Known Issues / Pending

1. **API-5** — web integration with real backend partially done (provider/homeowner pages wired, landing page and admin pages still use mock data)
2. **API-6 mobile integration** — Expo app still uses mock data
3. **Admin pages** — not yet wired to backend
4. **API-9** — all 7 AI features pending (see plan above)
5. **Production build** — not tested after latest redesigns

---

## Operating Rules (always apply)

1. Read task status files before proposing anything.
2. Always ask "Should I start with this task?" before creating a task spec.
3. Delegate implementation to Codex unless user says "Claude, implement this."
4. After any implementation, review output and update task file status.
5. Never skip the task update log.
6. Never jump to a later task without completing the current one.
