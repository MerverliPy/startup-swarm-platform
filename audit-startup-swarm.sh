#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${1:-$PWD}"
cd "$ROOT"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  echo "PASS: $*"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "FAIL: $*"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
  echo "WARN: $*"
  WARN_COUNT=$((WARN_COUNT + 1))
}

have_file() {
  [[ -f "$1" ]]
}

get_env_value() {
  local file="$1"
  local key="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi
  grep -E "^${key}=" "$file" | tail -n 1 | cut -d= -f2-
}

mask_value() {
  local value="${1:-}"
  local len=${#value}
  if [[ $len -le 8 ]]; then
    printf '%s' "$value"
    return
  fi
  printf '%s***%s' "${value:0:4}" "${value: -4}"
}

is_placeholder() {
  local value="${1:-}"
  [[ -z "$value" ]] && return 0
  [[ "$value" == *"PUT_YOUR_"* ]] && return 0
  [[ "$value" == *"YOUR_REAL_"* ]] && return 0
  [[ "$value" == "change-me" ]] && return 0
  [[ "$value" == "change-me-internal" ]] && return 0
  [[ "$value" == "YOUR_GITHUB_CLIENT_ID" ]] && return 0
  [[ "$value" == "YOUR_GITHUB_CLIENT_SECRET" ]] && return 0
  [[ "$value" == "YOUR_REAL_GITHUB_CLIENT_ID" ]] && return 0
  [[ "$value" == "YOUR_REAL_GITHUB_CLIENT_SECRET" ]] && return 0
  return 1
}

check_required_file() {
  local file="$1"
  if have_file "$file"; then
    pass "Found file: $file"
  else
    fail "Missing file: $file"
  fi
}

check_env_key() {
  local file="$1"
  local key="$2"
  local value
  value="$(get_env_value "$file" "$key" || true)"

  if [[ -z "$value" ]]; then
    fail "$file missing $key"
    return
  fi

  if is_placeholder "$value"; then
    fail "$file has placeholder value for $key"
    return
  fi

  pass "$file has $key=$(mask_value "$value")"
}

compare_env_key() {
  local file1="$1"
  local file2="$2"
  local key="$3"

  local v1 v2
  v1="$(get_env_value "$file1" "$key" || true)"
  v2="$(get_env_value "$file2" "$key" || true)"

  if [[ -z "$v1" || -z "$v2" ]]; then
    warn "Cannot compare $key because one file is missing the value"
    return
  fi

  if [[ "$v1" == "$v2" ]]; then
    pass "$key matches between $file1 and $file2"
  else
    fail "$key differs between $file1 and $file2"
    echo "  $file1 => $(mask_value "$v1")"
    echo "  $file2 => $(mask_value "$v2")"
  fi
}

require_command() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    pass "Command available: $cmd"
  else
    fail "Command missing: $cmd"
  fi
}

echo "== Startup Swarm audit =="
echo "Repo root: $PWD"
echo

check_required_file ".env"
check_required_file "apps/web/.env.local"
check_required_file "apps/web/lib/auth.ts"
check_required_file "apps/web/app/api/auth/[...nextauth]/route.ts"
check_required_file "docker-compose.yml"

echo
echo "== Required commands =="
require_command docker
require_command curl
require_command grep

echo
echo "== Static env audit =="
check_env_key ".env" "AUTH_URL"
check_env_key ".env" "NEXTAUTH_URL"
check_env_key ".env" "AUTH_SECRET"
check_env_key ".env" "NEXTAUTH_SECRET"
check_env_key ".env" "GITHUB_ID"
check_env_key ".env" "GITHUB_SECRET"
check_env_key ".env" "PLATFORM_INTERNAL_API_KEY"

check_env_key "apps/web/.env.local" "AUTH_URL"
check_env_key "apps/web/.env.local" "NEXTAUTH_URL"
check_env_key "apps/web/.env.local" "AUTH_SECRET"
check_env_key "apps/web/.env.local" "NEXTAUTH_SECRET"
check_env_key "apps/web/.env.local" "GITHUB_ID"
check_env_key "apps/web/.env.local" "GITHUB_SECRET"
check_env_key "apps/web/.env.local" "PLATFORM_INTERNAL_API_KEY"

