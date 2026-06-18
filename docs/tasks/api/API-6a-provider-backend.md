# API-6a — Provider Backend: New Tables + Router

**Status:** Completed
**Depends on:** API-4 complete

## Goal

Build the full backend layer the provider dashboard requires:
- 6 new SQLAlchemy models + Alembic migration
- Pydantic schemas for all new resources
- One new FastAPI router (`/provider/*`) covering dashboard, job feed,
  bids, schedule, conversations, group channels, earnings, and reviews
- Register the new router in `main.py`

All monetary values stored as **integer cents** (e.g. $490 → 49000).

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `api/models/provider_profile.py` | CREATE |
| `api/models/message.py` | CREATE |
| `api/models/schedule_item.py` | CREATE |
| `api/models/review.py` | CREATE |
| `api/schemas/provider.py` | CREATE |
| `api/routers/provider.py` | CREATE |
| `api/alembic/versions/XXXX_provider_tables.py` | CREATE (new migration) |
| `api/main.py` | Add provider router import + include |
| `api/models/__init__.py` | Import new models so Alembic sees them |

---

## Step 1 — SQLAlchemy Models

### `api/models/provider_profile.py`

```python
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class ProviderProfile(Base):
    __tablename__ = "provider_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    company_name: Mapped[str | None] = mapped_column(String, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    trades: Mapped[str] = mapped_column(String, nullable=False, default="")
    # comma-separated: "Plumbing,Drain cleaning,Water heaters"
    service_radius_mi: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(String, nullable=True)
    working_hours_start: Mapped[str] = mapped_column(String, nullable=False, default="07:00")
    working_hours_end: Mapped[str] = mapped_column(String, nullable=False, default="18:00")
    working_days: Mapped[str] = mapped_column(String, nullable=False, default="Mon,Tue,Wed,Thu,Fri,Sat")
    is_insured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_licensed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    license_number: Mapped[str | None] = mapped_column(String, nullable=True)
    bank_last4: Mapped[str | None] = mapped_column(String(4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
```

### `api/models/message.py`

```python
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Conversation(Base):
    """1:1 DM channel between two users."""
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_a_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user_b_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        primaryjoin="Message.conversation_id == Conversation.id",
        lazy="selectin",
        order_by="Message.created_at",
    )


class GroupChannel(Base):
    """Group chat scoped to one ServiceRequest."""
    __tablename__ = "group_channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("service_requests.id"), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    members: Mapped[list["ChannelMember"]] = relationship("ChannelMember", lazy="selectin")
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        primaryjoin="Message.channel_id == GroupChannel.id",
        lazy="selectin",
        order_by="Message.created_at",
    )


class ChannelMember(Base):
    __tablename__ = "channel_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    channel_id: Mapped[int] = mapped_column(ForeignKey("group_channels.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())


class Message(Base):
    """Unified message — belongs to either a Conversation (DM) or GroupChannel."""
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    conversation_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("conversations.id"), nullable=True
    )
    channel_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("group_channels.id"), nullable=True
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
```

### `api/models/schedule_item.py`

```python
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    request_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("service_requests.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    status: Mapped[str] = mapped_column(String, nullable=False, default="scheduled")
    # scheduled | confirmed | en_route | completed | cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
```

### `api/models/review.py`

```python
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    homeowner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    bid_id: Mapped[int] = mapped_column(ForeignKey("bids.id"), nullable=False, unique=True)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    tag: Mapped[str | None] = mapped_column(String, nullable=True)
    # e.g. "Plumbing · group of 3"
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
```

---

## Step 2 — Update `api/models/__init__.py`

Import all new models so Alembic picks them up in autogenerate:

```python
from models.user import User
from models.request import ServiceRequest
from models.bid import Bid
from models.provider_profile import ProviderProfile
from models.message import Conversation, GroupChannel, ChannelMember, Message
from models.schedule_item import ScheduleItem
from models.review import Review
```

---

## Step 3 — Alembic Migration

Create `api/alembic/versions/XXXX_provider_tables.py` (generate a unique hex revision ID).

The migration must create these tables in this order (respecting FK dependencies):

1. `provider_profiles`
2. `conversations`
3. `group_channels`
4. `channel_members`
5. `messages`
6. `schedule_items`
7. `reviews`

