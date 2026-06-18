# API-6d — Homeowner Full Backend + Frontend Wiring

**Status:** Completed
**Depends on:** API-6a complete (messages/channels tables exist)

## Goal

1. Add `homeowner_profiles` table + `/homeowner/*` FastAPI router
2. Create 5 frontend hooks
3. Wire all 4 homeowner pages to real API data with cold start UI on dashboard

---

## Part A — Backend

### Files to Create / Modify

| File | Action |
|------|--------|
| `api/models/homeowner_profile.py` | CREATE |
| `api/schemas/homeowner.py` | CREATE |
| `api/routers/homeowner.py` | CREATE |
| `api/alembic/versions/XXXX_homeowner_profiles.py` | CREATE migration |
| `api/models/__init__.py` | Add HomeownerProfile import |
| `api/main.py` | Register homeowner router |

---

### A1 — `api/models/homeowner_profile.py`

```python
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class HomeownerProfile(Base):
    __tablename__ = "homeowner_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    service_radius_mi: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
    notif_bids: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notif_groups: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notif_savings: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
```

---

### A2 — Alembic Migration

Create `api/alembic/versions/XXXX_homeowner_profiles.py`.
Set `down_revision = 'e1a4c9b8d712'` (the provider_tables migration).
Generate a unique hex revision ID.

```python
def upgrade() -> None:
    op.create_table(
        "homeowner_profiles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), unique=True, nullable=False),
        sa.Column("service_radius_mi", sa.Integer(), nullable=False, server_default="8"),
        sa.Column("notif_bids", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("notif_groups", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("notif_savings", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("(CURRENT_TIMESTAMP)")),
    )

def downgrade() -> None:
    op.drop_table("homeowner_profiles")
```

---

### A3 — `api/schemas/homeowner.py`

```python
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class HomeownerProfileOut(BaseModel):
    id: int
    user_id: int
    service_radius_mi: int
    notif_bids: bool
    notif_groups: bool
    notif_savings: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class HomeownerProfileUpdate(BaseModel):
    service_radius_mi: Optional[int] = None
    notif_bids: Optional[bool] = None
    notif_groups: Optional[bool] = None
    notif_savings: Optional[bool] = None


class HomeownerDashboardOut(BaseModel):
    cold_start: bool
    active_requests: int
    active_bids: int          # pending bids on my live requests
    total_saved_cents: int    # sum of (budget_min - accepted_bid.amount) where positive
    unread_messages: int


class HomeownerRequestOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    neighborhood: str
    status: str
    budget_min: int
    budget_max: int
    bid_count: int
    best_bid_cents: Optional[int]   # lowest pending bid
    closes_at: Optional[datetime]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class HomeownerBidOut(BaseModel):
    id: int
    request_id: int
    request_title: str
    provider_id: int
    provider_name: str
    amount: int
    estimated_days: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


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


class GroupChannelOut(BaseModel):
    id: int
    request_id: int
    request_title: str
    member_count: int
    last_message: Optional[str]
    last_message_at: Optional[datetime]
    unread_count: int
```

---

### A4 — `api/routers/homeowner.py`

