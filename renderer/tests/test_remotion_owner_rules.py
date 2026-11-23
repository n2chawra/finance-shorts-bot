"""Owner notes made rules for every channel (2026-11-23)."""
from renderer import remotion as r

MAP = 'import { WorldMap } from "../../flat/map";\n'


def beat(i, say, comp, **params):
    return {"id": i, "scene": "directed", "say": say, "params": {"component": comp, **params}}


def test_a_country_named_on_the_map_shows_its_flag_once():
    beats = [beat("hook", "Russia once ended at the Ural Mountains.", "Hook"), beat("big", "Now Russia is the biggest.", "Big")]
    plain = {"Hook": MAP + 'colors={{ Russia: { fill: "#c00" } }}', "Big": MAP + "<WorldMap />"}
    assert any("Russia" in p for p in r.map_flag_problems(beats, plain))
    flagged = {**plain, "Big": MAP + 'colors={{ Russia: { fill: "#c00", flag: "Russia" } }}'}
    assert r.map_flag_problems(beats, flagged) == []
    # the map drawn through the video's own props.tsx counts as a map beat
    wrapped = {"Hook": 'import { Asia } from "./props";', "Big": 'import { Asia } from "./props";', "props": MAP + "<WorldMap />"}
    assert any("Russia" in p for p in r.map_flag_problems(beats, wrapped))
    # a beat with no map never needs a flag
    assert r.map_flag_problems(beats, {"Hook": "<Stage />", "Big": "<Stage />"}) == []


def test_every_picture_once():
    pic = lambda s: {"src": f"media/x/{s}.jpg"}
    beats = [beat("a", "", "A", photo=pic("p1")), beat("b", "", "B", photo=pic("p2")), beat("c", "", "C", photo=pic("p1"))]
    assert r.picture_once_problems(beats, "short") == []                          # the loop beat repeats the first
    beats.insert(2, beat("x", "", "X", photo=pic("p2")))
    assert any("p2.jpg" in p for p in r.picture_once_problems(beats, "short"))
    assert r.picture_once_problems(beats, "long") == []                           # twice is fine in a long video