Set `down_revision` to `'dd31d562982c'` (the community_activity migration — the latest one).

Use `op.create_table(...)` with the exact columns from the models above.

---

## Step 4 — Pydantic Schemas (`api/schemas/provider.py`)

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ── Provider profile ──────────────────────────────────────────
class ProviderProfileOut(BaseModel):
    id: int
    user_id: int
    company_name: Optional[str]
    bio: Optional[str]
    trades: str
    service_radius_mi: int
    address: Optional[str]
    neighborhood: Optional[str]
    working_hours_start: str
    working_hours_end: str
    working_days: str
    is_insured: bool
    is_licensed: bool
    license_number: Optional[str]
    bank_last4: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProviderProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    bio: Optional[str] = None
    trades: Optional[str] = None
    service_radius_mi: Optional[int] = None
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    working_days: Optional[str] = None
    is_insured: Optional[bool] = None
    is_licensed: Optional[bool] = None
    license_number: Optional[str] = None
    bank_last4: Optional[str] = None


# ── Dashboard ─────────────────────────────────────────────────
class ProviderDashboardOut(BaseModel):
    cold_start: bool
    active_bids: int
    jobs_completed: int
    revenue_30d_cents: int        # sum of accepted bids in last 30 days
    revenue_total_cents: int
    win_rate_pct: Optional[float] # None if no bids yet
    avg_rating: Optional[float]   # None if no reviews yet
    reviews_count: int
    unread_messages: int


# ── Bids (provider view) ──────────────────────────────────────
class ProviderBidOut(BaseModel):
    id: int
    request_id: int
    request_title: str
    request_category: str
    request_neighborhood: str
    request_status: str
    amount: int          # cents
    estimated_days: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Job feed ──────────────────────────────────────────────────
class JobFeedItemOut(BaseModel):
    id: int
    title: str
    category: str
    neighborhood: str
    status: str
    budget_min: int
    budget_max: int
    bid_count: int
    created_at: datetime
    closes_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


