from pydantic import BaseModel
from functools import lru_cache
import os


class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "Startup Swarm Platform API")
    api_base_url: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    frontend_base_url: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me")
    platform_internal_api_key: str = os.getenv("PLATFORM_INTERNAL_API_KEY", "change-me-internal")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")
    github_client_id: str | None = os.getenv("GITHUB_CLIENT_ID")
    github_client_secret: str | None = os.getenv("GITHUB_CLIENT_SECRET")
    github_redirect_uri: str = os.getenv(
        "GITHUB_OAUTH_REDIRECT_URI",
        "http://localhost:3000/api/auth/callback/github",
    )
    runs_dir: str = os.getenv("RUNS_DIR", "/runs")


@lru_cache
def get_settings() -> Settings:
    return Settings()
