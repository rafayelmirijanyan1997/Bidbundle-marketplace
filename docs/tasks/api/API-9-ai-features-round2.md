# API-9 — AI Features Round 2

**Status:** Pending
**Approved:** 2026-05-07
**Depends on:** API-7 (ai_memory, /ai/chat), API-8 (recommendation engine), API-6a/6d (homeowner + provider backends)

## Overview

Seven AI features across backend + frontend. Implement in sub-task order — each is independent
unless noted. All use the OpenAI integration already wired in API-7 (`OPENAI_API_KEY` in `.env`).

---

## Sub-task Summary

| ID | Feature | Who benefits | Effort | Status |
|---|---|---|---|---|
| 9a | Smart Request Writer | Homeowner | Low | Completed |
| 9b | Bid Drafter | Provider | Low | Completed |
| 9c | Quote Summariser (PDF/image) | Homeowner | Low | Completed |
| 9d | Smart Scheduling AI | Provider | Medium | Completed |
| 9e | Proactive Group Alerts | Homeowner | Medium | Completed |
| 9f | AI Dispute Mediator | Both | Medium | Completed |
| 9g | Demand Forecasting | HOA Admin | Medium | Completed |

---

## API-9a — Smart Request Writer

**What it does:** User types plain language ("my sink has been dripping for a week under the kitchen") and AI returns a fully structured service request ready to submit.

### New endpoint
```
POST /ai/request-writer
Auth: any logged-in user
Body: { "description": "my sink dripping..." }
Returns: {
  "title": "Kitchen sink leak — pipe inspection",
  "category": "plumbing",
  "description": "...(professional rewrite)...",
  "budget_min": 35000,   ← cents, based on accepted bids in category
  "budget_max": 65000,
  "estimated_group_likelihood": "high",  ← based on similar recent requests
  "group_reason": "3 plumbing requests in Oakwood Heights this week"
}
```

### Backend implementation (`api/routers/ai.py` — add endpoint)
System prompt includes:
- Category taxonomy: plumbing, lawn, gutter, hvac, electrical, cleaning, handyman, roofing, other
- Budget context: pull percentile range of accepted bids in guessed category
- Group likelihood: count live/grouping requests in same neighborhood with same category

### Frontend
- `src/app/app/homeowner/request/page.tsx` — add "Describe in plain text" toggle
- Text area → call `/ai/request-writer` → pre-fill the request form fields
- User can edit all fields before submitting
- New hook: `src/hooks/useRequestWriter.ts`

---

## API-9b — Bid Drafter

**What it does:** Provider clicks "Draft with AI" on any job. AI generates a professional bid proposal — price (from recommendation engine), scope description, timeline, and a one-line why-us statement.

### New endpoint
```
POST /ai/bid-drafter
Auth: provider role
Body: { "request_id": 42 }
Returns: {
  "suggested_amount_cents": 49000,
  "suggested_days": 2,
  "draft_text": "ProFix Plumbing proposes $490 for the 3-home plumbing inspection...",
  "headline": "Licensed · Insured · 2-day turnaround",
  "confidence": "high"
}
```

### Backend
- Fetches request details + bid_count + category history
- Calls `/recommendations/bid-price/{request_id}` logic internally
- Uses provider profile (trades, rating, win_rate) for the "why-us" line
- GPT-4o-mini writes the draft_text

### Frontend
- `src/app/app/provider/job-feed/page.tsx` — "Draft bid →" button on featured card and job rows
- Opens a modal/drawer with the draft pre-filled
- Provider edits amount + text, then submits via `POST /requests/{id}/bids`
- New hook: `src/hooks/useBidDrafter.ts`

---

## API-9c — Quote Summariser

**What it does:** Homeowner uploads an outside provider PDF quote. AI extracts key terms, compares to current NeighBid bids, flags missing warranty clauses, and scores the quote.

### New endpoint
```
POST /ai/quote-summary
Auth: homeowner role
Content-Type: multipart/form-data
Body: file (PDF or image) + request_id (optional)
Returns: {
  "provider_name": "Joe's Plumbing",
  "quoted_amount": 64000,
  "scope_summary": "...",
  "flags": ["No warranty mentioned", "Labour only — parts extra"],
  "vs_neighbid": {
    "neighbid_best_bid": 49000,
    "saving_if_use_neighbid": 15000,
    "neighbid_has_warranty": true
  },
  "score": 62,
  "recommendation": "NeighBid bid is $150 cheaper and includes a 90-day warranty."
}
```

