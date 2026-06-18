# API-9g — Demand Forecasting

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07

---

## Goal

AI predicts which service categories will see the highest request volume in a neighborhood
over the next 30 days, based on historical request patterns and current activity. Visible to
providers (job-feed right rail) and HOA admins (dashboard widget).

---

## Why this task comes now

All data needed (ServiceRequest history, ProviderProfile.trades + neighborhood, User counts)
is already in the DB. No new models or migrations required. Final task of API-9.

---

## What Codex will implement

### 1. New Pydantic schemas — `api/schemas/ai.py`

Append:

```python
class DemandPrediction(BaseModel):
    category: str
    predicted_requests: int
    confidence: str          # "high" | "medium" | "low"
    reasoning: str
    provider_shortage: bool
    shortage_note: str

class DemandForecastResponse(BaseModel):
    neighborhood: str
    forecast_period: str     # "next 30 days"
    predictions: list[DemandPrediction]
    top_opportunity: str
    stub: bool = False
```

---

### 2. New endpoint — `api/routers/ai.py`

Append at the bottom:

```
GET /ai/demand-forecast
Auth: any logged-in user
Query params: neighborhood (str, default "Oakwood Heights")
Returns: DemandForecastResponse
```

**Implementation logic:**

**Step A — Aggregate historical request counts by category**

```python
from datetime import datetime, timedelta, timezone
from sqlalchemy import func

now = datetime.now(timezone.utc)
window_30 = now - timedelta(days=30)
window_60 = now - timedelta(days=60)
window_90 = now - timedelta(days=90)

# Requests in this neighborhood over various windows
def count_requests(since: datetime) -> dict[str, int]:
    rows = (
        db.query(ServiceRequest.category, func.count(ServiceRequest.id))
        .filter(
            ServiceRequest.neighborhood == neighborhood,
            ServiceRequest.created_at >= since,
        )
        .group_by(ServiceRequest.category)
        .all()
    )
    return {cat: cnt for cat, cnt in rows}

recent_30 = count_requests(window_30)
prev_30   = count_requests(window_60)   # 30–60 days ago (subtract later)
prev_60   = count_requests(window_90)

# Subtract to get prev window only
for cat in list(prev_30.keys()):
    prev_30[cat] = prev_30.get(cat, 0) - prev_60.get(cat, 0)
```

**Step B — Count active providers per category in the neighborhood**

```python
all_profiles = db.query(ProviderProfile).all()
provider_counts: dict[str, int] = {}
for profile in all_profiles:
    trades_raw = (profile.trades or "").lower()
    trades = [t.strip() for t in trades_raw.split(",") if t.strip()]
    neighborhood_match = (
        not profile.neighborhood or
        profile.neighborhood.lower() == neighborhood.lower()
    )
    if not neighborhood_match:
        continue
    for trade in trades:
        provider_counts[trade] = provider_counts.get(trade, 0) + 1
```

**Step C — Build GPT context and call**

System prompt:
```
You are a demand forecasting assistant for NeighBid, a community home-services platform.
Predict the top 4 service categories for the next 30 days in the given neighborhood.
Return ONLY a JSON object — no markdown, no explanation.

Category taxonomy: plumbing, lawn, gutter, hvac, electrical, cleaning, handyman, roofing, other

Shape:
{
  "predictions": [
    {
      "category": "<category>",
      "predicted_requests": <int 1-20>,
      "confidence": "<high|medium|low>",
      "reasoning": "<1 sentence>",
      "provider_shortage": <bool>,
      "shortage_note": "<1 sentence or empty string>"
    }
  ],
  "top_opportunity": "<1 sentence summary of the single best opportunity>"
}
```

User message:
```python
lines = []
all_cats = set(list(recent_30.keys()) + list(prev_30.keys()))
for cat in sorted(all_cats):
    r30 = recent_30.get(cat, 0)
    r_prev = prev_30.get(cat, 0)
    pcount = provider_counts.get(cat, 0)
    trend = "↑" if r30 > r_prev else ("↓" if r30 < r_prev else "→")
    lines.append(f"- {cat}: {r30} requests last 30 days (prev 30: {r_prev}) {trend} | {pcount} active provider(s)")

user_message = (
    f"Neighborhood: {neighborhood}\n"
    f"Today: {now.date().isoformat()}\n\n"
    f"Historical data:\n" + "\n".join(lines) +
    "\n\nPredict demand for the next 30 days. Flag categories with < 2 active providers as shortage."
)
```

Call `_call_openai(system_prompt, [{"role": "user", "content": user_message}], temperature=0.4, max_tokens=600)`.

