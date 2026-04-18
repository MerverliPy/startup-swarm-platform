from datetime import datetime, timezone
from typing import List, Literal

from pydantic import BaseModel, Field


ReviewActionName = Literal["approve", "reject", "request_revision", "rerun_with_edits"]
ReviewStateValue = Literal["not_required", "pending", "approved", "rejected", "revision_requested"]


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
    run_type: Literal["bounded_swarm"] = "bounded_swarm"
    require_marketing: bool = False
    require_repo_context: bool = False
    template_id: str | None = Field(default=None, max_length=80)
    project_id: str | None = Field(default=None, max_length=80)
    source_run_id: str | None = None


class AgentFinding(BaseModel):
    summary: str
    blockers: List[str] = Field(default_factory=list)
    major_issues: List[str] = Field(default_factory=list)
    minor_issues: List[str] = Field(default_factory=list)


class ReviewAction(BaseModel):
    action: ReviewActionName
    note: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    actor: Literal["operator"] = "operator"
    resulting_status: Literal["queued", "running", "needs_approval", "failed", "passed"]
    rerun_run_id: str | None = None


class ReviewState(BaseModel):
    state: ReviewStateValue = "not_required"
    available_actions: List[ReviewActionName] = Field(default_factory=list)
    action_history: List[ReviewAction] = Field(default_factory=list)
    last_note: str | None = None
    last_updated_at: str | None = None


class CompareMetadata(BaseModel):
    project_id: str | None = Field(default=None, max_length=80)
    template_id: str | None = Field(default=None, max_length=80)
    compare_key: str | None = Field(default=None, max_length=120)
    source_run_id: str | None = None


class RunActionRequest(BaseModel):
    action: ReviewActionName
    note: str | None = Field(default=None, max_length=500)
    title: str | None = Field(default=None, min_length=3, max_length=160)
    goal: str | None = Field(default=None, min_length=10)
    constraints: List[str] | None = None


class RunState(BaseModel):
    run_id: str
    status: Literal["queued", "running", "needs_approval", "failed", "passed"]
    title: str
    goal: str
    constraints: List[str]
    run_type: Literal["bounded_swarm"] = "bounded_swarm"
    provider: Literal["deterministic", "openai"] = "deterministic"
    require_marketing: bool = False
    require_repo_context: bool = False
    plan: List[str] = Field(default_factory=list)
    artifacts: dict = Field(default_factory=dict)
    attempts: dict = Field(default_factory=lambda: {"repair": 0})
    review: ReviewState = Field(default_factory=ReviewState)
    compare: CompareMetadata = Field(default_factory=CompareMetadata)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: str | None = None
