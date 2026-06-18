# AI Features Test Suite

## Task Status
`Approved`

## Goal
Write and run `tests/test_ai_features.py` — a live end-to-end test of all 16
AI endpoints across API-7 (chat + memory), API-8 (recommendations), and
API-9a–9g (AI Round 2 features).

Tests verify: HTTP status, response shape, role enforcement, stub=False (real
AI ran), and tool-use correctness (chat messages reference actual DB data).

## Codex Implementation Prompt

Implement `tests/test_ai_features.py` exactly as described below.
Working directory: `/Users/lancedsilva/Documents/neighbid-claude-codex-starter`
API is on `http://localhost:8000`.
Pattern: mirrors `tests/test_west_adams_usc.py` — plain `requests`, top-to-bottom
script, no pytest, `check()` helper, exits 0/1.

---

### IMPORTS AND HELPERS

```python
import base64
import io
import sys
import time
import uuid
import requests as http

BASE = "http://localhost:8000"
PASS = "✅"
FAIL = "❌"
INFO = "ℹ️ "
results = []

def check(label, condition, detail=""):
    icon = PASS if condition else FAIL
    msg = f"  {icon}  {label}"
    if detail and not condition:
        msg += f"\n       → {detail}"
    print(msg)
    results.append((label, condition))
    return condition

def info(msg):
    print(f"  {INFO} {msg}")

def uid():
    return uuid.uuid4().hex[:8]

class Client:
    def __init__(self, token=""):
        self.token = token
    def _h(self):
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h
    def get(self, path, params=None):
        return http.get(f"{BASE}{path}", headers=self._h(), params=params)
    def post(self, path, data=None):
        return http.post(f"{BASE}{path}", json=data, headers=self._h())
    def put(self, path, data=None):
        return http.put(f"{BASE}{path}", json=data, headers=self._h())
    def delete(self, path, params=None):
        return http.delete(f"{BASE}{path}", headers=self._h(), params=params)

def register(email, password, full_name, role, lat=None, lng=None):
    payload = {"email": email, "password": password,
               "full_name": full_name, "role": role}
    if lat is not None:
        payload["latitude"] = lat
    if lng is not None:
        payload["longitude"] = lng
    r = http.post(f"{BASE}/auth/register", json=payload)
    assert r.status_code == 201, f"register failed: {r.text}"
    return Client(r.json()["access_token"])
```

---

### BLOCK 1 — SETUP (create accounts + data)

```python
tag = uid()
WA_LAT, WA_LNG = 34.0220, -118.3278
NBHD = f"West Adams {tag}"

alice   = register(f"alice_ai_{tag}@test.com",  "pass123", "Alice Chen",         "homeowner", WA_LAT, WA_LNG)
bob     = register(f"bob_ai_{tag}@test.com",    "pass123", "Bob Rivera",         "homeowner", WA_LAT+0.002, WA_LNG+0.001)
profix  = register(f"profix_ai_{tag}@test.com", "pass123", "ProFix Plumbing",    "provider",  WA_LAT+0.001, WA_LNG-0.001)
leafco  = register(f"leafco_ai_{tag}@test.com", "pass123", "LeafCo Landscaping", "provider",  WA_LAT-0.001, WA_LNG+0.002)

# Update ProFix profile so bid-drafter has trades/license context
http.patch(f"{BASE}/provider/me", json={
    "company_name": "ProFix Plumbing LLC",
    "trades": "plumbing,drain cleaning",
    "service_radius_mi": 8,
    "is_licensed": True,
    "is_insured": True,
}, headers=profix._h())

# Alice creates two requests
r = alice.post("/requests", {
    "title": "Kitchen sink leak — urgent",
    "description": "Water dripping under the kitchen sink cabinet, possible pipe joint failure.",
    "category": "plumbing",
    "neighborhood": NBHD,
    "status": "live",
    "budget_min": 25000,
    "budget_max": 75000,
})
alice_plumbing_req_id = r.json()["id"]

r = bob.post("/requests", {
    "title": "Lawn mowing and edging",
    "description": "Front yard, ~2000 sq ft.",
    "category": "lawn",
    "neighborhood": NBHD,
    "status": "live",
    "budget_min": 8000,
    "budget_max": 20000,
})
bob_lawn_req_id = r.json()["id"]

# ProFix bids on Alice's plumbing request
r = profix.post(f"/requests/{alice_plumbing_req_id}/bids", {
    "amount": 45000,
    "estimated_days": 2,
    "work_days": ["2026-05-20"],
})
profix_bid_id = r.json()["id"]

# LeafCo also bids (so ranking has 2 bids to compare)
r = leafco.post(f"/requests/{alice_plumbing_req_id}/bids", {
    "amount": 68000,
    "estimated_days": 3,
    "work_days": ["2026-05-21"],
})
leafco_bid_id = r.json()["id"]

# Alice accepts ProFix bid (needed for smart-schedule + dispute)
alice.put(f"/bids/{profix_bid_id}/accept")

# Group channel was auto-created on ProFix's bid — grab it
r = alice.get("/homeowner/channels")
channels = [ch for ch in r.json() if ch["request_id"] == alice_plumbing_req_id]
alice_channel_id = channels[0]["id"] if channels else None
```

