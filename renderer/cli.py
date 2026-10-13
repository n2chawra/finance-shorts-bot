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
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from jsonschema import Draft202012Validator  # noqa: E402

from renderer.engine import mux  # noqa: E402
from renderer.engine.canvas import FPS  # noqa: E402
from renderer.engine.preview import contact_sheet  # noqa: E402

TEMPLATES = ROOT / "renderer" / "templates"


def load(script_path: Path, seed: int | None = None):
    """Validate the script against its template's schema and build the template."""
    script = json.loads(script_path.read_text(encoding="utf-8"))
    if seed is not None and isinstance(script, dict):
        script["seed"] = seed
    name = script.get("template") if isinstance(script, dict) else None
    if not isinstance(name, str) or not (TEMPLATES / name / "schema.json").is_file():
        known = sorted(p.name for p in TEMPLATES.iterdir() if (p / "schema.json").is_file())
        raise ValueError(f"unknown template {name!r}; available: {', '.join(known)}")
    schema = json.loads((TEMPLATES / name / "schema.json").read_text(encoding="utf-8"))
    errors = sorted(Draft202012Validator(schema).iter_errors(script), key=lambda e: list(e.path))
    if errors:
        raise ValueError("script does not match schema:\n" + "\n".join(
            f"  {'/'.join(map(str, e.path)) or '(root)'}: {e.message}" for e in errors))
    return importlib.import_module(f"renderer.templates.{name}.template").build(script)


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a script JSON to an mp4, thumbnail and contact sheet.")
    ap.add_argument("script", type=Path)
    ap.add_argument("--out", type=Path, default=Path("out"), help="output directory (default: out/)")
    ap.add_argument("--preview", action="store_true", help="thumbnail and contact sheet only, no video")
    ap.add_argument("--frames", type=float, nargs="+", metavar="SEC", help="write single frames at these times and exit")
    ap.add_argument("--seed", type=int, help="override the script's seed")
    args = ap.parse_args()

    try:
        video = load(args.script, args.seed)
    except (ValueError, OSError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    args.out.mkdir(parents=True, exist_ok=True)

    if args.frames:
        for t in args.frames:
            video.frame(t).save(args.out / f"frame_{t:05.2f}.png")
        return 0

    video.frame(video.thumbnail_time).save(args.out / "thumbnail.png")
    contact_sheet([(t, video.frame(t)) for t in video.key_times]).save(args.out / "preview.png")
    st = video.style
    report = {"template": type(video).__module__.split(".")[-2], "seed": video.seed, "duration_sec": video.duration,
              "style": {"palette": st.palette.name, "genre": st.genre, "key": st.key, "bpm": st.bpm},
              "layout_problems": [p for t in video.key_times for p in video.layout_problems(t)]}

    def write_report() -> None:
        (args.out / "render.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if args.preview:
        write_report()
        return 0

    wav = args.out / "audio.wav"
    mixer = video.audio()
    mixer.write_wav(wav)
    peak, mean = mixer.levels()
    report["audio"] = {"peak_db": round(peak, 1), "mean_db": round(mean, 1)}
    write_report()
    try:
        mux.encode((video.frame(f/FPS) for f in range(int(video.duration*FPS))), wav, args.out / "video.mp4")
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    finally:
        wav.unlink(missing_ok=True)
    print(args.out / "video.mp4")
    return 0


if __name__ == "__main__":
    sys.exit(main())