### Backend
- Add `python-multipart` (already in requirements) 
- Use `openai.files.create()` or pass image/text directly to GPT-4o
- For PDFs: extract text with `pypdf` (add to requirements.txt: `pypdf>=4.0`)
- Compare against live bids on `request_id` if provided

### Frontend
- `src/app/app/homeowner/bids/page.tsx` — "Compare outside quote" button in the header
- File upload → spinner → structured comparison card rendered inline
- New hook: `src/hooks/useQuoteSummary.ts`

---

## API-9d — Smart Scheduling AI

**What it does:** Provider clicks "AI Optimize" on the schedule page. AI looks at all accepted bids, infers travel order from neighborhood names, and suggests an optimised daily schedule with estimated times.

### New endpoint
```
POST /ai/smart-schedule
Auth: provider role
Body: { "date": "2026-05-10" }   ← ISO date string
Returns: {
  "date": "2026-05-10",
  "items": [
    {
      "title": "Plumbing inspection — Maple St",
      "suggested_start": "09:00",
      "duration_minutes": 90,
      "address": "123 Maple St",
      "reason": "Closest to base — start here to minimise morning travel"
    },
    ...
  ],
  "total_hours": 5.5,
  "estimated_revenue_cents": 145000,
  "conflicts": []
}
```

### Backend
- Fetches all accepted bids + existing schedule items for the requested date
- Groups by neighborhood, uses simple heuristic ordering (same-neighborhood jobs clustered)
- GPT-4o-mini writes the schedule with reasoning
- Returns schedule items that can be directly POSTed to `/provider/schedule`

### Frontend
- `src/app/app/provider/schedule/page.tsx` — "AI Optimize" button in topbar
- Calls endpoint → shows proposed schedule in a preview pane
- "Accept all" button → bulk POST to `/provider/schedule`
- New hook: `src/hooks/useSmartSchedule.ts`

---

## API-9e — Proactive Group Alerts

**What it does:** Daily cron job finds homeowners who could benefit from joining an existing group (same neighborhood, same service category, existing live/grouping requests) and creates alert notifications. Homeowners see alerts in their dashboard and can join with one click.

### New model: `api/models/notification.py`
```python
class Notification(Base):
    __tablename__ = "notifications"
    id, user_id (FK users), type (str), title, body, action_url, read (bool), created_at
```

### New migration
Creates `notifications` table.

### New endpoint
```
GET  /notifications          → list unread for current user
POST /notifications/{id}/read → mark as read
DELETE /notifications/{id}   → dismiss
```

### Cron logic: `api/services/group_alert_cron.py`
```python
def run_group_alerts(db):
    """
    For every homeowner with a request in status draft/live/grouping:
    - Find OTHER requests (not theirs) in same neighborhood + category
    - If they haven't been alerted about this group in the last 7 days → create Notification
    """
```

### Trigger endpoint (for testing + scheduled runner)
```
POST /ai/run-group-alerts   ← admin or cron only
```

### Frontend
- `src/app/app/homeowner/dashboard/page.tsx` — alert banner or notification bell badge
- New hook: `src/hooks/useNotifications.ts`
- Notification card: "3 neighbours need plumbing this week — join their group and save ~$120" + "Join group →" button

---

## API-9f — AI Dispute Mediator

**What it does:** When a homeowner marks a completed job as disputed, AI reads the full context (original request, bid terms, conversation history, any uploaded photos) and generates a neutral mediation summary with a suggested resolution range.

### New bid status
Add `"disputed"` as a valid bid status value.

### New endpoint
```
POST /ai/dispute/{bid_id}
Auth: homeowner role (must own the request)
Body: { "complaint": "The work was incomplete — 2 pipes still dripping" }
Returns: {
  "summary": "ProFix Plumbing accepted the job on Apr 18...",
  "homeowner_position": "...",
  "provider_position": "...(inferred from conversation)...",
  "resolution_options": [
    { "type": "partial_refund", "amount_cents": 12000, "reason": "..." },
    { "type": "revisit",        "description": "Provider returns to complete..." },
    { "type": "full_refund",    "amount_cents": 49000, "reason": "..." }
  ],
  "recommendation": "partial_refund",
  "confidence": "medium"
}
```

