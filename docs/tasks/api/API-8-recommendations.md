# API-8 — Recommendation Engine

**Status:** Completed

## Goal

Build a pure-Python scoring engine + 5 REST endpoints that give homeowners ranked
bid recommendations and give providers a personalised job feed.
No new DB tables. All scores computed from existing data on request.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `api/services/recommender.py` | CREATE — all scoring logic |
| `api/routers/recommendations.py` | CREATE — 5 endpoints |
| `api/main.py` | Register recommendations router |
| `api/routers/provider.py` | Add match_pct + reason to job feed response |

---

## Step 1 — `api/services/recommender.py`

```python
"""
NeighBid Recommendation Engine
Pure functions — no side effects, no DB writes.
All functions receive a SQLAlchemy session and return plain dicts.
"""
from __future__ import annotations

import statistics
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from models.bid import Bid
from models.provider_profile import ProviderProfile
from models.request import ServiceRequest
from models.review import Review
from models.user import User


# ── Helpers ───────────────────────────────────────────────────

def _provider_stats(db: Session, provider_id: int) -> dict:
    """Return avg_rating, win_rate, total_jobs for a provider."""
    all_bids = db.query(Bid).filter(Bid.provider_id == provider_id).all()
    accepted = [b for b in all_bids if b.status == "accepted"]
    reviews = db.query(Review).filter(Review.provider_id == provider_id).all()
    avg_rating = (
        round(sum(r.stars for r in reviews) / len(reviews), 2)
        if reviews else None
    )
    win_rate = round(len(accepted) / len(all_bids), 3) if all_bids else None
    return {
        "avg_rating": avg_rating,
        "win_rate": win_rate,
        "total_jobs": len(accepted),
        "total_bids": len(all_bids),
    }


def _clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def _hours_until(dt: Optional[datetime]) -> Optional[float]:
    if dt is None:
        return None
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        from datetime import timezone as tz
        dt = dt.replace(tzinfo=tz.utc)
    delta = (dt - now).total_seconds() / 3600
    return max(delta, 0.0)


# ── Bid Scoring (homeowner: which bid to accept) ──────────────

def score_bid(
    bid: Bid,
    request: ServiceRequest,
    provider_stats: dict,
) -> dict:
    """
    Score a single bid 0–100. Returns score + sub-scores + reason string.

    Weights:
      35% price (below budget = better)
      20% rating
      20% speed (fewer days = better)
      15% win_rate (provider track record)
      10% savings (below budget_min)
    """
    budget_range = request.budget_max - request.budget_min
    if budget_range <= 0:
        budget_range = max(request.budget_min, 1)

    # Price: 1.0 = at/below budget_min, 0.0 = at/above budget_max
    price_norm = _clamp((request.budget_max - bid.amount) / budget_range)

    # Savings: how far below budget_min (bonus signal)
    savings_norm = _clamp(max(0, request.budget_min - bid.amount) / max(request.budget_min, 1))

    # Rating: 0-1, default 0.7 if no reviews yet
    rating = provider_stats.get("avg_rating")
    rating_norm = (rating / 5.0) if rating is not None else 0.7

    # Speed: inverse of days, cap at 10 days
    speed_norm = _clamp(1.0 - (bid.estimated_days - 1) / 9.0)

    # Win rate: default 0.5 if no history
    win_rate = provider_stats.get("win_rate")
    win_norm = win_rate if win_rate is not None else 0.5

    score = round((
        0.35 * price_norm
        + 0.20 * rating_norm
        + 0.20 * speed_norm
        + 0.15 * win_norm
        + 0.10 * savings_norm
    ) * 100, 1)

    # Build reason string
    parts = []
    if bid.amount <= request.budget_min:
        parts.append("Below budget")
    elif bid.amount <= request.budget_max:
        saving = request.budget_min - bid.amount
        if saving > 0:
            parts.append(f"${abs(saving)//100} under budget")
    if rating is not None:
        parts.append(f"{rating}★")
    elif provider_stats.get("total_jobs", 0) == 0:
        parts.append("New provider")
    parts.append(f"{bid.estimated_days}d est.")

    return {
        "bid_id": bid.id,
        "provider_id": bid.provider_id,
        "amount_cents": bid.amount,
        "estimated_days": bid.estimated_days,
        "score": score,
        "sub_scores": {
            "price": round(price_norm * 100, 1),
            "rating": round(rating_norm * 100, 1),
            "speed": round(speed_norm * 100, 1),
            "win_rate": round(win_norm * 100, 1),
            "savings": round(savings_norm * 100, 1),
        },
        "reason": " · ".join(parts) if parts else "—",
        "provider_stats": provider_stats,
    }


def rank_bids_for_request(db: Session, request_id: int) -> list[dict]:
    """
    Return all pending bids on a request, ranked by score descending.
    Also returns accepted/declined bids at the bottom (score=None).
    """
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if req is None:
        return []

    bids = db.query(Bid).filter(Bid.request_id == request_id).all()
    scored = []
    unscored = []

    for bid in bids:
        provider = db.query(User).filter(User.id == bid.provider_id).first()
        stats = _provider_stats(db, bid.provider_id)
        entry = score_bid(bid, req, stats)
        entry["provider_name"] = provider.full_name if provider else "Unknown"
        entry["bid_status"] = bid.status

        if bid.status == "pending":
            scored.append(entry)
        else:
            entry["score"] = None
            unscored.append(entry)

    scored.sort(key=lambda x: x["score"], reverse=True)

    # Tag the top result
    if scored:
        scored[0]["is_top_pick"] = True
    for item in scored[1:]:
        item["is_top_pick"] = False
    for item in unscored:
        item["is_top_pick"] = False

    return scored + unscored


# ── Job Match Score (provider: ranked feed) ───────────────────

def score_job_for_provider(
    request: ServiceRequest,
    provider_profile: Optional[ProviderProfile],
    bid_count: int,
) -> dict:
    """
    Score a service request for a given provider 0–100.

    Weights:
      40% trade match (is this the provider's category?)
      25% group activity (bid_count as proxy for active group)
      20% budget ceiling (higher ceiling = more revenue potential)
      15% urgency (closing soon = act now)
    """
    # Trade match
    trades = (provider_profile.trades if provider_profile else "") or ""
    trade_list = [t.strip().lower() for t in trades.split(",") if t.strip()]
    category = request.category.lower()
    trade_match = 1.0 if any(category in t or t in category for t in trade_list) else 0.4

    # Group activity: 5+ bids = fully active group
    group_norm = _clamp(bid_count / 5.0)

    # Budget ceiling: normalise to $2000 ceiling
    budget_norm = _clamp(request.budget_max / 200000)

    # Urgency
    hours = _hours_until(request.closes_at)
    if hours is None:
        urgency = 0.3
    elif hours <= 12:
        urgency = 1.0
    elif hours <= 48:
        urgency = 0.7
    elif hours <= 168:
        urgency = 0.4
    else:
        urgency = 0.2

    score = round((
        0.40 * trade_match
        + 0.25 * group_norm
        + 0.20 * budget_norm
        + 0.15 * urgency
    ) * 100, 1)

    # Reason
    parts = []
    if trade_match == 1.0:
        parts.append("Trade match")
    if bid_count >= 3:
        parts.append(f"{bid_count} bids active")
    if hours is not None and hours <= 48:
        parts.append(f"Closes in {int(hours)}h")
    if not parts:
        parts.append(f"${request.budget_max // 100} ceiling")

    return {
        "request_id": request.id,
        "title": request.title,
        "category": request.category,
        "neighborhood": request.neighborhood,
        "status": request.status,
        "budget_min": request.budget_min,
        "budget_max": request.budget_max,
        "bid_count": bid_count,
        "closes_at": request.closes_at.isoformat() if request.closes_at else None,
        "created_at": request.created_at.isoformat(),
        "match_pct": score,
        "reason": " · ".join(parts),
        "sub_scores": {
            "trade_match": round(trade_match * 100, 1),
            "group_activity": round(group_norm * 100, 1),
            "budget": round(budget_norm * 100, 1),
            "urgency": round(urgency * 100, 1),
        },
    }


def ranked_job_feed(
    db: Session,
    provider_id: int,
    category: Optional[str] = None,
) -> list[dict]:
    """Return live/grouping requests ranked by match score for a provider."""
    profile = db.query(ProviderProfile).filter(
        ProviderProfile.user_id == provider_id
    ).first()

    query = db.query(ServiceRequest).filter(
        ServiceRequest.status.in_(["live", "grouping"])
    )
    if category:
        query = query.filter(ServiceRequest.category == category)
    requests = query.all()

    results = []
    for req in requests:
        bid_count = db.query(Bid).filter(Bid.request_id == req.id).count()
        entry = score_job_for_provider(req, profile, bid_count)
        results.append(entry)

    results.sort(key=lambda x: x["match_pct"], reverse=True)
    return results


# ── Bid Price Suggestion (provider) ──────────────────────────

def suggest_bid_price(db: Session, request_id: int) -> dict:
    """
    Suggest a price range for a provider to bid on a request.
    Uses the distribution of accepted bids in the same category as signal.
    Falls back to budget percentiles if no history.
    """
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if req is None:
        return {"error": "Request not found"}

    # Accepted bids in the same category (across all requests)
    same_cat_bids = (
        db.query(Bid)
        .join(ServiceRequest, Bid.request_id == ServiceRequest.id)
        .filter(
            ServiceRequest.category == req.category,
            Bid.status == "accepted",
        )
        .all()
    )

    amounts = [b.amount for b in same_cat_bids if b.amount > 0]
    confidence = "high" if len(amounts) >= 5 else "medium" if len(amounts) >= 2 else "low"

    if len(amounts) >= 2:
        amounts.sort()
        n = len(amounts)
        low  = amounts[max(0, int(n * 0.25))]
        high = amounts[min(n - 1, int(n * 0.60))]
    else:
        # Fallback: 80–92% of budget range
        low  = int(req.budget_min * 0.82)
        high = int(req.budget_max * 0.90)

    # Nudge: if low == high (only 1 sample), add 10% spread
    if low >= high:
        low  = int(low * 0.92)
        high = int(high * 1.08)

    return {
        "request_id": request_id,
        "category": req.category,
        "budget_min": req.budget_min,
        "budget_max": req.budget_max,
        "suggested_low_cents": low,
        "suggested_high_cents": high,
        "confidence": confidence,
        "sample_size": len(amounts),
        "reason": (
            f"Based on {len(amounts)} accepted bids in {req.category}"
            if amounts else
            f"Based on request budget (no history for {req.category} yet)"
        ),
    }


# ── Group Opportunities (homeowner: join nearby groups) ───────

def group_opportunities(db: Session, user_id: int, limit: int = 5) -> list[dict]:
    """
    Return live requests in the same neighborhood as the homeowner's own requests
    that they have NOT posted themselves — these are groups they could join.
    """
    my_requests = db.query(ServiceRequest).filter(
        ServiceRequest.user_id == user_id
    ).all()

    my_neighborhoods = list({r.neighborhood for r in my_requests if r.neighborhood})
    my_categories    = list({r.category     for r in my_requests})
    my_ids           = {r.id for r in my_requests}

    if not my_neighborhoods:
        return []

    candidates = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.neighborhood.in_(my_neighborhoods),
            ServiceRequest.status.in_(["live", "grouping"]),
            ServiceRequest.user_id != user_id,
        )
        .all()
    )

    results = []
    for req in candidates:
        bid_count = db.query(Bid).filter(Bid.request_id == req.id).count()
        # Bonus relevance if same category as one of their own requests
        category_match = req.category in my_categories
        results.append({
            "request_id": req.id,
            "title": req.title,
            "category": req.category,
            "neighborhood": req.neighborhood,
            "status": req.status,
            "budget_min": req.budget_min,
            "budget_max": req.budget_max,
            "bid_count": bid_count,
            "category_match": category_match,
            "reason": (
                f"Same category as your {req.category} request · {bid_count} bids"
                if category_match else
                f"{bid_count} neighbors joined · {req.neighborhood}"
            ),
        })

    # Sort: category match first, then by bid_count desc
    results.sort(key=lambda x: (x["category_match"], x["bid_count"]), reverse=True)
    return results[:limit]


# ── Dashboard Summary (both roles) ───────────────────────────

def recommendation_summary(db: Session, user: User) -> dict:
    """
    One-call summary for the dashboard widget.
    Returns the top action for the current user.
    """
    if user.role == "homeowner":
        # Find their request with the most pending bids
        my_reqs = db.query(ServiceRequest).filter(
            ServiceRequest.user_id == user.id,
            ServiceRequest.status.in_(["live", "grouping"]),
        ).all()

        best_req = None
        best_bid_entry = None
        best_score = -1

        for req in my_reqs:
            ranked = rank_bids_for_request(db, req.id)
            if ranked and ranked[0].get("score") is not None:
                if ranked[0]["score"] > best_score:
                    best_score = ranked[0]["score"]
                    best_req = req
                    best_bid_entry = ranked[0]

        if best_bid_entry:
            return {
                "role": "homeowner",
                "action": "review_bid",
                "headline": (
                    f"{best_bid_entry['provider_name']} is your top pick for "
                    f"\"{best_req.title}\" — score {best_bid_entry['score']}/100"
                ),
                "sub": best_bid_entry["reason"],
                "request_id": best_req.id,
                "bid_id": best_bid_entry["bid_id"],
                "score": best_bid_entry["score"],
            }

        groups = group_opportunities(db, user.id, limit=1)
        if groups:
            g = groups[0]
            return {
                "role": "homeowner",
                "action": "join_group",
                "headline": f"Join a {g['category']} group in {g['neighborhood']}",
                "sub": g["reason"],
                "request_id": g["request_id"],
                "score": None,
            }

        return {
            "role": "homeowner",
            "action": "post_request",
            "headline": "Post your first service request to start saving",
            "sub": "Neighbours in your area are grouping requests right now",
            "score": None,
        }

    else:  # provider
        jobs = ranked_job_feed(db, user.id)
        if jobs:
            top = jobs[0]
            return {
                "role": "provider",
                "action": "submit_bid",
                "headline": f"Top match: \"{top['title']}\" — {top['match_pct']}% fit",
                "sub": top["reason"],
                "request_id": top["request_id"],
                "score": top["match_pct"],
            }
        return {
            "role": "provider",
            "action": "check_feed",
            "headline": "New group jobs are posted daily in your area",
            "sub": "Check the job feed to find your next opportunity",
            "score": None,
        }
```

