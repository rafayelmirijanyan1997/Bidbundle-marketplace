from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth import verify_firebase_token
from database import SessionLocal
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/sync")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = verify_firebase_token(token)
    firebase_uid = payload.get("uid")
    user = (
        db.query(User)
        .filter(text("firebase_uid = :firebase_uid"))
        .params(firebase_uid=firebase_uid)
        .first()
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Call /auth/sync first.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    return verify_firebase_token(token)


def require_role(*roles: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
