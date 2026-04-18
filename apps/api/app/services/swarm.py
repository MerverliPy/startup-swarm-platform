from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from app.config import get_settings
from app.models.schemas import RunActionRequest, RunState, TaskRequest

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


def _derive_project_id(task: TaskRequest) -> str:
    candidate = (task.project_id or task.title).strip().lower()
    slug = "-".join(part for part in candidate.replace("_", " ").split() if part)
    return (slug or "general")[0:80]


def _build_compare_metadata(task: TaskRequest) -> dict:
    project_id = _derive_project_id(task)
    template_id = task.template_id or "custom"
    return {
        "project_id": project_id,
        "template_id": template_id,
        "compare_key": f"{project_id}:{template_id}:{task.run_type}",
        "source_run_id": task.source_run_id,
    }


def _build_available_actions(status: str) -> list[str]:
    if status == "needs_approval":
        return ["approve", "reject", "request_revision", "rerun_with_edits"]
    return []


def _review_state_for_status(status: str) -> dict:
    if status == "needs_approval":
        state = "pending"
    elif status == "passed":
        state = "approved"
    elif status == "failed":
        state = "rejected"
    else:
        state = "not_required"

    return {
        "state": state,
        "available_actions": _build_available_actions(status),
        "action_history": [],
        "last_note": None,
        "last_updated_at": None,
    }


def _sync_review_metadata(run: RunState) -> None:
    if run.status == "needs_approval" and run.review.state in {"not_required", "approved"}:
        run.review.state = "pending"
    elif run.status == "passed" and run.review.state == "not_required":
        run.review.state = "approved"
    elif run.status == "failed" and run.review.state == "not_required":
        run.review.state = "rejected"

    run.review.available_actions = _build_available_actions(run.status)
    run.review.last_updated_at = run.review.last_updated_at or run.completed_at or run.created_at


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


def _build_run(task: TaskRequest, provider: str) -> RunState:
    run = RunState(
        run_id=str(uuid4()),
        status="running",
        title=task.title,
        goal=task.goal,
        constraints=_normalize_constraints(task.constraints),
        run_type=task.run_type,
        provider=provider,
        require_marketing=task.require_marketing,
        require_repo_context=task.require_repo_context,
        compare=_build_compare_metadata(task),
        review=_review_state_for_status("running"),
    )
    save_run(run)
    return run


def _finalize_run(run: RunState, status: str) -> None:
    run.status = status
    run.completed_at = datetime.now(timezone.utc).isoformat()
    prior_history = deepcopy(run.review.action_history)
    prior_note = run.review.last_note
    run.review = run.review.model_copy(update=_review_state_for_status(status))
    run.review.action_history = prior_history
    run.review.last_note = prior_note
    run.review.last_updated_at = run.completed_at
    save_run(run)


def _llm_run_swarm(task: TaskRequest) -> RunState:
    from app.services.openai_swarm import (
        build_builder_artifact,
        build_critic_artifact,
        build_orchestrator_artifact,
        build_validator_artifact,
    )

    constraints = _normalize_constraints(task.constraints)

    run = _build_run(task, "openai")

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
        status = "failed"
    elif decision == "needs_approval":
        status = "needs_approval"
    else:
        status = "passed"

    _finalize_run(run, status)
    return run


def _deterministic_run_swarm(task: TaskRequest) -> RunState:
    constraints = _normalize_constraints(task.constraints)

    run = _build_run(task, "deterministic")

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
    _finalize_run(run, status)
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


def apply_run_action(run_id: str, action_request: RunActionRequest) -> RunState:
    run = load_run(run_id)
    note = action_request.note.strip() if action_request.note else None

    if action_request.action == "approve":
        run.status = "passed"
        run.review.state = "approved"
        resulting_status = "passed"
        rerun_run_id = None
    elif action_request.action == "reject":
        run.status = "failed"
        run.review.state = "rejected"
        resulting_status = "failed"
        rerun_run_id = None
    elif action_request.action == "request_revision":
        run.status = "needs_approval"
        run.review.state = "revision_requested"
        resulting_status = "needs_approval"
        rerun_run_id = None
    else:
        rerun_task = TaskRequest(
            title=action_request.title or run.title,
            goal=action_request.goal or run.goal,
            constraints=_normalize_constraints(action_request.constraints or run.constraints),
            run_type=run.run_type,
            require_marketing=run.require_marketing,
            require_repo_context=run.require_repo_context,
            template_id=run.compare.template_id,
            project_id=run.compare.project_id,
            source_run_id=run.run_id,
        )
        rerun = run_swarm(rerun_task)
        run.review.state = "revision_requested"
        resulting_status = run.status
        rerun_run_id = rerun.run_id

    now = datetime.now(timezone.utc).isoformat()
    run.review.action_history.append(
        {
            "action": action_request.action,
            "note": note,
            "created_at": now,
            "actor": "operator",
            "resulting_status": resulting_status,
            "rerun_run_id": rerun_run_id,
        }
    )
    run.review.last_note = note
    run.review.last_updated_at = now
    run.completed_at = run.completed_at or now
    _sync_review_metadata(run)
    save_run(run)
    return run
