"""Render a timeline with Remotion and put the sound on it.

renderer/timeline/build.py writes timeline.json + audio.wav; this runs remotion/scripts/render.ts
for the silent picture (in chunks, so a long video fits under a command time cap and a failed
chunk is retried alone), joins the chunks, muxes the WAV, and lays out a contact sheet of stills.

    python -m renderer.remotion out/timeline.json --out out/ [--chunk 1800] [--every 5]
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path

from PIL import Image

from renderer.engine.mux import find_ffmpeg
from renderer.engine.preview import contact_sheet
from renderer.gates import check_liveliness

REMOTION = Path(__file__).resolve().parent.parent/"remotion"


def _node(args: list[str], on_line: Callable[[str], None] = print) -> None:
    """Run scripts/render.ts with tsx, passing each output line on; raise with the tail on failure."""
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node not found on PATH")
    cmd = [node, str(REMOTION/"node_modules"/"tsx"/"dist"/"cli.mjs"), "scripts/render.ts", *args]
    tail: list[str] = []
    with subprocess.Popen(cmd, cwd=REMOTION, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                          text=True, encoding="utf-8", errors="replace") as p:
        assert p.stdout is not None
        for line in p.stdout:
            line = line.rstrip()
            tail = (tail + [line])[-40:]
            on_line(line)
    if p.returncode != 0:
        raise RuntimeError(f"render.ts {args[0]} failed:\n" + "\n".join(tail))


def bundle(out: Path) -> Path:
    _node(["bundle", "--out", str(out)])
    return out


def stills(timeline: Path, out: Path, *, frames: list[int] | None = None, every: float = 5.0,
           bundle_dir: Path | None = None) -> list[Path]:
    args = ["stills", "--timeline", str(timeline), "--out", str(out)]
    args += ["--frames", ",".join(map(str, frames))] if frames else ["--every", str(every)]
    if bundle_dir:
        args += ["--bundle", str(bundle_dir)]
    _node(args, lambda line: None if line.startswith("progress") else print(line))
    return sorted(out.glob("f*.jpg"))


def video(timeline: Path, out: Path, *, chunk: int = 1800, bundle_dir: Path | None = None,
          concurrency: int = 4) -> Path:
    """Silent mp4 of the whole timeline, rendered `chunk` frames at a time and joined without
    re-encoding. A chunk already on disk is kept, so a rerun resumes where a cut-off one stopped."""
    total = json.loads(timeline.read_text(encoding="utf-8"))["durationInFrames"]
    parts_dir = out.parent/(out.stem + "-parts")
    parts_dir.mkdir(parents=True, exist_ok=True)
    parts = []
    for i, start in enumerate(range(0, total, chunk)):
        end = min(total, start + chunk) - 1
        part = parts_dir/f"part{i:03d}-{start}-{end}.mp4"
        if not part.exists():
            tmp = part.with_suffix(".tmp.mp4")
            args = ["video", "--timeline", str(timeline), "--out", str(tmp), "--from", str(start), "--to", str(end),
                    "--concurrency", str(concurrency)]
            if bundle_dir:
                args += ["--bundle", str(bundle_dir)]
            print(f"chunk {i}: frames {start}-{end} of {total}", flush=True)
            _node(args, lambda line: print(f"  chunk {i} {line}", flush=True) if line.startswith(("progress 0.5", "done")) else None)
            tmp.replace(part)
        parts.append(part)
    listing = parts_dir/"parts.txt"
    listing.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
    _ffmpeg(["-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(out)])
    return out


def mux(silent: Path, wav: Path, out: Path) -> Path:
    """Picture from `silent`, sound from `wav`: AAC 192k, faststart, cut to the shorter of the two."""
    _ffmpeg(["-i", str(silent), "-i", str(wav), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
             "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out)])
    return out


def _ffmpeg(args: list[str]) -> None:
    r = subprocess.run([find_ffmpeg(), "-y", "-loglevel", "error", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffmpeg failed: " + r.stderr.strip())


def sheet(paths: list[Path], fps: int, out: Path, cols: int = 6) -> Path:
    """Contact sheet of stills named f<frame>.jpg, each labelled with its time."""
    tiles = [(int(p.stem[1:])/fps, Image.open(p).convert("RGB")) for p in paths]
    contact_sheet(tiles, cols=cols, tile_w=320).save(out)
    return out


def main() -> int:
    import argparse
    ap = argparse.ArgumentParser(description="timeline.json + audio.wav -> video.mp4, stills and preview.png")
    ap.add_argument("timeline", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--chunk", type=int, default=1800, help="frames per render chunk")
    ap.add_argument("--every", type=float, default=5.0, help="seconds between QA stills")
    ap.add_argument("--concurrency", type=int, default=4)
    ap.add_argument("--stills-only", action="store_true")
    a = ap.parse_args()
    out: Path = a.out
    out.mkdir(parents=True, exist_ok=True)
    tl = json.loads(a.timeline.read_text(encoding="utf-8"))
    b = bundle(out/"bundle")
    shots = stills(a.timeline, out/"stills", every=a.every, bundle_dir=b)
    sheet(shots, tl["fps"], out/"preview.png")
    if tl.get("thumbnail"):
        _node(["thumbnail", "--timeline", str(a.timeline), "--out", str(out/"thumbnail.png"), "--bundle", str(b)])
    print(f"preview: {out/'preview.png'} ({len(shots)} stills)")
    if a.stills_only:
        return 0
    silent = video(a.timeline, out/"silent.mp4", chunk=a.chunk, bundle_dir=b, concurrency=a.concurrency)
    wav = a.timeline.parent/tl["audio"]["file"]
    final = mux(silent, wav, out/"video.mp4")
    score, problems = check_liveliness(final)
    report = {"renderer": "remotion", "durationSec": round(tl["durationInFrames"]/tl["fps"], 2),
              "audio": tl["audio"], "liveliness": score, "problems": problems}
    (out/"render.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"video: {final}  liveliness {score}")
    for problem in problems:
        print(f"FAIL: {problem}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
