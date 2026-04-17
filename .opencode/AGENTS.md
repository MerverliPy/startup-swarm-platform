# Workflow Rules

## Scope

These instructions apply to workflow files, commands, agents, phase state, and internal guardrails under `.opencode/`, `docs/releases/`, and `scripts/dev/`.

## Workflow invariants

- `.opencode/plans/current-phase.md` is the authoritative active-phase file
- `docs/releases/phase-registry.md` must reflect in-progress and complete workflow state accurately
- a phase must not ship unless validation status is PASS
- backlog selection must only use entries under `candidates`
- the workflow is internal-only and must not be exposed through product runtime surfaces

## Protected path rules

Without explicit approval in the active phase, the workflow must not modify:
- `apps/web/**`
- `apps/api/**`
- `apps/copilot-cli/**`
- `README.md`
- `docs/architecture.md`
- `docs/github-copilot.md`
- `.env.example`
- `apps/api/.env.example`
- `apps/web/.env.example`
- `docker-compose.yml`

## Agent boundaries

- orchestrator may update workflow state but must not implement product code
- builder may implement only the active phase and must stop if protected product paths would be touched without approval
- validator must not implement fixes
- reviewer must remain read-only
- release-manager may finalize workflow metadata only after PASS and must not push by default

## Command behavior

- commands should be small, explicit, and single-purpose
- commands should stop rather than guessing when a workflow invariant fails
- commands must distinguish internal workflow validation from product runtime validation
- commands must not surface `.opencode` state through web routes, API routes, session handlers, or customer docs
