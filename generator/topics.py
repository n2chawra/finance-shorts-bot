"""The research topic feed: video ideas the research agent found, ready for the planner.

`improvement/research/topics.json` (written only by the research agent):

    {"topics": [{"id": "2026-10-16-sip-record-inflows", "title": "...", "category": "sip", "format": "short",
                 "kind": "news | trend | seasonal | evergreen", "priority": "breaking | trending | high | normal",
                 "templates": ["any"], "angle": "...", "why_now": "...",
                 "facts": [{"label", "value", "unit", "currency", "as_of", "source", "url"}], "verify": ["claim to check"],
                 "sources": ["https://..."], "found": "YYYY-MM-DD", "expires": "YYYY-MM-DD", "status": "new"}]}

A topic is used once: a video records it as `plan.topic.feed_id`, and history makes it unavailable
(the video run never edits the feed, so it can't conflict with the research agent's branch).
Nothing in the feed is forced on a video any more (owner reset, 2026-10-21: the channel had turned
into a news channel nobody watched). A `breaking` or `trending` topic is offered first and jumps the
upload queue when a video takes it, but the planner picks what has demand.

A video run that finds a trend itself (the midday trend run) can't add it to the feed, so it carries
it in the plan instead: `plan.topic.trend = {"id": "trend-<today>-<slug>", "why_now", "sources": [urls], "found",
"expires", "facts"?}`; a news script's `feed_id` is then the trend's id. Both kinds of urgent video ship with a manifest `priority`, which puts them at the front
of the upload queue.
"""
from datetime import date, timedelta
import math
import json
import re
from pathlib import Path

from .settings import ROOT
from .channels import cpath, rel

# one feed per format: research writes the Shorts one, scout the long one
FILES = {"short": Path("improvement") / "research" / "topics.json",
         "long": Path("improvement") / "longform" / "topics.json"}
FILE = FILES["short"]   # the Shorts feed, for messages that name it
PRIORITIES = ("breaking", "trending", "high", "normal")
URGENT = ("breaking", "trending")   # must be taken next, and jump the upload queue
TREND_DAYS = 3                       # a trend found by a video run stays urgent this long
SHOWN = 16  # topics listed to the planner, best score first
# Every unused topic competes, old or new (owner, 2026-10-24: "what if the old topics were actually
# good"): the planner sees the best by score, not the newest, and `prune` drops what is stale or weak
# so the feed doesn't pile up.
STALE_DAYS = 21     # an unused evergreen topic this old is dropped: research has had three weeks to beat it
MAX_OPEN = 30       # at most this many open topics per feed; the lowest scores go first
AGE_PENALTY = 0.03  # score lost per day since found (a 21-day-old topic loses 0.63, about a 4x smaller reference)


def _read(root: Path, fmt: str) -> list[dict]:
    path = cpath(root, FILES[fmt])
    if not path.is_file():
        return []
    return [t for t in json.loads(path.read_text(encoding="utf-8")).get("topics", []) if isinstance(t, dict) and t.get("id")]


def load(root: Path = ROOT, fmt: str = "short") -> list[dict]:
    """A format's feed. The long feed also offers the research feed's `"format": "long"` topics (2026-11-22: the
    new channels' setups put 13-18 sourced long topics there, while Studio's state read only longform/topics.json,
    which held one; research proposals long-topics-feed-gap and dd-research-topics-format-long). Scout's entry
    wins when both have the same id."""
    own = _read(root, fmt)
    if fmt != "long":
        return own
    ids = {t["id"] for t in own}
    return own + [t for t in _read(root, "short") if t.get("format") == "long" and t["id"] not in ids]


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
    if (topic.get("expires") or "9999-12-31") < today:
        return f"it expired on {topic['expires']}"
    if topic["id"] in used_ids(entries):
        return "an earlier video already used it"
    return None


DEMAND_CAP = 7.0      # log10 views: past 10M a reference proves nothing more (a 54M video must not win alone)
OURS_WEIGHT = 0.5     # how much our own results in a format move its topics, per doubling vs our median
EXPLORE = {0: 0.5, 1: 0.25}   # a format we told 0 or 1 times in the last RECENT Shorts: try it (owner, 2026-10-26)
OVERUSED = (4, -0.25)         # told this many times or more in the last RECENT: give others a turn
RECENT = 15


