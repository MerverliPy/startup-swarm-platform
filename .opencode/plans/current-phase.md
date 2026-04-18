# Phase 08 — Add approval, history, templates, and compare foundations

Status: complete
Release: v0.3.0
Phase file: docs/releases/phase-08-add-approval-history-templates-and-compare-foundations.md
Phase kind: product-touching
Protected path approval required: yes
Protected path approval granted: yes

## Goal

Turn run results into a reusable workflow by adding approval actions, better history/search structure, template launch support, and compare-ready run metadata.

## Why this phase is next

After the dashboard becomes structured-first, the product still lacks the repeat-use loop described in the PRD. Users need saved context and actionable review decisions, not just readable one-off results.

## Explicit approval for protected product paths

User approval is granted for this phase to modify only the bounded product paths required to complete Phase 08.

Approved protected paths for this phase:
- `apps/web/**`
- `apps/api/**`
- `docs/architecture.md`

Approved primary files for this phase:
- `apps/api/app/models/schemas.py`
- `apps/api/app/routers/swarm.py`
- `apps/api/app/services/swarm.py`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/[run_id]/page.tsx`
- `apps/web/components/task-form.tsx`
- `apps/web/components/approval-actions.tsx`
- `apps/web/components/template-launcher.tsx`
- `apps/web/components/run-history-filters.tsx`
- `docs/architecture.md`

Approval constraints:
- do not modify `apps/copilot-cli/**`
- do not modify auth/session boundary files unless strictly required by the active phase and explicitly re-approved
- do not modify env files, `docker-compose.yml`, `README.md`, `docs/github-copilot.md`, or setup scripts as part of this phase
- keep changes bounded to the minimum necessary to satisfy Phase 08 acceptance criteria

## Primary files

- `apps/api/app/models/schemas.py`
- `apps/api/app/routers/swarm.py`
- `apps/api/app/services/swarm.py`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/[run_id]/page.tsx`
- `apps/web/components/task-form.tsx`
- `apps/web/components/approval-actions.tsx`
- `apps/web/components/template-launcher.tsx`
- `apps/web/components/run-history-filters.tsx`
- `docs/architecture.md`

## Expected max files changed

10

## Risk

Medium. This phase adds new product-state transitions and stored metadata. The main risk is over-designing state before the run model has proven stable in the structured-review phase.

## Rollback note

Revert the approval action handlers, template/history UI, and any additive schema fields that support compare-ready metadata.

## In scope

- add approval actions: approve, reject, request revision, rerun with edits
- add run-history grouping and filters once shared persistence is stable
- add template launch support using the PRD’s initial template list
- add compare-ready metadata even if full visual diffing is still bounded
- introduce workspace or project identifiers only at the minimal level required for reuse

## Out of scope

- team collaboration or broad multi-user routing
- billing or enterprise administration
- full share/export packaging beyond a bounded first release
- iPhone/PWA shell work

## Tasks

- extend run schemas with review-decision metadata and compare-ready identifiers
- add approval-action endpoints or route handlers tied to the canonical runtime path
- add history filters for status, approval state, provider, and recency
- add template launch support for the first PRD template set
- add a minimal workspace or project field only if needed for durable reruns and grouping
- keep any compare UI bounded to structured metadata, not raw artifact diffs

## Validation command

`python -m compileall apps/api/app && (cd apps/web && npm run build)`

## Validation

Status: PASS
Evidence:
- internal workflow validation: `bash scripts/dev/workflow-check.sh` -> PASS
- product runtime validation: `python -m compileall apps/api/app` -> PASS
- product runtime validation: `(cd apps/web && npm run build)` -> PASS
- protected path check: changed product files stayed within the explicitly approved `apps/web/**` and `apps/api/**` paths; no unapproved protected product paths were modified
- scope check: implementation stays within the bounded Phase 08 approval/history/templates/compare-foundation scope and does not introduce out-of-scope collaboration, export, billing, or mobile-shell work
- acceptance evidence: `needs_approval` runs now expose explicit approve/reject/request-revision/rerun-with-edits controls, and `apps/web/components/approval-actions.tsx` submits editable title/goal/constraints for reruns through the canonical action endpoint
- acceptance evidence: dashboard history supports status, approval-state, provider, and recency filtering, and runs remain grouped by status using stable stored metadata
- acceptance evidence: the command surface exposes bounded starter templates, and runs now carry compare-ready `project_id`, `template_id`, `compare_key`, and `source_run_id` metadata for later grouping/compare work
- canonical path check: new approval actions flow through `apps/web/app/api/swarm/runs/[run_id]/actions/route.ts` -> `apps/api/app/routers/swarm.py` -> `apps/api/app/services/swarm.py` and continue using the existing run persistence model
Blockers:
- none
Ready to ship:
- yes

## Acceptance criteria

- `needs_approval` runs expose explicit next actions instead of a passive label only
- the dashboard supports history filtering and recency ordering based on stable metadata
- users can launch at least one bounded template from the command surface
- runs carry enough metadata to support later compare and workspace grouping work
- no new feature bypasses the canonical runtime or persistence path established earlier

## Release notes

- Added canonical approval actions and editable rerun support for `needs_approval` runs.
- Added dashboard history filters, starter templates, and compare-ready run metadata for later grouping work.

## Completion summary

- Phase 08 is complete and validated; runs now support reusable approval, template launch, filtered history, and compare-ready metadata on the existing persistence path.
