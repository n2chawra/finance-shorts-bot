"""A sample's likeness to its channel's references: our measures from the timeline, held to ±25%."""
import json

from generator import likeness


def timeline(**over):
    beat = lambda i, f, cams, say: {"id": f"b{i}", "from": f, "frames": 150, "say": say, "events": {"x": 30},
                                    "params": {"camera": cams}, "voice": {"start": 0, "words": [{"w": w, "s": k * 0.3, "e": k * 0.3 + 0.25} for k, w in enumerate(say.split())]}}
    t = {"fps": 30, "durationInFrames": 300, "format": "short",
         "beats": [beat(0, 0, [{"sec": 0}, {"at": "x"}], "Why does a hot dog cost a dollar fifty"),
                   beat(1, 150, [{"sec": 0}], "Costco loses $200M a year on it")]}
    return {**t, **over}


def test_our_measures_from_the_timeline():
    o = likeness.ours(timeline())
    assert o["durationSec"] == 10.0
    assert o["secPerShot"] == round(10 / 3, 2)          # three framings: two in the first beat, one in the second
    assert o["cutsFirst3s"] == 1                        # the push at 1 s
    assert o["wordsPerMin"] == round(16 / 10 * 60)            # 9 + 7 words in 10 s
    assert 5.0 < o["firstFigureSec"] < 7.5              # "$200M" in the second line


def test_held_to_25_percent_and_cuts_to_one(tmp_path, monkeypatch):
    rows = likeness.compare({"secPerShot": 3.0, "wordsPerMin": 100, "cutsFirst3s": 1, "firstFigureSec": None, "durationSec": 30},
                            {"secPerShot": {"median": 2.0}, "wordsPerMin": {"median": 110}, "cutsFirst3s": {"median": 2}, "durationSec": {"median": 31}})
    by = {r["measure"]: r["within"] for r in rows}
    assert by["seconds per shot"] is False and by["spoken words a minute"] is True
    assert by["shots in the first 3 s"] is True and by["seconds to the first figure"] is None


def test_likeness_file_for_a_sample(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "space-facts")
    ch = tmp_path / "channels" / "space-facts"
    (ch / "videos" / "v-20261120-01").mkdir(parents=True)
    (ch / "videos" / "v-20261120-01" / "timeline.json").write_text(json.dumps(timeline()), encoding="utf-8")
    (ch / "research").mkdir()
    (ch / "research" / "style.json").write_text(json.dumps({"shorts": {"n": 12, "targets": {"secPerShot": {"median": 3.0}, "wordsPerMin": {"median": 95}}}}), encoding="utf-8")
    r = likeness.likeness("v-20261120-01", root=tmp_path)
    assert r["references"] == 12 and r["pass"] is True
    assert (ch / "videos" / "v-20261120-01" / "likeness.json").is_file()
