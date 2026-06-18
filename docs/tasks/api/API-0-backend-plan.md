# NeighBid Backend — Master Plan

**Created:** 2026-04-25
**Stack:** FastAPI · SQLAlchemy · SQLite → PostgreSQL · Alembic · JWT

---

## Goal

Build a single REST API that serves both the Next.js web app and the
Expo mobile app. No UI — pure JSON endpoints. Starts with SQLite for
local development, migrates to PostgreSQL before any public launch.

---

## Project Location

```
/api/                  ← FastAPI project root (new, alongside /src and /neighbid-mobile)
```

---

## Tech Choices

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | FastAPI | Auto-docs, Pydantic validation, async |
| ORM | SQLAlchemy 2.0 | Mature, works with both SQLite and PostgreSQL |
| Migrations | Alembic | Standard with SQLAlchemy |
| Auth | python-jose + passlib | JWT access + refresh tokens |
| DB (dev) | SQLite | Zero setup, file-based |
| DB (prod) | PostgreSQL | When ready to deploy |
| CORS | FastAPI CORSMiddleware | Allows Next.js (3000) and Expo (19006) |

---

## Task Breakdown

| Task | Status | What it covers |
|------|--------|----------------|
| API-1 — Scaffold | ✅ Completed | Project setup, folder structure, DB connection, health check |
| API-2 — Auth | ✅ Completed | User model, register/login/refresh, JWT middleware, role guard |
| API-3 — Requests & Bids | ✅ Completed | Service requests CRUD, bid submission, grouping logic |
| API-4 — Community & Admin | ✅ Completed | HOA members, approve/decline, activity feed, reports |
| API-5 — Web Integration | 🔲 Pending | Swap Next.js mock data for real API calls |
| API-6 — Mobile Integration | 🔲 Pending | Swap Expo mock data for real API calls, store JWT in AsyncStorage |

---

## Data Models

### User
```
id, email, hashed_password, full_name, phone, role (homeowner|provider|admin),
neighborhood, address, is_verified, created_at
```

### ServiceRequest
```
id, user_id (FK), title, description, category, neighborhood,
status (draft|grouping|live|closed), budget_min, budget_max,
created_at, closes_at
```

### Bid
```
id, request_id (FK), provider_id (FK), amount, estimated_days,
status (pending|accepted|declined), created_at
```

### CommunityMember
```
id, user_id (FK), hoa_id, eligibility (verified|pending|ineligible),
address, join_date
```

### HOA
```
id, name, admin_user_id (FK), neighborhood, created_at
```

---

## API Route Map

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /users/me
PUT    /users/me

GET    /requests
POST   /requests
GET    /requests/{id}
PUT    /requests/{id}
DELETE /requests/{id}

GET    /requests/{id}/bids
POST   /requests/{id}/bids
PUT    /bids/{id}/accept
PUT    /bids/{id}/decline

GET    /community/members
PUT    /community/members/{id}/approve
PUT    /community/members/{id}/decline

GET    /admin/reports/savings
GET    /admin/activity
```

---

## Auth Flow

1. Client POSTs email + password to `/auth/login`
2. Server returns `{ access_token, refresh_token, user }`
3. Client stores tokens (localStorage for web, AsyncStorage for mobile)
4. All protected routes require `Authorization: Bearer <access_token>`
5. On 401, client uses refresh token to get a new access token

---

## CORS Config

```python
origins = [
    "http://localhost:3000",   # Next.js web
    "http://localhost:19006",  # Expo web fallback
    "exp://localhost:8081",    # Expo Go
]
```

---

## Folder Structure

```
api/
  main.py              ← FastAPI app, CORS, router includes
  database.py          ← SQLAlchemy engine + session
  models/
    user.py
    request.py
    bid.py
    community.py
  schemas/
    user.py            ← Pydantic request/response models
    request.py
    bid.py
    community.py
  routers/
    auth.py
    users.py
    requests.py
    bids.py
    community.py
    admin.py
  dependencies.py      ← get_db, get_current_user, require_role
  auth.py              ← JWT encode/decode, password hashing
  alembic/             ← migration files
  alembic.ini
  requirements.txt
  .env.example
```

---

## Next Step

**API-1 — Scaffold** is ready to start.
See `docs/tasks/api/API-1-scaffold.md`.