```python
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy import func
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db, require_role
from models.bid import Bid
from models.homeowner_profile import HomeownerProfile
from models.message import ChannelMember, Conversation, GroupChannel, Message
from models.request import ServiceRequest
from models.user import User
from schemas.homeowner import (
    ConversationOut, GroupChannelOut, HomeownerBidOut, HomeownerDashboardOut,
    HomeownerProfileOut, HomeownerProfileUpdate, HomeownerRequestOut,
    MessageCreate, MessageOut,
)

router = APIRouter(prefix="/homeowner", tags=["homeowner"])


# ── Helper ────────────────────────────────────────────────────

def _get_or_create_profile(db: Session, user: User) -> HomeownerProfile:
    profile = db.query(HomeownerProfile).filter(HomeownerProfile.user_id == user.id).first()
    if profile is None:
        profile = HomeownerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# ── Profile ───────────────────────────────────────────────────

@router.get("/me", response_model=HomeownerProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> HomeownerProfileOut:
    return _get_or_create_profile(db, current_user)


@router.patch("/me", response_model=HomeownerProfileOut)
def update_profile(
    payload: HomeownerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> HomeownerProfileOut:
    profile = _get_or_create_profile(db, current_user)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


# ── Dashboard ─────────────────────────────────────────────────

@router.get("/dashboard", response_model=HomeownerDashboardOut)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> HomeownerDashboardOut:
    uid = current_user.id

    my_requests = db.query(ServiceRequest).filter(ServiceRequest.user_id == uid).all()
    active_statuses = {"draft", "grouping", "live"}
    active_requests = len([r for r in my_requests if r.status in active_statuses])

    # Count pending bids on my requests
    my_req_ids = [r.id for r in my_requests if r.status == "live"]
    active_bids = (
        db.query(func.count(Bid.id))
        .filter(Bid.request_id.in_(my_req_ids), Bid.status == "pending")
        .scalar() or 0
    ) if my_req_ids else 0

    # Savings: for each accepted bid, savings = budget_min - amount (if positive)
    accepted_bids = (
        db.query(Bid, ServiceRequest)
        .join(ServiceRequest, Bid.request_id == ServiceRequest.id)
        .filter(ServiceRequest.user_id == uid, Bid.status == "accepted")
        .all()
    )
    total_saved_cents = sum(
        max(0, req.budget_min - bid.amount)
        for bid, req in accepted_bids
    )

    # Unread messages
    unread_dm = (
        db.query(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(
            (Conversation.user_a_id == uid) | (Conversation.user_b_id == uid),
            Message.sender_id != uid,
            Message.read_at.is_(None),
        )
        .scalar() or 0
    )
    unread_group = (
        db.query(func.count(Message.id))
        .join(GroupChannel, Message.channel_id == GroupChannel.id)
        .join(ChannelMember, ChannelMember.channel_id == GroupChannel.id)
        .filter(
            ChannelMember.user_id == uid,
            Message.sender_id != uid,
            Message.read_at.is_(None),
        )
        .scalar() or 0
    )

    cold_start = len(my_requests) == 0

    return HomeownerDashboardOut(
        cold_start=cold_start,
        active_requests=active_requests,
        active_bids=active_bids,
        total_saved_cents=total_saved_cents,
        unread_messages=unread_dm + unread_group,
    )


# ── My Requests ───────────────────────────────────────────────

@router.get("/requests", response_model=list[HomeownerRequestOut])
def list_my_requests(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> list[HomeownerRequestOut]:
    query = db.query(ServiceRequest).filter(ServiceRequest.user_id == current_user.id)
    if status:
        query = query.filter(ServiceRequest.status == status)
    requests = query.order_by(ServiceRequest.created_at.desc()).all()

    result = []
    for req in requests:
        bid_count = db.query(func.count(Bid.id)).filter(Bid.request_id == req.id).scalar() or 0
        best_bid = (
            db.query(Bid)
            .filter(Bid.request_id == req.id, Bid.status == "pending")
            .order_by(Bid.amount)
            .first()
        )
        result.append(HomeownerRequestOut(
            id=req.id, title=req.title, description=req.description,
            category=req.category, neighborhood=req.neighborhood,
            status=req.status, budget_min=req.budget_min, budget_max=req.budget_max,
            bid_count=bid_count,
            best_bid_cents=best_bid.amount if best_bid else None,
            closes_at=req.closes_at, created_at=req.created_at,
        ))
    return result


# ── Bids on my requests ───────────────────────────────────────

@router.get("/bids", response_model=list[HomeownerBidOut])
def list_my_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> list[HomeownerBidOut]:
    rows = (
        db.query(Bid, ServiceRequest, User)
        .join(ServiceRequest, Bid.request_id == ServiceRequest.id)
        .join(User, Bid.provider_id == User.id)
        .filter(ServiceRequest.user_id == current_user.id)
        .order_by(Bid.created_at.desc())
        .all()
    )
    result = []
    for bid, req, provider in rows:
        result.append(HomeownerBidOut(
            id=bid.id, request_id=req.id, request_title=req.title,
            provider_id=provider.id, provider_name=provider.full_name,
            amount=bid.amount, estimated_days=bid.estimated_days,
            status=bid.status, created_at=bid.created_at,
        ))
    return result


# ── Conversations (DMs with providers) ───────────────────────

@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> list[ConversationOut]:
    uid = current_user.id
    convs = db.query(Conversation).filter(
        (Conversation.user_a_id == uid) | (Conversation.user_b_id == uid)
    ).all()
    result = []
    for conv in convs:
        other_id = conv.user_b_id if conv.user_a_id == uid else conv.user_a_id
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
                Message.sender_id != uid,
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
    current_user: User = Depends(require_role("homeowner")),
) -> ConversationOut:
    uid = current_user.id
    conv = db.query(Conversation).filter(
        ((Conversation.user_a_id == uid) & (Conversation.user_b_id == other_user_id)) |
        ((Conversation.user_a_id == other_user_id) & (Conversation.user_b_id == uid))
    ).first()
    if not conv:
        conv = Conversation(user_a_id=uid, user_b_id=other_user_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    other = db.query(User).filter(User.id == other_user_id).first()
    return ConversationOut(
        id=conv.id, other_user_id=other_user_id,
        other_user_name=other.full_name if other else "Unknown",
        last_message=None, last_message_at=None, unread_count=0,
    )


@router.get("/conversations/{conv_id}/messages", response_model=list[MessageOut])
def get_dm_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> list[MessageOut]:
    uid = current_user.id
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv or (conv.user_a_id != uid and conv.user_b_id != uid):
        raise HTTPException(status_code=403, detail="Not a participant")
    db.query(Message).filter(
        Message.conversation_id == conv_id,
        Message.sender_id != uid,
        Message.read_at.is_(None),
    ).update({"read_at": datetime.utcnow()})
    db.commit()
    msgs = db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at).all()
    result = []
    for m in msgs:
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
    current_user: User = Depends(require_role("homeowner")),
) -> MessageOut:
    uid = current_user.id
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv or (conv.user_a_id != uid and conv.user_b_id != uid):
        raise HTTPException(status_code=403, detail="Not a participant")
    msg = Message(sender_id=uid, conversation_id=conv_id, text=payload.text)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.id, sender_id=msg.sender_id, sender_name=current_user.full_name,
        conversation_id=msg.conversation_id, channel_id=msg.channel_id,
        text=msg.text, read_at=msg.read_at, created_at=msg.created_at,
    )


# ── Group Channels (bid group chats) ─────────────────────────

@router.get("/channels", response_model=list[GroupChannelOut])
def list_channels(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> list[GroupChannelOut]:
    uid = current_user.id
    my_req_ids = [
        r.id for r in
        db.query(ServiceRequest).filter(ServiceRequest.user_id == uid).all()
    ]
    channels = (
        db.query(GroupChannel)
        .filter(GroupChannel.request_id.in_(my_req_ids))
        .all()
    ) if my_req_ids else []

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
                Message.sender_id != uid,
                Message.read_at.is_(None),
            )
            .scalar() or 0
        )
        result.append(GroupChannelOut(
            id=ch.id, request_id=ch.request_id,
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
    current_user: User = Depends(require_role("homeowner")),
) -> list[MessageOut]:
    uid = current_user.id
    ch = db.query(GroupChannel).filter(GroupChannel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    req = db.query(ServiceRequest).filter(ServiceRequest.id == ch.request_id).first()
    if not req or req.user_id != uid:
        raise HTTPException(status_code=403, detail="Not a participant")
    db.query(Message).filter(
        Message.channel_id == channel_id,
        Message.sender_id != uid,
        Message.read_at.is_(None),
    ).update({"read_at": datetime.utcnow()})
    db.commit()
    msgs = db.query(Message).filter(
        Message.channel_id == channel_id
    ).order_by(Message.created_at).all()
    result = []
    for m in msgs:
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
    current_user: User = Depends(require_role("homeowner")),
) -> MessageOut:
    uid = current_user.id
    ch = db.query(GroupChannel).filter(GroupChannel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    req = db.query(ServiceRequest).filter(ServiceRequest.id == ch.request_id).first()
    if not req or req.user_id != uid:
        raise HTTPException(status_code=403, detail="Not a participant")
    msg = Message(sender_id=uid, channel_id=channel_id, text=payload.text)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.id, sender_id=msg.sender_id, sender_name=current_user.full_name,
        conversation_id=msg.conversation_id, channel_id=msg.channel_id,
        text=msg.text, read_at=msg.read_at, created_at=msg.created_at,
    )
```

