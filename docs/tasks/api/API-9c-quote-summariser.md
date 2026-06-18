# API-9c — Quote Summariser

**Status:** Completed
**Parent task:** API-9 (AI Features Round 2)
**Approved:** 2026-05-07

---

## Goal

Let a homeowner upload an outside provider's PDF or image quote. AI extracts the key terms,
compares them against current NeighBid bids on a request (if provided), flags missing warranty
or scope clauses, and returns a scored comparison card.

---

## Why this task comes now

`python-multipart` is already in `requirements.txt`. PDF text extraction needs `pypdf` (add it).
The comparison logic re-uses bid data already queryable from the DB.
No new models or migrations required.

---

## What Codex will implement

### 1. `api/requirements.txt` — add one line

Append:
```
pypdf>=4.0
```

---

### 2. New Pydantic schemas — `api/schemas/ai.py`

Append:

```python
class QuoteSummaryVsNeighBid(BaseModel):
    neighbid_best_bid: int        # cents
    saving_if_use_neighbid: int   # cents (can be negative if NeighBid is more expensive)
    neighbid_has_warranty: bool   # always False for now — placeholder

class QuoteSummaryResponse(BaseModel):
    provider_name: str
    quoted_amount: int            # cents (0 if not found)
    scope_summary: str
    flags: list[str]
    vs_neighbid: Optional[QuoteSummaryVsNeighBid] = None
    score: int                    # 0-100
    recommendation: str
    stub: bool = False
```

---

### 3. New endpoint — `api/routers/ai.py`

Append at the bottom:

```
POST /ai/quote-summary
Auth: homeowner role (HTTP 403 if current_user.role != "homeowner")
Content-Type: multipart/form-data
Body:
  file: UploadFile           (PDF or image — required)
  request_id: int | None     (optional form field)
Returns: QuoteSummaryResponse
```

**Imports to add at the top of the function (inline, not global):**
```python
from fastapi import File, Form, UploadFile
```

**Implementation logic:**

**Step A — Extract text from the uploaded file**

```python
import io
file_bytes = await file.read()
content_type = file.content_type or ""

if "pdf" in content_type or file.filename.lower().endswith(".pdf"):
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_text = "\n".join(
            page.extract_text() or "" for page in reader.pages
        ).strip()
    except Exception:
        extracted_text = ""
else:
    # For images: pass raw bytes to GPT-4o vision (or fall back to stub)
    extracted_text = ""  # handled in Step C via image path
```

**Step B — Load comparison data if request_id provided**

```python
vs_data = None
if request_id:
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if req:
        best_bid = (
            db.query(Bid)
            .filter(Bid.request_id == request_id, Bid.status == "pending")
            .order_by(Bid.amount)
            .first()
        )
        if best_bid:
            vs_data = {"request": req, "best_bid": best_bid}
```

**Step C — Call GPT to analyse the quote**

Build system prompt:
```
You are a home-services quote analyser for NeighBid.
Analyse the provided quote text and return ONLY a JSON object — no markdown, no explanation.

Return this exact shape:
{
  "provider_name": "<company name from quote, or 'Unknown Provider'>",
  "quoted_amount_cents": <integer — dollar amount × 100, or 0 if not found>,
  "scope_summary": "<1-2 sentence plain-English summary of what is included>",
  "flags": ["<issue 1>", "<issue 2>"],  ← list 0-4 flags: missing warranty, parts not included, unclear scope, no liability mention, etc.
  "score": <integer 0-100 — overall quote quality>,
  "recommendation": "<1 sentence actionable recommendation>"
}
```

User message:
- If `extracted_text` is non-empty: send `f"Quote text:\n\n{extracted_text[:4000]}"`
- If `extracted_text` is empty and the file is an image: pass the image as a base64 vision message to GPT-4o (not gpt-4o-mini):
  ```python
  import base64
  b64 = base64.b64encode(file_bytes).decode()
  mime = content_type if content_type else "image/jpeg"
  messages = [{
      "role": "user",
      "content": [
          {"type": "text", "text": "Analyse this outside provider quote:"},
          {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
      ]
  }]
  ```
  Call `gpt-4o` (not mini) for image inputs.
- If both are empty (e.g. empty PDF): return stub.

For text: call `gpt-4o-mini`, `temperature=0.3`, `max_tokens=512`.

**Step D — Build vs_neighbid block**

```python
vs_neighbid = None
if vs_data and quoted_amount > 0:
    saving = quoted_amount - vs_data["best_bid"].amount
    vs_neighbid = QuoteSummaryVsNeighBid(
        neighbid_best_bid=vs_data["best_bid"].amount,
        saving_if_use_neighbid=saving,
        neighbid_has_warranty=False,
    )
    # Append a vs_neighbid note to recommendation
    if saving > 0:
        recommendation += f" NeighBid's best bid saves you ${saving // 100} vs this quote."
    elif saving < 0:
        recommendation += f" This quote is ${abs(saving) // 100} cheaper than NeighBid's best."
```

