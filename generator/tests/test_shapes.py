"""Story shapes (generator/shapes.py) and the big-money mix (generator/formats.py), 2026-10-30."""
import json

from generator import formats, shapes

LIB = {"shapes": [{"id": "levels", "status": "active", "levels": True}, {"id": "reveal", "status": "active", "levels": False},
                  {"id": "versus", "status": "active", "levels": False}, {"id": "old", "status": "retired", "reason": "slow"}]}


def root_with(tmp_path, lib=LIB, fmts=None):
    d = tmp_path / "improvement" / "research"
    d.mkdir(parents=True, exist_ok=True)
    (d / "shapes.json").write_text(json.dumps(lib), encoding="utf-8")
    if fmts:
        (d / "formats.json").write_text(json.dumps({"formats": fmts}), encoding="utf-8")
    return tmp_path


def test_a_plan_names_a_library_shape_not_used_lately(tmp_path):
    root = root_with(tmp_path)
    assert shapes.check_plan({"shape": "reveal"}, [{"shape": "versus"}], root) == []
    assert any("needs `shape`" in p for p in shapes.check_plan({}, [], root))
    assert any("not in the library" in p for p in shapes.check_plan({"shape": "nope"}, [], root))
    assert any("retired" in p for p in shapes.check_plan({"shape": "old"}, [], root))
    assert any("last 3" in p for p in shapes.check_plan({"shape": "reveal"}, [{"shape": "reveal"}, {"shape": "versus"}], root))


def test_no_shape_takes_more_than_a_quarter(tmp_path):
    root = root_with(tmp_path)
    entries = [{"shape": s} for s in ["reveal", "versus", "x", "y"] * 4 + ["reveal", "b", "c", "d"]]   # 5 of 20
    assert any("at most 25%" in p for p in shapes.check_plan({"shape": "reveal"}, entries, root))


def test_level_chips_at_most_one_in_three(tmp_path):
    root = root_with(tmp_path)
    entries = [{"shape": s} for s in ["versus", "reveal", "levels", "versus", "a", "b"]]
    assert any("1 in 3" in p for p in shapes.check_plan({"shape": "levels"}, entries[:-3] + [{"shape": "levels"}, {"shape": "c"}, {"shape": "d"}], root))


def test_a_new_shape_is_allowed_and_joins_the_library_on_ship(tmp_path):
    root = root_with(tmp_path)
    new = {"id": "the-heist", "name": "The heist", "beats": "hook -> the plan -> the crew -> the twist -> the getaway -> payoff",
           "why": "a robbery story needs a crew and a plan"}
    assert shapes.check_plan({"shape": new}, [], root) == []
    assert shapes.record_new({"shape": new}, "v-1", root)
    lib = json.loads((root / shapes.FILE).read_text(encoding="utf-8"))
    assert lib["shapes"][-1]["id"] == "the-heist" and lib["shapes"][-1]["status"] == "trial"
    assert not shapes.record_new({"shape": new}, "v-2", root)          # once
    assert any("already exists" in p for p in shapes.check_plan({"shape": new}, [], root))


def test_state_offers_the_least_used_first(tmp_path):
    root = root_with(tmp_path)
    rows = shapes.for_state([{"shape": "reveal"}, {"shape": "reveal"}], root)
    assert rows[-1]["id"] == "reveal" and rows[-1]["blocked"]


def test_two_in_three_shorts_are_big_money(tmp_path):
    fmts = [{"id": "billionaire_question", "format": "short", "tier": "core", "examples": [{"views": 10**6}]},
            {"id": "salary_breakdown", "format": "short", "tier": "low", "examples": [{"views": 10**6}]}]
    root = root_with(tmp_path, fmts=fmts)
    personal = {"story": "salary_breakdown"}
    assert formats.mix_problems(personal, [{"story": "billionaire_question"}, {"story": "billionaire_question"}], root) == []
    assert formats.mix_problems(personal, [{"story": "billionaire_question"}, {"story": "salary_breakdown"}], root)
    assert formats.mix_problems({"story": "billionaire_question"}, [{"story": "salary_breakdown"}] * 2, root) == []
