# Phase 11 — Land grounded quality signals and dashboard retention primitives

Status: complete
Release: v0.5.1
Phase file: docs/releases/phase-11-land-grounded-quality-signals-and-dashboard-retention-primitives.md

## Goal

Land the smallest complete slice of the quality-and-retention roadmap by adding grounded run-quality fields, exposing them in the dashboard and run detail surfaces, and shipping the missing approval inbox and suggested next actions components.

## Why this phase is next

The prior quality-and-retention phase was too broad and remains incomplete. The next correct step is to ship the missing structured schema fields and dashboard components that the repo already expects, while keeping the change bounded to the current product surface.

## Primary files

- `apps/api/app/models/schemas.py`
- `apps/api/app/services/openai_swarm.py`
- `apps/api/app/services/swarm.py`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/[run_id]/page.tsx`
- `apps/web/components/approval-inbox.tsx`
- `apps/web/components/suggested-next-actions.tsx`
- `apps/web/lib/api.ts`
- `docs/architecture.md`
- `README.md`

## Expected max files changed

10

## Risk

Medium. This phase changes structured run semantics and dashboard interpretation. The main risk is inventing quality signals that are not grounded in explicit run data or surfacing dashboard actions that do not map to real run state.

## Rollback note

Revert the additive schema fields, dashboard retention components, and run-detail quality surfaces if they create ambiguity or break the current run review flow.

## In scope

- add additive structured run fields for grounded confidence and risk signals
- populate those fields in deterministic and OpenAI-backed swarm execution paths
- add a dashboard approval inbox component driven by explicit approval-needed run state
- add suggested next actions driven only by explicit run status and approval state
- expose the new structured fields in dashboard and run detail views
- update architecture and README docs to reflect the new grounded quality and retention surfaces

## Out of scope

- auth/session boundary changes
- env or setup script changes
- Copilot sidecar changes under `apps/copilot-cli/**`
- broad monetization, billing, or collaboration systems
- speculative benchmarking systems beyond additive grounded fields

## Tasks

- extend run schemas with additive fields for confidence, risk, and minimal product metrics
- update `swarm.py` to emit grounded quality signals in fallback execution
- update `openai_swarm.py` to emit the same additive fields in model-backed execution
- create `approval-inbox.tsx`
- create `suggested-next-actions.tsx`
- wire dashboard list and run detail pages to show these new surfaces without replacing existing review primitives
- document the new execution-console behavior in `docs/architecture.md` and `README.md`

## Validation command

`python -m compileall apps/api/app && (cd apps/web && npm run build) && bash scripts/dev/workflow-check.sh`

## Validation

Status: PASS
Evidence:
- Internal workflow validation passed: `bash scripts/dev/workflow-check.sh`
- Product runtime validation passed: `python -m compileall apps/api/app` and `(cd apps/web && npm run build)` both succeeded
- `apps/api/app/models/schemas.py` now adds grounded `quality_signals` to `RunState`, including confidence, risk, and grounding fields
- `apps/api/app/services/swarm.py` refreshes grounded quality fields for both deterministic and OpenAI-backed execution paths via shared run finalization/build logic
- `apps/web/app/dashboard/page.tsx`, `apps/web/components/approval-inbox.tsx`, and `apps/web/components/suggested-next-actions.tsx` render approval inbox and suggested next actions from explicit run state
- `apps/web/app/dashboard/[run_id]/page.tsx` renders grounded confidence/risk signals while retaining the existing approval and review surfaces
Blockers:
- none
Ready to ship:
- yes

## Acceptance criteria

- run schemas contain additive grounded fields for confidence and risk rather than generic prose-only interpretation
- both deterministic and model-backed swarm paths populate the new additive fields
- the dashboard shows a working approval inbox driven by explicit run state
- the dashboard shows suggested next actions driven by explicit run state
- the run detail surface displays the grounded quality signals without regressing the existing review UI
- `python -m compileall apps/api/app`, `npm run build`, and `bash scripts/dev/workflow-check.sh` all pass

## Release notes

- Phase 11 shipped grounded run-quality signals, approval inbox, and suggested next actions surfaces across the dashboard and run detail views.

## Completion summary

- Phase 11 is complete and validated; grounded quality signals now flow through both execution paths and the dashboard now exposes explicit approval and next-action retention primitives.
