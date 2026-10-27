"""Render a timeline with Remotion and put the sound on it.

renderer/timeline/build.py writes timeline.json + audio.wav; this runs remotion/scripts/render.ts
for the silent picture (in chunks, so a long video fits under a command time cap and a failed
chunk is retried alone), joins the chunks, muxes the WAV, and lays out a contact sheet of stills.

    python -m renderer.remotion out/timeline.json --out out/ [--chunk 1800] [--every 5]
"""
from __future__ import annotations

import hashlib
import json
import re
import os
import shutil
import subprocess
import sys
import tempfile
from collections.abc import Callable
from pathlib import Path

from PIL import Image

from renderer.engine.mux import find_ffmpeg
from renderer.engine.preview import contact_sheet
from renderer.craft import device_problems, frame_problems, picture_problems, shot_problems
from renderer.gates import check_liveliness, layout_problems

REMOTION = Path(__file__).resolve().parent.parent/"remotion"
# survives a render's work folder: the bundle (per source version) and silent videos (per picture),
# so a re-render after a script, sound or gate fix redoes only what changed
CACHE = Path(os.environ.get("REMOTION_CACHE", Path(tempfile.gettempdir())/"remotion-cache"))
KEEP_SILENT = 12          # silent videos kept in the cache, newest first
CORES = max(1, os.cpu_count() or 1)   # Remotion renders at most one frame per core at a time


HOOK_IMPORTS = ("react", "remotion", "@remotion/paths", "@remotion/shapes", "@remotion/noise",
                "../../studio/", "../../cast/", "../../scenes/kit", "../../fx/", "../../design/", "../../fmt/", "../../contract/")
HOOK_BANNED = ("fetch(", "eval(", "Function(", "Math.random", "Date.now", "new Date", "window.", "document.", "localStorage",
               "require(", "import(", "process.", "setTimeout", "setInterval", "XMLHttpRequest", "useFrame")


def custom_problems(video_id: str) -> list[str]:
    """A video's own code (remotion/src/videos/<id>/*.tsx: Hook, other custom beats, props) may only
    build on the studio kit: known imports (and its own folder's files), nothing random or
    clock-driven (renders must be deterministic), no network, no globals, and it must type-check.
    Nothing to check when the video has no code of its own."""
    folder = REMOTION/"src"/"videos"/video_id
    files = sorted(folder.glob("*.tsx")) if folder.is_dir() else []
    out = []
    for f in files:
        code = f.read_text(encoding="utf-8")
        for m in re.finditer(r"""^\s*import[^'"]*['"]([^'"]+)['"]""", code, re.M):
            mod = m.group(1)
            own = mod.startswith("./") and ".." not in mod
            if not own and not any(mod == a or mod.startswith(a) for a in HOOK_IMPORTS):
                out.append(f"{f.name}: import {mod!r} is not allowed (only the studio kit, cast, fx, design, fmt, remotion and this folder)")
        out += [f"{f.name}: {b!r} is not allowed" for b in HOOK_BANNED if b in code]
        if "export default" not in code:
            out.append(f"{f.name} must default-export its component (or, props.tsx, its props)")
    if files and not out:
        node = shutil.which("node")
        tsc = REMOTION/"node_modules"/"typescript"/"bin"/"tsc"
        if node and tsc.is_file():
            r = subprocess.run([node, str(tsc), "--noEmit", "-p", str(REMOTION)], cwd=REMOTION, capture_output=True, text=True)
            if r.returncode != 0:
                out.append("it does not type-check: " + " | ".join(l for l in r.stdout.splitlines() if "videos/" in l.replace("\\", "/"))[:900])
    return out


hook_problems = custom_problems   # the name routines and tests used before custom beats (2026-10-26)


