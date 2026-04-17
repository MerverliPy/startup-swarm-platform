# Phase 06 — Secure session boundaries and gate debug surfaces

Status: in_progress
Release: v0.2.0
Phase file: docs/releases/phase-06-secure-session-boundaries-and-gate-debug-surfaces.md

## Goal

Remove GitHub access-token exposure from browser-visible session payloads and move debug and smoke-test surfaces out of the normal product path so auth and runtime boundaries match the PRD’s security requirements.

## Why this phase is next

After the runtime path is unified, the next highest-risk mismatch is that `apps/web/lib/auth.ts` still attaches `githubAccessToken` to the browser session while the dashboard exposes debug-oriented routes and smoke surfaces in normal user flows.

## Primary files

- `apps/web/lib/auth.ts`
- `apps/web/types/next-auth.d.ts`
- `apps/web/app/api/auth/[...nextauth]/route.ts`
- `apps/web/app/api/session-debug/route.ts`
- `apps/web/app/api/copilot-smoke/route.ts`
- `apps/web/components/copilot-smoke-button.tsx`
- `apps/web/app/dashboard/page.tsx`
- `README.md`
- `docs/architecture.md`

## Expected max files changed

9

## Risk

High. This phase changes the web auth/session contract and the server-side path used for Copilot diagnostics. Incorrect changes could break sign-in, server-side token access, or internal smoke testing.

## Rollback note

Revert the NextAuth callback changes, the server-side token helper changes, the diagnostics gating logic, the dashboard smoke-surface removal, and the related documentation updates.

## In scope

- remove `githubAccessToken` from the browser-visible session contract
- keep GitHub access tokens server-only inside the authenticated NextAuth/JWT path
- add explicit dev-only or internal-only gating to `session-debug` and `copilot-smoke`
- remove smoke-test controls from the default dashboard flow
- update auth and architecture docs so they describe the server-only token boundary accurately

## Out of scope

- platform JWT adoption for all swarm routes
- new approval actions, templates, or compare flows
- run-review UI redesign
- iPhone/PWA install or shell work
- backend storage or queue changes

## Tasks

- rewrite NextAuth callbacks so the browser session exposes identity fields only
- remove `githubAccessToken` from `apps/web/types/next-auth.d.ts`
- keep the GitHub access token accessible only through a server-side helper in `apps/web/lib/auth.ts`
- add an explicit diagnostics gate for `session-debug` and `copilot-smoke` based on environment and an optional internal key
- make `apps/web/app/api/copilot-smoke/route.ts` consume the server-only token helper instead of reading from `Session`
- remove `CopilotSmokeButton` from `apps/web/app/dashboard/page.tsx`
- align `README.md` and `docs/architecture.md` with the actual server-only token model and gated diagnostics behavior

## Validation command

`bash scripts/dev/workflow-check.sh && python -m compileall apps/api/app && (cd apps/web && npm run build)`

## Validation

Status: pending
Evidence:
- not run yet
Blockers:
- not validated yet
Ready to ship:
- no

## Acceptance criteria

- the browser session no longer contains a GitHub access token field
- server-side Copilot or GitHub calls still have an approved token retrieval path
- `session-debug` and `copilot-smoke` are not reachable through the default product flow in production mode
- the dashboard no longer presents smoke validation as a primary user action
- `README.md` and `docs/architecture.md` match the implemented token boundary and diagnostics gating behavior

## Release notes

- pending

## Completion summary

- pending
