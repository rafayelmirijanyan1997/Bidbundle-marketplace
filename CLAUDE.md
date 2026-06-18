# NeighBid — Project Guide

## Getting Started (New Developer Setup)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Xcode | 15+ | Mac App Store |
| CocoaPods | latest | `sudo gem install cocoapods` |

---

### 1. Web App (Next.js)

```bash
# From repo root
npm install
npm run dev
```

Opens at **http://localhost:3000**

---

### 2. API Backend (FastAPI)

```bash
cd api

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Then edit .env and fill in the values (see Environment Variables below)

# Start the server
uvicorn main:app --reload --port 8000
```

API runs at **http://localhost:8000** — health check: http://localhost:8000/health

---

### 3. iPhone App (React Native)

**Step 1 — Install JS dependencies:**
```bash
cd neighbid-iphone
npm install
```

**Step 2 — Install iOS native dependencies:**
```bash
cd ios
pod install
cd ..
```

**Step 3 — Start Metro bundler:**
```bash
npx react-native start
```

**Step 4 — Launch in simulator (in a second terminal):**
```bash
cd neighbid-iphone
npx react-native run-ios
```

Or open Xcode directly:
```
Open: neighbid-iphone/ios/NeighBidIphone.xcworkspace
Press ▶ (Run) — select an iPhone simulator target
```

The app name in the simulator is **BidBundle**.

---

### Environment Variables

Create `api/.env` with these values:

```env
# Database (local SQLite for development)
DATABASE_URL=sqlite:///./neighbid.db

# Supabase Auth (required — get from Supabase dashboard)
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-publishable-anon-key>

# OpenAI (required for AI chat features)
OPENAI_API_KEY=sk-...

# Legacy (kept for compatibility, not used for auth)
SECRET_KEY=change-me-before-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

The Supabase URL and anon key are in your Supabase dashboard under **Project Settings → API**.

---

### Demo Accounts

All demo users use password: **`Demo1234!`**

| Email | Role |
|-------|------|
| alice@neighbid.com | Homeowner |
| marcus@neighbid.com | Homeowner |
| priya@neighbid.com | Homeowner |
| profix@neighbid.com | Provider |
| greenlawn@neighbid.com | Provider |
| sparkclean@neighbid.com | Provider |
| admin@neighbid.com | Admin |

These users must exist in **both** Supabase Auth and the local SQLite database.
Run `api/supabase_demo_data.sql` in the Supabase SQL Editor to seed the Supabase database.
The local SQLite `api/neighbid.db` is included in the repo with these users pre-seeded.

---

### Auth Flow

Authentication uses **Supabase Auth** (ES256 JWT). The FastAPI backend does not issue tokens — it only verifies them.

```
Mobile/Web → Supabase signIn → JWT token
           → POST /auth/sync (links Supabase UID to DB profile)
           → All subsequent API calls use Bearer token
```

---

### Running All Three Together

Open three terminals:

```bash
# Terminal 1 — API
cd api && source .venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2 — Web
npm run dev

# Terminal 3 — Metro (iPhone)
cd neighbid-iphone && npx react-native start
```

Then in Xcode or a 4th terminal: `npx react-native run-ios`

---

## Repo Structure

```
/                        ← Next.js web app (src/)
/api/                    ← FastAPI backend
  main.py                ← app entry point, startup migrations
  auth.py                ← Supabase JWT verification (ES256/JWKS)
  dependencies.py        ← get_current_user, get_db
  database.py            ← SQLAlchemy engine (SQLite local / Postgres prod)
  models/                ← SQLAlchemy ORM models
  routers/               ← API route handlers
  schemas/               ← Pydantic request/response schemas
  services/              ← business logic (recommender, neighbourhood, etc.)
  supabase_schema.sql    ← run once in Supabase SQL Editor to create tables
  supabase_demo_data.sql ← run once in Supabase SQL Editor to seed demo data
/neighbid-iphone/        ← React Native bare CLI app (iOS)
  src/api/               ← API client, auth, Supabase client
  src/screens/           ← screen components
  src/navigation/        ← React Navigation setup
  ios/                   ← Xcode project (run pod install here)
/docs/                   ← task files, reviews, decision log
/src/                    ← Next.js pages and components
```

---

## Codebases

| Codebase | Location | Tech | Status |
|----------|----------|------|--------|
| Web | repo root | Next.js 14, Tailwind, TypeScript | Fully redesigned + backend connected |
| iPhone | `/neighbid-iphone/` | React Native (bare CLI), TypeScript | Auth wired to Supabase |
| API | `/api/` | FastAPI, SQLAlchemy, SQLite | Live — all features wired |

---

## Design System (Web)

| Token | Value |
|-------|-------|
| Canvas | `#FBF7F1` cream — `var(--bg-app)` |
| Sidebar | `#221C16` warm dark |
| Primary accent | `#C2552B` terracotta — `var(--terracotta-600)` |
| Body font | Plus Jakarta Sans |
| Display font | Fraunces (app), Instrument Serif (landing) |
| Buttons | `borderRadius: 999`, height 38px |
| Cards | `borderRadius: 18`, `border: 1px solid var(--border-warm)` |

