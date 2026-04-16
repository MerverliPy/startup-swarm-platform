from typing import Annotated

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.auth.security import decode_session_token, issue_session_token
from app.config import get_settings

router = APIRouter(tags=["auth"])


class SessionExchangeRequest(BaseModel):
    provider: str = "github"
    provider_user_id: str
    login: str
    avatar_url: str | None = None
    name: str | None = None


class SessionExchangeResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400


@router.post("/auth/session/exchange", response_model=SessionExchangeResponse)
def exchange_session(
    payload: SessionExchangeRequest,
    x_platform_internal_key: Annotated[str | None, Header()] = None,
) -> SessionExchangeResponse:
    settings = get_settings()
    if x_platform_internal_key != settings.platform_internal_api_key:
        raise HTTPException(status_code=403, detail="Invalid internal exchange key")

    session_token = issue_session_token(
        {
            "sub": payload.provider_user_id,
            "provider": payload.provider,
            "login": payload.login,
            "name": payload.name,
            "avatar_url": payload.avatar_url,
        }
    )
    return SessionExchangeResponse(access_token=session_token)


@router.get("/auth/session/validate")
def validate_session(
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_session_token(token)
    return {
        "ok": True,
        "session": {
            "sub": payload.get("sub"),
            "provider": payload.get("provider"),
            "login": payload.get("login"),
            "name": payload.get("name"),
            "avatar_url": payload.get("avatar_url"),
        },
    }