---

### A5 — `api/models/__init__.py`

Add import:
```python
from models.homeowner_profile import HomeownerProfile
```

### A6 — `api/main.py`

Add after existing router imports:
```python
from routers.homeowner import router as homeowner_router
```
Add after existing `app.include_router(...)` calls:
```python
app.include_router(homeowner_router)
```

---

## Part B — Frontend Hooks

Create in `src/hooks/`:

### `useHomeownerDashboard.ts`

```ts
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken, fetchMe, type AuthUser } from "@/lib/auth";

export interface HomeownerDashboard {
  cold_start: boolean;
  active_requests: number;
  active_bids: number;
  total_saved_cents: number;
  unread_messages: number;
}

export function useHomeownerDashboard() {
  const [dashboard, setDashboard] = useState<HomeownerDashboard | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    Promise.all([
      apiFetch<HomeownerDashboard>("/homeowner/dashboard", { token }),
      fetchMe(token),
    ])
      .then(([dash, me]) => { setDashboard(dash); setUser(me); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return { dashboard, user, loading, error };
}
```

### `useHomeownerRequests.ts`

```ts
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface HomeownerRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  neighborhood: string;
  status: string;
  budget_min: number;
  budget_max: number;
  bid_count: number;
  best_bid_cents: number | null;
  closes_at: string | null;
  created_at: string;
}

export function useHomeownerRequests(status?: string) {
  const [requests, setRequests] = useState<HomeownerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    const params = status ? `?status=${encodeURIComponent(status)}` : "";
    apiFetch<HomeownerRequest[]>(`/homeowner/requests${params}`, { token })
      .then(setRequests)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, [status]);

  const createRequest = async (payload: {
    title: string; description: string; category: string;
    neighborhood: string; budget_min: number; budget_max: number; status?: string;
  }) => {
    const token = getToken();
    if (!token) return null;
    const req = await apiFetch<HomeownerRequest>("/requests", {
      method: "POST",
      body: JSON.stringify({ ...payload, status: payload.status ?? "draft" }),
      token,
    });
    setRequests((prev) => [req, ...prev]);
    return req;
  };

  return { requests, loading, error, refresh, createRequest };
}
```

