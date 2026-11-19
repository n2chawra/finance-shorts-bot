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

if [ -z "${REMOTION_BROWSER_EXECUTABLE:-}" ] && ! compgen -G "/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell" >/dev/null \
  && ! compgen -G "/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell" >/dev/null; then
  echo "setup-cloud: no headless Chrome under /opt/pw-browsers; set REMOTION_BROWSER_EXECUTABLE" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null; then
  apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends ffmpeg
fi
# documentary channels (look.engine "doc", generator/media): media goes to a temp cache, never the repo;
# SEC filing pages need SEC_USER_AGENT ("Name contact@address"), set as an environment variable on the
# routine environment (claude.ai), never in this public repo. Without it the fetcher skips EDGAR only.
export MEDIA_CACHE="${MEDIA_CACHE:-${TMPDIR:-/tmp}/media-cache}"
mkdir -p "$MEDIA_CACHE"
if [ -z "${SEC_USER_AGENT:-}" ]; then
  echo "setup-cloud: note: SEC_USER_AGENT is not set; doc channels can't fetch SEC filing pages" >&2
fi
"$PY" -c "import PIL" 2>/dev/null || "$PY" -m pip install -q pillow || "$PY" -m pip install -q --break-system-packages pillow
echo "setup-cloud: ready (voice, remotion packages, chrome, ffmpeg, media cache)"
