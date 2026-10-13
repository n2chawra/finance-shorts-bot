import pytest

from renderer.engine.formatting import axis_label, group_indian, inr, inr_long, rupees, times


@pytest.mark.parametrize("n, expected", [
    (0, "0"),
    (999, "999"),
    (1000, "1,000"),
    (99999, "99,999"),
    (100000, "1,00,000"),
    (1500000, "15,00,000"),
    (12345678, "1,23,45,678"),
    (1234567890, "1,23,45,67,890"),
    (-250000, "-2,50,000"),
])
def test_group_indian(n: int, expected: str) -> None:
    assert group_indian(n) == expected


def test_rupees_rounds_to_whole() -> None:
    assert rupees(5000) == "₹5,000"
    assert rupees(600000) == "₹6,00,000"
    assert rupees(1499999.6) == "₹15,00,000"


@pytest.mark.parametrize("x, expected", [
    (0, "₹0"),
    (5000, "₹5,000"),
    (99999, "₹99,999"),
    (100000, "₹1.0 L"),
    (600000, "₹6.0 L"),
    (9490000, "₹94.9 L"),
    (10000000, "₹1.00 Cr"),
    (23000000, "₹2.30 Cr"),
    (1234500000, "₹123.45 Cr"),
])
def test_inr(x: float, expected: str) -> None:
    assert inr(x) == expected


def test_inr_long_drops_trailing_zeros() -> None:
    assert inr_long(600000) == "₹6 Lakh"
    assert inr_long(1500000) == "₹15 Lakh"
    assert inr_long(9490000) == "₹94.9 Lakh"
    assert inr_long(23000000) == "₹2.3 Crore"
    assert inr_long(9999000) == "₹1 Crore"
    assert inr_long(5000) == "₹5,000"


def test_axis_label_and_times() -> None:
    assert [axis_label(v) for v in (0, 50000, 5e6, 1e7, 1.5e7)] == ["0", "50K", "50 L", "1 Cr", "1.5 Cr"]
    assert times(2.5) == "2.5×"
    assert times(2.4166) == "2.4×"


def test_inr_unit_boundaries_roll_over() -> None:
    assert inr(99999.7) == "₹1.0 L"       # not ₹1,00,000
    assert inr(9999000) == "₹1.00 Cr"     # not ₹100.0 L
