# API-9b — Bid Drafter

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07
**Depends on:** API-9a (must be in the same session — shares the `_call_openai` helper already in `api/routers/ai.py`)

---

## Goal

Let a provider click "Draft bid →" on any job in the feed and receive a ready-to-submit AI-drafted
bid — professional proposal text, a price pulled from the recommendation engine, an estimated
timeline, and a one-line "why us" credential statement. Provider edits if needed, then submits.

---

## Why this task comes now

The recommendation engine (`api/services/recommender.py`) already implements `suggest_bid_price`.
`ProviderProfile` has `company_name`, `trades`, `is_licensed`, `is_insured`.
`_provider_stats` in the recommender gives `avg_rating` and `win_rate`.
This task wires those three pieces together with a GPT call — no new infrastructure needed.

---

## What Codex will implement

### 1. New Pydantic schemas — `api/schemas/ai.py`

Append two new models (after the `RequestWriterResponse` added in 9a):

```python
class BidDrafterRequest(BaseModel):
    request_id: int

class BidDrafterResponse(BaseModel):
    suggested_amount_cents: int
    suggested_days: int
    draft_text: str
    headline: str        # one-line credential statement, e.g. "Licensed · Insured · 2-day turnaround"
    confidence: str      # "high" | "medium" | "low"
    stub: bool = False
```

---

### 2. New endpoint — `api/routers/ai.py`

Append a new route at the bottom (do not modify existing routes):

```
POST /ai/bid-drafter
Auth: provider role only (raise HTTP 403 if current_user.role != "provider")
Body: BidDrafterRequest
Returns: BidDrafterResponse
```

**Implementation logic:**

**Step A — Load the service request**
```python
req = db.query(ServiceRequest).filter(ServiceRequest.id == payload.request_id).first()
if not req:
    raise HTTPException(status_code=404, detail="Request not found")
```

**Step B — Get price suggestion from the recommendation engine**
```python
from services.recommender import suggest_bid_price, _provider_stats
price_data = suggest_bid_price(db, payload.request_id)
suggested_low = price_data.get("suggested_low_cents", req.budget_min)
suggested_high = price_data.get("suggested_high_cents", req.budget_max)
# Use the midpoint as the single suggested amount
suggested_amount = (suggested_low + suggested_high) // 2
confidence = price_data.get("confidence", "low")
```

**Step C — Load provider profile and stats**
```python
from models.provider_profile import ProviderProfile
profile = db.query(ProviderProfile).filter(
    ProviderProfile.user_id == current_user.id
).first()
stats = _provider_stats(db, current_user.id)
```

**Step D — Build the credential headline**
Construct `headline` as a string by joining non-None credential parts:
```python
parts = []
if profile and profile.is_licensed:
    parts.append("Licensed")
if profile and profile.is_insured:
    parts.append("Insured")
if stats.get("avg_rating"):
    parts.append(f"{stats['avg_rating']}★ avg rating")
# suggested_days will come from GPT; default to 2 for the headline
parts.append("2-day turnaround")
headline = " · ".join(parts) if parts else "Professional · Reliable"
```

**Step E — Call GPT-4o-mini to write draft_text**

System prompt (single string):
```
You are a professional bid writer for NeighBid, a group home-services bidding platform.
Write a short, professional bid proposal for a service provider.
Return ONLY a JSON object — no markdown, no explanation.

Shape:
{
  "draft_text": "<2-3 sentence proposal. Mention the job scope, the price, and the estimated days.>",
  "suggested_days": <integer, 1-14>
}
```

User message:
```
Job title: {req.title}
Category: {req.category}
Neighborhood: {req.neighborhood}
Job description: {req.description}
Number of homes in group: {bid_count}
Provider company: {profile.company_name or current_user.full_name}
Provider trades: {profile.trades if profile else 'general'}
Suggested price: ${suggested_amount // 100}
Provider rating: {stats.get('avg_rating') or 'new provider'}
Provider win rate: {stats.get('win_rate') or 'new provider'}
```

Where `bid_count = db.query(Bid).filter(Bid.request_id == payload.request_id).count()`.

Call `gpt-4o-mini` with `temperature=0.5`, `max_tokens=256`.
Parse the JSON response.
If parsing fails: `draft_text = f"We propose ${suggested_amount // 100} for {req.title}. Our team will complete the work within 2 days."`, `suggested_days = 2`.

**Step F — Return BidDrafterResponse**
```python
return BidDrafterResponse(
    suggested_amount_cents=suggested_amount,
    suggested_days=parsed.get("suggested_days", 2),
    draft_text=parsed.get("draft_text", fallback_text),
    headline=headline,
    confidence=confidence,
    stub=False,
)
```

**Error handling:**
- Missing OPENAI_API_KEY or OpenAI failure: return stub with sensible defaults (stub=True), never HTTP 500.
- Non-provider role: HTTP 403.
- Request not found: HTTP 404.
- Do NOT save to AIMemory.

---

### 3. New hook — `src/hooks/useBidDrafter.ts`

