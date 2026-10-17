import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
NOW = datetime(2026, 10, 13, 12, 0, tzinfo=timezone.utc)
# a rotation of four: the story template plus three of the first engine's, which old history still names
TEMPLATES = ["money_leak_meter", "myth_vs_fact", "short_story", "two_friends_race"]


def entry(i: int, template: str = "quiz_countdown", category: str = "sip", title: str | None = None, days_ago: float = 1, **style) -> dict:
    """A history entry. `i` only makes ids and wording unique."""
    return {
        "id": f"v-test-{i:02d}", "created_at": (NOW - timedelta(days=days_ago)).isoformat(), "template": template,
        "topic": {"title": title or f"Unrelated subject number {i} zebra{i}", "category": category},
        "title": f"Headline{i} about something else entirely", "description": f"Blurb{i} goes here for the video.",
        "hook_style": "myth", "cta": f"Shout{i} in the comments",
        "style": {"palette": "night", "genre": "lofi", "key": "A", "bpm": 90, **style},
    }


def make_plan(**over) -> dict:
    plan = {
        "template": "short_story", "topic": {"title": "How big a monthly SIP grows over two decades", "category": "sip"},
        "story": "future_value", "hook_style": "question", "cta": "Comment if you got it right",
        "title": "Quiz: what does a ₹10,000 SIP become in 20 years?",
        "description": "A quick SIP quiz with a surprising answer. Illustrative only. Not financial advice.",
        "hashtags": ["#Shorts", "#SIP", "#PersonalFinance"], "seed": 20,
        "style": {"palette": "forest", "genre": "acoustic", "key": "C", "bpm": 100},
    }
    return {**plan, **over}


def example(name: str) -> dict:
    return json.loads((REPO / "examples" / f"{name}.json").read_text(encoding="utf-8"))


@pytest.fixture
def root(tmp_path: Path) -> Path:
    """An empty project root: no history, default settings."""
    (tmp_path / "history").mkdir()
    (tmp_path / "videos").mkdir()
    (tmp_path / "config").mkdir()
    return tmp_path
