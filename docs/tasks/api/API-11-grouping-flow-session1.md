# API-11 — Group Bidding Flow — Session 1: Models, Auto-Grouping, Homeowner Endpoints

## Task Status
`Approved`

## Goal
Implement the core grouping mechanics so that when a homeowner creates a request:
1. They are auto-joined to an existing active group in their area/category, OR a new group is created
2. Notifications are pushed to neighbours about the new/updated group
3. The group stays in `grouping` status for 72 hours — providers cannot see it yet
4. Homeowners can approve or cancel their membership after the 72-hour window closes

Session 2 will add the cron that flips status to `pending_approval` and `bidding`.
Sessions 3–4 handle frontend.

---

## New Status Machine

```
grouping (0–72h)  →  pending_approval  →  bidding  →  closed
                  ↘ cancelled (if all members cancel)
```

Providers only see groups in `bidding` status. This session only creates the models
and `grouping`/`pending_approval`/`cancelled` transitions.

---

## What Codex Will Implement

### Step 1 — New model: `api/models/request_group.py`

```python
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class RequestGroup(Base):
    """
    A time-boxed group of homeowners with the same service need in the same area.
    Status flow: grouping → pending_approval → bidding → closed | cancelled
    Providers only see groups in 'bidding' status.
    """
    __tablename__ = "request_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String, nullable=False)
    neighbourhood_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("neighbourhoods.id"), nullable=True
    )
    neighborhood: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        String, nullable=False, default="grouping",
        # grouping | pending_approval | bidding | closed | cancelled
    )
    grouping_closes_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, server_default=func.now()
    )
    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    members: Mapped[list["GroupMember"]] = relationship(
        "GroupMember", back_populates="group", lazy="selectin"
    )


class GroupMember(Base):
    """One homeowner's participation in a RequestGroup."""
    __tablename__ = "group_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(
        ForeignKey("request_groups.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    request_id: Mapped[int] = mapped_column(
        ForeignKey("service_requests.id"), nullable=False
    )
    approval_status: Mapped[str] = mapped_column(
        String, nullable=False, default="pending"
        # pending | approved | cancelled
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, server_default=func.now()
    )
    group: Mapped["RequestGroup"] = relationship(
        "RequestGroup", back_populates="members"
    )
```

---

### Step 2 — Update `api/models/request.py`

Add `group_id` FK to `ServiceRequest`:

```python
group_id: Mapped[Optional[int]] = mapped_column(
    ForeignKey("request_groups.id"), nullable=True, default=None
)
```

Also add `"grouping"` to the status comment:
```python
status: Mapped[str] = mapped_column(String, default="draft")  # draft|grouping|live|closed
```

---

### Step 3 — Alembic migration `api/alembic/versions/e2f3a4b5c6d7_request_groups.py`

```python
"""request groups and group members

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa

revision = "e2f3a4b5c6d7"
down_revision = "d1e2f3a4b5c6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "request_groups",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("neighbourhood_id", sa.Integer(),
                  sa.ForeignKey("neighbourhoods.id"), nullable=True),
        sa.Column("neighborhood", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="grouping"),
        sa.Column("grouping_closes_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False,
                  server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("created_by_user_id", sa.Integer(),
                  sa.ForeignKey("users.id"), nullable=False),
    )
    op.create_table(
        "group_members",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("group_id", sa.Integer(),
                  sa.ForeignKey("request_groups.id"), nullable=False),
        sa.Column("user_id", sa.Integer(),
                  sa.ForeignKey("users.id"), nullable=False),
        sa.Column("request_id", sa.Integer(),
                  sa.ForeignKey("service_requests.id"), nullable=False),
        sa.Column("approval_status", sa.String(), nullable=False,
                  server_default="pending"),
        sa.Column("joined_at", sa.DateTime(), nullable=False,
                  server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    with op.batch_alter_table("service_requests") as batch_op:
        batch_op.add_column(
            sa.Column("group_id", sa.Integer(),
                      sa.ForeignKey("request_groups.id"), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table("service_requests") as batch_op:
        batch_op.drop_column("group_id")
    op.drop_table("group_members")
    op.drop_table("request_groups")
```

Run after writing:
```bash
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter/api
source .venv/bin/activate
alembic upgrade head
```

---

### Step 4 — Update `api/routers/requests.py`

