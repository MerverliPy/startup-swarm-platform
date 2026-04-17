# Repository Rules

## Product intent

This repository is **Startup Swarm Platform**.

Its product model is a GitHub-authenticated platform with a bounded multi-stage swarm runtime, a product web dashboard, a FastAPI backend, and a Copilot-oriented sidecar/integration direction.

The internal OpenCode workflow exists only to help engineers create, modify, validate, and manage code safely against this repository.

It must **not** become:
- a product feature
- a public API concept
- a browser or dashboard workflow
- a customer auth surface
- a replacement for the existing product-side swarm runtime

## Monorepo map

- `apps/web` -> customer-facing Next.js UI, dashboard, auth, and product-side server routes
- `apps/api` -> FastAPI product API, auth exchange, runtime swarm logic, and run persistence
- `apps/copilot-cli` -> product-side Copilot CLI sidecar
- `.opencode/**` -> internal OpenCode workflow state, commands, and agent definitions
- `docs/releases/**` -> internal workflow phase documents
- `scripts/dev/**` -> internal workflow guardrails and repair scripts

## Operating model

Default workflow:
1. select the next bounded phase
2. load the full selected phase into `.opencode/plans/current-phase.md`
3. implement only that phase
4. validate only against that phase
5. fix only validator-identified blockers when needed
6. ship only after validation passes
7. keep workflow state synchronized

## Universal rules

- Work from `.opencode/plans/current-phase.md`
- Keep internal workflow concerns separate from product/runtime concerns
- Do not implement future-phase work
- Keep changes as small as possible while still completing the phase
- Prefer simple bounded solutions over speculative abstractions
- Do not silently redesign product architecture
- Do not use workflow files as substitutes for real product runtime services
- Report discrepancies between product docs/summary and implementation instead of silently redefining the product

## Product and boundary constraints

### Internal workflow only
The following are internal-only surfaces:
- `AGENTS.md`
- `opencode.json`
- `.opencode/**`
- `docs/releases/**`
- `scripts/dev/**`

### Product/runtime only
The following remain product-side and must not be absorbed into the internal workflow layer:
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

### Approval-gated paths
Do not modify the following without explicit approval in the active phase:
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
- `startup-swarm-platform-setup.sh`

### High-risk files
Treat these as high-risk product files:
- `apps/web/lib/auth.ts`
- `apps/web/app/api/auth/[...nextauth]/route.ts`
- `apps/api/app/routers/auth.py`
- `apps/api/app/auth/security.py`
- `apps/api/app/services/swarm.py`
- `apps/api/app/services/openai_swarm.py`
- `apps/web/lib/copilot-swarm.ts`
- `apps/web/app/api/copilot-smoke/route.ts`
- `docker-compose.yml`
- `.env.example`
- `startup-swarm-platform-setup.sh`

## Naming disambiguation

The terms `orchestrator`, `builder`, and `validator` appear in both the internal workflow and the product runtime.

Inside `.opencode/agents/**`, they mean **internal development workflow roles**.
Inside `apps/api/app/services/swarm.py` and `apps/web/lib/copilot-swarm.ts`, they refer to **product/runtime swarm stages**.

Do not conflate those systems.

## Validation discipline

For internal-only workflow phases, default to:
- `bash scripts/dev/doctor.sh`
- `bash scripts/dev/workflow-check.sh`
- `bash scripts/dev/autoflow.sh inspect-json`

Use `inspect-json` when the workflow state needs a machine-readable confirmation during internal-only dry runs.

For future product-touching phases, use phase-specific validation commands and explicit path scopes.

## Agent model

- `orchestrator` controls phase selection and workflow state
- `builder` implements only the active phase
- `validator` determines PASS or FAIL without helping the phase pass
- `reviewer` performs a strict read-only review when requested
- `release-manager` finalizes workflow state and may prepare a commit only after PASS; pushing is never default behavior
