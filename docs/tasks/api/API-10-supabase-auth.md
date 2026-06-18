# API-10: Swap FastAPI Auth to Supabase Auth

## Status
Approved

## Goal
Replace the current HS256 self-issued JWT system with Supabase Auth.
FastAPI must verify Supabase-issued ES256 tokens (ECC P-256) using the
public key fetched from Supabase's JWKS endpoint. No passwords are
stored or checked in the database.

## Why this comes now
The database has been migrated to Supabase PostgreSQL. Auth must follow
so the full stack uses Supabase consistently.

---

## What Codex will implement

### 1. `api/auth.py` — replace HS256 logic with JWKS/ES256 verify

Remove: `hash_password`, `verify_password`, `create_access_token`,
`create_refresh_token`, `decode_token` (HS256 variants).

Add a module-level JWKS cache and a single public function:

```python
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_jwks_cache: dict = {}

def _get_jwks() -> dict:
    """Fetch and cache Supabase JWKS. Refresh if empty."""
    global _jwks_cache
    if not _jwks_cache:
        import httpx
        resp = httpx.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json", timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache

def verify_supabase_token(token: str) -> dict:
    """
    Verify a Supabase-issued JWT (ES256).
    Returns the decoded payload on success.
    Raises HTTP 401 on failure.
    """
    from jose import jwt, JWTError
    from jose.utils import base64url_decode
    import json, base64

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        jwks = _get_jwks()
        # jose can accept a JWKS dict directly
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            options={"verify_aud": False},  # Supabase may omit aud claim
        )
        return payload
    except Exception:
        raise credentials_exception
```

Keep the file minimal — only `verify_supabase_token` and `_get_jwks`.

---

### 2. `api/dependencies.py` — use supabase_uid lookup

Replace:
```python
from auth import decode_token
...
token_data = decode_token(token)
user = db.query(User).filter(User.id == token_data.user_id).first()
```

With:
```python
from auth import verify_supabase_token
...
payload = verify_supabase_token(token)
supabase_uid = payload.get("sub")
user = db.query(User).filter(User.supabase_uid == supabase_uid).first()
if user is None:
    raise HTTPException(status_code=401, detail="User not found. Call /auth/sync first.")
```

`require_role` stays unchanged — it depends only on `get_current_user`.

---

### 3. `api/routers/auth.py` — replace login/register with sync endpoint

**Remove** these routes entirely (Supabase Auth handles them now):
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`

**Replace** with a new `POST /auth/sync` endpoint:

```python
class SyncIn(BaseModel):
    role: str                        # homeowner | provider | admin
    full_name: str | None = None
    phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None

