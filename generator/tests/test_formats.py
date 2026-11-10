"""Plans tell a format with proven demand (owner reset, 2026-10-21)."""
import json
from pathlib import Path

from generator import formats

from .conftest import make_plan

REPO = Path(__file__).resolve().parents[2]


def put(root: Path) -> None:
    (root / formats.FILE).parent.mkdir(parents=True, exist_ok=True)
    (root / formats.FILE).write_text(json.dumps({"formats": [
        {"id": "rich_vs_poor", "format": "short", "hook": "h", "beats": "b", "examples": [{"title": "t", "views": 8800000}]},
        {"id": "list_explained", "format": "long", "examples": []}]}), encoding="utf-8")


def test_a_plan_names_a_short_format_and_its_demand(root: Path) -> None:
    put(root)
    plan = make_plan(story="rich_vs_poor", demand={"title": "rich vs poor parents buying you a car", "views": 8800000, "url": "u"})
    assert formats.check_plan(plan, root) == []
    assert any("story must be a short format" in p for p in formats.check_plan({**plan, "story": "rule_change"}, root))
    assert any("story must be a short format" in p for p in formats.check_plan({**plan, "story": "list_explained"}, root))   # a long format
    assert any("needs `demand`" in p for p in formats.check_plan({**plan, "demand": None}, root))
    assert any("under 100,000" in p for p in formats.check_plan({**plan, "demand": {"title": "x", "views": 900}}, root))


def test_no_formats_file_means_no_format_rule(root: Path) -> None:
    assert formats.check_plan(make_plan(), root) == []


def test_state_shows_each_format_with_its_best_example(root: Path) -> None:
    put(root)
    [f] = formats.for_state(root, "short")
    assert f["id"] == "rich_vs_poor" and f["best_example"]["views"] == 8800000


def test_the_repo_formats_are_well_formed() -> None:
    """Every format id is a story the variety rules know, and every short format shows demand."""
    from generator.variety import STORIES
    for fmt in ("short", "long"):
        for f in formats.load(REPO, fmt):
            assert f["id"] in STORIES, f["id"]
            assert f.get("hook") and f.get("beats") and f.get("examples"), f["id"]
    assert formats.ids(REPO, "short") and formats.ids(REPO, "long")


def test_a_format_below_the_demand_floor_is_not_offered(root: Path) -> None:
    """A format whose best example is under MIN_VIEWS can't pass check_plan, so the planner never sees it."""
    (root / formats.FILE).parent.mkdir(parents=True, exist_ok=True)
    (root / formats.FILE).write_text(json.dumps({"formats": [
        {"id": "rich_vs_poor", "format": "short", "hook": "h", "beats": "b", "examples": [{"title": "t", "views": 8800000}]},
        {"id": "cost_of_habit", "format": "short", "hook": "h", "beats": "b", "examples": [{"title": "ours", "views": 284}]}]}),
        encoding="utf-8")
    assert [f["id"] for f in formats.for_state(root, "short")] == ["rich_vs_poor"]
    assert formats.ids(root, "short") == ["rich_vs_poor"]
    plan = make_plan(story="cost_of_habit", demand={"title": "t", "views": 8800000, "url": "u"})
    assert any("no reference video with 100,000+ views" in p for p in formats.check_plan(plan, root))
    assert formats.check_plan({**plan, "story": "rich_vs_poor"}, root) == []


def test_a_short_names_its_subject_in_the_description_and_a_hashtag() -> None:
    """Owner, 2026-11-10: a plain title hid Elon; the description and hashtags must still say who it is about."""
    plan = make_plan(subject="Elon Musk", title="The biggest pay deal ever comes with a lock",
                     description="Was the record pay deal really cash?\nIllustrative only. Not financial advice.",
                     hashtags=["#Shorts", "#Tesla", "#Money"])
    problems = formats.subject_problems(plan)
    assert any("description's first two lines" in p for p in problems)
    assert any("#ElonMusk" in p for p in problems)
    fixed = {**plan, "description": "Was Elon Musk's record pay deal really cash?\nIllustrative only. Not financial advice.",
             "hashtags": ["#Shorts", "#ElonMusk", "#Money"]}
    assert formats.subject_problems(fixed) == []
    assert formats.subject_problems({**plan, "subject": ""}) == []
    no_key = {k: v for k, v in plan.items() if k != "subject"}
    assert any("plan needs `subject`" in p for p in formats.subject_problems(no_key))
    # a famous name in the description's second line counts too
    assert formats.subject_problems({**fixed, "description": "Was the pay deal cash?\nMusk's shares open on targets."}) == []
