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


def test_cover_gate_flags_the_same_layout_with_new_words(tmp_path: Path):
    from PIL import ImageDraw
    from renderer.craft import cover_problems

    def cover(name: str, words: str, flip: bool = False) -> Path:
        img = Image.new("RGB", (1080, 1920), (20, 30, 60))
        d = ImageDraw.Draw(img)
        d.rectangle((0, 1100, 1080, 1920), fill=(230, 180, 40))          # the layout: a dark sky over a gold ground
        d.ellipse((300, 500, 780, 980), fill=(200, 60, 50))               # one big thing in the middle
        d.text((80, 200), words, fill=(255, 255, 255))                    # the words change
        if flip:
            img = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        img.save(tmp_path / name)
        return tmp_path / name
    first, second, third = cover("a.png", "WHY IT COST $5"), cover("b.png", "HOW IT MADE $9"), cover("c.png", "WHY", flip=True)
    same = cover_problems(second, [("v-20261023-01", first)])
    assert same and "v-20261023-01" in same[0]
    assert cover_problems(third, [("v-20261023-01", first)]) == []


def _build_tl(actions, words, gap_beat_frames=90):
    return {"fps": 30, "beats": [{"id": "b", "scene": "build", "frames": gap_beat_frames, "params": {
        "items": [{"id": "hen", "prop": "hen"}, {"id": "jar", "prop": "jar", "label": "Savings"}], "actions": actions},
        "events": {"hen": 15, "jar": 45}, "voice": {"start": 0, "words": words}}]}


def test_actions_must_show_what_is_said():
    words = [{"w": "The", "s": 0.3, "e": 0.4}, {"w": "hen", "s": 0.5, "e": 0.7}, {"w": "lays", "s": 0.8, "e": 1.0}]
    ok = _build_tl([{"at": "hen", "do": "enter", "target": "hen"}], words)
    assert not any("actions show" in p for p in craft.picture_problems(ok))
    bad = _build_tl([{"at": "hen", "do": "enter", "target": "jar"}], words)
    assert any("actions show" in p for p in craft.picture_problems(bad))


def test_a_flow_lands_on_the_word_that_names_where_the_money_goes():
    # money-travels-not-pops: "flow" sends notes from its target to `to`; saying the destination counts
    words = [{"w": "into", "s": 1.2, "e": 1.4}, {"w": "savings", "s": 1.5, "e": 1.9}]
    ok = _build_tl([{"at": "jar", "do": "flow", "target": "hen", "to": "jar"}], words)
    assert not any("actions show" in p for p in craft.picture_problems(ok))
    bad = _build_tl([{"at": "jar", "do": "flow", "target": "hen", "to": "hen"}], words)
    assert any("actions show" in p for p in craft.picture_problems(bad))


def test_a_long_still_stretch_fails():
    tl = _build_tl([{"at": "hen", "do": "enter", "target": "hen"}], [], gap_beat_frames=150)
    assert any("nothing new on screen" in p for p in craft.picture_problems(tl))


def test_props_must_be_the_videos_own():
    def tl(props):
        return {"beats": [{"scene": "build", "params": {"items": [{"id": p, "prop": p} for p in props]}}]}
    mine = [f"thing{c}" for c in "abcdefgh"]
    assert craft.prop_problems(tl(mine), [("v-old", tl(["other"]))]) == []
    assert any("were in v-old" in p for p in craft.prop_problems(tl(mine), [("v-old", tl(mine[:5]))]))
    assert any("props of its own" in p for p in craft.prop_problems(tl(mine[:3]), []))


def test_long_videos_mix_their_devices():
    def tl(kinds):
        return {"format": "long", "beats": [{"scene": k} for k in kinds]}
    assert craft.device_problems(tl(["build", "framework", "stats", "type", "case", "journey", "build"])) == []
    one_look = craft.device_problems(tl(["stats"] * 4 + ["build", "type"]))
    assert any("kinds of scene" in p for p in one_look) and any("in a row" in p for p in one_look)
    assert any("composed beats" in p for p in craft.device_problems(tl(["type", "build", "type", "case", "type", "build", "type", "stats"])))


