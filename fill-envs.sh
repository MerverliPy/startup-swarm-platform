#!/usr/bin/env bash
set -euo pipefail

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
  fi
}

echo "GitHub username:"
read -r GITHUB_USERNAME

echo "GitHub OAuth Client ID:"
read -r GITHUB_ID

echo "GitHub OAuth Client Secret:"
read -rs GITHUB_SECRET
echo

echo "OpenAI API key (press Enter to leave blank):"
read -rs OPENAI_API_KEY
echo

JWT_SECRET="$(generate_secret)"
NEXTAUTH_SECRET="$(generate_secret)"
PLATFORM_INTERNAL_API_KEY="$(generate_secret)"

cat > .env <<ENVEOF
# Shared
APP_NAME=Startup Swarm Platform
APP_ENV=development

# Network
API_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Platform auth
JWT_SECRET=${JWT_SECRET}
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY}

# Provider auth (web-first GitHub OAuth)
GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}
GITHUB_OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/callback/github

# Swarm provider
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=gpt-5.4-mini

# Optional Copilot / GitHub App follow-on integration
COPILOT_ENABLED=0
COPILOT_GITHUB_APP_CLIENT_ID=
COPILOT_GITHUB_APP_CLIENT_SECRET=
COPILOT_GITHUB_APP_ID=
COPILOT_GITHUB_PRIVATE_KEY=
ENVEOF

mkdir -p apps/api apps/web

cat > apps/api/.env <<ENVEOF
APP_NAME=Startup Swarm Platform API
API_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3001
JWT_SECRET=${JWT_SECRET}
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=gpt-5.4-mini
RUNS_DIR=/runs
ENVEOF

cat > apps/web/.env.local <<ENVEOF
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY}
GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}
COPILOT_ENABLED=0
ENVEOF

echo
echo "Created:"
echo "  .env"
echo "  apps/api/.env"
echo "  apps/web/.env.local"
echo
echo "GitHub username: ${GITHUB_USERNAME}"
echo "Frontend URL: http://localhost:3001"
echo "OAuth callback: http://localhost:3001/api/auth/callback/github"
