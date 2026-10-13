import json
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


# ---------------- state: what a run does ----------------

def test_state_makes_a_video_when_backlog_has_room(root: Path) -> None:
    s = run.state(root)
    assert s["mode"] == "video" and s["backlog"] == 0
    assert set(s["allowed_templates"]) == set(s["templates"])
    assert s["template_window"] == 2


def test_generation_pause_stops_everything(root: Path) -> None:
    settings(root, generationPaused=True)
    assert run.state(root)["mode"] == "paused"


def test_full_backlog_switches_to_template_work_once_a_day(root: Path) -> None:
    settings(root, backlog=30)
    assert run.state(root)["mode"] == "template_work"
    history.append_template_work("emi_breakdown", "build", False, root)
    s = run.state(root)
    assert s["mode"] == "idle" and "limit" in s["reason"]


def test_template_cap_stops_new_templates(root: Path) -> None:
    settings(root, backlog=30, templateWork={"maxTemplates": 4})
    s = run.state(root)["template_work"]
    assert s["may_add_template"] is False and s["templates"] == 4


def test_every_nth_run_is_template_work(root: Path) -> None:
    for i in range(4):
        history.append(entry(i), root)
    assert run.state(root)["mode"] == "template_work"        # the 5th run
    history.append_template_work("quiz_countdown", "improve", True, root)
    assert run.state(root)["mode"] == "video"                # today's template slot is used


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
    assert manifest["style"] == plan["style"] and manifest["durationSec"] == 48
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
    assert any("length 48 s is outside 50–60 s" in p for p in run.render(VID, preview=True, root=root))


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

def test_media_branch_holds_only_the_video(root: Path, tmp_path_factory: pytest.TempPathFactory, monkeypatch: pytest.MonkeyPatch) -> None:
    import subprocess
    for k, v in {"GIT_AUTHOR_NAME": "t", "GIT_AUTHOR_EMAIL": "t@example.com", "GIT_COMMITTER_NAME": "t", "GIT_COMMITTER_EMAIL": "t@example.com"}.items():
        monkeypatch.setenv(k, v)
    remote = tmp_path_factory.mktemp("remote")
    subprocess.run(["git", "init", "-q", "--bare", str(remote)], check=True)
    subprocess.run(["git", "init", "-q"], cwd=root, check=True)
    subprocess.run(["git", "remote", "add", "origin", str(remote)], cwd=root, check=True)
    d = root / "videos" / VID
    d.mkdir(parents=True)
    (d / "video.mp4").write_bytes(b"fake video bytes")

    assert run.push_media_branch(VID, root) == f"media/{VID}"
    files = subprocess.run(["git", "ls-tree", "--name-only", f"media/{VID}"], cwd=remote, check=True, capture_output=True, text=True).stdout.split()
    assert files == ["video.mp4"]
    blob = subprocess.run(["git", "show", f"media/{VID}:video.mp4"], cwd=remote, check=True, capture_output=True).stdout
    assert blob == b"fake video bytes"
    assert subprocess.run(["git", "status", "--porcelain", "--untracked-files=no"], cwd=root, capture_output=True, text=True).stdout == ""


def test_media_branch_needs_the_video(root: Path) -> None:
    with pytest.raises(ValueError, match="video.mp4 is missing"):
        run.push_media_branch(VID, root)
