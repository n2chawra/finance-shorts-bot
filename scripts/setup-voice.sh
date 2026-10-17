#!/usr/bin/env bash
# Install the offline voiceover engine: kokoro-onnx 0.6.1 plus the Kokoro model and voice pack
# (Apache-2.0, ~340 MB) into $KOKORO_DIR (default ~/.cache/kokoro). Safe to run again: it skips
# whatever is already there and checks every file against its SHA-256. The model files are never
# committed; the renderer only reads them (renderer/engine/voice.py).
#
# The model comes from the model-files-v1.1 release: same file name and voice pack as v1.0, but it
# also outputs phoneme durations, which the Remotion renderer needs for lip-sync and for scenes
# that react to a word (voice.speak_timed). kokoro-onnx 0.6 needs Python 3.10–3.13.
#
#   bash scripts/setup-voice.sh [python]     # python defaults to python3
set -euo pipefail

PY="${1:-python3}"
DIR="${KOKORO_DIR:-$HOME/.cache/kokoro}"
KOKORO_ONNX="0.6.1"
BASE="https://github.com/thewh1teagle/kokoro-onnx/releases/download"
FILES=(
  "model-files-v1.1 kokoro-v1.0.onnx beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a"
  "model-files-v1.0 voices-v1.0.bin bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
)

have=$("$PY" -c "import importlib.metadata as m; print(m.version('kokoro-onnx'))" 2>/dev/null || true)
if [ "$have" != "$KOKORO_ONNX" ]; then
  "$PY" -m pip install -q "kokoro-onnx==$KOKORO_ONNX" || "$PY" -m pip install -q --break-system-packages "kokoro-onnx==$KOKORO_ONNX"
fi

mkdir -p "$DIR"
for entry in "${FILES[@]}"; do
  read -r release name sum <<< "$entry"
  if [ -f "$DIR/$name" ] && echo "$sum  $DIR/$name" | sha256sum -c --quiet - 2>/dev/null; then
    continue
  fi
  curl -fsSL --retry 3 -o "$DIR/$name.part" "$BASE/$release/$name"
  echo "$sum  $DIR/$name.part" | sha256sum -c --quiet - || { echo "setup-voice: checksum mismatch for $name" >&2; rm -f "$DIR/$name.part"; exit 1; }
  mv "$DIR/$name.part" "$DIR/$name"
done
echo "setup-voice: ready in $DIR"
