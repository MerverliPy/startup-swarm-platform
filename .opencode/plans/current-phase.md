# Phase 07 — Productize command surface and run review

Status: complete
Release: v0.3.0
Phase file: docs/releases/phase-07-productize-command-surface-and-run-review.md
Protected path approval granted: yes
Protected path approval required: yes
Phase kind: product-touching

## Goal

Replace the raw-JSON-first dashboard with a structured command surface and a structured run-review experience that exposes stages, timeline, review findings, and approval state without requiring users to read full artifacts.

## Why this phase is next

Phases 05 and 06 closed the highest-risk runtime and auth gaps. The largest remaining PRD gap is now the product experience itself: the dashboard still behaves like a debug console, the launch form is too minimal, and recent runs are still not presented through a structured review-oriented surface.

## Explicit approval for protected product paths

User approval is granted for this phase to modify only the bounded product paths required to complete Phase 07.

Approved protected paths for this phase:
- `apps/web/**`
- `apps/api/**`

Approved primary files for this phase:
- `apps/web/components/task-form.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/[run_id]/page.tsx`
- `apps/web/components/run-summary-card.tsx`
- `apps/web/components/run-review-tabs.tsx`
- `apps/web/components/run-stage-timeline.tsx`
- `apps/web/components/run-finding-list.tsx`
- `apps/web/lib/api.ts`
- `apps/api/app/models/schemas.py`
- `apps/api/app/services/swarm.py`

Approval constraints:
- do not modify `apps/copilot-cli/**`
- do not modify auth/session boundary files unless strictly required by the active phase and explicitly re-approved
- do not modify env files, `docker-compose.yml`, `README.md`, `docs/architecture.md`, `docs/github-copilot.md`, or setup scripts as part of this phase
- keep changes bounded to the minimum necessary to satisfy Phase 07 acceptance criteria

## Primary files

- `apps/web/components/task-form.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/[run_id]/page.tsx`
- `apps/web/components/run-summary-card.tsx`
- `apps/web/components/run-review-tabs.tsx`
- `apps/web/components/run-stage-timeline.tsx`
- `apps/web/components/run-finding-list.tsx`
- `apps/web/lib/api.ts`
- `apps/api/app/models/schemas.py`
- `apps/api/app/services/swarm.py`

## Expected max files changed

10

## Risk

Medium. This phase changes product UI and additive run-shape expectations, but it should not alter the already-stabilized auth or route boundaries beyond the data fields required for structured review.

## Rollback note

Revert the new dashboard and run-detail UI components and any additive schema fields introduced solely for structured review.

## In scope

- expand the create-run form beyond title/goal/comma-separated constraints
- add explicit run type and provider visibility where supported by the canonical runtime
- add structured run cards to the dashboard
- add a run-detail surface with Summary, Timeline, Review, and Raw JSON views
- expose blockers, major issues, minor issues, repair summary, and approval state as first-class UI elements
- preserve raw JSON as a secondary advanced view only

## Out of scope

- approval action mutations
- workspaces, templates, compare, or export/share
- offline shell or install coach
- deeper intelligence-quality work beyond additive display fields

## Tasks

- extend `TaskRequest` and `RunState` only as needed to support structured launch and structured review
- derive provider, issue counts, and stage state from current artifacts where possible instead of adding avoidable schema churn
- replace the dashboard’s raw JSON dump with summary cards and status groupings
- replace the form result `<pre>` with a redirect or link into a run-detail experience
- add the run-detail route and tabs for Summary, Timeline, Review, and Raw JSON
- surface validator rationale, issue counts, stage progression, and repair state as explicit UI state
- keep raw artifact inspection available but no longer default

## Validation command

`bash scripts/dev/workflow-check.sh && python -m compileall apps/api/app && (cd apps/web && npm run build)`

## Validation

Status: PASS
Evidence:
- internal workflow validation: `bash scripts/dev/workflow-check.sh` -> PASS
- product runtime validation: `python -m compileall apps/api/app` -> PASS
- product runtime validation: `(cd apps/web && npm run build)` -> PASS
- protected path check: no unapproved protected product paths were changed; product changes stayed within approved `apps/web/**` and `apps/api/**` bounds
- scope check: product implementation stayed within the bounded Phase 07 command-surface and run-review scope; remaining workflow changes are limited to active phase/registry metadata
- acceptance evidence: dashboard recent runs render grouped summary cards instead of a default raw JSON block, and successful create-run flow redirects into `/dashboard/[run_id]`
- acceptance evidence: users can see status, provider, timing, approval state, and issue counts from summary cards, and run detail provides Summary, Timeline, Review, and Raw JSON tabs with raw JSON as a secondary view
Blockers:
- none
Ready to ship:
- yes

## Acceptance criteria

- the dashboard no longer renders recent runs as a raw JSON block by default
- successful create-run flow leads users into a structured run-review path
- users can see status, provider, duration or elapsed state, approval state, and issue counts without opening raw JSON
- raw JSON remains available as a secondary advanced surface
- the command surface supports bounded run metadata beyond the current title/goal/constraint stub

## Release notes

- Replaced the dashboard raw JSON-first run list with grouped structured summary cards and added a structured run-detail route.
- Expanded create-run inputs and surfaced provider, approval state, timeline, findings, and raw JSON as a secondary review tab.

## Completion summary

- Phase 07 is complete and validated; the dashboard now supports structured launch and structured run review without requiring users to inspect raw artifacts by default.
