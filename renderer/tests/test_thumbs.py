"""Long-video thumbnail rules (renderer/thumbs.py)."""
from pathlib import Path

from PIL import Image

from renderer import thumbs

REPO = Path(__file__).resolve().parents[2]
TITLE = "Why the rich borrow money and the poor pay it back"


def test_the_old_receipt_thumbnail_fails():
    old = {"layout": "story", "words": "Your car loan trap", "figure": "$45,424"}
    assert any("receipt and card layouts" in p for p in thumbs.spec_problems(old, TITLE, "rich_vs_poor"))


def test_a_grid_that_sells_the_whole_list_passes():
    grid = {"layout": "grid", "words": "Only one *makes* money", "items": [{"prop": p} for p in "abcdef"]}
    assert thumbs.spec_problems(grid, TITLE, "rich_vs_poor") == []


def test_words_figures_counts_and_type():
    assert any("repeats the title" in p for p in thumbs.spec_problems({"layout": "face", "words": "Rich borrow money"}, TITLE, None))
    assert any("no figure" in p for p in thumbs.spec_problems({"layout": "face", "words": "Banks love this", "figure": "$9"}, TITLE, None))
    assert any("6-12" in p for p in thumbs.spec_problems({"layout": "grid", "words": "Look", "items": [{}]}, TITLE, None))
    assert any("ladder or extremes or face" in p for p in thumbs.spec_problems({"layout": "grid", "words": "Look", "items": [{}] * 6}, TITLE, "which_one_are_you"))
    assert any("4 at most" in p for p in thumbs.spec_problems({"layout": "face", "words": "one two three four five"}, TITLE, None))


def test_variants_are_different_ideas():
    assert thumbs.variant_problems([{"layout": "grid"}, {"layout": "face"}, {"layout": "extremes"}]) == []
    assert thumbs.variant_problems([{"layout": "face"}, {"layout": "face"}])


def test_phone_size_band():
    flat = Image.new("RGB", (1280, 720), (120, 120, 120))
    tmp = REPO / ".pytest-thumb.png"
    flat.save(tmp)
    try:
        assert any("flat at phone size" in p for p in thumbs.image_problems(tmp))
    finally:
        tmp.unlink()