---

## Step 2 — `api/routers/recommendations.py`

```python
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db, require_role
from models.user import User
from services.recommender import (
    group_opportunities,
    rank_bids_for_request,
    ranked_job_feed,
    recommendation_summary,
    suggest_bid_price,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/bids/{request_id}")
def get_bid_recommendations(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> dict:
    """
    Ranked bids for a homeowner's service request.
    Top bid has is_top_pick=True and the highest score.
    """
    ranked = rank_bids_for_request(db, request_id)
    return {
        "request_id": request_id,
        "total": len(ranked),
        "bids": ranked,
    }


@router.get("/jobs")
def get_job_recommendations(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> dict:
    """
    Personalised, ranked job feed for the provider.
    Each entry includes match_pct (0-100) and a reason string.
    """
    jobs = ranked_job_feed(db, current_user.id, category=category)
    return {
        "provider_id": current_user.id,
        "total": len(jobs),
        "jobs": jobs,
    }


@router.get("/bid-price/{request_id}")
def get_bid_price_suggestion(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> dict:
    """
    Suggest a winning price range for a provider to bid on a request.
    Uses distribution of accepted bids in the same category.
    """
    return suggest_bid_price(db, request_id)


@router.get("/groups")
def get_group_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner")),
) -> dict:
    """
    Nearby group bid opportunities the homeowner could join.
    Filters to their own neighborhood and sorts by category relevance.
    """
    opps = group_opportunities(db, current_user.id)
    return {
        "user_id": current_user.id,
        "total": len(opps),
        "opportunities": opps,
    }


@router.get("/summary")
def get_recommendation_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Single top recommendation for the dashboard nudge card.
    Works for both homeowners and providers.
    Returns action, headline, sub-text, and relevant IDs.
    """
    return recommendation_summary(db, current_user)
```