Replace the `POST /requests` function body with the new auto-grouping logic.

Add these imports at the top:
```python
from datetime import datetime, timedelta
from models.request_group import GroupMember, RequestGroup
from models.notification import Notification
from models.neighbourhood import NeighbourhoodChannelMember
from models.user import User
```

New `create_request` function body (keep existing signature, replace body):

```python
@router.post("/requests", response_model=ServiceRequestOut, status_code=http_status.HTTP_201_CREATED)
def create_request(
    payload: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> ServiceRequestOut:
    now = datetime.utcnow()

    # Create the individual service request
    service_request = ServiceRequest(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        neighborhood=payload.neighborhood,
        status="live",
        budget_min=payload.budget_min,
        budget_max=payload.budget_max,
    )
    db.add(service_request)
    db.commit()
    db.refresh(service_request)

    # Find an active group for this category + neighbourhood (still within 72h window)
    # Prefer neighbourhood_id match (geo-based); fall back to neighborhood string
    group_query = db.query(RequestGroup).filter(
        RequestGroup.category == payload.category,
        RequestGroup.status == "grouping",
        RequestGroup.grouping_closes_at > now,
    )
    if current_user.neighbourhood_id:
        active_group = group_query.filter(
            RequestGroup.neighbourhood_id == current_user.neighbourhood_id
        ).order_by(RequestGroup.created_at.desc()).first()
    else:
        active_group = group_query.filter(
            RequestGroup.neighborhood == payload.neighborhood
        ).order_by(RequestGroup.created_at.desc()).first()

    if active_group:
        # Join existing group — add as member
        service_request.group_id = active_group.id
        db.add(GroupMember(
            group_id=active_group.id,
            user_id=current_user.id,
            request_id=service_request.id,
            approval_status="pending",
        ))
        db.commit()

        # Notify existing active members that a new neighbour joined
        existing_members = db.query(GroupMember).filter(
            GroupMember.group_id == active_group.id,
            GroupMember.user_id != current_user.id,
            GroupMember.approval_status != "cancelled",
        ).all()
        for m in existing_members:
            db.add(Notification(
                user_id=m.user_id,
                type="group_member_joined",
                title=f"A neighbour joined your {active_group.category} group",
                body=(
                    f"{current_user.full_name} just joined the group — "
                    f"the more neighbours, the better the deal."
                ),
                action_url="/app/homeowner/bids",
            ))
        db.commit()

        response = ServiceRequestOut.model_validate(service_request)
        response.group_id = active_group.id
        response.group_status = active_group.status
        return response

    else:
        # No active group — create a new one
        new_group = RequestGroup(
            category=payload.category,
            neighbourhood_id=current_user.neighbourhood_id,
            neighborhood=payload.neighborhood,
            status="grouping",
            grouping_closes_at=now + timedelta(hours=72),
            created_by_user_id=current_user.id,
        )
        db.add(new_group)
        db.commit()
        db.refresh(new_group)

        service_request.group_id = new_group.id
        db.add(GroupMember(
            group_id=new_group.id,
            user_id=current_user.id,
            request_id=service_request.id,
            approval_status="pending",
        ))
        db.commit()

        # Notify all neighbours in the same neighbourhood cluster
        if current_user.neighbourhood_id:
            neighbour_ids = [
                row.user_id
                for row in db.query(NeighbourhoodChannelMember).join(
                    # NeighbourhoodChannel via neighbourhood_id
                    __import__("models.neighbourhood", fromlist=["NeighbourhoodChannel"]).NeighbourhoodChannel,
                    NeighbourhoodChannelMember.channel_id == __import__("models.neighbourhood", fromlist=["NeighbourhoodChannel"]).NeighbourhoodChannel.id,
                ).filter(
                    __import__("models.neighbourhood", fromlist=["NeighbourhoodChannel"]).NeighbourhoodChannel.neighbourhood_id == current_user.neighbourhood_id,
                    NeighbourhoodChannelMember.user_id != current_user.id,
                ).all()
            ]
        else:
            neighbour_ids = []

        for uid in neighbour_ids:
            db.add(Notification(
                user_id=uid,
                type="group_created",
                title=f"New {payload.category} group in your area",
                body=(
                    f"{current_user.full_name} started a group for {payload.category} services. "
                    f"Add your request in the next 72 hours to get a group deal."
                ),
                action_url="/app/homeowner/request",
            ))
        db.commit()

        response = ServiceRequestOut.model_validate(service_request)
        response.group_id = new_group.id
        response.group_status = new_group.status
        return response
```

