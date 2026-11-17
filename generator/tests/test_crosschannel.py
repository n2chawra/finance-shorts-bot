"""A plan too close to another channel's recent video fails; channel #1 alone is checked as before."""
import json
from datetime import datetime, timezone

from generator import crosschannel

NOW = datetime(2026, 11, 20, tzinfo=timezone.utc)


def history(root, slug, entries):
    d = root / "channels" / slug / "history"
    d.mkdir(parents=True, exist_ok=True)
    (d / "history.json").write_text(json.dumps(entries), encoding="utf-8")


def test_another_channels_recent_video_blocks_a_close_plan(tmp_path):
    history(tmp_path, "paisa-panchayat", [])
    history(tmp_path, "space-facts", [{"id": "v-20261118-01", "created_at": "2026-11-18T04:00:00+05:30", "title": "How much did the James Webb telescope cost?", "topic": {"title": "James Webb telescope cost"}}])
    close = {"title": "How much did the James Webb space telescope cost?", "topic": {"title": "James Webb telescope price"}}
    far = {"title": "Why Costco sells hot dogs for $1.50", "topic": {"title": "Costco hot dog price"}}
    assert crosschannel.problems(close, tmp_path, "paisa-panchayat", NOW)
    assert crosschannel.problems(far, tmp_path, "paisa-panchayat", NOW) == []


def test_old_videos_and_the_channels_own_history_dont_count(tmp_path):
    entry = {"id": "v-20261001-01", "created_at": "2026-10-01T04:00:00+05:30", "title": "How much did the James Webb telescope cost?"}
    history(tmp_path, "space-facts", [entry])
    history(tmp_path, "paisa-panchayat", [{**entry, "created_at": "2026-11-19T04:00:00+05:30"}])
    plan = {"title": "How much did the James Webb telescope cost?"}
    assert crosschannel.problems(plan, tmp_path, "paisa-panchayat", NOW) == []   # theirs is 50 days old; ours is our own


def test_one_channel_has_nothing_to_compare(tmp_path):
    history(tmp_path, "paisa-panchayat", [{"id": "v-1", "created_at": "2026-11-19T04:00:00+05:30", "title": "x"}])
    assert crosschannel.recent_elsewhere(tmp_path, "paisa-panchayat", NOW) == []
