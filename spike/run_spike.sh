#!/usr/bin/env bash
# Feasibility spike for the Remotion rebuild (PLAN.md M8, phase 0). Run from the repo root, one
# stage at a time:  bash spike/run_spike.sh env|setup|short|long|chunks|kokoro
# Every stage appends machine-readable lines to spike/results/results.jsonl and keeps going on
# errors, so a failure is recorded rather than ending the spike.
set -u
cd "$(dirname "$0")/.."
OUT=spike/results
APP=spike/remotion-test
mkdir -p "$OUT"
rec() { echo "{\"stage\":\"$1\",\"what\":\"$2\",\"value\":$3}" | tee -a "$OUT/results.jsonl"; }
timed() {   # timed <stage> <what> <command...>: wall seconds, peak RSS MB and exit code
  local stage=$1 what=$2; shift 2
  local start=$(date +%s.%N)
  /usr/bin/time -f "%M" -o "$OUT/.rss" "$@" >"$OUT/$stage-$what.log" 2>&1
  local code=$?
  local secs=$(echo "$(date +%s.%N) - $start" | bc)
  local rss=$(( $(tail -1 "$OUT/.rss" 2>/dev/null || echo 0) / 1024 ))
  rec "$stage" "$what" "{\"seconds\":$secs,\"peak_rss_mb\":$rss,\"exit\":$code}"
  return $code
}

case "${1:-}" in
env)
  {
    echo "date: $(date -u)"; uname -a; echo "cpus: $(nproc)"; free -m; df -h . | tail -1
    echo "node: $(node -v 2>&1)  npm: $(npm -v 2>&1)"
    for p in python3 python3.10 python3.11 python3.12 python3.13 python3.14; do command -v $p >/dev/null && echo "$p: $($p -V 2>&1)"; done
    echo "chrome-ish: $(command -v google-chrome chromium chromium-browser chrome 2>/dev/null | tr '\n' ' ')"
    echo "ffmpeg: $(ffmpeg -version 2>/dev/null | head -1)"; echo "whoami: $(whoami)"
  } > "$OUT/env.txt" 2>&1
  cat "$OUT/env.txt"
  ;;
setup)
  timed setup apt_chrome_libs bash -c "apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
    libnss3 libgbm1 libatk-bridge2.0-0 libatk1.0-0 libxkbcommon0 libcups2 libxcomposite1 libxdamage1 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2t64 fonts-liberation bc ffmpeg || apt-get install -y -qq libasound2"
  timed setup npm_ci bash -c "cd $APP && npm ci --no-audit --no-fund"
  timed setup browser_ensure bash -c "cd $APP && npx remotion browser ensure"
  echo "browser download log:"; cat "$OUT/setup-browser_ensure.log"
  ;;
short)
  for c in 2 4; do
    timed short "concurrency_$c" bash -c "cd $APP && npx remotion render src/index.ts Short out/short-c$c.mp4 --concurrency=$c --log=info"
  done
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$APP/out/short-c4.mp4" | xargs -I{} echo "short duration: {}"
  ;;
long)
  # 9000 frames (5 min). Over the 10-minute command cap: run this stage in the background and poll.
  timed long full_9000_frames bash -c "cd $APP && npx remotion render src/index.ts SpikeLong out/long.mp4 --concurrency=4 --log=info"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$APP/out/long.mp4" | xargs -I{} echo "long duration: {}"
  for s in 30 150 270; do ffmpeg -v error -y -ss $s -i "$APP/out/long.mp4" -frames:v 1 -vf scale=960:-1 "$OUT/long-at-$s.png"; done
  ;;
chunks)
  # resumable rendering: two frame ranges rendered separately, then joined without re-encoding
  timed chunks part_a bash -c "cd $APP && npx remotion render src/index.ts SpikeLong out/part-a.mp4 --frames=0-899 --concurrency=4"
  timed chunks part_b bash -c "cd $APP && npx remotion render src/index.ts SpikeLong out/part-b.mp4 --frames=900-1799 --concurrency=4"
  printf "file 'part-a.mp4'\nfile 'part-b.mp4'\n" > "$APP/out/parts.txt"
  timed chunks concat bash -c "cd $APP/out && ffmpeg -v error -y -f concat -safe 0 -i parts.txt -c copy joined.mp4"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$APP/out/joined.mp4" | xargs -I{} echo "joined duration (expect 60): {}"
  ;;
kokoro)
  PY=""
  for p in python3.12 python3.13 python3.11 python3.10 python3; do
    command -v $p >/dev/null && $p -c 'import sys; sys.exit(0 if sys.version_info < (3, 14) else 1)' && PY=$p && break
  done
  echo "python for kokoro 0.6: ${PY:-none}"
  [ -z "$PY" ] && { rec kokoro python '"none below 3.14"'; exit 0; }
  timed kokoro pip_install $PY -m pip install -q "kokoro-onnx==0.6.1" || timed kokoro pip_install_bsp $PY -m pip install -q --break-system-packages "kokoro-onnx==0.6.1"
  D=/tmp/kokoro-v11; mkdir -p $D
  B=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1
  timed kokoro download_v11 bash -c "curl -fsSL -o $D/kokoro-v1.0.onnx $B/kokoro-v1.0.onnx && curl -fsSL -o $D/voices-v1.0.bin $B/voices-v1.0.bin"
  sha256sum $D/* | tee "$OUT/kokoro-v11-sha256.txt"
  timed kokoro timings $PY spike/kokoro_timings.py $D "$OUT/kokoro.json"
  cat "$OUT/kokoro.json"
  ;;
*)
  echo "usage: bash spike/run_spike.sh env|setup|short|long|chunks|kokoro"; exit 2 ;;
esac
