# API-9d — Smart Scheduling AI

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07

---

## Goal

Provider clicks "AI Optimize" on the schedule page for a chosen date. AI looks at all their
accepted bids, infers a logical travel order by clustering same-neighborhood jobs, and returns
an optimised daily schedule with suggested start times. Provider reviews the proposal in a
preview panel and clicks "Accept all" to bulk-add the items to their real schedule.

---

## Why this task comes now

The `ScheduleItem` model and `POST /provider/schedule` endpoint already exist (built in API-6a).
`useProviderSchedule` has `addItem()`. This task adds the AI layer on top — no new models
or migrations needed.

---

## What Codex will implement

### 1. New Pydantic schemas — `api/schemas/ai.py`

Append:

```python
class SmartScheduleItem(BaseModel):
    title: str
    suggested_start: str          # "HH:MM" 24-hour
    duration_minutes: int
    address: Optional[str] = None
    neighborhood: str
    request_id: Optional[int] = None
    reason: str

class SmartScheduleResponse(BaseModel):
    date: str                     # ISO date "YYYY-MM-DD"
    items: list[SmartScheduleItem]
    total_hours: float
    estimated_revenue_cents: int
    conflicts: list[str]          # human-readable conflict descriptions
    stub: bool = False
```

---

### 2. New endpoint — `api/routers/ai.py`

Append at the bottom:

```
POST /ai/smart-schedule
Auth: provider role only (HTTP 403 if current_user.role != "provider")
Body: { "date": "2026-05-10" }   (plain JSON, not multipart)
Returns: SmartScheduleResponse
```

