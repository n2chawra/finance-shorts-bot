import pytest


@pytest.fixture(autouse=True)
def packless(monkeypatch: pytest.MonkeyPatch) -> None:
    """The renderer's tests check the platform's built-in values (sounds, genres, pace): a channel with no
    pack (no channels/<slug>/channel.json), as channel #1 was before it was deleted (2026-11-23), so no real
    channel's pack applies. A test about a channel's own pack sets CHANNEL itself."""
    monkeypatch.setenv("CHANNEL", "packless-test-channel")
