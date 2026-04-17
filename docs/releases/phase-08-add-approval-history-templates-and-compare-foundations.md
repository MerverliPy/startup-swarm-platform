# Phase 08 — Add approval, history, templates, and compare foundations

Status: pending
Release: v0.3.0
Phase file: docs/releases/phase-08-add-approval-history-templates-and-compare-foundations.md

## Goal

Turn run results into a reusable workflow by adding approval actions, better history/search structure, template launch support, and compare-ready run metadata.

## Why this phase is next

After the dashboard becomes structured-first, the product still lacks the repeat-use loop described in the PRD. Users need saved context and actionable review decisions, not just readable one-off results.

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

Status: pending
Evidence:
- not run yet
Blockers:
- not validated yet
Ready to ship:
- no

## Acceptance criteria

- `needs_approval` runs expose explicit next actions instead of a passive label only
- the dashboard supports history filtering and recency ordering based on stable metadata
- users can launch at least one bounded template from the command surface
- runs carry enough metadata to support later compare and workspace grouping work
- no new feature bypasses the canonical runtime or persistence path established earlier

## Release notes

- pending

## Completion summary

- pending