### Backend
- Reads: bid, request, conversation messages between homeowner + provider, any reviews
- Builds dispute context prompt with full history
- GPT-4o generates structured resolution JSON

### Frontend
- `src/app/app/homeowner/bids/page.tsx` — "Dispute job" button on accepted/completed bids
- Dispute form → AI response rendered as structured mediation card
- Options: Accept AI recommendation | Negotiate | Escalate
- New hook: `src/hooks/useDisputeMediator.ts`

---

## API-9g — Demand Forecasting

**What it does:** AI predicts which service categories will see the highest request volume in a neighborhood over the next 30 days, based on seasonality, historical request patterns, and current activity.

### New endpoint
```
GET /ai/demand-forecast?neighborhood=Oakwood+Heights
Auth: any logged-in user (admin sees all neighborhoods)
Returns: {
  "neighborhood": "Oakwood Heights",
  "forecast_period": "next 30 days",
  "predictions": [
    {
      "category": "gutter",
      "predicted_requests": 8,
      "confidence": "high",
      "reasoning": "Spring season + 6 gutter requests in April last year",
      "provider_shortage": true,
      "shortage_note": "Only 1 active gutter provider in 8 mi radius"
    },
    ...
  ],
  "top_opportunity": "gutter — 8 predicted requests, 1 active provider"
}
```

### Backend
- Aggregates: request counts by category for current month vs. 30/60/90 days ago
- Counts active providers per category in the neighborhood
- GPT-4o-mini synthesises into human-readable forecast with confidence levels

### Frontend integration
- `src/app/app/provider/job-feed/page.tsx` — "Forecast" button in right rail replaces static "Bidding tip"
- `src/app/app/admin/dashboard/page.tsx` — Demand forecast widget (top 3 categories)
- New hook: `src/hooks/useDemandForecast.ts`

---

## New files summary

### Backend
```
api/models/notification.py
api/services/group_alert_cron.py
api/alembic/versions/XXXX_notifications.py
api/routers/ai.py               ← extended (new endpoints appended)
api/routers/notifications.py    ← new router
api/requirements.txt            ← add pypdf>=4.0
```

### Frontend hooks (src/hooks/)
```
useRequestWriter.ts
useBidDrafter.ts
useQuoteSummary.ts
useSmartSchedule.ts
useNotifications.ts
useDisputeMediator.ts
useDemandForecast.ts
```

### Frontend pages (modifications)
```
src/app/app/homeowner/request/page.tsx       ← Smart Request Writer toggle
src/app/app/homeowner/bids/page.tsx          ← Quote Summariser + Dispute Mediator
src/app/app/homeowner/dashboard/page.tsx     ← Proactive Alerts banner
src/app/app/provider/job-feed/page.tsx       ← Bid Drafter + Demand Forecast
src/app/app/provider/schedule/page.tsx       ← Smart Scheduling AI button
src/app/app/admin/dashboard/page.tsx         ← Demand Forecasting widget
```

---

## Recommended Build Order

**Session 1 (2–3 hours):**
- 9a Smart Request Writer (backend endpoint + homeowner request page)
- 9b Bid Drafter (backend endpoint + provider job feed button)

**Session 2 (2 hours):**
- 9c Quote Summariser (file upload endpoint + homeowner bids page)
- 9d Smart Scheduling AI (backend + schedule page button)

**Session 3 (3 hours):**
- 9e Proactive Group Alerts (notification model + cron + dashboard banner)

**Session 4 (2 hours):**
- 9f AI Dispute Mediator (bid status update + endpoint + bids page)
- 9g Demand Forecasting (endpoint + job feed + admin dashboard)

---

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Pending | Plan written by Claude — ready to implement in next session |
| 2026-05-07 | 9a Approved | Detailed spec written at docs/tasks/api/API-9a-smart-request-writer.md |
| 2026-05-07 | 9b Approved | Detailed spec written at docs/tasks/api/API-9b-bid-drafter.md |
