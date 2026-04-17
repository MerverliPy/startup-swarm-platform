#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
missing=0
check_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    printf 'OK   %s\n' "$path"
  else
    printf 'MISS %s\n' "$path"
    missing=1
  fi
}
printf 'Repo root: %s\n' "$ROOT_DIR"

# Workflow surfaces
for f in \
  opencode.json \
  AGENTS.md \
  .opencode/AGENTS.md \
  .opencode/agents/orchestrator.md \
  .opencode/agents/builder.md \
  .opencode/agents/reviewer.md \
  .opencode/agents/validator.md \
  .opencode/agents/release-manager.md \
  .opencode/commands/autoflow.md \
  .opencode/commands/next-phase.md \
  .opencode/commands/run-phase.md \
  .opencode/commands/review-phase.md \
  .opencode/commands/validate-phase.md \
  .opencode/commands/fix-validation.md \
  .opencode/commands/ship-phase.md \
  .opencode/commands/phase-status.md \
  .opencode/commands/workflow-check.md \
  .opencode/plans/current-phase.md \
  .opencode/backlog/candidates.yaml \
  docs/releases/phase-registry.md \
  docs/releases/phase-template.md \
  docs/releases/phase-01-introduce-internal-workflow-scaffold.md \
  docs/releases/phase-02-encode-startup-swarm-boundaries.md \
  docs/releases/phase-03-harden-monorepo-workflow-checks.md \
  docs/releases/phase-04-seed-internal-release-state.md \
  scripts/dev/autoflow.sh \
  scripts/dev/workflow-check.sh \
  scripts/dev/repair-phase-metadata.sh \
  scripts/dev/repair-backlog-phase-ref.sh; do
  check_file "$f"
done

# Repo anchors the workflow is expected to protect
for f in \
  README.md \
  .env.example \
  docker-compose.yml \
  docs/architecture.md \
  docs/github-copilot.md \
  apps/web/lib/auth.ts \
  apps/web/lib/copilot-swarm.ts \
  apps/web/components/task-form.tsx \
  apps/web/lib/run-store.ts \
  apps/api/app/routers/auth.py \
  apps/api/app/routers/swarm.py \
  apps/api/app/services/swarm.py \
  apps/api/app/services/openai_swarm.py; do
  check_file "$f"
done

if [[ "$missing" -ne 0 ]]; then
  printf 'Doctor check failed.\n' >&2
  exit 1
fi
printf 'Doctor check passed.\n'