# ── Messages ──────────────────────────────────────────────────
class MessageOut(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    conversation_id: Optional[int]
    channel_id: Optional[int]
    text: str
    read_at: Optional[datetime]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    text: str


class ConversationOut(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    last_message: Optional[str]
    last_message_at: Optional[datetime]
    unread_count: int
    model_config = ConfigDict(from_attributes=True)


class GroupChannelOut(BaseModel):
    id: int
    request_id: int
    request_title: str
    member_count: int
    last_message: Optional[str]
    last_message_at: Optional[datetime]
    unread_count: int
    model_config = ConfigDict(from_attributes=True)


# ── Schedule ──────────────────────────────────────────────────
class ScheduleItemOut(BaseModel):
    id: int
    provider_id: int
    request_id: Optional[int]
    title: str
    address: Optional[str]
    scheduled_at: datetime
    duration_minutes: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ScheduleItemCreate(BaseModel):
    title: str
    address: Optional[str] = None
    request_id: Optional[int] = None
    scheduled_at: datetime
    duration_minutes: int = 60
    status: str = "scheduled"


# ── Earnings ──────────────────────────────────────────────────
class EarningsOut(BaseModel):
    total_cents: int
    pending_cents: int     # accepted bids not yet marked paid
    this_month_cents: int
    jobs_total: int
    jobs_this_month: int
    avg_job_value_cents: int


# ── Reviews ───────────────────────────────────────────────────
class ReviewOut(BaseModel):
    id: int
    homeowner_id: int
    homeowner_name: str
    bid_id: int
    stars: int
    comment: Optional[str]
    tag: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    bid_id: int
    stars: int
    comment: Optional[str] = None
    tag: Optional[str] = None
```

---

## Step 5 — Provider Router (`api/routers/provider.py`)

```python
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy import func
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db, require_role
from models.bid import Bid
from models.message import ChannelMember, Conversation, GroupChannel, Message
from models.provider_profile import ProviderProfile
from models.request import ServiceRequest
from models.review import Review
from models.schedule_item import ScheduleItem
from models.user import User
from schemas.provider import (
    ConversationOut, EarningsOut, GroupChannelOut, JobFeedItemOut,
    MessageCreate, MessageOut, ProviderBidOut, ProviderDashboardOut,
    ProviderProfileOut, ProviderProfileUpdate, ReviewCreate, ReviewOut,
    ScheduleItemCreate, ScheduleItemOut,
)

router = APIRouter(prefix="/provider", tags=["provider"])


# ── Helper ────────────────────────────────────────────────────

def _get_or_create_profile(db: Session, user: User) -> ProviderProfile:
    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == user.id).first()
    if profile is None:
        profile = ProviderProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ── Profile ───────────────────────────────────────────────────

@router.get("/me", response_model=ProviderProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> ProviderProfileOut:
    return _get_or_create_profile(db, current_user)


@router.patch("/me", response_model=ProviderProfileOut)
def update_profile(
    payload: ProviderProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> ProviderProfileOut:
    profile = _get_or_create_profile(db, current_user)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


# ── Dashboard ─────────────────────────────────────────────────

@router.get("/dashboard", response_model=ProviderDashboardOut)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> ProviderDashboardOut:
    provider_id = current_user.id

    all_bids = db.query(Bid).filter(Bid.provider_id == provider_id).all()
    total_bids = len(all_bids)
    accepted = [b for b in all_bids if b.status == "accepted"]
    active = [b for b in all_bids if b.status == "pending"]

    jobs_completed = len(accepted)
    active_bids = len(active)

    revenue_total_cents = sum(b.amount for b in accepted)

    cutoff_30d = datetime.utcnow() - timedelta(days=30)
    revenue_30d_cents = sum(
        b.amount for b in accepted if b.created_at >= cutoff_30d
    )

    win_rate_pct = (
        round(jobs_completed / total_bids * 100, 1) if total_bids > 0 else None
    )

    reviews = db.query(Review).filter(Review.provider_id == provider_id).all()
    reviews_count = len(reviews)
    avg_rating = (
        round(sum(r.stars for r in reviews) / reviews_count, 1)
        if reviews_count > 0 else None
    )

    # Unread messages: DMs + group channels
    unread_dm = (
        db.query(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(
            ((Conversation.user_a_id == provider_id) | (Conversation.user_b_id == provider_id)),
            Message.sender_id != provider_id,
            Message.read_at.is_(None),
        )
        .scalar() or 0
    )
    unread_group = (
        db.query(func.count(Message.id))
        .join(GroupChannel, Message.channel_id == GroupChannel.id)
        .join(ChannelMember, ChannelMember.channel_id == GroupChannel.id)
        .filter(
            ChannelMember.user_id == provider_id,
            Message.sender_id != provider_id,
            Message.read_at.is_(None),
        )
        .scalar() or 0
    )

    cold_start = jobs_completed == 0 and active_bids == 0

    return ProviderDashboardOut(
        cold_start=cold_start,
        active_bids=active_bids,
        jobs_completed=jobs_completed,
        revenue_30d_cents=revenue_30d_cents,
        revenue_total_cents=revenue_total_cents,
        win_rate_pct=win_rate_pct,
        avg_rating=avg_rating,
        reviews_count=reviews_count,
        unread_messages=unread_dm + unread_group,
    )


# ── My Bids ───────────────────────────────────────────────────

@router.get("/bids", response_model=list[ProviderBidOut])
def list_my_bids(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[ProviderBidOut]:
    query = (
        db.query(Bid, ServiceRequest)
        .join(ServiceRequest, Bid.request_id == ServiceRequest.id)
        .filter(Bid.provider_id == current_user.id)
    )
    if status:
        query = query.filter(Bid.status == status)
    rows = query.order_by(Bid.created_at.desc()).all()

    result = []
    for bid, req in rows:
        result.append(ProviderBidOut(
            id=bid.id,
            request_id=req.id,
            request_title=req.title,
            request_category=req.category,
            request_neighborhood=req.neighborhood,
            request_status=req.status,
            amount=bid.amount,
            estimated_days=bid.estimated_days,
            status=bid.status,
            created_at=bid.created_at,
        ))
    return result


# ── Job Feed ──────────────────────────────────────────────────

@router.get("/job-feed", response_model=list[JobFeedItemOut])
def job_feed(
    category: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[JobFeedItemOut]:
    query = db.query(ServiceRequest).filter(
        ServiceRequest.status.in_(["live", "grouping"])
    )
    if category:
        query = query.filter(ServiceRequest.category == category)
    if neighborhood:
        query = query.filter(ServiceRequest.neighborhood == neighborhood)

    requests = query.order_by(ServiceRequest.created_at.desc()).all()
    result = []
    for req in requests:
        bid_count = db.query(func.count(Bid.id)).filter(
            Bid.request_id == req.id
        ).scalar() or 0
        result.append(JobFeedItemOut(
            id=req.id,
            title=req.title,
            category=req.category,
            neighborhood=req.neighborhood,
            status=req.status,
            budget_min=req.budget_min,
            budget_max=req.budget_max,
            bid_count=bid_count,
            created_at=req.created_at,
            closes_at=req.closes_at,
        ))
    return result


# ── Schedule ──────────────────────────────────────────────────

@router.get("/schedule", response_model=list[ScheduleItemOut])
def list_schedule(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[ScheduleItemOut]:
    query = db.query(ScheduleItem).filter(
        ScheduleItem.provider_id == current_user.id
    )
    if date_from:
        query = query.filter(ScheduleItem.scheduled_at >= date_from)
    if date_to:
        query = query.filter(ScheduleItem.scheduled_at <= date_to)
    return query.order_by(ScheduleItem.scheduled_at).all()


@router.post("/schedule", response_model=ScheduleItemOut, status_code=http_status.HTTP_201_CREATED)
def create_schedule_item(
    payload: ScheduleItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> ScheduleItemOut:
    item = ScheduleItem(
        provider_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/schedule/{item_id}", response_model=ScheduleItemOut)
def update_schedule_item(
    item_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> ScheduleItemOut:
    item = db.query(ScheduleItem).filter(
        ScheduleItem.id == item_id,
        ScheduleItem.provider_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    item.status = status
    db.commit()
    db.refresh(item)
    return item


# ── Conversations (DMs) ───────────────────────────────────────

@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[ConversationOut]:
    convs = db.query(Conversation).filter(
        (Conversation.user_a_id == current_user.id) |
        (Conversation.user_b_id == current_user.id)
    ).all()

    result = []
    for conv in convs:
        other_id = conv.user_b_id if conv.user_a_id == current_user.id else conv.user_a_id
        other = db.query(User).filter(User.id == other_id).first()
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        unread = (
            db.query(func.count(Message.id))
            .filter(
                Message.conversation_id == conv.id,
                Message.sender_id != current_user.id,
                Message.read_at.is_(None),
            )
            .scalar() or 0
        )
        result.append(ConversationOut(
            id=conv.id,
            other_user_id=other_id,
            other_user_name=other.full_name if other else "Unknown",
            last_message=last_msg.text if last_msg else None,
            last_message_at=last_msg.created_at if last_msg else None,
            unread_count=unread,
        ))
    return result


@router.post("/conversations", response_model=ConversationOut, status_code=http_status.HTTP_201_CREATED)
def get_or_create_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> ConversationOut:
    conv = db.query(Conversation).filter(
        ((Conversation.user_a_id == current_user.id) & (Conversation.user_b_id == other_user_id)) |
        ((Conversation.user_a_id == other_user_id) & (Conversation.user_b_id == current_user.id))
    ).first()
    if not conv:
        conv = Conversation(user_a_id=current_user.id, user_b_id=other_user_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    other = db.query(User).filter(User.id == other_user_id).first()
    return ConversationOut(
        id=conv.id,
        other_user_id=other_user_id,
        other_user_name=other.full_name if other else "Unknown",
        last_message=None,
        last_message_at=None,
        unread_count=0,
    )


@router.get("/conversations/{conv_id}/messages", response_model=list[MessageOut])
def list_dm_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[MessageOut]:
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv or (conv.user_a_id != current_user.id and conv.user_b_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not a participant")

    # Mark unread as read
    db.query(Message).filter(
        Message.conversation_id == conv_id,
        Message.sender_id != current_user.id,
        Message.read_at.is_(None),
    ).update({"read_at": datetime.utcnow()})
    db.commit()

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
        .all()
    )
    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append(MessageOut(
            id=m.id, sender_id=m.sender_id,
            sender_name=sender.full_name if sender else "Unknown",
            conversation_id=m.conversation_id, channel_id=m.channel_id,
            text=m.text, read_at=m.read_at, created_at=m.created_at,
        ))
    return result


@router.post("/conversations/{conv_id}/messages", response_model=MessageOut, status_code=http_status.HTTP_201_CREATED)
def send_dm(
    conv_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> MessageOut:
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv or (conv.user_a_id != current_user.id and conv.user_b_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not a participant")
    msg = Message(sender_id=current_user.id, conversation_id=conv_id, text=payload.text)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.id, sender_id=msg.sender_id, sender_name=current_user.full_name,
        conversation_id=msg.conversation_id, channel_id=msg.channel_id,
        text=msg.text, read_at=msg.read_at, created_at=msg.created_at,
    )


# ── Group Channels ────────────────────────────────────────────

@router.get("/channels", response_model=list[GroupChannelOut])
def list_channels(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[GroupChannelOut]:
    # Provider is in a group channel if they bid on the request
    bid_request_ids = [
        b.request_id for b in
        db.query(Bid).filter(Bid.provider_id == current_user.id).all()
    ]
    channels = (
        db.query(GroupChannel)
        .filter(GroupChannel.request_id.in_(bid_request_ids))
        .all()
    )
    result = []
    for ch in channels:
        req = db.query(ServiceRequest).filter(ServiceRequest.id == ch.request_id).first()
        last_msg = (
            db.query(Message)
            .filter(Message.channel_id == ch.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        member_count = db.query(func.count(ChannelMember.id)).filter(
            ChannelMember.channel_id == ch.id
        ).scalar() or 0
        unread = (
            db.query(func.count(Message.id))
            .filter(
                Message.channel_id == ch.id,
                Message.sender_id != current_user.id,
                Message.read_at.is_(None),
            )
            .scalar() or 0
        )
        result.append(GroupChannelOut(
            id=ch.id,
            request_id=ch.request_id,
            request_title=req.title if req else "Unknown",
            member_count=member_count,
            last_message=last_msg.text if last_msg else None,
            last_message_at=last_msg.created_at if last_msg else None,
            unread_count=unread,
        ))
    return result


@router.get("/channels/{channel_id}/messages", response_model=list[MessageOut])
def list_channel_messages(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[MessageOut]:
    # Verify provider has a bid on this channel's request
    ch = db.query(GroupChannel).filter(GroupChannel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    bid = db.query(Bid).filter(
        Bid.request_id == ch.request_id, Bid.provider_id == current_user.id
    ).first()
    if not bid:
        raise HTTPException(status_code=403, detail="Not a participant")

    db.query(Message).filter(
        Message.channel_id == channel_id,
        Message.sender_id != current_user.id,
        Message.read_at.is_(None),
    ).update({"read_at": datetime.utcnow()})
    db.commit()

    messages = (
        db.query(Message)
        .filter(Message.channel_id == channel_id)
        .order_by(Message.created_at)
        .all()
    )
    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append(MessageOut(
            id=m.id, sender_id=m.sender_id,
            sender_name=sender.full_name if sender else "Unknown",
            conversation_id=m.conversation_id, channel_id=m.channel_id,
            text=m.text, read_at=m.read_at, created_at=m.created_at,
        ))
    return result


@router.post("/channels/{channel_id}/messages", response_model=MessageOut, status_code=http_status.HTTP_201_CREATED)
def send_channel_message(
    channel_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> MessageOut:
    ch = db.query(GroupChannel).filter(GroupChannel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    bid = db.query(Bid).filter(
        Bid.request_id == ch.request_id, Bid.provider_id == current_user.id
    ).first()
    if not bid:
        raise HTTPException(status_code=403, detail="Not a participant")
    msg = Message(sender_id=current_user.id, channel_id=channel_id, text=payload.text)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.id, sender_id=msg.sender_id, sender_name=current_user.full_name,
        conversation_id=msg.conversation_id, channel_id=msg.channel_id,
        text=msg.text, read_at=msg.read_at, created_at=msg.created_at,
    )


# ── Earnings ──────────────────────────────────────────────────

@router.get("/earnings", response_model=EarningsOut)
def get_earnings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> EarningsOut:
    all_accepted = db.query(Bid).filter(
        Bid.provider_id == current_user.id, Bid.status == "accepted"
    ).all()

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_cents = sum(b.amount for b in all_accepted)
    this_month_cents = sum(b.amount for b in all_accepted if b.created_at >= month_start)
    jobs_total = len(all_accepted)
    jobs_this_month = len([b for b in all_accepted if b.created_at >= month_start])
    avg_job_value_cents = total_cents // jobs_total if jobs_total > 0 else 0

    return EarningsOut(
        total_cents=total_cents,
        pending_cents=0,          # extend later: track payment status
        this_month_cents=this_month_cents,
        jobs_total=jobs_total,
        jobs_this_month=jobs_this_month,
        avg_job_value_cents=avg_job_value_cents,
    )


# ── Reviews ───────────────────────────────────────────────────

@router.get("/reviews", response_model=list[ReviewOut])
def list_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[ReviewOut]:
    reviews = db.query(Review).filter(
        Review.provider_id == current_user.id
    ).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        hw = db.query(User).filter(User.id == r.homeowner_id).first()
        result.append(ReviewOut(
            id=r.id, homeowner_id=r.homeowner_id,
            homeowner_name=hw.full_name if hw else "Unknown",
            bid_id=r.bid_id, stars=r.stars,
            comment=r.comment, tag=r.tag, created_at=r.created_at,
        ))
    return result


@router.post("/reviews", response_model=ReviewOut, status_code=http_status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> ReviewOut:
    bid = db.query(Bid).filter(Bid.id == payload.bid_id).first()
    if not bid or bid.status != "accepted":
        raise HTTPException(status_code=400, detail="Can only review an accepted bid")
    existing = db.query(Review).filter(Review.bid_id == payload.bid_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    review = Review(
        provider_id=bid.provider_id,
        homeowner_id=current_user.id,
        bid_id=bid.id,
        stars=payload.stars,
        comment=payload.comment,
        tag=payload.tag,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id, homeowner_id=review.homeowner_id,
        homeowner_name=current_user.full_name,
        bid_id=review.bid_id, stars=review.stars,
        comment=review.comment, tag=review.tag, created_at=review.created_at,
    )
```

---

## Step 6 — Register Router in `api/main.py`

Add after the existing router imports:
```python
from routers.provider import router as provider_router
```
Add after the existing `app.include_router(...)` calls:
```python
app.include_router(provider_router)
```

---

## Step 7 — Run the Migration

After implementing all files, run:
```bash
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter/api
alembic upgrade head
```

Verify the migration applies cleanly. If it fails, fix the migration file.

---

## Acceptance Criteria

- [ ] `alembic upgrade head` runs with zero errors, creating 7 new tables
- [ ] `GET /provider/me` returns `ProviderProfileOut` (auto-creates profile if not exists)
- [ ] `PATCH /provider/me` updates profile fields
- [ ] `GET /provider/dashboard` returns `cold_start: true` for a new provider with no bids
- [ ] `GET /provider/job-feed` returns live/grouping service requests
- [ ] `GET /provider/bids` returns bids by this provider (empty list for new provider)
- [ ] `GET /provider/schedule` returns schedule items (empty for new provider)
- [ ] `POST /provider/schedule` creates a schedule item
- [ ] `GET /provider/conversations` returns DM threads
- [ ] `POST /provider/conversations` creates or returns existing conversation
- [ ] DM message send/receive endpoints work
- [ ] `GET /provider/channels` returns group channels for bid-related requests
- [ ] Group message send/receive endpoints work
- [ ] `GET /provider/earnings` returns earnings breakdown
- [ ] `GET /provider/reviews` returns reviews for this provider
- [ ] `POST /provider/reviews` (homeowner role) creates a review
- [ ] FastAPI `/docs` at localhost:8000/docs shows all new endpoints
- [ ] All existing API-1 through API-4 endpoints still work (no regressions)

## Out of Scope
- Frontend wiring (API-6b/6c)
- Real-time WebSocket messages (future)
- Payment processing

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-06 | Approved | Spec written by Claude — pure relational, no NoSQL |
| 2026-05-07 | Completed | Migration applied, API live on :8000. All endpoints verified: cold_start:true for new provider, profile auto-create, PATCH profile, schedule CRUD, earnings, conversations all return correct responses. |
