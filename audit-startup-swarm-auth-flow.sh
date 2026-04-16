#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${1:-$PWD}"
cd "$ROOT"

WEB_URL_DEFAULT="http://100.81.83.98:3001"
WEB_URL="$(grep -E '^AUTH_URL=' .env 2>/dev/null | tail -n 1 | cut -d= -f2- || true)"
WEB_URL="${WEB_URL:-$WEB_URL_DEFAULT}"

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

section() {
  echo
  echo "== $* =="
}

http_code() {
  local url="$1"
  curl -s -o /tmp/auth_audit_body.$$ -w '%{http_code}' "$url" || true
}

cleanup() {
  rm -f /tmp/auth_audit_body.$$ /tmp/auth_audit_headers.$$ /tmp/auth_audit_web.log.$$ 2>/dev/null || true
}
trap cleanup EXIT

section "Context"
echo "Repo root: $PWD"
echo "Web URL: $WEB_URL"

section "Basic endpoint checks"

CODE="$(http_code "$WEB_URL/")"
if [[ "$CODE" == "200" ]]; then
  pass "Home page reachable ($CODE)"
else
  fail "Home page returned HTTP $CODE"
fi

CODE="$(http_code "$WEB_URL/api/auth/providers")"
if [[ "$CODE" == "200" ]]; then
  pass "/api/auth/providers reachable ($CODE)"
else
  fail "/api/auth/providers returned HTTP $CODE"
fi

CODE="$(http_code "$WEB_URL/api/auth/session")"
if [[ "$CODE" == "200" ]]; then
  pass "/api/auth/session reachable ($CODE)"
else
  fail "/api/auth/session returned HTTP $CODE"
fi

CODE="$(http_code "$WEB_URL/api/session-debug")"
if [[ "$CODE" == "200" ]]; then
  pass "/api/session-debug reachable ($CODE)"
else
  fail "/api/session-debug returned HTTP $CODE"
fi

section "Provider payload"
PROVIDERS_JSON="$(curl -s "$WEB_URL/api/auth/providers" || true)"
echo "$PROVIDERS_JSON"
if echo "$PROVIDERS_JSON" | grep -qi 'github'; then
  pass "GitHub provider present in /api/auth/providers"
else
  fail "GitHub provider missing from /api/auth/providers"
fi

section "Current session state"
SESSION_JSON="$(curl -s "$WEB_URL/api/auth/session" || true)"
DEBUG_JSON="$(curl -s "$WEB_URL/api/session-debug" || true)"

echo "-- /api/auth/session --"
echo "$SESSION_JSON"
echo "-- /api/session-debug --"
echo "$DEBUG_JSON"

if [[ "$SESSION_JSON" == "null" ]]; then
  warn "No active session in this shell-based check"
else
  pass "Session endpoint returned non-null JSON"
fi

if echo "$DEBUG_JSON" | grep -q '"authenticated":true'; then
  pass "Session debug reports authenticated=true"
else
  warn "Session debug reports authenticated=false in this request"
fi

section "Signin redirect header audit"
curl -s -D /tmp/auth_audit_headers.$$ -o /dev/null "$WEB_URL/api/auth/signin" || true
cat /tmp/auth_audit_headers.$$

if grep -qi '^location:' /tmp/auth_audit_headers.$$; then
  pass "/api/auth/signin returned a Location header"
else
  warn "/api/auth/signin did not return a visible Location header in this shell request"
fi

section "Recent web logs"
echo "Capturing recent web logs to /tmp/auth_audit_web.log.$$"
docker compose logs --tail=200 web > /tmp/auth_audit_web.log.$$ 2>&1 || true
tail -n 80 /tmp/auth_audit_web.log.$$ || true

section "Manual auth-flow checklist"
cat <<CHECKLIST

1. On your phone, open:
   $WEB_URL

2. Tap:
   Sign in with GitHub

3. Complete the GitHub login/consent flow completely.

4. After GitHub redirects back, immediately open:
   $WEB_URL/api/auth/session

5. Then open:
   $WEB_URL/api/session-debug

6. Expected success:
   - /api/auth/session is NOT null
   - /api/session-debug shows:
     "authenticated": true
     "hasGithubAccessToken": true

7. If it still fails, run this command in another shell while repeating the sign-in:
   docker compose logs -f web

8. Copy the lines that appear after the sign-in attempt, especially any lines containing:
   /api/auth/callback/github
   /api/auth/session
   /api/session-debug
   error
CHECKLIST

section "Summary"
echo "PASS: $PASS_COUNT"
echo "WARN: $WARN_COUNT"
echo "FAIL: $FAIL_COUNT"

if [[ $FAIL_COUNT -gt 0 ]]; then
  exit 1
fi
exit 0