TIER_BONUS = 0.8      # core formats up, personal-budget (low) formats down
# Demand from breakouts (owner, 2026-11-11: "someone with millions of subscribers, any video will work because
# they have the audience... the channel with huge views and little subscribers is the right pick"): a reference
# whose views are many times its channel's subscribers proves the topic; a giant channel's ordinary video doesn't.
BREAKOUT = ((10.0, 1.0), (3.0, 0.6), (1.0, 0.0))   # views per subscriber at least -> bonus
BIG_CHANNEL_PENALTY = -0.6                           # fewer views than the channel has subscribers


def _story(topic: dict) -> str | None:
    s = topic.get("stories") or []
    return s[0] if s else topic.get("story")


def context(entries: list[dict], root: Path = ROOT) -> dict:
    """What the channel itself knows about each format: our videos' 48 h views per story relative
    to our median (metrics/videos.json + history), and how often each was told lately."""
    import statistics
    from .variety import story_of
    stories = {e["id"]: story_of(e) for e in entries if e.get("id")}
    recent: dict[str, int] = {}
    for e in entries[-RECENT:]:
        if (s := stories.get(e.get("id", ""))):
            recent[s] = recent.get(s, 0) + 1
    path = cpath(root, "metrics/videos.json")
    vids = json.loads(path.read_text(encoding="utf-8")).get("videos", []) if path.is_file() else []
    scored = [(stories.get(v["id"]), v["views48h"]) for v in vids if v.get("views48h") is not None and v.get("format", "short") == "short"]
    overall = statistics.median([x for _, x in scored]) if scored else 0
    by: dict[str, list[float]] = {}
    for s, x in scored:
        if s:
            by.setdefault(s, []).append(x)
    ours = {s: {"n": len(xs), "relative": round((statistics.median(xs) + 1) / (overall + 1), 2)} for s, xs in by.items()}
    return {"recent": recent, "ours": ours}


def breakout_of(demand) -> float | None:
    """Views per subscriber of a reference video (`demand.outlier`, or views / `demand.channelSubs`); None when unknown."""
    if not isinstance(demand, dict):
        return None
    if isinstance(demand.get("outlier"), (int, float)):
        return float(demand["outlier"])
    subs, views = demand.get("channelSubs"), demand.get("views")
    if isinstance(subs, (int, float)) and isinstance(views, (int, float)):
        return views / max(subs, 1_000)
    return None


# Traction (owner, 2026-11-19, on the tech channel: "choose topics which are gaining traction"; proposal
# tech-topic-traction-score): a reference that is rising now (views a day, research's demand.viewsPerDay and
# demand.ageDays) lifts its topic, on a log scale; a reference over a month old counts less, over 90 days not
# at all. Topics without the fields score as before.
TRACTION = [(1_000, 0.0), (10_000, 0.3), (100_000, 0.7), (300_000, 1.0)]
TRACTION_FRESH, TRACTION_STALE = 30, 90


def traction(demand: dict | None) -> float:
    import math
    d = demand or {}
    vpd, age = d.get("viewsPerDay"), d.get("ageDays")
    if not isinstance(vpd, (int, float)) or not isinstance(age, (int, float)) or vpd <= TRACTION[0][0] or age >= TRACTION_STALE:
        return 0.0
    x = math.log10(vpd)
    value = TRACTION[-1][1]
    for (a, va), (b, vb) in zip(TRACTION, TRACTION[1:]):
        if vpd <= b:
            value = va + (vb - va)*(x - math.log10(a))/(math.log10(b) - math.log10(a))
            break
    fade = 1.0 if age <= TRACTION_FRESH else (TRACTION_STALE - age)/(TRACTION_STALE - TRACTION_FRESH)
    return round(value*fade, 2)


