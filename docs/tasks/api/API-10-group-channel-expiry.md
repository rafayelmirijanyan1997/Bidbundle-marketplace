# API-10 — Group Channel 30-Day Expiry

## Task Status
`Approved`

## Goal
When a homeowner accepts a bid (service is confirmed), the group channel for that
request should be stamped with an expiry date 30 days from now.  After that date
the channel is automatically excluded from the active list and treated as archived.
Channels are never pre-created — they only exist because a bid was submitted.

## Why This Task Comes Now
Group channel creation and membership are fully working (all members auto-added,
permissions correct).  The missing lifecycle piece is: channels should disappear
after the service is done, giving neighbours a 30-day wind-down window to wrap up
conversation before the channel is gone.

## What Codex Will Implement

### 1. `api/models/message.py`
Add `expires_at: Mapped[Optional[datetime]]` column to `GroupChannel`.

```python
expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, default=None)
```

### 2. New Alembic migration
File: `api/alembic/versions/d1e2f3a4b5c6_group_channel_expiry.py`

- `down_revision = "c2d3e4f5a6b7"` (latest existing migration)
- `upgrade()`: batch_alter_table `group_channels`, add column `expires_at` (DateTime, nullable=True)
- `downgrade()`: drop the column

### 3. `api/routers/bids.py` — `accept_bid` endpoint
After the bid is accepted and `service_request.status = "closed"`, find the
`GroupChannel` for that request and stamp it:

```python
from datetime import timedelta

channel = db.query(GroupChannel).filter(GroupChannel.request_id == service_request.id).first()
if channel:
    channel.expires_at = datetime.utcnow() + timedelta(days=30)
    db.add(channel)
```

Commit happens at the existing `db.commit()` at the end of the function — no extra commit needed; just add the channel update before the final commit.

### 4. `api/schemas/homeowner.py` — `GroupChannelOut`
Add `expires_at: Optional[datetime] = None` field so the frontend can show a
countdown ("Channel closes in 12 days").

### 5. `api/routers/homeowner.py` — `list_channels`
In the loop that builds the channel list, add expiry enforcement:

```python
from datetime import datetime

# Check expiry
now = datetime.utcnow()
if ch.expires_at and ch.expires_at <= now:
    # Stamp archived and skip — channel lifecycle is over
    if not ch.archived:
        ch.archived = True
        db.commit()
    continue   # exclude from active list

# existing archived filter still applies
if archived is not None and ch.archived != archived:
    continue
```

Include `expires_at` in the `GroupChannelOut` object appended to `result`.

### 6. `tests/test_west_adams_usc.py`
After Block 7 (Marcus accepts TroyFix bid), add assertions inside Block 10 or
after Block 7:

```python
from datetime import datetime, timedelta, timezone

# After acceptance, group channel should have expires_at set ~30 days out
r = marcus.get("/homeowner/channels")
marcus_ch = next((ch for ch in r.json() if ch["request_id"] == marcus_req_id), None)
check("Group channel has expires_at set after bid accepted",
      marcus_ch and marcus_ch.get("expires_at") is not None,
      f"channel: {marcus_ch}")
if marcus_ch and marcus_ch.get("expires_at"):
    expires = datetime.fromisoformat(marcus_ch["expires_at"].replace("Z", "+00:00"))
    days_remaining = (expires - datetime.now(timezone.utc)).days
    check("expires_at is ~30 days from now",
          28 <= days_remaining <= 31,
          f"days_remaining={days_remaining}")

# Channel is still visible (not expired yet)
check("Channel still in active list (not expired)",
      marcus_ch is not None)
```

## Files to Create or Modify

| File | Action |
|---|---|
| `api/models/message.py` | Add `expires_at` column to `GroupChannel` |
| `api/alembic/versions/d1e2f3a4b5c6_group_channel_expiry.py` | Create migration |
| `api/routers/bids.py` | Stamp `expires_at` on channel when bid accepted |
| `api/schemas/homeowner.py` | Add `expires_at` to `GroupChannelOut` |
| `api/routers/homeowner.py` | Enforce expiry in `list_channels` |
| `tests/test_west_adams_usc.py` | Add expiry assertions after Block 7 |

