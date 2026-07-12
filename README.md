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
| Auth | Firebase Auth |
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
# Fill in FIREBASE_SERVICE_ACCOUNT_PATH and OPENAI_API_KEY in .env
alembic upgrade head
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000`

---

### 2. Web App

```bash
npm install
cp .env.example .env.local
# Fill in the NEXT_PUBLIC_FIREBASE_* values — see Environment Variables below
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

**`api/.env`:**

```env
DATABASE_URL=sqlite:///./neighbid.db
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
OPENAI_API_KEY=sk-...
SECRET_KEY=change-me-before-production
```

`firebase-service-account.json` is a private key downloaded from **Firebase Console → Project Settings → Service accounts → Generate new private key**. It's gitignored and must never be committed.

**`.env.local`** (repo root, for the web app):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

These come from **Firebase Console → Project Settings → General → Your apps → Web app**.

**A note on the Firebase project:** unlike the backend/web env vars above, the iOS app's Firebase config (`neighbid-iphone/ios/NeighBidIphone/GoogleService-Info.plist`) is *already committed* to this repo — it's not a secret (it ships inside every built app binary regardless). That means a fresh clone's iOS build works out of the box, but it's wired to this project's specific Firebase backend. To actually sign in/register real users, you need either access to that Firebase project (ask to be added as a collaborator) or to swap in your own project's plist, service account, and web config across all three files above.

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

There's no pre-seeded demo data — a fresh `alembic upgrade head` gives you empty tables, and there's currently no seed script (the old Supabase-based one was removed during the Firebase migration). Register through the app's normal sign-up flow to create accounts for each role while testing:

| Role | Where to sign up |
|------|-------------------|
| Homeowner | Web or iOS "Get started" flow |
| Provider | Web or iOS "Get started" flow, select Provider |
| HOA Manager | Web or iOS "Get started" flow, select HOA Manager |
| HOA Homeowner | Accept an HOA manager's invite code |
