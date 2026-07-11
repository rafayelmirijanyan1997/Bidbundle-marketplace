from collections import Counter

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from dependencies import get_db, require_role
from models.bid import Bid
from models.community import ActivityLog, CommunityMember, HOA, MembershipRequest
from models.request import ServiceRequest
from models.user import User
from schemas.community import ActivityLogOut, AdminStatsOut, SavingsCategoryOut, SavingsReportOut


class ResidentInterestOut(BaseModel):
    category: str
    count: int

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/reports/savings", response_model=SavingsReportOut)
def get_savings_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
) -> SavingsReportOut:
    rows = (
        db.query(
            ServiceRequest.category.label("name"),
            func.sum(Bid.amount).label("saved"),
            func.count(Bid.id).label("bids"),
        )
        .join(ServiceRequest, ServiceRequest.id == Bid.request_id)
        .filter(ServiceRequest.status == "closed")
        .group_by(ServiceRequest.category)
        .order_by(ServiceRequest.category.asc())
        .all()
    )

    categories = [
        SavingsCategoryOut(
            name=row.name,
            saved=int(row.saved or 0),
            bids=int(row.bids or 0),
        )
        for row in rows
    ]
    total = sum(category.saved for category in categories)
    return SavingsReportOut(categories=categories, total=total)


@router.get("/activity", response_model=list[ActivityLogOut])
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
) -> list[ActivityLogOut]:
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(20).all()


@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
) -> AdminStatsOut:
    total_members = db.query(func.count(CommunityMember.id)).scalar() or 0
    active_bids = db.query(func.count(ServiceRequest.id)).filter(ServiceRequest.status == "live").scalar() or 0
    total_savings = db.query(func.sum(Bid.amount)).filter(Bid.status == "accepted").scalar() or 0

    return AdminStatsOut(
        total_members=int(total_members),
        active_bids=int(active_bids),
        monthly_savings=int(total_savings),
        total_savings_all_time=int(total_savings),
    )


@router.get("/resident-service-interests", response_model=list[ResidentInterestOut])
def get_resident_service_interests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
) -> list[ResidentInterestOut]:
    hoa = db.query(HOA).filter(HOA.admin_user_id == current_user.id).first()
    if hoa is None:
        return []
    interests_rows = (
        db.query(User.service_interests)
        .join(MembershipRequest, MembershipRequest.user_id == User.id)
        .filter(MembershipRequest.hoa_id == hoa.id, MembershipRequest.status == "approved")
        .all()
    )
    counter: Counter = Counter()
    for (service_interests,) in interests_rows:
        if service_interests:
            for cat in service_interests.split(","):
                cat = cat.strip()
                if cat:
                    counter[cat] += 1
    return [
        ResidentInterestOut(category=cat, count=cnt)
        for cat, cnt in counter.most_common()
    ]
