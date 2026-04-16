from pydantic import BaseModel, Field
from typing import List, Literal


class UserProfile(BaseModel):
    id: int
    login: str
    name: str | None = None
    avatar_url: str | None = None
    access_token: str | None = None


class TaskRequest(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    goal: str = Field(min_length=10)
    constraints: List[str] = Field(default_factory=list)
    require_marketing: bool = False
    require_repo_context: bool = False


class AgentFinding(BaseModel):
    summary: str
    blockers: List[str] = Field(default_factory=list)
    major_issues: List[str] = Field(default_factory=list)
    minor_issues: List[str] = Field(default_factory=list)


class RunState(BaseModel):
    run_id: str
    status: Literal["queued", "running", "needs_approval", "failed", "passed"]
    title: str
    goal: str
    constraints: List[str]
    plan: List[str] = Field(default_factory=list)
    artifacts: dict = Field(default_factory=dict)
    attempts: dict = Field(default_factory=lambda: {"repair": 0})