---

### BLOCK 2 — AI CHAT: HOMEOWNER (tool use + memory)

```python
print("\n▶  Block 2 — AI Chat: Homeowner (tool use + memory)")

# General greeting
r = alice.post("/ai/chat", {
    "message": "Hi! What can you help me with on this platform?",
    "context_key": "general"
})
check("AI chat returns 200",          r.status_code == 200, r.text)
check("reply field present",          bool(r.json().get("reply")))
check("stub=False (OpenAI called)",   r.json().get("stub") == False,
      f"stub={r.json().get('stub')}")
info(f"AI reply preview: {r.json().get('reply','')[:120]}")

# Tool use: get_my_requests
r = alice.post("/ai/chat", {
    "message": "What service requests do I have open right now?",
    "context_key": "general"
})
check("Tool-use call returns 200",    r.status_code == 200, r.text)
check("stub=False",                   r.json().get("stub") == False)
reply_text = r.json().get("reply", "")
# AI should reference the actual request title from DB via tool call
check("Reply references real request title",
      "kitchen" in reply_text.lower() or "sink" in reply_text.lower() or "plumbing" in reply_text.lower(),
      f"reply: {reply_text[:200]}")

# Tool use: get_bids_for_request (follow-up uses memory context)
r = alice.post("/ai/chat", {
    "message": "Who has bid on my plumbing request and for how much?",
    "context_key": "general"
})
check("Bid query returns 200",        r.status_code == 200, r.text)
check("stub=False",                   r.json().get("stub") == False)
reply_text = r.json().get("reply", "")
check("Reply mentions a dollar amount or provider",
      "$" in reply_text or "profix" in reply_text.lower() or "450" in reply_text,
      f"reply: {reply_text[:200]}")
```

---

### BLOCK 3 — AI CHAT: PROVIDER (tool use)

```python
print("\n▶  Block 3 — AI Chat: Provider (tool use)")

r = profix.post("/ai/chat", {
    "message": "What jobs are available near me right now?",
    "context_key": "general"
})
check("Provider chat returns 200",    r.status_code == 200, r.text)
check("stub=False",                   r.json().get("stub") == False)
reply_text = r.json().get("reply", "")
check("Reply references nearby jobs",
      "job" in reply_text.lower() or "request" in reply_text.lower() or "plumbing" in reply_text.lower(),
      f"reply: {reply_text[:200]}")

r = profix.post("/ai/chat", {
    "message": "How are my current bids doing?",
    "context_key": "general"
})
check("Bid pipeline query returns 200", r.status_code == 200, r.text)
check("stub=False",                     r.json().get("stub") == False)
reply_text = r.json().get("reply", "")
check("Reply mentions bid status",
      "accept" in reply_text.lower() or "bid" in reply_text.lower() or "profix" in reply_text.lower(),
      f"reply: {reply_text[:200]}")
```

