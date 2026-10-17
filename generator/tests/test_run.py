import json
from datetime import timedelta
from pathlib import Path

import pytest

from generator import history, run

from .conftest import NOW, entry, example, make_plan

VID = "v-20261013-01"


def put(root: Path, name: str, data: object) -> None:
    d = root / "videos" / VID
    d.mkdir(parents=True, exist_ok=True)
    (d / name).write_text(json.dumps(data), encoding="utf-8")


def script_for(plan: dict) -> dict:
    return {**example("quiz_countdown"), "seed": plan["seed"], "style": plan["style"]}


def settings(root: Path, **values) -> None:
    (root / "config" / "settings.json").write_text(json.dumps(values), encoding="utf-8")


# ---------------- history ----------------

def test_history_append_validates_and_rejects_duplicates(root: Path) -> None:
    history.append(entry(1), root)
    assert [e["id"] for e in history.load(root)] == ["v-test-01"]
    with pytest.raises(ValueError, match="already has"):
        history.append(entry(1), root)
    with pytest.raises(ValueError, match="missing"):
        history.append({"id": "x"}, root)


def test_next_id_skips_used_ids(root: Path) -> None:
    assert history.next_id([], NOW, root) == "v-20261013-01"
    (root / "videos" / "v-20261013-01").mkdir()
    assert history.next_id([{"id": "v-20261013-02"}], NOW, root) == "v-20261013-03"


def test_ready_count_adds_videos_shipped_since_last_ingest() -> None:
    entries = [entry(1, days_ago=3), entry(2, days_ago=1)]
    assert history.ready_count(entries, {"backlog": 0, "ingestedAt": None}) == 2
    assert history.ready_count(entries, {"backlog": 10, "ingestedAt": entry(9, days_ago=2)["created_at"]}) == 11


def test_ready_count_compares_timestamps_across_utc_offsets() -> None:
    # 20:00 IST is 14:30 UTC: later than an ingest at 14:00 UTC, though the string sorts earlier
    shipped = {"created_at": "2026-10-14T20:00:00+05:30"}
    assert history.ready_count([shipped], {"backlog": 0, "ingestedAt": "2026-10-14T14:00:00+00:00"}) == 1
    assert history.ready_count([shipped], {"backlog": 0, "ingestedAt": "2026-10-14T15:00:00+00:00"}) == 0


# ---------------- state: what a run does ----------------

def test_state_makes_a_video_when_backlog_has_room(root: Path) -> None:
    s = run.state(root)
    assert s["mode"] == "video" and s["backlog"] == 0
    assert set(s["allowed_templates"]) == set(s["templates"])
    assert s["template_window"] == 2


def test_generation_pause_stops_everything(root: Path) -> None:
    settings(root, generationPaused=True)
    assert run.state(root)["mode"] == "paused"


def test_full_backlog_idles_video_runs(root: Path) -> None:
    settings(root, backlog=30)
    s = run.state(root)
    assert s["mode"] == "idle" and "cap" in s["reason"]


def test_template_cap_stops_new_templates(root: Path) -> None:
    settings(root, backlog=30, templateWork={"maxTemplates": 4})
    s = run.state(root)["template_work"]
    assert s["may_add_template"] is False and s["templates"] == 6


@pytest.fixture
def today(monkeypatch: pytest.MonkeyPatch) -> None:
    """Freeze the clock at NOW, so entries made with small days_ago count as today (IST)."""
    monkeypatch.setattr(history, "now", lambda: NOW)


def test_video_runs_stop_at_the_daily_target(root: Path, today: None) -> None:
    for i in range(2):
        history.append(entry(i, days_ago=0.1), root)
    s = run.state(root)
    assert s["mode"] == "video" and s["videos_today"] == 2 and s["daily_target"] == 3
    history.append(entry(2, days_ago=0.05), root)
    s = run.state(root)
    assert s["mode"] == "idle" and "3 videos are made" in s["reason"]   # template work is the improver's


