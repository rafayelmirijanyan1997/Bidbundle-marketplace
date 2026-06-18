# API-7 — NeighBid AI Chat Endpoints

**Status:** Completed

## Goal

Add an AI assistant backed by OpenAI `gpt-4o-mini` to the NeighBid platform:
1. `POST /ai/chat` — personal AI assistant for any logged-in user (homeowner or provider)
2. `POST /ai/group/{channel_id}` — AI posts a reply inside a group bid channel as a bot
3. `GET /ai/history` — fetch conversation memory for the current user
4. `DELETE /ai/memory` — clear the user's AI memory

The AI is injected with live context from the database (requests, bids, profile) so it
can give meaningful, personalised answers about bidding, pricing, and decisions.

If `OPENAI_API_KEY` is missing, every endpoint returns a graceful stub response so the
rest of the app keeps working until the key is added.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `api/requirements.txt` | Add `openai>=1.30.0` |
| `api/models/ai_memory.py` | CREATE |
| `api/schemas/ai.py` | CREATE |
| `api/routers/ai.py` | CREATE |
| `api/alembic/versions/XXXX_ai_memory.py` | CREATE migration |
| `api/models/__init__.py` | Add AIMemory import |
| `api/main.py` | Register ai router |

---

## Step 1 — `api/requirements.txt`

Append:
```
openai>=1.30.0
```

---

## Step 2 — `api/models/ai_memory.py`

```python
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class AIMemory(Base):
    """
    Stores per-user AI conversation history.
    context_key scopes the memory:
      - "general"           → personal AI assistant
      - "group:{channel_id}" → group bid channel
    role is "user" | "assistant" | "system"
    """
    __tablename__ = "ai_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    context_key: Mapped[str] = mapped_column(String, nullable=False, default="general")
    role: Mapped[str] = mapped_column(String, nullable=False)   # user | assistant | system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
```

---

## Step 3 — Alembic migration

Create `api/alembic/versions/XXXX_ai_memory.py`.
Set `down_revision` to the homeowner_profiles migration revision ID
(find it by reading the homeowner_profiles migration file — it will be something like `ab12cd34ef56`).
Generate a unique 12-char hex revision ID for this migration.

```python
def upgrade() -> None:
    op.create_table(
        "ai_memory",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("context_key", sa.String(), nullable=False, server_default="general"),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False,
                  server_default=sa.text("(CURRENT_TIMESTAMP)")),
    )
    op.create_index("ix_ai_memory_user_context",
                    "ai_memory", ["user_id", "context_key"])

def downgrade() -> None:
    op.drop_index("ix_ai_memory_user_context", table_name="ai_memory")
    op.drop_table("ai_memory")
```

---

## Step 4 — `api/schemas/ai.py`

```python
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict


class AIChatRequest(BaseModel):
    message: str
    context_key: str = "general"   # "general" or "group:{channel_id}"


class AIChatResponse(BaseModel):
    reply: str
    context_key: str
    tokens_used: Optional[int] = None
    stub: bool = False             # True when OPENAI_API_KEY is not set


class AIMemoryOut(BaseModel):
    id: int
    user_id: int
    context_key: str
    role: str
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
```

---

## Step 5 — `api/routers/ai.py`

