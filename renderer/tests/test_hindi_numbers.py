"""Figures spoken in Hindi for a Hindi channel (India Maps); English channels unchanged. No model needed."""
import pytest

from renderer.engine import voice
from renderer.engine.hindi_numbers import _TO_99, hindi_number_words, hindi_year, spoken_hindi


@pytest.mark.parametrize("n, said", [
    (0, "शून्य"), (5, "पाँच"), (11, "ग्यारह"), (19, "उन्नीस"), (21, "इक्कीस"), (29, "उनतीस"), (35, "पैंतीस"),
    (39, "उनतालीस"), (44, "चवालीस"), (49, "उनचास"), (56, "छप्पन"), (60, "साठ"), (67, "सड़सठ"),
    (79, "उन्यासी"), (89, "नवासी"), (99, "निन्यानवे"),
    (100, "एक सौ"), (999, "नौ सौ निन्यानवे"), (1_000, "एक हज़ार"), (1_00_000, "एक लाख"),
    (1_00_00_000, "एक करोड़"), (4_300, "चार हज़ार तीन सौ"), (28_50_000, "अट्ठाईस लाख पचास हज़ार"),
    (1_40_00_00_000, "एक सौ चालीस करोड़"),
])
def test_hindi_number_words(n: int, said: str) -> None:
    assert hindi_number_words(n) == said


def test_the_0_to_99_table_is_whole_and_devanagari() -> None:
    assert len(_TO_99) == 100 == len(set(_TO_99))
    assert all(all("ऀ" <= ch <= "ॿ" for ch in w) for w in _TO_99)


@pytest.mark.parametrize("y, said", [(1956, "उन्नीस सौ छप्पन"), (2014, "दो हज़ार चौदह"), (1947, "उन्नीस सौ सैंतालीस"),
                                     (1900, "उन्नीस सौ"), (2000, "दो हज़ार")])
def test_years_are_read_the_hindi_way(y: int, said: str) -> None:
    assert hindi_year(y) == said
    assert spoken_hindi(str(y)) == said


@pytest.mark.parametrize("display, said", [
    ("12.5", "बारह दशमलव पाँच"), ("4,300 km", "चार हज़ार तीन सौ किलोमीटर"),
    ("1,12,077 km²", "एक लाख बारह हज़ार सतहत्तर वर्ग किलोमीटर"), ("2,500 km2", "दो हज़ार पाँच सौ वर्ग किलोमीटर"),
    ("12%", "बारह प्रतिशत"), ("8,848 m", "आठ हज़ार आठ सौ अड़तालीस मीटर"), ("3.5 Cr people", "तीन दशमलव पाँच करोड़ लोग"),
    ("60 lakh", "साठ लाख"), ("₹12.4 L", "बारह दशमलव चार लाख रुपये"), ("$1.2M", "बारह लाख डॉलर"),
    ("2.5B", "दो सौ पचास करोड़"), ("-5", "माइनस पाँच"), ("29", "उनतीस"),
])
def test_figures_are_spoken_in_hindi(display: str, said: str) -> None:
    assert voice.spoken(display, "USD", "hi") == said


def test_a_hindi_line_gets_hindi_figures() -> None:
    line = voice.fill_lines({"x": "साल {year} में"}, ["x"], {"year": "1956"}, lang="hi")["x"]
    assert line == "साल उन्नीस सौ छप्पन में"
    with pytest.raises(ValueError, match="typed number"):
        voice.fill_lines({"x": "साल १९५६ में"}, ["x"], {}, lang="hi")


@pytest.mark.parametrize("display, currency", [("1956", "USD"), ("2014", "USD"), ("4,300 km", "USD"), ("12%", "USD"),
                                               ("$1.2M", "USD"), ("₹12.4 L", "INR"), ("99.9", "INR")])
def test_english_channels_are_unchanged(display: str, currency: str) -> None:
    said = voice.spoken(display, currency)
    assert said == voice.spoken(display, currency, "en-us") == voice.spoken(display, currency, "en-gb")
    assert said.isascii()
    assert voice.spoken("1956", "USD") == "nineteen fifty six" and voice.spoken("2014", "USD") == "twenty fourteen"


def _stream(*words: str) -> list[tuple[str, float, float]]:
    """A phoneme stream, 0.1 s a phoneme; "|" stands for a word break (" ")."""
    out, t = [], 0.0
    for w in words:
        for p in w:
            out.append((" " if p == "|" else p, t, t + 0.1))
            t += 0.1
    return out


def test_hindi_word_timings_survive_a_batch_join_without_a_space() -> None:
    """Kokoro joins two batches with no " " after a "?" ("hɛː?sˈaːl" for "है? साल"): for Hindi the
    stop ends the word, so every word keeps its own timing instead of an even spread."""
    text = "क्यों है? साल उन्नीस"
    phon = _stream("kjõ|hɛː?saːl|ʊnniːs")
    words = voice.words_from_phonemes(text, phon, "hi")
    assert [w for w, _, _ in words] == text.split()
    assert [(round(a, 1), round(b, 1)) for _, a, b in words] == [(0.0, 0.3), (0.4, 0.7), (0.8, 1.2), (1.3, 1.9)]
    assert all(b > a for _, a, b in words) and all(words[i][1] >= words[i - 1][2] for i in range(1, len(words)))


def test_english_word_timings_are_unchanged() -> None:
    text = "Why is it? Nobody knows"
    joined = _stream("waɪ|ɪz|ɪt?noʊbədi|noʊz")          # the same join: English keeps its old even spread
    assert voice.words_from_phonemes(text, joined) == voice.words_from_phonemes(text, joined, "en-us")
    spread = voice.words_from_phonemes(text, joined)
    assert len({round(b - a, 6) for _, a, b in spread}) == 1
    clean = _stream("waɪ|ɪz|ɪt?|noʊbədi|noʊz")
    assert [(round(a, 1), round(b, 1)) for _, a, b in voice.words_from_phonemes(text, clean)] == \
        [(0.0, 0.3), (0.4, 0.6), (0.7, 0.9), (1.1, 1.8), (1.9, 2.3)]


def test_a_long_hindi_line_is_spoken_in_runs_of_sentences() -> None:
    line = "पहला वाक्य यहाँ है। दूसरा वाक्य? तीसरा वाक्य भी है!"
    assert voice.hindi_chunks(line, 20) == ["पहला वाक्य यहाँ है।", "दूसरा वाक्य?", "तीसरा वाक्य भी है!"]
    assert voice.hindi_chunks(line) == [line]
    assert " ".join(voice.hindi_chunks(line, 35)).split() == line.split()
