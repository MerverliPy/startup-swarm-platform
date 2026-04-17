---
description: Select the correct next implementation phase and load it into the current phase file
agent: orchestrator
---

Read in this order:
- `.opencode/plans/current-phase.md`
- `docs/releases/phase-registry.md`
- `.opencode/backlog/candidates.yaml` when it exists

Selection rules:
1. If the current phase is still in progress or failed, keep it active unless the user explicitly changes scope.
2. If the current release phase is complete and there is another incomplete release phase in `docs/releases/phase-registry.md`, select that release phase.
3. If all listed release phases are already complete, select the next work item from `.opencode/backlog/candidates.yaml`.
4. When selecting from backlog candidates, apply this deterministic order:
   - explicit user scope
   - highest priority
   - same module follow-up
   - smallest safe scope
   - clearest validation
5. Never select a generic or multi-module task when a smaller bounded candidate exists.
6. Only entries under `candidates` are selectable; do not select from `deferred_local_first_candidates` or `archived`.
