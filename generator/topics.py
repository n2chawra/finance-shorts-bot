"""The research topic feed: video ideas the research agent found, ready for the planner.

`improvement/research/topics.json` (written only by the research agent):

    {"topics": [{"id": "2026-10-16-sip-record-inflows", "title": "...", "category": "sip", "format": "short",
                 "kind": "news | trend | seasonal | evergreen", "priority": "breaking | trending | high | normal",
                 "templates": ["any"], "angle": "...", "why_now": "...",
                 "facts": [{"label", "value", "unit", "currency", "as_of", "source", "url"}], "verify": ["claim to check"],
                 "sources": ["https://..."], "found": "YYYY-MM-DD", "expires": "YYYY-MM-DD", "status": "new"}]}

A topic is used once: a video records it as `plan.topic.feed_id`, and history makes it unavailable
(the video run never edits the feed, so it can't conflict with the research agent's branch).
A `breaking` topic, then a `trending` one, must be taken by the next video that can use it: news
and trends lose half their first-day views in about seven hours.

A video run that finds a trend itself (the midday trend run) can't add it to the feed, so it carries
it in the plan instead: `plan.topic.trend = {"id": "trend-<today>-<slug>", "why_now", "sources": [urls], "found",
"expires", "facts"?}`; a news script's `feed_id` is then the trend's id. Both kinds of urgent video ship with a manifest `priority`, which puts them at the front
of the upload queue.
"""
from datetime import date, timedelta
import json
from pathlib import Path

from .settings import ROOT

# one feed per format: research writes the Shorts one, scout the long one
FILES = {"short": Path("improvement") / "research" / "topics.json",
         "long": Path("improvement") / "longform" / "topics.json"}
FILE = FILES["short"]   # the Shorts feed, for messages that name it
PRIORITIES = ("breaking", "trending", "high", "normal")
URGENT = ("breaking", "trending")   # must be taken next, and jump the upload queue
TREND_DAYS = 3                       # a trend found by a video run stays urgent this long
SHOWN = 8   # topics listed to the planner


def load(root: Path = ROOT, fmt: str = "short") -> list[dict]:
    path = root / FILES[fmt]
    if not path.is_file():
        return []
    return [t for t in json.loads(path.read_text(encoding="utf-8")).get("topics", []) if isinstance(t, dict) and t.get("id")]


def get(feed_id: str, root: Path = ROOT, fmt: str | None = None) -> dict | None:
    """A topic by id. Without a format, both feeds are searched (ids are unique across them)."""
    for f in ([fmt] if fmt else list(FILES)):
        found = next((t for t in load(root, f) if t["id"] == feed_id), None)
        if found:
            return found
    return None


def used_ids(entries: list[dict]) -> set[str]:
    return {e["topic"]["feed_id"] for e in entries if isinstance(e.get("topic"), dict) and e["topic"].get("feed_id")}


def why_unavailable(topic: dict, entries: list[dict], today: str) -> str | None:
    if topic.get("status", "new") != "new":
        return f"its status is {topic.get('status')!r}"
    if topic.get("expires", "9999-12-31") < today:
        return f"it expired on {topic['expires']}"
    if topic["id"] in used_ids(entries):
        return "an earlier video already used it"
    return None


def fits(topic: dict, templates: list[str]) -> bool:
    """A story template tells any topic of its format, so a topic fits whenever its format has one
    enabled. (Topics written before the Remotion rebuild still name old templates; ignored.)"""
    return bool(templates)


def of_format(topics: list[dict], fmt: str) -> list[dict]:
    """Topics meant for this format. A topic without one is a Shorts topic; "any" fits both."""
    return [t for t in topics if t.get("format", "short") in (fmt, "any")]