---

### BLOCK 4 — AI GROUP CHANNEL CHAT

```python
print("\n▶  Block 4 — AI Group Channel Chat")

if alice_channel_id:
    r = http.post(
        f"{BASE}/ai/group/{alice_channel_id}",
        json={"message": "Can you summarise the bids in this channel?", "context_key": ""},
        headers=alice._h(),
    )
    check("Group AI chat returns 200",  r.status_code == 200, r.text)
    check("stub=False",                 r.json().get("stub") == False)
    check("reply non-empty",            bool(r.json().get("reply")))

    # AI reply should appear as a message in the channel
    time.sleep(1)
    r = http.get(
        f"{BASE}/homeowner/channels/{alice_channel_id}/messages",
        headers=alice._h(),
    )
    check("AI message posted to channel",
          any("[BidBundle AI]" in m.get("text","") for m in r.json()),
          f"messages: {[m.get('text','')[:60] for m in r.json()]}")

    # Non-member (bob) blocked
    r = http.post(
        f"{BASE}/ai/group/{alice_channel_id}",
        json={"message": "Hello", "context_key": ""},
        headers=bob._h(),
    )
    check("Non-participant blocked (403)", r.status_code == 403, f"got {r.status_code}")
else:
    info("Skipping group AI test — no channel found")
```

---

### BLOCK 5 — AI MEMORY

```python
print("\n▶  Block 5 — AI Memory")

r = alice.get("/ai/history", params={"context_key": "general"})
check("History endpoint returns 200",  r.status_code == 200)
check("History has messages",          len(r.json()) >= 2,
      f"got {len(r.json())} messages")

r = alice.delete("/ai/memory", params={"context_key": "general"})
check("Memory clear returns 204",      r.status_code == 204, r.text)

r = alice.get("/ai/history", params={"context_key": "general"})
check("History empty after clear",     r.json() == [], f"got {r.json()}")
```

---

### BLOCK 6 — RECOMMENDATIONS: BID RANKING

```python
print("\n▶  Block 6 — Recommendations: Bid Ranking")

# Need a live request with bids — create a new one since alice_plumbing is now closed
r = alice.post("/requests", {
    "title": "Bathroom faucet replacement",
    "description": "Master bath faucet dripping, needs full replacement.",
    "category": "plumbing",
    "neighborhood": NBHD,
    "status": "live",
    "budget_min": 20000,
    "budget_max": 60000,
})
alice_req2_id = r.json()["id"]

profix.post(f"/requests/{alice_req2_id}/bids", {
    "amount": 38000, "estimated_days": 1, "work_days": ["2026-05-22"]
})
leafco.post(f"/requests/{alice_req2_id}/bids", {
    "amount": 55000, "estimated_days": 2, "work_days": ["2026-05-23"]
})

r = alice.get(f"/recommendations/bids/{alice_req2_id}")
check("Bid recommendations 200",       r.status_code == 200, r.text)
check("total=2",                       r.json().get("total") == 2,
      f"total={r.json().get('total')}")
bids = r.json().get("bids", [])
check("Both bids scored",              all("score" in b for b in bids if b.get("bid_status") == "pending"))
scores = [b["score"] for b in bids if b.get("score") is not None]
check("Scores in 0-100 range",         all(0 <= s <= 100 for s in scores), f"scores={scores}")
top_picks = [b for b in bids if b.get("is_top_pick")]
check("Exactly one is_top_pick",       len(top_picks) == 1, f"top_picks={len(top_picks)}")
check("Sub-scores present",            all("sub_scores" in b for b in bids if b.get("score") is not None))

r = profix.get(f"/recommendations/bids/{alice_req2_id}")
check("Provider blocked from bid recs (403)", r.status_code == 403)
```

---

### BLOCK 7 — RECOMMENDATIONS: JOB FEED

