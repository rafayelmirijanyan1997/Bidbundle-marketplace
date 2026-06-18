# TASK — Neighbourhood System Session 1: Location + Auto-Channel

**Status:** Approved
**Approved:** 2026-05-07

---

## Goal

Build the foundation of the neighbourhood system:
1. Capture user lat/lng at registration via browser geolocation
2. Auto-assign each user to a neighbourhood (4-mile radius cluster)
3. Auto-create one permanent general neighbourhood channel per neighbourhood
4. Auto-join every new user to their neighbourhood's general channel
5. Expose the neighbourhood channel via API so the chat can show it

---

## Product rules (must not violate)

- The 4-mile radius is a system constant. Users cannot set or change it.
- Neighbourhood membership is assigned at registration — never prompted again.
- One general neighbourhood channel per neighbourhood, forever. It never disappears.
- Per-bid subchannels (existing GroupChannel) are separate and unaffected by this task.

---

## What Codex will implement

### 1. New models — `api/models/neighbourhood.py`

Create three models in one file:

```python
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Neighbourhood(Base):
    __tablename__ = "neighbourhoods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)          # e.g. "Neighbourhood #3"
    centroid_lat: Mapped[float] = mapped_column(Float, nullable=False)
    centroid_lng: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())


class NeighbourhoodChannel(Base):
    __tablename__ = "neighbourhood_channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    neighbourhood_id: Mapped[int] = mapped_column(
        ForeignKey("neighbourhoods.id"), nullable=False, unique=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    members: Mapped[list["NeighbourhoodChannelMember"]] = relationship(
        "NeighbourhoodChannelMember", lazy="selectin"
    )


class NeighbourhoodChannelMember(Base):
    __tablename__ = "neighbourhood_channel_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    channel_id: Mapped[int] = mapped_column(ForeignKey("neighbourhood_channels.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("channel_id", "user_id", name="uq_ncm_channel_user"),
    )
```

---

### 2. Update `api/models/user.py`

Add three new columns to the `User` model:

```python
from sqlalchemy import Float, ForeignKey
# (already has other imports)

latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
neighbourhood_id: Mapped[Optional[int]] = mapped_column(
    ForeignKey("neighbourhoods.id"), nullable=True
)
```

`Optional` requires `from typing import Optional` — add if not present.

---

### 3. Update `api/models/__init__.py`

Add imports and exports for the three new models:
```python
from models.neighbourhood import Neighbourhood, NeighbourhoodChannel, NeighbourhoodChannelMember
# add to __all__: "Neighbourhood", "NeighbourhoodChannel", "NeighbourhoodChannelMember"
```

---

### 4. New Alembic migration — `api/alembic/versions/b1c2d3e4f5a6_neighbourhood_system.py`

```python
revision: str = "b1c2d3e4f5a6"
down_revision: str = "a9e1b2c3d4f5"   # notifications migration (latest)

def upgrade() -> None:
    op.create_table(
        "neighbourhoods",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("centroid_lat", sa.Float(), nullable=False),
        sa.Column("centroid_lng", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False,
                  server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "neighbourhood_channels",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("neighbourhood_id", sa.Integer(), sa.ForeignKey("neighbourhoods.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False,
                  server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("neighbourhood_id", name="uq_nc_neighbourhood"),
    )
    op.create_table(
        "neighbourhood_channel_members",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("channel_id", sa.Integer(), sa.ForeignKey("neighbourhood_channels.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=False,
                  server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("channel_id", "user_id", name="uq_ncm_channel_user"),
    )
    op.add_column("users", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("users", sa.Column("longitude", sa.Float(), nullable=True))
    op.add_column("users", sa.Column("neighbourhood_id", sa.Integer(),
                  sa.ForeignKey("neighbourhoods.id"), nullable=True))

def downgrade() -> None:
    op.drop_column("users", "neighbourhood_id")
    op.drop_column("users", "longitude")
    op.drop_column("users", "latitude")
    op.drop_table("neighbourhood_channel_members")
    op.drop_table("neighbourhood_channels")
    op.drop_table("neighbourhoods")
```

---

### 5. New service — `api/services/neighbourhood.py`

