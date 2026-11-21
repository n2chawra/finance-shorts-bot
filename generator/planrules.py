"""A channel's own plan rules (channels/<slug>/cycle/plan-rules.json), checked by check-plan.

The geography channel's owner marked a Short wrong because its answer was a machine, not a map (20 Nov
2026, note cmwoiqjki: "Anything topics that are explained not in the map are wrong ... Make sure this does
not happen again"). Its plans now say, before a script is written, what on the map the answer is
(`topic.map_answer`); a plan without one, or with one that is a machine, a law or a cut-away, fails.

    {"mapAnswer": {"since": "2026-11-21", "from": "owner note ..."}}
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from .channels import cpath
from .settings import ROOT

FILE = "improvement/cycle/plan-rules.json"

# what a map can show: a border, route, shape, distance or position
MAP_WORDS = (
    "border", "frontier", "route", "shape", "distance", "position", "coast", "river", "sea", "ocean", "strait",
    "canal", "island", "enclave", "exclave", "line", "map", "north", "south", "east", "west", "between", "next to",
    "neighbour", "neighbor", "across", "latitude", "longitude", "equator", "region", "continent", "country",
    "countries", "area", "size", "scale", "mountain", "desert", "lake", "valley", "pass", "port", "city", "cities",
    "capital", "wind", "current", "flow", "spread", "path", "corridor", "zone", "landlocked", "peninsula", "gulf",
)
# what a map cannot show (lessons.md 1: the Dinorwig Short's answer was how a power station works)
OFF_MAP = ("machine", "engine", "turbine", "how it works", "cut-away", "cutaway", "cross-section", "cross section",
           "a law", "the law", "habit", "battery", "diagram of", "mechanism")


def load(root: Path = ROOT) -> dict:
    f = cpath(root, FILE)
    try:
        return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    except ValueError:
        return {}


def map_answer_problems(plan: dict) -> list[str]:
    topic = plan.get("topic") if isinstance(plan.get("topic"), dict) else {}
    ans = topic.get("map_answer") or plan.get("map_answer")
    how = ("say in one line what on the map the answer is (a border, a route, a shape, a distance, where a "
           "place sits next to another) in plan.topic.map_answer, or pick another topic (lessons.md 1)")
    if not isinstance(ans, str) or len(ans.split()) < 4:
        return [f"plan.topic.map_answer is missing: {how}"]
    low = f" {ans.lower()} "
    if bad := [w for w in OFF_MAP if re.search(rf"\b{re.escape(w)}\b", low)]:
        return [f"plan.topic.map_answer names {bad[0]!r}, which the map can't show: {how}"]
    if not any(re.search(rf"\b{re.escape(w)}", low) for w in MAP_WORDS):
        return [f"plan.topic.map_answer names nothing a map draws: {how}"]
    return []


def check_plan(plan: dict, root: Path = ROOT) -> list[str]:
    rules = load(root)
    return map_answer_problems(plan) if rules.get("mapAnswer") else []