def test_state_lists_experiment_instructions_for_the_next_video(root: Path) -> None:
    (root / "config" / "experiments.json").write_text(json.dumps({"experiments": [
        {"id": "x", "area": "hook", "status": "running", "share": 1.0, "prompt": {"on": "Open with the number."}},
        {"id": "done", "status": "kept", "prompt": {"on": "ignored"}}]}), encoding="utf-8")
    notes = run.state(root)["experiments"]
    assert [n["id"] for n in notes] == ["x"] and notes[0]["variant"] == "on" and notes[0]["instruction"] == "Open with the number."


def test_videos_from_yesterday_do_not_count_toward_today(root: Path, today: None) -> None:
    for i in range(5):
        history.append(entry(i, days_ago=1), root)
    assert run.state(root)["videos_today"] == 0 and run.state(root)["mode"] == "video"


def test_daily_target_is_a_setting(root: Path, today: None) -> None:
    settings(root, dailyVideoTarget=1, templateWork={"everyNthRun": 0})
    history.append(entry(1, days_ago=0.1), root)
    assert run.state(root)["mode"] == "idle"                 # no template work outside a full backlog


def test_no_template_runs_once_templates_are_at_the_limit(root: Path, today: None) -> None:
    settings(root, templateWork={"everyNthRun": 3, "maxTemplates": 4})
    for i in range(3):
        history.append(entry(i, days_ago=0.1), root)
    assert run.state(root)["mode"] == "idle"


def test_disabled_template_is_not_offered(root: Path) -> None:
    settings(root, templates={"quiz_countdown": {"enabled": False}})
    assert "quiz_countdown" not in run.state(root)["allowed_templates"]


# ---------------- steps ----------------

def test_full_run_ships_manifest_and_history(root: Path) -> None:
    plan = make_plan()
    put(root, "plan.json", plan)
    put(root, "script.json", script_for(plan))
    assert run.check_plan(VID, root) == []
    assert run.run_number_check(VID, root) == []
    run.record(VID, "fact_review", True, ["Claims OK."], root)
    assert run.render(VID, preview=True, root=root) == []
    run.record(VID, "qa_review", True, ["No overlaps."], root)

    with pytest.raises(ValueError, match="video.mp4 is missing"):
        run.ship(VID, root=root)
    (root / "videos" / VID / "video.mp4").write_bytes(b"stand-in for the encoded video")
    manifest = run.ship(VID, root=root)

    assert manifest["status"] == "qa_passed"
    assert [c["checker"] for c in manifest["checks"]] == ["number_check", "fact_review", "qa_review"]
    assert all(c["passed"] for c in manifest["checks"])
    assert [s["agent"] for s in manifest["agentRuns"]] == ["planner", "number_check", "fact_review", "render", "qa_review", "ship"]
    assert manifest["release"] == {"tag": f"video-{VID}", "asset": "video.mp4", "uploaded": False}
    assert manifest["style"] == {**plan["style"], "voice": None} and manifest["durationSec"] == 36
    assert json.loads((root / "videos" / VID / "manifest.json").read_text(encoding="utf-8"))["id"] == VID
    assert [e["id"] for e in history.load(root)] == [VID]
    with pytest.raises(ValueError, match="already shipped"):
        run.ship(VID, root=root)
    assert run.state(root)["backlog"] == 1


def test_ship_refuses_when_a_check_failed_or_is_missing(root: Path) -> None:
    plan = make_plan()
    put(root, "plan.json", plan)
    put(root, "script.json", script_for(plan))
    run.run_number_check(VID, root)
    run.record(VID, "fact_review", False, ["Tax claim is wrong."], root)
    run.render(VID, preview=True, root=root)
    (root / "videos" / VID / "video.mp4").write_bytes(b"x")
    with pytest.raises(ValueError, match="fact_review has not passed; qa_review has not passed"):
        run.ship(VID, root=root)
    assert history.load(root) == []
    run.record(VID, "fact_review", True, ["Fixed."], root)      # a later pass replaces the earlier failure
    run.record(VID, "qa_review", True, ["OK."], root)
    assert run.ship(VID, root=root)["status"] == "qa_passed"