**Note on the notification neighbour query** — the import trick above is messy.
Use proper imports instead. Add these at the top of requests.py:
```python
from models.neighbourhood import NeighbourhoodChannel, NeighbourhoodChannelMember
```
Then the neighbour query becomes clean:
```python
neighbour_ids = [
    m.user_id
    for m in (
        db.query(NeighbourhoodChannelMember)
        .join(NeighbourhoodChannel,
              NeighbourhoodChannelMember.channel_id == NeighbourhoodChannel.id)
        .filter(
            NeighbourhoodChannel.neighbourhood_id == current_user.neighbourhood_id,
            NeighbourhoodChannelMember.user_id != current_user.id,
        )
        .all()
    )
]
```

---

### Step 5 — Update `api/schemas/request.py`

Add `group_id` and `group_status` to `ServiceRequestOut`:

```python
class ServiceRequestOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    category: str
    neighborhood: str
    status: str
    budget_min: int
    budget_max: int
    created_at: datetime
    closes_at: datetime | None
    bids: list[BidOut] = []
    matched_group_id: int | None = None   # keep for backward compat
    group_id: int | None = None           # actual RequestGroup.id
    group_status: str | None = None       # grouping | pending_approval | bidding | closed

    model_config = ConfigDict(from_attributes=True)
```

---

### Step 6 — New endpoints in `api/routers/homeowner.py`

Add these imports at the top of homeowner.py:
```python
from datetime import datetime
from models.request_group import GroupMember, RequestGroup
from models.notification import Notification
```

Add these three endpoints at the end of the homeowner router:

#### `GET /homeowner/groups`

```python
@router.get("/groups")
def list_my_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> list[dict]:
    """All groups the homeowner is an active member of, with countdown and member count."""
    memberships = (
        db.query(GroupMember)
        .filter(
            GroupMember.user_id == current_user.id,
            GroupMember.approval_status != "cancelled",
        )
        .all()
    )
    now = datetime.utcnow()
    result = []
    for m in memberships:
        group = db.query(RequestGroup).filter(RequestGroup.id == m.group_id).first()
        if not group:
            continue
        active_members = [
            mb for mb in group.members if mb.approval_status != "cancelled"
        ]
        approved_count = sum(1 for mb in active_members if mb.approval_status == "approved")
        hours_remaining = max(0.0, (group.grouping_closes_at - now).total_seconds() / 3600)
        result.append({
            "group_id": group.id,
            "category": group.category,
            "neighborhood": group.neighborhood,
            "status": group.status,
            "member_count": len(active_members),
            "approved_count": approved_count,
            "my_approval_status": m.approval_status,
            "my_request_id": m.request_id,
            "grouping_closes_at": group.grouping_closes_at.isoformat(),
            "hours_remaining": round(hours_remaining, 1),
            "created_at": group.created_at.isoformat(),
        })
    return result
```

#### `POST /homeowner/groups/{group_id}/approve`

```python
@router.post("/groups/{group_id}/approve")
def approve_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> dict:
    """Homeowner approves sending this group to service providers."""
    group = db.query(RequestGroup).filter(RequestGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
    ).first()
    if not membership or membership.approval_status == "cancelled":
        raise HTTPException(status_code=403, detail="Not a member of this group")

    if group.status not in ("pending_approval", "grouping"):
        raise HTTPException(status_code=400, detail=f"Group is not awaiting approval (status={group.status})")

    membership.approval_status = "approved"
    db.commit()

    # Check if all active members have approved — if so, flip to bidding
    active_members = [m for m in group.members if m.approval_status != "cancelled"]
    all_approved = all(m.approval_status == "approved" for m in active_members)

    if all_approved and len(active_members) > 0:
        group.status = "bidding"
        db.commit()
        # Notify members that group is now live for providers
        for m in active_members:
            db.add(Notification(
                user_id=m.user_id,
                type="group_bidding",
                title=f"Your {group.category} group is now live!",
                body="All members approved — providers can now see your group and submit bids.",
                action_url="/app/homeowner/bids",
            ))
        db.commit()
        return {"status": "bidding", "message": "All members approved — group is now live for providers"}

    return {"status": group.status, "message": "Approval recorded"}
```

