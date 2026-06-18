# API-11 — Group Bidding Flow — Session 2: 72h Cron + Provider Job Feed

## Task Status
`Approved`

## Goal
1. Add a cron service that flips groups from `grouping → pending_approval` when the 72-hour window expires, notifying all members they need to vote.
2. Add a trigger endpoint so the cron can be called manually or by a scheduler.
3. Update the provider job feed to show only `bidding` groups (not individual requests), so providers never see a group before all members approve.

---

## What Codex Will Implement

### Step 1 — Create `api/services/group_cron.py`

```python
"""
Group cron: flip expired grouping-phase groups to pending_approval.
Call run_group_cron(db) from the trigger endpoint or a real scheduler.
"""
from datetime import datetime

from sqlalchemy.orm import Session

from models.notification import Notification
from models.request_group import GroupMember, RequestGroup


def run_group_cron(db: Session) -> dict:
    """
    For every group whose grouping_closes_at has passed and status is still 'grouping':
    - If no active members remain → cancel the group.
    - Otherwise → flip to 'pending_approval' and notify all active members.
    Returns {"flipped": N, "cancelled": M}.
    """
    now = datetime.utcnow()
    expired = (
        db.query(RequestGroup)
        .filter(
            RequestGroup.status == "grouping",
            RequestGroup.grouping_closes_at <= now,
        )
        .all()
    )

    flipped = 0
    cancelled = 0

    for group in expired:
        active = [m for m in group.members if m.approval_status != "cancelled"]
        if not active:
            group.status = "cancelled"
            cancelled += 1
        else:
            group.status = "pending_approval"
            flipped += 1
            for m in active:
                db.add(
                    Notification(
                        user_id=m.user_id,
                        type="approval_needed",
                        title=f"Your {group.category} group needs your vote",
                        body=(
                            f"The 72-hour grouping window just closed with "
                            f"{len(active)} neighbour{'s' if len(active) != 1 else ''}. "
                            "Go to My Bids to approve or cancel — once everyone votes, "
                            "providers will see your group."
                        ),
                        action_url="/app/homeowner/bids",
                    )
                )

    db.commit()
    return {"flipped": flipped, "cancelled": cancelled}
```

---

### Step 2 — Add cron trigger endpoint to `api/routers/ai.py`

Add this import at the top of ai.py (alongside the existing group_alert_cron import):
```python
from services.group_cron import run_group_cron
```

Add this endpoint right after the existing `run_group_alerts_endpoint`:
```python
@router.post("/run-group-cron")
def run_group_cron_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Trigger the group-phase cron manually. Any authenticated user can call this for testing."""
    result = run_group_cron(db)
    return result
```

---

### Step 3 — Update `api/schemas/provider.py` — extend `JobFeedItemOut`

Add three new optional fields to `JobFeedItemOut` so the feed can carry group metadata:

```python
class JobFeedItemOut(BaseModel):
    id: int
    title: str
    category: str
    neighborhood: str
    distance_mi: Optional[float] = None
    status: str
    budget_min: int
    budget_max: int
    bid_count: int
    created_at: datetime
    closes_at: Optional[datetime]
    # New group fields
    group_id: Optional[int] = None          # RequestGroup.id
    member_count: Optional[int] = None      # number of homes in the group
    is_group: bool = False                  # True if this entry comes from a bidding group

    model_config = ConfigDict(from_attributes=True)
```

---

### Step 4 — Replace the job feed logic in `api/routers/provider.py`

Add this import at the top (alongside existing imports):
```python
from models.request_group import GroupMember, RequestGroup
```

Replace the body of `job_feed()` entirely. The new logic shows ONLY `bidding` groups:

