"""The board's story rules (owner, 2026-11-02, after The Curious Plot study and four demos): one
sentence and a new picture per beat, answers on labelled cards, a thing back at most 4 times, the
look rotating per video, and calculations that start from a real figure tied to it."""
import re
from pathlib import Path

from generator import looks, story, topics

ROOT = Path(__file__).resolve().parents[2]


def card(i: int, say: str = "Short line here.", prop: str = "slip", bg: str | None = None, rich: bool = True) -> dict:
    acts = [{"sec": 0, "do": "doc", "title": "Pay slip", "rows": [{"label": "Pay to", "value": "Someone"}, {"label": "Amount", "value": "{x}"}]},
            {"sec": 0.5, "do": "chip", "text": "Per year"}, {"sec": 1, "do": "stamp", "target": "a", "text": "Zero"}] if rich else \
           [{"sec": 1, "do": "cross", "target": "a"}]
    return {"id": f"c{i}", "scene": "board", "speaker": "sharma", "say": say,
            "params": {"header": "Point", "bg": bg or ["sand", "sky", "mint", "plum", "coral"][i % 5],
                       "items": [{"id": "a", "prop": f"{prop}{i}" if prop == "slip" else prop}], "actions": acts}}


def board_script(beats: list[dict], shape: str = "reveal") -> dict:
    return {"format": "short", "template": "short_story", "shape": shape, "beats": beats}


def test_a_long_board_beat_fails():
    s = board_script([card(0), card(1, "This sentence keeps going and going with many words about money and tax and loans, far past one simple point"), card(2)])
    assert any("one sentence, one picture per beat" in p for p in story.board_rhythm_problems(s))


def test_the_same_picture_twice_and_the_same_colour_fail():
    a, b = card(0, prop="house", bg="sand"), card(1, prop="house", bg="sand")
    problems = " ".join(story.board_rhythm_problems(board_script([a, b, card(2)])))
    assert "show the same picture" in problems and "share the colour" in problems


def test_a_prop_in_more_than_four_beats_fails():
    s = board_script([card(i, prop="shares") for i in range(5)])
    assert any("shares on screen in more than 4 beats" in p for p in story.board_rhythm_problems(s))


def test_a_card_that_is_one_icon_fails():
    s = board_script([card(0), card(1, rich=False), card(2)])
    assert any("card 'c1'" in p and "labelled diagram" in p for p in story.board_rhythm_problems(s))


def test_rooms_have_no_card_rule_and_answers_belong_on_cards():
    room = {**card(1, rich=False), "params": {**card(1, rich=False)["params"], "cast": [{"who": "rohan"}]}}
    assert not any("card 'c1'" in p for p in story.board_rhythm_problems(board_script([card(0), room, card(2)])))
    rooms = [{**card(i), "params": {**card(i)["params"], "cast": [{"who": "rohan"}]}} for i in range(3)]
    s = board_script(rooms + [{**card(3), "speaker": "rohan", "say": "Why? How? Really? What? Sure?"}], shape="question-chain")
    assert any("answers go on a card" in p for p in story.board_rhythm_problems(s))


def test_looks_rotate():
    look = {"stage": "flat", "header": "strip", "holder": "box", "entrance": "pop"}
    assert looks.problems(look, []) == []
    assert any("must be one of" in p for p in looks.problems({**look, "stage": "moon"}, []))
    same = [{"id": "v-1", "style": {"look": dict(look)}}]
    problems = " ".join(looks.problems(look, same))
    assert "same as v-1" in problems and "stage 'flat' was used by the previous video" in problems
    assert looks.problems(None, same) == []


def test_looks_match_the_board_scene():
    ts = (ROOT / "remotion/src/studio/board.tsx").read_text(encoding="utf-8")
    block = ts[ts.index("export const LOOKS"):ts.index("} as const;")]
    for key, values in looks.LOOKS.items():
        line = re.search(rf"{key}: \[([^\]]*)\]", block)
        assert line, key
        assert tuple(re.findall(r'"([a-z]+)"', line.group(1))) == values, key


def test_a_calculation_from_a_fact_must_use_its_value():
    facts = [{"value": 401, "unit": "money_billion"}, {"value": 13.6, "unit": "money_billion"}, {"value": 0.1, "unit": "percent"}]
    ok = {"facts": facts, "maths": [{"name": "r", "kind": "rate", "part": 13.6e9, "whole": 401e9, "facts": {"part": 2, "whole": 1}},
                                   {"name": "b", "kind": "rate", "part": 0.1, "whole": 100, "facts": {"part": 3}}]}
    assert topics.check_fact_inputs(ok) == []
    bad = {"facts": facts, "maths": [{"name": "r", "kind": "rate", "part": 14e9, "whole": 401e9, "facts": {"part": 2, "whole": 4}}]}
    problems = " ".join(topics.check_fact_inputs(bad))
    assert "use the fact's value" in problems and "there is no fact 4" in problems


def test_a_malformed_fact_link_is_a_note_not_a_crash():
    # auditor 2026-11-03: `"facts": [1]` (a list, not {"amount": 1}) raised AttributeError out of number-check
    facts = [{"value": 401, "unit": "money_billion"}, {"unit": "money_billion"}]
    script = {"facts": facts, "maths": [{"name": "r", "kind": "rate", "part": 1, "whole": 2, "facts": [1]},
                                        {"name": "s", "kind": "rate", "part": 1, "whole": 2, "facts": {"part": 2}}]}
    problems = " ".join(topics.check_fact_inputs(script))
    assert "maths 'r'.facts is an object" in problems
    assert "fact 2 has no numeric value" in problems
