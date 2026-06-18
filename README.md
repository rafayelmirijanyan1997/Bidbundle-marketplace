# BidBundle

BidBundle is a neighbourhood service marketplace that lets homeowners group together to get better deals from local service providers.

Instead of every homeowner calling a plumber, lawn care company, or cleaner separately, BidBundle bundles neighbours with the same need into a single group bid — driving down the price for everyone and making it worth a provider's time to show up on the same street twice.

---

## What It Does

**For homeowners**
- Post a service request (plumbing, lawn care, cleaning, HVAC, and more)
- Get automatically grouped with neighbours who need the same thing
- Receive competitive bids from local providers on the group
- Chat with your group and track the job from request to completion

**For service providers**
- Browse a live job feed of grouped requests in your area
- Bid on bundles of homes in one visit — higher value, lower travel
- Manage your schedule, bids, and earnings in one place
- Build reviews and reputation in your neighbourhood

**For HOA managers**
- Run community polls to gauge interest in a shared service
- Launch a group bid on behalf of all residents with one tap
- Manage residents, send invites, and view community activity

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Web app | Next.js 14, TypeScript, Tailwind CSS |
| iOS app | React Native (bare CLI), TypeScript |
| API | FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| Auth | Supabase Auth (JWT / ES256) |
| AI features | OpenAI GPT-4o-mini |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Xcode 15+ (for iOS)
- CocoaPods (`sudo gem install cocoapods`)

---

### 1. API Backend

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY in .env
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000`

---

### 2. Web App

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`

---

### 3. iOS App

```bash
cd neighbid-iphone
npm install
cd ios && pod install && cd ..
npx react-native start
```

In a second terminal:

```bash
cd neighbid-iphone
npx react-native run-ios
```

---

### Environment Variables

Create `api/.env`:

```env
DATABASE_URL=sqlite:///./neighbid.db
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=sk-...
SECRET_KEY=change-me-before-production
```

---

## Repo Structure

```
/                     — Next.js web app
/api/                 — FastAPI backend
  models/             — SQLAlchemy ORM models
  routers/            — API route handlers
  schemas/            — Pydantic schemas
  services/           — Business logic
  alembic/            — Database migrations
/neighbid-iphone/     — React Native iOS app
  src/screens/        — Screen components
  src/navigation/     — React Navigation
  src/api/            — API client layer
  ios/                — Xcode project
/src/                 — Next.js pages and components
/docs/                — Product docs, task specs, decision log
```

---

## User Roles

| Role | Description |
|------|-------------|
| Homeowner | Posts requests, joins groups, reviews bids |
| HOA Homeowner | Same as homeowner but part of a managed HOA community |
| Provider | Bids on grouped jobs, manages schedule and earnings |
| HOA Manager | Manages the community, runs polls, launches group bids |

---

## Demo Accounts

All demo accounts use password `Demo1234!`

| Email | Role |
|-------|------|
| alice@neighbid.com | Homeowner |
| marcus@neighbid.com | Homeowner |
| profix@neighbid.com | Provider |
| greenlawn@neighbid.com | Provider |
| admin@neighbid.com | HOA Manager |

Seed Supabase Auth by running `api/supabase_demo_data.sql` in the Supabase SQL Editor.
