"""The jointed character rig.

The thing these tests protect is the difference between a character and a sprite: feet that keep
up with the ground, a hand that lands where a scene aims it, and a pose that still reads when the
actor turns around.
"""
import math

import numpy as np
import pytest
from PIL import Image

from renderer.engine.actor import (
    FOREARM,
    MOODS,
    POSES,
    STRIDE,
    UPPER_ARM,
    actor,
    gait_for,
    hand,
    head_top,
    height,
    reach,
)
from renderer.engine.canvas import LONG, NIGHT, Canvas

GROUND = 900.0


def canvas() -> tuple[Image.Image, Canvas]:
    im = Image.new("RGB", LONG.size, NIGHT.bg)
    return im, Canvas(im, NIGHT, None, LONG)


def ink(im: Image.Image) -> int:
    """Pixels that are not the background — how much of the actor actually got drawn."""
    return int((np.asarray(im) != np.array(NIGHT.bg, dtype=np.uint8)).any(axis=2).sum())


@pytest.mark.parametrize("pose", POSES)
@pytest.mark.parametrize("facing", [1, -1])
def test_every_pose_draws_something_substantial(pose: str, facing: int) -> None:
    im, c = canvas()
    actor(c, 960, GROUND, 1.3, NIGHT.cast[0], t=0.4, pose=pose, facing=facing)
    assert ink(im) > 20_000, f"{pose} facing {facing} barely drew anything"


@pytest.mark.parametrize("mood", MOODS)
def test_every_mood_draws_a_different_face(mood: str) -> None:
    im, c = canvas()
    actor(c, 960, GROUND, 1.3, NIGHT.cast[0], t=0.4, mood=mood)
    others = []
    for other in MOODS:
        im2, c2 = canvas()
        actor(c2, 960, GROUND, 1.3, NIGHT.cast[0], t=0.4, mood=other)
        others.append(im2.tobytes())
    assert sum(b == im.tobytes() for b in others) == 1, f"{mood} looks like another mood"


def test_facing_mirrors_the_whole_body() -> None:
    """A pose that only mirrors the arms reads as a character with a twisted spine."""
    im_r, c = canvas()
    actor(c, 960, GROUND, 1.3, NIGHT.cast[0], t=0.0, pose="point", facing=1)
    im_l, c = canvas()
    actor(c, 960, GROUND, 1.3, NIGHT.cast[0], t=0.0, pose="point", facing=-1)
    flipped = im_l.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    a = np.asarray(im_r.convert("L"), dtype=np.int16)
    b = np.asarray(flipped.convert("L"), dtype=np.int16)
    diff = float(np.abs(a - b).mean())
    assert diff < 6, f"facing -1 is not the mirror of facing 1 (mean difference {diff:.1f})"


@pytest.mark.parametrize("target", [(110.0, -30.0), (-30.0, -26.0), (70.0, 40.0), (20.0, -100.0)])
def test_reach_puts_the_hand_on_its_target(target: tuple[float, float]) -> None:
    ox, oy = target
    a1, a2 = reach(ox, oy, UPPER_ARM, FOREARM)
    ex, ey = math.cos(a1)*UPPER_ARM, math.sin(a1)*UPPER_ARM
    hx, hy = ex + math.cos(a2)*FOREARM, ey + math.sin(a2)*FOREARM
    assert (hx, hy) == pytest.approx((ox, oy), abs=0.5)


def test_reach_pulls_unreachable_targets_in_rather_than_failing() -> None:
    """A scene may aim at something across the stage; the arm should stretch towards it, not
    raise, so the gesture still points the right way."""
    a1, a2 = reach(900.0, 0.0, UPPER_ARM, FOREARM)
    ex, ey = math.cos(a1)*UPPER_ARM, math.sin(a1)*UPPER_ARM
    hx, hy = ex + math.cos(a2)*FOREARM, ey + math.sin(a2)*FOREARM
    assert hx == pytest.approx(UPPER_ARM + FOREARM, rel=0.01)
    assert hy == pytest.approx(0.0, abs=1.0)


def test_one_stride_is_exactly_one_walk_cycle() -> None:
    """Feet that do not match the ground look like the character is on a treadmill. The gait is
    driven by distance for exactly this reason, so a stride has to close the loop."""
    assert gait_for(STRIDE, 1.0) == pytest.approx(1.0)
    assert gait_for(STRIDE*0.75, 0.75) == pytest.approx(1.0)
    im_a, c = canvas()
    actor(c, 400, GROUND, 1.0, NIGHT.cast[0], t=0.0, pose="walk", gait=0.0)
    im_b, c = canvas()
    actor(c, 400 + STRIDE, GROUND, 1.0, NIGHT.cast[0], t=0.0, pose="walk",
          gait=gait_for(STRIDE, 1.0))
    shifted = Image.new("RGB", LONG.size, NIGHT.bg)
    shifted.paste(im_a.crop((0, 0, LONG.w - int(STRIDE), LONG.h)), (int(STRIDE), 0))
    diff = int((np.asarray(shifted) != np.asarray(im_b)).any(axis=2).sum())
    assert diff < 400, f"the pose after one stride is not the pose it started in ({diff} px)"


def test_hand_reports_where_the_arm_actually_is() -> None:
    """Scenes hang props off `hand()`; if it disagreed with the drawing, a carried bag would
    float next to an empty fist."""
    marks = []

    def mark(c, hx, hy, s, a):
        marks.append((hx, hy))

    for pose in POSES:
        marks.clear()
        _, c = canvas()
        actor(c, 700, GROUND, 1.2, NIGHT.cast[0], t=0.7, pose=pose, holding=mark)
        assert marks, pose
        assert marks[0] == pytest.approx(hand(700, GROUND, 1.2, pose, 0.7), abs=0.5)


def test_nothing_is_drawn_above_the_reported_head_top() -> None:
    """`head_top` is what scenes use to keep a label or a counter clear of the actor."""
    im, c = canvas()
    actor(c, 960, GROUND, 1.4, NIGHT.cast[0], t=0.4, pose="stand")
    top = head_top(GROUND, 1.4)
    band = im.crop((0, 0, LONG.w, int(top) - 2))
    assert ink(band) == 0, "the actor pokes out above head_top"
    assert height(1.4) == pytest.approx(GROUND - top)


def test_the_actor_stands_on_the_ground_line() -> None:
    im, c = canvas()
    actor(c, 960, GROUND, 1.2, NIGHT.cast[0], t=0.0, pose="stand")
    below = im.crop((0, int(GROUND) + 30, LONG.w, LONG.h))
    assert ink(below) == 0, "feet hang below the ground line"
    feet = im.crop((0, int(GROUND) - 20, LONG.w, int(GROUND) + 12))
    assert ink(feet) > 400, "no feet near the ground line"


def test_an_idle_actor_is_never_completely_still() -> None:
    """Every scene leans on this: a held pose still breathes, so no frame is a copy of the one
    before it. See Video.liveliness."""
    frames = []
    for i in range(14):
        im, c = canvas()
        actor(c, 960, GROUND, 1.3, NIGHT.cast[0], t=i*0.3, pose="stand")
        frames.append(im.tobytes())
    assert len(set(frames)) >= 10, "a standing actor is frozen"
