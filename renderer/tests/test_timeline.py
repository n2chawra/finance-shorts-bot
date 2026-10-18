"""Story maths and the timeline builder (renderer/models, renderer/timeline): the hand-off to
Remotion. Built in estimate mode, so no voice model is needed."""
import json
from pathlib import Path

import numpy as np
import pytest

from renderer.engine import voice
from renderer.models import maths
from renderer.timeline import build as tb

EXAMPLES = Path(__file__).resolve().parents[2] / "examples"
CARD = {"name": "card", "kind": "card_min_due", "amount": 60000, "rate_pct_month": 3.5, "min_due_pct": 5, "min_due_floor": 200}


def script(beats: list[dict], **extra) -> dict:
    return {"format": "long", "seed": 7, "maths": [CARD], "beats": beats, **extra}


def test_card_min_due_pays_off_slowly() -> None:
    r = maths.compute([CARD])["card"]
    v, f = r["values"], r["figures"]
    assert v["months"] == 194 and f["years"] == "16"
    assert f["amount"] == "₹60,000" and f["min_due"] == "₹3,000"
    assert f["rate_year"] == "42%" and f["ratio"] == "2.9×"
    assert v["total_paid"] == pytest.approx(v["amount"] + v["interest"], rel=1e-9)
    assert v["paid_year1"] + v["owed_year1"] > v["amount"]          # a year of paying and still owing most of it
    assert len(r["series"]["balance"]["y"]) == 195 and r["series"]["balance"]["y"][0] == 60000


def test_card_min_due_that_never_ends_is_rejected() -> None:
    with pytest.raises(ValueError, match="never pays"):
        maths.compute([{**CARD, "min_due_pct": 1, "min_due_floor": 0}])


def test_maths_needs_its_inputs_and_unique_names() -> None:
    with pytest.raises(ValueError, match="needs min_due_floor"):
        maths.compute([{k: v for k, v in CARD.items() if k != "min_due_floor"}])
    with pytest.raises(ValueError, match="used twice"):
        maths.compute([CARD, CARD])


def test_placeholder_names_may_hold_digits_but_text_may_not(tmp_path: Path) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "He paid {card_paid_year1}.", "params": {"t": "{card_owed_year1}"}}
    t = tb.build(script([beat]), tmp_path, voice="estimate")
    assert t["beats"][0]["params"]["t"].startswith("₹")
    for bad in ({**beat, "say": "He paid 5 lakh."}, {**beat, "params": {"t": "₹500"}}):
        with pytest.raises(ValueError, match="typed number"):
            tb.build(script([bad]), tmp_path, voice="estimate")
    assert voice.fill_lines({"x": "{card_paid_year1}"}, ["x"], {"card_paid_year1": "₹32,862"})["x"] == "thirty two thousand eight hundred sixty two rupees"


def test_experiment_variants_travel_in_the_timeline(tmp_path: Path) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "It costs {card_amount}."}
    assert tb.build(script([beat], experiments={"bold-hook": "on"}), tmp_path, voice="estimate")["experiments"] == {"bold-hook": "on"}
    assert tb.build(script([beat]), tmp_path, voice="estimate")["experiments"] == {}


def test_beats_follow_their_words(tmp_path: Path) -> None:
    beats = [
        {"id": "a", "scene": "bignumber", "say": "It costs {card_amount} today.", "events": {"cost": {"word": "costs"}},
         "sfx": [{"kind": "pop", "at": "cost"}], "params": {"series": "@card.balance", "v": "@card.total_paid"}},
        {"id": "b", "scene": "chapter", "params": {"title": "Part one"}},
    ]
    t = tb.build(script(beats, tempo=1), tmp_path, voice="estimate")
    a, b = t["beats"]
    assert a["from"] == 0 and b["from"] == a["frames"]
    assert a["events"]["speech"] == round(tb.LEAD * tb.FPS) < a["events"]["cost"] < a["frames"]
    assert b["frames"] == round(tb.GAP_NO_VOICE * tb.FPS) and b["voice"] is None
    assert a["params"]["series"]["y"][0] == 60000 and a["params"]["v"] > 60000
    assert a["say"] == "It costs ₹60,000 today."
    assert t["durationInFrames"] >= a["frames"] + b["frames"]
    assert (tmp_path / "audio.wav").stat().st_size > 0
    assert json.loads((tmp_path / "timeline.json").read_text(encoding="utf-8"))["disclaimer"] == tb.DISCLAIMER


@pytest.mark.parametrize("change, error", [
    ({"events": {"x": {"word": "nowhere"}}}, "no word 'nowhere'"),
    ({"sfx": [{"kind": "kazoo", "at": "start"}]}, "sfx kind"),
    ({"params": {"s": "@loan.balance"}}, "no maths named 'loan'"),
    ({"params": {"s": "@card.nothing"}}, "no value or series"),
    ({"say": "Costs {card_price}."}, "bad placeholder"),
])
def test_bad_beats_are_rejected(tmp_path: Path, change: dict, error: str) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "It costs {card_amount}.", **change}
    with pytest.raises(ValueError, match=error):
        tb.build(script([beat]), tmp_path, voice="estimate")


