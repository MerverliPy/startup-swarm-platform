# Phase 10 — Improve intelligence quality, metrics, and retention loops

Status: pending
Release: v0.5.0
Phase file: docs/releases/phase-10-improve-intelligence-quality-metrics-and-retention-loops.md
Phase kind: product-touching
Protected path approval required: yes
Protected path approval granted: yes

## Goal

Increase output quality and repeat usage by sharpening role-specific schemas, adding risk and confidence indicators, instrumenting core product metrics, and surfacing pending work such as approval inbox and suggested next actions.

## Why this phase is next

After the runtime, security, structured UX, reuse loop, and iPhone shell are in place, the next PRD step is differentiation: outputs must feel more grounded, the product must measure its own performance, and returning users should see meaningful pending work instead of a static dashboard.

## Explicit approval for protected product paths

User approval is granted for this phase to modify only the bounded product paths required to complete Phase 10.

Approved protected paths for this phase:
- `apps/web/**`
- `apps/api/**`
- `README.md`
- `docs/architecture.md`
- `docs/github-copilot.md`

Approved primary files for this phase:
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

Approval constraints:
- do not modify `apps/copilot-cli/**`
- do not modify auth/session boundary files unless strictly required by the active phase and explicitly re-approved
- do not modify env files, setup scripts, or `docker-compose.yml` as part of this phase
- keep changes bounded to intelligence quality, grounded metrics, dashboard retention loops, and related documentation updates

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

Medium. This phase adds new product interpretation layers and instrumentation. The main risk is adding metrics or quality signals that are not grounded in the run schema created by earlier phases.

## Rollback note

Revert the additive output-quality fields, analytics hooks, and retention-focused dashboard sections if they introduce noise or ambiguity.

## In scope

- sharpen role-specific prompt and output schema contracts
- add confidence or risk indicators where they can be grounded in structured run data
- add minimal product metrics instrumentation aligned to the PRD
- add approval inbox and suggested next actions using the stabilized review and history model
- update product docs to reflect the differentiated execution-console model

## Out of scope

- broad enterprise collaboration
- billing, monetization implementation, or App Store distribution
- speculative benchmarking systems beyond the bounded compare-ready model

## Tasks

- add additive validator or critic fields for confidence and risk only where structured data supports them
- instrument activation, run-success, approval, rerun, and compare-related metrics at the product surface
- add an approval inbox section to the dashboard once approval actions are stable
- add suggested next actions only from explicit run state, not opaque heuristic text generation
- align `README.md`, `docs/architecture.md`, and `docs/github-copilot.md` with the differentiated product model

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

- role-specific output quality is improved through explicit schema or prompt changes, not only copy changes
- the product records at least the core activation, run-success, and approval metrics named in the PRD
- returning users can see pending approvals or suggested next steps on the dashboard
- risk or confidence indicators are grounded in structured run data rather than generic prose
- product docs describe the platform as an execution console with review and approval loops, not a raw prompt runner

## Release notes

- pending

## Completion summary

- pending
