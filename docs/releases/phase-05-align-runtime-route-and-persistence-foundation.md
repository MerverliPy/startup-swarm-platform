# Phase 05 — Align runtime route and persistence foundation

Status: pending
Release: v0.2.0
Phase file: docs/releases/phase-05-align-runtime-route-and-persistence-foundation.md

## Goal

Establish one canonical product run path from the web app to the backend API and one shared run-persistence source so the dashboard, create-run flow, and run-detail flow all operate on the same data model.

## Why this phase is next

The current repo still has a missing web swarm route, split run persistence between `apps/api` and `apps/web`, and multiple overlapping execution helpers. Those mismatches directly block the PRD’s foundation-alignment goals and make every later UI or approval feature fragile.

## Primary files

- `apps/web/components/task-form.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/lib/api.ts`
- `apps/web/app/api/swarm/runs/route.ts`
- `apps/web/app/api/swarm/runs/[run_id]/route.ts`
- `apps/api/app/routers/swarm.py`
- `apps/api/app/services/swarm.py`
- `apps/web/lib/run-store.ts`
- `README.md`
- `docs/architecture.md`
- `docker-compose.yml`

## Expected max files changed

11

## Risk

High. This phase touches the product run-creation path, product persistence boundaries, and runtime documentation. A partial implementation could break dashboard creation or run retrieval.

## Rollback note

Revert the web swarm route handlers, route wiring, persistence-source selection, and the related documentation updates in `README.md`, `docs/architecture.md`, and `docker-compose.yml`.

## In scope

- choose and document one canonical run-creation path
- add the missing web route handlers required by the dashboard form
- make the dashboard read from the same persistence source used by run creation
- eliminate split authority between API-side runs and `apps/web/lib/run-store.ts`
- sort run history by explicit timestamps instead of filename order
- update setup and architecture docs to match the chosen runtime path

## Out of scope

- browser-session or GitHub token cleanup
- approval workflow actions
- templates, workspaces, or compare UI
- iPhone/PWA install surfaces
- output-schema redesign beyond what is minimally required for shared persistence

## Tasks

- decide whether the canonical product path is `apps/web` route handlers proxying to `apps/api`, or direct web fetches to `apps/api`
- implement the missing `apps/web/app/api/swarm/runs` route handlers if the proxy pattern is chosen
- remove or deprecate non-canonical run helpers after the canonical path is selected
- make `apps/web/app/dashboard/page.tsx` consume the same run source used by create-run
- update API run persistence so list ordering uses explicit run timestamps, not filename sort order
- either delete `apps/web/lib/run-store.ts` from product use or reduce it to a non-authoritative compatibility shim
- align `README.md`, `docs/architecture.md`, and `docker-compose.yml` with the chosen runtime path and ports

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

- `apps/web/components/task-form.tsx` no longer posts to a missing route
- the dashboard and create-run flow use the same backend-authoritative run source
- run list ordering is based on explicit timestamp metadata rather than filename order
- non-canonical run helpers are either removed from product use or clearly marked deprecated
- `README.md`, `docs/architecture.md`, and `docker-compose.yml` describe the same canonical runtime path

## Release notes

- pending

## Completion summary

- pending
