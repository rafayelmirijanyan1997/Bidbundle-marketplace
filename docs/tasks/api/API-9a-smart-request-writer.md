# API-9a — Smart Request Writer

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07

---

## Goal

Let a homeowner describe a home-services problem in plain English and have AI turn it into a
structured, ready-to-submit service request — complete with a professional title, category,
rewritten description, budget range, and a signal about group likelihood.

---

## Why this task comes now

API-7 (AI chat) and API-8 (recommendation engine) are both live. The request writer can query
the recommendation engine's bid history for budget context and query live requests for group
likelihood — no new infrastructure needed.

---

## What Codex will implement

### 1. New Pydantic schemas — `api/schemas/ai.py`

Append two new models:

```python
class RequestWriterRequest(BaseModel):
    description: str  # plain-language user input

class RequestWriterResponse(BaseModel):
    title: str
    category: str        # one of: plumbing, lawn, gutter, hvac, electrical, cleaning, handyman, roofing, other
    description: str     # professional rewrite
    budget_min: int      # cents
    budget_max: int      # cents
    estimated_group_likelihood: str   # "high" | "medium" | "low"
    group_reason: str    # human-readable explanation
    stub: bool = False
```

---

### 2. New endpoint — `api/routers/ai.py`

Append a new route at the bottom of the file (do not modify existing routes):

```
POST /ai/request-writer
Auth: any logged-in user
Body: RequestWriterRequest
Returns: RequestWriterResponse
```

**Implementation logic:**

**Step A — Guess the category from the raw description**
Use a simple keyword heuristic (same approach as the existing frontend `detectCategory`):
- plumbing: leak|pipe|drain|faucet|sink|toilet|water heater
- lawn: lawn|grass|mow|garden|landscap|trim|hedge|sprinkler
- gutter: gutter|downspout|fascia
- hvac: hvac|heat|furnace|ac|air condition|duct|thermostat
- electrical: electric|wiring|outlet|breaker|panel|light fixture
- cleaning: clean|sweep|dust|vacuum|pressure wash|window clean
- handyman: handyman|paint|drywall|door|fence|deck|tile
- roofing: roof|shingle|flashing|leak.*roof
- default: other

**Step B — Pull budget context from accepted bids in that category**
```python
accepted_bids = (
    db.query(Bid.amount)
    .join(ServiceRequest, Bid.request_id == ServiceRequest.id)
    .filter(
        ServiceRequest.category == guessed_category,
        Bid.status == "accepted",
    )
    .all()
)
```
If there are ≥ 3 accepted bids: use 25th–75th percentile as the budget range.
If fewer than 3: use category defaults (cents):
```python
CATEGORY_BUDGET_DEFAULTS = {
    "plumbing":    (25000, 75000),
    "lawn":        (8000,  25000),
    "gutter":      (15000, 45000),
    "hvac":        (50000, 150000),
    "electrical":  (30000, 90000),
    "cleaning":    (8000,  20000),
    "handyman":    (10000, 40000),
    "roofing":     (40000, 200000),
    "other":       (10000, 50000),
}
```

**Step C — Count grouping requests in same neighborhood + category**
```python
user_neighborhood = current_user.neighborhood or "Oakwood Heights"
group_count = (
    db.query(func.count(ServiceRequest.id))
    .filter(
        ServiceRequest.category == guessed_category,
        ServiceRequest.neighborhood == user_neighborhood,
        ServiceRequest.status.in_(["live", "grouping"]),
    )
    .scalar()
)
```
group_likelihood logic:
- ≥ 3 → "high", reason = f"{group_count} similar {guessed_category} requests active in {user_neighborhood} this week"
- 1–2 → "medium", reason = f"{group_count} neighbor also requested {guessed_category} recently"
- 0   → "low",  reason = "No active group for this service — your request will start one"

**Step D — Call GPT-4o-mini to write title + description**

Build this system prompt (single string):
```
You are a professional home-services request writer for NeighBid.
Your job: take a homeowner's plain-language problem description and return ONLY a JSON object — no markdown, no explanation, just raw JSON.

Category taxonomy (use exactly): plumbing, lawn, gutter, hvac, electrical, cleaning, handyman, roofing, other
Detected category: {guessed_category}

Return this exact shape:
{
  "title": "<concise, professional title, max 10 words>",
  "category": "<category from taxonomy>",
  "description": "<professional rewrite of the problem, 2-3 sentences, include what needs to be done>"
}
```

User message: the raw `description` from the request body.

Call `gpt-4o-mini` with `temperature=0.4`, `max_tokens=300`.
Parse the JSON response. If JSON parsing fails, fall back to stub values (title = first 60 chars of description, category = guessed_category, description = original text).

**Step E — Return RequestWriterResponse**
Combine the GPT title/category/description with budget_min, budget_max, group_likelihood, group_reason from steps B and C.
Set `stub=True` if OPENAI_API_KEY is missing or if JSON parsing failed.
Do NOT save this to AIMemory — this is a one-shot structured call, not a conversation.

**Error handling:**
- If `OPENAI_API_KEY` is missing: return a stub response (filled with reasonable defaults, stub=True) — do NOT raise HTTP 500.
- Wrap the OpenAI call in try/except; on failure, return stub.

---

### 3. New hook — `src/hooks/useRequestWriter.ts`