Rules: all brand colors via CSS vars, no hardcoded hex, no Tailwind for brand colors.

---

## AI Stack

- OpenAI `gpt-4o-mini` via `api/routers/ai.py`
- Per-user memory in `ai_memory` table (scoped by `context_key`)
- Group channel AI posts replies as real messages visible to all members
- Recommendation engine in `api/services/recommender.py` (pure Python, no ML)
- `OPENAI_API_KEY` must be set in `api/.env`

---

## Claude Code Operating Rules

### Role

Claude Code is the **senior advisor, architect, UX planner, product strategist, and code reviewer**.

Claude should **not** directly code unless the user explicitly says:

```text
Claude, implement this.
```

By default, implementation must be delegated to Codex.

---

### Core Rule

Before starting any new development task, Claude must ask the user:

```text
Should I start with this task?
```

Claude should explain:
- what the task is
- why it comes next
- what Codex will implement
- what will be reviewed afterward

---

### New Session Startup — Read This First

At the start of every new session, Claude must reconstruct full project state before proposing anything. Do this in order:

**Step 1 — Read `my_prompt.md`**

`my_prompt.md` in the repo root is the single source of truth for what has been completed, what is in progress, and what the next task is.

**Step 2 — Read the relevant task files**

```
docs/tasks/           ← all web task files and their status
docs/03-phases/phase-roadmap.md
docs/reviews/         ← review outcomes per task
docs/decision-log/    ← why key decisions were made

docs/tasks/mobile/    ← iPhone app tasks (MB-*)
docs/tasks/api/       ← API tasks (API-*)
```

**Step 3 — Identify the current task**

Find the most recent task with status `In Progress` or `Pending`. Do not propose the next task until the current one is truly done.

**Step 4 — Check the codebase if needed**

| What to check | Where |
|---------------|-------|
| Web app source | `src/` |
| iPhone app source | `neighbid-iphone/src/` |
| Web design tokens | `src/app/globals.css`, `tailwind.config.ts` |
| API backend | `api/main.py`, `api/routers/` |
| Shared types | `src/types/index.ts` |

---

### Claude Responsibilities

Claude must:
1. Read `my_prompt.md` and relevant task files at session start.
2. Understand current project state before proposing work.
3. Ask approval before every task.
4. Write Codex-ready task specs.
5. Review Codex output after every implementation.
6. Run a Playwright browser check after web UI tasks.
7. Update task file status at every stage.
8. Append to the task update log after every cycle.
9. Keep scope controlled — no unasked-for features.

Claude must not:
- Start implementation without user approval.
- Code large features directly (use Codex).
- Skip review after Codex finishes.
- Jump to a later task without completing the current one.
- Add backend/AI/database features before they are approved.
- Rebuild completed web work unless explicitly asked.

---

### Codex Responsibilities

Codex writes code. Codex should:
- Implement only the approved task spec.
- Follow the spec exactly — no extra features.
- Keep changes small and modular.
- Run available type checks (`tsc --noEmit`).
- Avoid unrelated refactors.
- Use AsyncStorage (not localStorage) in the mobile project.
- Use React Native components (not HTML/DOM) in the mobile project.

---

### Required Task Spec Format

Every task file must include:

1. Task title
2. Task status
3. Goal
4. Why this task comes now
5. What Codex will implement (detailed, file by file)
6. Files to create or modify
7. Acceptance criteria
8. Test steps
9. Out of scope
10. Codex implementation prompt
11. Task update log

---

### Task Status Values

- `Pending` — written, not yet approved
- `Approved` — user said yes, not started
- `In Progress` — Codex is implementing
- `In Review` — Claude is reviewing
- `Changes Requested` — fixes needed from Codex
- `Completed` — accepted and done
- `Blocked` — cannot proceed, reason documented

---

### Task Update Log Rules

After every implementation/review cycle, append a dated entry recording:
- new status
- what Codex completed
- key files changed
- any post-fixes Claude applied
- review reference if created
- required follow-up work

---

### Review Format

Every review file must include:

1. Task reviewed
2. Summary verdict (Accept / Changes Requested / Reject)
3. Browser/device check performed (Playwright for web, Expo Go for mobile)
4. What works
5. Issues found
6. Missing requirements
7. UX/responsive concerns
8. Code quality concerns
9. Required fixes for Codex
10. Optional improvements
11. Final recommendation