```python
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db
from models.ai_memory import AIMemory
from models.bid import Bid
from models.message import GroupChannel, Message
from models.request import ServiceRequest
from models.user import User
from schemas.ai import AIChatRequest, AIChatResponse, AIMemoryOut

router = APIRouter(prefix="/ai", tags=["ai"])

# Max messages kept per context to avoid token bloat
MEMORY_WINDOW = 20


# ── Context builder ───────────────────────────────────────────

def _build_system_prompt(db: Session, user: User, context_key: str) -> str:
    """Assemble a system prompt with live DB context for the current user."""
    lines = [
        "You are NeighBid AI — a friendly, concise assistant built into a community "
        "home-services bidding platform called NeighBid.",
        "",
        "NeighBid lets neighbours group home-service requests so providers compete for "
        "the whole block, giving everyone group pricing instead of solo quotes.",
        "",
        f"=== Current user ===",
        f"Name: {user.full_name}",
        f"Role: {user.role}",
        f"Neighborhood: {user.neighborhood or 'not set'}",
    ]

    if user.role == "homeowner":
        requests = (
            db.query(ServiceRequest)
            .filter(ServiceRequest.user_id == user.id)
            .order_by(ServiceRequest.created_at.desc())
            .limit(5)
            .all()
        )
        if requests:
            lines += ["", "=== Active service requests ==="]
            for req in requests:
                bids = db.query(Bid).filter(Bid.request_id == req.id).all()
                best = min((b.amount for b in bids if b.status == "pending"), default=None)
                lines.append(
                    f"- [{req.id}] {req.title} | status={req.status} | "
                    f"budget=${req.budget_min//100}–${req.budget_max//100} | "
                    f"bids={len(bids)}"
                    + (f" | best_bid=${best//100}" if best else "")
                )

    if user.role == "provider":
        bids = (
            db.query(Bid)
            .filter(Bid.provider_id == user.id)
            .order_by(Bid.created_at.desc())
            .limit(5)
            .all()
        )
        if bids:
            lines += ["", "=== Recent bids ==="]
            for b in bids:
                req = db.query(ServiceRequest).filter(ServiceRequest.id == b.request_id).first()
                lines.append(
                    f"- bid #{b.id} | {req.title if req else '?'} | "
                    f"${b.amount//100} | {b.status}"
                )

    # Group channel context
    if context_key.startswith("group:"):
        try:
            channel_id = int(context_key.split(":")[1])
        except ValueError:
            channel_id = None

        if channel_id:
            channel = db.query(GroupChannel).filter(GroupChannel.id == channel_id).first()
            if channel:
                req = db.query(ServiceRequest).filter(
                    ServiceRequest.id == channel.request_id
                ).first()
                if req:
                    bids = db.query(Bid).filter(Bid.request_id == req.id).all()
                    lines += ["", "=== This group bid channel ===",
                               f"Request: {req.title}",
                               f"Neighborhood: {req.neighborhood}",
                               f"Budget: ${req.budget_min//100}–${req.budget_max//100}",
                               f"Status: {req.status}"]
                    if bids:
                        lines.append("Bids received:")
                        for b in bids:
                            provider = db.query(User).filter(User.id == b.provider_id).first()
                            lines.append(
                                f"  - {provider.full_name if provider else 'Unknown'}: "
                                f"${b.amount//100} / {b.estimated_days}d / status={b.status}"
                            )
                # Last 5 channel messages for context
                recent_msgs = (
                    db.query(Message)
                    .filter(Message.channel_id == channel_id)
                    .order_by(Message.created_at.desc())
                    .limit(5)
                    .all()
                )
                if recent_msgs:
                    lines += ["", "=== Recent group messages ==="]
                    for m in reversed(recent_msgs):
                        sender = db.query(User).filter(User.id == m.sender_id).first()
                        lines.append(f"{sender.full_name if sender else 'User'}: {m.content if hasattr(m, 'content') else m.text}")

    lines += [
        "",
        "=== Instructions ===",
        "Be concise (2–4 sentences max unless asked for detail).",
        "Give actionable recommendations. Use dollar amounts when relevant.",
        "If asked which bid to accept, compare price, rating, and timeline.",
        "Do not make up provider names or prices — only use the data above.",
    ]

    return "\n".join(lines)


# ── Memory helpers ────────────────────────────────────────────

def _load_memory(db: Session, user_id: int, context_key: str) -> list[dict]:
    """Load last MEMORY_WINDOW messages for this user+context as OpenAI message dicts."""
    rows = (
        db.query(AIMemory)
        .filter(AIMemory.user_id == user_id, AIMemory.context_key == context_key)
        .order_by(AIMemory.created_at.desc())
        .limit(MEMORY_WINDOW)
        .all()
    )
    return [{"role": r.role, "content": r.content} for r in reversed(rows)]


def _save_memory(db: Session, user_id: int, context_key: str,
                 role: str, content: str) -> None:
    mem = AIMemory(user_id=user_id, context_key=context_key,
                   role=role, content=content)
    db.add(mem)
    db.commit()

    # Prune to keep only last MEMORY_WINDOW * 2 rows per context
    total = (
        db.query(func.count(AIMemory.id))
        .filter(AIMemory.user_id == user_id, AIMemory.context_key == context_key)
        .scalar() or 0
    )
    if total > MEMORY_WINDOW * 2:
        oldest = (
            db.query(AIMemory)
            .filter(AIMemory.user_id == user_id, AIMemory.context_key == context_key)
            .order_by(AIMemory.created_at)
            .limit(total - MEMORY_WINDOW * 2)
            .all()
        )
        for row in oldest:
            db.delete(row)
        db.commit()


# ── OpenAI call ───────────────────────────────────────────────

def _call_openai(system_prompt: str, messages: list[dict]) -> tuple[str, Optional[int]]:
    """
    Call OpenAI chat completions. Returns (reply_text, tokens_used).
    Raises RuntimeError if the API key is missing.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")

    from openai import OpenAI  # lazy import — only when key exists
    client = OpenAI(api_key=api_key)

    full_messages = [{"role": "system", "content": system_prompt}] + messages
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=full_messages,
        temperature=0.7,
        max_tokens=512,
    )
    reply = resp.choices[0].message.content or ""
    tokens = resp.usage.total_tokens if resp.usage else None
    return reply, tokens


# ── Endpoints ─────────────────────────────────────────────────

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIChatResponse:
    """
    Personal AI assistant. Maintains memory per user+context_key.
    Works for both homeowners and providers.
    Returns a stub if OPENAI_API_KEY is not set.
    """
    context_key = payload.context_key
    system_prompt = _build_system_prompt(db, current_user, context_key)
    history = _load_memory(db, current_user.id, context_key)

    # Save user message to memory
    _save_memory(db, current_user.id, context_key, "user", payload.message)
    history.append({"role": "user", "content": payload.message})

    try:
        reply, tokens = _call_openai(system_prompt, history)
        stub = False
    except RuntimeError:
        reply = (
            "NeighBid AI is not configured yet — add OPENAI_API_KEY to api/.env "
            "and restart the server."
        )
        tokens = None
        stub = True

    # Save assistant reply to memory (even stubs, so history is preserved)
    _save_memory(db, current_user.id, context_key, "assistant", reply)

    return AIChatResponse(
        reply=reply,
        context_key=context_key,
        tokens_used=tokens,
        stub=stub,
    )


@router.post("/group/{channel_id}", response_model=AIChatResponse)
def ai_group_chat(
    channel_id: int,
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIChatResponse:
    """
    AI triggered inside a group bid channel.
    - Validates the user belongs to the channel (homeowner of the request or provider who bid)
    - Posts the AI reply as a Message in the channel so all members see it
    - Uses context_key "group:{channel_id}" for scoped memory
    """
    channel = db.query(GroupChannel).filter(GroupChannel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    req = db.query(ServiceRequest).filter(ServiceRequest.id == channel.request_id).first()
    is_homeowner_owner = req and req.user_id == current_user.id
    is_provider_bidder = db.query(Bid).filter(
        Bid.request_id == channel.request_id,
        Bid.provider_id == current_user.id,
    ).first() is not None

    if not (is_homeowner_owner or is_provider_bidder):
        raise HTTPException(status_code=403, detail="Not a channel participant")

    context_key = f"group:{channel_id}"
    payload.context_key = context_key

    system_prompt = _build_system_prompt(db, current_user, context_key)
    history = _load_memory(db, current_user.id, context_key)
    _save_memory(db, current_user.id, context_key, "user", payload.message)
    history.append({"role": "user", "content": payload.message})

    try:
        reply, tokens = _call_openai(system_prompt, history)
        stub = False
    except RuntimeError:
        reply = (
            "NeighBid AI is not configured yet — add OPENAI_API_KEY to api/.env "
            "and restart the server."
        )
        tokens = None
        stub = True

    _save_memory(db, current_user.id, context_key, "assistant", reply)

    # Post the AI reply into the channel as a real Message so all members see it
    # Use a sentinel sender_id = 0 to indicate AI (or current_user if no AI user exists)
    # We'll use current_user.id with a "[NeighBid AI]" prefix in the text
    ai_msg = Message(
        sender_id=current_user.id,
        channel_id=channel_id,
        text=f"[NeighBid AI] {reply}",
    )
    db.add(ai_msg)
    db.commit()

    return AIChatResponse(
        reply=reply,
        context_key=context_key,
        tokens_used=tokens,
        stub=stub,
    )


@router.get("/history", response_model=list[AIMemoryOut])
def get_history(
    context_key: str = "general",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AIMemoryOut]:
    """Return conversation history for the current user and context."""
    return (
        db.query(AIMemory)
        .filter(
            AIMemory.user_id == current_user.id,
            AIMemory.context_key == context_key,
        )
        .order_by(AIMemory.created_at)
        .all()
    )


@router.delete("/memory", status_code=204)
def clear_memory(
    context_key: str = "general",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete all AI memory for this user and context."""
    db.query(AIMemory).filter(
        AIMemory.user_id == current_user.id,
        AIMemory.context_key == context_key,
    ).delete()
    db.commit()
```

