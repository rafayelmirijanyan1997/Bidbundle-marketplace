from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy.orm import Session

from dependencies import require_role, get_db
from models.bid import Bid
from models.message import ChannelMember, GroupChannel
from models.notification import Notification
from models.schedule_item import ScheduleItem
from models.request import ServiceRequest
from models.user import User
from schemas.bid import BidCreate, BidOut

router = APIRouter(tags=["bids"])


def _get_bid_or_404(db: Session, bid_id: int) -> Bid:
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if bid is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Bid not found")
    return bid


def _get_request_or_404(db: Session, request_id: int) -> ServiceRequest:
    service_request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if service_request is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Request not found")
    return service_request


def _require_bid_decision_access(current_user: User, service_request: ServiceRequest) -> None:
    """
    Only the request's owner may accept/decline bids on it.

    For an individually-created request that's the homeowner who made it.
    For a community request launched from an HOA poll (see launch_poll_bid
    in hoa_community.py), the "owner" is the admin who launched it —
    ServiceRequest.user_id is set to that admin's id at creation time, so
    today this remains a single identity check either way. There is no
    independent ServiceRequest -> HOA link in the schema; this relies on
    that launch_poll_bid convention. If HOAs ever support co-managers (or
    a poll-launched request's owner can change), this needs a real
    "does this admin manage the HOA behind this request" check instead of
    an identity comparison.
    """
    if current_user.id != service_request.user_id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.get("/requests/{id}/bids", response_model=list[BidOut])
def list_bids(id: int, db: Session = Depends(get_db)) -> list[BidOut]:
    _get_request_or_404(db, id)
    return db.query(Bid).filter(Bid.request_id == id).order_by(Bid.created_at.desc()).all()


@router.post("/requests/{id}/bids", response_model=BidOut, status_code=http_status.HTTP_201_CREATED)
def create_bid(
    id: int,
    payload: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("provider")),
) -> BidOut:
    service_request = _get_request_or_404(db, id)
    work_days = sorted({value for value in payload.work_days if value})
    if not work_days:
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Select at least one work day for this bid.",
        )

    existing_bids = (
        db.query(Bid)
        .filter(Bid.request_id == id, Bid.provider_id == current_user.id)
        .order_by(Bid.created_at.desc(), Bid.id.desc())
        .all()
    )
    bid = existing_bids[0] if existing_bids else None
    for duplicate in existing_bids[1:]:
        db.delete(duplicate)
    if bid is not None:
        bid.amount = payload.amount
        bid.estimated_days = len(work_days)
        bid.work_days = work_days
        bid.status = "pending"
    else:
        bid = Bid(
            request_id=id,
            provider_id=current_user.id,
            amount=payload.amount,
            estimated_days=len(work_days),
        )
        bid.work_days = work_days
    db.add(bid)
    db.commit()
    db.refresh(bid)

    # Get or create the group channel for this request
    channel = db.query(GroupChannel).filter(GroupChannel.request_id == id).first()
    if channel is None:
        channel = GroupChannel(request_id=id)
        db.add(channel)
        db.commit()
        db.refresh(channel)

    # Add all homeowners whose requests share the same category + neighbourhood
    # so every neighbour with a matching need can chat in the group channel
    if service_request:
        matching_reqs = (
            db.query(ServiceRequest)
            .filter(
                ServiceRequest.category == service_request.category,
                ServiceRequest.neighborhood == service_request.neighborhood,
                ServiceRequest.status.in_(["live", "grouping"]),
            )
            .all()
        )
        for mr in matching_reqs:
            already = db.query(ChannelMember).filter(
                ChannelMember.channel_id == channel.id,
                ChannelMember.user_id == mr.user_id,
            ).first()
            if not already:
                db.add(ChannelMember(channel_id=channel.id, user_id=mr.user_id))

    # Add provider as member if not already
    existing = db.query(ChannelMember).filter(
        ChannelMember.channel_id == channel.id,
        ChannelMember.user_id == current_user.id,
    ).first()
    if not existing:
        db.add(ChannelMember(channel_id=channel.id, user_id=current_user.id))

    existing_holds = (
        db.query(ScheduleItem)
        .filter(
            ScheduleItem.provider_id == current_user.id,
            ScheduleItem.request_id == id,
            ScheduleItem.status == "blocked",
        )
        .all()
    )
    for hold in existing_holds:
        db.delete(hold)

    for work_day in work_days:
        hold_at = datetime.fromisoformat(f"{work_day}T09:00:00")
        db.add(
            ScheduleItem(
                provider_id=current_user.id,
                request_id=id,
                title=f"Temporary hold — {service_request.title}",
                address=service_request.neighborhood,
                scheduled_at=hold_at,
                duration_minutes=8 * 60,
                status="blocked",
            )
        )

    db.commit()
    return bid


@router.put("/bids/{id}/accept", response_model=BidOut)
def accept_bid(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner", "hoa_homeowner", "admin")),
) -> BidOut:
    bid = _get_bid_or_404(db, id)
    service_request = _get_request_or_404(db, bid.request_id)
    _require_bid_decision_access(current_user, service_request)

    same_request_bids = db.query(Bid).filter(Bid.request_id == service_request.id).all()
    for existing_bid in same_request_bids:
        existing_bid.status = "accepted" if existing_bid.id == bid.id else "declined"
        db.add(existing_bid)
        db.query(ScheduleItem).filter(
            ScheduleItem.provider_id == existing_bid.provider_id,
            ScheduleItem.request_id == service_request.id,
            ScheduleItem.status == "blocked",
        ).delete()

    service_request.status = "closed"
    db.add(service_request)
    _channel = db.query(GroupChannel).filter(GroupChannel.request_id == service_request.id).first()
    if _channel:
        _channel.expires_at = datetime.utcnow() + timedelta(days=30)
        db.add(_channel)

    db.add(
        Notification(
            user_id=bid.provider_id,
            type="bid_accepted",
            title="You won the bid!",
            body=f'Your bid on "{service_request.title}" was accepted. You are the winning provider.',
            action_url="/app/provider/bids",
        )
    )

    db.commit()
    db.refresh(bid)
    return bid


@router.put("/bids/{id}/decline", response_model=BidOut)
def decline_bid(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("homeowner", "hoa_homeowner", "admin")),
) -> BidOut:
    bid = _get_bid_or_404(db, id)
    service_request = _get_request_or_404(db, bid.request_id)
    _require_bid_decision_access(current_user, service_request)

    bid.status = "declined"
    db.add(bid)
    db.query(ScheduleItem).filter(
        ScheduleItem.provider_id == bid.provider_id,
        ScheduleItem.request_id == service_request.id,
        ScheduleItem.status == "blocked",
    ).delete()
    db.commit()
    db.refresh(bid)
    return bid
