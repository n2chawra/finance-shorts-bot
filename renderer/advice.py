"""Notes: checks that advise but never fail a video (owner review, 2026-11-11).

By November a Short had to pass about 160 coded checks; 27% of all steps failed, a video took 25-36
steps, and one took eight rewrites for 0.3 s. The checks that protect the channel still fail a video:
numbers, facts, layout, length, the disclaimer, liveliness, uniqueness. A style check now returns a
note: the writer sees it once and may act on it, and the run moves on.
"""
NOTE = "note: "


def note(msg: str) -> str:
    return NOTE + msg


def is_note(problem: str) -> bool:
    return problem.startswith(NOTE)


def split(problems: list[str]) -> tuple[list[str], list[str]]:
    """(the problems that fail the step, the notes)."""
    return [p for p in problems if not is_note(p)], [p for p in problems if is_note(p)]
