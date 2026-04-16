#!/usr/bin/env bash
set -euo pipefail

START_PORT="${1:-3001}"
END_PORT="${2:-3999}"

port_in_use() {
  local port="$1"

  if command -v ss >/dev/null 2>&1; then
    ss -ltnH | awk '{print $4}' | grep -Eq "(^|[:.])${port}$"
    return
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"${port}" -sTCP:LISTEN -n -P >/dev/null 2>&1
    return
  fi

  echo "Error: neither 'ss' nor 'lsof' is installed." >&2
  exit 1
}

for port in $(seq "$START_PORT" "$END_PORT"); do
  if ! port_in_use "$port"; then
    echo "$port"
    exit 0
  fi
done

echo "No free port found in range ${START_PORT}-${END_PORT}" >&2
exit 1
