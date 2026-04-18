from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from app.config import get_settings
from app.models.schemas import TaskRequest, RunState

GENERIC_SUCCESS_CRITERIA = [
    "Output addresses the stated goal directly",
    "Output respects explicit constraints",
    "Review findings are either resolved or surfaced clearly",
]


def _runs_dir() -> Path:
    path = Path(get_settings().runs_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_run(run: RunState) -> None:
    target = _runs_dir() / f"{run.run_id}.json"
    target.write_text(run.model_dump_json(indent=2), encoding="utf-8")


def _read_run(target: Path) -> RunState:
    payload = json.loads(target.read_text(encoding="utf-8"))
    if "created_at" not in payload:
        payload["created_at"] = datetime.fromtimestamp(
            target.stat().st_mtime, tz=timezone.utc
        ).isoformat()
    return RunState.model_validate(payload)


def load_run(run_id: str) -> RunState:
    target = _runs_dir() / f"{run_id}.json"
    return _read_run(target)


def list_runs() -> list[RunState]:
    items = [_read_run(file) for file in _runs_dir().glob("*.json")]
    return sorted(items, key=lambda run: run.created_at, reverse=True)


def _normalize_constraints(constraints: list[str]) -> list[str]:
    return [item.strip() for item in constraints if item.strip()]


def _orchestrator_artifact(task: TaskRequest, constraints: list[str]) -> dict:
    plan = [
        "Define the minimum viable artifact and acceptance criteria",
        "Draft a first-pass solution targeted to the stated goal",
        "Run a critic pass against constraints and operational risks",
        "Perform one bounded repair pass if the critic finds blockers or major issues",
        "Validate the final package and set a release decision",
    ]
    if task.require_repo_context:
        plan.insert(1, "Collect repository-specific context before drafting")
    if task.require_marketing:
        plan.insert(-1, "Add a messaging pass for user-facing packaging")

    success_criteria = [*GENERIC_SUCCESS_CRITERIA, *constraints]
    return {
        "summary": "Deterministic manager-controlled run plan created.",
        "plan": plan,
        "success_criteria": success_criteria,
        "selected_agents": [
            "orchestrator",
            "builder",
            "critic",
            *(["marketer"] if task.require_marketing else []),
            "validator",
        ],
    }


def _builder_artifact(task: TaskRequest, constraints: list[str]) -> dict:
    checks = [
        "Keep scope bounded to the requested title and goal",
        "State known gaps instead of implying unsupported capability",
    ]
    if constraints:
        checks.append(f"Track explicit constraints: {', '.join(constraints)}")

    sections = [
        {"heading": "Objective", "content": task.goal},
        {
            "heading": "Proposed approach",
            "content": (
                "Use a manager-controlled workflow with typed outputs, a single repair pass, "
                "and a validator decision instead of an unbounded free-form swarm."
            ),
        },
        {"heading": "Execution checks", "content": checks},
    ]
    return {
        "summary": "Initial draft artifact created by the builder.",
        "output_kind": "execution_brief",
        "sections": sections,
    }


def _critic_artifact(task: TaskRequest, constraints: list[str], build_artifact: dict) -> dict:
    blockers: list[str] = []
    major_issues: list[str] = []
    minor_issues: list[str] = []

    if task.require_repo_context:
        blockers.append(
            "Repository context was requested, but this starter service has no connected repo retrieval in the run path yet."
        )

    if "production_ready" in {item.lower() for item in constraints}:
        major_issues.append(
            "The starter still uses JSON-file persistence and no worker queue, so it should not be labeled production-ready without additional infrastructure."
        )

    if len(task.goal.split()) < 8:
        minor_issues.append(
            "The goal is brief enough that acceptance criteria may still need tightening before high-confidence automation."
        )

    if build_artifact.get("output_kind") != "execution_brief":
        blockers.append("Builder returned an unexpected artifact type.")

    return {
        "summary": "Critic pass completed against scope, infrastructure, and constraint risk.",
        "blockers": blockers,
        "major_issues": major_issues,
        "minor_issues": minor_issues,
    }


def _repair_artifact(critic_artifact: dict) -> dict:
    repaired_items: list[str] = []
    unresolved_items: list[str] = []

    for issue in critic_artifact.get("major_issues", []):
        repaired_items.append(f"Surfaced major issue explicitly: {issue}")

    for blocker in critic_artifact.get("blockers", []):
        unresolved_items.append(blocker)

    return {
        "summary": "Single bounded repair pass completed.",
        "repaired_items": repaired_items,
        "unresolved_items": unresolved_items,
    }


def _marketing_artifact(task: TaskRequest) -> dict:
    return {
        "summary": "Messaging pass created because require_marketing=true.",
        "positioning": f"{task.title}: a structured AI workflow focused on clear operator control.",
        "audience": "builders and operators evaluating multi-agent workflows",
    }


def _validator_artifact(task: TaskRequest, critic_artifact: dict, repair_artifact: dict | None) -> tuple[str, dict]:
    blockers = critic_artifact.get("blockers", [])
    major_issues = critic_artifact.get("major_issues", [])
    unresolved = repair_artifact.get("unresolved_items", []) if repair_artifact else []
    normalized_constraints = {item.lower() for item in _normalize_constraints(task.constraints)}

    if blockers or unresolved:
        status = "failed"
        decision = "fail"
        rationale = "Blocking gaps remain after the bounded repair pass."
    elif "production_ready" in normalized_constraints and major_issues:
        status = "needs_approval"
        decision = "human_approval_required"
        rationale = (
            "The run produced a usable artifact, but production-ready was requested and infrastructure risks remain."
        )
    else:
        status = "passed"
        decision = "pass"
        rationale = "The run satisfied the current acceptance bar for the starter service."

    return status, {
        "summary": "Validator completed the final decision pass.",
        "decision": decision,
        "rationale": rationale,
        "blockers": blockers,
        "major_issues": major_issues,
        "human_approval_required": status == "needs_approval",
    }


def _llm_run_swarm(task: TaskRequest) -> RunState:
    from app.services.openai_swarm import (
        build_builder_artifact,
        build_critic_artifact,
        build_orchestrator_artifact,
        build_validator_artifact,
    )

    constraints = _normalize_constraints(task.constraints)

    run = RunState(
        run_id=str(uuid4()),
        status="running",
        title=task.title,
        goal=task.goal,
        constraints=constraints,
        run_type=task.run_type,
        provider="openai",
    )
    save_run(run)

    orchestrator = build_orchestrator_artifact(task, constraints)
    run.plan = orchestrator.get("plan", [])
    run.artifacts["orchestrator"] = orchestrator

    builder = build_builder_artifact(task, constraints, orchestrator)
    run.artifacts["build"] = builder

    critic = build_critic_artifact(task, constraints, builder)
    run.artifacts["critic"] = critic

    repair = None
    if critic.get("blockers") or critic.get("major_issues"):
        run.attempts["repair"] = 1
        repair = _repair_artifact(critic)
        run.artifacts["repair"] = repair

    if task.require_marketing:
        run.artifacts["marketing"] = _marketing_artifact(task)

    validator = build_validator_artifact(task, constraints, orchestrator, builder, critic, repair)
    run.artifacts["validator"] = validator

    decision = validator.get("decision")
    if decision == "fail":
        run.status = "failed"
    elif decision == "needs_approval":
        run.status = "needs_approval"
    else:
        run.status = "passed"

    run.completed_at = datetime.now(timezone.utc).isoformat()
    save_run(run)
    return run


def _deterministic_run_swarm(task: TaskRequest) -> RunState:
    constraints = _normalize_constraints(task.constraints)

    run = RunState(
        run_id=str(uuid4()),
        status="running",
        title=task.title,
        goal=task.goal,
        constraints=constraints,
        run_type=task.run_type,
        provider="deterministic",
    )
    save_run(run)

    orchestrator = _orchestrator_artifact(task, constraints)
    run.plan = orchestrator["plan"]
    run.artifacts["orchestrator"] = orchestrator

    builder = _builder_artifact(task, constraints)
    run.artifacts["build"] = builder

    critic = _critic_artifact(task, constraints, builder)
    run.artifacts["critic"] = critic

    repair = None
    if critic["blockers"] or critic["major_issues"]:
        run.attempts["repair"] = 1
        repair = _repair_artifact(critic)
        run.artifacts["repair"] = repair

    if task.require_marketing:
        run.artifacts["marketing"] = _marketing_artifact(task)

    status, validator = _validator_artifact(task, critic, repair)
    run.artifacts["validator"] = validator
    run.status = status
    run.completed_at = datetime.now(timezone.utc).isoformat()
    save_run(run)
    return run


def run_swarm(task: TaskRequest) -> RunState:
    settings = get_settings()

    if settings.openai_api_key:
        try:
            return _llm_run_swarm(task)
        except Exception as exc:
            run = _deterministic_run_swarm(task)
            run.artifacts["llm_error"] = {
                "summary": "Fell back to deterministic execution because model-backed execution failed.",
                "detail": str(exc),
            }
            save_run(run)
            return run

    return _deterministic_run_swarm(task)
