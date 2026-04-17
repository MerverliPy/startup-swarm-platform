# Phase 03 — Harden monorepo workflow checks

Status: complete
Release: v0.1.0
Phase file: docs/releases/phase-03-harden-monorepo-workflow-checks.md

## Goal

Adapt the workflow guardrail scripts so they verify the transplanted workflow files and this repo’s key product anchors without assuming a different monorepo layout.

## Why this phase is next

The portable guardrails are not sufficient until they reject stale placeholders and confirm that the repo anchors they are meant to protect actually exist.

## Primary files

- `scripts/dev/doctor.sh`
- `scripts/dev/workflow-check.sh`
- `scripts/dev/autoflow.sh`

## Expected max files changed

3

## Risk

Medium. A broken guardrail script would weaken the safety of later phases.

## Rollback note

Revert the guardrail-script adaptations.

## In scope

- verify workflow files exist
- verify repo anchor files exist
- reject placeholder workflow metadata
- keep autoflow metadata-oriented

## Out of scope

- product build/test changes
- route wiring
- runtime behavior changes

## Tasks

- adapt `doctor.sh`
- adapt `workflow-check.sh`
- preserve `autoflow.sh` while keeping it internal-only

## Validation command

`bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect`

## Validation

Status: PASS
Evidence:
- Guardrail scripts verify both workflow files and repo anchor files.
- `bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh && bash scripts/dev/autoflow.sh inspect` passes.
Blockers:
- none
Ready to ship:
- no

## Acceptance criteria

- Doctor checks workflow files and product anchor files.
- Workflow check rejects placeholders and missing boundary statements.
- Autoflow can classify the current workflow state without touching product code.

## Release notes

- Hardened workflow guardrails for the Startup Swarm monorepo.

## Completion summary

- The internal workflow now performs repo-aware metadata checks and anchor-file validation while remaining separate from product runtime behavior.