**Step E — Return QuoteSummaryResponse**

If JSON parsing fails or OpenAI is unavailable: return stub with:
- `provider_name = "Unknown Provider"`, `quoted_amount = 0`, `scope_summary = "Could not extract quote details"`, `flags = []`, `score = 0`, `recommendation = "Upload a clearer PDF or image"`, `stub = True`

---

### 4. New hook — `src/hooks/useQuoteSummary.ts`

```typescript
import { useState } from "react";
import { getToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface QuoteSummaryVsNeighBid {
  neighbid_best_bid: number;
  saving_if_use_neighbid: number;
  neighbid_has_warranty: boolean;
}

export interface QuoteSummaryResult {
  provider_name: string;
  quoted_amount: number;
  scope_summary: string;
  flags: string[];
  vs_neighbid: QuoteSummaryVsNeighBid | null;
  score: number;
  recommendation: string;
  stub: boolean;
}

export function useQuoteSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function summariseQuote(
    file: File,
    requestId?: number
  ): Promise<QuoteSummaryResult | null> {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const form = new FormData();
      form.append("file", file);
      if (requestId !== undefined) form.append("request_id", String(requestId));

      const res = await fetch(`${BASE_URL}/ai/quote-summary`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<QuoteSummaryResult>;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarise quote");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { summariseQuote, loading, error };
}
```

Note: Uses raw `fetch` (not `apiFetch`) because `apiFetch` sets `Content-Type: application/json` which breaks multipart uploads.

---

### 5. Updated page — `src/app/app/homeowner/bids/page.tsx`

**Targeted additions only — do not rewrite the file.**

#### 5a — Add imports and state at the top of the component

```typescript
import { useRef, useState } from "react";
import { useQuoteSummary } from "@/hooks/useQuoteSummary";
import type { QuoteSummaryResult } from "@/hooks/useQuoteSummary";
```

Inside `HomeownerBids`:
```typescript
const { summariseQuote, loading: quoteLoading, error: quoteError } = useQuoteSummary();
const fileInputRef = useRef<HTMLInputElement>(null);
const [quoteResult, setQuoteResult] = useState<QuoteSummaryResult | null>(null);
const [showQuotePanel, setShowQuotePanel] = useState(false);
```

#### 5b — Add "Compare outside quote" button to the header

Current header buttons (line ~141):
```tsx
<button style={btnGhost}><IconSearch /> Search bids</button>
<Link href="/app/homeowner/request" style={{ ...btnPrimary, textDecoration: "none" }}><IconPlus /> New request</Link>
```

Add before the existing buttons:
```tsx
<>
  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf,image/*"
    style={{ display: "none" }}
    onChange={async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setShowQuotePanel(true);
      setQuoteResult(null);
      const result = await summariseQuote(f);
      if (result) setQuoteResult(result);
      e.target.value = "";
    }}
  />
  <button style={btnGhost} onClick={() => fileInputRef.current?.click()}>
    {quoteLoading ? "Analysing…" : "Compare outside quote"}
  </button>
</>
```

#### 5c — Add the quote comparison panel

Insert the following **below the stats grid** and **above the tab filter row** (after the closing `</div>` of the stats grid, before `display: "flex", alignItems: "center", gap: 6, marginBottom: 18`):

```tsx
{showQuotePanel && (
  <div style={{ ...cardStyle, padding: 24, marginBottom: 22, position: "relative" }}>
    <button
      onClick={() => { setShowQuotePanel(false); setQuoteResult(null); }}
      style={{ position: "absolute", top: 16, right: 16, background: "var(--cream-100)", border: 0, borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: "var(--ink-500)", display: "grid", placeItems: "center" }}
    >×</button>

    {quoteLoading && !quoteResult && (
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink-500)", fontSize: 14 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0,1,2].map(i => (
            <span key={i} className="nb-dot" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--terracotta-600)", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        Analysing your quote…
      </div>
    )}

    {quoteError && (
      <p style={{ color: "var(--terracotta-600)", fontSize: 14 }}>{quoteError}</p>
    )}

    {quoteResult && (
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Outside quote</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", marginTop: 4, letterSpacing: "-0.01em" }}>
              {quoteResult.provider_name}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>
              {quoteResult.quoted_amount > 0 ? `$${Math.round(quoteResult.quoted_amount / 100).toLocaleString()}` : "—"}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, marginTop: 4,
              background: quoteResult.score >= 70 ? "var(--sage-50)" : quoteResult.score >= 40 ? "var(--gold-50)" : "var(--terracotta-50)",
              color: quoteResult.score >= 70 ? "var(--sage-700)" : quoteResult.score >= 40 ? "var(--gold-600)" : "var(--terracotta-600)",
            }}>
              Score {quoteResult.score}/100
            </div>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.55, marginBottom: 14 }}>{quoteResult.scope_summary}</p>

        {quoteResult.flags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 14 }}>
            {quoteResult.flags.map((flag, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--terracotta-50)", color: "var(--terracotta-600)" }}>
                ⚠ {flag}
              </span>
            ))}
          </div>
        )}

        {quoteResult.vs_neighbid && (
          <div style={{ background: "var(--sage-50)", border: "1px solid var(--border-warm)", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sage-700)" }}>
              NeighBid best bid: ${Math.round(quoteResult.vs_neighbid.neighbid_best_bid / 100).toLocaleString()}
              {quoteResult.vs_neighbid.saving_if_use_neighbid > 0
                ? ` · Saves you $${Math.round(quoteResult.vs_neighbid.saving_if_use_neighbid / 100).toLocaleString()}`
                : quoteResult.vs_neighbid.saving_if_use_neighbid < 0
                  ? ` · This quote is $${Math.round(Math.abs(quoteResult.vs_neighbid.saving_if_use_neighbid) / 100).toLocaleString()} cheaper`
                  : " · Same price"}
            </div>
          </div>
        )}

        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>{quoteResult.recommendation}</p>
        {quoteResult.stub && <p style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 8 }}>AI unavailable — partial analysis only.</p>}
      </div>
    )}
  </div>
)}
```

