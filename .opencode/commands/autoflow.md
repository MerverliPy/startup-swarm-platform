---
description: Execute the active phase end-to-end with bounded repairs and strict stop conditions
agent: orchestrator
---

Read:
- `.opencode/plans/current-phase.md`
- `docs/releases/phase-registry.md`
- `.opencode/backlog/candidates.yaml` when it exists
- `AGENTS.md`

You may also read these command files as behavioral references:
- `.opencode/commands/next-phase.md`
- `.opencode/commands/run-phase.md`
- `.opencode/commands/validate-phase.md`
- `.opencode/commands/fix-validation.md`
- `.opencode/commands/ship-phase.md`

Use `bash scripts/dev/autoflow.sh inspect-json` as the workflow source of truth.

Important:
- this workflow is internal-only
- do not surface workflow state through product UI, API, auth, or runtime files
- stop if the active phase would require changes under `apps/**` without explicit approval
