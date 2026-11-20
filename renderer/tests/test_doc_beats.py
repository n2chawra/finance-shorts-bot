"""Doc beats (remotion/src/doc, 2026-11-19: the business documentaries channel): drawn from params alone,
checked by renderer/timeline/build.py `doc_problems` and the typed-number check."""
import copy

import pytest

from renderer.timeline import build as tb

SLUG = "business-documentaries-rise-and-fall-of"


def script() -> dict:
    return {"template": "short_story", "format": "short", "seed": 1, "currency": "USD",
            "beats": [{"id": "doubt", "scene": "doc", "say": "Its auditors had serious doubt the company would survive.",
                       "events": {"auditors": {"word": "auditors"}, "doubt": {"word": "doubt"}, "survive": {"word": "survive"}},
                       "params": {
                           "place": "the annual report", "things": ["annual report", "highlighter"],
                           "camera": [{"sec": 0, "size": "wide"}, {"at": "doubt", "size": "close"}],
                           "moments": [{"at": "doubt", "what": "the highlighter swipes the line"},
                                       {"at": "survive", "what": "the quote types on"}],
                           "layers": [
                               {"kind": "footage", "src": f"media/{SLUG}/pexels-video-856172.mp4", "move": "push"},
                               {"kind": "document", "src": f"media/{SLUG}/edgar-1024401-p37.png", "box": [0.1, 0.42, 0.8, 0.03],
                                "at": "auditors", "pushAt": "auditors", "markAt": "doubt", "quoteAt": "survive",
                                "quote": "substantial doubt", "source": {"form": "Form 10-K", "text": "Enron Corp.", "date": "2001-04-02"}}],
                           "overlays": [{"kind": "lowerThird", "name": "Arthur Andersen", "role": "the auditor", "at": "auditors", "out": "survive"}]}}]}


def beat_params(s: dict) -> dict:
    return s["beats"][0]["params"]


def test_a_valid_doc_beat_passes() -> None:
    out = tb.check_script(script())
    assert [b["scene"] for b in out["beats"]] == ["doc"]
    b = tb.Beat(**script()["beats"][0])
    assert tb.doc_problems(b, "beat 'doubt'") == []


def _fails(change, error: str) -> None:
    s = copy.deepcopy(script())
    change(beat_params(s))
    with pytest.raises(ValueError, match=error):
        tb.check_script(s)


def test_an_unknown_layer_kind_fails() -> None:
    _fails(lambda p: p["layers"].append({"kind": "hologram"}), r"layers\[2\]\.kind is one of")


def test_an_unknown_overlay_kind_fails() -> None:
    _fails(lambda p: p["overlays"].append({"kind": "sticker"}), r"overlays\[1\]\.kind is one of")


def test_a_moment_on_a_missing_event_fails() -> None:
    _fails(lambda p: p["layers"][1].update(markAt="collapse"), "'collapse' is not one of this beat's events")


def test_an_overlay_out_on_a_missing_event_fails() -> None:
    _fails(lambda p: p["overlays"][0].update(out="later"), "'later' is not one of this beat's events")


def test_a_typed_figure_fails() -> None:
    _fails(lambda p: p["overlays"].append({"kind": "label", "text": "down 88% in a year"}), "typed number")


@pytest.mark.parametrize("src", ["https://example.com/clip.mp4", "media/../secrets.png", "clips/enron.mp4",
                                 f"media/{SLUG}/clip.gif", ""])
def test_a_bad_media_path_fails(src: str) -> None:
    _fails(lambda p: p["layers"][0].update(src=src), r"src is a staged file under remotion/public|typed number")


def test_a_doc_beat_without_layers_fails() -> None:
    _fails(lambda p: p.pop("layers"), "params.layers lists what the beat shows")


def test_a_doc_beat_keeps_the_directed_rules() -> None:
    _fails(lambda p: p.update(place=""), "params.place")
    _fails(lambda p: p.update(camera=[{"sec": 0, "size": "huge"}]), "has a size")


# --- variety across a whole doc video (owner, 2026-11-20) -------------------------------------------

def _doc_video(layers_per_beat, overlays_per_beat=None, fmt="short"):
    from renderer.timeline.build import doc_video_problems
    beats = []
    for i, layers in enumerate(layers_per_beat):
        ov = (overlays_per_beat or [[]] * len(layers_per_beat))[i]
        beats.append({"id": f"b{i}", "scene": "doc", "params": {"layers": layers, "overlays": ov}})
    return doc_video_problems({"format": fmt, "beats": beats})


def _ph(name):
    return {"kind": "photo", "src": f"media/x/{name}.jpg"}


def test_a_short_that_repeats_a_picture_fails():
    beats = [[_ph("a")], [_ph("b")], [_ph("a")], [_ph("c")]]
    assert any("a.jpg is shown" in p for p in _doc_video(beats))


def test_the_last_beat_may_repeat_the_opening_picture():
    beats = [[_ph("a")], [_ph("b")], [_ph("c")], [_ph("a")]]
    assert not any("a.jpg is shown" in p for p in _doc_video(beats))


def test_a_varied_short_passes():
    beats = [
        [_ph("a"), {"kind": "montage", "items": [{"src": "media/x/b.jpg"}, {"src": "media/x/c.jpg"}, {"src": "media/x/d.jpg"}]}],
        [{"kind": "depth", "src": "media/x/e.jpg", "cut": "media/x/e-cut.png"}],
        [{"kind": "headline", "items": []}, _ph("f")],
        [{"kind": "chart", "values": [1, 2]}, _ph("g")],
        [_ph("a")],
    ]
    ov = [[{"kind": "stamp"}], [], [{"kind": "label"}], [{"kind": "source"}], []]
    assert _doc_video(beats, ov) == []


def test_photos_alone_read_as_a_slideshow():
    probs = _doc_video([[_ph(c)] for c in "abcdefgh"])
    assert any("device kinds" in p for p in probs) and any("no document or headline" in p for p in probs)


def test_a_red_ring_is_no_longer_an_overlay():
    from renderer.timeline.build import DOC_OVERLAYS
    assert "circle" not in DOC_OVERLAYS
