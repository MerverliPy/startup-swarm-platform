# Phase 07 — Productize command surface and run review

Status: pending
Release: v0.3.0
Phase file: docs/releases/phase-07-productize-command-surface-and-run-review.md
Phase kind: product-touching
Protected path approval required: yes
Protected path approval granted: yes

## Goal

Replace the raw-JSON-first dashboard with a structured command surface and a structured run-review experience that exposes stages, timeline, review findings, and approval state without requiring users to read full artifacts.

## Why this phase is next

Once the runtime path and auth boundary are stable, the largest remaining PRD gap is the product experience itself: the dashboard still behaves like a debug console, the form is too minimal, and recent runs are rendered as raw JSON rather than a review-oriented surface.

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

Status: pending
Evidence:
- not run yet
Blockers:
- not validated yet
Ready to ship:
- no

## Acceptance criteria

- the dashboard no longer renders recent runs as a raw JSON block by default
- successful create-run flow leads users into a structured run-review path
- users can see status, provider, duration or elapsed state, approval state, and issue counts without opening raw JSON
- raw JSON remains available as a secondary advanced surface
- the command surface supports bounded run metadata beyond the current title/goal/constraint stub

## Release notes

- pending

## Completion summary

- pending
