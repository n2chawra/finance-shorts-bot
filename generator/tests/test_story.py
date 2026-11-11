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
                      {**beat("promise", "promise", f"The table itself hides the trick {long}"), "speaker": "narrator"},
                      {**beat("a", "build", f"Clue one is green {long}"), "speaker": "narrator"},
                      {**beat("b", "build", f"Clue two is time {long}"), "speaker": "narrator"},
                      {**beat("r", "build", "Only that much? So why worry? That is nothing to me."), "speaker": "rohan"},
                      {**beat("c", "build", f"But clue three is the crowd {long}"), "speaker": "narrator"},
                      {**beat("turn", "turn", "Why do I love your lucky nights? They bring you back"), "speaker": "sharma"},
                      {**beat("payoff", "payoff", f"So the casino never needs luck {long}"), "speaker": "narrator"},
                      {**beat("loop", "loop", "One more spin couldn't hurt, right?"), "speaker": "rohan"}]}


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


def test_a_skit_the_cast_trade_in_short_lines_passes():
    """2026-11-11: the one-explaining-voice rules are gone; the Shorts that worked were skits the cast acted."""
    s = explained()
    for i, b in enumerate(s["beats"][1:-1]):
        b["speaker"] = ("rohan", "priya", "sharma")[i % 3]
        b["say"] = "Short line here."
    problems = " ".join(story.script_problems(s))
    assert "no one explains" not in problems and "speaker changes" not in problems and "not one-liners" not in problems


def test_whips_are_accents():
    s = explained()
    for b in s["beats"][1:7]:
        b["transition"] = "whip"
    assert any("whip or zoom-through" in p for p in story.script_problems(s))


def test_hedging_and_no_open_questions_fail():
    # owner, 2026-11-02: the car-discount Short said "might", "can", "some dealers" in every line
    s = explained()
    for b in s["beats"][2:4]:
        b["say"] = "Some dealers might quietly add a point, and you could pay it back, which can cost you"
    s["beats"][5]["say"] = "Clue three is the crowd and that is where the money goes every single night here"
    for b in s["beats"][4:7]:
        b["say"] = b["say"].replace("?", ".")
    problems = " ".join(story.script_problems(s))
    assert "hedging words" in problems and "open a new question" in problems


def test_warm_up_openers_fail():
    s = explained()
    s["beats"][1]["say"] = "Picture a new car " + s["beats"][1]["say"]
    assert any("warm-up" in p for p in story.script_problems(s))


def test_too_few_questions_and_a_silent_ending_fail():
    # The Curious Plot asks the viewer's next question every ~9 s and ends on one (2026-11-02)
    s = explained()
    for b in s["beats"]:
        b["say"] = b["say"].replace("?", ".")
    problems = " ".join(story.script_problems(s))
    assert "questions in about" in problems
    assert "ending asks the viewer nothing" not in problems     # a Short that loops back to its hook ends on the loop
    s["beats"][-1]["role"] = "payoff"
    assert "ending asks the viewer nothing" in " ".join(story.script_problems(s))


def test_announcing_the_structure_after_the_hook_fails():
    # "three clues…" / "four levels…" right after the hook lost 24–41% of viewers within 2 s (2026-11-03)
    s = explained()
    s["beats"][1]["say"] = "Three clues explain where the money goes, and the last one is under your feet right now."
    assert any("announces the structure" in p for p in story.script_problems(s))


def test_a_board_beat_needs_its_header():
    s = explained()
    s["beats"][2]["scene"] = "board"
    assert any("opens with `header`" in p for p in story.script_problems(s))
    s["beats"][2]["params"] = {"header": "THE HOUSE ALWAYS WINS"}
    assert not any("opens with `header`" in p for p in story.script_problems(s))


def test_scripts_from_before_shapes_keep_the_levels_rules():
    assert story.script_problems(good()) == []          # no `shape`: the levels spine, unchanged