```python
@router.get("/job-feed", response_model=list[JobFeedItemOut])
def job_feed(
    category: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[JobFeedItemOut]:
    profile = _get_or_create_profile(db, current_user)
    service_radius_mi = profile.service_radius_mi or 4

    # Query bidding groups only — never show grouping/pending_approval groups to providers
    group_query = db.query(RequestGroup).filter(RequestGroup.status == "bidding")
    if category:
        group_query = group_query.filter(RequestGroup.category == category)
    if neighborhood:
        group_query = group_query.filter(RequestGroup.neighborhood == neighborhood)

    groups = group_query.order_by(RequestGroup.created_at.desc()).all()
    result: list[JobFeedItemOut] = []

    for group in groups:
        active_members = [m for m in group.members if m.approval_status != "cancelled"]
        if not active_members:
            continue

        # Compute combined budget range across all member requests
        member_requests = []
        for m in active_members:
            req = db.query(ServiceRequest).filter(ServiceRequest.id == m.request_id).first()
            if req:
                member_requests.append(req)

        if not member_requests:
            continue

        combined_budget_min = sum(r.budget_min for r in member_requests)
        combined_budget_max = sum(r.budget_max for r in member_requests)

        # Representative title: first member's request title + member count
        rep_title = member_requests[0].title
        if len(member_requests) > 1:
            rep_title = f"{rep_title} (+{len(member_requests) - 1} neighbours)"

        # Bid count: how many providers have already bid on any request in this group
        group_req_ids = [r.id for r in member_requests]
        bid_count = (
            db.query(func.count(Bid.id))
            .filter(Bid.request_id.in_(group_req_ids))
            .scalar()
            or 0
        )

        # Distance: use centroid of group's neighbourhood if provider has lat/lng
        distance_mi = None
        if (
            current_user.latitude is not None
            and current_user.longitude is not None
            and group.neighbourhood_id
        ):
            from models.neighbourhood import Neighbourhood
            nbhd = db.query(Neighbourhood).filter(
                Neighbourhood.id == group.neighbourhood_id
            ).first()
            if nbhd:
                distance_mi = round(
                    _distance_mi(
                        current_user.latitude,
                        current_user.longitude,
                        nbhd.centroid_lat,
                        nbhd.centroid_lng,
                    ),
                    1,
                )
                if distance_mi > service_radius_mi:
                    continue

        result.append(
            JobFeedItemOut(
                id=group.id,              # group id used as the feed item id
                title=rep_title,
                category=group.category,
                neighborhood=group.neighborhood,
                distance_mi=distance_mi,
                status=group.status,
                budget_min=combined_budget_min,
                budget_max=combined_budget_max,
                bid_count=bid_count,
                created_at=group.created_at,
                closes_at=None,
                group_id=group.id,
                member_count=len(active_members),
                is_group=True,
            )
        )

    result.sort(
        key=lambda item: (
            item.distance_mi is None,
            item.distance_mi if item.distance_mi is not None else float("inf"),
            -item.bid_count,
            -item.created_at.timestamp(),
        )
    )
    return result
```

---

### Step 5 — Verification

After all edits, check syntax:
```bash
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter/api
source .venv/bin/activate
python3 -m py_compile services/group_cron.py routers/ai.py routers/provider.py schemas/provider.py
```

Then restart the API and run a live end-to-end smoke test:
```python
import requests as http, uuid
BASE = "http://localhost:8000"
tag = uuid.uuid4().hex[:8]

def reg(slug, name, role):
    r = http.post(f"{BASE}/auth/register", json={"email": f"{slug}_{tag}@t.com", "password":"pass123","full_name":name,"role":role})
    return r.json()["access_token"]
def h(tok): return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}

t_hw  = reg("hw", "HomeOwner1", "homeowner")
t_prov = reg("pv", "ProFix Svc", "provider")
nbhd = f"TestZone {tag}"

# Homeowner creates request → group in grouping status
r = http.post(f"{BASE}/requests", json={"title":"Lawn","description":"d","category":"lawn","neighborhood":nbhd,"status":"live","budget_min":5000,"budget_max":10000}, headers=h(t_hw)).json()
gid = r["group_id"]

# Provider cannot see grouping group yet
feed_before = http.get(f"{BASE}/provider/job-feed", headers=h(t_prov)).json()
group_in_feed = any(item.get("group_id") == gid for item in feed_before)
assert not group_in_feed, f"Provider should NOT see grouping group: {feed_before}"

# Homeowner approves → group flips to bidding
http.post(f"{BASE}/homeowner/groups/{gid}/approve", headers=h(t_hw))

# Provider NOW sees the group
feed_after = http.get(f"{BASE}/provider/job-feed", headers=h(t_prov)).json()
group_in_feed = any(item.get("group_id") == gid for item in feed_after)
assert group_in_feed, f"Provider should see bidding group: {feed_after}"

# Check is_group=True, member_count=1
item = next(i for i in feed_after if i.get("group_id") == gid)
assert item["is_group"] == True
assert item["member_count"] == 1

# Trigger cron — creates a fake expired group to test
print("Cron result:", http.post(f"{BASE}/ai/run-group-cron", headers=h(t_hw)).json())

print("All smoke tests passed")
```

Expected output: `All smoke tests passed`

---

## Files to Create / Modify

| File | Action |
|---|---|
| `api/services/group_cron.py` | Create — 72h expiry cron |
| `api/routers/ai.py` | Modify — add `/run-group-cron` endpoint |
| `api/schemas/provider.py` | Modify — add `group_id`, `member_count`, `is_group` to `JobFeedItemOut` |
| `api/routers/provider.py` | Modify — replace `job_feed()` body to show bidding groups only |

## Out of Scope (Sessions 3–4)
- Frontend homeowner group status card + timer
- Frontend provider job feed group cards
- Bids attaching to groups rather than individual requests

## Task Update Log
- 2026-05-08 — Written and approved. Delegating to Codex.
