# API-9f — AI Dispute Mediator

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07

---

## Goal

When a homeowner marks a completed job as disputed, AI reads the full context (request, bid terms,
conversation history, any reviews) and returns a neutral mediation summary with 2–3 resolution
options and a recommended path forward.

---

## Why this task comes now

No new models or migrations required. `Bid.status` is a plain String — adding "disputed" is a
value-only change. All context needed (Bid, ServiceRequest, Conversation/Message, Review) is
already queryable. The GPT call follows the same pattern as 9a and 9b.

---

## What Codex will implement

### 1. New Pydantic schemas — `api/schemas/ai.py`

Append:

```python
class DisputeRequest(BaseModel):
    complaint: str

class DisputeResolutionOption(BaseModel):
    type: str          # "partial_refund" | "revisit" | "full_refund" | "no_action"
    description: str
    amount_cents: Optional[int] = None   # for refund options

class DisputeResponse(BaseModel):
    summary: str
    homeowner_position: str
    provider_position: str
    resolution_options: list[DisputeResolutionOption]
    recommendation: str   # one of the types above
    confidence: str       # "high" | "medium" | "low"
    stub: bool = False
```

---

### 2. New endpoint — `api/routers/ai.py`

Append at the bottom:

```
POST /ai/dispute/{bid_id}
Auth: homeowner role only (HTTP 403 otherwise)
Must own the underlying request (HTTP 403 if not)
Body: DisputeRequest
Returns: DisputeResponse
```

Also mark the bid as "disputed" when the endpoint is called.

**Implementation logic:**

**Step A — Load and validate**

```python
bid = db.query(Bid).filter(Bid.id == bid_id).first()
if not bid:
    raise HTTPException(status_code=404, detail="Bid not found")

req = db.query(ServiceRequest).filter(ServiceRequest.id == bid.request_id).first()
if not req or req.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Not your request")

if bid.status not in ("accepted", "disputed"):
    raise HTTPException(status_code=400, detail="Can only dispute accepted bids")
```

**Step B — Mark bid as disputed**

```python
bid.status = "disputed"
db.commit()
```

**Step C — Load context**

```python
provider = db.query(User).filter(User.id == bid.provider_id).first()

# Load DM conversation between homeowner and provider (either order)
from models.message import Conversation, Message
convo = (
    db.query(Conversation)
    .filter(
        ((Conversation.user_a_id == current_user.id) & (Conversation.user_b_id == bid.provider_id))
        | ((Conversation.user_a_id == bid.provider_id) & (Conversation.user_b_id == current_user.id))
    )
    .first()
)
messages = convo.messages[-10:] if convo and convo.messages else []

# Any existing review for this bid
review = db.query(Review).filter(Review.bid_id == bid.id).first()
```

**Step D — Build system prompt**

```
You are a neutral dispute mediator for NeighBid, a home-services bidding platform.
Read the full context and return ONLY a JSON object — no markdown, no explanation.

Return this exact shape:
{
  "summary": "<2-3 sentence factual summary of the situation>",
  "homeowner_position": "<1-2 sentences summarising the homeowner's concern>",
  "provider_position": "<1-2 sentences summarising what the provider agreed to do>",
  "resolution_options": [
    {
      "type": "partial_refund",
      "description": "<what partial refund would cover and why>",
      "amount_cents": <integer or null>
    },
    {
      "type": "revisit",
      "description": "<what a revisit would involve>",
      "amount_cents": null
    },
    {
      "type": "full_refund",
      "description": "<when full refund is warranted>",
      "amount_cents": <bid amount>
    }
  ],
  "recommendation": "<one of the type values above>",
  "confidence": "<high|medium|low>"
}
```

**Step E — Build user message**

```python
msg_lines = [f"  {m.text[:200]}" for m in messages]
user_message = f"""
Job: {req.title}
Category: {req.category}
Neighborhood: {req.neighborhood}
Original budget: ${req.budget_min//100}–${req.budget_max//100}

Bid accepted: ${bid.amount//100} · {bid.estimated_days} day(s) estimated · status now: disputed
Provider: {provider.full_name if provider else 'Unknown'}

Homeowner complaint: {payload.complaint}

Last {len(messages)} messages between homeowner and provider:
{chr(10).join(msg_lines) if msg_lines else '  (no direct messages)'}

{'Review on file: ' + str(review.stars) + '★ — ' + (review.comment or '') if review else 'No review yet.'}
"""
```

Call `_call_openai(system_prompt, [{"role": "user", "content": user_message}], temperature=0.3, max_tokens=700)`.