---

## Step 3 — Register router in `api/main.py`

Add import:
```python
from routers.recommendations import router as recommendations_router
```
Add:
```python
app.include_router(recommendations_router)
```

---

## Step 4 — Wire match_pct into `/provider/job-feed`

In `api/routers/provider.py`, update `job_feed()` to use the recommender:

Find the current `job_feed` function and replace it with:

```python
@router.get("/job-feed", response_model=list[JobFeedItemOut])
def job_feed(
    category: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> list[JobFeedItemOut]:
    from services.recommender import ranked_job_feed
    results = ranked_job_feed(db, current_user.id, category=category)
    # Apply optional neighborhood filter
    if neighborhood:
        results = [r for r in results if r["neighborhood"] == neighborhood]
    return [
        JobFeedItemOut(
            id=r["request_id"],
            title=r["title"],
            category=r["category"],
            neighborhood=r["neighborhood"],
            status=r["status"],
            budget_min=r["budget_min"],
            budget_max=r["budget_max"],
            bid_count=r["bid_count"],
            created_at=r["created_at"],
            closes_at=r["closes_at"],
        )
        for r in results
    ]
```

Note: `JobFeedItemOut` doesn't currently include `match_pct`. The frontend reads it from
`/recommendations/jobs` which returns the full scored payload. The job-feed endpoint
keeps its existing schema for backwards compatibility.

---

## Acceptance Criteria

- [ ] `GET /recommendations/bids/{id}` returns ranked bids with score, sub_scores, reason, is_top_pick
- [ ] Top bid has highest score and `is_top_pick: true`
- [ ] `GET /recommendations/jobs` returns ranked jobs with match_pct and reason
- [ ] Trade-matching requests score higher than non-matching
- [ ] `GET /recommendations/bid-price/{id}` returns suggested_low, suggested_high, confidence
- [ ] `GET /recommendations/groups` returns nearby group opportunities
- [ ] `GET /recommendations/summary` returns correct action for homeowner (review_bid) and provider (submit_bid)
- [ ] No DB migration required — all scores computed from existing tables
- [ ] `python -c "from main import app; print('OK')"` passes

## Task Update Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-05-07 | Approved | Spec written by Claude |
| 2026-05-07 | Completed | Codex implemented recommender.py + router. All 5 endpoints verified. Trade-match scoring confirmed: ProFix 56.5% > QuickFix 32.5% for plumbing; reverses for gutter. |
