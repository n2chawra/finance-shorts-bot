"""The music choices the variety rules rotate through. Kept apart from music.py so the planner,
the variety rules and the evaluator can read them without numpy."""

KEYS: tuple[str, ...] = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
GENRES: tuple[str, ...] = ("lofi", "pop", "cinematic", "synthwave", "acoustic")
BPM_RANGE: dict[str, tuple[int, int]] = {"lofi": (80, 96), "pop": (104, 120), "cinematic": (80, 100),
                                         "synthwave": (96, 116), "acoustic": (88, 110)}