def score_parts(topic: dict, today: str, ctx: dict | None = None) -> dict[str, float]:
    """Why a topic ranks where it does (owner, 2026-10-26: "rank on the topic too, not just views";
    "test all kinds of video"): proven demand (its reference video, capped), our own results with
    this format, a bonus for a format we haven't tried lately, priority, global, and its age."""
    import math
    views = (topic.get("demand") or {}).get("views") or 0
    if not isinstance(views, (int, float)):
        views = 0
    parts = {"demand": round(min(DEMAND_CAP, math.log10(max(views, 10_000))), 2)}
    outlier = breakout_of(topic.get("demand"))
    if outlier is not None:
        parts["breakout"] = next((b for r, b in BREAKOUT if outlier >= r), BIG_CHANNEL_PENALTY)
    if (tr := traction(topic.get("demand"))) > 0:
        parts["traction"] = tr
    parts["priority"] = {"breaking": 2.0, "trending": 2.0, "high": 0.4}.get(topic.get("priority") or "", 0.0)
    if event_problems(topic, today):   # an unproven event long topic ranks as an ordinary one
        parts["priority"] = 0.0
    parts["global"] = 0.6 if topic.get("reach") == "global" else 0.0
    story = _story(topic)
    # big money first (owner, 2026-10-30): every 1K+ Short and every subscriber came from a core format
    from . import formats
    parts["tier"] = {"core": TIER_BONUS, "low": -TIER_BONUS}.get(formats.tiers().get(story or "", ""), 0.0)
    if ctx and story:
        o = ctx["ours"].get(story)
        if o:   # shrunk toward 0 while we have few videos of it
            parts["ours"] = round(max(-1.0, min(1.0, math.log2(o["relative"]))) * OURS_WEIGHT * min(1.0, o["n"] / 3), 2)
        told = ctx["recent"].get(story, 0)
        parts["explore"] = EXPLORE.get(told, OVERUSED[1] if told >= OVERUSED[0] else 0.0)
    try:
        age = (date.fromisoformat(today) - date.fromisoformat(str(topic.get("found")))).days
    except ValueError:
        age = 0
    parts["age"] = round(-AGE_PENALTY * max(0, age), 2)
    return parts


def score(topic: dict, today: str, ctx: dict | None = None) -> float:
    return round(sum(score_parts(topic, today, ctx).values()), 2)


def prune(topics: list[dict], entries: list[dict], today: str) -> tuple[list[dict], list[str]]:
    """The feed without what can't or shouldn't be used any more, and why each one went.
    Kept always: every topic a video used (shipped videos' fact checks look them up). Dropped: an
    unused topic that expired, was rejected or expired by status, is an evergreen idea older than
    STALE_DAYS, or falls below the best MAX_OPEN open topics by score."""
    used = used_ids(entries)
    kept, gone = [], []
    for t in topics:
        if t["id"] in used:
            kept.append(t)
            continue
        why = None
        if t.get("status", "new") != "new":
            why = f"status {t.get('status')}"
        elif (t.get("expires") or "9999-12-31") < today:
            why = f"expired {t['expires']}"
        elif t.get("kind", "evergreen") == "evergreen" and t.get("found") and \
                (date.fromisoformat(today) - date.fromisoformat(t["found"])).days > STALE_DAYS:
            why = f"unused for over {STALE_DAYS} days"
        if why:
            gone.append(f"{t['id']}: {why}")
        else:
            kept.append(t)
    ctx = context(entries)
    open_ = sorted((t for t in kept if t["id"] not in used), key=lambda t: score(t, today, ctx), reverse=True)
    for t in open_[MAX_OPEN:]:
        kept.remove(t)
        gone.append(f"{t['id']}: score {score(t, today, ctx)} below the best {MAX_OPEN}")
    return kept, gone


def prune_file(entries: list[dict], today: str, root: Path = ROOT, fmt: str = "short") -> list[str]:
    """Prune one feed file in place; returns what went (empty: nothing changed)."""
    path = cpath(root, FILES[fmt])
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    kept, gone = prune([t for t in data.get("topics", []) if isinstance(t, dict) and t.get("id")], entries, today)
    if gone:
        data["topics"] = kept
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return gone


def _all_entries(root: Path = ROOT) -> list[dict]:
    from . import history
    try:
        return history.load(root)
    except (OSError, ValueError):
        return []


