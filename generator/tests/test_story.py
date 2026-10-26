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
