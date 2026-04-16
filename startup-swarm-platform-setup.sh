#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# startup-swarm-platform local bootstrap
# ============================================================
# Usage:
#   1) Edit the variables in the CONFIG section below
#   2) Make sure the scaffold zip exists at ZIP_PATH
#   3) Run:
#        bash startup-swarm-platform-setup.sh
#
# This script will:
#   - create your dev directory
#   - unzip the patched scaffold
#   - initialize git if needed
#   - create env files
#   - inject your secrets and GitHub OAuth values
#   - create the runs directory
#   - create the initial git commit
#   - add the GitHub remote
#   - push to GitHub
#   - start the stack with docker compose
# ============================================================

# -----------------------------
# CONFIG: EDIT THESE VALUES
# -----------------------------
DEV_PARENT_DIR="$HOME/dev"
REPO_NAME="startup-swarm-platform"
ZIP_PATH="$HOME/setup/startup-swarm-platform/startup-swarm-platform-patched.zip"

GITHUB_USERNAME="MerverliPY"
GITHUB_REMOTE_MODE="ssh"   # ssh or https

GITHUB_OAUTH_CLIENT_ID="Ov23limMI6AXdgV8eUte"
GITHUB_OAUTH_CLIENT_SECRET="b23dcb031f0600820589ebe1b5e0ad38d4996524"

OPENAI_API_KEY="YOUR_OPENAI_API_KEY_OR_LEAVE_BLANK"
OPENAI_MODEL="gpt-5.4-mini"

# Optional: if you want fixed secrets, set them manually.
# Otherwise leave as AUTO and the script will generate them.
NEXTAUTH_SECRET_VALUE="AUTO"
JWT_SECRET_VALUE="AUTO"
PLATFORM_INTERNAL_API_KEY_VALUE="AUTO"

# -----------------------------
# PRECHECKS
# -----------------------------
command -v git >/dev/null 2>&1 || { echo "git is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker is required"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "docker compose is required"; exit 1; }

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "Scaffold zip not found at: $ZIP_PATH"
  echo "Download the patched scaffold zip first, then rerun this script."
  exit 1
fi

if [[ "$GITHUB_USERNAME" == "YOUR_GITHUB_USERNAME" ]]; then
  echo "Edit GITHUB_USERNAME in the CONFIG section first."
  exit 1
fi

if [[ "$GITHUB_OAUTH_CLIENT_ID" == "YOUR_GITHUB_CLIENT_ID" ]]; then
  echo "Edit GITHUB_OAUTH_CLIENT_ID in the CONFIG section first."
  exit 1
fi

if [[ "$GITHUB_OAUTH_CLIENT_SECRET" == "YOUR_GITHUB_CLIENT_SECRET" ]]; then
  echo "Edit GITHUB_OAUTH_CLIENT_SECRET in the CONFIG section first."
  exit 1
fi

# -----------------------------
# SECRET GENERATION
# -----------------------------
make_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
  fi
}

if [[ "$NEXTAUTH_SECRET_VALUE" == "AUTO" ]]; then
  NEXTAUTH_SECRET_VALUE="$(make_secret)"
fi
if [[ "$JWT_SECRET_VALUE" == "AUTO" ]]; then
  JWT_SECRET_VALUE="$(make_secret)"
fi
if [[ "$PLATFORM_INTERNAL_API_KEY_VALUE" == "AUTO" ]]; then
  PLATFORM_INTERNAL_API_KEY_VALUE="$(make_secret)"
fi

# -----------------------------
# CREATE DEV DIR + UNZIP
# -----------------------------
mkdir -p "$DEV_PARENT_DIR"
cd "$DEV_PARENT_DIR"

if [[ -d "$REPO_NAME" ]]; then
  echo "Directory already exists: $DEV_PARENT_DIR/$REPO_NAME"
  echo "Delete or rename it if you want a fresh bootstrap."
  exit 1
fi

unzip "$ZIP_PATH" >/dev/null
cd "$REPO_NAME"

# -----------------------------
# GIT INIT
# -----------------------------
if [[ ! -d .git ]]; then
  git init
fi

git branch -M main

# -----------------------------
# ENV FILES
# -----------------------------
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
mkdir -p runs

# -----------------------------
# WRITE ROOT .env
# -----------------------------
cat > .env <<EOF_ENV
APP_NAME=Startup Swarm Platform
APP_ENV=development

API_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

JWT_SECRET=$JWT_SECRET_VALUE
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET_VALUE
PLATFORM_INTERNAL_API_KEY=$PLATFORM_INTERNAL_API_KEY_VALUE

GITHUB_ID=$GITHUB_OAUTH_CLIENT_ID
GITHUB_SECRET=$GITHUB_OAUTH_CLIENT_SECRET
GITHUB_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback/github

OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=$OPENAI_MODEL

COPILOT_ENABLED=0
COPILOT_GITHUB_APP_CLIENT_ID=
COPILOT_GITHUB_APP_CLIENT_SECRET=
COPILOT_GITHUB_APP_ID=
COPILOT_GITHUB_PRIVATE_KEY=
EOF_ENV

# -----------------------------
# WRITE apps/api/.env
# -----------------------------
cat > apps/api/.env <<EOF_API
APP_NAME=Startup Swarm Platform API
API_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3000
JWT_SECRET=$JWT_SECRET_VALUE
PLATFORM_INTERNAL_API_KEY=$PLATFORM_INTERNAL_API_KEY_VALUE
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=$OPENAI_MODEL
RUNS_DIR=/runs
EOF_API

# -----------------------------
# WRITE apps/web/.env.local
# -----------------------------
cat > apps/web/.env.local <<EOF_WEB
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET_VALUE
PLATFORM_INTERNAL_API_KEY=$PLATFORM_INTERNAL_API_KEY_VALUE
GITHUB_ID=$GITHUB_OAUTH_CLIENT_ID
GITHUB_SECRET=$GITHUB_OAUTH_CLIENT_SECRET
COPILOT_ENABLED=0
EOF_WEB

# -----------------------------
# GIT COMMIT
# -----------------------------
git add .
if ! git diff --cached --quiet; then
  git commit -m "chore: initialize startup-swarm-platform"
fi

# -----------------------------
# GIT REMOTE
# -----------------------------
if [[ "$GITHUB_REMOTE_MODE" == "ssh" ]]; then
  REMOTE_URL="git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git"
else
  REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

# -----------------------------
# PUSH
# -----------------------------
git push -u origin main

# -----------------------------
# START SERVICES
# -----------------------------
docker compose up --build
