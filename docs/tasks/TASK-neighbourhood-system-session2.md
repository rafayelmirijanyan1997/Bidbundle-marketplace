# TASK — Neighbourhood System Session 2: Messaging + Chat Integration

**Status:** Approved
**Approved:** 2026-05-07

---

## Goal

1. Add messaging to the neighbourhood general channel (send + receive)
2. Archive bid subchannels when their request closes
3. Surface the neighbourhood channel in the homeowner chat sidebar (pinned at top)
4. Show archived bid subchannels in a collapsed section

---

## What Codex will implement (backend only)

### 1. Migration — `api/alembic/versions/c2d3e4f5a6b7_neighbourhood_messages_archive.py`

```python
revision: str = "c2d3e4f5a6b7"
down_revision: str = "b1c2d3e4f5a6"   # neighbourhood_system

def upgrade() -> None:
    # Add neighbourhood_channel_id to messages (nullable FK)
    with op.batch_alter_table("messages") as batch_op:
        batch_op.add_column(
            sa.Column("neighbourhood_channel_id", sa.Integer(),
                      sa.ForeignKey("neighbourhood_channels.id"), nullable=True)
        )
    # Add archived flag to group_channels
    with op.batch_alter_table("group_channels") as batch_op:
        batch_op.add_column(
            sa.Column("archived", sa.Boolean(), nullable=False,
                      server_default=sa.text("0"))
        )

def downgrade() -> None:
    with op.batch_alter_table("group_channels") as batch_op:
        batch_op.drop_column("archived")
    with op.batch_alter_table("messages") as batch_op:
        batch_op.drop_column("neighbourhood_channel_id")
```

---

### 2. Update `api/models/message.py`

Add `neighbourhood_channel_id` to `Message`:
```python
neighbourhood_channel_id: Mapped[Optional[int]] = mapped_column(
    ForeignKey("neighbourhood_channels.id"), nullable=True
)
```

Add `archived` to `GroupChannel`:
```python
archived: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="0")
```

Both `Optional` and `Boolean` are already imported (or add them).

---

### 3. Update `api/routers/neighbourhood.py`

Add message schemas and two new endpoints at the bottom:

```python
from models.message import Message
from models.user import User

class NeighbourhoodMessageOut(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    text: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class NeighbourhoodMessageIn(BaseModel):
    text: str


@router.get("/channel/messages", response_model=list[NeighbourhoodMessageOut])
def get_neighbourhood_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    """Return the last 50 messages for the user's neighbourhood channel."""
    if not current_user.neighbourhood_id:
        return []
    channel = db.query(NeighbourhoodChannel).filter(
        NeighbourhoodChannel.neighbourhood_id == current_user.neighbourhood_id
    ).first()
    if not channel:
        return []
    # Verify membership
    from models.neighbourhood import NeighbourhoodChannelMember
    is_member = db.query(NeighbourhoodChannelMember).filter(
        NeighbourhoodChannelMember.channel_id == channel.id,
        NeighbourhoodChannelMember.user_id == current_user.id,
    ).first()
    if not is_member:
        return []

    messages = (
        db.query(Message)
        .filter(Message.neighbourhood_channel_id == channel.id)
        .order_by(Message.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for msg in reversed(messages):
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": sender.full_name if sender else "Unknown",
            "text": msg.text,
            "created_at": msg.created_at,
        })
    return result


@router.post("/channel/messages", response_model=NeighbourhoodMessageOut, status_code=201)
def send_neighbourhood_message(
    payload: NeighbourhoodMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Send a message to the neighbourhood general channel."""
    if not current_user.neighbourhood_id:
        raise HTTPException(status_code=404, detail="Not in a neighbourhood")
    channel = db.query(NeighbourhoodChannel).filter(
        NeighbourhoodChannel.neighbourhood_id == current_user.neighbourhood_id
    ).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Neighbourhood channel not found")
    from models.neighbourhood import NeighbourhoodChannelMember
    is_member = db.query(NeighbourhoodChannelMember).filter(
        NeighbourhoodChannelMember.channel_id == channel.id,
        NeighbourhoodChannelMember.user_id == current_user.id,
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a channel member")
    msg = Message(
        sender_id=current_user.id,
        neighbourhood_channel_id=channel.id,
        text=payload.text.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_name": current_user.full_name,
        "text": msg.text,
        "created_at": msg.created_at,
    }
```

---

### 4. Update `api/routers/homeowner.py` — archive subchannels

In the `list_channels` endpoint (`GET /homeowner/channels`), currently it only returns channels for live requests. Update the `GroupChannelOut` schema and response to include `archived` field, and also auto-archive channels whose request has status `closed`:

Find the `list_channels` function. Inside the loop where channels are built, add auto-archive logic:

```python
# Auto-archive channel if request is closed
req = db.query(ServiceRequest).filter(ServiceRequest.id == ch.request_id).first()
if req and req.status == "closed" and not ch.archived:
    ch.archived = True
    db.commit()
```

Also update `GroupChannelOut` schema in `api/schemas/homeowner.py` to include `archived: bool = False`.

Return ALL channels (not just active ones) so the frontend can render archived ones separately. Change the query to not filter by status, just return all channels the user is a participant in.

---

### 5. Update `api/schemas/homeowner.py`

Find `GroupChannelOut` and add:
```python
archived: bool = False
```

---

### 6. Run migration

```bash
cd api && alembic upgrade head
```

---

## Files to create or modify (backend — Codex)

| File | Action |
|------|--------|
| `api/alembic/versions/c2d3e4f5a6b7_neighbourhood_messages_archive.py` | Create migration |
| `api/models/message.py` | Add neighbourhood_channel_id to Message, archived to GroupChannel |
| `api/routers/neighbourhood.py` | Add message schemas + GET/POST /channel/messages |
| `api/routers/homeowner.py` | Auto-archive closed channels, return all channels |
| `api/schemas/homeowner.py` | Add archived field to GroupChannelOut |

## Files to modify (frontend — Claude will handle after Codex)

| File | Action |
|------|--------|
| `src/hooks/useHomeownerChat.ts` | Add neighbourhood channel + messages to the hook |
| `src/app/app/homeowner/chat/page.tsx` | Pin neighbourhood channel at top, archived section |

---

## Acceptance criteria

1. `GET /neighbourhood/channel/messages` returns messages for the channel.
2. `POST /neighbourhood/channel/messages` creates a message visible to all members.
3. Non-members get 403.
4. Users with no neighbourhood get empty list (not error).
5. `GroupChannel.archived` column exists; closed-request channels get auto-archived on list.
6. `GET /homeowner/channels` returns `archived: true` on archived channels.
7. `alembic upgrade head` runs clean.

---

## Codex implementation prompt

```
Implement TASK — Neighbourhood System Session 2 (backend only) for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/TASK-neighbourhood-system-session2.md

Files to read for context before coding:
  api/routers/neighbourhood.py     (append messages endpoints)
  api/routers/homeowner.py         (update list_channels)
  api/models/message.py            (add neighbourhood_channel_id + archived)
  api/schemas/homeowner.py         (add archived to GroupChannelOut)
  api/alembic/versions/b1c2d3e4f5a6_neighbourhood_system.py   (check down_revision)
  api/dependencies.py

Implement exactly the 5 backend files specified.
After writing all files run: cd api && alembic upgrade head
Then: python -m py_compile on all changed files.
Do NOT touch any src/ frontend files.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Backend by Codex + Claude fixed wrong model refs. Frontend by Claude. tsc clean. Neighbourhood channel pinned in sidebar, messaging works bidirectional, archived bids collapsed, real messages persist to DB. |
