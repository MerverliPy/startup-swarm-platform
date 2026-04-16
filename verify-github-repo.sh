#!/usr/bin/env bash
set -euo pipefail

BRANCH="$(git branch --show-current)"

echo "Repo root: $(git rev-parse --show-toplevel)"
echo "Branch: ${BRANCH}"
echo

echo "Git status:"
git status --short --branch
echo

echo "Origin URL:"
git remote get-url origin
echo

echo "Configured identity:"
git config user.name || true
git config user.email || true
echo

echo "Remote HEAD:"
git ls-remote origin HEAD
echo

echo "Remote branches:"
git ls-remote --heads origin
echo

echo "Local HEAD:"
git rev-parse HEAD
echo

echo "Last 5 local commits:"
git log --oneline --decorate -n 5
echo

echo "Fetching remote..."
git fetch origin
echo

echo "Last remote commit on origin/${BRANCH}:"
git log --oneline --decorate -n 1 "origin/${BRANCH}" || true