```python
print("\n▶  Block 7 — Recommendations: Job Feed")

r = profix.get("/recommendations/jobs")
check("Job feed 200",                  r.status_code == 200, r.text)
check("Jobs list present",             "jobs" in r.json())
jobs = r.json().get("jobs", [])
check("Jobs have match_pct",           all("match_pct" in j for j in jobs))
check("Jobs have reason",              all("reason" in j for j in jobs))
if jobs:
    check("match_pct in 0-100",        all(0 <= j["match_pct"] <= 100 for j in jobs),
          f"values: {[j['match_pct'] for j in jobs]}")

r = profix.get("/recommendations/jobs", params={"category": "plumbing"})
check("Filtered job feed 200",         r.status_code == 200)
plumbing_jobs = r.json().get("jobs", [])
check("Filter returns only plumbing",  all(j["category"] == "plumbing" for j in plumbing_jobs),
      f"cats: {[j['category'] for j in plumbing_jobs]}")

r = alice.get("/recommendations/jobs")
check("Homeowner blocked from job feed (403)", r.status_code == 403)
```

---

### BLOCK 8 — RECOMMENDATIONS: BID PRICE SUGGESTION

```python
print("\n▶  Block 8 — Recommendations: Bid Price Suggestion")

r = profix.get(f"/recommendations/bid-price/{alice_req2_id}")
check("Bid price suggestion 200",      r.status_code == 200, r.text)
check("suggested_low_cents present",   "suggested_low_cents" in r.json())
check("suggested_high_cents present",  "suggested_high_cents" in r.json())
check("low < high",
      r.json().get("suggested_low_cents", 0) < r.json().get("suggested_high_cents", 0),
      f"low={r.json().get('suggested_low_cents')}, high={r.json().get('suggested_high_cents')}")
check("confidence set",                r.json().get("confidence") in ("high","medium","low"),
      f"confidence={r.json().get('confidence')}")
check("reason non-empty",             bool(r.json().get("reason")))

r = alice.get(f"/recommendations/bid-price/{alice_req2_id}")
check("Homeowner blocked from price suggestion (403)", r.status_code == 403)
```

---

### BLOCK 9 — RECOMMENDATIONS: GROUP OPPORTUNITIES

```python
print("\n▶  Block 9 — Recommendations: Group Opportunities")

r = alice.get("/recommendations/groups")
check("Group opps 200",                r.status_code == 200, r.text)
check("opportunities key present",     "opportunities" in r.json())
opps = r.json().get("opportunities", [])
for opp in opps:
    check(f"Opp has reason field",     "reason" in opp)

r = profix.get("/recommendations/groups")
check("Provider blocked from groups (403)", r.status_code == 403)
```

---

### BLOCK 10 — RECOMMENDATIONS: SUMMARY

```python
print("\n▶  Block 10 — Recommendations: Summary")

VALID_HO_ACTIONS = {"review_bid", "join_group", "post_request"}
VALID_PR_ACTIONS = {"submit_bid", "check_feed"}

r = alice.get("/recommendations/summary")
check("Homeowner summary 200",         r.status_code == 200, r.text)
check("action is valid",               r.json().get("action") in VALID_HO_ACTIONS,
      f"action={r.json().get('action')}")
check("headline non-empty",            bool(r.json().get("headline")))

r = profix.get("/recommendations/summary")
check("Provider summary 200",          r.status_code == 200, r.text)
check("action is valid",               r.json().get("action") in VALID_PR_ACTIONS,
      f"action={r.json().get('action')}")
check("headline non-empty",            bool(r.json().get("headline")))
```

---

### BLOCK 11 — REQUEST WRITER (9a)