@router.post("/sync")
def sync_user(
    payload: SyncIn,
    token_payload: dict = Depends(get_token_payload),  # raw JWT payload
    db: Session = Depends(get_db),
):
    """
    Called by the frontend after Supabase Auth signup or login.
    - If user exists by supabase_uid → return their profile.
    - If user exists by email (migrated) → write supabase_uid, return profile.
    - If new user → create profile row, return it.
    """
    supabase_uid = token_payload["sub"]
    email        = token_payload.get("email", "")

    user = db.query(User).filter(User.supabase_uid == supabase_uid).first()

    if user is None:
        # Try migrated user (has email but no supabase_uid yet)
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.supabase_uid = supabase_uid
            db.commit()

    if user is None:
        # Brand-new user — create profile
        user = User(
            email=email,
            supabase_uid=supabase_uid,
            full_name=payload.full_name or email.split("@")[0],
            phone=payload.phone,
            role=payload.role,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if payload.latitude and payload.longitude:
            from services.neighbourhood import auto_join_neighbourhood_channel, find_or_create_neighbourhood
            nb = find_or_create_neighbourhood(payload.latitude, payload.longitude, db)
            user.neighbourhood_id = nb.id
            user.neighborhood = nb.name
            db.commit()

    return {"id": user.id, "email": user.email, "role": user.role, "full_name": user.full_name}
```

Add a helper dependency `get_token_payload` that returns the raw dict
(same as `get_current_user` but returns the JWT payload before DB lookup):

```python
def get_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    return verify_supabase_token(token)
```

**Keep** these routes — their business logic is unchanged, just replace
`hash_password` calls with `hashed_password=None`:
- `POST /auth/register-hoa` — remove `password` field, set `hashed_password=None`
- `POST /auth/accept-invite` — remove `password` field, set `hashed_password=None`
- `POST /auth/validate-invite` — unchanged

**Remove** `_build_token_response` and `decode_token_payload` helpers.

---

### 4. `api/requirements.txt`

Add if not present:
```
httpx>=0.27.0
```

(`python-jose[cryptography]` is already in requirements and supports ES256.)

---

### 5. `api/.env`

Add:
```
SUPABASE_URL=https://omtyrmscccjibacullie.supabase.co
SUPABASE_ANON_KEY=sb_publishable_s7TEC1mL9RkzynwFrHzbXQ_VhSQohE1
```

---

## Files to modify
- `api/auth.py` — full rewrite (smaller)
- `api/dependencies.py` — swap decode_token → verify_supabase_token
- `api/routers/auth.py` — remove login/register/refresh, add /sync, strip passwords from HOA/invite routes
- `api/requirements.txt` — add httpx
- `api/.env` — add SUPABASE_URL + SUPABASE_ANON_KEY

## Files to leave untouched
- All other routers — they use `get_current_user` / `require_role` which remain the same interface
- `api/models/user.py` — `supabase_uid` column already added via schema migration
- `api/schemas/user.py` — Token schema can be removed but don't touch other schemas

---

## Acceptance criteria
- `GET /health` still returns 200
- `POST /auth/sync` with a valid Supabase JWT creates or finds the user and returns their profile
- `GET /homeowner/dashboard` with a valid Supabase JWT returns data (not 401)
- Old `/auth/login` returns 404 (removed)
- No `hashed_password` is ever set on any user row

## Out of scope
- Frontend auth integration (web + mobile) — separate task
- Supabase Auth email templates / OAuth providers
- Row-level security (RLS) policies on Supabase

---

## Codex implementation prompt

You are implementing API-10 for the NeighBid FastAPI backend.

The goal is to replace the current HS256 self-issued JWT system with
Supabase Auth token verification (ES256, ECC P-256).

**Key facts:**
- Supabase JWKS URL: `https://omtyrmscccjibacullie.supabase.co/auth/v1/.well-known/jwks.json`
- Tokens use ES256 algorithm (ECC P-256)
- `users` table already has a `supabase_uid UUID UNIQUE` column
- `hashed_password` is already nullable — never set it to a real value

**Step 1** — Rewrite `api/auth.py`:
- Remove all HS256 functions (hash_password, verify_password, create_access_token, create_refresh_token, decode_token)
- Add `verify_supabase_token(token: str) -> dict` that fetches JWKS and verifies ES256 tokens using python-jose
- Cache the JWKS in a module-level dict

**Step 2** — Update `api/dependencies.py`:
- Import `verify_supabase_token` instead of `decode_token`
- `get_current_user`: call `verify_supabase_token`, extract `sub` as supabase_uid, query `User.supabase_uid == supabase_uid`
- Add `get_token_payload(token) -> dict` that just calls `verify_supabase_token`

**Step 3** — Update `api/routers/auth.py`:
- Delete `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` routes and their helpers
- Add `POST /auth/sync` as described in the spec (upsert user by supabase_uid or email)
- Update `register-hoa` and `accept-invite`: remove `password` field from request body, set `hashed_password=None` when creating User
- Keep `validate-invite` unchanged

**Step 4** — Add `httpx` to `api/requirements.txt`

**Step 5** — Add to `api/.env`:
```
SUPABASE_URL=https://omtyrmscccjibacullie.supabase.co
SUPABASE_ANON_KEY=sb_publishable_s7TEC1mL9RkzynwFrHzbXQ_VhSQohE1
```

Do not touch any other files. Run `python -c "from auth import verify_supabase_token; print('OK')"` from the api/ directory to verify the import works.
