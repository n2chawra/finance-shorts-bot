"""Per-video style: palette and music settings (the cast is drawn by Remotion, remotion/src/cast).

A script may pin any of these in its `style` block. Whatever it leaves out is picked from the
seed, so two seeds give two different-looking and different-sounding videos.
"""
import random
from dataclasses import dataclass

from .music import BPM_RANGE, GENRES, KEYS

RGB = tuple[int, int, int]


@dataclass(frozen=True)
class Palette:
    name: str
    bg: RGB          # top of the background gradient
    bg_bottom: RGB   # bottom of the background gradient
    text: RGB
    muted: RGB
    accent: RGB
    danger: RGB
    panel: RGB       # card fill
    grid: RGB        # chart grid lines
    haze: RGB
    cast: tuple[RGB, RGB, RGB]   # series colours


NIGHT = Palette("night", bg=(14, 17, 34), bg_bottom=(24, 23, 56), text=(245, 246, 250), muted=(150, 156, 180),
                accent=(255, 209, 102), danger=(255, 90, 95), panel=(32, 37, 68), grid=(50, 56, 92),
                haze=(20, 22, 45), cast=((61, 220, 151), (255, 159, 67), (120, 160, 255)))

PALETTES: dict[str, Palette] = {p.name: p for p in (
    NIGHT,
    Palette("forest", bg=(10, 31, 26), bg_bottom=(16, 52, 44), text=(240, 247, 240), muted=(150, 178, 165),
            accent=(255, 214, 92), danger=(255, 107, 107), panel=(24, 60, 50), grid=(40, 84, 72),
            haze=(14, 42, 36), cast=((94, 234, 212), (251, 146, 60), (196, 181, 253))),
    Palette("plum", bg=(33, 14, 43), bg_bottom=(58, 22, 66), text=(250, 243, 250), muted=(186, 160, 196),
            accent=(255, 200, 87), danger=(255, 99, 120), panel=(62, 32, 78), grid=(88, 52, 104),
            haze=(44, 18, 54), cast=((64, 224, 208), (255, 138, 101), (140, 190, 255))),
    Palette("ocean", bg=(8, 28, 54), bg_bottom=(10, 52, 88), text=(240, 248, 255), muted=(148, 176, 205),
            accent=(255, 221, 89), danger=(255, 111, 97), panel=(20, 56, 96), grid=(40, 82, 128),
            haze=(10, 40, 72), cast=((72, 219, 251), (255, 159, 128), (186, 230, 126))),
    Palette("ember", bg=(36, 16, 12), bg_bottom=(64, 24, 18), text=(255, 244, 236), muted=(200, 168, 154),
            accent=(255, 196, 61), danger=(255, 92, 92), panel=(70, 34, 26), grid=(100, 56, 44),
            haze=(48, 20, 14), cast=((110, 220, 170), (120, 180, 255), (255, 150, 200))),
    Palette("paper", bg=(250, 244, 232), bg_bottom=(243, 229, 206), text=(34, 34, 48), muted=(110, 104, 96),
            accent=(200, 80, 20), danger=(200, 40, 50), panel=(236, 222, 196), grid=(214, 198, 170),
            haze=(246, 236, 219), cast=((20, 150, 110), (70, 100, 200), (160, 70, 160))),
    # bright daytime palettes (2026-10-18): the top animated finance channels are bright and warm
    Palette("sky", bg=(214, 236, 251), bg_bottom=(178, 215, 243), text=(20, 32, 56), muted=(70, 94, 128),
            accent=(226, 104, 12), danger=(208, 42, 60), panel=(255, 255, 255), grid=(160, 196, 226),
            haze=(200, 228, 249), cast=((14, 146, 104), (38, 92, 210), (170, 60, 164))),
    Palette("mint", bg=(224, 246, 233), bg_bottom=(192, 232, 210), text=(18, 44, 36), muted=(64, 104, 88),
            accent=(208, 92, 0), danger=(204, 40, 58), panel=(255, 255, 255), grid=(160, 206, 182),
            haze=(212, 240, 224), cast=((0, 136, 98), (44, 98, 208), (168, 56, 148))),
)}


@dataclass(frozen=True)
class Style:
    palette: Palette
    genre: str
    key: str
    bpm: int


def resolve_style(spec: dict, seed: int) -> Style:
    """Fill in whatever `spec` leaves out, deterministically from the seed."""
    r = random.Random(f"style:{seed}")
    # always draw everything in the same order so pinning one field doesn't change the others
    palette = r.choice(sorted(PALETTES))
    genre = r.choice(GENRES)
    key = r.choice(KEYS)
    bpm_roll = r.random()

    palette = spec.get("palette", palette)
    genre = spec.get("genre", genre)
    key = spec.get("key", key)
    if palette not in PALETTES:
        raise ValueError(f"style.palette must be one of {', '.join(sorted(PALETTES))}")
    if genre not in GENRES:
        raise ValueError(f"style.genre must be one of {', '.join(GENRES)}")
    if key not in KEYS:
        raise ValueError(f"style.key must be one of {', '.join(KEYS)}")
    lo, hi = BPM_RANGE[genre]
    bpm = spec.get("bpm", round(lo + (hi - lo)*bpm_roll))
    if not 80 <= bpm <= 120:
        raise ValueError("style.bpm must be between 80 and 120")
    return Style(PALETTES[palette], genre, key, bpm)
