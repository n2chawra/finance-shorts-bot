"""Global first (owner, 2026-10-23): most videos are ones anyone in the world can relate to.

"Why billionaires never sell their stock" (no country, no rupees, no 401(k)) got 1,121 views while
the local Shorts got 26-349. Every plan says who it is for in `topic.reach`:

  global   understood anywhere with no local knowledge: famous people and companies, how the rich
           think and borrow, money at scale, universal mechanics (compounding, debt, inflation).
           Told in USD, with no country's tax rules, products or festivals.
  local    needs one country: an India story in rupees, a 401(k), an IRS refund, Diwali, Black Friday.

A local plan needs a reason in `topic.reach_reason`: an occasion close by
(`{"kind": "occasion", "name": "Diwali", "date": "2026-11-08"}`) or a local reference video with
1M+ views (`{"kind": "demand"}`, checked against `plan.demand.views`). And locals stay a minority:
at most LOCAL_MAX of the last WINDOW videos plus this one (about two in three global), and for
Shorts at most one local a day.

History written before this rule has no `reach`; only entries that carry one are counted.
"""
from __future__ import annotations

from datetime import date, timedelta

from . import history

REACHES = ("global", "local")
WINDOW = {"short": 10, "long": 6}
LOCAL_MAX = {"short": 4, "long": 2}     # of WINDOW + 1: at least 60% global
LOCAL_PER_DAY = {"short": 1}            # long videos are 2 a week, the window covers them
LOCAL_DEMAND_VIEWS = 1_000_000
OCCASION_BEFORE = 14                    # an occasion video may come up to two weeks early
OCCASION_AFTER = 1                      # ...and the day after


def reach_of(entry: dict) -> str | None:
    r = (entry.get("topic") or {}).get("reach")
    return r if r in REACHES else None


def counted(entries: list[dict], fmt: str) -> list[dict]:
    """The last WINDOW entries that carry a reach."""
    return [e for e in entries if reach_of(e)][-WINDOW[fmt]:]


def locals_today(entries: list[dict], today: str) -> int:
    return sum(1 for e in entries if reach_of(e) == "local" and history.ist_day(e["created_at"]) == today)


def for_state(entries: list[dict], today: str, fmt: str) -> dict:
    """What the planner may pick next."""
    window = counted(entries, fmt)
    n_local = sum(1 for e in window if reach_of(e) == "local")
    room = LOCAL_MAX[fmt] - n_local
    if fmt in LOCAL_PER_DAY:
        room = min(room, LOCAL_PER_DAY[fmt] - locals_today(entries, today))
    return {"local_allowed": room > 0,
            "recent": [reach_of(e) for e in window],
            "rule": f"about two in three videos are global (USD, no country needed); a local one needs an occasion "
                    f"within {OCCASION_BEFORE} days or a local reference with {LOCAL_DEMAND_VIEWS:,}+ views"
                    + (", at most one local Short a day" if fmt in LOCAL_PER_DAY else "")}


def check_plan(plan: dict, entries: list[dict], today: str, fmt: str) -> list[str]:
    topic = plan.get("topic") or {}
    reach = topic.get("reach")
    if reach not in REACHES:
        return ["topic.reach must be 'global' (anyone in the world can relate: the default) or 'local' (one country)"]
    out: list[str] = []
    if reach == "global":
        if plan.get("currency") != "USD":
            out.append("a global video is told in USD; rupees, pounds or euros make it local")
        return out
    why = topic.get("reach_reason")
    why = why if isinstance(why, dict) else {}
    if why.get("kind") == "occasion":
        try:
            d = date.fromisoformat(str(why.get("date")))
        except ValueError:
            d = None
        t = date.fromisoformat(today)
        if not why.get("name") or d is None:
            out.append("topic.reach_reason occasion needs a name and a date (YYYY-MM-DD)")
        elif not t - timedelta(days=OCCASION_AFTER) <= d <= t + timedelta(days=OCCASION_BEFORE):
            out.append(f"occasion {why['name']!r} on {d} is not within {OCCASION_BEFORE} days: make a global video instead")
    elif why.get("kind") == "demand":
        demand = plan.get("demand")
        views = demand.get("views") if isinstance(demand, dict) else None
        views = views if isinstance(views, int) else 0   # formats.check_plan names a missing or non-number one
        if views < LOCAL_DEMAND_VIEWS:
            out.append(f"a local video for its demand needs a reference with {LOCAL_DEMAND_VIEWS:,}+ views (has {views:,})")
    else:
        out.append("a local video needs topic.reach_reason: {\"kind\": \"occasion\", \"name\", \"date\"} or {\"kind\": \"demand\"}")
    window = counted(entries, fmt)
    n_local = sum(1 for e in window if reach_of(e) == "local") + 1
    if n_local > LOCAL_MAX[fmt]:
        out.append(f"{n_local} of the last {len(window) + 1} videos would be local (at most {LOCAL_MAX[fmt]}): make a global video")
    if fmt in LOCAL_PER_DAY and locals_today(entries, today) >= LOCAL_PER_DAY[fmt]:
        out.append("today already has a local Short: make a global one")
    return out