---

## Step 6 — Register in `api/main.py`

Add after existing router imports:
```python
from routers.ai import router as ai_router
```
Add after existing `app.include_router(...)`:
```python
app.include_router(ai_router)
```

---

## Step 7 — `api/models/__init__.py`

Add:
```python
from models.ai_memory import AIMemory
```

---

## After implementation, run:

```bash
cd api
pip install openai --break-system-packages -q   # or activate venv first
alembic upgrade head
python -c "from main import app; print('OK')"
```

---

## How the AI memory works

```
User sends message → load last 20 messages from ai_memory for this user+context
                   → build system prompt with live DB context (requests, bids, profile)
                   → call gpt-4o-mini with [system_prompt] + [history] + [new_message]
                   → save user message + AI reply to ai_memory
                   → prune to keep only last 40 rows per context
                   → return reply to client
```

Per-context memory means:
- `"general"` — the homeowner's personal AI chat (remembers previous conversations)
- `"group:42"` — memory scoped to group channel 42 (remembers what was discussed in that bid group)

Each user's memory is **isolated** — no user sees another user's AI conversation history.

---

## Acceptance Criteria

- [ ] `alembic upgrade head` creates `ai_memory` table
- [ ] `POST /ai/chat` with valid token returns `{ reply, context_key, stub: true }` when no API key
- [ ] `POST /ai/chat` returns `stub: false` and a real GPT reply when key is set
- [ ] `POST /ai/group/{channel_id}` posts AI reply as a Message in the channel
- [ ] `GET /ai/history` returns previous messages for the context
- [ ] `DELETE /ai/memory` clears memory, subsequent `/history` returns []
- [ ] Role enforcement: any logged-in user can use `/ai/chat`, only channel participants can use `/ai/group/{id}`

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude |
| 2026-05-07 | Completed | Codex implemented all 7 files. Migration clean. All 4 endpoints verified: chat returns stub:true (no key), history persists messages, delete clears, group channel endpoint registered. |
