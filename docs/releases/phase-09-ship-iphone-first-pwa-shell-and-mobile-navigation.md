# Phase 09 — Ship iPhone-first PWA shell and mobile navigation

Status: pending
Release: v0.4.0
Phase file: docs/releases/phase-09-ship-iphone-first-pwa-shell-and-mobile-navigation.md

## Goal

Add the install, layout, and navigation foundations required for Startup Swarm Platform to behave like an intentional iPhone-friendly PWA rather than a compressed desktop dashboard.

## Why this phase is next

The PRD makes iPhone/PWA quality a major product requirement, but the current web app has no manifest, no Apple install metadata, no bottom navigation, no safe-area-aware layout, and no install coaching.

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

Medium. This phase changes shell-level web behavior, metadata, and navigation. The main risk is introducing install or layout polish that conflicts with the existing dashboard structure.

## Rollback note

Revert the manifest, mobile metadata, shell CSS, navigation components, and install coach if standalone mode or narrow-screen behavior regresses.

## In scope

- add a web manifest and Apple mobile web app metadata
- add an iPhone install coach for manual Add to Home Screen flow
- add safe-area-aware layout primitives
- add bottom navigation or another thumb-reachable primary navigation model
- rework narrow-screen dashboard layout to avoid raw wide blocks and cramped desktop assumptions

## Out of scope

- deep offline task execution
- full offline artifact synchronization
- native App Store packaging
- large-scale visual redesign unrelated to mobile shell behavior

## Tasks

- add `apps/web/app/manifest.ts` and required iOS metadata in the app shell
- add `apple-touch-icon` and any required static assets
- implement safe-area-aware spacing in `layout.tsx` and `globals.css`
- add a bounded mobile-first navigation surface for top-level destinations
- add install coaching logic that is shown only when relevant on iPhone Safari
- keep the shell changes compatible with the earlier structured dashboard phases

## Validation command

`(cd apps/web && npm run build)`

## Validation

Status: pending
Evidence:
- not run yet
Blockers:
- not validated yet
Ready to ship:
- no

## Acceptance criteria

- the app exposes a manifest and Apple install metadata
- the installed or installable shell has a valid touch icon
- primary navigation is reachable on narrow screens without relying on desktop sidebars
- safe-area spacing prevents clipped controls in iPhone-style standalone mode
- the dashboard remains readable on narrow screens after shell changes

## Release notes

- pending

## Completion summary

- pending
