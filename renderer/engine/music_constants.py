"""The music choices the variety rules rotate through. Kept apart from music.py so the planner,
the variety rules and the evaluator can read them without numpy."""

KEYS: tuple[str, ...] = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
GENRES: tuple[str, ...] = ("lofi", "pop", "cinematic", "synthwave", "acoustic")
BPM_RANGE: dict[str, tuple[int, int]] = {"lofi": (80, 96), "pop": (104, 120), "cinematic": (80, 100),
                                         "synthwave": (96, 116), "acoustic": (88, 110)}

# Beds made for one channel's own sound (channel.json → sound.genres), never offered to channel #1's
# rotation: the geography channel's light map-explainer bed (measured on its references, 2026-11-18:
# bright, almost no bass, ~30 dB under the voice). The half-time feel is counted in BPM.
CHANNEL_GENRES: dict[str, tuple[int, int]] = {"explorer": (72, 80), "atlas": (84, 96)}
ALL_BPM: dict[str, tuple[int, int]] = {**BPM_RANGE, **CHANNEL_GENRES}

