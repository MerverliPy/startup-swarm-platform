#!/usr/bin/env bash
set -euo pipefail

echo "GitHub OAuth Client ID:"
read -r GITHUB_ID

echo "GitHub OAuth Client Secret:"
read -rs GITHUB_SECRET
echo

echo "AUTH / NEXTAUTH secret:"
read -rs AUTH_SECRET
echo

echo "Platform internal API key:"
read -rs PLATFORM_INTERNAL_API_KEY
echo

echo "JWT secret:"
read -rs JWT_SECRET
echo

APP_URL="http://100.81.83.98:3001"
API_URL="http://100.81.83.98:8000"

cat > .env <<ENVEOF
APP_NAME=Startup Swarm Platform
APP_ENV=development

API_BASE_URL=http://api:8000
FRONTEND_BASE_URL=${APP_URL}
NEXT_PUBLIC_API_BASE_URL=${API_URL}

AUTH_URL=${APP_URL}
NEXTAUTH_URL=${APP_URL}
AUTH_SECRET=${AUTH_SECRET}
NEXTAUTH_SECRET=${AUTH_SECRET}
AUTH_TRUST_HOST=true

JWT_SECRET=${JWT_SECRET}
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY}

GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}
GITHUB_OAUTH_REDIRECT_URI=${APP_URL}/api/auth/callback/github

AI_PROVIDER=copilot
COPILOT_MODEL=gpt-4.1
COPILOT_LOG_LEVEL=info
COPILOT_CLI_PATH=/usr/local/bin/copilot

OPENAI_MODEL=gpt-4.1
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=

COPILOT_ENABLED=1
ENVEOF

mkdir -p apps/web
cat > apps/web/.env.local <<ENVEOF
API_BASE_URL=http://api:8000
NEXT_PUBLIC_API_BASE_URL=${API_URL}
AUTH_URL=${APP_URL}
NEXTAUTH_URL=${APP_URL}
AUTH_SECRET=${AUTH_SECRET}
NEXTAUTH_SECRET=${AUTH_SECRET}
AUTH_TRUST_HOST=true

PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY}

GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}

AI_PROVIDER=copilot
COPILOT_MODEL=gpt-4.1
COPILOT_LOG_LEVEL=info
COPILOT_CLI_PATH=/usr/local/bin/copilot

OPENAI_MODEL=gpt-4.1
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=

COPILOT_ENABLED=1
ENVEOF

echo
echo "Wrote:"
echo "  .env"
echo "  apps/web/.env.local"
echo
echo "Verify:"
grep -nE 'GITHUB_ID|GITHUB_SECRET|AUTH_URL|NEXTAUTH_URL' .env apps/web/.env.local | sed 's/=.*/=***redacted***/'
