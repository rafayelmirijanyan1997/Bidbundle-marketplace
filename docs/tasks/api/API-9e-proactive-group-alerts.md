# API-9e — Proactive Group Alerts

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07

---

## Goal

Daily (or on-demand) cron logic finds homeowners whose neighborhood + service category matches
an existing live/grouping request they haven't joined. Creates in-app notification records.
Homeowners see an alert banner on their dashboard and can join the group with one click.

---

## Why this task comes now

All prior infrastructure is in place. The `Notification` model and its migration are the only
new backend pieces. Everything else (ServiceRequest queries, User queries, router pattern) follows
the existing codebase conventions exactly.

---

## What Codex will implement

### 1. New model — `api/models/notification.py`

```python
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False, default="group_alert")
    title: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    action_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
```

---

### 2. Update `api/models/__init__.py`

Add the Notification import and export alongside the existing ones:
```python
from models.notification import Notification
# add "Notification" to __all__
```

---

### 3. New Alembic migration — `api/alembic/versions/a9e1b2c3d4f5_notifications.py`

```python
revision: str = "a9e1b2c3d4f5"
down_revision: str = "f3b7a1c9d2e4"   # latest existing migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False, server_default="group_alert"),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("action_url", sa.String(), nullable=True),
        sa.Column("read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
```

---

### 4. New cron service — `api/services/group_alert_cron.py`

```python
"""
Group alert cron: find homeowners who could benefit from joining an existing group.
Call run_group_alerts(db) from the trigger endpoint or a real scheduler.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models.notification import Notification
from models.request import ServiceRequest
from models.user import User


def run_group_alerts(db: Session) -> int:
    """
    For every homeowner with a request in status draft/live/grouping:
      - Find OTHER requests (not theirs) in same neighborhood + same category
        that are currently live or grouping.
      - If we haven't alerted this user about this other request in the last 7 days,
        create a Notification record.
    Returns the count of new notifications created.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    created_count = 0

    # All homeowners who have at least one open request
    homeowner_requests = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.status.in_(["draft", "live", "grouping"]))
        .all()
    )

    for my_req in homeowner_requests:
        user = db.query(User).filter(User.id == my_req.user_id).first()
        if not user or user.role != "homeowner":
            continue

        # Find other grouping/live requests in the same neighborhood + category
        other_requests = (
            db.query(ServiceRequest)
            .filter(
                ServiceRequest.neighborhood == my_req.neighborhood,
                ServiceRequest.category == my_req.category,
                ServiceRequest.status.in_(["live", "grouping"]),
                ServiceRequest.user_id != my_req.user_id,
            )
            .all()
        )

        for other in other_requests:
            # Check if we already sent an alert for this pair in the last 7 days
            existing = (
                db.query(Notification)
                .filter(
                    Notification.user_id == my_req.user_id,
                    Notification.type == "group_alert",
                    Notification.action_url == f"/app/homeowner/bids?group={other.id}",
                    Notification.created_at >= cutoff,
                )
                .first()
            )
            if existing:
                continue

            bids_count = len(other.bids) if other.bids else 0
            title = f"Join a {other.category} group in {other.neighborhood}"
            body = (
                f"{bids_count} neighbor{'s' if bids_count != 1 else ''} already "
                f"requesting {other.category} this week — join their group and save."
            )

            notification = Notification(
                user_id=my_req.user_id,
                type="group_alert",
                title=title,
                body=body,
                action_url=f"/app/homeowner/bids?group={other.id}",
                read=False,
            )
            db.add(notification)
            created_count += 1

    db.commit()
    return created_count
```

---

### 5. New router — `api/routers/notifications.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from dependencies import get_current_user, get_db
from models.notification import Notification
from models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    action_url: Optional[str] = None
    read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.read == False)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )


@router.post("/{notification_id}/read", status_code=204)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read = True
    db.commit()


@router.delete("/{notification_id}", status_code=204)
def dismiss_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(n)
    db.commit()
