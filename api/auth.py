import logging
import os

from dotenv import load_dotenv

logger = logging.getLogger("uvicorn.error")
from fastapi import HTTPException, status
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

load_dotenv()

FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH", "./firebase-service-account.json"
)


def _ensure_initialized() -> None:
    # Deferred to first use (not import time) so a missing/invalid service
    # account only breaks token verification, not the whole process — e.g.
    # /health and every non-auth route still boot fine.
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH))


def verify_firebase_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        _ensure_initialized()
        payload = firebase_auth.verify_id_token(token)
    except Exception as exc:
        logger.error("verify_firebase_token failed: %r", exc)
        raise credentials_exception from exc

    if not isinstance(payload, dict):
        raise credentials_exception

    return payload
