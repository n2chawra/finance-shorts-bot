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


def test_fact_value_rounds_before_splitting_decimals() -> None:
    from renderer.engine.formatting import fact_value
    assert fact_value(9.996, "count_crore") == "10 Cr"           # not "9. Cr"
    assert fact_value(12.999, "rupees_lakh") == "₹13 L"
    assert fact_value(1.005, "count") in ("1", "1.01")
    assert fact_value(-0.5, "count") == "-0.5"                   # the sign survives
    assert fact_value(31781, "rupees_crore") == "₹31,781 Cr"
    assert fact_value(123456.75, "rupees") == "₹1,23,456.75"


@pytest.mark.parametrize("currency, x, full, short, long", [
    ("USD", -19470.3, "-$19,470", "-$19,470", "-$19,470"),
    ("GBP", -1.5e6, "-£1,500,000", "-£1.5M", "-£1.5 million"),
    ("INR", -1.5e6, "-₹15,00,000", "-₹15.0 L", "-₹15 Lakh"),
    ("INR", -2.3e7, "-₹2,30,00,000", "-₹2.30 Cr", "-₹2.3 Crore"),
    ("USD", -0.4, "$0", "$0", "$0"),
])
def test_a_negative_amount_puts_its_sign_before_the_currency(currency, x, full, short, long) -> None:
    from renderer.engine.formatting import Money
    m = Money(currency)
    assert (m.full(x), m.short(x), m.long(x)) == (full, short, long)


def test_a_falling_value_shows_its_loss_with_the_sign_first() -> None:
    from renderer.engine.formatting import Money
    from renderer.models.maths import compute
    car = compute([{"name": "car", "kind": "lumpsum", "amount": 35000, "rate_pct": -15, "years": 5}], Money("USD"))["car"]
    assert car["figures"]["gains"] == "-$19,470" and car["figures"]["final"] == "$15,530"


@pytest.mark.parametrize("currency, x, short, long, axis", [
    ("USD", 1e12, "$1.00T", "$1 trillion", "1T"),
    ("USD", 2.5e12, "$2.50T", "$2.5 trillion", "2.5T"),
    ("USD", 999_995_000_000, "$1.00T", "$1 trillion", "999.995B"),   # never '$1000.00B'
    ("USD", 999_994_999_999, "$999.99B", "$999.99 billion", "999.995B"),
    ("INR", 1e12, "₹1,00,000 Cr", "₹1,00,000 Crore", "1 L Cr"),       # a lakh crore, not '₹100000.00 Cr'
    ("INR", 2.5e12, "₹2,50,000 Cr", "₹2,50,000 Crore", "2.5 L Cr"),
])
def test_a_trillion_and_a_lakh_crore(currency, x, short, long, axis) -> None:
    from renderer.engine.formatting import Money
    m = Money(currency)
    assert (m.short(x), m.long(x), m.axis(x)) == (short, long, axis)


def test_a_trillion_is_spoken_as_one() -> None:
    from renderer.engine.formatting import Money, count
    from renderer.engine.voice import spoken
    assert spoken(Money("USD").short(2.5e12), "USD") == "two point five trillion dollars"
    assert spoken(Money("INR").short(1e12), "INR") == "one lakh crore rupees"
    assert count(1.2e12) == "1.2T" and spoken(count(1.2e12), "USD") == "one point two trillion"
