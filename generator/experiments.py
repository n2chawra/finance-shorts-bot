"""A/B experiment flags.

`config/experiments.json` lists experiments the improver agent is running. Each video gets a
variant per experiment ("on" or "off"), decided only by the experiment id and the video id, so it
is stable across re-renders and splits videos about 50/50. Templates read their flags through
`Video.flag(id)`; planner and writer read the prompt notes `state` exposes. The manifest records
the variants so `improvement.evaluate` can compare the two groups.

    {"experiments": [{"id": "fast-hook", "area": "hook", "status": "running",
                      "templates": ["all"], "share": 0.5,
                      "prompt": {"on": "Open with the number in the first 0.5 s."}}]}
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = Path("config") / "experiments.json"


def load(root: Path = ROOT) -> list[dict]:
    path = root / FILE
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [e for e in data.get("experiments", []) if e.get("status", "running") == "running"]


def _unit(key: str) -> float:
    return int(hashlib.sha256(key.encode()).hexdigest()[:8], 16)/0xFFFFFFFF


def variant(exp_id: str, video_id: str, share: float = 0.5) -> str:
    """'on' for about `share` of video ids, 'off' for the rest; deterministic.

    For a 50/50 split of the usual ids (v-YYYYMMDD-NN) the groups alternate within each day, starting
    with a group picked per experiment and day, so every day's videos land in both groups (a pure
    hash put all of a day's three videos in one group about a quarter of the time)."""
    m = re.fullmatch(r"v-(\d{8})-(\d+)", video_id)
    if share == 0.5 and m:
        first_on = _unit(f"{exp_id}:{m.group(1)}") < 0.5
        return "on" if (int(m.group(2)) % 2 == 1) == first_on else "off"
    return "on" if _unit(f"{exp_id}:{video_id}") < share else "off"


def applies(exp: dict, template: str | None) -> bool:
    targets = exp.get("templates", ["all"])
    return "all" in targets or (template is not None and template in targets)


def for_video(video_id: str, template: str | None = None, root: Path = ROOT) -> dict[str, str]:
    """{experiment id: 'on'|'off'} for every running experiment that applies to this video."""
    return {e["id"]: variant(e["id"], video_id, float(e.get("share", 0.5))) for e in load(root) if applies(e, template)}


def prompt_notes(video_id: str, root: Path = ROOT) -> list[dict]:
    """What the planner/writer must do differently for this video, per experiment and variant."""
    out = []
    for e in load(root):
        v = variant(e["id"], video_id, float(e.get("share", 0.5)))
        note = (e.get("prompt") or {}).get(v)
        if note:
            out.append({"id": e["id"], "area": e.get("area"), "variant": v, "templates": e.get("templates", ["all"]), "instruction": note})
    return out
