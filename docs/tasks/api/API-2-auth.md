# API-2 — Auth & User Model

**Status:** Completed
**Depends on:** API-1 complete

---

## Goal

Add the User model, JWT authentication (register, login, refresh),
and a role-based dependency. Every later endpoint uses `get_current_user`
and `require_role` from this task.

---

## What Codex Will Implement

### models/user.py

```python
class User(Base):
    __tablename__ = "users"
    id: int (PK, autoincrement)
    email: str (unique, indexed)
    hashed_password: str
    full_name: str
    phone: str | None
    role: str  # "homeowner" | "provider" | "admin"
    neighborhood: str | None
    address: str | None
    is_verified: bool = False
    created_at: datetime (default utcnow)
```

### schemas/user.py

- `UserCreate` — email, password, full_name, phone, role
- `UserOut` — id, email, full_name, role, neighborhood, is_verified, created_at
- `Token` — access_token, refresh_token, token_type
- `TokenData` — user_id, role

### auth.py

- `hash_password(plain)` → bcrypt hash via passlib
- `verify_password(plain, hashed)` → bool
- `create_access_token(data, expires_delta)` → JWT (HS256, SECRET_KEY)
- `create_refresh_token(data)` → JWT with longer expiry
- `decode_token(token)` → TokenData or raises 401

### dependencies.py (updated)

- `get_current_user(token, db)` → User or 401
- `require_role(*roles)` → dependency factory that raises 403 if role not in list

### routers/auth.py

```
POST /auth/register  → creates user, returns Token
POST /auth/login     → validates credentials, returns Token
POST /auth/refresh   → validates refresh token, returns new access_token
```

### routers/users.py

```
GET  /users/me       → returns current user (requires auth)
PUT  /users/me       → update full_name, phone, address, neighborhood
```

### Alembic migration

First migration: `create_users_table`

---

## Files to Create / Modify

```
api/models/user.py           (new)
api/schemas/user.py          (new)
api/auth.py                  (new)
api/routers/auth.py          (new)
api/routers/users.py         (new)
api/dependencies.py          (updated — add get_current_user, require_role)
api/main.py                  (updated — include auth + users routers)
api/alembic/versions/001_create_users_table.py  (new migration)
```

---

## Acceptance Criteria

1. `POST /auth/register` with valid body returns `{ access_token, refresh_token, token_type }`
2. `POST /auth/login` with wrong password returns 401
3. `GET /users/me` with valid Bearer token returns user object
4. `GET /users/me` without token returns 401
5. `alembic upgrade head` creates the `users` table in SQLite
6. Passwords are stored as bcrypt hashes (never plaintext)
7. No Python errors on startup

---

## Out of Scope

- Email verification
- Password reset flow
- OAuth / social login

---

## Codex Implementation Prompt

```
Implement API-2 auth for the NeighBid FastAPI backend at /api/.

Add the User SQLAlchemy model, Pydantic schemas, JWT auth utilities,
and register/login/refresh/me endpoints.

Critical requirements:
1. Use passlib[bcrypt] for password hashing — never store plaintext
2. Access token expires in ACCESS_TOKEN_EXPIRE_MINUTES (from .env)
3. Refresh token expires in REFRESH_TOKEN_EXPIRE_DAYS (from .env)
4. get_current_user dependency reads Authorization: Bearer header
5. require_role factory raises HTTP 403 if user.role not in allowed list
6. Run: alembic revision --autogenerate -m "create_users_table"
          alembic upgrade head
   to create the migration and apply it
7. Test: python -c "from routers.auth import router; print('OK')"
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Approved and implemented by Codex. bcrypt 5.0.0 + passlib 1.7.4 compatibility patch applied in auth.py (bcrypt.__about__ shim). All 7 acceptance criteria verified live: register/login/refresh/me endpoints working, wrong password returns 401, missing token returns 401, migration at head. Status: Completed.