def for_state(entries: list[dict], today: str, blocked: list[str], allowed: list[str], root: Path = ROOT,
              fmt: str = "short") -> dict:
    """What `state` tells the planner: the open topics, best first, and a breaking one it must use."""
    open_ = [t for t in of_format(load(root, fmt), fmt) if why_unavailable(t, entries, today) is None]
    open_.sort(key=lambda t: t.get("found", ""), reverse=True)   # newest first within a priority (stable sorts)
    open_.sort(key=lambda t: PRIORITIES.index(t["priority"]) if t.get("priority") in PRIORITIES else len(PRIORITIES) - 1)
    usable = [t for t in open_ if t.get("category") not in blocked and fits(t, allowed)]
    required = next((t["id"] for p in URGENT for t in usable if t.get("priority") == p), None)
    keys = ("id", "title", "category", "kind", "priority", "templates", "angle", "why_now", "facts", "verify",
            "expires", "format", "outline", "sources")
    return {
        "topics": [{**{k: t.get(k) for k in keys}, "usable_now": t in usable} for t in open_[:SHOWN]],
        "required": required,
    }


def check_plan(plan: dict, entries: list[dict], today: str, blocked: list[str], allowed: list[str], root: Path = ROOT,
               fmt: str = "short") -> list[str]:
    """Feed rules for a plan: a feed topic must be open, and a usable breaking topic must be taken.
    (A news script's sourced facts are traced to the feed by the number check.)"""
    out = []
    feed_id = (plan.get("topic") or {}).get("feed_id")
    if feed_id:
        topic = get(feed_id, root, fmt)
        if topic is None:
            out.append(f"topic.feed_id {feed_id!r} is not in {FILES[fmt].as_posix()}")
        elif (why := why_unavailable(topic, entries, today)) is not None:
            out.append(f"feed topic {feed_id!r} can't be used: {why}")
    elif (trend := (plan.get("topic") or {}).get("trend")) is not None:
        out += check_trend(trend, today)
    required = for_state(entries, today, blocked, allowed, root, fmt)["required"]
    if required and feed_id != required:
        level = (get(required, root, fmt) or {}).get("priority", "breaking")
        out.append(f"{level} feed topic {required!r} is waiting and fits an allowed template: this video must use it")
    return out


def check_trend(trend: dict, today: str) -> list[str]:
    """A trend a video run found itself must show where it came from and stay short-lived."""
    out = []
    if not str(trend.get("id", "")).startswith(f"trend-{today}-"):
        out.append(f"topic.trend.id must be 'trend-{today}-<short-slug>'")
    if not trend.get("why_now"):
        out.append("topic.trend.why_now must say what is happening now")
    sources = trend.get("sources") or []
    if not sources or not all(isinstance(u, str) and u.startswith("http") for u in sources):
        out.append("topic.trend.sources must list the URLs that show the trend")
    latest = (date.fromisoformat(today) + timedelta(days=TREND_DAYS)).isoformat()
    if not trend.get("expires") or not today <= trend["expires"] <= latest:
        out.append(f"topic.trend.expires must be between {today} and {latest}")
    return out


def urgency(plan: dict, root: Path = ROOT) -> dict | None:
    """The manifest `priority` for an urgent video ({level, until}), or None for an ordinary one."""
    topic = plan.get("topic") or {}
    if topic.get("feed_id"):
        t = get(topic["feed_id"], root)
        if t and t.get("priority") in URGENT:
            return {"level": t["priority"], "until": t.get("expires") or ""}
    elif topic.get("trend"):
        return {"level": "trending", "until": topic["trend"].get("expires", "")}
    return None


def source_topic(plan: dict, root: Path = ROOT) -> dict | None:
    """Where a plan's sourced facts come from: its feed topic, or the trend it carries."""
    topic = plan.get("topic") or {}
    if topic.get("feed_id"):
        return get(topic["feed_id"], root)
    return topic.get("trend")


def check_facts(script: dict, topic: dict | None) -> list[str]:
    """A news script's facts must be the feed topic's facts, unchanged (labels may be shortened)."""
    facts = script.get("facts")
    if facts is None:
        return []
    if topic is None:
        return [f"feed topic {script.get('feed_id')!r} not found, so the facts can't be traced to a source"]
    feed = topic.get("facts") or []
    out = []
    for i, f in enumerate(facts):
        match = next((g for g in feed if all(g.get(k) == f.get(k) for k in ("value", "unit", "currency", "as_of", "url"))), None)
        if match is None:
            out.append(f"facts[{i}] ({f.get('value')} {f.get('unit')}, {f.get('as_of')}) is not one of the feed topic's facts; copy them exactly")
        elif match.get("source") != f.get("source"):
            out.append(f"facts[{i}].source must be {match.get('source')!r} as in the feed")
    return out
