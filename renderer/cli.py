"""Render a script JSON.

    python renderer/cli.py examples/two_friends_race.json              → out/video.mp4, thumbnail.png, preview.png
    python renderer/cli.py examples/two_friends_race.json --preview    → thumbnail.png and preview.png only
    python renderer/cli.py script.json --frames 3 12.8                 → frame_<t>.png at those seconds
    python renderer/cli.py script.json --seed 7                        → same script, different seed

Every run also writes render.json: template, duration, resolved style, layout problems at the key
frames and (for a full render) audio levels.
"""
import argparse
import importlib
import json
import sys
import time
from collections.abc import Iterable, Iterator
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from jsonschema import Draft202012Validator  # noqa: E402

from renderer.engine import mux  # noqa: E402
from renderer.engine.canvas import FPS  # noqa: E402
from renderer.engine.preview import contact_sheet  # noqa: E402

TEMPLATES = ROOT / "renderer" / "templates"


def template_names(fmt: str | None = None) -> list[str]:
    """Every template, or only those of one format ("short" or "long")."""
    names = sorted(p.name for p in TEMPLATES.iterdir() if (p / "schema.json").is_file())
    return [n for n in names if fmt is None or template_format(n) == fmt]


@lru_cache(maxsize=None)
def template_format(name: str) -> str:
    """The format a template renders in; a template says so with a module-level FORMAT."""
    return getattr(importlib.import_module(f"renderer.templates.{name}.template"), "FORMAT", "short")


def build(script: object, flags: dict[str, str] | None = None):
    """Validate a script dict against its template's schema and build the template. `flags` are
    the video's A/B experiment variants ({id: "on"|"off"}); templates read them with `self.flag(id)`."""
    name = script.get("template") if isinstance(script, dict) else None
    if not isinstance(name, str) or name not in template_names():
        raise ValueError(f"unknown template {name!r}; available: {', '.join(template_names())}")
    schema = json.loads((TEMPLATES / name / "schema.json").read_text(encoding="utf-8"))
    # `voice` (scene → line) is shared by every template, so it is checked by the engine, not the schemas
    errors = sorted(Draft202012Validator(schema).iter_errors({k: v for k, v in script.items() if k != "voice"}), key=lambda e: list(e.path))
    if errors:
        raise ValueError("script does not match schema:\n" + "\n".join(
            f"  {'/'.join(map(str, e.path)) or '(root)'}: {e.message}" for e in errors))
    script = {**script, "_flags": dict(flags or {})}   # added after validation: schemas stay strict
    video = importlib.import_module(f"renderer.templates.{name}.template").build(script)
    video.check_voice()
    return video


def load(script_path: Path, seed: int | None = None, flags: dict[str, str] | None = None):
    """Read a script file (optionally overriding its seed), validate it and build the template."""
    script = json.loads(script_path.read_text(encoding="utf-8"))
    if seed is not None and isinstance(script, dict):
        script["seed"] = seed
    return build(script, flags)


def _progress(items: Iterable, total: int, label: str) -> Iterator:
    """Pass `items` through, reporting percent done and time left on stderr.
    A long-form render is tens of thousands of frames, so silence looks like a hang."""
    start = time.monotonic()
    every = max(1, total//50)
    for i, item in enumerate(items, 1):
        if i == 1 or i % every == 0 or i == total:
            done = i/total
            left = (time.monotonic() - start)*(1 - done)/done if done else 0
            print(f"\r  {label} {done*100:5.1f}%  ({i}/{total}, ~{left/60:.1f} min left)   ",
                  end="", file=sys.stderr, flush=True)
        yield item
    print(file=sys.stderr, flush=True)


def render(video, out: Path, preview: bool = False) -> dict:
    """Write thumbnail.png, preview.png and render.json into `out`, plus video.mp4 unless `preview`.
    Returns the report that went into render.json. Raises RuntimeError if encoding fails."""
    out.mkdir(parents=True, exist_ok=True)
    note = lambda s: print(s, file=sys.stderr, flush=True)   # noqa: E731
    note(f"{round(video.length)} s {video.frame_spec.name} video, {len(video.scenes)} scenes")
    video.thumbnail_image().save(out / "thumbnail.png")
    contact_sheet([(t/video.tempo, video.frame(t)) for t in video.key_times]).save(out / "preview.png")   # labels in output seconds
    st = video.style
    report = {"template": type(video).__module__.split(".")[-2], "seed": video.seed, "duration_sec": round(video.length), "tempo": video.tempo,
              "style": {"palette": st.palette.name, "genre": st.genre, "key": st.key, "bpm": st.bpm},
              "experiments": dict(video.flags),
              "voice": {"name": video.voice_name, "base_speed": video.voice_speed} if video.narrated else None,
              "layout_problems": [p for t in _progress(video.check_times(), len(video.check_times()), "checking layout")
                                  for p in video.layout_problems(t)]}
    note("measuring motion")
    report["liveliness"] = video.liveliness()
    report["liveliness_problems"] = video.liveliness_problems(report["liveliness"])
    if not preview:
        wav = out / "audio.wav"
        note("building the soundtrack" + (" and voiceover" if video.narrated else ""))
        mixer = video.soundtrack()
        mixer.write_wav(wav)
        peak, mean = mixer.levels()
        report["audio"] = {"peak_db": round(peak, 1), "mean_db": round(mean, 1)}
        if video.spoken:
            report["voice"]["lines"] = [{"scene": p.scene, "text": p.text, "start": round(p.start, 2), "seconds": round(p.seconds, 2),
                                         "window": round(p.window, 2), "speed": p.speed, "fill": round(p.fill, 2)} for p in video.spoken]
        try:
            frames = round(video.length*FPS)
            mux.encode(_progress((video.frame_at(f/FPS) for f in range(frames)), frames, "rendering"),
                       wav, out / "video.mp4")
        finally:
            wav.unlink(missing_ok=True)
    (out / "render.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return report


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a script JSON to an mp4, thumbnail and contact sheet.")
    ap.add_argument("script", type=Path)
    ap.add_argument("--out", type=Path, default=Path("out"), help="output directory (default: out/)")
    ap.add_argument("--preview", action="store_true", help="thumbnail and contact sheet only, no video")
    ap.add_argument("--frames", type=float, nargs="+", metavar="SEC", help="write single frames at these times and exit")
    ap.add_argument("--seed", type=int, help="override the script's seed")
    ap.add_argument("--flag", action="append", default=[], metavar="ID=on|off", help="set an A/B experiment variant (repeatable)")
    args = ap.parse_args()

    try:
        video = load(args.script, args.seed, dict(f.split("=", 1) for f in args.flag))
    except (ValueError, OSError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    if args.frames:
        args.out.mkdir(parents=True, exist_ok=True)
        for t in args.frames:
            video.frame(t).save(args.out / f"frame_{t:05.2f}.png")
        return 0
    try:
        render(video, args.out, args.preview)
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    if not args.preview:
        print(args.out / "video.mp4")
    return 0


if __name__ == "__main__":
    sys.exit(main())
