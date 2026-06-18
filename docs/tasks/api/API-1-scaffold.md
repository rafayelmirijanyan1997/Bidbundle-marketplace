# API-1 — FastAPI Scaffold

**Status:** Completed
**Depends on:** Nothing — greenfield

---

## Goal

Bootstrap the FastAPI backend project at `/api/`. By the end of this
task the server starts, connects to SQLite, and returns a health check.
No auth, no business logic yet — clean foundation for API-2 onward.

## Why This Task Comes Now

Auth and endpoints cannot be built on nothing. Getting the project
structure, database connection, and dev server right first prevents
restructuring in every later task.

---

## What Codex Will Implement

### Project bootstrap

```
api/
  main.py
  database.py
  models/__init__.py
  schemas/__init__.py
  routers/__init__.py
  dependencies.py
  requirements.txt
  .env.example
  alembic.ini
  alembic/env.py
  alembic/versions/   (empty, first migration added in API-2)
```

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NeighBid API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
```

### database.py

- SQLAlchemy 2.0 engine pointed at `sqlite:///./neighbid.db`
- `SessionLocal` factory
- `Base` declarative base
- `get_db` dependency (yields session, closes on exit)

### requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
alembic==1.13.1
pydantic[email]==2.7.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.1
python-multipart==0.0.9
```

### .env.example

```
SECRET_KEY=change-me-before-production
DATABASE_URL=sqlite:///./neighbid.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Alembic config

- `alembic init alembic` already run (Codex creates files manually)
- `alembic/env.py` imports `Base` from `database.py` and reads
  `DATABASE_URL` from environment

### dependencies.py

```python
from database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Files to Create

```
api/main.py
api/database.py
api/models/__init__.py
api/schemas/__init__.py
api/routers/__init__.py
api/dependencies.py
api/requirements.txt
api/.env.example
api/alembic.ini
api/alembic/env.py
api/alembic/script.py.mako
api/alembic/versions/.gitkeep
```

---

## Acceptance Criteria

1. `cd api && pip install -r requirements.txt` completes without errors
2. `uvicorn main:app --reload` starts the server on port 8000
3. `GET http://localhost:8000/health` returns `{"status": "ok", "version": "0.1.0"}`
4. `GET http://localhost:8000/docs` loads the Swagger UI
5. `neighbid.db` SQLite file is created on first run
6. `alembic current` runs without error (no migrations yet — that's fine)
7. No Python type errors (mypy or just visually clean)

---

## Out of Scope

- No user model yet (API-2)
- No auth (API-2)
- No business logic (API-3+)
- No PostgreSQL config yet

---

## Codex Implementation Prompt

```
Create a FastAPI backend scaffold at /api/ (relative to the repo root
/Users/lancedsilva/Documents/neighbid-claude-codex-starter/).

Do NOT touch /src/ (Next.js web) or /neighbid-mobile/ (Expo app).
Only create files inside /api/.

Implement exactly:
1. main.py — FastAPI app with CORS for localhost:3000 and localhost:19006,
   one /health GET endpoint returning {"status": "ok", "version": "0.1.0"}
2. database.py — SQLAlchemy 2.0, SQLite engine at sqlite:///./neighbid.db,
   SessionLocal, Base, get_db dependency
3. dependencies.py — get_db function only
4. models/__init__.py, schemas/__init__.py, routers/__init__.py — empty __init__ files
5. requirements.txt — exact versions listed in the task spec
6. .env.example — SECRET_KEY, DATABASE_URL, ACCESS_TOKEN_EXPIRE_MINUTES,
   REFRESH_TOKEN_EXPIRE_DAYS
7. alembic.ini + alembic/env.py — configured to use Base.metadata from
   database.py, reads DATABASE_URL from .env
8. alembic/script.py.mako — standard Alembic template
9. alembic/versions/.gitkeep — empty file so the directory exists

After creating all files, run:
  cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter/api
  pip install -r requirements.txt
  python -c "from main import app; print('OK')"

Fix any import errors found.
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Approved and implemented by Codex. All 7 acceptance criteria verified live: /health returns 200, /docs loads Swagger UI, neighbid.db created, alembic current runs clean. Status: Completed.
