"""The music choices the variety rules rotate through. Kept apart from music.py so the planner,
the variety rules and the evaluator can read them without numpy."""

KEYS: tuple[str, ...] = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
GENRES: tuple[str, ...] = ("lofi", "pop", "cinematic", "synthwave", "acoustic")
BPM_RANGE: dict[str, tuple[int, int]] = {"lofi": (80, 96), "pop": (104, 120), "cinematic": (80, 100),
                                         "synthwave": (96, 116), "acoustic": (88, 110)}

# Beds made for one channel's own sound (channel.json → sound.genres), never offered to channel #1's
# rotation: the geography channel's light map-explainer bed (measured on its references, 2026-11-18:
# bright, almost no bass, ~30 dB under the voice). The half-time feel is counted in BPM.
# The tech channel's dark ambient-electronic beds (its references, 2026-11-18: ~24 dB under the voice,
# 350-460 Hz): `circuit` a half-time pulse (felt 140-150), `datahall` a slow drone for long chapters.
# The business-documentary channel's dark, slow low-mid beds (its references, 2026-11-19: KFC 76 BPM,
# Labubu 723 Hz with 8% bass, the Marvel Short ~78 BPM): `ledger` for long videos (a pad and a soft
# pulse, ~32 dB under the voice), `dossier` for Shorts (a heavier low pulse, ~18 dB under).
CHANNEL_GENRES: dict[str, tuple[int, int]] = {"explorer": (72, 80), "atlas": (84, 96),
                                              "circuit": (70, 75), "datahall": (60, 66),
                                              "ledger": (74, 80), "dossier": (76, 84),
                                              "undertow": (52, 58), "brace": (66, 76),
                                              "tanpura": (100, 112), "monsoon": (92, 104)}
# The disasters channel's beds (its references, 2026-11-20, research/sound.md: Fault Lines' beatless
# bass drone, 334 Hz with 49% bass, ~33 dB under the voice; the others voice-only): `undertow` a beatless
# low drone that breathes (its BPM only paces the swells), `brace` a muted low pulse for reconstructions and Shorts.
# The India maps channel's beds (its references, 2026-11-24, research/sound.md: dark low cinematic beds, 327-388 Hz
# with 23-25% bass, ~110 BPM felt, no steady drums): `tanpura` for Shorts, a plucked drone of our own (fifth,
# octave, octave, low root a bar) over a dark pad, `monsoon` a tension variant with a low tabla-like thump.
ALL_BPM: dict[str, tuple[int, int]] = {**BPM_RANGE, **CHANNEL_GENRES}

