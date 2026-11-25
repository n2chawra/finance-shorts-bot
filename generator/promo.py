"""Promo Shorts: a channel whose Shorts only promote its long videos (owner, 2026-11-25, Disaster Desk).

The owner: "shorts only the promo of the long video" — two promo Shorts per long video, each a different
moment of it, so the Shorts feed (89% of the channel's views) sends viewers to the long videos. A channel
turns it on in `channel.json`:

    "cadence": {"promoOnly": true, "promoShortPerLong": 2}

Then every Short names the long video it promotes (`plan.promo_of`, an `L-` id from this channel's history)
and tells that long video's story from its feed topic (`topic.feed_id` = the long's), so its sourced facts are
the long's. `state` lists the long videos that still need a promo (`promo.targets`): every long gets its first
promo before any gets a second, newest first. The variety rules treat the promo and its long video, and two
promos of one long video, as one story (no duplicate-topic or category clash between them); every other rule
(title openings and shapes, look, music, hook) still applies. The publisher sends a promo only once its long
video is on YouTube and puts the long video's link in the Short's description (workers/lib/publishing.ts
`pickPromo`); the owner sets the related video in YouTube Studio, which the API can't.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from . import pack
from .settings import ROOT

WINDOW_DAYS = 10   # a long video older than this gets no new promo: the publisher stops sending its promos after 7 days


def config(root: Path = ROOT) -> dict:
    """{"on": bool, "per_long": int} from the channel's pack."""
    c = pack.load(root=root).get("cadence") or {}
    per = c.get("promoShortPerLong")
    return {"on": c.get("promoOnly") is True, "per_long": per if isinstance(per, int) and per > 0 else 1}


def enabled(root: Path = ROOT) -> bool:
    return config(root)["on"]


def promos_of(long_id: str, everything: list[dict]) -> list[dict]:
    """The Shorts already shipped as promos of a long video."""
    return [e for e in everything if e.get("format", "short") == "short" and e.get("promo_of") == long_id]


def kin(plan_or_entry: dict) -> str | None:
    """The long video a promo belongs to (None for any other video)."""
    p = plan_or_entry.get("promo_of")
    return p if isinstance(p, str) and p else None


def related(entry: dict, promo_of: str | None) -> bool:
    """Whether a history entry is the plan's own long video or another promo of it: one story, not a duplicate."""
    return bool(promo_of) and (entry.get("id") == promo_of or entry.get("promo_of") == promo_of)


def targets(everything: list[dict], now: datetime, root: Path = ROOT) -> list[dict]:
    """Long videos that still need a promo Short: shipped in the last WINDOW_DAYS with fewer than `per_long`
    promos. First promos before second ones, newest long video first."""
    per = config(root)["per_long"]
    cutoff = (now - timedelta(days=WINDOW_DAYS)).isoformat()
    out = []
    for e in everything:
        if e.get("format") != "long" or e.get("created_at", "") < cutoff:
            continue
        made = promos_of(e["id"], everything)
        if len(made) >= per:
            continue
        topic = e.get("topic") or {}
        out.append({"id": e["id"], "title": e.get("title"), "created_at": e.get("created_at"),
                    "feed_id": topic.get("feed_id"), "topic": topic.get("title"), "category": topic.get("category"),
                    "promos_made": len(made), "promo_number": len(made) + 1,
                    "promoted_moments": [p.get("title") for p in made],
                    "script": f"channels/<channel>/videos/{e['id']}/script.json"})
    out.sort(key=lambda t: t["created_at"] or "", reverse=True)
    out.sort(key=lambda t: t["promos_made"])
    return out


def for_state(everything: list[dict], now: datetime, root: Path = ROOT) -> dict | None:
    """The `promo` block of a Shorts `state` (None on a channel without promo Shorts)."""
    c = config(root)
    if not c["on"]:
        return None
    return {"per_long": c["per_long"], "targets": targets(everything, now, root),
            "rule": "Every Short promotes one of these long videos (plan.promo_of = its id, topic.feed_id = its "
                    "feed_id): the first target unless it can't pass the variety rules. A different moment of the "
                    "long video from any promo already made (promoted_moments)."}


def check_plan(plan: dict, everything: list[dict], now: datetime, fmt: str, root: Path = ROOT) -> list[str]:
    """A promo channel's Short must name an open long video and tell its topic; other videos must not claim one."""
    c = config(root)
    promo_of = kin(plan)
    if not c["on"] or fmt != "short":
        return ["promo_of is only for a Short on a promo channel (channel.json cadence.promoOnly)"] if promo_of else []
    if not promo_of:
        return ["this channel's Shorts are promos of its long videos: set plan.promo_of to a long video id from "
                "state.promo.targets"]
    long = next((e for e in everything if e.get("id") == promo_of and e.get("format") == "long"), None)
    if long is None:
        return [f"promo_of {promo_of!r} is not a shipped long video of this channel"]
    out = []
    if len(promos_of(promo_of, everything)) >= c["per_long"]:
        out.append(f"{promo_of} already has {c['per_long']} promo Shorts; pick another from state.promo.targets")
    if long.get("created_at", "") < (now - timedelta(days=WINDOW_DAYS)).isoformat():
        out.append(f"{promo_of} is over {WINDOW_DAYS} days old; promote a newer long video")
    want = (long.get("topic") or {}).get("feed_id")
    got = (plan.get("topic") or {}).get("feed_id")
    if want and got != want:
        out.append(f"topic.feed_id must be the long video's own topic, {want!r} (its sourced facts are the promo's)")
    return out
