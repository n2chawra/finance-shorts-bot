"""QA passes the stills before the full render (owner, 2026-11-25: "qa should always run on stills, after pass only
full render should happen so that time don't get wasted in full re-render")."""
import json
from pathlib import Path

import pytest

from generator import run

VID = "v-20261125-99"


@pytest.fixture
def video(root: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setenv("CHANNEL", "packless-test-channel")
    d = run._dir(VID, root)
    d.mkdir(parents=True)
    (d / "plan.json").write_text(json.dumps({"title": "A plan"}))
    (d / "script.json").write_text(json.dumps({"template": "short_story", "beats": [{"say": "one"}], "narrator": "x"}))
    (root / "remotion" / "src" / "videos" / VID).mkdir(parents=True)
    (root / "remotion" / "src" / "videos" / VID / "B1.tsx").write_text("export const B1 = 1;")
    return d


def stills(root: Path) -> None:
    run.log_step(VID, "render", True, [f"{run.FP_NOTE}{run.fingerprint(VID, root)}", "30 s, night/lofi (preview only)"], root)   # as render(preview=True) logs


def full(root: Path, ok: bool, notes: list[str]) -> None:
    run.log_step(VID, "render", ok, notes, root)


def test_no_full_render_without_a_qa_pass(root: Path, video: Path) -> None:
    assert run.full_render_problems(VID, root)                      # nothing yet
    with pytest.raises(ValueError, match="before its stills"):
        run.record(VID, "qa_review", True, ["looks fine"], root)    # QA can't pass stills that don't exist
    stills(root)
    run.record(VID, "qa_review", False, ["[script] cut-off text"], root)
    assert "QA has not passed" in run.full_render_problems(VID, root)[0]
    run.record(VID, "qa_review", True, ["ok"], root)
    assert run.full_render_problems(VID, root) == []


def test_a_change_after_qa_needs_new_stills_and_qa(root: Path, video: Path) -> None:
    stills(root)
    run.record(VID, "qa_review", True, ["ok"], root)
    (video / "script.json").write_text(json.dumps({"template": "short_story", "beats": [{"say": "two"}]}))
    assert "changed after QA" in run.full_render_problems(VID, root)[0]
    with pytest.raises(ValueError, match="changed after its stills"):
        run.record(VID, "qa_review", True, ["ok"], root)            # QA must look at the new stills
    stills(root)
    run.record(VID, "qa_review", True, ["ok"], root)
    assert run.full_render_problems(VID, root) == []


def test_render_itself_writing_the_narrator_is_not_a_change(root: Path, video: Path) -> None:
    stills(root)
    run.record(VID, "qa_review", True, ["ok"], root)
    s = json.loads((video / "script.json").read_text())
    (video / "script.json").write_text(json.dumps({**s, "narrator": "y", "experiments": {"a": "on"}}))
    assert run.full_render_problems(VID, root) == []


def test_a_motion_gate_fix_may_render_again_without_another_qa(root: Path, video: Path) -> None:
    stills(root)
    run.record(VID, "qa_review", True, ["ok"], root)
    full(root, False, ["liveliness: 6 s with nothing moving (limit 4 s)"])
    (root / "remotion" / "src" / "videos" / VID / "B1.tsx").write_text("export const B1 = 2;   // drift added")
    assert run.full_render_problems(VID, root) == []
    # but not after any other failure, nor when the words changed
    full(root, False, ["text 'x' at 3.0 s is 30 px, below the 44 px minimum"])
    assert run.full_render_problems(VID, root)


def test_old_qa_passes_without_a_fingerprint_are_trusted(root: Path, video: Path) -> None:
    run.log_step(VID, "qa_review", True, ["ok"], root)
    assert run.full_render_problems(VID, root) == []


def test_chapter_timestamps_added_after_the_full_render_are_not_a_change(root: Path, video: Path) -> None:
    """Studio writes a long video's CHAPTERS only once the full render has its timings (agents/studio.md step 7);
    ship refused L-20261126-41 for it (proposal 2026-11-26-chapters-fingerprint)."""
    body = "What the video covers.\n\nSources: NTSB final report.\nDisclaimer."
    (video / "plan.json").write_text(json.dumps({"title": "A plan", "description": body}))
    stills(root)
    run.record(VID, "qa_review", True, ["ok"], root)
    chaptered = "What the video covers.\n\nCHAPTERS\n0:00 Intro\n0:49 The Flight\n1:02:03 The Law\n\nSources: NTSB final report.\nDisclaimer."
    (video / "plan.json").write_text(json.dumps({"title": "A plan", "description": chaptered}))
    assert run.full_render_problems(VID, root) == []
    (video / "plan.json").write_text(json.dumps({"title": "A plan", "description": chaptered.replace("Disclaimer.", "New words.")}))
    assert "changed after QA" in run.full_render_problems(VID, root)[0]   # anything else still counts
