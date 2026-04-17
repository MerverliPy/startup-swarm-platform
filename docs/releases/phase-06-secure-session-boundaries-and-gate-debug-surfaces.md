# Phase 06 — Secure session boundaries and gate debug surfaces

Status: pending
Release: v0.2.0
Phase file: docs/releases/phase-06-secure-session-boundaries-and-gate-debug-surfaces.md

## Goal

Remove GitHub access-token exposure from browser-visible session payloads and move debug and smoke-test surfaces out of the normal product path so auth and runtime boundaries match the PRD’s security requirements.

## Why this phase is next

After the runtime path is unified, the next highest-risk mismatch is that `apps/web/lib/auth.ts` still attaches `githubAccessToken` to the browser session while the dashboard exposes debug-oriented routes and smoke surfaces in normal user flows.

## Primary files

- `apps/web/lib/auth.ts`
- `apps/web/app/api/auth/[...nextauth]/route.ts`
- `apps/web/app/api/session-debug/route.ts`
- `apps/web/app/api/copilot-smoke/route.ts`
- `apps/web/components/copilot-smoke-button.tsx`
- `apps/web/components/session-provider.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/api/app/routers/auth.py`
- `apps/api/app/auth/security.py`
- `README.md`
- `docs/architecture.md`

## Expected max files changed

11

## Risk

High. This phase changes auth/session contracts and any server-side code that depends on GitHub tokens. Incorrect changes could break sign-in, Copilot integration, or internal diagnostics.

## Rollback note

Revert the NextAuth callback changes, any server-side token lookup changes, the debug-route gating changes, and the related documentation updates.

## In scope

- remove `githubAccessToken` from the browser-visible session contract
- keep GitHub access tokens server-only
- move smoke and session-debug routes behind explicit dev-only or internal-only gating
- remove smoke-test controls from the default dashboard flow
- update auth and architecture docs so they describe the server-only token boundary accurately

## Out of scope

- canonical run-path selection
- structured run-review UI
- workspaces, templates, compare, or approval inbox
- iPhone/PWA install behavior

## Tasks

- rewrite NextAuth callbacks so the browser session contains identity metadata only
- update any server-side token retrieval helper to source tokens without exposing them through `Session`
- add explicit gating to `session-debug` and `copilot-smoke` routes
- remove the smoke-test button from the normal dashboard surface
- align `README.md` and `docs/architecture.md` with the server-only token model
- verify that backend auth/security helpers still match the chosen token flow

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

- the browser session no longer contains a GitHub access token field
- server-side Copilot or GitHub calls still have an approved token retrieval path
- `session-debug` and `copilot-smoke` are not reachable through the default product flow in production mode
- the dashboard no longer presents smoke validation as a primary user action
- product auth docs match the implemented token boundary

## Release notes

- pending

## Completion summary

- pending
