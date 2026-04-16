from datetime import datetime, timedelta, timezone

import jwt

from app.config import get_settings


ALGORITHM = "HS256"


def issue_session_token(payload: dict, ttl_hours: int = 24) -> str:
    settings = get_settings()
    body = payload.copy()
    body["exp"] = datetime.now(timezone.utc) + timedelta(hours=ttl_hours)
    return jwt.encode(body, settings.jwt_secret, algorithm=ALGORITHM)


def decode_session_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