def _not_end_cards(shots: list[Path], tl: dict) -> list[Path]:
    """The stills to judge for empty frames: an end card is a card by design (text, the cast, the
    disclaimer), so its frames don't count."""
    ends = [(b["from"], b["from"] + b["frames"]) for b in tl["beats"] if b["scene"] in ("end", "chapter")]
    def frame(p: Path) -> int:
        return int(p.stem[1:]) if p.stem[1:].isdigit() else -1
    return [p for p in shots if not any(a <= frame(p) < z for a, z in ends)]


def source_hash() -> str:
    """Everything that decides how a frame is drawn: the Remotion source, assets and lockfile."""
    h = hashlib.sha1()
    files = sorted(f for d in ("src", "public", "scripts") for f in (REMOTION/d).rglob("*") if f.is_file())
    for f in [*files, REMOTION/"package-lock.json"]:
        if f.is_file():
            h.update(f.relative_to(REMOTION).as_posix().encode())
            h.update(f.read_bytes())
    return h.hexdigest()[:16]


def picture_key(tl: dict) -> str:
    """A silent video depends on the timeline and the source, not on the mixed sound's levels."""
    visual = {k: v for k, v in tl.items() if k != "audio"}
    return hashlib.sha1((source_hash() + json.dumps(visual, sort_keys=True)).encode()).hexdigest()[:20]


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


def bundle() -> Path:
    """The Remotion bundle, built once per source version and reused (about 6-20 s each time)."""
    cached = CACHE/f"bundle-{source_hash()}"
    if (cached/"index.html").is_file():
        return cached
    tmp = CACHE/f"bundle-tmp-{os.getpid()}"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.parent.mkdir(parents=True, exist_ok=True)
    _node(["bundle", "--out", str(tmp)])
    if (cached/"index.html").is_file():          # built meanwhile by another render
        shutil.rmtree(tmp, ignore_errors=True)
    else:
        shutil.rmtree(cached, ignore_errors=True)
        tmp.replace(cached)
    return cached


def stills(timeline: Path, out: Path, *, frames: list[int] | None = None, every: float = 5.0,
           bundle_dir: Path | None = None, probe: list[dict] | None = None) -> list[Path]:
    """Stills as f<frame>.jpg, several at once. Pass a list as `probe` to also collect the layout
    probe's text boxes."""
    args = ["stills", "--timeline", str(timeline), "--out", str(out), "--concurrency", str(CORES)]
    args += ["--frames", ",".join(map(str, frames))] if frames else ["--every", str(every)]
    if bundle_dir:
        args += ["--bundle", str(bundle_dir)]
    if probe is not None:
        args += ["--probe", "1"]

    def line(text: str) -> None:
        if text.startswith("probe ") and probe is not None:
            probe.append(json.loads(text[6:]))
        elif not text.startswith("progress"):
            print(text)
    _node(args, line)
    return sorted(out.glob("f*.jpg"))


def video(timeline: Path, out: Path, *, chunk: int = 1200, bundle_dir: Path | None = None,
          concurrency: int = CORES) -> Path:
    """Silent mp4 of the whole timeline, rendered `chunk` frames at a time and joined without
    re-encoding. A chunk already on disk is kept, so a rerun resumes where a cut-off one stopped,
    and a picture rendered before (same timeline and source, only the sound changed) is reused."""
    tl = json.loads(timeline.read_text(encoding="utf-8"))
    key = picture_key(tl)
    cached = CACHE/f"silent-{key}.mp4"
    if cached.is_file():
        print("video: reusing the picture rendered before (only the sound changed)", flush=True)
        shutil.copyfile(cached, out)
        return out
    total = tl["durationInFrames"]
    # chunks belong to this picture only: a cut-off render resumes them, a changed script never does
    parts_dir = out.parent/f"{out.stem}-parts-{key}"
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
    CACHE.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(out, cached)
    for stale in sorted(CACHE.glob("silent-*.mp4"), key=lambda f: f.stat().st_mtime, reverse=True)[KEEP_SILENT:]:
        stale.unlink(missing_ok=True)
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


THUMB_SIZES = {"long": (1280, 720), "short": (1080, 1920)}   # YouTube's 16:9 thumbnail; a Short's 9:16 cover