```python
"""
Neighbourhood system: auto-assign users to location clusters (4-mile radius)
and auto-join them to their neighbourhood's general channel.
"""
from __future__ import annotations
import math
from sqlalchemy.orm import Session
from models.neighbourhood import Neighbourhood, NeighbourhoodChannel, NeighbourhoodChannelMember
from models.user import User

RADIUS_MILES = 4.0


def _haversine_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance in miles between two lat/lng points."""
    R = 3958.8  # Earth radius in miles
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_or_create_neighbourhood(lat: float, lng: float, db: Session) -> Neighbourhood:
    """
    Return the existing neighbourhood whose centroid is within RADIUS_MILES of (lat, lng).
    If none exists, create a new one with (lat, lng) as the centroid.
    """
    neighbourhoods = db.query(Neighbourhood).all()
    for n in neighbourhoods:
        if _haversine_miles(lat, lng, n.centroid_lat, n.centroid_lng) <= RADIUS_MILES:
            return n

    # No match — create a new neighbourhood
    count = db.query(Neighbourhood).count()
    new_neighbourhood = Neighbourhood(
        name=f"Neighbourhood #{count + 1}",
        centroid_lat=lat,
        centroid_lng=lng,
    )
    db.add(new_neighbourhood)
    db.commit()
    db.refresh(new_neighbourhood)
    return new_neighbourhood


def auto_join_neighbourhood_channel(user: User, neighbourhood: Neighbourhood, db: Session) -> NeighbourhoodChannel:
    """
    Get or create the general channel for this neighbourhood,
    then add the user as a member (idempotent).
    Returns the channel.
    """
    channel = db.query(NeighbourhoodChannel).filter(
        NeighbourhoodChannel.neighbourhood_id == neighbourhood.id
    ).first()

    if not channel:
        channel = NeighbourhoodChannel(neighbourhood_id=neighbourhood.id)
        db.add(channel)
        db.commit()
        db.refresh(channel)

    existing = db.query(NeighbourhoodChannelMember).filter(
        NeighbourhoodChannelMember.channel_id == channel.id,
        NeighbourhoodChannelMember.user_id == user.id,
    ).first()

    if not existing:
        member = NeighbourhoodChannelMember(channel_id=channel.id, user_id=user.id)
        db.add(member)
        db.commit()

    return channel
```

---

### 6. Update `api/schemas/user.py`

Add optional lat/lng to `UserCreate`:

```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    role: Literal["homeowner", "provider", "admin"]
    latitude: float | None = None
    longitude: float | None = None
```

Also add to `UserOut`:
```python
    latitude: float | None = None
    longitude: float | None = None
    neighbourhood_id: int | None = None
```

---

### 7. Update `api/routers/auth.py`

Update the `register` endpoint to call neighbourhood services when lat/lng are provided:

```python
from services.neighbourhood import auto_join_neighbourhood_channel, find_or_create_neighbourhood

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Assign neighbourhood and auto-join general channel if coordinates provided
    if payload.latitude is not None and payload.longitude is not None:
        neighbourhood = find_or_create_neighbourhood(payload.latitude, payload.longitude, db)
        user.neighbourhood_id = neighbourhood.id
        user.neighborhood = neighbourhood.name   # keep the string field in sync
        db.commit()
        auto_join_neighbourhood_channel(user, neighbourhood, db)

    return _build_token_response(user)
```

---

### 8. New router — `api/routers/neighbourhood.py`

Expose the neighbourhood channel so the frontend chat can use it:

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from dependencies import get_current_user, get_db
from models.neighbourhood import Neighbourhood, NeighbourhoodChannel, NeighbourhoodChannelMember
from models.user import User

router = APIRouter(prefix="/neighbourhood", tags=["neighbourhood"])


class NeighbourhoodChannelOut(BaseModel):
    id: int
    neighbourhood_id: int
    neighbourhood_name: str
    member_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NeighbourhoodMemberOut(BaseModel):
    user_id: int
    full_name: str
    joined_at: datetime


@router.get("/channel", response_model=Optional[NeighbourhoodChannelOut])
def get_my_neighbourhood_channel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Optional[dict]:
    """Return the general neighbourhood channel for the current user, or null."""
    if not current_user.neighbourhood_id:
        return None
    channel = db.query(NeighbourhoodChannel).filter(
        NeighbourhoodChannel.neighbourhood_id == current_user.neighbourhood_id
    ).first()
    if not channel:
        return None
    neighbourhood = db.query(Neighbourhood).filter(
        Neighbourhood.id == current_user.neighbourhood_id
    ).first()
    return {
        "id": channel.id,
        "neighbourhood_id": channel.neighbourhood_id,
        "neighbourhood_name": neighbourhood.name if neighbourhood else "My Neighbourhood",
        "member_count": len(channel.members),
        "created_at": channel.created_at,
    }


