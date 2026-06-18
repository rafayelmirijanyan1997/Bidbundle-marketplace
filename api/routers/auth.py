import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from dependencies import get_db, get_token_payload
from models.community import HOA, Invite, MembershipRequest
from models.user import User
from schemas.community import ValidateInviteOut
from schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


class SyncIn(BaseModel):
    role: str
    full_name: str | None = None
    phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class HoaRegisterIn(BaseModel):
    email: str
    full_name: str
    community_name: str
    community_type: str
    community_address: str
    unit_count: int | None = None


class AcceptInviteIn(BaseModel):
    invite_code: str
    email: str
    full_name: str
    unit_number: str | None = None


class ValidateInviteIn(BaseModel):
    code: str


def _set_supabase_uid(db: Session, user_id: int, supabase_uid: str) -> None:
    db.execute(
        text("UPDATE users SET supabase_uid = :supabase_uid WHERE id = :user_id"),
        {"supabase_uid": supabase_uid, "user_id": user_id},
    )
    db.commit()


@router.post("/sync", response_model=UserOut)
def sync_user(
    payload: SyncIn,
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    supabase_uid = token_payload.get("sub")
    email = token_payload.get("email", "")

    if not supabase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = (
        db.query(User)
        .filter(text("supabase_uid = :supabase_uid"))
        .params(supabase_uid=supabase_uid)
        .first()
    )

    if user is None:
        user = db.query(User).filter(User.email == email).first()
        if user is not None:
            _set_supabase_uid(db, user.id, supabase_uid)
            db.refresh(user)

    if user is None:
        user = User(
            email=email,
            hashed_password=None,  # type: ignore[arg-type]
            full_name=payload.full_name or email.split("@")[0],
            phone=payload.phone,
            role=payload.role,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        db.add(user)
        db.flush()
        _set_supabase_uid(db, user.id, supabase_uid)
        db.refresh(user)

        if payload.latitude is not None and payload.longitude is not None:
            from services.neighbourhood import auto_join_neighbourhood_channel, find_or_create_neighbourhood

            neighbourhood = find_or_create_neighbourhood(payload.latitude, payload.longitude, db)
            user.neighbourhood_id = neighbourhood.id
            user.neighborhood = neighbourhood.name
            db.commit()
            db.refresh(user)
            auto_join_neighbourhood_channel(user, neighbourhood, db)

    return user


@router.post("/register-hoa", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_hoa(
    payload: HoaRegisterIn,
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=None,  # type: ignore[arg-type]
        full_name=payload.full_name,
        role="admin",
        supabase_uid=token_payload.get("sub"),
    )
    db.add(user)
    db.flush()

    master_code = secrets.token_urlsafe(6)
    hoa = HOA(
        name=payload.community_name,
        neighborhood=payload.community_address,
        admin_user_id=user.id,
        type=payload.community_type,
        unit_count=payload.unit_count,
        master_invite_code=master_code,
    )
    db.add(hoa)
    db.commit()
    db.refresh(user)
    return user


@router.post("/validate-invite", response_model=ValidateInviteOut)
def validate_invite(payload: ValidateInviteIn, db: Session = Depends(get_db)) -> ValidateInviteOut:
    invite = db.query(Invite).filter(Invite.code == payload.code).first()
    if invite is not None:
        if invite.status != "pending" or invite.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite code expired or already used")
        hoa = db.query(HOA).filter(HOA.id == invite.hoa_id).first()
        return ValidateInviteOut(
            community_name=hoa.name if hoa else "Unknown Community",
            community_type=hoa.type if hoa else None,
            unit_number=invite.unit_number,
            invite_id=invite.id,
        )

    hoa = db.query(HOA).filter(HOA.master_invite_code == payload.code).first()
    if hoa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite code not found")
    return ValidateInviteOut(
        community_name=hoa.name,
        community_type=hoa.type,
        unit_number=None,
        invite_id=None,
    )


@router.post("/accept-invite", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def accept_invite(
    payload: AcceptInviteIn,
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    invite = db.query(Invite).filter(Invite.code == payload.invite_code).first()
    hoa: HOA | None = None

    if invite is not None:
        if invite.status != "pending" or invite.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite code expired or already used")
        hoa = db.query(HOA).filter(HOA.id == invite.hoa_id).first()
        unit = payload.unit_number or invite.unit_number
        invite.status = "accepted"
    else:
        hoa = db.query(HOA).filter(HOA.master_invite_code == payload.invite_code).first()
        if hoa is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite code not found")
        unit = payload.unit_number

    user = User(
        email=payload.email,
        hashed_password=None,  # type: ignore[arg-type]
        full_name=payload.full_name,
        role="hoa_homeowner",
        community_id=None,
        unit_number=unit,
        neighborhood=hoa.name if hoa else None,
        supabase_uid=token_payload.get("sub"),
    )
    db.add(user)
    db.flush()

    if hoa:
        db.add(MembershipRequest(user_id=user.id, hoa_id=hoa.id, status="pending"))

    db.commit()
    db.refresh(user)
    return user
