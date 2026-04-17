# Startup Swarm Platform

A production-oriented starter repository for a multi-agent collaboration platform where users sign in with GitHub, run structured AI workflows, and can later layer GitHub Copilot on top of the same identity model.

## What changed in this revision

This revision makes the starter more coherent in two places:

- **Web-first auth**: GitHub OAuth now belongs to the Next.js app. The raw GitHub provider token is no longer surfaced in the browser session.
- **Deterministic swarm execution**: the FastAPI backend now runs a real manager-controlled loop with orchestrator, builder, critic, optional repair, optional marketing, and validator stages.

## What this repo is

This repository is a monorepo starter for a real product, not just a demo script.

It includes:
- `apps/web`: a Next.js web app for sign-in, dashboard, task submission, and future Copilot session wiring.
- `apps/api`: a FastAPI backend for swarm orchestration, run state, and internal platform-session exchange.
- `docs/`: architecture and integration notes.

## Core product idea

Users log in with GitHub, submit a task, and the platform runs a controlled specialist workflow:

1. Orchestrator
2. Builder
3. Critic
4. Optional repair pass
5. Optional marketer
6. Validator

The platform stores run state, limits loops, and keeps the control plane deterministic.

## Authentication model

### Web-first GitHub OAuth
GitHub OAuth lives in the Next.js layer. The browser gets a normal signed-in session, but the starter does **not** push the raw GitHub access token into the client-visible session object.

### Internal platform session exchange
When the web app needs a backend platform token, it can call the API's internal exchange endpoint:

- `POST /auth/session/exchange`
- protected by `x-platform-internal-key`
- accepts a minimal identity payload from the signed-in web session
- returns a platform JWT for backend use

This keeps provider auth separate from platform auth.

### Copilot inside the platform
The intended architecture is:

- GitHub sign-in handled by the web app
- GitHub-backed Copilot calls handled server-side
- platform JWTs used for your own backend APIs

That means GitHub identity can power both your product session model and later Copilot-based features without treating Copilot as a standalone identity provider.

## Monorepo layout

```text
apps/
  api/   -> FastAPI swarm backend
  web/   -> Next.js product UI

docs/
  architecture.md
  github-copilot.md
```

## Swarm execution model

The backend now runs a real bounded flow in `apps/api/app/services/swarm.py`:

1. create a run record
2. orchestrator builds plan + success criteria
3. builder creates the initial artifact
4. critic evaluates blockers / major issues / minor issues
5. one bounded repair pass runs if needed
6. optional marketing artifact is added
7. validator returns `passed`, `failed`, or `needs_approval`

### Current validation behavior

- `require_repo_context=true` currently fails because repo retrieval is not wired into the run path yet.
- `production_ready` moves the run to `needs_approval` if infrastructure risks remain.
- otherwise the run can pass with explicit artifacts for every stage.

## Quick start

### 1. Create the GitHub OAuth app
For local development, use:

- **Homepage URL**: `http://localhost:3001`
- **Authorization callback URL**: `http://localhost:3001/api/auth/callback/github`

### 2. Fill env files
Copy the templates and keep the values aligned across the repo:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Set at minimum:

- `GITHUB_ID`
- `GITHUB_SECRET`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `PLATFORM_INTERNAL_API_KEY`
- `OPENAI_API_KEY` when you replace the deterministic starter logic with model-backed agent calls

### 3. Start the stack

```bash
docker compose up --build
```

The canonical run path in this starter is:

```text
browser/dashboard form
  -> apps/web route handlers at /api/swarm/runs
  -> apps/api /swarm/runs
  -> JSON run persistence in the API runs directory
```

The web app no longer maintains a separate authoritative run store.

### 4. Open the apps
- Web: `http://localhost:3001`
- API docs: `http://localhost:8000/docs`

## Key files to inspect first

- `apps/web/lib/auth.ts`
- `apps/api/app/routers/auth.py`
- `apps/api/app/services/swarm.py`
- `.env.example`

## Recommended next patches after this revision

1. Add protected Next.js route handlers that use `exchangePlatformSession()` for server-to-server API calls.
2. Move swarm API routes behind platform JWT auth.
3. Replace deterministic builder / critic logic with typed model-backed agents.
4. Add persistent storage beyond JSON files.
5. Add GitHub App installation flow for repository import and finer-grained org access.

## Notes on GitHub auth choice

This repo still starts with **GitHub OAuth App** for the MVP sign-in flow.

Recommended upgrade path:
- keep OAuth App for initial sign-in
- add a **GitHub App** for repo installs, org access, and production-grade GitHub permissions
- layer Copilot SDK into server routes that run on behalf of the signed-in GitHub user
