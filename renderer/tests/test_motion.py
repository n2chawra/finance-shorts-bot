"""The motion vocabulary. These are the curves every animated scene is built on, so the properties
that make them read correctly — where they start, where they end, how far they overshoot — are
worth pinning down rather than eyeballing in a render."""
import math

import pytest

from renderer.engine.motion import (
    EMPHASIZED,
    ENTER,
    EXIT,
    STANDARD,
    anticipate,
    arc,
    bezier,
    bounce,
    breathe,
    drop,
    jitter,
    loop,
    overshoot,
    pulse,
    spring,
    squash,
    stagger,
    sway,
)

CURVES = (ENTER, EXIT, STANDARD, EMPHASIZED)


@pytest.mark.parametrize("curve", CURVES)
def test_bezier_starts_at_zero_and_ends_at_one(curve) -> None:
    assert bezier(0.0, curve) == 0.0
    assert bezier(1.0, curve) == 1.0
    assert bezier(-5, curve) == 0.0 and bezier(5, curve) == 1.0


@pytest.mark.parametrize("curve", CURVES)
def test_bezier_never_leaves_the_unit_range_or_goes_backwards(curve) -> None:
    prev = 0.0
    for i in range(101):
        v = bezier(i/100, curve)
        assert -0.001 <= v <= 1.001
        assert v >= prev - 1e-6, f"{curve} goes backwards at {i/100}"
        prev = v


def test_enter_decelerates_and_exit_accelerates() -> None:
    """The one rule that matters: things arriving brake, things leaving speed up. If these two
    were ever the same curve, every entrance in the video would feel mechanical."""
    assert bezier(0.25, ENTER) > 0.5          # most of the distance covered early, then slows
    assert bezier(0.25, EXIT) < 0.15          # barely moved, then gone


# Overshoot for a damped second-order system is exp(-zeta*pi/sqrt(1-zeta^2)).
@pytest.mark.parametrize("zeta", [0.4, 0.5, 0.7, 0.85])
def test_spring_overshoot_matches_the_damping_ratio(zeta: float) -> None:
    peak = max(spring(i/2000, zeta) for i in range(2001))
    expected = 1 + math.exp(-zeta*math.pi/math.sqrt(1 - zeta*zeta))
    assert peak == pytest.approx(expected, abs=0.02)


@pytest.mark.parametrize("zeta", [0.4, 0.5, 0.7, 0.85])
def test_spring_starts_at_zero_and_has_settled_by_one(zeta: float) -> None:
    assert spring(0.0, zeta) == 0.0
    assert spring(1.0, zeta) == 1.0
    # the design target is settled to within ~1% at t = 1; a little earlier it is still
    # finishing its last swing, which is the point of a spring
    assert spring(0.95, zeta) == pytest.approx(1.0, abs=0.03)


def test_bounce_lands_and_settles() -> None:
    assert bounce(0.0) == 0.0
    assert bounce(1.0) == pytest.approx(1.0, abs=1e-6)
    assert all(bounce(i/200) <= 1.0001 for i in range(201))    # never passes the floor


def test_anticipate_pulls_back_before_moving() -> None:
    assert min(anticipate(i/100) for i in range(31)) < -0.05
    assert anticipate(1.0) == pytest.approx(1.0, abs=1e-6)


def test_overshoot_passes_one_and_returns() -> None:
    assert max(overshoot(i/100) for i in range(101)) > 1.05
    assert overshoot(1.0) == pytest.approx(1.0, abs=1e-6)


def test_arc_bows_away_from_the_straight_line() -> None:
    x, y = arc(0.5, 0, 500, 400, 500, lift=140)
    assert x == pytest.approx(200, abs=40)
    assert y < 500 - 100, "an arc with lift must rise above the straight path"
    assert arc(0.0, 0, 500, 400, 500)[0] == pytest.approx(0)
    assert arc(1.0, 0, 500, 400, 500)[0] == pytest.approx(400)


def test_drop_lands_on_the_floor_and_squashes_on_impact() -> None:
    y, _ = drop(0.0, 100, 900)
    assert y == pytest.approx(100)
    y, _ = drop(1.0, 100, 900)
    assert y == pytest.approx(900, abs=1)
    assert max(drop(i/200, 100, 900)[1] for i in range(201)) > 0.1


def test_stagger_offsets_each_item() -> None:
    assert stagger(0, 0.3, gap=0.12, dur=0.5) > stagger(1, 0.3, gap=0.12, dur=0.5)
    assert stagger(3, 0.1, gap=0.12, dur=0.5) == 0.0
    assert stagger(0, 9.0, gap=0.12, dur=0.5) == 1.0


def test_squash_preserves_volume() -> None:
    for amount in (-0.3, 0.0, 0.25, 0.5):
        sx, sy = squash(amount)
        assert sx*sy == pytest.approx(1.0)


@pytest.mark.parametrize("fn, bound", [(breathe, 1.0), (sway, 1.0), (jitter, 1.5)])
def test_idle_motions_stay_within_their_amplitude(fn, bound: float) -> None:
    vals = [fn(i/50) for i in range(500)]
    assert max(abs(v) for v in vals) <= bound + 1e-6
    assert max(vals) > bound*0.5 and min(vals) < -bound*0.5, "an idle motion that never moves"


def test_pulse_throbs_around_one() -> None:
    vals = [pulse(i/50) for i in range(500)]
    assert min(vals) == pytest.approx(0.92, abs=0.01)
    assert max(vals) == pytest.approx(1.08, abs=0.01)


def test_loop_wraps() -> None:
    assert loop(0.0, 2.0) == 0.0
    assert loop(1.0, 2.0) == pytest.approx(0.5)
    assert loop(2.0, 2.0) == pytest.approx(0.0)
    assert all(0 <= loop(i/7, 1.5, 0.3) < 1 for i in range(200))