```python
print("\n▶  Block 11 — Request Writer (9a)")

r = alice.post("/ai/request-writer", {
    "description": "My kitchen sink has a really bad leak under the cabinet, water is dripping constantly and I think the pipe joint has failed"
})
check("Request writer 200",            r.status_code == 200, r.text)
check("category=plumbing",             r.json().get("category") == "plumbing",
      f"category={r.json().get('category')}")
check("title non-empty (≤60 chars)",
      bool(r.json().get("title")) and len(r.json().get("title","")) <= 60,
      f"title={r.json().get('title')!r}")
check("description non-empty",        bool(r.json().get("description")))
check("budget_min > 0",               (r.json().get("budget_min") or 0) > 0)
check("budget_max > budget_min",
      r.json().get("budget_max", 0) > r.json().get("budget_min", 0))
check("group_likelihood set",
      r.json().get("estimated_group_likelihood") in ("high","medium","low"),
      f"likelihood={r.json().get('estimated_group_likelihood')}")
check("group_reason non-empty",       bool(r.json().get("group_reason")))
check("stub=False",                    r.json().get("stub") == False,
      f"stub={r.json().get('stub')}")
```

---

### BLOCK 12 — BID DRAFTER (9b)

```python
print("\n▶  Block 12 — Bid Drafter (9b)")

r = profix.post("/ai/bid-drafter", {"request_id": alice_req2_id})
check("Bid drafter 200",               r.status_code == 200, r.text)
check("draft_text non-empty",          bool(r.json().get("draft_text")))
check("suggested_amount_cents > 0",    (r.json().get("suggested_amount_cents") or 0) > 0)
check("suggested_days 1–14",
      1 <= (r.json().get("suggested_days") or 0) <= 14,
      f"days={r.json().get('suggested_days')}")
check("headline non-empty",            bool(r.json().get("headline")))
check("confidence set",                r.json().get("confidence") in ("high","medium","low"),
      f"confidence={r.json().get('confidence')}")
check("stub=False",                    r.json().get("stub") == False,
      f"stub={r.json().get('stub')}")

r = alice.post("/ai/bid-drafter", {"request_id": alice_req2_id})
check("Homeowner blocked from bid drafter (403)", r.status_code == 403)
```

---

### BLOCK 13 — QUOTE SUMMARISER (9c)

