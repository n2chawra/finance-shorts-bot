"""Formats with proven demand: what people already watch in the millions (owner reset, 2026-10-21).

`improvement/research/formats.json` lists them per format (written by research, seeded by hand):
each has an `id` (a plan's `story`), a hook pattern, a beat outline and reference videos with their
views. Every plan tells one of its format's stories and names the video that shows the demand:

    plan["story"]  = "rich_vs_poor"
    plan["demand"] = {"title": "rich vs poor parents buying you a car", "views": 8800000, "url": "https://..."}

News stopped deciding what we make: before the reset the feed was news first, and 17 videos got
1-60 views each while viewers watched 20-35% of every Short.
"""
import json
import re
from pathlib import Path

from .settings import ROOT

FILE = Path("improvement") / "research" / "formats.json"
MIN_VIEWS = 100_000      # a reference video below this doesn't show demand


def load(root: Path = ROOT, fmt: str = "short", plannable: bool = True) -> list[dict]:
    """The format's live entries; `plannable` leaves out one with no reference video at MIN_VIEWS,
    since check_plan would reject any plan in it (it comes back once research adds one)."""
    path = root / FILE
    if not path.is_file():
        return []
    return [f for f in json.loads(path.read_text(encoding="utf-8")).get("formats", [])
            if isinstance(f, dict) and f.get("id") and f.get("format") == fmt and not f.get("retired")
            and (not plannable or best_views(f) >= MIN_VIEWS)]


def best_views(f: dict) -> int:
    return max([e.get("views", 0) for e in f.get("examples") or [] if isinstance(e, dict) and isinstance(e.get("views"), int)] or [0])


def ids(root: Path = ROOT, fmt: str = "short") -> list[str]:
    return [f["id"] for f in load(root, fmt)]


CORE_MIN = (2, 3)        # at least 2 of every 3 Shorts are big-money stories (owner, 2026-10-30)


def tiers(root: Path = ROOT, fmt: str = "short") -> dict[str, str]:
    """`core` (big money: what got every 1K+ Short and every subscriber) or `low` (personal budgeting)."""
    return {f["id"]: f["tier"] for f in load(root, fmt, plannable=False) if f.get("tier")}


def core_ids(root: Path = ROOT, fmt: str = "short") -> list[str]:
    return [i for i, t in tiers(root, fmt).items() if t == "core"]


def core_needed(entries: list[dict], root: Path = ROOT, fmt: str = "short") -> bool:
    """Must the next Short be a core format? (the last ones already used the window's other slots)"""
    if fmt != "short":
        return False
    core = set(core_ids(root, fmt))
    if not core:
        return False
    need, window = CORE_MIN
    last = [e.get("story") for e in entries[-(window - 1):]]
    return sum(1 for s in last if s not in core) >= window - need


# Since 2026-11-04 every Short is big money unless the variant system (improvement/arms.py) assigns the
# personal-budget topic as a test: big-money titles had a median of 773 views (8 hits in 14), personal
# budget 118 (none in 6), and the decline began the days the planner let those back in.
BUDGET_ARM = "budget"


def mix_problems(plan: dict, entries: list[dict], root: Path = ROOT, fmt: str = "short") -> list[str]:
    if fmt == "short" and core_ids(root, fmt) and plan.get("story") not in core_ids(root, fmt):
        if ((plan.get("arms") or {}).get("topic")) != BUDGET_ARM:
            return [f"Shorts tell big-money stories ({', '.join(core_ids(root, fmt))}): billionaires, money at scale, how a "
                    f"famous business makes money, the traps. A personal-budget story only when `arms.topic` is "
                    f"\"{BUDGET_ARM}\" (a test the variant system assigns)"]
        return []
    if fmt == "short" and core_ids(root, fmt) and ((plan.get("arms") or {}).get("topic")) == BUDGET_ARM:
        # the variant system counts this video's views as the budget option's (improvement/arms.py)
        return [f"arms.topic is \"{BUDGET_ARM}\": tell a personal-budget story, not {plan.get('story')!r} (a big-money "
                f"format), or the variant system credits a big-money video to the budget test"]
    if core_needed(entries, root, fmt) and plan.get("story") not in core_ids(root, fmt):
        need, window = CORE_MIN
        return [f"at least {need} of every {window} Shorts tell a big-money story ({', '.join(core_ids(root, fmt))}): the last "
                f"ones already used the other slot, so this one must be big money (billionaires, money at scale, how a famous "
                f"business makes money)"]
    return []


# a placeholder ({bonus}) is a figure too: the title shows it filled in (2026-11-05)
MONEY_IN_TITLE = re.compile(r"[$£€₹]|\d|\{[a-z0-9_]+\}|\b(billion|million|trillion|crore|lakh)", re.I)
# a capitalised word that doesn't start a sentence: a person, company or place ("Google", "Coca-Cola")
NAME_IN_TITLE = re.compile(r"(?<![.!?:]\s)(?<!^)\b[A-Z][a-zA-Z]+")


