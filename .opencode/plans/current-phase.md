# Phase 11 — Land grounded quality signals and dashboard retention primitives

Status: complete
Release: v0.5.1
Phase file: docs/releases/phase-11-land-grounded-quality-signals-and-dashboard-retention-primitives.md
Phase kind: product-touching
Protected path approval required: yes
Protected path approval granted: yes

## Goal

Land the smallest complete slice of the quality-and-retention roadmap by adding grounded run-quality fields, exposing them in the dashboard and run detail surfaces, and shipping the missing approval inbox and suggested next actions components.

## Why this phase is next

The original Phase 10 was too broad and remains incomplete. The correct next step is to ship a smaller bounded phase that adds the missing structured fields and dashboard primitives the product already expects, without claiming the broader roadmap is done.

## Explicit approval for protected product paths

User approval is granted for this phase to modify only the bounded product paths required to complete Phase 11.

Approved protected paths for this phase:
- `apps/web/**`
- `apps/api/**`
- `README.md`
- `docs/architecture.md`

Approved primary files for this phase:
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

Approval constraints:
- do not modify `apps/copilot-cli/**`
- do not modify auth/session boundary files unless strictly required by the active phase and explicitly re-approved
- do not modify env files, setup scripts, or `docker-compose.yml` as part of this phase
- keep changes bounded to grounded quality signals, dashboard retention primitives, and related product documentation

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

Medium. This phase introduces additive schema fields and new dashboard interpretation layers. The main risk is showing quality or action signals that are not explicitly grounded in structured run state.

## Rollback note

Revert the additive schema changes and the new dashboard components if they introduce ambiguity or regress the current review flow.

## In scope

- add additive grounded confidence and risk fields to the run model
- populate those fields in deterministic and OpenAI-backed execution paths
- add approval inbox and suggested next actions components driven by explicit run state
- expose the new fields in dashboard and run detail surfaces
- update bounded product documentation to match the new execution-console behavior

## Out of scope

- env or setup script changes
- auth/session refactors
- sidecar or `apps/copilot-cli/**` changes
- broad enterprise collaboration, billing, or speculative benchmarking systems

## Tasks

- extend the API run schemas with additive grounded quality fields
- update the deterministic swarm path to emit grounded confidence and risk values
- update the OpenAI-backed swarm path to emit the same additive fields
- create `approval-inbox.tsx`
- create `suggested-next-actions.tsx`
- wire the dashboard and run detail views to render the new fields and components
- update `docs/architecture.md` and `README.md`

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
- Protected product path changes stayed within approved Phase 11 scope: `apps/web/**`, `apps/api/**`, `README.md`, and `docs/architecture.md`
Blockers:
- none
Ready to ship:
- yes

## Acceptance criteria

- run schemas contain additive grounded confidence and risk fields
- both swarm execution paths populate those fields
- the dashboard shows a working approval inbox driven by explicit run state
- the dashboard shows suggested next actions driven by explicit run state
- the run detail page renders the new grounded quality signals without regressing the existing review surface
- `python -m compileall apps/api/app`, `npm run build`, and `bash scripts/dev/workflow-check.sh` all pass

## Release notes

- Phase 11 shipped grounded run-quality signals, approval inbox, and suggested next actions surfaces across the dashboard and run detail views.

## Completion summary

- Phase 11 is complete and validated; grounded quality signals now flow through both execution paths and the dashboard now exposes explicit approval and next-action retention primitives.
