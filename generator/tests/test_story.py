"""Story depth checks (generator/story.py): a promise early, levels, a climbing number, a turn, a payoff."""
from generator import story


def beat(id_, role, say="A fresh line about the plan", **params):
    return {"id": id_, "role": role, "scene": "build", "say": say, "params": params}


def good() -> dict:
    return {"format": "short", "template": "short_story", "structure": {"levels": ["Sell", "Borrow", "Never sell"]},
            "beats": [beat("hook", "hook", "Billionaires never sell their stock"),
                      beat("promise", "promise", "It is a trick in three levels"),
                      beat("a", "level", "Easy, sell some shares now", hud={"level": 1, "counter": {"text": "{a}"}}),
                      beat("b", "level", "Borrow against them instead", hud={"level": 2, "counter": {"text": "{b}"}}),
                      beat("c", "level", "Then let them grow forever", hud={"level": 3, "counter": {"text": "{c}"}}),
                      beat("turn", "turn", "But markets can crash hard"),
                      beat("payoff", "payoff", "Small interest beats big tax"),
                      beat("loop", "loop", "That is why they hold on")]}


def test_a_story_with_levels_turn_and_payoff_passes():
    assert story.script_problems(good()) == []


def test_missing_structure_turn_and_counter_fail():
    s = good()
    s["structure"] = {"levels": ["One"]}
    s["beats"] = [b for b in s["beats"] if b["role"] != "turn"]
    for b in s["beats"]:
        b["params"].pop("hud", None)
    problems = " ".join(story.script_problems(s))
    assert "structure.levels" in problems and "`turn`" in problems and "climbing number" in problems


def test_banned_and_repeated_lines_fail():
    s = good()
    s["beats"][2]["say"] = "Wait, what? Sell it all"
    assert any("too often" in p for p in story.script_problems(s))
    earlier = [{"beats": [{"say": "Borrow against them later"}]}]
    assert any("opens like" in p for p in story.script_problems(good(), earlier))


def test_timing_promise_figure_and_turn():
    s = good()
    fps, starts = 30, [0, 9, 12, 16, 20, 24, 40, 50]
    tl = {"fps": fps, "durationInFrames": 55 * fps, "figures": {"x": "$1"},
          "beats": [{"id": b["id"], "from": t * fps, "frames": 3 * fps, "params": b["params"]} for b, t in zip(s["beats"], starts)]}
    problems = " ".join(story.timeline_problems(s, tl))
    assert "promise starts at 9.0 s" in problems and "first figure appears at 12.0 s" in problems
    assert "turn starts at 44%" in problems   # 24 of 55 s: too early


def test_long_videos_need_chapters_and_teases():
    s = good()
    s.update(format="long", template="long_story", structure={"levels": ["Car", "Card", "House", "Skill"]})
    for b, lv in zip([b for b in s["beats"] if b["role"] == "level"], (1, 2, 3)):
        b["params"]["hud"]["level"] = lv
    problems = " ".join(story.script_problems(s))
    assert "tease" in problems and "level" in problems   # level 4 has no beat, and no teases
    assert story.applies(s)


# ---------------- shapes, hooks and one explaining voice (2026-10-30) ----------------

def explained(shape: str = "reveal") -> dict:
    """A Short in the reveal shape: a curiosity hook, the narrator explaining, the cast reacting."""
    long = "and that is the part of the story which explains where the money really goes every night"
    return {"format": "short", "template": "short_story", "shape": shape,
            "beats": [{**beat("hook", "hook", "Casinos make money even when you win. Here's how."), "speaker": "narrator"},
                      {**beat("promise", "promise", f"Three clues hide on this table {long}"), "speaker": "narrator"},
                      {**beat("a", "build", f"Clue one is green {long}"), "speaker": "narrator"},
                      {**beat("b", "build", f"Clue two is time {long}"), "speaker": "narrator"},
                      {**beat("r", "build", "Only that much? That is nothing to me."), "speaker": "rohan"},
                      {**beat("c", "build", f"Clue three is the crowd {long}"), "speaker": "narrator"},
                      {**beat("turn", "turn", "I love your lucky nights, they bring you back"), "speaker": "sharma"},
                      {**beat("payoff", "payoff", f"So the casino never needs luck {long}"), "speaker": "narrator"},
                      {**beat("loop", "loop", "One more spin couldn't hurt"), "speaker": "rohan"}]}


def test_a_reveal_needs_no_levels_or_counter():
    assert story.script_problems(explained()) == []


def test_level_chips_belong_to_the_levels_shape():
    s = explained()
    s["structure"] = {"levels": ["Hour", "Night", "Year"]}
    s["beats"][2]["say"] += ". That's level one"
    problems = " ".join(story.script_problems(s))
    assert "belongs to the levels shape" in problems and '"level" is said' in problems


def test_a_hook_that_gives_the_answer_fails():
    s = explained()
    s["beats"][0]["say"] = "The casino never gambles. It wins a slice of every bet."
    assert any("hook gives no reason" in p for p in story.script_problems(s))


def test_one_liners_traded_by_the_cast_fail():
    s = explained()
    for i, b in enumerate(s["beats"][1:-1]):
        b["speaker"] = ("rohan", "priya", "sharma")[i % 3]
        b["say"] = "Short line here."
    problems = " ".join(story.script_problems(s))
    assert "no one explains" in problems and "speaker changes" in problems and "not one-liners" in problems


def test_whips_are_accents():
    s = explained()
    for b in s["beats"][1:5]:
        b["transition"] = "whip"
    assert any("whip or zoom-through" in p for p in story.script_problems(s))


def test_scripts_from_before_shapes_keep_the_levels_rules():
    assert story.script_problems(good()) == []          # no `shape`: the levels spine, unchanged