## Acceptance Criteria
- [ ] When a bid is accepted, the group channel's `expires_at` is set to `utcnow() + 30 days`
- [ ] `GET /homeowner/channels` returns `expires_at` in each channel object
- [ ] A channel whose `expires_at` has passed is excluded from the active channel list
- [ ] A channel whose `expires_at` has not passed remains visible
- [ ] Channels with no `expires_at` (service not yet confirmed) remain visible indefinitely
- [ ] `test_west_adams_usc.py` passes 146/146 (or higher with new assertions)

## Out of Scope
- Sending notification when channel is about to expire (belongs in API-9e alerts)
- Physically deleting messages from expired channels (archiving is sufficient)
- Any UI changes — backend only

## Codex Implementation Prompt

Implement group channel 30-day expiry for NeighBid.

Working directory: `/Users/lancedsilva/Documents/neighbid-claude-codex-starter/api`

**Step 1 — Model**
In `models/message.py`, add to `GroupChannel`:
```python
expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, default=None)
```

**Step 2 — Migration**
Create `alembic/versions/d1e2f3a4b5c6_group_channel_expiry.py`:
- `down_revision = "c2d3e4f5a6b7"`
- upgrade: `batch_alter_table("group_channels")` → `add_column("expires_at", DateTime, nullable=True)`
- downgrade: drop the column

Run the migration:
```
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter/api
source .venv/bin/activate
alembic upgrade head
```

**Step 3 — Stamp expiry on bid acceptance**
In `routers/bids.py`, inside `accept_bid`, after setting `service_request.status = "closed"` and before the final `db.commit()`:
```python
from datetime import timedelta
_channel = db.query(GroupChannel).filter(GroupChannel.request_id == service_request.id).first()
if _channel:
    _channel.expires_at = datetime.utcnow() + timedelta(days=30)
    db.add(_channel)
```
`GroupChannel` is already imported in this file.

**Step 4 — Schema**
In `schemas/homeowner.py`, add to `GroupChannelOut`:
```python
expires_at: Optional[datetime] = None
```

**Step 5 — Enforce expiry in list_channels**
In `routers/homeowner.py`, in `list_channels`, at the top of the `for ch in channels:` loop, add before the existing archived check:
```python
now = datetime.utcnow()
if ch.expires_at and ch.expires_at <= now:
    if not ch.archived:
        ch.archived = True
        db.commit()
    continue
```
Also include `expires_at=ch.expires_at` in the `GroupChannelOut(...)` constructor call at the bottom of the loop.

**Step 6 — Tests**
In `tests/test_west_adams_usc.py`, after the existing Block 7 assertions (after the `Marcus active_requests=0` check), insert:
```python
# Verify group channel expiry stamped after bid acceptance
from datetime import timezone
r = marcus.get("/homeowner/channels")
marcus_ch = next((ch for ch in r.json() if ch.get("request_id") == marcus_req_id), None)
check("Group channel has expires_at after bid accepted",
      marcus_ch and marcus_ch.get("expires_at") is not None,
      f"channel={marcus_ch}")
if marcus_ch and marcus_ch.get("expires_at"):
    from datetime import timezone
    exp = datetime.fromisoformat(marcus_ch["expires_at"].replace("Z", "+00:00"))
    days = (exp - datetime.now(timezone.utc)).days
    check("expires_at is 28-31 days from now", 28 <= days <= 31, f"days={days}")
check("Expired channel still visible within 30-day window", marcus_ch is not None)
```

After all steps, run:
```
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter
source api/.venv/bin/activate
python3 tests/test_west_adams_usc.py
```
All tests must pass (149/149 or higher).

## Task Update Log
- 2026-05-08 — Task written and approved. Delegated to Codex.