def test_cant_is_certain_not_a_hedge():
    # "You can't…" states a fact; only "can" on its own hedges (auditor 2026-11-03: \bcan\b matched "can't")
    s = explained()
    for b in s["beats"][2:5]:
        b["say"] = "You can't sell it, he can’t either, and the bank cannot wait " + b["say"]
    assert not any("hedging words" in p for p in story.script_problems(s))
    for b in s["beats"][2:5]:
        b["say"] = "You can sell it " + b["say"]
    assert any("hedging words" in p for p in story.script_problems(s))


# ---------------- the hook pattern: the belief, denied (owner, 2026-10-31 and 2026-11-09) ----------------

def armed(hook: str) -> dict:
    s = explained()
    s["arms"] = {"style": "shot", "hook": "secret"}
    s["beats"][0]["say"] = hook
    return s


def test_a_hook_that_states_the_fact_with_the_name_or_the_figure_passes():
    """2026-11-11: the hook says the surprising fact itself; "You think X? It isn't." is no longer the pattern."""
    for hook in ("The NBA paid Magic Johnson {pay}. He made a billion.",
                 "McDonald's earns more from rent than from burgers.",
                 "A {price} gym makes its money from the members who never come."):
        assert story.hook_problems(armed(hook)) == [], hook


def test_a_you_think_hook_fails():
    for hook in ("You think McDonald's makes its money selling burgers? It doesn't.",
                 "Do you think Delta earns its {fact2} flying you? You're wrong."):
        assert "state the surprising fact itself" in " ".join(story.hook_problems(armed(hook))), hook


def test_a_hook_without_the_name_or_the_figure_fails():
    problems = " ".join(story.hook_problems(armed("Your gym wants you to stay home.")))
    assert "names no famous person or company and no figure" in problems


def test_a_hook_that_ends_on_a_stock_tag_fails():
    for hook in ("Basketball made Magic Johnson a billionaire? Watch this.",
                 "Apple earns {fact1} from one iPhone setting. Here's why."):
        assert "stock tag" in " ".join(story.script_problems(armed(hook))), hook


def test_a_hook_ending_like_a_recent_one_is_only_a_note():
    from renderer import advice
    earlier = [armed("Planet Fitness charges {price}, and most never come.")]
    problems = story.hook_problems(armed("Delta sells {fact1} of miles, and most never come."), earlier)
    assert len(problems) == 1 and advice.is_note(problems[0]) and "ends like one of the last" in problems[0]


def test_scripts_without_arms_keep_the_old_hook_check():
    assert story.script_problems(explained()) == []


def test_spoken_figure_problems_flags_figures_the_voice_never_says():
    # v-20261111-03 (owner 2026-11-11: "animation showing numbers difference but voice speaking was very little")
    from generator import story as st
    script = {"beats": [
        {"id": "hook", "role": "hook", "say": "You think he gets paid now? Almost none.", "params": {"figure": "{fact1}"}},
        {"id": "deal", "role": "build", "say": "His deal pays him {fact4} a year, for now.", "params": {"items": [{"tag": "{fact1}"}, {"tag": "{fact4}"}]}},
        {"id": "forbes", "role": "build", "say": "Sponsors paid him far more.", "params": {"figure": "{fact5}"}},
    ]}
    probs = st.spoken_figure_problems(script)
    assert len(probs) == 1 and "deal {fact1}" in probs[0] and "forbes {fact5}" in probs[0] and "fact4" not in probs[0]


def test_spoken_figure_problems_passes_a_said_figure_shown_again():
    from generator import story as st
    script = {"beats": [
        {"id": "hook", "role": "hook", "say": "Guess.", "params": {"figure": "{a}"}},
        {"id": "b1", "role": "build", "say": "He made {a} last year.", "params": {"figure": "{a}"}},
        {"id": "b2", "role": "payoff", "say": "And that keeps growing.", "params": {"pay": "{a}"}},
    ]}
    assert st.spoken_figure_problems(script) == []
