"""The guard runs on a throwaway git repository holding copies of the files it inspects."""
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "scripts"))
import guard  # noqa: E402

COPIED = ["remotion/src/design/rules.ts", "remotion/src/design/frame.ts", "remotion/src/scenes/stage.tsx",
          "remotion/src/compositions/StoryVideo.tsx",
          "renderer/timeline/build.py", "renderer/gates.py", "generator/run.py", "generator/numbers.py"]


def sh(root: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=root, check=True, capture_output=True)


@pytest.fixture
def repo(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    for f in COPIED:
        (tmp_path / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(REPO / f, tmp_path / f)
    sh(tmp_path, "init", "-q", "-b", "main")
    sh(tmp_path, "config", "user.email", "t@t"); sh(tmp_path, "config", "user.name", "t")
    sh(tmp_path, "add", "."); sh(tmp_path, "commit", "-q", "-m", "base")
    sh(tmp_path, "checkout", "-q", "-b", "agent/improver/x")
    monkeypatch.setattr(guard, "ROOT", tmp_path)
    return tmp_path


def change(root: Path, path: str, text: str) -> None:
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")
    sh(root, "add", "-A"); sh(root, "commit", "-q", "-m", "change")


def test_allows_a_renderer_change_for_the_improver(repo: Path) -> None:
    change(repo, "renderer/templates/new/template.py", "x = 1\n")
    r = guard.check("improver", "main", "HEAD")
    assert r["ok"], r["reasons"]
    assert r["needsTests"]


def test_the_improver_may_change_how_videos_look_but_not_the_layout_probe(repo: Path) -> None:
    change(repo, "remotion/src/scenes/kit.tsx", "export const x = 1;\n")
    r = guard.check("improver", "main", "HEAD")
    assert r["ok"], r["reasons"]
    assert r["areas"] == ["remotion"]
    change(repo, "remotion/src/fx/probe.tsx", "export {};\n")
    r = guard.check("improver", "main", "HEAD")
    assert not r["ok"] and any("probe.tsx: protected" in x for x in r["reasons"])


def test_blocks_workflows_and_files_outside_the_allow_list(repo: Path) -> None:
    change(repo, ".github/workflows/x.yml", "on: push\n")
    change(repo, "apps/dashboard/src/app/page.tsx", "x\n")
    r = guard.check("improver", "main", "HEAD")
    assert not r["ok"]
    assert any(".github/workflows/x.yml: protected" in x for x in r["reasons"])
    assert any("outside what the improver agent may change" in x for x in r["reasons"])


def test_research_may_only_write_reports(repo: Path) -> None:
    change(repo, "improvement/research/2026-10-16.md", "# report\n")
    assert guard.check("research", "main", "HEAD")["ok"]
    change(repo, "generator/prompts/planner.md", "x\n")
    assert not guard.check("research", "main", "HEAD")["ok"]


def test_blocks_removing_the_disclaimer(repo: Path) -> None:
    rules = (repo / "remotion/src/design/rules.ts").read_text(encoding="utf-8").replace("Illustrative only. Not financial advice.", "Enjoy!")
    change(repo, "remotion/src/design/rules.ts", rules)
    r = guard.check("improver", "main", "HEAD")
    assert not r["ok"] and any("DISCLAIMER" in x for x in r["reasons"])


@pytest.mark.parametrize("field, was, now, error", [
    ("minText", 44, 30, "minText"),
    ("bottomSafe", 120, 60, "bottomSafe"),
])
def test_blocks_weakening_the_shorts_layout_rules(repo: Path, field: str, was: int, now: int, error: str) -> None:
    frame = (repo / "remotion/src/design/frame.ts").read_text(encoding="utf-8")
    assert f"{field}: {was}" in frame
    change(repo, "remotion/src/design/frame.ts", frame.replace(f"{field}: {was}", f"{field}: {now}", 1))
    assert any(error in x for x in guard.check("improver", "main", "HEAD")["reasons"])


def test_blocks_loosening_the_liveliness_gate(repo: Path) -> None:
    gates = (repo / "renderer/gates.py").read_text(encoding="utf-8")
    change(repo, "renderer/gates.py", gates.replace("LIVELY_MEDIAN = 1.2", "LIVELY_MEDIAN = 0.5", 1))
    assert any("LIVELY_MEDIAN" in x for x in guard.check("improver", "main", "HEAD")["reasons"])


def test_blocks_audio_files_network_and_secrets(repo: Path) -> None:
    change(repo, "renderer/engine/song.mp3", "fake")
    change(repo, "renderer/engine/fetch.py", "import requests\nKEY = 'ghp_abcdefghijklmnopqrstuvwxyz123456'\n")
    reasons = guard.check("improver", "main", "HEAD")["reasons"]
    assert any("audio/video files" in x for x in reasons)
    assert any("network" in x for x in reasons)
    assert any("secret" in x for x in reasons)


def test_blocks_oversized_changes(repo: Path) -> None:
    change(repo, "renderer/templates/big/template.py", "x = 1\n" * (guard.MAX_LINES["improver"] + 100))
    assert any("changed lines" in x for x in guard.check("improver", "main", "HEAD")["reasons"])


def test_daily_merge_limit(repo: Path) -> None:
    change(repo, "renderer/templates/a/template.py", "x = 1\n")
    now = datetime(2026, 10, 16, 3, 0, tzinfo=timezone.utc)
    log = {"merges": [{"agent": "improver", "result": "merged", "dayIst": "2026-10-16"}] * 2}
    (repo / "improvement").mkdir(exist_ok=True)
    (repo / "improvement/merge-log.json").write_text(json.dumps(log), encoding="utf-8")
    assert any("already merged" in x for x in guard.check("improver", "main", "HEAD", now)["reasons"])


def test_reports_only_branches_skip_the_test_suite(repo: Path) -> None:
    change(repo, "improvement/research/2026-10-16.md", "# report\n")
    assert guard.check("research", "main", "HEAD")["needsTests"] is False


def test_auditor_may_fix_workers_and_live_counts(repo: Path) -> None:
    change(repo, "workers/stats.ts", "x\n")
    change(repo, "apps/dashboard/src/lib/live-stats.ts", "x\n")
    change(repo, "workers/tests/stats.test.ts", "x\n")
    r = guard.check("auditor", "main", "HEAD")
    assert r["ok"], r["reasons"]
    assert r["areas"] == ["dashboard", "workers"]


def test_auditor_never_touches_uploads_sign_in_or_the_audit(repo: Path) -> None:
    locked = ["workers/publish.ts", "workers/lib/youtube.ts", "workers/data-audit.ts", "workers/lib/data-audit.ts", "apps/dashboard/src/lib/auth.ts", ".github/workflows/x.yml", "scripts/guard.py"]
    for f in locked:
        change(repo, f, "x\n")
    reasons = guard.check("auditor", "main", "HEAD")["reasons"]
    for f in locked:
        assert any(x.startswith(f"{f}: protected") for x in reasons), f


def test_workers_stay_protected_for_other_agents(repo: Path) -> None:
    change(repo, "workers/stats.ts", "x\n")
    assert any("protected" in x for x in guard.check("dashboard", "main", "HEAD")["reasons"])


def test_blocks_deleting_tests(repo: Path) -> None:
    change(repo, "generator/tests/test_x.py", "def test_x():\n    pass\n")
    sh(repo, "branch", "-f", "base2")
    sh(repo, "rm", "-q", "generator/tests/test_x.py")
    sh(repo, "commit", "-q", "-m", "rm")
    assert any("deleting a test file" in x for x in guard.check("auditor", "base2", "HEAD")["reasons"])


def test_blocks_changing_the_upload_schedule(repo: Path) -> None:
    change(repo, "apps/dashboard/src/lib/store.db.ts", 'const D = { uploadTimes: ["12:37", "19:07"] };\n')
    sh(repo, "branch", "-f", "base2")
    change(repo, "apps/dashboard/src/lib/store.db.ts", 'const D = { uploadTimes: ["09:00", "12:37", "19:07"] };\n')
    assert any("upload schedule" in x for x in guard.check("auditor", "base2", "HEAD")["reasons"])


def test_blocks_committing_model_weights(repo: Path) -> None:
    change(repo, "renderer/engine/kokoro-v1.0.onnx", "fake")
    assert any("model weights" in x for x in guard.check("improver", "main", "HEAD")["reasons"])
