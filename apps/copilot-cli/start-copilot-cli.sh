#!/bin/sh
set -eu

echo "== copilot-cli debug start =="

if [ -n "${COPILOT_GITHUB_TOKEN:-}" ]; then
  echo "COPILOT_GITHUB_TOKEN=present"
else
  echo "COPILOT_GITHUB_TOKEN=MISSING"
fi

echo "-- which copilot --"
which copilot || true

echo "-- copilot --version --"
copilot --version 2>&1 || true

echo "-- copilot --help --"
copilot --help 2>&1 || true

echo "-- launching headless server --"
exec copilot --headless --port 4321
