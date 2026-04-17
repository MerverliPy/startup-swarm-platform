# Architecture

## Overview

This platform is split into two product-facing concerns:

1. **Swarm execution**
   - handled by `apps/api`
   - runs the orchestrator and specialist agents
   - stores run state and artifacts

2. **End-user product UX**
   - handled by `apps/web`
   - GitHub login
   - task creation and run views
   - optional Copilot-powered interactions

## Why this split exists

The swarm backend and the end-user SaaS surface have different operational needs:
- Python is practical for the OpenAI Agents SDK workflow layer.
- Next.js is practical for GitHub sign-in, product UI, and Copilot SDK integration.

## Request flow

```text
Browser
  -> Next.js app
  -> Next.js route handlers at /api/swarm/runs
  -> FastAPI API at /swarm/runs
  -> OpenAI-powered swarm execution
  -> run state persisted by apps/api in /runs (starter)
```

The web dashboard and create-run flow share the same API-backed persistence source. The
Next.js layer acts as the canonical web-facing entrypoint and proxies run requests to the
backend API instead of maintaining a second local run store.

## Authentication flow

### GitHub sign-in
- web app signs users in with GitHub OAuth
- browser-visible session data is limited to identity fields
- the GitHub provider token stays in the server-side Auth.js JWT path and is read through server helpers when needed

### GitHub repository access
Recommended upgrade path:
- use a **GitHub App** for repo-scoped installs, webhooks, and org-safe automation
- continue using GitHub OAuth or GitHub App user tokens for user attribution

### Copilot access
- Copilot access is user-based
- the product can call Copilot on behalf of the user by reading their GitHub token server-side
- debug and smoke-test routes stay outside the default dashboard path and require development mode or an internal key in production

## Storage

Starter implementation:
- local JSON files in `/runs`, written and read by `apps/api`

Web-side compatibility helpers must not become an authoritative persistence layer.

Production recommendation:
- Postgres for users, projects, runs, artifacts, approvals
- Redis for queueing and short-lived execution state
- object storage for large artifacts

## Reliability controls

- bounded critique/repair loop
- typed role outputs
- deterministic stage order
- explicit success criteria
- approval-gated side effects
