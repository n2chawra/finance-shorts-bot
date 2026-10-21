"""A video's custom hook may only build on the studio kit (renderer/remotion.py hook_problems)."""
from pathlib import Path

import pytest

from renderer import remotion


def put(root: Path, code: str) -> None:
    d = root / "src" / "videos" / "v-test"
    d.mkdir(parents=True)
    (d / "Hook.tsx").write_text(code, encoding="utf-8")


@pytest.fixture
def root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setattr(remotion, "REMOTION", tmp_path)    # no node_modules here: the type-check is skipped
    return tmp_path


def test_no_custom_hook_means_nothing_to_check(root: Path) -> None:
    assert remotion.hook_problems("v-test") == []


def test_a_hook_built_from_the_kit_passes(root: Path) -> None:
    put(root, 'import React from "react";\nimport { AbsoluteFill } from "remotion";\nimport { SETS } from "../../studio/sets";\n'
              'import { Actor } from "../../scenes/kit";\nconst Hook = () => <AbsoluteFill />;\nexport default Hook;\n')
    assert remotion.hook_problems("v-test") == []


def test_a_hook_may_not_reach_outside_the_kit_or_be_random(root: Path) -> None:
    put(root, 'import fs from "node:fs";\nimport x from "../../../../generator/run";\n'
              'const Hook = () => { fetch("https://x"); return Math.random() > 0.5 ? null : null; };\n')
    problems = remotion.hook_problems("v-test")
    assert any("node:fs" in p for p in problems) and any("generator/run" in p for p in problems)
    assert any("fetch(" in p for p in problems) and any("Math.random" in p for p in problems)
    assert any("default-export" in p for p in problems)
