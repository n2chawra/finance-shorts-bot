"""Craft gates (renderer/craft.py): a templated-looking video fails, a full, changing one passes."""
from pathlib import Path

import numpy as np
from PIL import Image

from renderer import craft

REPO = Path(__file__).resolve().parents[2]


def flat(color=(230, 220, 200)) -> Image.Image:
    return Image.new("RGB", (540, 960), color)


def busy(seed: int) -> Image.Image:
    rng = np.random.default_rng(seed)
    return Image.fromarray(rng.integers(0, 255, (960, 540, 3), dtype=np.uint8))


def save(tmp: Path, imgs: list[Image.Image]) -> list[Path]:
    out = []
    for i, im in enumerate(imgs):
        p = tmp / f"f{i * 150:05d}.jpg"
        im.save(p)
        out.append(p)
    return out


def test_a_flat_still_is_empty_and_a_busy_one_is_not() -> None:
    assert craft.empty_share(flat()) > 0.95
    assert craft.empty_share(busy(1)) < 0.05


def test_mostly_empty_or_repeated_stills_fail(tmp_path: Path) -> None:
    assert any("mostly empty" in p for p in craft.frame_problems(save(tmp_path, [flat()] * 4 + [busy(i) for i in range(4)])))
    (tmp_path / "b").mkdir()
    same = craft.frame_problems(save(tmp_path / "b", [busy(7)] * 6))
    assert any("look the same" in p for p in same)
    (tmp_path / "c").mkdir()
    assert craft.frame_problems(save(tmp_path / "c", [busy(i) for i in range(8)])) == []


def tl(beats: list[dict], fmt: str = "short", seconds: float = 30) -> dict:
    return {"format": fmt, "fps": 30, "durationInFrames": int(seconds * 30), "beats": beats}


def shot(i: int, size: str, set_: str, sec: float) -> dict:
    return {"id": f"b{i}", "scene": "shot", "from": int(sec * 30), "params": {"set": set_, "camera": [{"size": size}]}}


def test_a_varied_shot_list_passes() -> None:
    beats = [shot(0, "medium", "flat", 0), shot(1, "close", "bank", 4), shot(2, "wide", "penthouse", 8),
             shot(3, "medium", "vault", 12), shot(4, "extreme", "flat", 16), shot(5, "wide", "market", 20), shot(6, "close", "office", 25)]
    assert craft.shot_problems(tl(beats)) == []


def test_old_layouts_one_size_and_one_set_fail() -> None:
    old = [{"id": f"o{i}", "scene": "stage", "from": i * 120, "params": {}} for i in range(6)]
    assert any("composed shots" in p for p in craft.shot_problems(tl(old)))
    same = [shot(i, "medium", "flat", i * 4) for i in range(7)]
    problems = craft.shot_problems(tl(same))
    assert any("shot sizes" in p for p in problems) and any("four shots in a row" in p for p in problems)
    assert any("in a row" in p and "set" in p for p in problems) and any("without a close" in p for p in problems)


def test_cover_gate_flags_the_same_layout_with_new_words():
    from renderer.craft import cover_problems
    v = REPO / "videos"
    same = cover_problems(v / "v-20261023-02" / "thumbnail.png", [("v-20261023-01", v / "v-20261023-01" / "thumbnail.png")])
    assert same and "v-20261023-01" in same[0]
    other = cover_problems(v / "v-20261022-03" / "thumbnail.png", [("v-20261022-01", v / "v-20261022-01" / "thumbnail.png")])
    assert other == []