The page already has an inline `<style>` with `nbPulse` animation keyframes... actually it doesn't. The bids page doesn't have the animation. Instead of using `.nb-dot`, render the loading state as a simple text: `"Analysing your quote…"` with no animated dots. Remove the `nb-dot` span approach from 5c and replace with:
```tsx
<div style={{ color: "var(--ink-500)", fontSize: 14 }}>Analysing your quote…</div>
```

---

## Files to create or modify

| File | Action |
|------|--------|
| `api/requirements.txt` | Append `pypdf>=4.0` |
| `api/schemas/ai.py` | Append `QuoteSummaryVsNeighBid` + `QuoteSummaryResponse` |
| `api/routers/ai.py` | Append `POST /ai/quote-summary` endpoint |
| `src/hooks/useQuoteSummary.ts` | Create |
| `src/app/app/homeowner/bids/page.tsx` | Targeted additions only |

No new routers, no migrations, no model changes.

---

## Acceptance criteria

1. `POST /ai/quote-summary` with a PDF returns `QuoteSummaryResponse` (200).
2. Non-homeowner JWT → HTTP 403.
3. Missing file → HTTP 422 (FastAPI default for missing required field).
4. OPENAI_API_KEY missing or parse failure → stub response, HTTP 200, `stub: true`.
5. "Compare outside quote" button visible in bids page header.
6. Clicking the button triggers the hidden file input.
7. After selecting a file: panel appears with "Analysing…" text, then the result card.
8. Result card shows provider name, quoted amount, scope summary, flags, score, recommendation.
9. `vs_neighbid` block visible when `request_id` is provided and a best bid exists.
10. × button closes the panel.
11. `tsc --noEmit` passes with no new errors.

---

## Test steps

1. Start API: `uvicorn main:app --port 8000` from `api/`
2. Create a small PDF or use any image file for the upload.
3. `curl -s -X POST http://localhost:8000/ai/quote-summary -H "Authorization: Bearer <homeowner_token>" -F "file=@/path/to/quote.pdf"` → expect JSON response.
4. Same with `request_id` form field: `-F "request_id=1"` → expect `vs_neighbid` block.
5. With provider token → expect HTTP 403.
6. Navigate to `/app/homeowner/bids`, click "Compare outside quote", upload a file, verify the panel renders.

---

## Out of scope

- Saving the analysis to the database
- Dispute Mediator (API-9f)
- Any other pages

---

## Codex implementation prompt

```
Implement API-9c — Quote Summariser for NeighBid.

Read this task file in full before writing any code:
  docs/tasks/api/API-9c-quote-summariser.md

Files to read for context before coding:
  api/routers/ai.py            (append new endpoint)
  api/schemas/ai.py            (append new schemas)
  api/models/request.py        (ServiceRequest)
  api/models/bid.py            (Bid)
  api/dependencies.py          (get_current_user, get_db)
  api/requirements.txt         (add pypdf>=4.0)
  src/app/app/homeowner/bids/page.tsx   (targeted additions only)
  src/lib/auth.ts              (getToken)

Implement exactly what the spec says. Five files total.
Make targeted additions to bids/page.tsx — do not rewrite the entire file.
After implementation run: npx tsc --noEmit from the project root and fix any errors.
```

---

## Task update log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude — ready for Codex |
| 2026-05-07 | Completed | Backend by Codex, frontend by Claude (Codex sandboxed to api/). tsc clean. Review passed — role guard, PDF/image path, stub fallback, panel renders correctly. |
