"""The channel went global on 2026-10-18: scripts name a currency, rupee scripts keep lakh/crore."""
import pytest

from generator import numbers
from renderer.engine import voice
from renderer.engine.formatting import Money, fact_value, money_for
from renderer.models import maths


def test_dollars_use_international_grouping_and_millions() -> None:
    usd = Money("USD")
    assert [usd.full(1_234_567), usd.short(1_234_567), usd.long(1_234_567)] == ["$1,234,567", "$1.2M", "$1.2 million"]
    assert [usd.short(12_500), usd.short(999_950_000), usd.long(2.3456e9)] == ["$12,500", "$1.00B", "$2.35 billion"]
    assert [usd.axis(v) for v in (0, 5_000, 1.5e6, 2e9)] == ["0", "5K", "1.5M", "2B"]
    assert Money("GBP").short(2.5e6) == "£2.5M" and Money("EUR").full(1500) == "€1,500"


def test_rupees_and_old_scripts_are_unchanged() -> None:
    assert money_for({}).currency == "INR"
    assert [Money("INR").short(1.5e6), Money("INR").full(1.5e6)] == ["₹15.0 L", "₹15,00,000"]
    with pytest.raises(ValueError, match="currency must be one of"):
        money_for({"currency": "JPY"})


def test_facts_in_any_currency() -> None:
    assert fact_value(2.1, "money_trillion", "USD") == "$2.1T"
    assert fact_value(340, "count_million", "USD") == "340M"
    assert fact_value(4_500_000, "count", "USD") == "4,500,000"
    assert fact_value(4_500_000, "count") == "45,00,000"
    assert fact_value(31781, "rupees_crore", "USD") == "₹31,781 Cr"     # a rupee unit is always rupees


def test_the_voice_reads_each_currency() -> None:
    assert voice.spoken("$1.2M", "USD") == "one point two million dollars"
    assert voice.spoken("£12,500", "GBP") == "twelve thousand five hundred pounds"
    assert voice.spoken("2,500,000", "USD") == "two million five hundred thousand"
    assert voice.spoken("₹12.4 L", "INR") == "twelve point four lakh rupees"
    with pytest.raises(ValueError, match="typed number"):
        voice.fill_lines({"x": "It costs $5."}, ["x"], {}, currency="USD")


def test_maths_and_the_number_check_agree_in_dollars() -> None:
    sip = {"name": "plan", "kind": "sip", "monthly": 500, "rate_pct": 10, "years": 30}
    figs = maths.placeholders(maths.compute([sip], Money("USD")))
    assert figs["plan_amount"] == "$500" and figs["plan_final"].startswith("$") and figs["plan_final"].endswith("M")
    script = {"template": "short_story", "format": "short", "seed": 1, "currency": "USD", "maths": [sip],
              "beats": [{"id": "a", "scene": "bignumber", "say": "It becomes {plan_final}.", "params": {"t": "{plan_final}"}},
                        {"id": "z", "scene": "end", "params": {}}]}
    passed, notes = numbers.number_check(script)
    assert passed, notes
    plan = {"template": "short_story", "seed": 1, "style": None, "title": f"$500 a month becomes {figs['plan_final']}",
            "description": "Invest $500 for 30 years.", "hashtags": [], "topic": {}}
    assert numbers.number_check({**script, "style": None}, plan)[0]
    bad = {**plan, "title": "$500 a month becomes $9 million"}
    assert any("$9 million" in n for n in numbers.number_check({**script, "style": None}, bad)[1])
