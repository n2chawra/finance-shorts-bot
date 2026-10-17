#!/usr/bin/env bash
# Prepare a cloud routine session to render with Remotion: the offline voice, the pinned npm
# packages, a headless Chrome and ffmpeg. Safe to run again; quick once the environment caches it
# (the owner can paste `bash scripts/setup-cloud.sh` into the routine environment's setup script).
#
# Chrome: Remotion downloads its own from remotion.media, which routine networks block (spike,
# 2026-10-17). The cloud image ships Playwright's headless shell under /opt/pw-browsers, which
# remotion/scripts/browser.ts finds; REMOTION_BROWSER_EXECUTABLE overrides it.
#
#   bash scripts/setup-cloud.sh [python]     # python defaults to python3
set -euo pipefail

PY="${1:-python3}"
cd "$(dirname "$0")/.."

bash scripts/setup-voice.sh "$PY"

command -v node >/dev/null || { echo "setup-cloud: node is missing (Remotion needs Node 18+)" >&2; exit 1; }
(cd remotion && npm ci --no-audit --no-fund --loglevel=error)

if [ -z "${REMOTION_BROWSER_EXECUTABLE:-}" ] && ! ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell >/dev/null 2>&1; then
  echo "setup-cloud: no headless Chrome under /opt/pw-browsers; set REMOTION_BROWSER_EXECUTABLE" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null; then
  apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends ffmpeg
fi
echo "setup-cloud: ready (voice, remotion packages, chrome, ffmpeg)"
