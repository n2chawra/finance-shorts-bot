"""The anti-slideshow guard.

The first long video was described by its owner as "a PPT with a voiceover", and that turned out
to be measurable: its median frame change was 0.02 against the Shorts' 1.5–2.3, and it was visually
frozen for 82% of its runtime. This pins the measurement down so the problem cannot come back
quietly.
"""
from pathlib import Path

import pytest
from PIL import Image

from renderer.cli import load
from renderer.engine.canvas import LONG, NIGHT, Canvas
from renderer.engine.video import LIVELY_MEDIAN, LIVELY_STILL_SEC, LIVELY_STILL_SHARE, Video

ROOT = Path(__file__).resolve().parents[2]


class Frozen(Video):
    """A video that draws the same picture forever — the failure mode, as a fixture."""
    frame_spec = LONG
    tempo = 1.0
    duration = 24.0

    def __init__(self) -> None:
        super().__init__({"seed": 1})
        self.scenes = [(0.0, 24.0, self._only)]

    def _only(self, c: Canvas, t: float, A: float) -> None:
        c.text("A fixed headline", c.w/2, 300, 70, c.pal.text, 1.0)

    def frame(self, T: float, log=None) -> Image.Image:
        im = Image.new("RGB", LONG.size, NIGHT.bg)
        c = Canvas(im, self.pal, log, self.frame_spec)
        self._only(c, T, 1.0)
        return im


def test_a_still_video_is_caught() -> None:
    v = Frozen()
    score = v.liveliness(every=2.0)
    assert score["median"] == pytest.approx(0.0, abs=0.001)
    assert score["still_share"] == 1.0
    assert score["longest_still_sec"] >= LIVELY_STILL_SEC
    problems = v.liveliness_problems(score)
    assert len(problems) == 3
    assert "slideshow" in " ".join(problems) or "still picture" in " ".join(problems)


def test_the_long_example_keeps_moving() -> None:
    """Sampled coarsely to keep the suite quick; the full render measures every two seconds."""
    v = load(ROOT / "examples" / "long_explainer.json")
    score = v.liveliness(every=6.0)
    assert score["median"] >= LIVELY_MEDIAN, f"the long example has gone still again: {score}"
    assert score["still_share"] <= LIVELY_STILL_SHARE, score
    assert not v.liveliness_problems(score), v.liveliness_problems(score)


@pytest.mark.parametrize("name", ["two_friends_race", "money_leak_meter"])
def test_the_shorts_set_the_bar(name: str) -> None:
    """These are where the thresholds came from. If a Short ever drops below the bar the long
    videos are held to, the bar is wrong, not the Short."""
    v = load(ROOT / "examples" / f"{name}.json")
    score = v.liveliness(every=2.0)
    assert score["median"] >= LIVELY_MEDIAN, f"{name} is below its own calibration: {score}"