```typescript
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface BidDraft {
  suggested_amount_cents: number;
  suggested_days: number;
  draft_text: string;
  headline: string;
  confidence: "high" | "medium" | "low";
  stub: boolean;
}

export function useBidDrafter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function draftBid(requestId: number): Promise<BidDraft | null> {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      return await apiFetch<BidDraft>("/ai/bid-drafter", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify({ request_id: requestId }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to draft bid");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { draftBid, loading, error };
}
```

---

### 4. Updated page — `src/app/app/provider/job-feed/page.tsx`

**Do not rewrite the whole page.** Make targeted additions only:

#### 4a — Add state and hook imports at the top of the component

```typescript
import { useBidDrafter } from "@/hooks/useBidDrafter";
import type { BidDraft } from "@/hooks/useBidDrafter";
```

Inside `ProviderJobFeedPage`:
```typescript
const { draftBid, loading: draftLoading } = useBidDrafter();
const [activeDraft, setActiveDraft] = useState<{
  requestId: number;
  title: string;
  draft: BidDraft;
} | null>(null);
const [draftAmount, setDraftAmount] = useState("");
const [draftDays, setDraftDays] = useState("");
const [draftText, setDraftText] = useState("");
const [submitSuccess, setSubmitSuccess] = useState(false);
```

#### 4b — Add a `handleDraftBid` function

```typescript
async function handleDraftBid(requestId: number, title: string) {
  const result = await draftBid(requestId);
  if (!result) return;
  setActiveDraft({ requestId, title, draft: result });
  setDraftAmount(String(Math.round(result.suggested_amount_cents / 100)));
  setDraftDays(String(result.suggested_days));
  setDraftText(result.draft_text);
  setSubmitSuccess(false);
}
```

#### 4c — Replace the "Submit bid" button on the featured card

Current (line 131):
```tsx
<button style={btnPrimary}>Submit bid <IconArrowR /></button>
```

Replace with:
```tsx
<button
  style={btnPrimary}
  disabled={draftLoading}
  onClick={() => handleDraftBid(0, "Whole-block plumbing inspection")}
>
  {draftLoading ? "Drafting…" : <>Draft bid <IconArrowR /></>}
</button>
```
(request_id=0 is a stand-in for the featured mock card — will be wired to real data when the featured card is fully real)

#### 4d — Replace the "Bid" button on each job row

Current (line 173):
```tsx
<button style={btnSmPrimary}>Bid</button>
```

Replace with:
```tsx
<button
  style={btnSmPrimary}
  disabled={draftLoading}
  onClick={() => handleDraftBid(
    apiJobs.length > 0 ? (apiJobs[i]?.id ?? 0) : 0,
    j.title
  )}
>
  Draft bid
</button>
```

Note: The loop variable is `i` and `j` already in the existing map. Keep those.

#### 4e — Add the draft modal/drawer

Append the following **below the two-column layout div** and before the closing `</div>` of the page root:

```tsx
{activeDraft && (
  <div style={{
    position: "fixed", inset: 0, zIndex: 50,
    background: "rgba(34,28,22,0.55)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  }}
  onClick={(e) => { if (e.target === e.currentTarget) setActiveDraft(null); }}
  >
    <div style={{
      ...card,
      width: "100%", maxWidth: 560, borderRadius: "18px 18px 0 0",
      padding: "28px 28px 32px", maxHeight: "80vh", overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.01em" }}>
            AI bid draft
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 3 }}>{activeDraft.title}</div>
        </div>
        <button
          onClick={() => setActiveDraft(null)}
          style={{ background: "var(--cream-100)", border: 0, borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "var(--ink-500)", display: "grid", placeItems: "center" }}
        >×</button>
      </div>

      {/* Headline badge */}
      <div style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--terracotta-50)", color: "var(--terracotta-600)", marginBottom: 20 }}>
        {activeDraft.draft.headline}
      </div>

      {/* Amount + Days row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-400)", display: "block", marginBottom: 6 }}>
            Bid amount ($)
          </label>
          <input
            type="number"
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid var(--border-warm)", background: "var(--bg-app)", padding: "0 12px", fontSize: 15, fontWeight: 600, color: "var(--ink-900)", fontFamily: "var(--font-body)", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-400)", display: "block", marginBottom: 6 }}>
            Est. days
          </label>
          <input
            type="number"
            value={draftDays}
            onChange={(e) => setDraftDays(e.target.value)}
            style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid var(--border-warm)", background: "var(--bg-app)", padding: "0 12px", fontSize: 15, fontWeight: 600, color: "var(--ink-900)", fontFamily: "var(--font-body)", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Proposal text */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-400)", display: "block", marginBottom: 6 }}>
          Proposal text
        </label>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          rows={4}
          style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border-warm)", background: "var(--bg-app)", padding: "10px 12px", fontSize: 14, color: "var(--ink-700)", fontFamily: "var(--font-body)", lineHeight: 1.55, resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      {/* Confidence */}
      <div style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 22 }}>
        Price confidence: <strong style={{ color: activeDraft.draft.confidence === "high" ? "var(--sage-700)" : activeDraft.draft.confidence === "medium" ? "var(--gold-600)" : "var(--ink-500)" }}>{activeDraft.draft.confidence}</strong>
        {activeDraft.draft.stub ? " · AI unavailable — showing estimate" : ""}
      </div>

      {/* Actions */}
      {submitSuccess ? (
        <div style={{ textAlign: "center", padding: "12px 0", color: "var(--sage-700)", fontWeight: 600, fontSize: 15 }}>
          ✓ Bid submitted!
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ ...btnGhost, flex: 1 }}
            onClick={() => setActiveDraft(null)}
          >
            Cancel
          </button>
          <button
            style={{ ...btnPrimary, flex: 2, justifyContent: "center" }}
            onClick={() => {
              // Mock submit — actual POST /requests/{id}/bids wiring is out of scope
              setSubmitSuccess(true);
              setTimeout(() => setActiveDraft(null), 1200);
            }}
          >
            Submit bid <IconArrowR />
          </button>
        </div>
      )}
    </div>
  </div>
)}
```

