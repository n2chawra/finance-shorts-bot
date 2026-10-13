import copy
import json
from pathlib import Path

import pytest

from renderer.engine.canvas import DISCLAIMER, SAFE_W, fit, font
from renderer.templates.two_friends_race.template import build, nice_axis, simulate

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture
def script() -> dict:
    return json.loads((ROOT / "examples" / "two_friends_race.json").read_text(encoding="utf-8"))


def test_simulate_matches_closed_form() -> None:
    # annuity due: P * ((1+r)^n - 1) / r * (1+r)
    r, n = 0.01, 120
    s = simulate(5000, 12, 25, 35, 25, 35)
    assert len(s) == n + 1
    assert s[0] == 0
    assert s[-1] == pytest.approx(5000*((1 + r)**n - 1)/r*(1 + r))


def test_simulate_stops_contributing_but_keeps_growing() -> None:
    s = simulate(5000, 12, 25, 60, 25, 35)
    assert s[-1] == pytest.approx(s[120]*1.01**300)


def test_numbers_are_computed_from_inputs(script: dict) -> None:
    v = build(script)
    assert v.invested == [600000, 1500000]
    assert v.txt["hook_title"] == "₹6 Lakh vs ₹15 Lakh"
    assert v.txt["a_amount"] == "₹5,000 / month"
    assert v.txt["result_line1"] == "Rahul put in 2.5× LESS"
    assert v.txt["result_line2"] == "but has 2.4× MORE"
    assert v.final[0] > v.final[1]


def test_changing_inputs_changes_text(script: dict) -> None:
    script["monthly"] = 10000
    assert build(script).txt["hook_title"] == "₹12 Lakh vs ₹30 Lakh"


def test_typed_numbers_are_rejected(script: dict) -> None:
    for bad in ("Rahul gets 2 Cr", "He has ₹ more"):
        s = copy.deepcopy(script)
        s["text"]["result_line2"] = bad
        with pytest.raises(ValueError, match="typed number"):
            build(s)


def test_unknown_placeholder_is_rejected(script: dict) -> None:
    script["text"]["hook_sub"] = "{nope} wins"
    with pytest.raises(ValueError, match="bad placeholder"):
        build(script)


def test_story_must_hold(script: dict) -> None:
    script["people"][0]["stop_age"] = 26   # one year of investing is not enough to win
    with pytest.raises(ValueError, match="story does not hold"):
        build(script)


def test_nice_axis() -> None:
    assert nice_axis(2.3e7) == [0, 5e6, 1e7, 1.5e7, 2e7, 2.5e7]
    assert nice_axis(9.49e6)[-1] == 1e7


def test_frames_are_deterministic_and_seeded(script: dict) -> None:
    a, b = build(script).frame(47.5), build(script).frame(47.5)
    assert a.tobytes() == b.tobytes()
    script["seed"] = 4
    assert build(script).frame(47.5).tobytes() != a.tobytes()


def test_fit_shrinks_wide_text() -> None:
    s = "A very long line that cannot possibly fit on screen at this size"
    size = fit(s, 110, "Bold", SAFE_W)
    assert size < 110
    assert font(size, "Bold").getlength(s) <= SAFE_W
    assert fit("Short", 110, "Bold", SAFE_W) == 110
    assert font(44, "Regular").getlength(DISCLAIMER) <= SAFE_W