def check_thumbnail(path: Path, fmt: str) -> None:
    """A thumbnail the wrong shape is cropped or letterboxed on YouTube: fail the render instead."""
    size = Image.open(path).size
    if size != THUMB_SIZES[fmt]:
        raise RuntimeError(f"thumbnail is {size[0]}x{size[1]}; a {fmt} video's must be {THUMB_SIZES[fmt][0]}x{THUMB_SIZES[fmt][1]}")


def fresh(folder: Path) -> Path:
    """`folder`, emptied: stills or probe frames left from an earlier, longer render would reach the
    contact sheet and the layout gate as frames the video no longer has."""
    shutil.rmtree(folder, ignore_errors=True)
    folder.mkdir(parents=True)
    return folder


def render_timeline(timeline: Path, out: Path, work: Path, *, preview: bool = False, every: float = 5.0,
                    chunk: int = 1200, concurrency: int = CORES,
                    stop_if: Callable[[dict], list[str]] | None = None) -> dict:
    """timeline.json (+ its audio.wav) -> out/{video.mp4, thumbnail.png, preview.png, render.json}.
    `work` holds the bundle, stills and chunks. `preview` stops after the stills. Returns the
    report, in the keys the Pillow renderer's render.json has, so ship and the workers read either."""
    timeline, out, work = timeline.resolve(), out.resolve(), work.resolve()   # render.ts runs in remotion/
    out.mkdir(parents=True, exist_ok=True)
    tl = json.loads(timeline.read_text(encoding="utf-8"))
    b = bundle()
    shots = stills(timeline, fresh(work/"stills"), every=every, bundle_dir=b)
    # layout gate: each beat once its entrances have settled (70% through), measured by the probe
    probes: list[dict] = []
    settled = [bt["from"] + round(bt["frames"]*0.7) for bt in tl["beats"]]
    stills(timeline, fresh(work/"probe"), frames=settled, bundle_dir=b, probe=probes)
    sheet(shots, tl["fps"], out/"preview.png")
    if tl.get("thumbnail"):
        _node(["thumbnail", "--timeline", str(timeline), "--out", str(out/"thumbnail.png"), "--bundle", str(b)])
    else:
        shutil.copyfile(shots[min(1, len(shots) - 1)], out/"thumbnail.png")
    check_thumbnail(out/"thumbnail.png", tl["format"])
    # the extra thumbnails for a Test & Compare on YouTube: the same timeline with another thumbnail block
    for letter, variant in zip("bc", tl.get("thumbnailVariants") or []):
        alt = work/f"timeline-thumb-{letter}.json"
        alt.parent.mkdir(parents=True, exist_ok=True)
        alt.write_text(json.dumps({**tl, "thumbnail": variant}, ensure_ascii=False), encoding="utf-8")
        _node(["thumbnail", "--timeline", str(alt), "--out", str(out/f"thumbnail-{letter}.png"), "--bundle", str(b)])
        check_thumbnail(out/f"thumbnail-{letter}.png", tl["format"])
    seconds = tl["durationInFrames"]/tl["fps"]
    lines = [{"scene": bt["id"], "text": bt["say"], "start": round(bt["from"]/tl["fps"] + bt["voice"]["start"]/tl["fps"], 2),
              "seconds": round(bt["voice"]["words"][-1]["e"], 2) if bt["voice"]["words"] else 0.0,
              "window": round(bt["frames"]/tl["fps"], 2)} for bt in tl["beats"] if bt.get("voice")]
    for line in lines:
        line["fill"] = round(line["seconds"]/line["window"], 3) if line["window"] else 0.0
    report = {
        "template": tl.get("template"), "renderer": "remotion", "seed": tl["seed"], "duration_sec": round(seconds),
        "tempo": tl.get("tempo", 1.0), "style": tl.get("style") or {"palette": None, **tl["music"]},
        "voice": {"name": tl["voices"]["narrator"], "base_speed": tl["speed"], "cast": tl["voices"], "lines": lines},
        "layout_problems": layout_problems(probes, tl["format"], tl["width"], tl["height"], tl["fps"]),
        "experiments": tl.get("experiments") or {},
        # YouTube chapters: the first must be 0:00
        "chapters": ([] if any(bt["from"] == 0 for bt in tl["beats"] if bt["scene"] == "chapter") else [{"title": "Intro", "start": 0.0}])
        + [{"title": bt["params"].get("title", ""), "start": round(bt["from"]/tl["fps"], 1)} for bt in tl["beats"] if bt["scene"] == "chapter"],
    }
    report["audio"] = {"peak_db": tl["audio"]["peak_db"], "mean_db": tl["audio"]["mean_db"]}
    # a video that looks templated (empty frames, the same picture, one shot size, one set) fails
    # here, on the stills, before the video is drawn (renderer/craft.py)
    report["craft_problems"] = shot_problems(tl) + picture_problems(tl) + device_problems(tl) + frame_problems(_not_end_cards(shots, tl), tl["fps"])
    # no point rendering a video the gates will reject: a layout problem, or one `stop_if` finds in
    # the report (length, sound levels), skips it
    early = list(report["layout_problems"]) + list(report["craft_problems"]) + (stop_if(report) if stop_if else [])
    if early and not preview:
        msg = "video skipped: " + "; ".join(early)
        enc = getattr(sys.stdout, "encoding", None) or "utf-8"
        print(msg.encode(enc, "replace").decode(enc), flush=True)   # a Windows console can't print ₹
        report["video_skipped"] = early
    if not preview and not early:
        silent = video(timeline, work/"silent.mp4", chunk=chunk, bundle_dir=b, concurrency=concurrency)
        final = mux(silent, timeline.parent/tl["audio"]["file"], out/"video.mp4")
        report["liveliness"], report["liveliness_problems"] = check_liveliness(final)
    (out/"render.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def render_story(script: dict, out: Path, *, preview: bool = False, voice: str = "kokoro",
                 stop_if: Callable[[dict], list[str]] | None = None) -> dict:
    """A long_story script -> videos/<id>/ files: the timeline and audio are built into `out`,
    everything bulky (bundle, stills, chunks) goes to a work folder removed after a full render."""
    from renderer.timeline.build import build
    script = {**script, "id": script.get("id") or out.name}   # the timeline's id finds the video's own hook
    problems = custom_problems(script["id"])
    if problems:
        raise RuntimeError("the video's own code: " + "; ".join(problems))
    build(script, out, voice=voice)
    # a fixed work folder, so a render cut off part way resumes from its finished chunks
    work = Path(tempfile.gettempdir())/f"remotion-{out.name}"
    report = render_timeline(out/"timeline.json", out, work, preview=preview, stop_if=stop_if)
    if not preview:
        shutil.rmtree(work, ignore_errors=True)
    return report


def main() -> int:
    import argparse
    ap = argparse.ArgumentParser(description="timeline.json + audio.wav -> video.mp4, stills and preview.png")
    ap.add_argument("timeline", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--chunk", type=int, default=1200, help="frames per render chunk (under ~8 min each at the shot system's pace)")
    ap.add_argument("--every", type=float, default=5.0, help="seconds between QA stills")
    ap.add_argument("--concurrency", type=int, default=CORES)
    ap.add_argument("--stills-only", action="store_true")
    a = ap.parse_args()
    report = render_timeline(a.timeline, a.out, a.out, preview=a.stills_only, every=a.every, chunk=a.chunk,
                             concurrency=a.concurrency)
    print(f"preview: {a.out/'preview.png'}")
    if a.stills_only:
        return 0
    if report.get("video_skipped"):
        return 1
    print(f"video: {a.out/'video.mp4'}  liveliness {report['liveliness']}")
    for problem in report["liveliness_problems"]:
        print(f"FAIL: {problem}")
    return 1 if report["liveliness_problems"] else 0


if __name__ == "__main__":
    sys.exit(main())
