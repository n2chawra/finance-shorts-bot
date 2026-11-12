import json
from datetime import datetime, timezone
from pathlib import Path

from improvement import cycle_status


def write(p: Path, value) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value), encoding="utf-8")


def test_status_counts_each_side_and_judges_the_running_challenger(tmp_path: Path) -> None:
    write(tmp_path / "improvement/cycle/backlog.json", {"running": "x", "cycle": 2, "history": [{"id": "x", "kind": "look", "cycle": 2}]})
    write(tmp_path / "config/experiments.json", {"experiments": [
        {"id": "x", "area": "motion", "format": "short", "status": "running", "startedAt": "2026-11-01", "metric": "heldAfterHook"}]})
    vids = [{"id": f"v{i}", "format": "short", "publishAt": "2026-11-02T07:07:00Z", "experiments": {"x": "on" if i % 2 else "off"},
             "views48h": 100, "analyticsViews": 100, "engagedViews": 50, "heldAfterHook": 0.5} for i in range(6)]
    write(tmp_path / "metrics/videos.json", {"videos": vids})
    s = cycle_status.status(tmp_path, datetime(2026, 11, 5, tzinfo=timezone.utc))
    e = s["experiment"]
    assert s["cycle"] == 2 and e["kind"] == "look" and e["metric"] == "heldAfterHook"
    assert e["published"] == {"on": 3, "off": 3} and e["counted"] == {"on": 3, "off": 3}
    assert e["verdict"] == "wait" and s["thresholds"] == {"keepPoints": 5, "revertPoints": -5, "confidence": 0.8}
    assert s["channelStayed14d"] == 0.5


def test_no_running_challenger(tmp_path: Path) -> None:
    write(tmp_path / "improvement/cycle/backlog.json", {"running": None, "cycle": 0})
    assert cycle_status.status(tmp_path)["experiment"] is None
