import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, status
from jose import JWTError, jwt

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_jwks_cache: dict = {}


def _get_jwks() -> dict:
    global _jwks_cache

    if not _jwks_cache:
        if not SUPABASE_URL:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        response = httpx.get(
            f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json",
            timeout=10,
        )
        response.raise_for_status()
        _jwks_cache = response.json()

    return _jwks_cache


def verify_supabase_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            _get_jwks(),
            algorithms=["ES256"],
            audience="authenticated",
            options={"verify_aud": False},
        )
    except (JWTError, httpx.HTTPError, ValueError, TypeError) as exc:
        raise credentials_exception from exc

    if not isinstance(payload, dict):
        raise credentials_exception

    return payload