#### `POST /homeowner/groups/{group_id}/cancel`

```python
@router.post("/groups/{group_id}/cancel")
def cancel_group_membership(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> dict:
    """Homeowner exits the group. If last member, group is cancelled."""
    group = db.query(RequestGroup).filter(RequestGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id,
    ).first()
    if not membership or membership.approval_status == "cancelled":
        raise HTTPException(status_code=403, detail="Not an active member of this group")

    if group.status in ("closed", "cancelled"):
        raise HTTPException(status_code=400, detail="Group is already closed")

    membership.approval_status = "cancelled"
    db.commit()

    # If no active members remain, cancel the whole group
    remaining = [m for m in group.members if m.approval_status != "cancelled"]
    if not remaining:
        group.status = "cancelled"
        db.commit()
        return {"status": "cancelled", "message": "Group cancelled — no members remaining"}

    # Notify other members
    for m in remaining:
        db.add(Notification(
            user_id=m.user_id,
            type="group_member_left",
            title=f"A neighbour left the {group.category} group",
            body=f"{current_user.full_name} cancelled their participation. You can still proceed or cancel.",
            action_url="/app/homeowner/bids",
        ))
    db.commit()
    return {"status": group.status, "message": "You have left the group"}
```

---

### Step 7 — Register `RequestGroup` and `GroupMember` in `api/main.py`

Add the import alongside other model imports so Alembic and SQLAlchemy pick them up:
```python
from models.request_group import GroupMember, RequestGroup  # noqa: F401
```

Also register the new `/homeowner/groups` routes — they're on the homeowner router already so no extra registration needed.

---

### Step 8 — Run and verify

```bash
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter/api
source .venv/bin/activate
alembic upgrade head
python3 -c "
from database import engine
from sqlalchemy import inspect
i = inspect(engine)
print('Tables:', [t for t in i.get_table_names() if 'group' in t or 'request' in t])
print('service_requests cols:', [c['name'] for c in i.get_columns('service_requests')])
"
```

Then restart the API and run a quick smoke test:
```bash
pkill -f 'uvicorn main:app' || true
sleep 2
uvicorn main:app --port 8000 --log-level warning &
sleep 4
# Smoke: register a homeowner and create a request
python3 -c "
import requests
r = requests.post('http://localhost:8000/auth/register', json={
    'email': 'smoke@test.com', 'password': 'pass123',
    'full_name': 'Smoke Test', 'role': 'homeowner'
})
token = r.json()['access_token']
r2 = requests.post('http://localhost:8000/requests',
    json={'title':'Test','description':'Test','category':'lawn',
          'neighborhood':'West Adams','status':'live',
          'budget_min':5000,'budget_max':15000},
    headers={'Authorization': f'Bearer {token}'}
)
print('status:', r2.status_code)
print('group_id:', r2.json().get('group_id'))
print('group_status:', r2.json().get('group_status'))
r3 = requests.get('http://localhost:8000/homeowner/groups',
    headers={'Authorization': f'Bearer {token}'})
print('groups:', r3.json())
"
```

Expected: `group_id` is an integer, `group_status` is `"grouping"`, and `GET /homeowner/groups` returns 1 group with `hours_remaining ≈ 72`.

---

## Files to Create / Modify

| File | Action |
|---|---|
| `api/models/request_group.py` | Create — `RequestGroup` and `GroupMember` models |
| `api/alembic/versions/e2f3a4b5c6d7_request_groups.py` | Create — migration |
| `api/models/request.py` | Modify — add `group_id` FK |
| `api/routers/requests.py` | Modify — auto-grouping logic in `create_request` |
| `api/schemas/request.py` | Modify — add `group_id`, `group_status` to `ServiceRequestOut` |
| `api/routers/homeowner.py` | Modify — add `/groups`, `/groups/{id}/approve`, `/groups/{id}/cancel` |
| `api/main.py` | Modify — import new models |

## Out of Scope (Session 2)
- 72-hour cron that flips `grouping → pending_approval`
- Provider job feed showing only `bidding` groups
- Bids attaching to groups (not individual requests)
- Any frontend changes

## Task Update Log
- 2026-05-08 — Written and approved. Delegating to Codex.
