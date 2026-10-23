"""When a beat's named events fire: by word, by time, or counted back from the beat's end."""
import pytest

from renderer.timeline.build import _event_time

WORDS = [("one", 0.0, 0.2), ("two", 0.3, 0.5), ("three", 0.6, 0.9)]


def test_words_by_index_and_by_text() -> None:
    assert _event_time({"word": 1}, WORDS, 0.5, 3.0, "b") == pytest.approx(0.8)
    assert _event_time({"word": "Three!"}, WORDS, 0.5, 3.0, "b") == pytest.approx(1.1)
    assert _event_time({"word": 9}, WORDS, 0.5, 3.0, "b") == pytest.approx(1.1)   # past the end: the last word


def test_negative_word_counts_from_the_end() -> None:
    assert _event_time({"word": -1}, WORDS, 0.5, 3.0, "b") == pytest.approx(1.1)
    assert _event_time({"word": -2}, WORDS, 0.5, 3.0, "b") == pytest.approx(0.8)
    assert _event_time({"word": -9}, WORDS, 0.5, 3.0, "b") == pytest.approx(0.5)   # before the start: the first word


def test_end_zero_is_the_beats_last_moment() -> None:
    assert _event_time({"end": 0}, WORDS, 0.5, 3.0, "b") == pytest.approx(3.0)
    assert _event_time({"end": 1.0}, WORDS, 0.5, 3.0, "b", tempo=2.0) == pytest.approx(2.5)


def test_unknown_spec_is_a_writer_error() -> None:
    with pytest.raises(ValueError, match="an event is"):
        _event_time({"at": 1}, WORDS, 0.5, 3.0, "b")
