# Phase 02 — Encode Startup Swarm Platform boundary rules

Status: complete
Release: v0.1.0
Phase file: docs/releases/phase-02-encode-startup-swarm-boundaries.md

## Goal

Rewrite the generic workflow rules so the internal workflow understands this monorepo’s product/runtime boundaries and protected paths.

## Why this phase is next

The portable scaffold is too generic until it is taught where product code begins, where internal workflow code ends, and which files are approval-gated.

## Primary files

- `AGENTS.md`
- `.opencode/AGENTS.md`
- `.opencode/agents/orchestrator.md`
- `.opencode/agents/builder.md`
- `.opencode/agents/validator.md`
- `.opencode/agents/reviewer.md`
- `.opencode/agents/release-manager.md`
- `opencode.json`

## Expected max files changed

8

## Risk

Medium. Incorrect boundary rules would allow workflow overreach into auth, frontend, backend, or Copilot product surfaces.

## Rollback note

Revert the boundary-rule rewrites in the workflow files.

## In scope

- define internal-only vs product-only surfaces
- define approval-gated paths
- define high-risk files
- disambiguate workflow roles from product swarm runtime roles

## Out of scope

- product implementation changes
- auth/session changes
- public API changes

## Tasks

- rewrite `AGENTS.md`
- rewrite `.opencode/AGENTS.md`
- adapt the workflow role files for repo-specific constraints
- harden watcher ignores in `opencode.json`

## Validation command

`bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh`

## Validation

Status: PASS
Evidence:
- Workflow rules now identify product-only paths and approval-gated files.
- `bash scripts/dev/doctor.sh && bash scripts/dev/workflow-check.sh` passes.
Blockers:
- none
Ready to ship:
- no

## Acceptance criteria

- Root workflow rules encode Startup Swarm Platform boundaries.
- Protected product paths are listed explicitly.
- Workflow roles no longer assume generic target-repo behavior.

## Release notes

- Added repo-specific boundary rules for the transplanted internal workflow.

## Completion summary

- The internal workflow now knows which files are workflow-only, which are product-only, and which product surfaces require explicit approval.
