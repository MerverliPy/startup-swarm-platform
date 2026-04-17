# Backlog Candidate — Dry-run internal workflow on a doc-only root-level change

Status: complete
Release: v0.1.0
Phase file: backlog:dry-run-internal-workflow-on-doc-only-change

## Goal

Verify the transplanted internal workflow can select, execute, validate, and close a harmless doc-only root-level change without touching protected product files.

## Why this phase is next

All implementation release phases are complete, and the user explicitly selected the highest-priority remaining backlog candidate. This is the smallest safe internal-only exercise.

## Primary files

- `AGENTS.md`
- `.opencode/plans/current-phase.md`
- `docs/releases/phase-registry.md`
- `.opencode/backlog/candidates.yaml`

## Expected max files changed

4

## Risk

Low. The dry run is limited to internal workflow state and a harmless root-level documentation clarification.

## Rollback note

Revert `AGENTS.md`, `.opencode/plans/current-phase.md`, `docs/releases/phase-registry.md`, and `.opencode/backlog/candidates.yaml`.

## In scope

- make a harmless internal-only clarification in `AGENTS.md`
- load the selected backlog candidate into `.opencode/plans/current-phase.md`
- keep registry and backlog state synchronized for this dry run
- validate the bounded internal-only exercise with workflow guardrails

## Out of scope

- product feature work
- changes under `apps/web/**`, `apps/api/**`, or `apps/copilot-cli/**`
- changes to `.env*`, `docker-compose.yml`, `README.md`, `docs/architecture.md`, or `docs/github-copilot.md`

## Tasks

- update `AGENTS.md` with a machine-readable workflow validation clarification
- record the selected backlog candidate as the active phase
- validate with `bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect-json`
- archive the candidate after PASS evidence so the backlog stays deterministic

## Validation command

`bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect-json`

## Validation

Status: PASS
Evidence:
- `AGENTS.md` now points internal-only dry runs at `bash scripts/dev/autoflow.sh inspect-json` for machine-readable workflow confirmation.
- The selected backlog candidate was loaded into `.opencode/plans/current-phase.md`, tracked in the registry, and removed from active `candidates` after validation passed.
- `bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect-json` passes.
Blockers:
- none
Ready to ship:
- no

## Acceptance criteria

- The active phase references `backlog:dry-run-internal-workflow-on-doc-only-change`.
- Only internal workflow or root-level internal documentation files change.
- `bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect-json` passes.
- The completed dry-run candidate is no longer selectable under `candidates`.

## Release notes

- Completed a doc-only internal workflow dry run without touching protected product files.

## Completion summary

- The workflow successfully selected, executed, validated, and closed the first internal-only backlog candidate.
