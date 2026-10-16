"""Voiceover: spoken figures, line rules, windows and the mix. A fake synthesizer stands in for the
Kokoro model, so these run without it (one second of tone per 2.5 words, scaled by speed)."""
import json
from pathlib import Path

import numpy as np
import pytest

from renderer import cli
from renderer.engine import voice
from renderer.engine.audio import SR
from renderer.engine.video import TEMPO

EXAMPLES = Path(__file__).resolve().parents[2] / "examples"


def fake_synth(text: str, name: str, speed: float) -> np.ndarray:
    seconds = len(text.split())/2.5/speed
    return 0.5*np.sin(np.arange(int(seconds*SR))*0.05)


@pytest.fixture(autouse=True)
def no_model(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(voice, "_synth", fake_synth)


def quiz(lines: dict[str, str] | None = None, flag: str = "on"):
    script = json.loads((EXAMPLES / "quiz_countdown.json").read_text(encoding="utf-8"))
    script.pop("voice", None)
    if lines is not None:
        script["voice"] = lines
    return cli.build(script, {"voiceover": flag})


@pytest.mark.parametrize("display, said", [
    ("₹12.4 L", "twelve point four lakh rupees"), ("₹2.30 Cr", "two point three crore rupees"),
    ("₹6 Lakh", "six lakh rupees"), ("₹15,00,000", "fifteen lakh rupees"), ("₹10,000", "ten thousand rupees"),
    ("₹83,859", "eighty three thousand eight hundred fifty nine rupees"), ("₹99.9 L", "ninety nine point nine lakh rupees"),
    ("12%", "twelve percent"), ("2.4×", "two point four times"), ("20", "twenty"), ("Rahul", "Rahul"),
])
def test_figures_are_read_the_indian_way(display: str, said: str) -> None:
    assert voice.spoken(display) == said


def test_lines_get_spoken_figures() -> None:
    v = quiz({"hook": "Guess fast.", "reveal": "It's {letter}! {answer_long} from {amount} a month."})
    assert v.narration()["reveal"] == "It's C! ninety nine point nine lakh rupees from ten thousand rupees a month."


@pytest.mark.parametrize("n, said", [(0, "zero"), (7, "seven"), (45, "forty five"), (100, "one hundred"),
                                     (2_800, "two thousand eight hundred"), (33_600, "thirty three thousand six hundred"),
                                     (1_50_000, "one lakh fifty thousand"), (2_30_00_000, "two crore thirty lakh")])
def test_number_words(n: int, said: str) -> None:
    assert voice.number_words(n) == said


@pytest.mark.parametrize("lines, error", [
    ({"hook": "Only 5 people know this"}, "typed number"),
    ({"hook": "Save ₹ now"}, "typed number"),
    ({"intro": "Hello"}, "unknown scenes"),
    ({"hook": "Hi {nope}"}, "bad placeholder"),
    ({"hook": "x"*300}, "characters"),
])
def test_bad_lines_are_rejected_at_build(lines: dict, error: str) -> None:
    with pytest.raises(ValueError, match=error):
        quiz(lines)


def test_the_voiceover_group_needs_lines() -> None:
    with pytest.raises(ValueError, match="voiceover group"):
        quiz(None, "on")
    assert not quiz(None, "off").narrated
    assert not quiz({"hook": "Guess fast."}, "off").narrated


def test_windows_skip_the_countdown_and_the_pause_before_the_answer() -> None:
    w = quiz({"hook": "Guess fast."}).voice_windows()   # output seconds: story seconds / TEMPO
    assert w["options"] == pytest.approx((12.25/TEMPO, 15.8/TEMPO))   # countdown starts at story 16
    assert w["reveal"][0] == pytest.approx(23.1/TEMPO)                # answer lands at story 22.6


def test_narrated_mix_places_lines_and_ducks_music() -> None:
    plain = quiz({"hook": "Most people get this one wrong."}, "off").soundtrack()
    v = quiz({"hook": "Most people get this one wrong."})
    mixed = v.soundtrack()
    [p] = v.spoken
    assert p.scene == "hook" and p.start == pytest.approx(0.25/TEMPO) and p.speed == v.voice_speed
    i = int(1.0*SR)
    assert not np.allclose(mixed.left[i:i + 100], plain.left[i:i + 100])   # voice added, rest ducked
    tail = int(30*SR)
    assert np.allclose(mixed.left[tail:tail + 100], plain.left[tail:tail + 100])   # untouched where silent


def test_long_lines_speed_up_then_fail() -> None:
    v = quiz({"options": " ".join(["word"]*8)})   # 2.6 s window: 8 words need 3.2 s at 1.0, about 2.7 s at base speed
    v.soundtrack()
    assert 1.1 < v.spoken[0].speed <= voice.MAX_SPEED
    with pytest.raises(ValueError, match="shorten it"):
        quiz({"options": " ".join(["word"]*20)}).soundtrack()


def test_voice_and_speed_come_from_the_seed() -> None:
    assert voice.pick(20) == voice.pick(20)
    assert {voice.pick(s)[0] for s in range(40)} == set(voice.VOICES)
    assert all(voice.BASE_SPEED[0] <= voice.pick(s)[1] <= voice.BASE_SPEED[1] for s in range(40))


def test_examples_have_valid_voice_lines() -> None:
    for t in cli.template_names():
        v = cli.load(EXAMPLES / f"{t}.json", flags={"voiceover": "on"})
        assert v.narrated, t
        v.soundtrack()   # every example line fits its window
