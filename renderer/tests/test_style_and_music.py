import numpy as np
import pytest

from renderer.engine.finance import lumpsum_at, lumpsum_series, sip_series
from renderer.engine.music import BED_RMS, BPM_RANGE, GENRES, make_bed
from renderer.engine.style import PALETTES, resolve_style


def test_style_is_deterministic_and_varies_with_seed() -> None:
    assert resolve_style({}, 5) == resolve_style({}, 5)
    styles = [resolve_style({}, s) for s in range(40)]
    assert {s.palette.name for s in styles} == set(PALETTES)
    assert {s.genre for s in styles} == set(GENRES)
    assert len({s.key for s in styles}) >= 8
    assert all(80 <= s.bpm <= 120 for s in styles)
    assert all(BPM_RANGE[s.genre][0] <= s.bpm <= BPM_RANGE[s.genre][1] for s in styles)


def test_pinned_fields_win_and_do_not_shift_the_rest() -> None:
    free = resolve_style({}, 9)
    pinned = resolve_style({"palette": "paper", "bpm": 100}, 9)
    assert pinned.palette.name == "paper" and pinned.bpm == 100
    assert (pinned.genre, pinned.key, pinned.looks) == (free.genre, free.key, free.looks)


@pytest.mark.parametrize("bad", [{"palette": "neon"}, {"genre": "jazz"}, {"key": "H"}, {"bpm": 140}])
def test_bad_style_values_are_rejected(bad: dict) -> None:
    with pytest.raises(ValueError, match="style"):
        resolve_style(bad, 1)


@pytest.mark.parametrize("genre", GENRES)
def test_bed_is_clean_and_at_target_loudness(genre: str) -> None:
    bed = make_bed(np.random.default_rng(1), 20, genre, "D", BPM_RANGE[genre][0])
    assert np.isfinite(bed).all()
    assert np.sqrt(np.mean(bed**2)) == pytest.approx(BED_RMS)
    assert (bed == make_bed(np.random.default_rng(1), 20, genre, "D", BPM_RANGE[genre][0])).all()


def test_beds_differ_by_genre_key_and_tempo() -> None:
    def bed(genre: str = "pop", key: str = "D", bpm: int = 110) -> np.ndarray:
        return make_bed(np.random.default_rng(1), 10, genre, key, bpm)
    base = bed()
    for other in (bed(genre="synthwave"), bed(key="G"), bed(bpm=118)):
        assert not np.allclose(base, other)


def test_finance() -> None:
    r, n = 0.01, 240
    assert sip_series(10000, 12, n)[-1] == pytest.approx(10000*((1 + r)**n - 1)/r*(1 + r))
    assert lumpsum_series(100000, 6, 15)[-1] == pytest.approx(100000*1.06**15)
    assert lumpsum_at(100000, 6, 15) == pytest.approx(lumpsum_series(100000, 6, 15)[-1])
    assert lumpsum_series(100000, 6, 15)[0] == 100000