**Stub response on failure:**
```python
DisputeResponse(
    summary="Unable to generate mediation at this time.",
    homeowner_position=payload.complaint,
    provider_position="Provider position could not be determined.",
    resolution_options=[
        DisputeResolutionOption(type="revisit", description="Request a revisit from the provider."),
        DisputeResolutionOption(type="partial_refund", description="Negotiate a partial refund.", amount_cents=bid.amount // 2),
    ],
    recommendation="revisit",
    confidence="low",
    stub=True,
)
```

---

### 3. New hook — `src/hooks/useDisputeMediator.ts`

```typescript
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface DisputeResolutionOption {
  type: string;
  description: string;
  amount_cents?: number | null;
}

export interface DisputeResult {
  summary: string;
  homeowner_position: string;
  provider_position: string;
  resolution_options: DisputeResolutionOption[];
  recommendation: string;
  confidence: "high" | "medium" | "low";
  stub: boolean;
}

export function useDisputeMediator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitDispute(bidId: number, complaint: string): Promise<DisputeResult | null> {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      return await apiFetch<DisputeResult>(`/ai/dispute/${bidId}`, {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify({ complaint }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit dispute");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { submitDispute, loading, error };
}
```

---

### 4. Updated page — `src/app/app/homeowner/bids/page.tsx`

**Targeted additions only.**

#### 4a — Imports and state

```typescript
import { useState } from "react";
import { useDisputeMediator } from "@/hooks/useDisputeMediator";
import type { DisputeResult } from "@/hooks/useDisputeMediator";
```

Inside `HomeownerBids`:
```typescript
const { submitDispute, loading: disputeLoading } = useDisputeMediator();
const [disputeBidId, setDisputeBidId] = useState<number | null>(null);
const [disputeComplaint, setDisputeComplaint] = useState("");
const [disputeResult, setDisputeResult] = useState<DisputeResult | null>(null);
```

#### 4b — Add "Dispute job" button to the accepted bids section

In the accepted bids map (around the "Leave review" button), add alongside it:

```tsx
<button
  style={btnSmGhost}
  onClick={() => {
    setDisputeBidId(bid.id);
    setDisputeComplaint("");
    setDisputeResult(null);
  }}
>
  Dispute job
</button>
```

#### 4c — Add the dispute modal

Append before the closing root `</div>` of the page:

```tsx
{disputeBidId !== null && (
  <div
    style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(34,28,22,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    onClick={(e) => { if (e.target === e.currentTarget) { setDisputeBidId(null); setDisputeResult(null); } }}
  >
    <div style={{ ...cardStyle, width: "100%", maxWidth: 600, borderRadius: "18px 18px 0 0", padding: "28px 28px 36px", maxHeight: "85vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.01em" }}>
          {disputeResult ? "Mediation result" : "Dispute this job"}
        </div>
        <button onClick={() => { setDisputeBidId(null); setDisputeResult(null); }} style={{ background: "var(--cream-100)", border: 0, borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "var(--ink-500)", display: "grid", placeItems: "center" }}>×</button>
      </div>

      {!disputeResult ? (
        <>
          <p style={{ fontSize: 14, color: "var(--ink-700)", marginBottom: 16, lineHeight: 1.55 }}>
            Describe the issue. AI will read the full job context and suggest a fair resolution.
          </p>
          <textarea
            rows={5}
            value={disputeComplaint}
            onChange={(e) => setDisputeComplaint(e.target.value)}
            placeholder="e.g. The work was incomplete — 2 pipes still dripping after the plumber left."
            style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border-warm)", background: "var(--bg-app)", padding: "12px 14px", fontSize: 14, color: "var(--ink-700)", fontFamily: "var(--font-body)", lineHeight: 1.55, resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...btnGhost, flex: 1 }} onClick={() => { setDisputeBidId(null); }}>Cancel</button>
            <button
              style={{ ...btnPrimary, flex: 2, justifyContent: "center" }}
              disabled={!disputeComplaint.trim() || disputeLoading}
              onClick={async () => {
                if (!disputeBidId) return;
                const result = await submitDispute(disputeBidId, disputeComplaint);
                if (result) setDisputeResult(result);
              }}
            >
              {disputeLoading ? "Analysing…" : "Submit to AI mediator"}
            </button>
          </div>
        </>
      ) : (
        <div>
          <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.6, marginBottom: 20 }}>{disputeResult.summary}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "var(--terracotta-50)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--terracotta-600)", marginBottom: 6 }}>Your position</div>
              <p style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.5, margin: 0 }}>{disputeResult.homeowner_position}</p>
            </div>
            <div style={{ background: "var(--cream-100)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-500)", marginBottom: 6 }}>Provider agreed to</div>
              <p style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.5, margin: 0 }}>{disputeResult.provider_position}</p>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-400)", marginBottom: 10 }}>Resolution options</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 20 }}>
            {disputeResult.resolution_options.map((opt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: opt.type === disputeResult.recommendation ? "var(--sage-50)" : "var(--cream-50)", border: `1px solid ${opt.type === disputeResult.recommendation ? "var(--sage-200)" : "var(--border-warm)"}` }}>
                {opt.type === disputeResult.recommendation && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--sage-700)", background: "var(--sage-100)", borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" as const }}>Recommended</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", textTransform: "capitalize" as const }}>{opt.type.replace(/_/g, " ")}{opt.amount_cents ? ` — $${Math.round(opt.amount_cents / 100)}` : ""}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{opt.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 20 }}>
            AI confidence: <strong style={{ color: disputeResult.confidence === "high" ? "var(--sage-700)" : disputeResult.confidence === "medium" ? "var(--gold-600)" : "var(--ink-500)" }}>{disputeResult.confidence}</strong>
            {disputeResult.stub ? " · AI unavailable — showing estimate" : ""}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...btnGhost, flex: 1 }} onClick={() => { setDisputeBidId(null); setDisputeResult(null); }}>Close</button>
            <button style={{ ...btnPrimary, flex: 1, justifyContent: "center" }} onClick={() => { setDisputeBidId(null); setDisputeResult(null); }}>Accept recommendation</button>
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/schemas/ai.py` | Append `DisputeRequest`, `DisputeResolutionOption`, `DisputeResponse` |
| `api/routers/ai.py` | Append `POST /ai/dispute/{bid_id}` endpoint |
| `src/hooks/useDisputeMediator.ts` | Create |
| `src/app/app/homeowner/bids/page.tsx` | Targeted additions only |

