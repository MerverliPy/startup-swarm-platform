from __future__ import annotations

from typing import Literal

from openai import OpenAI
from pydantic import BaseModel, Field

from app.config import get_settings
from app.models.schemas import TaskRequest


class OrchestratorArtifact(BaseModel):
    summary: str
    plan: list[str] = Field(default_factory=list)
    success_criteria: list[str] = Field(default_factory=list)
    selected_agents: list[str] = Field(default_factory=list)


class BuildSection(BaseModel):
    heading: str
    content: str | list[str]


class BuildArtifact(BaseModel):
    summary: str
    output_kind: str = "execution_brief"
    sections: list[BuildSection] = Field(default_factory=list)


class CriticArtifact(BaseModel):
    summary: str
    blockers: list[str] = Field(default_factory=list)
    major_issues: list[str] = Field(default_factory=list)
    minor_issues: list[str] = Field(default_factory=list)


class ValidatorArtifact(BaseModel):
    summary: str
    decision: Literal["pass", "needs_approval", "fail"]
    rationale: str
    blockers: list[str] = Field(default_factory=list)
    major_issues: list[str] = Field(default_factory=list)
    human_approval_required: bool = False


def _client() -> OpenAI:
    return OpenAI(api_key=get_settings().openai_api_key)


def _model() -> str:
    return get_settings().openai_model


def _parse(model_cls: type[BaseModel], instructions: str, prompt: str) -> BaseModel:
    response = _client().responses.parse(
        model=_model(),
        input=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": prompt},
        ],
        text_format=model_cls,
    )
    return response.output_parsed


def build_orchestrator_artifact(task: TaskRequest, constraints: list[str]) -> dict:
    instructions = (
        "You are an orchestrator for a startup-style AI workflow. "
        "Return a concise plan, success criteria, and selected agents. "
        "Prefer a small, manager-controlled workflow. "
        "Do not claim production readiness if the task asks for it without supporting infrastructure."
    )

    prompt = f"""
Task title: {task.title}
Goal: {task.goal}
Constraints: {constraints}
Require marketing: {task.require_marketing}
Require repo context: {task.require_repo_context}

Return:
- summary
- plan
- success_criteria
- selected_agents
""".strip()

    artifact = _parse(OrchestratorArtifact, instructions, prompt)
    return artifact.model_dump()


def build_builder_artifact(task: TaskRequest, constraints: list[str], orchestrator: dict) -> dict:
    instructions = (
        "You are the builder. Produce a compact execution brief. "
        "Keep scope bounded, be explicit, and do not imply unsupported capabilities."
    )

    prompt = f"""
Task title: {task.title}
Goal: {task.goal}
Constraints: {constraints}
Orchestrator artifact: {orchestrator}

Return:
- summary
- output_kind
- sections
""".strip()

    artifact = _parse(BuildArtifact, instructions, prompt)
    return artifact.model_dump()


def build_critic_artifact(task: TaskRequest, constraints: list[str], build_artifact: dict) -> dict:
    instructions = (
        "You are the critic. Review the draft for blockers, major issues, and minor issues. "
        "Be strict about operational claims. "
        "If the task requires production readiness, call out missing persistence, worker queues, auth protection, or deployment hardening."
    )

    prompt = f"""
Task title: {task.title}
Goal: {task.goal}
Constraints: {constraints}
Build artifact: {build_artifact}

Return:
- summary
- blockers
- major_issues
- minor_issues
""".strip()

    artifact = _parse(CriticArtifact, instructions, prompt)
    return artifact.model_dump()


def build_validator_artifact(
    task: TaskRequest,
    constraints: list[str],
    orchestrator: dict,
    build_artifact: dict,
    critic_artifact: dict,
    repair_artifact: dict | None,
) -> dict:
    instructions = (
        "You are the validator. Decide whether the run should pass, fail, or require approval. "
        "Rules: "
        "1) If blockers remain, decision must be 'fail'. "
        "2) If production readiness is requested but major infrastructure risks remain, decision must be 'needs_approval'. "
        "3) Otherwise, return 'pass' only if the result is usable and the critique is adequately surfaced. "
        "Set human_approval_required=true only when decision is 'needs_approval'."
    )

    prompt = f"""
Task title: {task.title}
Goal: {task.goal}
Constraints: {constraints}
Orchestrator artifact: {orchestrator}
Build artifact: {build_artifact}
Critic artifact: {critic_artifact}
Repair artifact: {repair_artifact}

Return:
- summary
- decision
- rationale
- blockers
- major_issues
- human_approval_required
""".strip()

    artifact = _parse(ValidatorArtifact, instructions, prompt)
    return artifact.model_dump()
