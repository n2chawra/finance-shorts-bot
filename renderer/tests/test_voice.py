"""The offline voice: figures read the Indian way, line rules and the voice pick. No model needed."""
import pytest

from renderer.engine import voice

@pytest.mark.parametrize("display, said", [
    ("₹12.4 L", "twelve point four lakh rupees"), ("₹2.30 Cr", "two point three crore rupees"),
    ("₹6 Lakh", "six lakh rupees"), ("₹15,00,000", "fifteen lakh rupees"), ("₹10,000", "ten thousand rupees"),
    ("₹83,859", "eighty three thousand eight hundred fifty nine rupees"), ("₹99.9 L", "ninety nine point nine lakh rupees"),
    ("12%", "twelve percent"), ("2.4×", "two point four times"), ("20", "twenty"), ("Rahul", "Rahul"),
])
def test_figures_are_read_the_indian_way(display: str, said: str) -> None:
    assert voice.spoken(display) == said


@pytest.mark.parametrize("n, said", [(0, "zero"), (7, "seven"), (45, "forty five"), (100, "one hundred"),
                                     (2_800, "two thousand eight hundred"), (33_600, "thirty three thousand six hundred"),
                                     (1_50_000, "one lakh fifty thousand"), (2_30_00_000, "two crore thirty lakh")])
def test_number_words(n: int, said: str) -> None:
    assert voice.number_words(n) == said


@pytest.mark.parametrize("line, error", [
    ("Only 5 people know this", "typed number"),
    ("Save ₹ now", "typed number"),
    ("Hi {nope}", "bad placeholder"),
])
def test_bad_lines_are_rejected(line: str, error: str) -> None:
    with pytest.raises(ValueError, match=error):
        voice.fill_lines({"x": line}, ["x"], {"amount": "₹10,000"})


def test_lines_get_spoken_figures() -> None:
    assert voice.fill_lines({"x": "Just {amount} a month."}, ["x"], {"amount": "₹10,000"})["x"] == "Just ten thousand rupees a month."

def test_examples_pass_the_script_check() -> None:
    from pathlib import Path
    import json
    from renderer.timeline.build import check_script
    for f in sorted((Path(__file__).resolve().parents[2] / "examples").glob("*.json")):
        check_script(json.loads(f.read_text(encoding="utf-8")))


def test_a_negative_figure_is_read_as_minus() -> None:
    from renderer.engine.voice import spoken
    assert spoken("-$19,470", "USD") == "minus nineteen thousand four hundred seventy dollars"
    assert spoken("-₹15.0 L") == "minus fifteen lakh rupees"