No migrations, no new models.

---

## Acceptance criteria

1. `POST /ai/dispute/{bid_id}` with homeowner JWT + valid accepted bid → bid status set to "disputed", returns `DisputeResponse`.
2. Non-homeowner JWT → HTTP 403.
3. Homeowner does not own the bid's request → HTTP 403.
4. Bid not in accepted/disputed status → HTTP 400.
5. Bid not found → HTTP 404.
6. OpenAI missing/parse failure → stub response, HTTP 200, `stub: true`.
7. "Dispute job" button visible on accepted bids in the bids page.
8. Clicking it opens the dispute modal with a complaint textarea.
9. Submitting shows "Analysing…" then the mediation result card.
10. Resolution options highlight the recommended one.
11. × and "Close" both dismiss the modal.
12. `tsc --noEmit` passes.

---

## Test steps

1. Start API: `uvicorn main:app --port 8000` from `api/`
2. Get a bid ID that is in "accepted" status.
3. `curl -X POST http://localhost:8000/ai/dispute/{bid_id} -H "Authorization: Bearer <homeowner_token>" -H "Content-Type: application/json" -d '{"complaint":"The work was incomplete"}'` → expect `DisputeResponse`.
4. Confirm bid status in DB is now "disputed".
5. Navigate to `/app/homeowner/bids`, click "Dispute job" on an accepted bid, verify modal.

---

## Out of scope

- Escalation to human admin
- Demand Forecasting (9g — separate task)

---

## Codex implementation prompt

```
Implement API-9f — AI Dispute Mediator for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9f-dispute-mediator.md

Files to read for context before coding:
  api/routers/ai.py            (append new endpoint)
  api/schemas/ai.py            (append new schemas)
  api/models/bid.py            (Bid — status field)
  api/models/request.py        (ServiceRequest)
  api/models/message.py        (Conversation, Message — for DM history)
  api/models/review.py         (Review — for context)
  api/models/user.py           (User)
  api/dependencies.py          (get_current_user, get_db)
  src/app/app/homeowner/bids/page.tsx  (targeted additions only)
  src/lib/api.ts
  src/lib/auth.ts

Implement exactly what the spec says.
Make targeted additions to bids/page.tsx — do not rewrite the entire file.
After implementation run: npx tsc --noEmit from the project root and fix any errors.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Backend by Codex, frontend by Claude. tsc clean. 404/403/400 guards correct, bid marked disputed on call. Mediation modal shows summary, positions, 3 resolution options with recommended badge, confidence. |