def title_problems(title: str, arms: dict | None = None) -> list[str]:
    """A Short's title carries a money figure or a famous name (2026-11-03: titles with "$…" or "billion" got
    a median of 793 views in 48 h; the rest 39). The variant system may assign a plain title (`arms.title`
    "plain") to keep testing it: the casino and EMI-trap hits had neither."""
    t = (title or "").strip()
    if not t or ((arms or {}).get("title") == "plain") or MONEY_IN_TITLE.search(t):
        return []
    names = [w for w in NAME_IN_TITLE.findall(t) if w.lower() not in COMMON_WORDS]
    first = t.split()[0]
    if names or (first[:1].isupper() and first.lower().strip(".,!?") not in COMMON_STARTS):
        return []
    return [f"title {t!r} has no money figure and no famous name: put the biggest figure or the famous person or company "
            f"in it (\"Why Google pays Apple $20B…\"), unless `arms.title` is \"plain\""]


# owner, 2026-11-10 (v-20261110-01, "The biggest pay deal ever comes with a lock"): a plain title may keep the
# famous name back for curiosity, but YouTube still has to know who the video is about, so the plan names its
# `subject` and the description's first lines and a hashtag carry it whatever the title does.
def subject_problems(plan: dict) -> list[str]:
    """A Short's plan names `subject`: the famous person or company the story is about ("Elon Musk", "MrBeast"),
    or "" when it has none. A named subject appears in the description's first two lines and in a hashtag."""
    if "subject" not in plan:
        return ["plan needs `subject`: the famous person or company the story is about (\"Elon Musk\", \"Coca-Cola\"), "
                "or \"\" when there is none; the description and a hashtag then name it so YouTube knows who it is about"]
    subject = (plan.get("subject") or "").strip()
    if not subject:
        return []
    words = [w.lower() for w in re.findall(r"[A-Za-z0-9]+", subject) if len(w) >= 3] or [subject.lower()]
    head = " ".join((plan.get("description") or "").splitlines()[:2]).lower()
    out = []
    if not any(re.search(rf"\b{re.escape(w)}", head) for w in words):
        out.append(f"the description's first two lines must name the subject {subject!r} (\"Elon Musk's record pay deal...\"): "
                   f"YouTube reads it to know who the video is about, even when the title keeps the name back")
    tags = [h.lower().lstrip("#") for h in plan.get("hashtags") or []]
    if not any(w in t for t in tags for w in words):
        out.append(f"add a hashtag for the subject {subject!r} (\"#{''.join(re.findall(r'[A-Za-z0-9]+', subject))}\")")
    return out


COMMON_WORDS = {"i", "tv", "emi", "sip", "rich", "poor", "the"}
COMMON_STARTS = {"why", "how", "what", "the", "your", "you", "this", "a", "an", "every", "same", "poor", "rich", "when", "who",
                 "payday", "guess", "never", "stop", "one", "it", "they", "we", "i", "is", "are", "do", "does", "can"}


def for_state(root: Path = ROOT, fmt: str = "short") -> list[dict]:
    """What `state` shows the planner: each format with its hook, beats, title patterns and best example."""
    out = []
    for f in load(root, fmt):
        best = max(f.get("examples") or [{}], key=lambda e: e.get("views", 0))
        out.append({k: f.get(k) for k in ("id", "name", "tier", "emotion", "hook", "beats", "titles", "markets")} | {"best_example": best})
    return out


def check_plan(plan: dict, root: Path = ROOT, fmt: str = "short") -> list[str]:
    """A plan tells a format with proven demand and names the video that proves it."""
    known = ids(root, fmt)
    if not known:
        return []
    out = []
    below = {f["id"]: best_views(f) for f in load(root, fmt, plannable=False) if f["id"] not in known}
    if plan.get("story") in below:
        out.append(f"story {plan['story']} has no reference video with {MIN_VIEWS:,}+ views yet (best {below[plan['story']]:,}): "
                   f"pick one of {', '.join(known)}")
    elif plan.get("story") not in known:
        out.append(f"story must be a {fmt} format with proven demand: one of {', '.join(known)} ({FILE.as_posix()})")
    demand = plan.get("demand")
    if not isinstance(demand, dict) or not demand.get("title") or not isinstance(demand.get("views"), int):
        out.append("plan needs `demand`: {title, views, url} of a video in this format that people watch")
    elif demand["views"] < MIN_VIEWS:
        out.append(f"demand.views {demand['views']:,} is under {MIN_VIEWS:,}: pick a reference video that shows real demand")
    elif isinstance(demand.get("channelSubs"), int) and demand["views"] < demand["channelSubs"]:
        # owner, 2026-11-11: a giant channel's ordinary video shows its audience, not demand for the topic
        out.append(f"demand: {demand['views']:,} views on a channel with {demand['channelSubs']:,} subscribers is that channel's "
                   f"audience, not demand for the topic: pick a breakout (views 3x+ the channel's subscribers, market.json `breakout`)")
    return out
