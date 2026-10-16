"""Checks that apply to every template, run against its example script."""
import copy
import json
from pathlib import Path

import pytest

from renderer.cli import TEMPLATES, load
from renderer.engine.canvas import DISCLAIMER, Drawn
from renderer.engine.music import GENRES, KEYS
from renderer.engine.style import PALETTES

ROOT = Path(__file__).resolve().parents[2]
NAMES = sorted(p.name for p in TEMPLATES.iterdir() if (p / "schema.json").is_file())


def example(name: str) -> Path:
    return ROOT / "examples" / f"{name}.json"


def test_all_templates_exist() -> None:
    assert NAMES == ["money_leak_meter", "money_news", "myth_vs_fact", "quiz_countdown", "two_friends_race"]


@pytest.mark.parametrize("name", NAMES)
def test_schema_style_block_matches_engine(name: str) -> None:
    style = json.loads((TEMPLATES / name / "schema.json").read_text(encoding="utf-8"))["properties"]["style"]["properties"]
    assert sorted(style["palette"]["enum"]) == sorted(PALETTES)
    assert tuple(style["genre"]["enum"]) == GENRES
    assert tuple(style["key"]["enum"]) == KEYS


@pytest.mark.parametrize("name", NAMES)
def test_example_builds_with_valid_length(name: str) -> None:
    v = load(example(name))
    assert 45 <= v.duration <= 60
    assert v.scenes[0][0] == 0 and v.scenes[-1][1] == v.duration
    assert all(a[1] == b[0] for a, b in zip(v.scenes, v.scenes[1:]))     # no gaps between scenes


@pytest.mark.parametrize("name", NAMES)
def test_layout_rules_hold_through_the_video(name: str) -> None:
    v = load(example(name))
    problems = [p for i in range(int(v.duration)) for p in v.layout_problems(i + 0.5)]
    assert problems == []


@pytest.mark.parametrize("name", NAMES)
@pytest.mark.parametrize("palette", sorted(PALETTES))
def test_layout_rules_hold_in_every_palette(name: str, palette: str, tmp_path: Path) -> None:
    script = json.loads(example(name).read_text(encoding="utf-8"))
    script["style"] = {"palette": palette}
    p = tmp_path / "s.json"
    p.write_text(json.dumps(script), encoding="utf-8")
    v = load(p)
    assert [x for t in v.key_times for x in v.layout_problems(t)] == []


@pytest.mark.parametrize("name", NAMES)
def test_ends_with_disclaimer(name: str) -> None:
    v = load(example(name))
    log: list[Drawn] = []
    v.frame(v.duration - 1.5, log)
    assert DISCLAIMER in [d.s for d in log]


@pytest.mark.parametrize("name", NAMES)
def test_hook_is_on_screen_within_first_second(name: str) -> None:
    v = load(example(name))
    log: list[Drawn] = []
    v.frame(0.9, log)
    assert any(d.size >= 80 for d in log)


@pytest.mark.parametrize("name", NAMES)
def test_typed_numbers_are_rejected(name: str, tmp_path: Path) -> None:
    script = json.loads(example(name).read_text(encoding="utf-8"))
    key = next(iter(script["text"]))
    for bad in ("Get 5 Cr fast", "₹ lakhs here"):
        s = copy.deepcopy(script)
        s["text"][key] = bad
        p = tmp_path / "s.json"
        p.write_text(json.dumps(s), encoding="utf-8")
        with pytest.raises(ValueError, match="typed number"):
            load(p)


@pytest.mark.parametrize("name", NAMES)
def test_schema_rejects_unknown_fields(name: str, tmp_path: Path) -> None:
    script = json.loads(example(name).read_text(encoding="utf-8"))
    script["final_value"] = 123
    p = tmp_path / "s.json"
    p.write_text(json.dumps(script), encoding="utf-8")
    with pytest.raises(ValueError, match="does not match schema"):
        load(p)


@pytest.mark.parametrize("name", NAMES)
def test_same_script_same_frame_and_audio(name: str) -> None:
    a, b = load(example(name)), load(example(name))
    t = a.key_times[-2]
    assert a.frame(t).tobytes() == b.frame(t).tobytes()
    assert (a.audio().master() == b.audio().master()).all()


@pytest.mark.parametrize("name", NAMES)
def test_audio_levels(name: str) -> None:
    peak, mean = load(example(name)).audio().levels()
    assert peak == pytest.approx(-1.0, abs=0.1)
    assert -21 <= mean <= -15