```typescript
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface RequestWriterResult {
  title: string;
  category: string;
  description: string;
  budget_min: number;
  budget_max: number;
  estimated_group_likelihood: "high" | "medium" | "low";
  group_reason: string;
  stub: boolean;
}

export function useRequestWriter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function writeRequest(description: string): Promise<RequestWriterResult | null> {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const result = await apiFetch<RequestWriterResult>("/ai/request-writer", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify({ description }),
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate request");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { writeRequest, loading, error };
}
```

---

### 4. Updated page — `src/app/app/homeowner/request/page.tsx`

Replace the entire file. The new version has **two modes**:

**Mode A — "Write with AI" (new default for empty form)**
- A plain-text textarea: "Describe your problem in plain English…"
- A "Write with AI →" button (terracotta, pill, full width)
- While loading: show three animated dots + "AI is structuring your request…"
- On success: transition to Mode B with all fields pre-filled

**Mode B — Structured form (editable pre-filled or manual entry)**
- Title input (text)
- Category select (the 9 taxonomy values, human-readable labels)
- Description textarea (pre-filled, editable)
- Budget range: two number inputs labelled "Min ($)" and "Max ($)" — values in dollars (divide cents by 100 for display, multiply by 100 on submit)
- Group likelihood badge (coloured pill: green=high, amber=medium, grey=low) + reason text
- A small "Edit plain text ↺" link to return to Mode A
- "Post request →" button (calls the existing mock submit for now — actual request submission wiring is out of scope for this task)

**Toggle:** A small "Or fill manually →" text link below the AI textarea in Mode A allows jumping straight to Mode B with empty fields.

**Design rules (must follow):**
- Canvas: `#FBF7F1`, Cards: `borderRadius: 18`, `border: "1px solid var(--border-warm)"`, `boxShadow: "var(--shadow-warm-sm)"`
- Buttons: pill (`borderRadius: 999`), terracotta fill `var(--terracotta-600)` for primary
- Body font: Plus Jakarta Sans via `var(--font-body)`
- All colors via CSS vars — no hardcoded hex
- Keep the existing back button and "posted" success screen unchanged

**Keep from the current file:**
- The `step === "posted"` success screen (lines 167–224) — do not change it
- The back button and `<header>` markup
- The `@keyframes nbPulse` animation CSS

**Remove from the current file:**
- The client-side `detectCategory` and `findMatchingGroup` functions (AI does this now)
- The `mockServiceRequests` import

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/schemas/ai.py` | Append `RequestWriterRequest` + `RequestWriterResponse` |
| `api/routers/ai.py` | Append `POST /ai/request-writer` endpoint |
| `src/hooks/useRequestWriter.ts` | Create |
| `src/app/app/homeowner/request/page.tsx` | Replace with two-mode UI |

No new files in `api/models/`, no migrations, no new routers — the endpoint lives in the existing `ai` router.

---

## Acceptance criteria

1. `POST /ai/request-writer` returns a valid `RequestWriterResponse` JSON when called with a valid JWT and a plain-text description.
2. If `OPENAI_API_KEY` is missing or OpenAI fails, the endpoint returns a stub response (HTTP 200, `stub: true`) — never HTTP 500.
3. The homeowner request page shows Mode A on first load.
4. Clicking "Write with AI →" calls the endpoint, shows a loading state, then transitions to Mode B with all fields pre-filled.
5. All fields in Mode B are editable.
6. "Or fill manually →" link jumps directly to Mode B with empty fields.
7. "Edit plain text ↺" returns to Mode A.
8. The group likelihood badge is visible and coloured correctly (green/amber/grey).
9. The "Post request →" button in Mode B is not broken (it can remain as the existing mock submit).
10. `tsc --noEmit` passes with no new errors.

---

## Test steps

1. Start the API: `uvicorn main:app --port 8000` from `api/`
2. `curl -X POST http://localhost:8000/ai/request-writer -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"description": "my kitchen sink has been dripping for a week"}'`
   → Expect JSON with title, category=plumbing, description, budget range, group_likelihood, group_reason.
3. Navigate to `/app/homeowner/request` in the browser.
4. Type a description, click "Write with AI →", verify loading state then pre-filled form.
5. Edit a field, click "Post request →", verify the success screen still appears.
6. Click "Or fill manually →", verify empty Mode B form opens.

---

## Out of scope

- Actually wiring "Post request →" to the real `POST /requests` endpoint (that is a separate task)
- Any changes to the group chat, bids, or dashboard pages
- Mobile app changes
- Saving the AI result to `ai_memory`

---

## Codex implementation prompt

```
Implement API-9a — Smart Request Writer for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9a-smart-request-writer.md

Files to read for context before coding:
  api/routers/ai.py            (existing AI router — append to it)
  api/schemas/ai.py            (existing schemas — append to it)
  api/models/request.py        (ServiceRequest model)
  api/models/bid.py            (Bid model — for budget context query)
  api/dependencies.py          (get_current_user, get_db)
  src/lib/api.ts               (apiFetch helper)
  src/lib/auth.ts              (getToken helper)
  src/app/app/homeowner/request/page.tsx  (current page — replace it)

Implement exactly what is specified in the task file. Do not add extra features,
extra endpoints, or extra UI elements beyond what is described.

After implementation, run: npx tsc --noEmit from the project root.
Fix any TypeScript errors before finishing.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Codex implemented all 4 files. tsc clean. Review passed — re/json imports correct, stub fallback works, two-mode UI complete, success screen preserved. |
