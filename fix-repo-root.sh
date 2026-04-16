#!/usr/bin/env bash
set -euo pipefail

OUTER_DIR="${1:-$PWD}"
INNER_DIR="${OUTER_DIR}/startup-swarm-platform"

if [[ ! -d "$INNER_DIR" ]]; then
  echo "Inner repo folder not found: $INNER_DIR" >&2
  exit 1
fi

echo "Outer dir: $OUTER_DIR"
echo "Inner dir: $INNER_DIR"

shopt -s dotglob nullglob

for item in "$INNER_DIR"/*; do
  base="$(basename "$item")"

  if [[ -e "$OUTER_DIR/$base" ]]; then
    echo "Skipping existing path: $base"
    continue
  fi

  mv "$item" "$OUTER_DIR/"
done

rmdir "$INNER_DIR"

echo
echo "Repo root fixed."
echo "Use this as the real repo root now:"
echo "  cd $OUTER_DIR"
echo
echo "Current contents:"
find "$OUTER_DIR" -maxdepth 2 | sort