echo
echo "== Cross-file consistency =="
compare_env_key ".env" "apps/web/.env.local" "AUTH_URL"
compare_env_key ".env" "apps/web/.env.local" "NEXTAUTH_URL"
compare_env_key ".env" "apps/web/.env.local" "AUTH_SECRET"
compare_env_key ".env" "apps/web/.env.local" "NEXTAUTH_SECRET"
compare_env_key ".env" "apps/web/.env.local" "GITHUB_ID"
compare_env_key ".env" "apps/web/.env.local" "GITHUB_SECRET"
compare_env_key ".env" "apps/web/.env.local" "PLATFORM_INTERNAL_API_KEY"

APP_URL="$(get_env_value ".env" "AUTH_URL" || true)"
WEB_URL="${APP_URL:-http://localhost:3001}"

echo
echo "== Docker status =="
if docker compose ps >/dev/null 2>&1; then
  pass "docker compose is accessible"
else
  fail "docker compose is not accessible"
fi

WEB_RUNNING="$(docker compose ps --status running --services 2>/dev/null | grep -x 'web' || true)"
if [[ "$WEB_RUNNING" == "web" ]]; then
  pass "web service is running"
else
  fail "web service is not running"
fi

API_RUNNING="$(docker compose ps --status running --services 2>/dev/null | grep -x 'api' || true)"
if [[ "$API_RUNNING" == "api" ]]; then
  pass "api service is running"
else
  warn "api service is not running"
fi

echo
echo "== Container env audit =="
if docker compose exec -T web sh -lc 'printenv' >/dev/null 2>&1; then
  pass "Can inspect web container env"

  WEB_ENV="$(docker compose exec -T web sh -lc 'printenv | grep -E "AUTH_URL|NEXTAUTH_URL|AUTH_SECRET|NEXTAUTH_SECRET|GITHUB_ID|GITHUB_SECRET|PLATFORM_INTERNAL_API_KEY" || true')"

  for key in AUTH_URL NEXTAUTH_URL AUTH_SECRET NEXTAUTH_SECRET GITHUB_ID GITHUB_SECRET PLATFORM_INTERNAL_API_KEY; do
    if echo "$WEB_ENV" | grep -q "^${key}="; then
      pass "web container has $key"
    else
      fail "web container missing $key"
    fi
  done
else
  fail "Could not inspect web container env"
fi

echo
echo "== HTTP endpoint audit =="
check_http_code() {
  local url="$1"
  local expected="$2"
  local label="$3"
  local code
  code="$(curl -s -o /tmp/audit_body.$$ -w '%{http_code}' "$url" || true)"
  if [[ "$code" == "$expected" ]]; then
    pass "$label returned HTTP $code"
  else
    fail "$label returned HTTP $code (expected $expected)"
  fi
  rm -f /tmp/audit_body.$$ || true
}

check_http_code "$WEB_URL/" "200" "home page"
check_http_code "$WEB_URL/api/auth/session" "200" "auth session endpoint"
check_http_code "$WEB_URL/api/auth/providers" "200" "auth providers endpoint"
check_http_code "$WEB_URL/api/session-debug" "200" "session debug endpoint"

PROVIDERS_JSON="$(curl -s "$WEB_URL/api/auth/providers" || true)"
if echo "$PROVIDERS_JSON" | grep -qi 'github'; then
  pass "GitHub provider appears in /api/auth/providers"
else
  fail "GitHub provider missing from /api/auth/providers"
fi

SESSION_JSON="$(curl -s "$WEB_URL/api/auth/session" || true)"
if [[ "$SESSION_JSON" == "null" ]]; then
  warn "No active auth session in current non-browser audit request"
else
  pass "/api/auth/session returned non-null JSON"
fi

DEBUG_JSON="$(curl -s "$WEB_URL/api/session-debug" || true)"
if echo "$DEBUG_JSON" | grep -q '"authenticated":true'; then
  pass "session debug reports authenticated=true"
else
  warn "session debug does not report authenticated=true in this request"
fi

echo
echo "== OAuth redirect audit =="
SIGNIN_HEADERS="$(curl -s -D - -o /dev/null "$WEB_URL/api/auth/signin" || true)"
if echo "$SIGNIN_HEADERS" | grep -qi '^location:'; then
  pass "/api/auth/signin returns a redirect"
else
  warn "/api/auth/signin did not show a redirect in this audit"
fi

echo
echo "== Summary =="
echo "PASS: $PASS_COUNT"
echo "WARN: $WARN_COUNT"
echo "FAIL: $FAIL_COUNT"

if [[ $FAIL_COUNT -gt 0 ]]; then
  exit 1
fi

exit 0
