# API-4 — Community & Admin Endpoints

**Status:** Completed
**Depends on:** API-3 complete

---

## Goal

Add HOA community membership, the admin approve/decline workflow,
and the reports/activity endpoints that power the admin dashboard.

---

## What Codex Will Implement

### models/community.py

```python
class HOA(Base):
    __tablename__ = "hoas"
    id, name, neighborhood, admin_user_id (FK → users), created_at

class CommunityMember(Base):
    __tablename__ = "community_members"
    id, user_id (FK → users), hoa_id (FK → hoas),
    eligibility ("verified"|"pending"|"ineligible"),
    address, join_date (date), created_at
```

### models/activity.py

```python
class ActivityLog(Base):
    __tablename__ = "activity_log"
    id, hoa_id (FK), description, type ("bid"|"join"|"saving"), created_at
```

### schemas/community.py

- `HOAOut`, `CommunityMemberOut`, `CommunityMemberList`
- `ActivityLogOut`

### routers/community.py

```
GET  /community/members          → list all members for current user's HOA
                                   filter by eligibility (query param)
POST /community/join             → homeowner applies to join HOA
PUT  /community/members/{id}/approve  → admin only, sets eligibility to "verified"
PUT  /community/members/{id}/decline  → admin only, sets eligibility to "ineligible"
```

### routers/admin.py

```
GET  /admin/reports/savings      → savings aggregated by category
                                   returns { categories: [{name, saved, bids}], total }
GET  /admin/activity             → recent activity log for HOA (last 20 entries)
GET  /admin/stats                → totalMembers, activeBids, monthlySavings, totalSavingsAllTime
```

All admin routes protected by `require_role("admin")`.

---

## Files to Create / Modify

```
api/models/community.py           (new)
api/models/activity.py            (new)
api/schemas/community.py          (new)
api/routers/community.py          (new)
api/routers/admin.py              (new)
api/main.py                       (updated)
api/alembic/versions/003_create_community_activity.py  (new)
```

---

## Acceptance Criteria

1. `GET /community/members` returns member list (admin token)
2. `PUT /community/members/{id}/approve` flips eligibility to verified
3. `GET /admin/reports/savings` returns categories array with saved + bids
4. `GET /admin/stats` returns correct aggregated numbers
5. Non-admin calling `/admin/*` routes gets 403
6. `alembic upgrade head` creates all new tables

---

## Out of Scope

- HOA creation flow (manually seeded for now)
- Member invitation emails
- Multi-HOA support per user

---

## Codex Implementation Prompt

```
Implement API-4 community and admin endpoints for the NeighBid FastAPI backend.

Build HOA, CommunityMember, and ActivityLog models plus the community
and admin routers following the API-4 task spec.

Critical requirements:
1. All /admin/* routes require require_role("admin")
2. approve/decline only updates that member's eligibility — does not affect others
3. /admin/reports/savings aggregates closed bids by category: sum(bid.amount) per category
4. /admin/activity returns the 20 most recent activity_log rows for the HOA, newest first
5. Run: alembic revision --autogenerate -m "create_community_activity"
         alembic upgrade head
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Approved and implemented by Codex. All 6 acceptance criteria verified live: community join/approve/decline, admin stats, savings report aggregates accepted bids by category, non-admin 403 guard confirmed. Migration dd31d562982c at head. Status: Completed.
