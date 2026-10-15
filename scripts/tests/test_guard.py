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

COPIED = ["renderer/engine/canvas.py", "renderer/engine/video.py", "generator/run.py", "generator/numbers.py"]


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
    canvas = (repo / "renderer/engine/canvas.py").read_text(encoding="utf-8").replace("Illustrative only. Not financial advice.", "Enjoy!")
    change(repo, "renderer/engine/canvas.py", canvas)
    r = guard.check("improver", "main", "HEAD")
    assert not r["ok"] and any("DISCLAIMER" in x for x in r["reasons"])


def test_blocks_shrinking_text_below_44px(repo: Path) -> None:
    canvas = (repo / "renderer/engine/canvas.py").read_text(encoding="utf-8").replace("MIN_TEXT = 44", "MIN_TEXT = 30")
    change(repo, "renderer/engine/canvas.py", canvas)
    assert any("MIN_TEXT" in x for x in guard.check("improver", "main", "HEAD")["reasons"])


def test_blocks_audio_files_network_and_secrets(repo: Path) -> None:
    change(repo, "renderer/engine/song.mp3", "fake")
    change(repo, "renderer/engine/fetch.py", "import requests\nKEY = 'ghp_abcdefghijklmnopqrstuvwxyz123456'\n")
    reasons = guard.check("improver", "main", "HEAD")["reasons"]
    assert any("audio/video files" in x for x in reasons)
    assert any("network" in x for x in reasons)
    assert any("secret" in x for x in reasons)


def test_blocks_oversized_changes(repo: Path) -> None:
    change(repo, "renderer/templates/big/template.py", "x = 1\n" * 1000)
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
