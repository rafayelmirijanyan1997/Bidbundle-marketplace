# API-3 — Service Requests & Bids

**Status:** Completed
**Depends on:** API-2 complete

---

## Goal

Implement the core product loop: homeowners create service requests,
providers submit bids, the grouping status updates automatically,
and homeowners can accept a bid. This is the heart of NeighBid.

---

## What Codex Will Implement

### models/request.py

```python
class ServiceRequest(Base):
    __tablename__ = "service_requests"
    id, user_id (FK → users), title, description, category,
    neighborhood, status ("draft"|"grouping"|"live"|"closed"),
    budget_min, budget_max, created_at, closes_at (nullable)
```

### models/bid.py

```python
class Bid(Base):
    __tablename__ = "bids"
    id, request_id (FK → service_requests), provider_id (FK → users),
    amount, estimated_days,
    status ("pending"|"accepted"|"declined"),
    created_at
```

### schemas/request.py + schemas/bid.py

- `ServiceRequestCreate`, `ServiceRequestOut`, `ServiceRequestList`
- `BidCreate`, `BidOut`
- `ServiceRequestOut` includes `bids: list[BidOut]` when fetching single request

### routers/requests.py

```
GET    /requests            → list all (filter by neighborhood, status, category)
POST   /requests            → create (homeowner only)
GET    /requests/{id}       → get single with bids
PUT    /requests/{id}       → update title/description/status (owner only)
DELETE /requests/{id}       → delete if draft (owner only)
```

### routers/bids.py

```
GET  /requests/{id}/bids    → list bids for request
POST /requests/{id}/bids    → submit bid (provider only)
PUT  /bids/{id}/accept      → accept bid, set request status "closed" (homeowner only)
PUT  /bids/{id}/decline     → decline bid (homeowner only)
```

### Grouping logic

When a new ServiceRequest is created with the same `category` AND
`neighborhood` as an existing request in `grouping` or `live` status,
return the existing request ID in the response as `matched_group_id`.
The frontend can then offer to join the group.

---

## Files to Create / Modify

```
api/models/request.py         (new)
api/models/bid.py             (new)
api/schemas/request.py        (new)
api/schemas/bid.py            (new)
api/routers/requests.py       (new)
api/routers/bids.py           (new)
api/main.py                   (updated — include new routers)
api/alembic/versions/002_create_requests_bids.py  (new)
```

---

## Acceptance Criteria

1. `POST /requests` (homeowner token) creates a request, returns 201
2. `POST /requests` with provider token returns 403
3. `POST /requests/{id}/bids` (provider token) returns 201
4. `GET /requests/{id}` includes nested bids array
5. `PUT /bids/{id}/accept` sets bid status to `accepted`, request to `closed`
6. `GET /requests?neighborhood=Oakwood&status=live` filters correctly
7. `alembic upgrade head` creates both tables

---

## Out of Scope

- Real-time bid updates (WebSocket — future)
- Payment processing
- Push notifications

---

## Codex Implementation Prompt

```
Implement API-3 service requests and bids for the NeighBid FastAPI backend.

Build SQLAlchemy models, Pydantic schemas, and routers for service requests
and bids following the API-3 task spec.

Critical requirements:
1. ServiceRequest status transitions: draft → grouping → live → closed
2. Only the request owner can update or delete their own request
3. Only providers can submit bids (require_role("provider"))
4. Only homeowners can accept/decline bids (require_role("homeowner"))
5. Accepting a bid sets that bid to "accepted", all others to "declined",
   and the request to "closed"
6. GET /requests supports query params: neighborhood, status, category
7. GET /requests/{id} eagerly loads the bids relationship
8. Run: alembic revision --autogenerate -m "create_requests_bids"
         alembic upgrade head
```

---

## Task Update Log

- 2026-04-25: Task created. Status: Pending.
- 2026-04-25: Approved and implemented by Codex. All 7 acceptance criteria verified live: create request (201), role guard (403 for provider), submit bid (201), nested bids in GET, accept bid sets status, filter by neighborhood, migration at head. Status: Completed.
