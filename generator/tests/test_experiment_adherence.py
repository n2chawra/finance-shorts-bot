"""A video follows its arm of each running test that carries a `check` (2026-11-19: cycle 1's on side had
Shorts with no real photo in the hook, the off side one with a photo)."""
import json
from pathlib import Path

from generator.experiments import adherence_problems, variant


def _root(tmp: Path, check: dict) -> Path:
    (tmp / "config").mkdir()
    exp = {"id": "t-photo", "status": "running", "templates": ["short_story"], "share": 0.5, "check": check}
    (tmp / "config" / "experiments.json").write_text(json.dumps({"experiments": [exp]}))
    return tmp


def _video(root: Path, vid: str, hook_code: str) -> dict:
    d = root / "remotion" / "src" / "videos" / vid
    d.mkdir(parents=True)
    (d / "Hook.tsx").write_text(hook_code)
    return {"template": "short_story", "beats": [{"id": "hook", "scene": "directed", "params": {"component": "Hook"}}]}


def _ids(arm: str) -> str:
    return next(f"v-20261120-{n:02d}" for n in range(1, 20) if variant("t-photo", f"v-20261120-{n:02d}") == arm)


def test_hook_photo_on_side_needs_a_photo(tmp_path):
    root = _root(tmp_path, {"kind": "hook-photo"})
    vid = _ids("on")
    script = _video(root, vid, "export const Hook = () => <Char who='rohan' />;")
    assert any("(on)" in p for p in adherence_problems(vid, script, root))
    (root / "remotion/src/videos" / vid / "Hook.tsx").write_text("export const Hook = () => <Char photo=\"netflix\" />;")
    assert adherence_problems(vid, script, root) == []


def test_hook_photo_off_side_must_not_show_one(tmp_path):
    root = _root(tmp_path, {"kind": "hook-photo"})
    vid = _ids("off")
    script = _video(root, vid, "export const Hook = () => <Char photo=\"netflix\" />;")
    assert any("(off)" in p for p in adherence_problems(vid, script, root))


def test_waiver_and_code_check(tmp_path):
    root = _root(tmp_path, {"kind": "code", "pattern": r"flag:\s*\"", "what": "a flag fill"})
    vid = _ids("on")
    script = _video(root, vid, "const c = { Denmark: { fill: RED } };")
    assert any("a flag fill" in p for p in adherence_problems(vid, script, root))
    assert adherence_problems(vid, {**script, "experimentWaivers": {"t-photo": "no flag in the table"}}, root) == []
    (root / "remotion/src/videos" / vid / "Hook.tsx").write_text("const c = { Denmark: { fill: RED, flag: \"Denmark\" } };")
    assert adherence_problems(vid, script, root) == []