```python
print("\n▶  Block 13 — Quote Summariser (9c)")

# Path A: plain text file → stub (not PDF or image)
text_file = io.BytesIO(b"This is a plain text file, not a quote PDF.")
r = http.post(
    f"{BASE}/ai/quote-summary",
    files={"file": ("quote.txt", text_file, "text/plain")},
    headers={"Authorization": f"Bearer {alice.token}"},
)
check("Quote summary returns 200 (text/plain stub path)", r.status_code == 200, r.text)
check("stub=True for non-PDF/image",  r.json().get("stub") == True,
      f"stub={r.json().get('stub')}")

# Path B: minimal 1×1 white JPEG → gpt-4o vision
# Minimal valid JPEG (1×1 white pixel)
jpeg_bytes = bytes([
    0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x00,0x00,0x01,
    0x00,0x01,0x00,0x00,0xFF,0xDB,0x00,0x43,0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,
    0x07,0x07,0x07,0x09,0x09,0x08,0x0A,0x0C,0x14,0x0D,0x0C,0x0B,0x0B,0x0C,0x19,0x12,
    0x13,0x0F,0x14,0x1D,0x1A,0x1F,0x1E,0x1D,0x1A,0x1C,0x1C,0x20,0x24,0x2E,0x27,0x20,
    0x22,0x2C,0x23,0x1C,0x1C,0x28,0x37,0x29,0x2C,0x30,0x31,0x34,0x34,0x34,0x1F,0x27,
    0x39,0x3D,0x38,0x32,0x3C,0x2E,0x33,0x34,0x32,0xFF,0xC0,0x00,0x0B,0x08,0x00,0x01,
    0x00,0x01,0x01,0x01,0x11,0x00,0xFF,0xC4,0x00,0x1F,0x00,0x00,0x01,0x05,0x01,0x01,
    0x01,0x01,0x01,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x02,0x03,0x04,
    0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0xFF,0xC4,0x00,0xB5,0x10,0x00,0x02,0x01,0x03,
    0x03,0x02,0x04,0x03,0x05,0x05,0x04,0x04,0x00,0x00,0x01,0x7D,0x01,0x02,0x03,0x00,
    0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,
    0x81,0x91,0xA1,0x08,0x23,0x42,0xB1,0xC1,0x15,0x52,0xD1,0xF0,0x24,0x33,0x62,0x72,
    0x82,0x09,0x0A,0x16,0x17,0x18,0x19,0x1A,0x25,0x26,0x27,0x28,0x29,0x2A,0x34,0x35,
    0x36,0x37,0x38,0x39,0x3A,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4A,0x53,0x54,0x55,
    0x56,0x57,0x58,0x59,0x5A,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6A,0x73,0x74,0x75,
    0x76,0x77,0x78,0x79,0x7A,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8A,0x92,0x93,0x94,
    0x95,0x96,0x97,0x98,0x99,0x9A,0xA2,0xA3,0xA4,0xA5,0xA6,0xA7,0xA8,0xA9,0xAA,0xB2,
    0xB3,0xB4,0xB5,0xB6,0xB7,0xB8,0xB9,0xBA,0xC2,0xC3,0xC4,0xC5,0xC6,0xC7,0xC8,0xC9,
    0xCA,0xD2,0xD3,0xD4,0xD5,0xD6,0xD7,0xD8,0xD9,0xDA,0xE1,0xE2,0xE3,0xE4,0xE5,0xE6,
    0xE7,0xE8,0xE9,0xEA,0xF1,0xF2,0xF3,0xF4,0xF5,0xF6,0xF7,0xF8,0xF9,0xFA,0xFF,0xDA,
    0x00,0x08,0x01,0x01,0x00,0x00,0x3F,0x00,0xFB,0x2A,0x28,0xA0,0x02,0x8A,0x28,0xA0,
    0xFF,0xD9
])
r = http.post(
    f"{BASE}/ai/quote-summary",
    files={"file": ("quote.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")},
    headers={"Authorization": f"Bearer {alice.token}"},
)
check("Quote summary image returns 200", r.status_code == 200, r.text)
check("provider_name field present",   "provider_name" in r.json())
check("recommendation non-empty",      bool(r.json().get("recommendation")))
info(f"Quote stub={r.json().get('stub')}, score={r.json().get('score')}")

r = http.post(
    f"{BASE}/ai/quote-summary",
    files={"file": ("q.txt", io.BytesIO(b"test"), "text/plain")},
    headers={"Authorization": f"Bearer {profix.token}"},
)
check("Provider blocked from quote summary (403)", r.status_code == 403)
```

---

### BLOCK 14 — SMART SCHEDULE (9d)

```python
print("\n▶  Block 14 — Smart Schedule (9d)")

# ProFix has an accepted bid → should produce real schedule
r = profix.post("/ai/smart-schedule", {"date": "2026-06-01"})
check("Smart schedule 200",            r.status_code == 200, r.text)
check("date field echoed",             r.json().get("date") == "2026-06-01")
check("items list present",            "items" in r.json())
check("total_hours present",           "total_hours" in r.json())
check("estimated_revenue_cents > 0",
      (r.json().get("estimated_revenue_cents") or 0) > 0,
      f"revenue={r.json().get('estimated_revenue_cents')}")
items = r.json().get("items", [])
if items:
    check("Item has title + suggested_start + duration_minutes",
          all("title" in i and "suggested_start" in i and "duration_minutes" in i for i in items))
    check("stub=False (AI scheduled)",  r.json().get("stub") == False,
          f"stub={r.json().get('stub')}")

# Provider with no accepted bids → stub
r = leafco.post("/ai/smart-schedule", {"date": "2026-06-01"})
check("No-accepted-bid provider → stub=True or empty",
      r.status_code == 200 and (r.json().get("stub") == True or r.json().get("items") == []))

r = alice.post("/ai/smart-schedule", {"date": "2026-06-01"})
check("Homeowner blocked from smart schedule (403)", r.status_code == 403)

r = profix.post("/ai/smart-schedule", {"date": "not-a-date"})
check("Invalid date → 422",            r.status_code == 422)
```

---

### BLOCK 15 — GROUP ALERTS (9e)

