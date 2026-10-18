"""The render gates: layout from the probe's text boxes, and liveliness."""
from renderer.gates import layout_problems, liveliness_problems


def box(t: str, x: int = 100, y: int = 300, w: int = 400, h: int = 60, fs: float = 60) -> dict:
    return {"t": t, "x": x, "y": y, "w": w, "h": h, "fs": fs}


def test_clean_frame_passes() -> None:
    assert layout_problems([{"frame": 30, "items": [box("₹60,000")]}], "short", 1080, 1920) == []


def test_small_text_fails_by_format() -> None:
    probes = [{"frame": 30, "items": [box("Due this month", fs=38)]}]
    [p] = layout_problems(probes, "short", 1080, 1920)
    assert "'Due this month' at 1.0 s is 38 px, below the 44 px minimum" == p.replace("text ", "", 1)
    assert layout_problems(probes, "long", 1920, 1080) == []          # 38 px is fine at 1920×1080


def test_bottom_zone_and_frame_edges() -> None:
    probes = [{"frame": 0, "items": [box("Follow", y=1760, h=80), box("Still owed", x=1000, w=200)]}]
    problems = layout_problems(probes, "short", 1080, 1920)
    assert any("'Follow'" in p and "bottom 120 px" in p for p in problems)
    assert any("'Still owed'" in p and "outside the frame" in p for p in problems)


def test_a_problem_is_reported_once() -> None:
    probes = [{"frame": f, "items": [box("tiny", fs=20)]} for f in (0, 30, 60)]
    assert len(layout_problems(probes, "short", 1080, 1920)) == 1


def test_liveliness_thresholds() -> None:
    assert liveliness_problems({"median": 1.36, "still_share": 0.066, "longest_still_sec": 4.0}) == []
    problems = liveliness_problems({"median": 0.02, "still_share": 0.82, "longest_still_sec": 40})
    assert len(problems) == 3


def test_a_thumbnail_must_match_its_format(tmp_path) -> None:
    import pytest
    from PIL import Image
    from renderer.remotion import check_thumbnail
    Image.new("RGB", (1080, 1920)).save(tmp_path/"short.png")
    Image.new("RGB", (1280, 720)).save(tmp_path/"long.png")
    check_thumbnail(tmp_path/"short.png", "short")
    check_thumbnail(tmp_path/"long.png", "long")
    with pytest.raises(RuntimeError, match="must be 1080x1920"):
        check_thumbnail(tmp_path/"long.png", "short")   # 2026-10-18: Shorts got landscape thumbnails