**Stub on failure:**
```python
DemandForecastResponse(
    neighborhood=neighborhood,
    forecast_period="next 30 days",
    predictions=[
        DemandPrediction(category="plumbing", predicted_requests=6, confidence="low",
                         reasoning="Historical data unavailable.", provider_shortage=False, shortage_note=""),
        DemandPrediction(category="lawn", predicted_requests=4, confidence="low",
                         reasoning="Seasonal estimate only.", provider_shortage=False, shortage_note=""),
    ],
    top_opportunity="AI forecasting unavailable — showing estimates.",
    stub=True,
)
```

---

### 3. New hook — `src/hooks/useDemandForecast.ts`

```typescript
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface DemandPrediction {
  category: string;
  predicted_requests: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  provider_shortage: boolean;
  shortage_note: string;
}

export interface DemandForecastResult {
  neighborhood: string;
  forecast_period: string;
  predictions: DemandPrediction[];
  top_opportunity: string;
  stub: boolean;
}

export function useDemandForecast() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getForecast(neighborhood = "Oakwood Heights"): Promise<DemandForecastResult | null> {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const params = new URLSearchParams({ neighborhood });
      return await apiFetch<DemandForecastResult>(`/ai/demand-forecast?${params}`, {
        token: token ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forecast");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { getForecast, loading, error };
}
```

---

### 4. Updated page — `src/app/app/provider/job-feed/page.tsx`

**Targeted additions only.**

#### 4a — Add state and hook at the top of the component

```typescript
import { useDemandForecast } from "@/hooks/useDemandForecast";
import type { DemandForecastResult } from "@/hooks/useDemandForecast";
```

Inside `ProviderJobFeedPage` (add alongside existing state):
```typescript
const { getForecast, loading: forecastLoading } = useDemandForecast();
const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
```

#### 4b — Replace the static "Bidding tip" card in the right rail

Current (last card in right rail):
```tsx
{/* Bidding tip */}
<div style={{ ...card, padding: 22, background: "var(--cream-100)" }}>
  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "var(--ink-900)" }}>Bidding tip</div>
  <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-700)", lineHeight: 1.5 }}>
    Crews who quote within <strong>2 hours</strong> of a group RFP win <strong>3.4×</strong> more often.
  </p>
</div>
```

Replace with:
```tsx
<div style={{ ...card, padding: 22, background: "var(--cream-100)" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "var(--ink-900)" }}>
      {forecast ? "Demand forecast" : "Bidding tip"}
    </div>
    {!forecast && (
      <button
        style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "var(--terracotta-50)", color: "var(--terracotta-600)", border: 0 }}
        disabled={forecastLoading}
        onClick={async () => {
          const result = await getForecast();
          if (result) setForecast(result);
        }}
      >
        {forecastLoading ? "Loading…" : "✦ Forecast"}
      </button>
    )}
    {forecast && (
      <button
        style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 13, color: "var(--ink-400)", padding: 0 }}
        onClick={() => setForecast(null)}
      >
        ×
      </button>
    )}
  </div>

  {!forecast ? (
    <p style={{ margin: 0, fontSize: 13, color: "var(--ink-700)", lineHeight: 1.5 }}>
      Crews who quote within <strong>2 hours</strong> of a group RFP win <strong>3.4×</strong> more often.
    </p>
  ) : (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-500)" }}>
        {forecast.neighborhood} · {forecast.forecast_period}
        {forecast.stub ? " · estimate only" : ""}
      </p>
      {forecast.predictions.slice(0, 4).map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: i > 0 ? "1px solid var(--border-warm)" : "none" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", textTransform: "capitalize" as const }}>{p.category}</span>
            {p.provider_shortage && (
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: "var(--terracotta-600)", background: "var(--terracotta-50)", borderRadius: 999, padding: "1px 6px" }}>short</span>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>{p.predicted_requests}</span>
            <span style={{ fontSize: 11, color: "var(--ink-400)", marginLeft: 3 }}>req</span>
          </div>
        </div>
      ))}
      <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--ink-700)", lineHeight: 1.5, fontStyle: "italic" }}>
        {forecast.top_opportunity}
      </p>
    </div>
  )}
</div>
```

---

### 5. Updated page — `src/app/app/admin/dashboard/page.tsx`

**Targeted additions only. The admin page uses Tailwind CSS classes, not inline styles.**

#### 5a — Convert to client component and add hook

The admin dashboard is currently a server component (no "use client" directive). It needs to become a client component to use hooks.

Add at the very top of the file:
```typescript
"use client";
```