def test_beat_ids_are_unique(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="unique"):
        tb.build(script([{"id": "a", "scene": "x"}, {"id": "a", "scene": "y"}]), tmp_path, voice="estimate")


def test_smooth_is_a_centred_moving_average() -> None:
    x = np.zeros(200)
    x[80:120] = 1.0
    k = 5
    padded = np.pad(x, k, mode="edge")
    expected = np.array([padded[i:i + 2*k + 1].mean() for i in range(len(x))])
    assert np.allclose(tb._smooth(x, k), expected)


def test_long_videos_play_at_their_tempo(tmp_path: Path) -> None:
    beats = [{"id": "a", "scene": "bignumber", "say": "It costs {card_amount} today, every single month.",
              "events": {"later": {"sec": 3}}, "min_sec": 0},
             {"id": "b", "scene": "chapter"}]
    slow = tb.build(script(beats, tempo=1), tmp_path / "slow", voice="estimate")
    fast = tb.build(script(beats), tmp_path / "fast", voice="estimate")
    assert fast["tempo"] == tb.TEMPOS["long"] == 1.5 and fast["speed"] == 1.5 and slow["speed"] == 1.0
    for s, f in zip(slow["beats"], fast["beats"]):
        assert f["frames"] == pytest.approx(s["frames"] / 1.5, abs=1)       # voice, pauses, chapter cards
    assert fast["beats"][0]["events"]["later"] == round(3 / 1.5 * tb.FPS)   # story seconds -> real
    assert fast["beats"][0]["voice"]["words"][-1]["e"] == pytest.approx(slow["beats"][0]["voice"]["words"][-1]["e"] / 1.5, rel=0.02)


def test_long_story_example_builds(tmp_path: Path) -> None:
    s = json.loads((EXAMPLES / "long_story.json").read_text(encoding="utf-8"))
    t = tb.build(s, tmp_path, voice="estimate")
    # the first sample was written for the old pace: 4 min at tempo 1, about 2:45 at 1.5
    assert 150 <= t["durationInFrames"]/tb.FPS <= 900
    assert {b["scene"] for b in t["beats"]} >= {"stage", "chapter", "chart", "end"}
    assert t["beats"][-1]["scene"] == "end"


def test_captions_show_figures_as_written(tmp_path: Path) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "Total due, {card_amount}. Minimum due, just {card_min_due}."}
    t = tb.build(script([beat], format="short"), tmp_path, voice="estimate")
    caps = t["beats"][0]["voice"]["captions"]
    assert [c["t"] for c in caps] == ["Total", "due,", "₹60,000.", "Minimum", "due,", "just", "₹3,000."]
    words = t["beats"][0]["voice"]["words"]
    assert caps[2]["s"] == words[2]["s"] and caps[2]["e"] == words[4]["e"]      # "sixty thousand rupees"
    assert t["width"] == 1080 and t["tempo"] == tb.TEMPOS["short"]


def test_short_story_example_passes_the_checks() -> None:
    from generator import numbers
    s = json.loads((EXAMPLES / "short_story.json").read_text(encoding="utf-8"))
    passed, notes = numbers.number_check(s)
    assert passed, notes


@pytest.mark.parametrize("side, error", [
    ({"label": "Paid", "text": "{card_amount}", "value": "@card.total_paid"}, "counts to .* but lands on '₹60,000'"),
    ({"label": "Paid", "text": "A lot", "value": "@card.total_paid"}, "lands on 'A lot'"),
    ({"label": "Paid", "text": "{card_total_paid}", "value": 163700}, "typed number"),
])
def test_a_counter_lands_on_its_own_figure(side: dict, error: str) -> None:
    """One quantity, one string: a count-up that counts to one number and lands on another shows
    two figures for one amount (research proposal same-figure-same-text, 2026-10-18)."""
    ok = {"label": "Owed", "text": "{card_owed_year1}", "value": "@card.owed_year1"}
    beats = [{"id": "a", "scene": "split", "params": {"left": side, "right": ok}}, {"id": "z", "scene": "end"}]
    with pytest.raises(ValueError, match=error):
        tb.check_script(script(beats))


def test_counters_on_their_own_figure_pass() -> None:
    items = [{"label": "Minimum due", "text": "{card_interest}", "value": "@card.interest"},
             {"label": "Pay in full", "text": "Nothing", "value": 0},
             {"label": "Months", "text": "{card_months} months", "value": "@card.months"},
             {"label": "First due", "text": "just {card_min_due}", "value": "@card.first_min_due"}]
    tb.check_script(script([{"id": "a", "scene": "towers", "params": {"items": items}}, {"id": "z", "scene": "end"}]))
