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
    refs = thumbs.topic_refs("L-x", tmp_path, store, live=False)
    assert [r["id"] for r in refs[:2]] == ["apFPtyZHuns", "abcdefghijk"] and len(refs) == 4


def test_phone_size_band():
    flat = Image.new("RGB", (1280, 720), (120, 120, 120))
    tmp = REPO / ".pytest-thumb.png"
    flat.save(tmp)
    try:
        assert any("flat at phone size" in p for p in thumbs.image_problems(tmp))
    finally:
        tmp.unlink()


def test_a_thumbnail_that_does_not_get_clicked_fails():
    """Owner, 2026-11-11: L-20261111-01 got 4 clicks from 100 impressions (calm smirk, 'Million?' under a
    $1 billion title, ten things in the picture)."""
    title = "What does $1 billion actually look like?"
    bad = {**GOOD, "words": "Million? *Cute.*", "expression": "smirk", "things": ["wallet", "hourglass", "fountain", "crowd", "rocket"]}
    probs = " | ".join(thumbs.spec_problems(bad, title))
    assert "calm" in probs and "5 things" in probs and "says million but the title says billion" in probs
    ok = {**GOOD, "words": "Bigger than *this*", "expression": "shock", "things": ["warehouse of cash", "tiny person"]}
    assert thumbs.spec_problems(ok, title) == []


def test_topic_refs_never_fall_back_to_other_topics(tmp_path):
    """Owner, 2026-11-11: every topic's thumbnail is made from the topic's own videos' thumbnails. The demand
    video is read where the planner writes it (the plan's top level), and nothing comes from thumbnails.json."""
    d = tmp_path / "videos" / "L-y"
    d.mkdir(parents=True)
    (d / "plan.json").write_text(json.dumps({"topic": {"feed_id": "t9"}, "demand": {
        "url": "https://www.youtube.com/watch?v=apFPtyZHuns", "views": 12324195, "title": "Could You Spend $1 Trillion?"}}), encoding="utf-8")
    refs = thumbs.topic_refs("L-y", tmp_path, {"topics": {}}, live=False)
    assert [r["id"] for r in refs] == ["apFPtyZHuns"]
    th = {"references": [{"id": "apFPtyZHuns"}, {"id": "D7Y-nJ8uiEA"}]}
    assert any("D7Y-nJ8uiEA" in p for p in thumbs.reference_problems(th, refs))
    assert thumbs.reference_problems({"references": [{"id": "apFPtyZHuns"}]}, refs) == []


def test_parse_search_reads_a_results_page():
    data = {"contents": {"x": [{"videoRenderer": {"videoId": "tbVb63qPDQ8", "title": {"runs": [{"text": "True Scale of A BILLION"}]},
            "ownerText": {"runs": [{"text": "Corridor Crew"}]}, "viewCountText": {"simpleText": "7,047,895 views"},
            "lengthText": {"simpleText": "8:39"}}}, {"videoRenderer": {"videoId": "bad"}}]}}
    html = "<script>var ytInitialData = " + json.dumps(data) + ";</script>"
    assert thumbs.parse_search(html) == [{"id": "tbVb63qPDQ8", "title": "True Scale of A BILLION", "channel": "Corridor Crew",
                                          "views": 7047895, "durationSec": 519}]
    assert thumbs._views("1.2M views") == 1_200_000 and thumbs.parse_search("<html></html>") == []


def test_three_thumbnails_rated_and_one_picked():
    """Owner, 2026-11-11: three to pick from; if he doesn't, Studio rates them and picks before upload."""
    a = {**GOOD, "pattern": "one face and three huge words", "score": 7, "why": "the face reads at phone size, words match"}
    b = {**GOOD, "pattern": "three panels of rising figures", "score": 8, "why": "the ladder of sums is the topic's top hit"}
    c = {**GOOD, "pattern": "a towering pile beside something tiny", "score": 6, "why": "the scale reads but the words are small"}
    s = {"thumbnail": a, "thumbnails": [b, c], "thumbnail_pick": "b"}
    assert thumbs.pick_problems(s) == []
    assert [e["picked"] for e in thumbs.manifest_entries(s)] == [False, True, False]
    assert [e["file"] for e in thumbs.manifest_entries(s)] == ["thumbnail.png", "thumbnail-b.png", "thumbnail-c.png"]
    assert any("higher score" in p for p in thumbs.pick_problems({**s, "thumbnail_pick": "c"}))
    assert any("three" in p for p in thumbs.pick_problems({"thumbnail": a, "thumbnail_pick": "a"}))
    assert any("rate it" in p for p in thumbs.pick_problems({**s, "thumbnail": {**a, "score": None}}))
    assert any("share a `pattern`" in p for p in thumbs.pick_problems({**s, "thumbnails": [b, {**c, "pattern": b["pattern"]}]}))

