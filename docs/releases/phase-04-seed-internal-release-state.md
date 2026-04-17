# Phase 04 — Seed internal release state

Status: complete
Release: v0.1.0
Phase file: docs/releases/phase-04-seed-internal-release-state.md

## Goal

Replace portable placeholder phase metadata with repo-specific release phases, current-phase state, and backlog candidates so the workflow is ready for use.

## Why this phase is next

The workflow is not operational until its active phase, release registry, and candidate backlog point to real bounded work inside this repository.

## Primary files

- `.opencode/plans/current-phase.md`
- `.opencode/backlog/candidates.yaml`
- `docs/releases/phase-registry.md`
- `docs/releases/phase-template.md`
- `docs/releases/phase-01-introduce-internal-workflow-scaffold.md`
- `docs/releases/phase-02-encode-startup-swarm-boundaries.md`
- `docs/releases/phase-03-harden-monorepo-workflow-checks.md`
- `docs/releases/phase-04-seed-internal-release-state.md`

## Expected max files changed

8

## Risk

Low. This phase changes internal workflow state only.

## Rollback note

Revert the phase docs, registry, backlog, and current-phase file.

## In scope

- create real phase documents
- replace placeholder backlog items
- set the current workflow phase file to a real repo-specific state
- keep the initial next steps internal-only

## Out of scope

- product feature work
- auth/runtime/Copilot changes
- customer-facing docs or UI changes

## Tasks

- create real phase documents
- replace the phase registry placeholder entries
- replace the backlog placeholder entry
- set `.opencode/plans/current-phase.md` to a real repo-specific phase

## Validation command

`bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect-json`

## Validation

Status: PASS
Evidence:
- The registry, backlog, and current phase now reference real repo-specific internal workflow work.
- `bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect-json` passes.
Blockers:
- none
Ready to ship:
- no

## Acceptance criteria

- The phase registry lists real repo-specific phases.
- The backlog contains internal-only candidates.
- The current phase file is valid and references a real phase file.
- Workflow checks pass.

## Release notes

- Seeded real internal release state for the transplanted OpenCode workflow.

## Completion summary

- The internal workflow is now ready to operate against this repo with real phases, a valid backlog, and working guardrail scripts.
