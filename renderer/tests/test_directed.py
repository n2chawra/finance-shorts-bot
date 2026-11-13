"""Directed beats (owner, 2026-11-13: the flat 2D Netflix remake is how new videos are made): the script
says where each line happens, its shot sizes and its moments; the craft gates read them; a video's own
code draws them on the flat kit with no figure typed into it."""
import json
from pathlib import Path

import pytest

from renderer import craft, remotion
from renderer.timeline import build as tb

REPO = Path(__file__).resolve().parents[2]
REFERENCE = REPO / "videos" / "v-directed-netflix" / "script.json"


def reference() -> dict:
    return json.loads(REFERENCE.read_text(encoding="utf-8"))


def test_the_reference_script_passes_the_checks() -> None:
    s = reference()
    assert all(b["scene"] == "directed" for b in s["beats"])
    out = tb.check_script(s)
    assert [b["scene"] for b in out["beats"]] == ["directed"] * len(s["beats"])


@pytest.mark.parametrize("change, error", [
    ({"component": "vault"}, "params.component"),
    ({"place": ""}, "params.place"),
    ({"camera": [{"sec": 0, "size": "huge"}]}, "has a size"),
    ({"camera": [{"at": "nowhere", "size": "close"}]}, "not one of this beat's events"),
    ({"moments": []}, "params.moments"),
    ({"moments": [{"at": "nowhere", "what": "x"}]}, "not one of this beat's events"),
])
def test_a_directed_beat_names_its_component_place_sizes_and_moments(change: dict, error: str) -> None:
    s = reference()
    s["beats"][1]["params"] = {**s["beats"][1]["params"], **change}
    with pytest.raises(ValueError, match=error):
        tb.check_script(s)


def tl_of(beats: list[dict], seconds: float = 30) -> dict:
    return {"format": "short", "fps": 30, "durationInFrames": int(seconds * 30), "beats": beats}


def directed(i: int, size: str, place: str, sec: float, frames: int = 120, moments: list[dict] | None = None) -> dict:
    return {"id": f"d{i}", "scene": "directed", "from": int(sec * 30), "frames": frames, "events": {"w": 30, "x": 60},
            "params": {"component": f"Shot{i}", "place": place, "camera": [{"sec": 0, "size": size}],
                       "moments": moments if moments is not None else [{"at": "w", "what": "a"}, {"at": "x", "what": "b"}], "things": [f"thing{i}"]}}


def test_directed_beats_count_as_composed_shots_and_their_places_as_sets() -> None:
    varied = [directed(0, "close", "living room", 0), directed(1, "wide", "film set", 4), directed(2, "close", "vault", 8),
              directed(3, "wide", "city", 12), directed(4, "medium", "harbour", 16), directed(5, "close", "studio lot", 20)]
    assert craft.shot_problems(tl_of(varied)) == []
    same = [directed(i, "medium", "vault", i * 4) for i in range(7)]
    problems = craft.shot_problems(tl_of(same))
    assert any("set 'vault'" in p for p in problems) and any("shot sizes" in p for p in problems)


def test_a_directed_beat_with_long_gaps_between_its_moments_fails() -> None:
    lazy = directed(0, "close", "vault", 0, frames=300, moments=[{"at": "w", "what": "the door opens"}])
    assert any("nothing new on screen" in p for p in craft.picture_problems(tl_of([lazy], 10)))
    busy = directed(0, "close", "vault", 0, frames=90)
    assert craft.picture_problems(tl_of([busy], 3)) == []


def test_places_are_not_the_last_videos_places_again() -> None:
    mine = tl_of([directed(i, "close", p, i * 4) for i, p in enumerate(["vault", "harbour", "film set", "city"])])
    theirs = tl_of([directed(i, "close", p, i * 4) for i, p in enumerate(["vault", "harbour", "film set", "desert"])])
    assert any("places were in" in p for p in craft.prop_problems(mine, [("v-old", theirs)]))
    fresh = tl_of([directed(i, "close", p, i * 4) for i, p in enumerate(["casino", "airport", "farm", "garage"])])
    assert not any("places were in" in p for p in craft.prop_problems(fresh, [("v-old", theirs)]))
    # a repeat fails the video (every video must be unique), it is not a note
    assert any(p.startswith(tuple("0123456789")) for p in craft.prop_problems(mine, [("v-old", theirs)]) if "places were in" in p)


def test_a_video_never_copies_the_reference_videos_places() -> None:
    ref = [b["params"]["place"] for b in reference()["beats"]]
    flat = [x for p in ref for x in ([p] if isinstance(p, str) else p)]
    copy = tl_of([directed(i, "close", p, i * 4) for i, p in enumerate(flat[:5])])
    assert any("places were in v-directed-netflix" in p for p in craft.prop_problems(copy, []))
    own = tl_of([directed(i, "close", p, i * 4) for i, p in enumerate(["a stadium", "a locker room", "a bank lobby", "a jet"])])
    assert not any("v-directed-netflix" in p for p in craft.prop_problems(own, []))


@pytest.fixture
def tree(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setattr(remotion, "REMOTION", tmp_path / "remotion")     # no node_modules: the type-check is skipped
    (tmp_path / "remotion" / "src" / "videos" / "v-test").mkdir(parents=True)
    (tmp_path / "videos" / "v-test").mkdir(parents=True)
    return tmp_path


def code(tree: Path, name: str, body: str) -> None:
    (tree / "remotion" / "src" / "videos" / "v-test" / f"{name}.tsx").write_text(body, encoding="utf-8")


OK = ('import React from "react";\nimport type { SceneProps } from "../../scenes/kit";\nimport { Stage, Txt, motion } from "../../flat/kit";\n'
      'import { Char } from "../../flat/cast";\n'
      'const Vault: React.FC<SceneProps> = (p) => { const m = motion(p); const fig = (p.beat.params as { fig?: { kept?: string } }).fig?.kept ?? "";\n'
      '  return <Stage p={p} bg="#000"><path d="M 470 1260 L 470 1080" /><Txt x={1} y={2} size={90} fill="#fff">{fig}</Txt>'
      '<Char x={540} y={1800} s={300} face="smirk" /></Stage>; };\nexport default Vault;\n')


def test_a_directed_beat_on_the_flat_kit_passes(tree: Path) -> None:
    code(tree, "Vault", OK)
    assert remotion.custom_problems("v-test") == []


def test_a_figure_typed_into_the_code_fails(tree: Path) -> None:
    code(tree, "Vault", OK.replace("{fig}", "$11B"))
    assert any("figure typed into the code" in p for p in remotion.custom_problems("v-test"))
    code(tree, "Vault", OK.replace("{fig}", "325M paid memberships"))
    assert any("figure typed into the code" in p for p in remotion.custom_problems("v-test"))


def test_every_directed_beat_needs_its_file(tree: Path) -> None:
    code(tree, "Vault", OK)
    script = {"beats": [{"id": "a", "scene": "directed", "params": {"component": "Vault"}},
                        {"id": "b", "scene": "directed", "params": {"component": "Harbour"}}]}
    (tree / "videos" / "v-test" / "script.json").write_text(json.dumps(script), encoding="utf-8")
    problems = remotion.custom_problems("v-test")
    assert any("Harbour.tsx" in p for p in problems) and not any("Vault.tsx" in p for p in problems)


def test_the_reference_video_code_has_no_typed_figures() -> None:
    folder = REPO / "remotion" / "src" / "videos" / "v-directed-netflix"
    for f in folder.glob("*.tsx"):
        assert not remotion.TYPED_FIGURE.search(remotion._COMMENTS.sub("", f.read_text(encoding="utf-8"))), f.name
