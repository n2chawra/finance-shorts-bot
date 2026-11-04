#!/usr/bin/env bash
# Run what .github/workflows/agent-merge.yml runs, before pushing to main (owner rule since 2026-11-04:
# a change that passed locally but not in CI blocked the auditor's merge for a night).
#   bash scripts/ci-local.sh            all suites
#   bash scripts/ci-local.sh workers    one area: python | workers | dashboard | remotion
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PY:-$(command -v python3 || command -v python)}
want() { [ $# -eq 0 ] || [ -z "${AREA:-}" ] || [ "$AREA" = "$1" ]; }
AREA=${1:-}
step() { printf '\n== %s\n' "$1"; }

if [ -z "$AREA" ] || [ "$AREA" = python ]; then
  step "python tests"
  "$PY" -m pytest renderer generator improvement scripts -q
fi
if [ -z "$AREA" ] || [ "$AREA" = workers ]; then
  step "workers: generate, typecheck, tests (the CI job has no dashboard node_modules)"
  (cd workers && npm run generate >/dev/null && npm run typecheck && npm test 2>&1 | grep -E "^ℹ (pass|fail)")
fi
if [ -z "$AREA" ] || [ "$AREA" = dashboard ]; then
  step "dashboard: tsc, lint, build"
  (cd apps/dashboard && npx tsc --noEmit -p . && npx next lint && DATABASE_URL="" NEXT_TELEMETRY_DISABLED=1 npx next build >/dev/null && echo "build ok")
fi
if [ -z "$AREA" ] || [ "$AREA" = remotion ]; then
  step "remotion: typecheck, tests"
  (cd remotion && npm run typecheck && npm test 2>&1 | tail -3)
fi
printf '\nci-local: all green\n'
