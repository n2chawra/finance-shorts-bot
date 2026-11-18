import numpy as np
import pytest

from renderer.engine.finance import lumpsum_at, lumpsum_series, sip_series
from renderer.engine.audio import lp, sfx_glass, sfx_swell
from renderer.engine.music import BED_RMS, BPM_RANGE, GENRES, SR, make_bed
from renderer.engine.music_constants import CHANNEL_GENRES
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
    assert (pinned.genre, pinned.key) == (free.genre, free.key)


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


def test_cinematic_pulse_keeps_the_level_and_adds_a_beat() -> None:
    # cinematic-bed-gets-a-pulse (owner, 2026-10-31: "very dull, feels like a postmortem")
    plain = make_bed(np.random.default_rng(1), 20, "cinematic", "E", 94)
    pulse = make_bed(np.random.default_rng(1), 20, "cinematic", "E", 94, pulse=True)
    assert np.isfinite(pulse).all() and np.sqrt(np.mean(pulse**2)) == pytest.approx(BED_RMS)
    assert not np.allclose(plain, pulse)
    assert (pulse == make_bed(np.random.default_rng(1), 20, "cinematic", "E", 94, pulse=True)).all()
    # other genres ignore the flag
    assert (make_bed(np.random.default_rng(1), 10, "pop", "D", 110, pulse=True) == make_bed(np.random.default_rng(1), 10, "pop", "D", 110)).all()

    # the pulse: energy on every beat in the first two bars, where the plain bed only swells
    beat = int(SR*60/94)

    def onsets(bed: np.ndarray) -> float:
        env = np.abs(np.diff(bed[: 8*beat]))
        on = np.mean([env[q*beat: q*beat + 600].mean() for q in range(8)])
        return on/env.mean()
    assert onsets(pulse) > onsets(plain)


@pytest.mark.parametrize("genre", sorted(CHANNEL_GENRES))
def test_a_channels_own_bed_is_clean_and_at_target_loudness(genre: str) -> None:
    lo, hi = CHANNEL_GENRES[genre]
    bed = make_bed(np.random.default_rng(1), 12, genre, "D", lo)
    assert np.isfinite(bed).all() and np.sqrt(np.mean(bed**2)) == pytest.approx(BED_RMS)
    assert (bed == make_bed(np.random.default_rng(1), 12, genre, "D", lo)).all()
    resolve_style({"genre": genre, "bpm": hi}, 1)   # the style accepts its own tempo range


def _timbre(x: np.ndarray) -> tuple[float, float]:
    """Brightness and bass share as the yt-style probe reads them: 4096-point frames every 50 ms, the
    power-weighted centroid and the share below 150 Hz, medians over the frames."""
    n, hop = 4096, int(0.05*SR)
    f, w = np.fft.rfftfreq(n, 1/SR), np.hanning(n)
    rows = []
    for i in range(0, len(x) - n, hop):
        p = np.abs(np.fft.rfft(x[i:i + n]*w))**2
        rows.append(((f*p).sum()/p.sum(), p[f < 150].sum()/p.sum()))
    c, b = np.median(np.array(rows), axis=0)
    return float(c), float(b)


def _beat(x: np.ndarray, lo: int = 55, hi: int = 160) -> float:
    """The tempo the low end pulses at: autocorrelation of the onsets below 150 Hz (the probe's method)."""
    low = lp(x, 150)[: len(x)//256*256]
    e = np.log10((low**2).reshape(-1, 256).mean(1) + 1e-9)
    on = np.maximum(0, np.diff(e, prepend=e[0]))
    on -= on.mean()
    rate = SR/256

    def score(bpm: float) -> float:
        lag = 60*rate/bpm
        k, fr = int(lag), lag - int(lag)
        return float(np.sum(on[:-k - 1]*(on[k:-1]*(1 - fr) + on[k + 1:]*fr))/(len(on) - k))
    return max(np.arange(lo, hi + 0.5, 0.5), key=score)


@pytest.mark.parametrize("genre, felt", [("circuit", 2), ("datahall", 1)])
def test_the_tech_beds_are_dark_and_keep_their_tempo(genre: str, felt: int) -> None:
    """Measured on the tech channel's references (style-study/2026-11-18-references.md, Sound): dark,
    350-460 Hz, a bass share of 0.2-0.3; circuit a half-time 70-75 felt as 140-150, datahall 60-66."""
    lo, hi = CHANNEL_GENRES[genre]
    rows = [_timbre(make_bed(np.random.default_rng(i), 24, genre, key, (lo + hi)//2)) for i, key in enumerate(("C", "D#", "G", "A#"))]
    centroid, bass = np.median(np.array(rows), axis=0)
    assert 330 <= centroid <= 470 and 0.17 <= bass <= 0.32
    explorer = _timbre(make_bed(np.random.default_rng(0), 24, "explorer", "D#", 76))
    assert centroid < explorer[0] and bass > explorer[1]   # darker than the geography channel's bright bed
    bpm = 72 if genre == "circuit" else 63
    assert _beat(make_bed(np.random.default_rng(3), 30, genre, "C#", bpm)) == pytest.approx(bpm*felt, rel=0.02)


def test_the_machine_sounds_are_clean() -> None:
    swell, glass = sfx_swell(np.random.default_rng(1)), sfx_glass()
    for x in (swell, glass):
        assert np.isfinite(x).all() and 0.1 < np.max(np.abs(x)) < 1.0
    third = len(swell)//3
    assert np.abs(swell[-third:]).mean() > 4*np.abs(swell[:third]).mean()   # a swell rises into its reveal
    assert np.abs(glass[-len(glass)//4:]).max() < 0.1*np.abs(glass).max()   # a glass tone fades out


def test_finance() -> None:
    r, n = 0.01, 240
    assert sip_series(10000, 12, n)[-1] == pytest.approx(10000*((1 + r)**n - 1)/r*(1 + r))
    assert lumpsum_series(100000, 6, 15)[-1] == pytest.approx(100000*1.06**15)
    assert lumpsum_at(100000, 6, 15) == pytest.approx(lumpsum_series(100000, 6, 15)[-1])
    assert lumpsum_series(100000, 6, 15)[0] == 100000
