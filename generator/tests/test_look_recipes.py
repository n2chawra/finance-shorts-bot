"""The look-recipe rotation (generator/looks.py recipe_problems, disasters channel 2026-11-20)."""
from generator import looks

R = ["night-grid", "blueprint", "clay-studio", "chalk-site", "investigators-desk", "instrument-panel"]


def h(*recs: str) -> list[dict]:
    return [{"id": f"L-{i}", "style": {"recipe": r}} for i, r in enumerate(recs)]


def test_no_rotation_no_problem():
    assert looks.recipe_problems({}, h("blueprint"), [], 4) == []


def test_recipe_required_and_known():
    assert "must be one of" in looks.recipe_problems({}, [], R, 4)[0]
    assert "must be one of" in looks.recipe_problems({"recipe": "neon"}, [], R, 4)[0]
    assert looks.recipe_problems({"recipe": "blueprint"}, [], R, 4) == []


def test_not_one_of_last_n():
    hist = h("blueprint", "clay-studio", "chalk-site", "night-grid", "investigators-desk")
    # blueprint is 5 videos back: allowed with avoidLast 4
    assert looks.recipe_problems({"recipe": "blueprint"}, hist, R, 4) == []
    p = looks.recipe_problems({"recipe": "clay-studio"}, hist, R, 4)
    assert p and "L-1" in p[0] and "instrument-panel" in p[0] and "blueprint" in p[0]


def test_entries_without_recipe_skipped():
    hist = h("chalk-site") + [{"id": "x", "style": {}}] * 6
    assert looks.recipe_problems({"recipe": "chalk-site"}, hist, R, 4)


def test_rotation_from_pack():
    pack = {"look": {"rotation": {"recipes": R, "avoidLast": 4}}}
    assert looks.rotation(pack) == (R, 4)
    assert looks.rotation({"look": {}}) == ([], 0)


def test_disasters_pack_rotation():
    from generator import pack
    recipes, n = looks.rotation(pack.load("disasters-and-engineering-failures-expla"))
    assert len(recipes) == 10 and n == 4
