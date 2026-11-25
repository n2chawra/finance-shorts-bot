"""Credits fit YouTube's 5000-byte description (owner, 2026-11-25: a long video shipped 22,303 characters)."""
from generator import credits

BASE = "The story.\n\nBased on public records and reporting."


def commons(author: str, lic: str, n: int) -> str:
    return f"Photo: {author}, {lic}, via Wikimedia Commons (https://commons.wikimedia.org/wiki/File:Pic_({n}).jpg)"


def test_few_credits_stay_in_full_with_links():
    lines = [commons("Ann", "CC BY 4.0", 1), "DOMINOS PIZZA INC Form 10-K, filed 2018-02-20 (period 2017-12-31), SEC EDGAR (https://www.sec.gov/x)"]
    assert credits.fit(BASE, lines) == BASE + "\n\n" + "\n".join(lines)


def test_many_credits_are_grouped_under_the_budget():
    lines = [commons(f"Author {i % 40}", "CC BY-SA 4.0" if i % 2 else "CC BY 2.0", i) for i in range(150)]
    lines += [f"DOMINOS PIZZA INC Form 10-K, filed {y}-02-20 (period {y - 1}-12-31), SEC EDGAR (https://www.sec.gov/{y})" for y in (2011, 2018, 2026)]
    out = credits.fit(BASE, lines)
    assert out.startswith(BASE) and credits.size(out) <= credits.BUDGET
    assert "Photos via Wikimedia Commons, by licence: CC BY 2.0: Author 0 ×4" in out
    assert "CC BY-SA 4.0: Author 1 ×4" in out and "Author 39" in out              # every author kept
    assert "Filings from SEC EDGAR: DOMINOS PIZZA INC 10-K (2011, 2018, 2026)" in out
    assert "https://" not in out[len(BASE):]


def test_a_list_too_long_even_grouped_is_shortened_not_cut_mid_line():
    lines = [commons(f"Photographer number {i}", "CC BY 4.0", i) for i in range(400)]
    out = credits.fit(BASE, lines, budget=1500)
    assert credits.size(out) <= 1500 and out.rstrip().endswith("more")


def test_long_and_doubled_author_fields_are_trimmed():
    junk = "Donald Trung Quoc Don (Chữ Hán: 徵國單) - Wikimedia Commons - © CC BY-SA 4.0 International.(Want to use this image?) Original"
    out = credits.compact([commons(junk, "CC BY-SA 4.0", 1), commons(junk, "CC BY-SA 4.0", 2), commons("Unknown authorUnknown author", "CC0", 3)])
    assert out == ["Photos via Wikimedia Commons, by licence: CC BY-SA 4.0: Donald Trung Quoc Don ×2; CC0: Unknown author"]


def test_split_finds_the_credit_block_even_with_brackets_in_links():
    desc = BASE + "\n\n" + commons("Ann", "CC BY 4.0", 3) + "\n" + commons("Bo", "CC0", 4)
    base, lines = credits.split(desc)
    assert base == BASE and len(lines) == 2
