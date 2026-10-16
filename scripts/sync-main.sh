#!/usr/bin/env bash
# First command of every routine (videos and agents): put the working tree exactly on GitHub's main.
#
# The cloud environment caches its clone between runs, and its local `main` branch can be stale or
# even unrelated to GitHub's (on 2026-10-16 it held 23 old commits with no common ancestor), so
# `git checkout main && git pull --ff-only` fails. GitHub is the only source of truth and a run keeps
# nothing locally, so the local branch is simply reset to origin/main. Never push from here.
set -euo pipefail

git fetch -q origin main
git checkout -q -f -B main origin/main
git reset -q --hard origin/main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo "sync-main: HEAD is not origin/main; stop and report this" >&2
  exit 1
fi
echo "sync-main: on origin/main at $(git log -1 --format='%h %cI %s')"