**Design rules (must follow):**
- All colors via CSS vars — no hardcoded hex
- Modal uses `var(--bg-card)`, `var(--border-warm)`, `var(--shadow-warm-sm)`
- Button styles reuse the existing `btnPrimary`, `btnGhost` constants already in the file
- Close on backdrop click

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/schemas/ai.py` | Append `BidDrafterRequest` + `BidDrafterResponse` |
| `api/routers/ai.py` | Append `POST /ai/bid-drafter` endpoint |
| `src/hooks/useBidDrafter.ts` | Create |
| `src/app/app/provider/job-feed/page.tsx` | Targeted additions — state, handlers, button replacements, modal |

No new routers, no migrations, no model changes.

---

## Acceptance criteria

1. `POST /ai/bid-drafter` returns a valid `BidDrafterResponse` when called by a provider JWT with a valid `request_id`.
2. HTTP 403 when called with a homeowner JWT.
3. HTTP 404 when `request_id` does not exist.
4. If `OPENAI_API_KEY` is missing or OpenAI fails: returns stub response, HTTP 200, `stub: true`.
5. The "Draft bid →" button on the featured card and "Draft bid" on job rows open the modal on click.
6. While `draftLoading` is true, the buttons are disabled.
7. Modal shows headline badge, pre-filled amount/days/text inputs.
8. All three inputs are editable.
9. "Submit bid" in the modal shows "✓ Bid submitted!" and closes after 1.2s.
10. Clicking the backdrop closes the modal.
11. `tsc --noEmit` passes with no new errors.

---

## Test steps

1. Start the API: `uvicorn main:app --port 8000` from `api/`
2. Obtain a provider JWT via `POST /auth/login`.
3. `curl -X POST http://localhost:8000/ai/bid-drafter -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"request_id": 1}'`
   → Expect JSON with `suggested_amount_cents`, `suggested_days`, `draft_text`, `headline`, `confidence`.
4. Same call with a homeowner JWT → expect HTTP 403.
5. Same call with `request_id: 99999` → expect HTTP 404.
6. Navigate to `/app/provider/job-feed` in the browser.
7. Click "Draft bid →" on the featured card → loading state → modal opens with pre-filled fields.
8. Edit the amount field, click "Submit bid" → success message, modal closes.
9. Click "Draft bid" on a job row → modal opens for that job.

---

## Out of scope

- Wiring "Submit bid" in the modal to the real `POST /requests/{id}/bids` endpoint (separate task)
- Changing the featured card's static mock data to real API data
- Any changes to other provider pages
- Mobile app changes

---

## Codex implementation prompt

```
Implement API-9b — Bid Drafter for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9b-bid-drafter.md

Files to read for context before coding:
  api/routers/ai.py                     (existing AI router — append new endpoint)
  api/schemas/ai.py                     (existing + 9a schemas — append to it)
  api/services/recommender.py           (suggest_bid_price, _provider_stats — import these)
  api/models/provider_profile.py        (ProviderProfile fields)
  api/models/bid.py                     (Bid model)
  api/models/request.py                 (ServiceRequest model)
  api/dependencies.py                   (get_current_user, get_db)
  src/hooks/useBidDrafter.ts            (create this file)
  src/app/app/provider/job-feed/page.tsx  (targeted additions only — do not rewrite)
  src/lib/api.ts                        (apiFetch helper)
  src/lib/auth.ts                       (getToken helper)

Implement exactly what is specified in the task file.
Make targeted additions to job-feed/page.tsx — do not rewrite the entire file.
After implementation, run: npx tsc --noEmit from the project root.
Fix any TypeScript errors before finishing.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Codex implemented all 4 files. tsc + py_compile clean. Review passed — provider guard correct, suggest_bid_price wired, _call_openai extended with kwargs, featured mock card uses local stub, modal complete with error display. |