def test_check_plan_reports_variety_problems(root: Path) -> None:
    history.append(entry(1, "quiz_countdown", "sip"), root)
    put(root, "plan.json", make_plan(hashtags=["#SIP"]))
    problems = run.check_plan(VID, root)
    assert any("used in the last 2 videos" in p for p in problems)
    assert any("category 'sip'" in p for p in problems)
    assert any("#Shorts" in p for p in problems)


def test_number_check_failure_is_logged(root: Path) -> None:
    plan = make_plan(title="Quiz: how a SIP makes you ₹9 Cr richer")
    put(root, "plan.json", plan)
    put(root, "script.json", script_for(plan))
    problems = run.run_number_check(VID, root)
    assert any("'₹9 Cr'" in p for p in problems)
    log = json.loads((root / "videos" / VID / "run.json").read_text(encoding="utf-8"))
    assert log[-1]["agent"] == "number_check" and log[-1]["status"] == "failed"


def test_render_rejects_length_outside_settings(root: Path) -> None:
    settings(root, lengthMinSec=50, lengthMaxSec=60)
    plan = make_plan()
    put(root, "plan.json", plan)
    put(root, "script.json", script_for(plan))
    assert any("length 36 s is outside 50–60 s" in p for p in run.render(VID, preview=True, root=root))


