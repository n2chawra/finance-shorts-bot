"""The channel's weekly trend and each landed change's before/after (owner, 2026-11-10)."""
import json
from pathlib import Path

from generator import impact


def put(root: Path) -> None:
    (root / "metrics").mkdir(exist_ok=True)
    (root / "improvement").mkdir(exist_ok=True)
    vids = [
        {"id": "v-1", "format": "short", "publishAt": "2026-11-02T01:37:00Z", "views48h": 100, "avgViewPct": 40.0, "durationSec": 30},
        {"id": "v-2", "format": "short", "publishAt": "2026-11-03T01:37:00Z", "views48h": 300, "avgViewPct": 60.0, "durationSec": 20},
        {"id": "v-3", "format": "short", "publishAt": "2026-11-10T01:37:00Z", "views48h": 900, "avgViewPct": 80.0, "durationSec": 25},
        {"id": "L-1", "format": "long", "publishAt": "2026-11-10T14:37:00Z", "views48h": 50, "avgViewPct": 5.0},
        {"id": "v-4", "format": "short", "publishAt": "2026-11-11T01:37:00Z", "views48h": None},
    ]
    (root / "metrics" / "videos.json").write_text(json.dumps({"videos": vids}))
    (root / "metrics" / "analytics.json").write_text(json.dumps({"videos": [
        {"id": "v-1", "views": 120, "engagedRatio": 0.5}, {"id": "v-3", "views": 0, "engagedRatio": 0.9}]}))
    (root / "improvement" / "experiments.json").write_text(json.dumps({"experiments": [
        {"id": "fix-a", "status": "adopted", "format": "short", "startedAt": "2026-11-08", "area": "hook"},
        {"id": "running-b", "status": "running", "format": "short", "startedAt": "2026-11-08"}]}))


def test_weeks_and_changes(tmp_path: Path) -> None:
    put(tmp_path)
    r = impact.report(tmp_path)
    assert [w["week"] for w in r["weeks"]] == ["2026-11-02", "2026-11-09"]
    first = r["weeks"][0]
    assert first["n"] == 2 and first["medianViews48h"] == 200 and first["avgViewPct"] == 50.0
    assert first["stayedToWatch"] == 0.5          # v-2 has no Studio numbers; a 0-view row doesn't count
    assert first["avgViewSec"] == 12.0            # mean of 12 s and 12 s
    assert r["weeks"][1]["stayedToWatch"] is None
    [c] = r["changes"]                            # the running experiment is not a landed change
    assert c["id"] == "fix-a" and c["before"]["n"] == 2 and c["after"]["n"] == 1 and c["viewsRatio"] == 4.5