```python
print("\n▶  Block 15 — Group Alerts (9e)")

r = alice.post("/ai/run-group-alerts")
check("Group alerts 200",              r.status_code == 200, r.text)
check("created field is int",          isinstance(r.json().get("created"), int),
      f"created={r.json().get('created')}")
info(f"Notifications created: {r.json().get('created')}")
```

---

### BLOCK 16 — DISPUTE MEDIATOR (9f)

```python
print("\n▶  Block 16 — Dispute Mediator (9f)")

# profix_bid_id was accepted — now dispute it
r = alice.post(f"/ai/dispute/{profix_bid_id}", {
    "complaint": "ProFix left the job incomplete — sink is still leaking and they are not responding to my messages."
})
check("Dispute mediator 200",          r.status_code == 200, r.text)
check("summary non-empty",             bool(r.json().get("summary")))
check("homeowner_position non-empty",  bool(r.json().get("homeowner_position")))
check("provider_position non-empty",   bool(r.json().get("provider_position")))
opts = r.json().get("resolution_options", [])
check("≥2 resolution options",         len(opts) >= 2, f"got {len(opts)}")
VALID_TYPES = {"partial_refund", "revisit", "full_refund", "no_action"}
check("Option types are valid",        all(o.get("type") in VALID_TYPES for o in opts),
      f"types={[o.get('type') for o in opts]}")
check("recommendation set",            bool(r.json().get("recommendation")))
check("confidence set",                r.json().get("confidence") in ("high","medium","low"),
      f"confidence={r.json().get('confidence')}")
info(f"Dispute stub={r.json().get('stub')}, recommendation={r.json().get('recommendation')}")

# Cannot dispute someone else's bid
r = bob.post(f"/ai/dispute/{profix_bid_id}", {"complaint": "Not my bid but I want to dispute"})
check("Wrong homeowner blocked (403)", r.status_code == 403)

# Provider cannot dispute
r = profix.post(f"/ai/dispute/{profix_bid_id}", {"complaint": "I dispute my own bid"})
check("Provider blocked from dispute (403)", r.status_code == 403)
```

---

### BLOCK 17 — DEMAND FORECAST (9g)

```python
print("\n▶  Block 17 — Demand Forecast (9g)")

r = alice.get("/ai/demand-forecast", params={"neighborhood": NBHD})
check("Demand forecast 200",           r.status_code == 200, r.text)
check("neighborhood echoed",           r.json().get("neighborhood") == NBHD)
check("forecast_period set",           bool(r.json().get("forecast_period")))
preds = r.json().get("predictions", [])
check("predictions list ≥1",           len(preds) >= 1, f"got {len(preds)}")
check("Each prediction has category",  all("category" in p for p in preds))
check("predicted_requests 1–20",
      all(1 <= (p.get("predicted_requests") or 1) <= 20 for p in preds),
      f"values={[p.get('predicted_requests') for p in preds]}")
check("confidence values valid",
      all(p.get("confidence") in ("high","medium","low") for p in preds))
check("top_opportunity non-empty",     bool(r.json().get("top_opportunity")))
info(f"Forecast stub={r.json().get('stub')}, predictions={len(preds)}")
```

---

### FINAL SUMMARY

```python
print("\n" + "═"*70)
passed = sum(1 for _, ok in results if ok)
failed = sum(1 for _, ok in results if not ok)
total  = len(results)
print(f"  Results: {passed}/{total} passed  ({failed} failed)")
print("═"*70)
if failed:
    print("\n  Failed tests:")
    for label, ok in results:
        if not ok:
            print(f"    {FAIL}  {label}")
sys.exit(0 if failed == 0 else 1)
```

---

## Verification

After writing the file, run:
```bash
cd /Users/lancedsilva/Documents/neighbid-claude-codex-starter
source api/.venv/bin/activate
python3 tests/test_ai_features.py
```

Fix any failures. The AI endpoints make real OpenAI calls so allow up to 90 seconds.
`stub=False` checks require OPENAI_API_KEY in `api/.env` — it is already set.

## Task Update Log
- 2026-05-08 — Task written and approved. Delegated to Codex.
