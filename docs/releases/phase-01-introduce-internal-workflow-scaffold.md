# Phase 01 — Introduce internal workflow scaffold

Status: complete
Release: v0.1.0
Phase file: docs/releases/phase-01-introduce-internal-workflow-scaffold.md

## Goal

Introduce the root-level OpenCode workflow scaffold required to operate safely inside this repository without modifying product code.

## Why this phase is next

The internal workflow cannot operate safely until the repo has the control files, commands, scripts, and planning state that keep work bounded and reviewable.

## Primary files

- `opencode.json`
- `AGENTS.md`
- `.opencode/AGENTS.md`
- `.opencode/agents/*`
- `.opencode/commands/*`
- `scripts/dev/*`

## Expected max files changed

24

## Risk

Low. The changes are internal-only and live at the repo root.

## Rollback note

Remove the newly added root workflow files and directories.

## In scope

- add root workflow configuration
- add agent and command definitions
- add workflow guardrail scripts
- keep product files unchanged

## Out of scope

- `apps/**` changes
- auth or runtime behavior changes
- dashboard/API wiring changes

## Tasks

- add `opencode.json`
- add `AGENTS.md` and `.opencode/AGENTS.md`
- add `.opencode/agents/**` and `.opencode/commands/**`
- add `scripts/dev/**`

## Validation command

`bash scripts/dev/doctor.sh`

## Validation

Status: PASS
Evidence:
- Root workflow files were added at repo root only.
- `bash scripts/dev/doctor.sh` passes.
Blockers:
- none
Ready to ship:
- no

## Acceptance criteria

- The workflow scaffold exists at repo root.
- No product code under `apps/**` is changed.
- Doctor passes.

## Release notes

- Added the internal OpenCode workflow scaffold at repo root.

## Completion summary

- The repository now contains root workflow control files, command definitions, and guardrail scripts without changing product runtime code.