def test_directed_long_videos_are_judged_by_component():
    """Every beat is directed (owner, 2026-11-13): the scene name said 'only 1 kind, 4 in a row' on every long
    video (proposal tech-long-device-note-blind). A component is the device; only a long run of one repeats."""
    def tl(comps, secs=8):
        return {"format": "long", "fps": 30, "beats": [{"id": f"b{i}", "scene": "directed", "frames": secs * 30,
                                                        "params": {"component": c}} for i, c in enumerate(comps)]}
    varied = ["Fab", "Plasma", "Plasma", "Plasma", "Plasma", "Mirrors", "Mask", "Wafer", "Route", "Fab"]
    assert craft.device_problems(tl(varied)) == []   # four Plasma beats (32 s) in a row are not a repeat
    long_run = craft.device_problems(tl(["Fab", "Route"] + ["Mirrors"] * 9 + ["Mask", "Wafer", "Route", "Fab"]))
    assert any("Mirrors draws 72 s in a row" in p for p in long_run)
    assert any("composed beats" in p for p in craft.device_problems(tl(["Sky"] * 5 + ["Sea", "Fab", "Mask"], secs=4)))


def _board_tl(dos_per_beat: list[list[str]]) -> dict:
    return {"fps": 30, "beats": [{"id": f"b{i}", "scene": "board", "params": {"actions": [{"do": d} for d in dos]}}
                                 for i, dos in enumerate(dos_per_beat)]}


def test_mark_problems_flags_a_board_video_of_glows_and_stamps():
    # v-20261103-03 (owner: "same stuff coming"): 71% marks
    tl = _board_tl([["glow", "stamp", "bubble"], ["glow", "stamp", "grow"], ["bubble", "cross", "stamp"], ["glow", "bubble", "enter"]])
    probs = craft.mark_problems(tl)
    assert probs and "only mark" in probs[0] and "enters" in probs[0]


def test_mark_problems_passes_a_board_video_that_changes_the_picture():
    tl = _board_tl([["enter", "glow", "flow"], ["swap", "stamp", "doc"], ["bubble", "multiply", "grow"], ["glow", "bars", "stamp"]])
    assert craft.mark_problems(tl) == []
    assert craft.mark_problems(_board_tl([["glow"], ["glow"]])) == []   # fewer than three boards: not a board video


def _stage_tl(items: list[dict], actions: list[dict], fmt: str = "short") -> dict:
    return {"format": fmt, "beats": [{"id": "b1", "scene": "build", "params": {"items": items, "actions": actions}}]}


def test_stage_problems_flags_the_ronaldo_build_beat():
    # v-20261111-01 'day' (owner 2026-11-11: no glow, poor pile growth, everything small in the middle)
    items = [{"id": "week", "size": 0.22}, {"id": "pile", "size": 0.2}, {"id": "he", "size": 0.2}, {"id": "ball", "size": 0.12}]
    acts = [{"do": "glow", "target": "pile"}, {"do": "grow", "target": "pile", "scale": 1.1}]
    probs = " | ".join(craft.stage_problems(_stage_tl(items, acts)))
    assert "4 things" in probs and "no thing is big" in probs and "barely shows" in probs and "no glow" in probs


def test_stage_problems_passes_one_big_hero():
    items = [{"id": "pile", "size": 0.32}, {"id": "week", "size": 0.2}]
    acts = [{"do": "enter", "target": "week"}, {"do": "flow", "target": "week", "to": "pile"}, {"do": "grow", "target": "pile", "scale": 1.5}]
    assert craft.stage_problems(_stage_tl(items, acts)) == []
    # a long video's build beat keeps its own sizes; a glow still fails it
    assert craft.stage_problems(_stage_tl([{"id": "a", "size": 0.1}] * 5, [], "long")) == []
    assert craft.stage_problems(_stage_tl([{"id": "a"}], [{"do": "glow", "target": "a"}], "long"))


def _dir_beat(i: int, sizes: list[str], seconds: float) -> dict:
    """A directed beat whose camera changes size on words spread evenly over `seconds`."""
    step = seconds / max(1, len(sizes))
    cam = [{"sec": 0, "size": sizes[0]}] + [{"at": f"w{k}", "size": s} for k, s in enumerate(sizes[1:], 1)]
    return {"id": f"b{i}", "scene": "directed", "frames": int(seconds * 30), "params": {"camera": cam},
            "events": {f"w{k}": int(k * step * 30) for k in range(1, len(sizes))}}


def test_a_long_video_zooming_in_and_out_all_the_time_fails():
    # owner 2026-11-24 on How Tech Works' L-20261124-21: "too many zoom in and zoom outs"
    churn = tl([_dir_beat(i, ["medium", "close", "medium", "close", "extreme", "medium"], 6) for i in range(10)], "long", 60)
    probs = " | ".join(craft.camera_problems(churn))
    assert "every 1.2 s" in probs and "straight back out" in probs
    calm = tl([_dir_beat(i, ["wide", "close"] if i % 2 else ["medium"], 8) for i in range(10)], "long", 80)
    assert craft.camera_problems(calm) == []
    # Shorts are the weekly loop's to change; this gate reads long videos only
    assert craft.camera_problems({**churn, "format": "short"}) == []