### `useHomeownerBids.ts`

```ts
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface HomeownerBid {
  id: number;
  request_id: number;
  request_title: string;
  provider_id: number;
  provider_name: string;
  amount: number;
  estimated_days: number;
  status: string;
  created_at: string;
}

export function useHomeownerBids() {
  const [bids, setBids] = useState<HomeownerBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    apiFetch<HomeownerBid[]>("/homeowner/bids", { token })
      .then(setBids)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const acceptBid = async (bidId: number) => {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/bids/${bidId}/accept`, { method: "PUT", token });
    setBids((prev) => prev.map((b) =>
      b.id === bidId ? { ...b, status: "accepted" }
      : b.request_id === prev.find((x) => x.id === bidId)?.request_id
      ? { ...b, status: "declined" }
      : b
    ));
  };

  const declineBid = async (bidId: number) => {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/bids/${bidId}/decline`, { method: "PUT", token });
    setBids((prev) => prev.map((b) => b.id === bidId ? { ...b, status: "declined" } : b));
  };

  return { bids, loading, error, acceptBid, declineBid };
}
```

### `useHomeownerChat.ts`

```ts
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface GroupChannel {
  id: number;
  request_id: number;
  request_title: string;
  member_count: number;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  conversation_id: number | null;
  channel_id: number | null;
  text: string;
  read_at: string | null;
  created_at: string;
}

export function useHomeownerChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    Promise.all([
      apiFetch<Conversation[]>("/homeowner/conversations", { token }),
      apiFetch<GroupChannel[]>("/homeowner/channels", { token }),
    ])
      .then(([convs, chans]) => { setConversations(convs); setChannels(chans); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getMessages = async (type: "dm" | "group", id: number): Promise<ChatMessage[]> => {
    const token = getToken();
    if (!token) return [];
    const path = type === "dm"
      ? `/homeowner/conversations/${id}/messages`
      : `/homeowner/channels/${id}/messages`;
    return apiFetch<ChatMessage[]>(path, { token });
  };

  const sendMessage = async (type: "dm" | "group", id: number, text: string): Promise<ChatMessage | null> => {
    const token = getToken();
    if (!token) return null;
    const path = type === "dm"
      ? `/homeowner/conversations/${id}/messages`
      : `/homeowner/channels/${id}/messages`;
    return apiFetch<ChatMessage>(path, { method: "POST", body: JSON.stringify({ text }), token });
  };

  return { conversations, channels, loading, getMessages, sendMessage };
}
```

### `useHomeownerProfile.ts`

```ts
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken, fetchMe, type AuthUser } from "@/lib/auth";

export interface HomeownerProfile {
  id: number;
  user_id: number;
  service_radius_mi: number;
  notif_bids: boolean;
  notif_groups: boolean;
  notif_savings: boolean;
}

export function useHomeownerProfile() {
  const [profile, setProfile] = useState<HomeownerProfile | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    Promise.all([
      apiFetch<HomeownerProfile>("/homeowner/me", { token }),
      fetchMe(token),
    ])
      .then(([prof, me]) => { setProfile(prof); setUser(me); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = async (patch: Partial<HomeownerProfile>) => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    const updated = await apiFetch<HomeownerProfile>("/homeowner/me", {
      method: "PATCH", body: JSON.stringify(patch), token,
    });
    setProfile(updated);
    setSaving(false);
  };

  const updateUser = async (patch: { full_name?: string; phone?: string; address?: string; neighborhood?: string }) => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    const updated = await apiFetch<AuthUser>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ full_name: user?.full_name, ...patch }),
      token,
    });
    setUser(updated);
    setSaving(false);
  };

  return { profile, user, loading, saving, updateProfile, updateUser };
}
```

---

## Part C — Page Wiring

### Dashboard (`src/app/app/homeowner/dashboard/page.tsx`)

Add to imports:
```ts
import { useHomeownerDashboard } from "@/hooks/useHomeownerDashboard";
```

At top of component:
```ts
const { dashboard, user, loading } = useHomeownerDashboard();
const firstName = user?.full_name?.split(" ")[0] ?? "there";
```

**Loading state** (return early):
```tsx
if (loading) return (
  <div style={{ background:"var(--bg-app)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ color:"var(--ink-400)", fontSize:14 }}>Loading dashboard…</div>
  </div>
);
```

**Cold start** (return early when `dashboard?.cold_start`):
```tsx
if (dashboard?.cold_start) return (
  <div style={{ background:"var(--bg-app)", minHeight:"100vh" }}>
    <div style={{ padding:"28px 36px 20px" }}>
      <h1 style={{ fontFamily:"var(--font-display)", fontWeight:500, fontSize:30, letterSpacing:"-0.02em", margin:"0 0 4px", color:"var(--ink-900)" }}>
        Welcome, {firstName}
      </h1>
      <p style={{ margin:0, color:"var(--ink-500)", fontSize:14 }}>Your neighborhood is waiting. Post your first service request to get started.</p>
    </div>
    <div style={{ padding:"0 36px 36px" }}>
      {/* Warm hero */}
      <div style={{ background:"linear-gradient(135deg, var(--terracotta-600) 0%, var(--terracotta-500) 100%)", borderRadius:22, padding:"36px 40px", color:"white", display:"grid", gridTemplateColumns:"1fr auto", gap:32, alignItems:"center", marginBottom:28, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-60, top:-60, width:260, height:260, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />
        <div>
          <div style={{ fontSize:13, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const, opacity:0.75, marginBottom:12 }}>Getting started</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:500, letterSpacing:"-0.02em", lineHeight:1.2, marginBottom:10 }}>
            Your neighbors are already saving.
          </div>
          <div style={{ fontSize:14, opacity:0.85, lineHeight:1.6, maxWidth:480 }}>
            Post a home-service request and NeighBid will find neighbors who need the same thing — then get providers to compete for the whole group.
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, flexShrink:0 }}>
          <Link href="/app/homeowner/request" style={{ display:"inline-flex", alignItems:"center", gap:8, height:44, padding:"0 22px", borderRadius:999, background:"white", color:"var(--terracotta-600)", fontSize:14, fontWeight:700, textDecoration:"none" }}>
            Post your first request →
          </Link>
        </div>
      </div>
      {/* 3-step checklist */}
      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-warm)", borderRadius:18, boxShadow:"var(--shadow-warm-sm)", overflow:"hidden" }}>
        <div style={{ padding:"20px 24px 16px" }}>
          <div style={{ fontSize:11, textTransform:"uppercase" as const, letterSpacing:"0.10em", color:"var(--ink-400)", fontWeight:600 }}>How it works</div>
        </div>
        <div style={{ height:1, background:"var(--border-warm)" }} />
        {[
          { num:"01", label:"Post a request", sub:"Describe the service you need — lawn care, plumbing, gutter cleaning.", href:"/app/homeowner/request" },
          { num:"02", label:"Join a group", sub:"NeighBid finds neighbors with the same request and groups your buying power.", href:"/app/homeowner/bids" },
          { num:"03", label:"Compare bids & save", sub:"Providers compete for the group. You pick the best offer and save vs. solo booking.", href:"/app/homeowner/bids" },
        ].map((step, i) => (
          <div key={i} style={{ padding:"18px 24px", display:"grid", gridTemplateColumns:"48px 1fr auto", gap:16, alignItems:"center", borderTop: i > 0 ? "1px solid var(--border-warm)" : "none" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"var(--cream-100)", border:"1.5px solid var(--border-warm)", display:"grid", placeItems:"center", fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:18, color:"var(--ink-400)" }}>
              {step.num}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:14, color:"var(--ink-900)", marginBottom:2 }}>{step.label}</div>
              <div style={{ fontSize:12, color:"var(--ink-500)", lineHeight:1.5 }}>{step.sub}</div>
            </div>
            <Link href={step.href} style={{ display:"inline-flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:999, fontSize:13, fontWeight:600, background:"var(--terracotta-600)", color:"white", textDecoration:"none" }}>
              Start →
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);
```

**Normal dashboard** — replace hardcoded values:
- `"Good morning, Lance"` → `"Good morning, ${firstName}"`
- Subtitle: `"You have 1 bid awaiting your call and 2 active groups."` → `"You have ${dashboard?.active_bids ?? 0} bid${(dashboard?.active_bids ?? 0) !== 1 ? "s" : ""} awaiting your call and ${dashboard?.active_requests ?? 0} active request${(dashboard?.active_requests ?? 0) !== 1 ? "s" : ""}."`
- Savings `$310` → `$${Math.round((dashboard?.total_saved_cents ?? 0) / 100).toLocaleString()}`
- Keep all other mock content (hero bid card, active requests table, neighborhood pulse) unchanged for now

---

### Bids Page (`src/app/app/homeowner/bids/page.tsx`)

Add imports:
```ts
import { useHomeownerRequests } from "@/hooks/useHomeownerRequests";
import { useHomeownerBids } from "@/hooks/useHomeownerBids";
```

At component top:
```ts
const { requests, loading: reqLoading } = useHomeownerRequests();
const { bids, loading: bidsLoading, acceptBid, declineBid } = useHomeownerBids();
const loading = reqLoading || bidsLoading;
```

**Stats strip** — replace hardcoded numbers:
- "Total saved" `$310` → `$${Math.round(bids.filter(b=>b.status==="accepted").reduce((s,b)=>s+b.amount,0)/100).toLocaleString()}`
- "Booked" `4` → `${bids.filter(b=>b.status==="accepted").length}`
- "Active now" `2` → `${bids.filter(b=>b.status==="pending").length}`
- "Completed" `1` → `${requests.filter(r=>r.status==="closed").length}`

**Active bids section** — when `bids.filter(b=>b.status==="pending").length > 0`, map over them:
Each pending bid card shows:
- Title: `bid.request_title`
- Sub: `${bid.provider_name} · ${bid.estimated_days} days`
- Amount: `$${Math.round(bid.amount/100).toLocaleString()}`
- Savings vs budget: `−$${Math.round((requests.find(r=>r.id===bid.request_id)?.budget_min??0 - bid.amount)/100)} vs solo`
- "Accept bid" primary button → `() => void acceptBid(bid.id)`
- "Decline" ghost button → `() => void declineBid(bid.id)`

**Empty state** (when loading=false and bids.length===0):
```tsx
<div style={{ textAlign:"center", padding:"60px 0", color:"var(--ink-400)", fontSize:14 }}>
  No bids yet — post a request to start receiving bids from local providers.
</div>
```

Keep existing card layout/styling for accepted and archived sections with real data.

---

### Chat Page (`src/app/app/homeowner/chat/page.tsx`)

Add imports:
```ts
import { useEffect, useRef, useState } from "react";
import { useHomeownerChat } from "@/hooks/useHomeownerChat";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
```

At component top:
```ts
const { conversations, channels, loading, getMessages, sendMessage } = useHomeownerChat();
```

**Thread list** — replace hardcoded threads:

AI assistant thread stays as static/mock (pinned at top, no real API).

Group bids section — map `channels`:
```tsx
{channels.length === 0 ? (
  <div style={{ padding:"10px 8px", fontSize:12, color:"var(--ink-400)" }}>No group bids yet</div>
) : channels.map((ch) => (
  // render thread row with ch.request_title, ch.last_message, ch.unread_count
  // onClick: select this channel (type="group", id=ch.id)
))}
```

Providers section — map `conversations`:
```tsx
{conversations.map((conv) => (
  // render thread row with conv.other_user_name, conv.last_message, conv.unread_count
  // onClick: select this conversation (type="dm", id=conv.id)
))}
```

**Active thread state**:
```ts
const [activeThread, setActiveThread] = useState<{type:"ai"|"dm"|"group"; id:number}|null>(null);
const [messages, setMessages] = useState<import("@/hooks/useHomeownerChat").ChatMessage[]>([]);
const [draft, setDraft] = useState("");
const bottomRef = useRef<HTMLDivElement>(null);
```

On thread select, call `getMessages(type, id)` and set messages.

**Send** calls `sendMessage(type, id, draft)` then appends to messages.

**AI assistant thread**: when `activeThread?.type === "ai"`, render the existing static mock AI conversation (no real API call needed).

---

### Profile Page (`src/app/app/homeowner/profile/page.tsx`)

Add imports:
```ts
import { useHomeownerProfile } from "@/hooks/useHomeownerProfile";
```

At component top:
```ts
const { profile, user, loading, saving, updateProfile, updateUser } = useHomeownerProfile();
```

Replace hardcoded values:
- Name `"Lance Silva"` → `user?.full_name ?? "—"`
- Email `"lance@email.com"` → `user?.email ?? "—"`
- Phone `"+1 (215) 555-0192"` → `user?.phone ?? "Not set"`
- Address `"123 Maple St, Oakwood Heights"` → `user?.address ?? "Not set"`
- Radius `8 mi` → `${profile?.service_radius_mi ?? 8} mi`
- HOA verified → `user?.is_verified ? "HOA verified" : "Not verified"`

**Notification toggles** — replace static colors with real state:
- Bid updates toggle: on = `profile?.notif_bids`, onClick → `updateProfile({ notif_bids: !profile.notif_bids })`
- Group activity: `profile?.notif_groups`, onClick → `updateProfile({ notif_groups: !profile.notif_groups })`
- Savings reports: `profile?.notif_savings`, onClick → `updateProfile({ notif_savings: !profile.notif_savings })`

**Impact stats**:
- Saved: `$${Math.round((dashboard?.total_saved_cents??0)/100)}` — requires importing `useHomeownerDashboard` too, OR just show profile data if available.
  - Simpler: import `useHomeownerDashboard` and use `dashboard?.total_saved_cents`

---

## Acceptance Criteria

**Backend:**
- [ ] `alembic upgrade head` applies homeowner_profiles migration cleanly
- [ ] `GET /homeowner/dashboard` returns `cold_start: true` for new homeowner
- [ ] `GET /homeowner/me` auto-creates profile
- [ ] `GET /homeowner/requests` returns homeowner's requests (empty for new user)
- [ ] `GET /homeowner/bids` returns all bids on homeowner's requests
- [ ] Conversation endpoints for homeowner role work
- [ ] Group channel endpoints for homeowner role work
- [ ] `/docs` shows all new endpoints

**Frontend:**
- [ ] Dashboard: loading → cold start (new user) → real name + real active_requests count
- [ ] Bids: stats use real counts, accept/decline buttons call API
- [ ] Chat: real group channels + provider DMs listed, send works
- [ ] Profile: real name/email/phone, notification toggles call PATCH /homeowner/me
- [ ] `tsc --noEmit` zero errors

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude |
| 2026-05-07 | Completed | Codex implemented backend + 5 hooks + 4 pages. Migration clean. All endpoints verified (cold_start:true, empty requests/bids/conversations). tsc clean. Playwright passed all 4 pages. |