```

---

### 6. New AI trigger endpoint — append to `api/routers/ai.py`

```python
@router.post("/run-group-alerts")
def run_group_alerts_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Trigger the group alert cron. Any authenticated user can call this for testing."""
    from services.group_alert_cron import run_group_alerts
    count = run_group_alerts(db)
    return {"created": count}
```

---

### 7. Update `api/main.py`

Import and register the notifications router:
```python
from routers.notifications import router as notifications_router
# add after existing include_router calls:
app.include_router(notifications_router)
```

---

### 8. Run the migration

After creating the migration file, run it:
```bash
cd api && alembic upgrade head
```

---

### 9. New hook — `src/hooks/useNotifications.ts`

```typescript
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface AppNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    apiFetch<AppNotification[]>("/notifications", { token })
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const markRead = async (id: number) => {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/notifications/${id}/read`, { method: "POST", token });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismiss = async (id: number) => {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/notifications/${id}`, { method: "DELETE", token });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, loading, refresh, markRead, dismiss };
}
```

---

### 10. Updated page — `src/app/app/homeowner/dashboard/page.tsx`

**Targeted additions only — do not rewrite the file.**

#### 10a — Add imports inside the component file

```typescript
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";  // already present — do not duplicate
```

Inside `HomeownerDashboard` (add alongside the existing hook calls):
```typescript
const { notifications, markRead, dismiss } = useNotifications();
```

#### 10b — Wire the bell button to real notification count

The dashboard topbar already has a bell button with a hardcoded "3". Replace it:

Current:
```tsx
<button style={{ ... }}>
  <IconBell /> 3
</button>
```

Replace with:
```tsx
<button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}>
  <IconBell /> {notifications.length > 0 ? notifications.length : ""}
</button>
```

#### 10c — Add the alert banner

Insert the following **between the topbar div and the `{/* Scroll content */}` div** (after the closing `</div>` of the topbar, before `<div style={{ padding: "0 36px 36px" }}>`):

```tsx
{notifications.length > 0 && (
  <div style={{ padding: "0 36px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
    {notifications.slice(0, 3).map((n) => (
      <div
        key={n.id}
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto",
          gap: 14,
          alignItems: "center",
          background: "var(--sage-50)",
          border: "1px solid var(--border-warm)",
          borderRadius: 14,
          padding: "14px 18px",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sage-100)", display: "grid", placeItems: "center" }}>
          <IconBell />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{n.title}</div>
          <div style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 2 }}>{n.body}</div>
        </div>
        {n.action_url && (
          <Link
            href={n.action_url}
            onClick={() => void markRead(n.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "var(--terracotta-600)", color: "white", textDecoration: "none" }}
          >
            Join group →
          </Link>
        )}
        <button
          onClick={() => void dismiss(n.id)}
          style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 18, color: "var(--ink-400)", lineHeight: 1, padding: 4 }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}
```

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/models/notification.py` | Create |
| `api/models/__init__.py` | Add Notification import + export |
| `api/alembic/versions/a9e1b2c3d4f5_notifications.py` | Create migration |
| `api/services/group_alert_cron.py` | Create |
| `api/routers/notifications.py` | Create |
| `api/routers/ai.py` | Append `/run-group-alerts` endpoint |
| `api/main.py` | Import + register notifications router |
| `src/hooks/useNotifications.ts` | Create |
| `src/app/app/homeowner/dashboard/page.tsx` | Targeted additions only |

---

## Acceptance criteria

1. `GET /notifications` returns empty list for a fresh user; returns alert records after cron runs.
2. `POST /notifications/{id}/read` marks a notification read (it disappears from the unread list).
3. `DELETE /notifications/{id}` removes the notification.
4. `POST /ai/run-group-alerts` creates notifications and returns `{"created": N}`.
5. Notifications do not duplicate within 7 days for the same user + group.
6. Dashboard bell button shows real unread count (empty string when 0).
7. Alert banner renders below the topbar when notifications exist.
8. "Join group →" link marks the notification read and navigates to bids.
9. × button dismisses the notification immediately.
10. `tsc --noEmit` passes with no new errors.
11. `alembic upgrade head` succeeds (notifications table created).

---

## Test steps

1. Restart API after migration: `alembic upgrade head && uvicorn main:app --port 8000`
2. `GET /notifications` with any JWT → empty list.
3. Create a homeowner + a service request in same neighborhood/category.
4. `POST /ai/run-group-alerts` → `{"created": N}` (N > 0 if overlap exists).
5. `GET /notifications` → list of alert records.
6. `POST /notifications/{id}/read` → 204; `GET /notifications` → notification gone.
7. Run cron again within 7 days → `{"created": 0}` (no duplicates).
8. Navigate to `/app/homeowner/dashboard` — alert banner visible if notifications exist.
9. Click × → notification disappears from UI.

---

## Out of scope

- Push notifications (web/mobile)
- Email delivery
- Admin notification management
- Dispute Mediator (9f) or Demand Forecasting (9g)

---

## Codex implementation prompt

```
Implement API-9e — Proactive Group Alerts for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9e-proactive-group-alerts.md

Files to read for context before coding:
  api/models/__init__.py              (add Notification import here)
  api/models/user.py                  (User model)
  api/models/request.py               (ServiceRequest)
  api/models/bid.py                   (Bid — for bids count)
  api/alembic/versions/f3b7a1c9d2e4_ai_memory.py  (check down_revision chain)
  api/routers/ai.py                   (append run-group-alerts endpoint)
  api/main.py                         (register notifications router)
  api/dependencies.py                 (get_current_user, get_db)
  src/app/app/homeowner/dashboard/page.tsx  (targeted additions only)
  src/lib/api.ts
  src/lib/auth.ts

Implement exactly what the spec says.
After creating the migration file run: cd api && alembic upgrade head
After all files are written run: npx tsc --noEmit from the project root.
Fix any TypeScript or Python errors before finishing.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Backend by Codex, frontend by Claude (sandbox restriction). tsc + alembic clean. 55 notifications created on first cron run, 0 duplicates on second run. Banner shows up to 3 alerts, dismiss/bell count wired correctly. |