def too_close(topic: dict, everything: list[dict], today: str) -> str | None:
    """A video of either format (Short or long) already told this idea within the duplicate window
    (owner, 2026-10-26: the $5,000-card Short topic came back after the long video told it)."""
    from .variety import DUPLICATE_DAYS, DUPLICATE_SIMILARITY, similarity
    cutoff = (date.fromisoformat(today) - timedelta(days=DUPLICATE_DAYS)).isoformat()
    for e in everything:
        if topic.get("from_short") and e.get("id") == topic["from_short"]:
            continue     # a long topic expands its own Short: that one is never its duplicate (Scout, 2026-11-16)
        title = (e.get("topic") or {}).get("title") or ""
        if e.get("created_at", "") >= cutoff and title and similarity(topic.get("title", ""), title) > DUPLICATE_SIMILARITY:
            return e["id"]
    return None


# A figure over a year old may have been replaced by a newer release (2026-11-05: Costco's FY2025 fees were
# in the feed after FY2026 was published, and the fact reviewer failed the Short twice). Research re-checks
# such a fact and marks it `latest: true` with the day it checked (`checked`); that holds for 30 days.
FACT_FRESH_DAYS = 365
FACT_RECHECK_DAYS = 30


def _day(s: object) -> date | None:
    try:
        return date.fromisoformat(str(s)[:10])
    except ValueError:
        return None