Add imports:
```typescript
import { useState } from "react";
import { useDemandForecast } from "@/hooks/useDemandForecast";
import type { DemandForecastResult } from "@/hooks/useDemandForecast";
```

Inside `AdminDashboardPage`:
```typescript
const { getForecast, loading: forecastLoading } = useDemandForecast();
const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
```

#### 5b — Add forecast widget

Insert the following **before the closing `</div>` of the right-side column** (after the "Savings snapshot" div and before the closing `</div>` of the column):

```tsx
<div className="rounded-2xl border border-divider bg-white p-4 shadow-card">
  <div className="mb-3 flex items-center justify-between">
    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">Demand forecast</p>
    {!forecast ? (
      <button
        className="inline-flex h-6 items-center gap-1 rounded-full bg-[var(--terracotta-50)] px-2.5 text-[11px] font-semibold text-[var(--terracotta-600)] transition hover:bg-[var(--terracotta-100)]"
        disabled={forecastLoading}
        onClick={async () => {
          const result = await getForecast();
          if (result) setForecast(result);
        }}
      >
        {forecastLoading ? "Loading…" : "✦ Run forecast"}
      </button>
    ) : (
      <button className="text-[12px] text-muted transition hover:text-foreground" onClick={() => setForecast(null)}>
        Reset
      </button>
    )}
  </div>

  {!forecast ? (
    <p className="text-[12px] text-muted">
      See which services your neighbors will need most in the next 30 days.
    </p>
  ) : (
    <div className="space-y-2">
      {forecast.predictions.slice(0, 3).map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold capitalize text-foreground">{p.category}</span>
            {p.provider_shortage && (
              <span className="rounded-full bg-[var(--terracotta-50)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--terracotta-600)]">shortage</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-[13px] font-bold text-foreground">{p.predicted_requests}</span>
            <span className="ml-1 text-[11px] text-muted">req</span>
          </div>
        </div>
      ))}
      {forecast.stub && <p className="text-[11px] text-muted">Estimate only — AI unavailable.</p>}
    </div>
  )}
</div>
```

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/schemas/ai.py` | Append `DemandPrediction` + `DemandForecastResponse` |
| `api/routers/ai.py` | Append `GET /ai/demand-forecast` endpoint |
| `src/hooks/useDemandForecast.ts` | Create |
| `src/app/app/provider/job-feed/page.tsx` | Targeted additions — replace Bidding tip card |
| `src/app/app/admin/dashboard/page.tsx` | Add "use client", hook, forecast widget |

No migrations, no new models.

---

## Acceptance criteria

1. `GET /ai/demand-forecast?neighborhood=Oakwood+Heights` returns `DemandForecastResponse`.
2. No auth → HTTP 401.
3. OpenAI missing/parse failure → stub response, HTTP 200, `stub: true`.
4. "✦ Forecast" button appears in job-feed right rail "Bidding tip" card.
5. Clicking it replaces tip with the forecast (top 4 categories, shortage badges, top_opportunity).
6. × resets back to the static tip.
7. "✦ Run forecast" button appears in admin dashboard right column.
8. Clicking it shows top 3 categories with shortage badges.
9. `tsc --noEmit` passes.

---

## Test steps

1. Start API: `uvicorn main:app --port 8000`
2. `curl "http://localhost:8000/ai/demand-forecast?neighborhood=Oakwood+Heights" -H "Authorization: Bearer <token>"` → expect JSON.
3. Navigate to `/app/provider/job-feed`, click "✦ Forecast" in the right rail.
4. Navigate to `/app/admin/dashboard`, click "✦ Run forecast".

---

## Out of scope

- Saving forecast results to the database
- Scheduled automatic forecasts
- Mobile app integration

---

## Codex implementation prompt

```
Implement API-9g — Demand Forecasting for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9g-demand-forecasting.md

Files to read for context before coding:
  api/routers/ai.py
  api/schemas/ai.py
  api/models/request.py            (ServiceRequest — category, neighborhood, created_at)
  api/models/provider_profile.py   (ProviderProfile — trades, neighborhood)
  api/dependencies.py
  src/app/app/provider/job-feed/page.tsx   (targeted additions — replace Bidding tip card)
  src/app/app/admin/dashboard/page.tsx     (add "use client", hook, forecast widget)
  src/lib/api.ts
  src/lib/auth.ts

Implement exactly what the spec says. Five files total.
After implementation run: npx tsc --noEmit from the project root and fix any errors.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Codex implemented all 5 files. tsc clean. Forecast returns real GPT predictions with shortage flags. Provider job-feed right rail replaces Bidding tip. Admin dashboard widget with Run/Reset. |
