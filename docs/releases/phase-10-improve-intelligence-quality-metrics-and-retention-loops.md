# Phase 10 — Improve intelligence quality, metrics, and retention loops

Status: blocked
Release: v0.5.0
Phase file: docs/releases/phase-10-improve-intelligence-quality-metrics-and-retention-loops.md

## Goal

Increase output quality and repeat usage by sharpening role-specific schemas, adding risk and confidence indicators, instrumenting core product metrics, and surfacing pending work such as approval inbox and suggested next actions.

## Why this phase is blocked

The original Phase 10 bundled too many product-touching concerns into one step. The repo is still missing the approval inbox and suggested-next-actions components, and the run schemas do not yet expose the grounded quality and metrics fields needed to satisfy this phase cleanly in one pass.

This phase is therefore blocked and superseded by a smaller bounded execution phase that lands the missing product primitives without overstating completion.

## Primary files

- `apps/api/app/services/openai_swarm.py`
- `apps/api/app/services/swarm.py`
- `apps/api/app/models/schemas.py`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/[run_id]/page.tsx`
- `apps/web/components/approval-inbox.tsx`
- `apps/web/components/suggested-next-actions.tsx`
- `docs/github-copilot.md`
- `docs/architecture.md`
- `README.md`

## Expected max files changed

10

## Risk

Medium. The blocked scope mixed schema work, runtime instrumentation, dashboard retention loops, and documentation into a single release, which increased drift risk and made the phase too broad for a safe one-pass implementation.

## Rollback note

Do not treat this phase as releasable work. Use the follow-up bounded phase instead.

## In scope

- retain the historical intent of the original quality-and-retention milestone
- preserve the original target files and product direction for traceability

## Out of scope

- marking this phase complete
- shipping this phase as the active implementation step
- changing unrelated auth, env, or sidecar surfaces

## Tasks

- mark the phase blocked in release metadata
- move the actual implementation work into a smaller bounded next phase
- keep the workflow source of truth aligned to the new active phase

## Validation command

`bash scripts/dev/workflow-check.sh`

## Validation

Status: FAIL
Evidence:
- The repo audit found missing dashboard components and missing structured schema fields required by this phase.
- The original phase scope was too broad for a clean, bounded implementation pass.
Blockers:
- `apps/web/components/approval-inbox.tsx` does not exist yet.
- `apps/web/components/suggested-next-actions.tsx` does not exist yet.
- Grounded confidence, risk, and product-metrics schema support is not fully implemented yet.
Ready to ship:
- no

## Acceptance criteria

- This phase is explicitly recorded as blocked rather than silently skipped.
- The next active phase is narrower and executable.
- Workflow metadata points agents at the bounded follow-up phase instead of the oversized original phase.

## Release notes

- Phase 10 was blocked and superseded by a narrower follow-up execution phase.

## Completion summary

- The original Phase 10 scope remains historically documented, but it is not the active phase and must not be treated as complete.
