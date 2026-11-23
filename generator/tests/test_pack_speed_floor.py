"""No channel's narrator is slow (owner notes on three channels, 2026-11-23)."""
from generator import pack


def test_a_slow_channel_speed_is_raised_to_the_floor(monkeypatch):
    monkeypatch.setattr(pack, "load", lambda slug=None, root=None: {"voiceSpeed": {"short": 0.92, "long": 0.97}})
    assert pack.voice_speed("short", "some-channel") == pack.MIN_SPEED["short"]
    assert pack.voice_speed("long", "some-channel") == pack.MIN_SPEED["long"]
    monkeypatch.setattr(pack, "load", lambda slug=None, root=None: {"voiceSpeed": {"short": 1.35}})
    assert pack.voice_speed("short", "some-channel") == 1.35          # faster stays
    assert pack.voice_speed("long", "some-channel") is None           # none: the platform default
