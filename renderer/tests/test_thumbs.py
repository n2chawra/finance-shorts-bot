"""Long-video thumbnail rules (renderer/thumbs.py)."""
import json
from pathlib import Path

from PIL import Image

from renderer import thumbs

REPO = Path(__file__).resolve().parents[2]
TITLE = "Why the rich borrow money and the poor pay it back"
REFS = [{"id": "D7Y-nJ8uiEA", "views": 10119497, "what": "one huge face, three words"},
        {"id": "zxVoCw3P1Gc", "views": 3787627, "what": "a grid of the list's things"},
        {"id": "FHSsR1gfLJA", "views": 1128269, "what": "a ladder, coloured columns"}]
GOOD = {"layout": "custom", "component": "Thumb", "words": "Only one *wins*", "references": REFS,
        "pattern": "one big shocked face beside the thing, two huge words, red arrow"}


def test_a_fixed_type_is_no_longer_enough():
    """Owner, 2026-10-29: the fixed types were outdated and got no clicks."""
    for layout in ("story", "grid", "face"):
        assert any("custom" in p for p in thumbs.spec_problems({"layout": layout, "words": "Look"}, TITLE))


def test_a_custom_thumbnail_modelled_on_the_topic_s_hits_passes():
    assert thumbs.spec_problems(GOOD, TITLE) == []


def test_references_pattern_and_words():
    few = {**GOOD, "references": REFS[:2]}
    assert any("3+ hits" in p for p in thumbs.spec_problems(few, TITLE))
    small = {**GOOD, "references": [{**r, "views": 5000} for r in REFS]}
    assert any("3+ hits" in p for p in thumbs.spec_problems(small, TITLE))
    assert any("pattern" in p for p in thumbs.spec_problems({**GOOD, "pattern": ""}, TITLE))
    assert any("repeats the title" in p for p in thumbs.spec_problems({**GOOD, "words": "Rich borrow money"}, TITLE))
    assert any("4 at most" in p for p in thumbs.spec_problems({**GOOD, "words": "one two three four five"}, TITLE))


def test_the_thumb_file_must_exist(tmp_path):
    assert thumbs.code_problems("L-x", GOOD, tmp_path)
    f = tmp_path / "remotion" / "src" / "videos" / "L-x"
    f.mkdir(parents=True)
    (f / "Thumb.tsx").write_text("export default () => null;", encoding="utf-8")
    assert thumbs.code_problems("L-x", GOOD, tmp_path) == []


def test_topic_refs_come_from_the_market_search_and_the_demand_video(tmp_path):
    d = tmp_path / "videos" / "L-x"
    d.mkdir(parents=True)
    (d / "plan.json").write_text(json.dumps({"topic": {"feed_id": "t1", "demand": {
        "url": "https://www.youtube.com/watch?v=apFPtyZHuns", "views": 12324195, "title": "Could You Spend $1 Trillion?"}}}), encoding="utf-8")
    store = {"topics": {"t1": {"refs": [{"id": "abcdefghijk", "views": 2_000_000, "title": "A"}, {"id": "bcdefghijkl", "views": 900_000, "title": "B"},
                                        {"id": "cdefghijklm", "views": 300_000, "title": "C"}]}}}
    refs = thumbs.topic_refs("L-x", tmp_path, store)
    assert [r["id"] for r in refs[:2]] == ["apFPtyZHuns", "abcdefghijk"] and len(refs) == 4


def test_phone_size_band():
    flat = Image.new("RGB", (1280, 720), (120, 120, 120))
    tmp = REPO / ".pytest-thumb.png"
    flat.save(tmp)
    try:
        assert any("flat at phone size" in p for p in thumbs.image_problems(tmp))
    finally:
        tmp.unlink()