def test_long_story_renders_with_remotion_and_fails_a_frozen_picture(root: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    seen = {}

    def fake_story(script: dict, out: Path, preview: bool = False) -> dict:
        seen["template"] = script["template"]
        return {"renderer": "remotion", "duration_sec": 240, "layout_problems": [], "style": {"palette": "night", "genre": "lofi"},
                "voice": {"name": "am_michael", "lines": [{"scene": "a", "fill": 0.8, "window": 5, "seconds": 4}]},
                "audio": {"peak_db": -1.0, "mean_db": -17.0},
                "liveliness_problems": ["12 s with nothing moving (limit 4 s)"]}

    monkeypatch.setattr(run.remotion, "render_story", fake_story)
    plan = make_plan(template="long_story")
    put(root, "plan.json", plan)
    put(root, "script.json", {"template": "long_story", "format": "long", "seed": 1, "beats": []})
    problems = run.render(VID, root=root)
    assert seen["template"] == "long_story"
    assert problems == ["12 s with nothing moving (limit 4 s)"]


def test_fail_writes_manifest_but_not_history(root: Path) -> None:
    put(root, "plan.json", make_plan())
    m = run.fail(VID, "Fact review rejected it twice.", root)
    assert m["status"] == "failed" and m["failReason"].startswith("Fact review")
    assert history.load(root) == []

def test_release_uploads_and_marks_manifest(root: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    plan = make_plan()
    put(root, "plan.json", plan)
    put(root, "script.json", script_for(plan))
    run.run_number_check(VID, root)
    run.record(VID, "fact_review", True, ["OK."], root)
    run.render(VID, preview=True, root=root)
    run.record(VID, "qa_review", True, ["OK."], root)
    (root / "videos" / VID / "video.mp4").write_bytes(b"x")
    run.ship(VID, root=root)

    calls: list[list[str]] = []
    monkeypatch.setattr(run, "gh_exe", lambda: "gh")
    monkeypatch.setattr(run.subprocess, "run", lambda cmd, **kw: calls.append(cmd))
    m = run.upload_release(VID, root)
    assert calls[0][:4] == ["gh", "release", "create", f"video-{VID}"] and calls[0][4].endswith("video.mp4")
    assert m["release"]["uploaded"] is True and "uploadedAt" in m["release"]
    assert json.loads((root / "videos" / VID / "manifest.json").read_text(encoding="utf-8"))["release"]["uploaded"] is True
    with pytest.raises(ValueError, match="already uploaded"):
        run.upload_release(VID, root)


def test_failed_video_is_never_released(root: Path) -> None:
    put(root, "plan.json", make_plan())
    run.fail(VID, "QA rejected it.", root)
    with pytest.raises(ValueError, match="only qa_passed videos are released"):
        run.upload_release(VID, root)

def test_media_branch_is_head_plus_the_video(root: Path, tmp_path_factory: pytest.TempPathFactory, monkeypatch: pytest.MonkeyPatch) -> None:
    import subprocess
    for k, v in {"GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@example.com", "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@example.com"}.items():
        monkeypatch.setenv(k, v)

    def git(*args: str, cwd: Path = root) -> str:
        return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True).stdout.decode().strip()

    remote = tmp_path_factory.mktemp("remote")
    git("init", "-q", "--bare", str(remote))
    git("init", "-q", "-b", "main")
    git("remote", "add", "origin", str(remote))
    (root / ".gitignore").write_text("*.mp4\n", encoding="utf-8")
    (root / "workflow.yml").write_text("on: push\n", encoding="utf-8")
    git("add", ".gitignore", "workflow.yml")
    git("commit", "-q", "-m", "base")
    git("push", "-q", "origin", "main")
    d = root / "videos" / VID
    d.mkdir(parents=True)
    (d / "video.mp4").write_bytes(b"fake video bytes")

    assert run.push_media_branch(VID, root) == f"media/{VID}"
    assert sorted(git("ls-tree", "--name-only", f"media/{VID}", cwd=remote).split()) == [".gitignore", "video.mp4", "workflow.yml"]
    assert subprocess.run(["git", "show", f"media/{VID}:video.mp4"], cwd=remote, check=True, capture_output=True).stdout == b"fake video bytes"
    assert git("rev-parse", f"media/{VID}^", cwd=remote) == git("rev-parse", "HEAD")      # built on HEAD
    assert git("status", "--porcelain", "--untracked-files=no") == ""                     # index and tree untouched
    assert git("rev-parse", "--abbrev-ref", "HEAD") == "main"

def test_media_branch_needs_the_video(root: Path) -> None:
    with pytest.raises(ValueError, match="video.mp4 is missing"):
        run.push_media_branch(VID, root)


def test_a_trending_topic_earns_one_extra_video(root: Path, today: None) -> None:
    for i in range(3):
        history.append(entry(i, days_ago=0.1), root)
    assert run.state(root)["mode"] == "idle"
    (root / "improvement" / "research").mkdir(parents=True)
    (root / "improvement" / "research" / "topics.json").write_text(json.dumps({"topics": [
        {"id": "hot", "title": "Gold at a record", "category": "gold", "kind": "trend", "priority": "trending",
         "templates": ["any"], "found": "2026-10-13", "expires": "2026-10-15", "status": "new"}]}), encoding="utf-8")
    s = run.state(root)
    assert s["mode"] == "video" and "trending topic is waiting" in s["reason"]
    assert s["topic_feed"]["required"] == "hot"
    history.append(entry(3, days_ago=0.05), root)
    assert run.state(root)["mode"] == "idle"                     # only one extra a day


def test_the_renderer_switch_picks_the_shorts_templates(root: Path) -> None:
    pillow = run.enabled_templates(run.load_settings(root), "short", root)
    assert "short_story" not in pillow and "quiz_countdown" in pillow           # no switch file: Pillow
    (root / "config" / "renderer.json").write_text(json.dumps({"short": "remotion"}), encoding="utf-8")
    remotion = run.enabled_templates(run.load_settings(root), "short", root)
    assert "short_story" in remotion and "quiz_countdown" not in remotion
    assert "money_news" in remotion                                              # news stays on Pillow
    assert "long_story" not in remotion and run.plan_format({"template": "short_story"}) == "short"
