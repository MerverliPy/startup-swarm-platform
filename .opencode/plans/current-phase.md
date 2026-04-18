# Phase 09 — Ship iPhone-first PWA shell and mobile navigation

Status: complete
Release: v0.4.0
Phase file: docs/releases/phase-09-ship-iphone-first-pwa-shell-and-mobile-navigation.md
Phase kind: product-touching
Protected path approval required: yes
Protected path approval granted: yes

## Goal

Add the install, layout, and navigation foundations required for Startup Swarm Platform to behave like an intentional iPhone-friendly PWA rather than a compressed desktop dashboard.

## Why this phase is next

The repo is complete through the approval/history/template foundation, but the next PRD-aligned gap is shell quality on iPhone. The current web app still lacks a manifest, Apple install metadata, safe-area-aware spacing, and thumb-reachable primary navigation.

## Explicit approval for protected product paths

User approval is granted for this phase to modify only the bounded product paths required to complete Phase 09.

Approved protected paths for this phase:
- `apps/web/**`
- `docs/architecture.md`

Approved primary files for this phase:
- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/next.config.ts`
- `apps/web/app/manifest.ts`
- `apps/web/components/install-coach.tsx`
- `apps/web/components/bottom-nav.tsx`
- `apps/web/public/apple-touch-icon.png`
- `docs/architecture.md`

Approval constraints:
- do not modify `apps/api/**`
- do not modify `apps/copilot-cli/**`
- do not modify auth/session boundary files, env files, setup scripts, or `docker-compose.yml` as part of this phase
- keep changes bounded to installability, safe-area layout, narrow-screen readability, and primary mobile navigation
- preserve the canonical swarm runtime path and the Phase 07/08 structured review surfaces while adapting the shell for mobile use

## Primary files

- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/next.config.ts`
- `apps/web/app/manifest.ts`
- `apps/web/components/install-coach.tsx`
- `apps/web/components/bottom-nav.tsx`
- `apps/web/public/apple-touch-icon.png`
- `docs/architecture.md`

## Expected max files changed

10

## Risk

Medium. This phase changes shell-level web behavior, metadata, and navigation. The main risk is introducing install or layout polish that conflicts with the existing dashboard structure or regresses the current desktop experience.

## Rollback note

Revert the manifest, Apple metadata, install coach, safe-area layout primitives, and mobile navigation if standalone mode or narrow-screen behavior regresses.

## In scope

- add a web manifest and Apple mobile web app metadata
- add an iPhone install coach for the manual Add to Home Screen flow
- add safe-area-aware layout primitives and shell spacing
- add a bounded mobile-first primary navigation surface
- rework narrow-screen landing and dashboard layout to avoid wide desktop assumptions

## Out of scope

- deep offline task execution
- full offline artifact synchronization
- native App Store packaging
- major redesign of run semantics, approval logic, or API behavior
- auth/session changes unrelated to the mobile shell

## Tasks

- add `apps/web/app/manifest.ts` and wire required PWA metadata through the app shell
- add `apple-touch-icon` and any required static install assets
- implement safe-area-aware spacing in `layout.tsx` and `globals.css`
- add a bounded mobile-first navigation surface for top-level destinations
- add install coaching logic that appears only when relevant on iPhone Safari
- keep dashboard and structured run surfaces readable on narrow screens without breaking the current desktop layout

## Validation command

`(cd apps/web && npm run build)`

## Validation

Status: PASS
Evidence:
- Internal workflow validation passed: `bash scripts/dev/workflow-check.sh`
- Required product runtime validation passed: `(cd apps/web && npm run build)`
- The app now exposes a manifest and Apple install metadata via `apps/web/app/manifest.ts` and `apps/web/app/layout.tsx`
- A valid touch icon exists at `apps/web/public/apple-touch-icon.png`, primary narrow-screen navigation is provided by `apps/web/components/bottom-nav.tsx`, and safe-area-aware shell spacing is implemented in `apps/web/app/globals.css`
- Narrow-screen home/dashboard readability was improved in `apps/web/app/page.tsx` and `apps/web/app/dashboard/page.tsx` without touching unapproved product areas
Blockers:
- none
Ready to ship:
- yes

## Acceptance criteria

- the app exposes a manifest and Apple install metadata
- the installed or installable shell has a valid touch icon
- primary navigation is reachable on narrow screens without relying on desktop sidebars
- safe-area spacing prevents clipped controls in iPhone-style standalone mode
- the dashboard remains readable on narrow screens after shell changes

## Release notes

- Phase 09 shipped with iPhone-first PWA shell, install metadata, safe-area handling, and mobile navigation foundations.

## Completion summary

- Phase 09 is complete and validated; the web shell now includes the bounded PWA and mobile-navigation foundation required for the next product phase.
