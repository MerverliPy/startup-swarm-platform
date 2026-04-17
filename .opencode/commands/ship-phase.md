---
description: Finalize a passed phase, synchronize workflow metadata, and prepare the repo for a manual or explicitly approved commit
agent: release-manager
---

Read `.opencode/plans/current-phase.md` and `docs/releases/phase-registry.md`. Only continue if validation status is PASS.

Important:
- do not push by default
- do not create or modify product-facing release notes
- stop if workflow state and registry state disagree