def _as_of_end(s: object) -> date | None:
    """The last day a fact's `as_of` covers: a full date as is, "2024" as 31 Dec 2024, "2024-03" as 31 Mar,
    "2024-Q3" as 30 Sep. Research dates 1 in 8 facts by year only, which `_day` can't read, so those were
    never checked for a newer release (2027 would have let a "2025" annual figure through unchecked)."""
    if (d := _day(s)) is not None:
        return d
    m = re.fullmatch(r"(\d{4})(?:-(?:(\d{2})|Q([1-4])))?", str(s).strip())
    if not m:
        return None      # "current", "FY2025": nothing to date it by
    year, month, quarter = int(m[1]), m[2] and int(m[2]), m[3] and int(m[3])
    if quarter:
        month = quarter * 3
    if not month:
        return date(year, 12, 31)
    if not 1 <= month <= 12:
        return None
    return (date(year + month // 12, month % 12 + 1, 1)) - timedelta(days=1)


def stale_facts(topic: dict, today: str) -> list[str]:
    """Facts over a year old that research hasn't confirmed as still the latest in the last 30 days."""
    now = date.fromisoformat(today)
    out = []
    for f in topic.get("facts") or []:
        as_of = _as_of_end(f.get("as_of"))
        # a year ("hallmarking became mandatory in 2021") is history, never replaced by a newer release;
        # so is a fact research marks `fixed` (a country's area, a border's length: no yearly release)
        if as_of is None or f.get("unit") == "year" or f.get("fixed") is True or (now - as_of).days <= FACT_FRESH_DAYS:
            continue
        checked = _day(f.get("checked"))
        if f.get("latest") is True and checked and (now - checked).days <= FACT_RECHECK_DAYS:
            continue
        out.append(f"{f.get('label') or f.get('value')} (as of {f.get('as_of')})")
    return out


def blocked_reason(topic: dict, today: str, fmt: str, root: Path = ROOT) -> str | None:
    """Why an otherwise open topic can't be made now: stale facts. Nothing else.

    A long topic never needs one of our Shorts (owner, 2026-11-22). The rule that a long video must expand
    a Short with 1,000+ (4 Nov), then 100+ (12 Nov) views blocked every long topic on the new channels,
    whose Shorts had 0-25 views, and Studio runs stopped with nothing to make. `from_short` stays an
    optional link (the description points to that Short); it is never a gate, on any channel, and
    scripts/guard.py refuses a branch that brings a views gate back."""
    if (old := stale_facts(topic, today)):
        return "facts may be out of date (research must confirm the latest release): " + "; ".join(old[:3])
    return None


def fits(topic: dict, templates: list[str]) -> bool:
    """A story template tells any topic of its format, so a topic fits whenever its format has one
    enabled. (Topics written before the Remotion rebuild still name old templates; ignored.)"""
    return bool(templates)


def of_format(topics: list[dict], fmt: str) -> list[dict]:
    """Topics meant for this format. A topic without one is a Shorts topic; "any" fits both."""
    return [t for t in topics if t.get("format", "short") in (fmt, "any")]


# A recent event as a long video (owner, 2026-11-23: "if a disaster happened today, its 3D recreation is searched
# far more than a known one... but not every time, only when the opportunity is worth it"). A long topic marked
# `trending` jumps the queue only with `opportunity` proof that people are watching this event right now.
EVENT_DAYS = 14            # the event itself happened at most this long ago
EVENT_PROOF_DAYS = 7       # proof: videos on it uploaded within this many days...
EVENT_PROOF_VIEWS = 100_000   # ...one with at least this many views, or
EVENT_PROOF_BREAKOUTS = 2     # ...this many with views >= 3x their channel's subscribers
EVENT_MIN_FACTS = 3        # an official or reputable source for the figures, so the video can be true


def event_problems(topic: dict, today: str) -> list[str]:
    """Why a `trending` long topic is not (yet) worth a long video; empty when it is. Shorts keep their trend rules."""
    if topic.get("format", "short") not in ("long", "any") or topic.get("priority") not in URGENT:
        return []
    o = topic.get("opportunity")
    if not isinstance(o, dict):
        return ["no `opportunity` proof (event_date, evidence, verdict)"]
    out = []
    try:
        age = (date.fromisoformat(today) - date.fromisoformat(str(o.get("event_date")))).days
        if not 0 <= age <= EVENT_DAYS:
            out.append(f"the event is {age} days old (at most {EVENT_DAYS})")
    except ValueError:
        out.append("opportunity.event_date is not a date")
    fresh = [e for e in (o.get("evidence") or []) if isinstance(e, dict) and isinstance(e.get("views"), (int, float))
             and isinstance(e.get("age_days"), (int, float)) and e["age_days"] <= EVENT_PROOF_DAYS
             and str(e.get("url", "")).startswith("http")]
    big = any(e["views"] >= EVENT_PROOF_VIEWS for e in fresh)
    breakouts = sum(1 for e in fresh if isinstance(e.get("channelSubs"), (int, float)) and e["views"] >= 3 * max(1, e["channelSubs"]))
    if not big and breakouts < EVENT_PROOF_BREAKOUTS:
        out.append(f"no proof of demand: a video on it from the last {EVENT_PROOF_DAYS} days with {EVENT_PROOF_VIEWS:,}+ views, "
                   f"or {EVENT_PROOF_BREAKOUTS} with views at least 3x their channel's subscribers")
    if len(topic.get("facts") or []) < EVENT_MIN_FACTS:
        out.append(f"fewer than {EVENT_MIN_FACTS} sourced facts: wait until official figures are out")
    if o.get("verdict") != "worth it":
        out.append('opportunity.verdict is not "worth it"')
    return out


def is_urgent(topic: dict, today: str) -> bool:
    """Offered first and jumps the upload queue: a trend, and for a long topic only a proven event opportunity."""
    return topic.get("priority") in URGENT and not event_problems(topic, today)


def pin_of(topic: dict) -> float:
    """The owner's place for a topic in the queue (`"pin": 1` goes first); unpinned topics keep their score order."""
    p = topic.get("pin")
    return float(p) if isinstance(p, (int, float)) and not isinstance(p, bool) and p > 0 else float("inf")


def for_state(entries: list[dict], today: str, blocked: list[str], allowed: list[str], root: Path = ROOT,
              fmt: str = "short") -> dict:
    """What `state` tells the planner: the open topics, best first (`required` is always None now)."""
    everything = _all_entries(root)
    open_ = [t for t in of_format(load(root, fmt), fmt)
             if why_unavailable(t, entries, today) is None and too_close(t, everything, today) is None]
    ctx = context(entries, root)
    # every unused topic competes, old or new: best score first (urgent ones still lead)
    open_.sort(key=lambda t: score(t, today, ctx), reverse=True)
    # urgent ones still lead; then the owner's running order (2026-11-23: "start with a bang"): `pin` 1, 2, 3… lead, after urgent ones only
    open_.sort(key=lambda t: (0 if is_urgent(t, today) else 1, pin_of(t)))
    usable = [t for t in open_ if t.get("category") not in blocked and fits(t, allowed) and blocked_reason(t, today, fmt, root) is None]
    # offered first, and it still earns one extra video that day, but no plan is forced to take it
    urgent = next((t["id"] for p in URGENT for t in usable if t.get("priority") == p and is_urgent(t, today)), None)
    # usable topics first, so blocked ones never push them past the SHOWN cut
    shown = [t for t in open_ if t in usable][:SHOWN]
    shown += [t for t in open_ if t not in usable][:SHOWN - len(shown)]
    keys = ("id", "title", "category", "kind", "priority", "templates", "angle", "why_now", "facts", "verify",
            "expires", "format", "outline", "sources", "reach", "reach_reason", "stories", "currency", "demand", "hook", "maths",
            "from_short", "pin", "opportunity")   # a long topic names the Short it expands (Scout, 2026-11-05)
    return {
        "topics": [{**{k: t.get(k) for k in keys}, "score": score(t, today, ctx), "why_score": score_parts(t, today, ctx),
                    "found": t.get("found"), "usable_now": t in usable, "blocked_by": blocked_reason(t, today, fmt, root), "event_problems": event_problems(t, today) or None} for t in shown],
        "open_total": len(open_),
        "required": None,   # nothing is forced since the reset (see the module doc)
        "urgent": urgent,
    }


def check_plan(plan: dict, entries: list[dict], today: str, blocked: list[str], allowed: list[str], root: Path = ROOT,
               fmt: str = "short") -> list[str]:
    """Feed rules for a plan: a feed topic must be open.
    (A news script's sourced facts are traced to the feed by the number check.)"""
    out = []
    feed_id = (plan.get("topic") or {}).get("feed_id")
    if feed_id:
        topic = get(feed_id, root, fmt)
        if topic is None:
            out.append(f"topic.feed_id {feed_id!r} is not in {rel(root, FILES[fmt])}")
        elif (why := why_unavailable(topic, entries, today)) is not None:
            out.append(f"feed topic {feed_id!r} can't be used: {why}")
        elif (dup := too_close(topic, _all_entries(root), today)) is not None:
            out.append(f"feed topic {feed_id!r} tells the same idea as {dup} (a Short or long video within the duplicate window)")
        elif (why := blocked_reason(topic, today, fmt, root)) is not None:
            out.append(f"feed topic {feed_id!r} can't be used: {why}")
    elif (trend := (plan.get("topic") or {}).get("trend")) is not None:
        out += check_trend(trend, today)
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
        if t and is_urgent(t, date.today().isoformat()):
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
        elif not source_matches(f.get("source"), match.get("source")):
            out.append(f"facts[{i}].source must be {match.get('source')!r} as in the feed, or its start cut at a word "
                       f"or before '(' (e.g. {short_source(match.get('source'))!r})")
    return out + check_fact_inputs(script) + source_line_problems(script)


def short_source(feed: str | None) -> str:
    """The publisher's name from a feed source: no parenthetical detail and nothing from the first word with a
    digit ('Delta Air Lines (SEC 8-K, 13 Jan 2026)' → 'Delta Air Lines', 'JPMorgan Chase 2025 Form 10-K' →
    'JPMorgan Chase')."""
    head = re.split(r"\s*[(\[,;]", str(feed or ""), maxsplit=1)[0].strip(" ,;:-")
    words = head.split()
    cut = next((i for i, w in enumerate(words) if i and re.search(r"\d", w)), len(words))
    return " ".join(words[:cut]).strip(" ,;:-") or str(feed or "")


def source_matches(got: str | None, feed: str | None) -> bool:
    """A script's fact source is the feed's, or its start cut at a word boundary (at least one whole word):
    the publisher's name is the attribution, the URL stays in the fact. Since 2026-11-09: 5 Shorts in a week
    lost their source line's month off the frame edge because the feed's source was a sentence."""
    got, feed = str(got or "").strip(), str(feed or "").strip()
    if not got or not feed:
        return got == feed
    if got == feed or got == short_source(feed):
        return True
    return feed.startswith(got) and (len(feed) == len(got) or not feed[len(got)].isalnum()) and got[-1].isalnum()


# the "Data: <sources> · <month>" pill (remotion/src/studio/board.tsx): the width at which the board itself
# drops the line to its first source (maxW, the text column) at the format's minimum size; widths per
# character as in remotion/src/design/fit.ts
SOURCE_LINE_WIDTH = {"short": (930, 44), "long": (1784, 30)}


def _text_width(text: str, size: float) -> float:
    em = 0.0
    for ch in text:
        if ch == " ":
            em += 0.3
        elif ch in "MW@%mw":
            em += 0.95
        elif ch in "ijlI.,:;'!|":
            em += 0.32
        elif ch.isupper():
            em += 0.76
        elif ch.isdigit() or ch in "$₹£€":
            em += 0.66
        else:
            em += 0.62
    return em * size


def source_line_problems(script: dict) -> list[str]:
    """The source line must fit the frame with its month (a hard rule for sourced facts): a cut-off line
    loses the month, and a too-long one is dropped to its first source."""
    facts = script.get("facts") or []
    if not facts or any(not f.get("source") or not f.get("as_of") for f in facts):
        return []
    sources = list(dict.fromkeys(str(f["source"]) for f in facts))
    as_of = str(max(str(f["as_of"]) for f in facts))
    month = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()[int(as_of[5:7]) - 1] if as_of[5:7].isdigit() else "May"
    line = f"Data: {' · '.join(sources)} · {month} {as_of[:4]}"     # as renderer.timeline.build._facts writes it
    width, size = SOURCE_LINE_WIDTH.get(script.get("format", "short"), SOURCE_LINE_WIDTH["short"])
    if _text_width(line, size) <= width:
        return []
    if all(short_source(x) == x for x in sources):    # publisher names only: nothing left to cut
        return []
    return [f"the source line {line!r} is too wide for the frame ({_text_width(line, size):.0f} of {width} px at {size} px): "
            f"shorten each facts[].source to the publisher (e.g. {short_source(sources[0])!r}), one name per publisher"]


# a fact's unit suffix → how many of its base unit (a "money_million" fact of 544 is 544,000,000)
_UNIT_SCALE = {"thousand": 1e3, "lakh": 1e5, "million": 1e6, "crore": 1e7, "billion": 1e9, "trillion": 1e12}


def check_fact_inputs(script: dict) -> list[str]:
    """A calculation that starts from a real figure says so (owner, 2026-11-02: true stories with real
    figures): `"facts": {"amount": 1}` on a maths entry means its `amount` input is fact 1, and must
    equal it in base units (a percent fact is the rate as published)."""
    facts = script.get("facts") or []
    out = []
    for m in script.get("maths") or []:
        links = m.get("facts") or {}
        if not isinstance(links, dict):      # a writer's slip must come back as a note, not a traceback
            out.append(f"maths {m.get('name')!r}.facts is an object naming the input and its fact: {{\"amount\": 1}}")
            continue
        for key, n in links.items():
            if not isinstance(n, int) or not 1 <= n <= len(facts):
                out.append(f"maths {m.get('name')!r}.facts.{key}: there is no fact {n}")
                continue
            f = facts[n - 1]
            unit = str(f.get("unit", ""))
            if isinstance(f.get("value"), bool) or not isinstance(f.get("value"), (int, float)):
                out.append(f"maths {m.get('name')!r}.facts.{key}: fact {n} has no numeric value")
                continue
            want = float(f["value"]) * _UNIT_SCALE.get(unit.rsplit("_", 1)[-1], 1.0)
            got = m.get(key)
            if not isinstance(got, (int, float)) or abs(float(got) - want) > max(0.005, abs(want) * 1e-6):
                out.append(f"maths {m.get('name')!r}.{key} is {got!r} but fact {n} is {want:g} ({f.get('value')} {unit}): use the fact's value")
    return out