Add a minimal request schema inline (not in schemas/ai.py — it's small):
```python
class _SmartScheduleRequest(BaseModel):
    date: str  # ISO date string e.g. "2026-05-10"
```

**Implementation logic:**

**Step A — Load accepted bids and existing schedule items for the date**

```python
from models.provider_profile import ProviderProfile
from models.schedule_item import ScheduleItem as ScheduleItemModel

# All accepted bids for this provider
accepted_bids = (
    db.query(Bid)
    .filter(Bid.provider_id == current_user.id, Bid.status == "accepted")
    .all()
)

# Existing schedule items on the requested date (to detect conflicts)
try:
    from datetime import date as date_type
    target_date = date_type.fromisoformat(payload.date)
except ValueError:
    raise HTTPException(status_code=422, detail="Invalid date format — use YYYY-MM-DD")

existing_items = (
    db.query(ScheduleItemModel)
    .filter(ScheduleItemModel.provider_id == current_user.id)
    .all()
)
existing_on_date = [
    item for item in existing_items
    if item.scheduled_at and item.scheduled_at.date() == target_date
]
```

**Step B — Build job context for GPT**

For each accepted bid, load the associated ServiceRequest to get title, neighborhood, address:
```python
job_lines = []
total_revenue = 0
for bid in accepted_bids:
    req = db.query(ServiceRequest).filter(ServiceRequest.id == bid.request_id).first()
    if req:
        total_revenue += bid.amount
        job_lines.append(
            f"- Job: {req.title} | Neighborhood: {req.neighborhood} | "
            f"Address: {req.neighborhood} area | "
            f"Duration: 90 min (estimate) | Revenue: ${bid.amount // 100} | "
            f"request_id: {req.id}"
        )
```

If no accepted bids → return stub with empty items list, no GPT call.

```python
if not job_lines:
    return SmartScheduleResponse(
        date=payload.date, items=[], total_hours=0.0,
        estimated_revenue_cents=0, conflicts=[], stub=True,
    )
```

**Step C — Load provider working hours from profile**

```python
profile = db.query(ProviderProfile).filter(
    ProviderProfile.user_id == current_user.id
).first()
start_hour = profile.working_hours_start if profile else "07:00"
end_hour = profile.working_hours_end if profile else "18:00"
```

**Step D — Build system prompt and call GPT-4o-mini**

System prompt:
```
You are a scheduling assistant for a home-services provider on NeighBid.
Optimise their day: cluster jobs in the same neighborhood, minimise travel, fill gaps.
Working hours: {start_hour} – {end_hour}
Date: {payload.date}

Return ONLY a JSON object — no markdown, no explanation.

Shape:
{{
  "items": [
    {{
      "title": "<job title>",
      "suggested_start": "<HH:MM 24h>",
      "duration_minutes": <int>,
      "neighborhood": "<neighborhood name>",
      "request_id": <int or null>,
      "reason": "<1 sentence why this slot>"
    }}
  ],
  "conflicts": ["<conflict description>"]
}}
```

User message:
```
Jobs to schedule on {payload.date}:
{chr(10).join(job_lines)}

Existing schedule items on this date:
{chr(10).join(f"- {i.title} at {i.scheduled_at}" for i in existing_on_date) or "None"}

Please create an optimised schedule. Cluster same-neighborhood jobs together.
```

Call `gpt-4o-mini`, `temperature=0.3`, `max_tokens=800`.

**Step E — Parse and return**

Parse the JSON response. Build `SmartScheduleResponse`:
```python
parsed_items = []
for raw in parsed.get("items", []):
    parsed_items.append(SmartScheduleItem(
        title=raw.get("title", "Job"),
        suggested_start=raw.get("suggested_start", "09:00"),
        duration_minutes=int(raw.get("duration_minutes", 90)),
        neighborhood=raw.get("neighborhood", ""),
        request_id=raw.get("request_id"),
        reason=raw.get("reason", ""),
    ))

total_hours = sum(i.duration_minutes for i in parsed_items) / 60

return SmartScheduleResponse(
    date=payload.date,
    items=parsed_items,
    total_hours=round(total_hours, 1),
    estimated_revenue_cents=total_revenue,
    conflicts=parsed.get("conflicts", []),
    stub=False,
)
```

On any exception (API key missing, parse error): return stub with `items=[]`, `stub=True`.

---

### 3. New hook — `src/hooks/useSmartSchedule.ts`

```typescript
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface SmartScheduleItem {
  title: string;
  suggested_start: string;
  duration_minutes: number;
  address?: string | null;
  neighborhood: string;
  request_id?: number | null;
  reason: string;
}

export interface SmartScheduleResult {
  date: string;
  items: SmartScheduleItem[];
  total_hours: number;
  estimated_revenue_cents: number;
  conflicts: string[];
  stub: boolean;
}

export function useSmartSchedule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function optimiseSchedule(date: string): Promise<SmartScheduleResult | null> {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      return await apiFetch<SmartScheduleResult>("/ai/smart-schedule", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify({ date }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to optimise schedule");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { optimiseSchedule, loading, error };
}
```

---

### 4. Updated page — `src/app/app/provider/schedule/page.tsx`

**Targeted additions only — do not rewrite the file.**

#### 4a — Add imports and state at the top of the component

```typescript
import { useState } from "react";
import { useSmartSchedule } from "@/hooks/useSmartSchedule";
import type { SmartScheduleResult } from "@/hooks/useSmartSchedule";
import { useProviderSchedule } from "@/hooks/useProviderSchedule";
```

(Note: `useProviderSchedule` is already imported — do not duplicate. Add only the new imports.)

Inside `ProviderSchedulePage`:
```typescript
const { addItem } = useProviderSchedule();
const { optimiseSchedule, loading: aiLoading } = useSmartSchedule();
const [aiProposal, setAiProposal] = useState<SmartScheduleResult | null>(null);
const [accepting, setAccepting] = useState(false);
const [acceptDone, setAcceptDone] = useState(false);

// Use today's date as the default target date
const todayISO = new Date().toISOString().slice(0, 10);
```

#### 4b — Add "AI Optimize" button to the topbar

Current last button in the topbar (line ~74):
```tsx
<button style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, ... }}><IconPlus /> Block time</button>
```

Add **before** the "Block time" button:
```tsx
<button
  style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "var(--cream-100)", color: "var(--ink-900)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}
  disabled={aiLoading}
  onClick={async () => {
    setAiProposal(null);
    setAcceptDone(false);
    const result = await optimiseSchedule(todayISO);
    if (result) setAiProposal(result);
  }}
>
  {aiLoading ? "Optimising…" : "✦ AI Optimize"}
</button>
```

#### 4c — Add the AI proposal preview panel

Append the following **below the two-column layout div** and before the closing root `</div>`:

```tsx
{aiProposal && (
  <div style={{ margin: "0 36px 36px", background: "var(--bg-card)", border: "1px solid var(--border-warm)", borderRadius: 18, boxShadow: "var(--shadow-warm-sm)", padding: 28 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.01em" }}>AI schedule proposal</div>
        <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 3 }}>
          {aiProposal.date} · {aiProposal.total_hours}h · est. ${Math.round(aiProposal.estimated_revenue_cents / 100).toLocaleString()} revenue
        </div>
      </div>
      <button
        onClick={() => { setAiProposal(null); setAcceptDone(false); }}
        style={{ background: "var(--cream-100)", border: 0, borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "var(--ink-500)", display: "grid", placeItems: "center" }}
      >×</button>
    </div>

    {aiProposal.items.length === 0 ? (
      <p style={{ fontSize: 14, color: "var(--ink-500)" }}>No accepted bids to schedule. Accept some bids first.</p>
    ) : (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {aiProposal.items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 16, alignItems: "start", padding: "14px 18px", background: "var(--cream-50)", borderRadius: 12, border: "1px solid var(--border-warm)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--terracotta-600)", letterSpacing: "-0.01em" }}>{item.suggested_start}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{item.neighborhood} · {item.duration_minutes} min</div>
                <div style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 4, fontStyle: "italic" }}>{item.reason}</div>
              </div>
            </div>
          ))}
        </div>

        {aiProposal.conflicts.length > 0 && (
          <div style={{ background: "var(--terracotta-50)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            {aiProposal.conflicts.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--terracotta-600)", fontWeight: 600 }}>⚠ {c}</div>
            ))}
          </div>
        )}

        {aiProposal.stub && (
          <p style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 16 }}>AI unavailable — showing estimate based on your accepted bids.</p>
        )}

        {acceptDone ? (
          <div style={{ textAlign: "center", padding: "12px 0", color: "var(--sage-700)", fontWeight: 600, fontSize: 15 }}>
            ✓ {aiProposal.items.length} items added to your schedule!
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: 1, height: 38, borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)" }}
              onClick={() => { setAiProposal(null); setAcceptDone(false); }}
            >
              Dismiss
            </button>
            <button
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: 2, height: 38, borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "var(--terracotta-600)", color: "white", border: 0, fontFamily: "var(--font-body)" }}
              disabled={accepting}
              onClick={async () => {
                setAccepting(true);
                for (const item of aiProposal.items) {
                  // Build a scheduled_at datetime from date + suggested_start
                  const [h, m] = item.suggested_start.split(":").map(Number);
                  const dt = new Date(aiProposal.date);
                  dt.setHours(h, m, 0, 0);
                  await addItem({
                    title: item.title,
                    address: item.address ?? item.neighborhood,
                    request_id: item.request_id ?? undefined,
                    scheduled_at: dt.toISOString(),
                    duration_minutes: item.duration_minutes,
                    status: "scheduled",
                  });
                }
                setAccepting(false);
                setAcceptDone(true);
              }}
            >
              {accepting ? "Adding…" : `Accept all ${aiProposal.items.length} items`}
            </button>
          </div>
        )}
      </>
    )}
  </div>
)}
```

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/schemas/ai.py` | Append `SmartScheduleItem` + `SmartScheduleResponse` |
| `api/routers/ai.py` | Append `POST /ai/smart-schedule` endpoint (with inline `_SmartScheduleRequest`) |
| `src/hooks/useSmartSchedule.ts` | Create |
| `src/app/app/provider/schedule/page.tsx` | Targeted additions only |

No new routers, no migrations, no model changes.

---

## Acceptance criteria

1. `POST /ai/smart-schedule` with a valid provider JWT and a date returns `SmartScheduleResponse`.
2. HTTP 403 when called with a homeowner JWT.
3. Invalid date string → HTTP 422.
4. No accepted bids → stub with `items=[]`, HTTP 200.
5. OPENAI_API_KEY missing or parse failure → stub, HTTP 200, `stub: true`.
6. "✦ AI Optimize" button appears in the schedule page topbar.
7. Clicking it shows a loading state, then the proposal panel below the calendar.
8. Each proposal item shows start time, title, neighborhood, duration, reason.
9. "Accept all N items" calls `addItem` for each and shows success message.
10. "Dismiss" and × both close the panel.
11. `tsc --noEmit` passes with no new errors.

---

## Test steps

1. Start API: `uvicorn main:app --port 8000` from `api/`
2. Obtain a provider JWT.
3. `curl -s -X POST http://localhost:8000/ai/smart-schedule -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"date":"2026-05-10"}'` → expect JSON.
4. With homeowner JWT → HTTP 403.
5. With `{"date":"not-a-date"}` → HTTP 422.
6. Navigate to `/app/provider/schedule`, click "✦ AI Optimize", verify panel appears.
7. Click "Accept all" → verify success message.

---

## Out of scope

- Modifying the calendar visual to reflect newly added items (would require a page reload)
- Any changes to the homeowner schedule or other pages

---

## Codex implementation prompt

```
Implement API-9d — Smart Scheduling AI for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9d-smart-scheduling.md

Files to read for context before coding:
  api/routers/ai.py                       (append new endpoint)
  api/schemas/ai.py                       (append new schemas)
  api/models/bid.py                       (Bid)
  api/models/request.py                   (ServiceRequest)
  api/models/schedule_item.py             (ScheduleItem model — class ScheduleItem, __tablename__ = "schedule_items")
  api/models/provider_profile.py          (ProviderProfile — working hours)
  api/dependencies.py                     (get_current_user, get_db)
  src/hooks/useProviderSchedule.ts        (addItem signature)
  src/app/app/provider/schedule/page.tsx  (targeted additions only — do not rewrite)
  src/lib/api.ts                          (apiFetch)
  src/lib/auth.ts                         (getToken)

Implement exactly what the spec says.
Make targeted additions to schedule/page.tsx — do not rewrite the entire file.
After implementation run: npx tsc --noEmit from the project root and fix any errors.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Codex implemented all 4 files. tsc + py_compile clean. Review passed — role guard, date validation, stub for no bids, per-item Accept buttons, proposal panel below calendar. |
