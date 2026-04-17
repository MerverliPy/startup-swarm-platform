---
description: Validate the active phase against its acceptance criteria
agent: validator
---

Read `.opencode/plans/current-phase.md`, review the changes for the active phase, and validate strictly against goal, scope, acceptance criteria, and the stated validation command. Always run `bash scripts/dev/workflow-check.sh` before declaring PASS.

Important:
- distinguish internal workflow validation from product runtime validation
- fail the phase if it altered protected product paths without explicit approval
