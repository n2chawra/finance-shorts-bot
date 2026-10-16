#!/usr/bin/env bash
# Install the offline voiceover engine: kokoro-onnx plus the Kokoro v1.0 model and voice pack
# (Apache-2.0, ~340 MB) into $KOKORO_DIR (default ~/.cache/kokoro). Safe to run again: it skips
# whatever is already there and checks every file against its SHA-256. The model files are never
# committed; the renderer only reads them (renderer/engine/voice.py).
#
#   bash scripts/setup-voice.sh [python]     # python defaults to python3
set -euo pipefail

PY="${1:-python3}"
DIR="${KOKORO_DIR:-$HOME/.cache/kokoro}"
BASE="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
FILES=(
  "kokoro-v1.0.onnx 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5"
  "voices-v1.0.bin bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
)

if ! "$PY" -c "import kokoro_onnx" 2>/dev/null; then
  "$PY" -m pip install -q "kokoro-onnx>=0.4,<1" || "$PY" -m pip install -q --break-system-packages "kokoro-onnx>=0.4,<1"
fi

mkdir -p "$DIR"
for entry in "${FILES[@]}"; do
  read -r name sum <<< "$entry"
  if [ -f "$DIR/$name" ] && echo "$sum  $DIR/$name" | sha256sum -c --quiet - 2>/dev/null; then
    continue
  fi
  curl -fsSL --retry 3 -o "$DIR/$name.part" "$BASE/$name"
  echo "$sum  $DIR/$name.part" | sha256sum -c --quiet - || { echo "setup-voice: checksum mismatch for $name" >&2; rm -f "$DIR/$name.part"; exit 1; }
  mv "$DIR/$name.part" "$DIR/$name"
done
echo "setup-voice: ready in $DIR"