@router.get("/channel/members", response_model=list[NeighbourhoodMemberOut])
def get_neighbourhood_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    """Return all members of the user's neighbourhood channel."""
    if not current_user.neighbourhood_id:
        return []
    channel = db.query(NeighbourhoodChannel).filter(
        NeighbourhoodChannel.neighbourhood_id == current_user.neighbourhood_id
    ).first()
    if not channel:
        return []
    result = []
    for m in channel.members:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            result.append({"user_id": u.id, "full_name": u.full_name, "joined_at": m.joined_at})
    return result
```

---

### 9. Update `api/main.py`

Import and register the neighbourhood router:
```python
from routers.neighbourhood import router as neighbourhood_router
app.include_router(neighbourhood_router)
```

---

### 10. Run migration

After all backend files are written:
```bash
cd api && alembic upgrade head
```

---

## Files to create or modify (backend — Codex can write all of these)

| File | Action |
|------|--------|
| `api/models/neighbourhood.py` | Create — 3 models |
| `api/models/user.py` | Add latitude, longitude, neighbourhood_id columns |
| `api/models/__init__.py` | Add 3 new model imports + exports |
| `api/alembic/versions/b1c2d3e4f5a6_neighbourhood_system.py` | Create migration |
| `api/services/neighbourhood.py` | Create — Haversine + find_or_create + auto_join |
| `api/schemas/user.py` | Add lat/lng to UserCreate and UserOut |
| `api/routers/auth.py` | Update register endpoint |
| `api/routers/neighbourhood.py` | Create new router |
| `api/main.py` | Register neighbourhood router |

## Files to modify (frontend — Claude will handle after Codex)

| File | Action |
|------|--------|
| `src/lib/auth.ts` | Add latitude?, longitude? to register() |
| `src/components/onboarding/VerifyAreaStep.tsx` | Add geolocation detection UI |
| `src/app/get-started/page.tsx` | Capture coords and pass to register() |

---

## Acceptance criteria

1. `POST /auth/register` with lat/lng → user gets `neighbourhood_id` set, neighbourhood created or matched.
2. Two users registering within 4 miles of each other → same `neighbourhood_id`.
3. Two users >4 miles apart → different `neighbourhood_id`.
4. Each user auto-joined to neighbourhood channel on register.
5. `GET /neighbourhood/channel` returns channel info for the user.
6. `GET /neighbourhood/channel/members` returns all neighbours.
7. `alembic upgrade head` runs clean — 3 new tables, 3 new columns on users.
8. `python -m py_compile` passes on all changed Python files.

---

## Test steps

1. `cd api && alembic upgrade head`
2. Restart server
3. Register user A at (37.7749, -122.4194) — San Francisco
4. Register user B at (37.7750, -122.4190) — ~0.03 miles away
5. Confirm both have the same `neighbourhood_id`
6. Register user C at (40.7128, -74.0060) — New York, ~2500 miles away
7. Confirm user C has a different `neighbourhood_id`
8. `GET /neighbourhood/channel` for user A → returns channel
9. `GET /neighbourhood/channel/members` → shows user A and user B

---

## Codex implementation prompt

```
Implement TASK — Neighbourhood System Session 1 for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/TASK-neighbourhood-system-session1.md

Files to read for context before coding:
  api/models/user.py            (add 3 columns)
  api/models/__init__.py        (add new imports)
  api/schemas/user.py           (add lat/lng to UserCreate and UserOut)
  api/routers/auth.py           (update register endpoint)
  api/main.py                   (register new router)
  api/alembic/versions/a9e1b2c3d4f5_notifications.py  (check down_revision chain)
  api/dependencies.py           (get_current_user, get_db)

Implement all 9 backend files exactly as specified.
After writing all files run: cd api && alembic upgrade head
Then run: python -m py_compile on all changed files.
Do NOT touch any src/ frontend files — those will be handled separately.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Backend by Codex + frontend by Claude. All 5 acceptance tests pass. Users A+B (0.03 mi apart) → same neighbourhood_id=1. User C (2500 mi away) → neighbourhood_id=2. Channel auto-created, members auto-joined. tsc + py_compile clean. |
