"""What failed lately, grouped (2026-10-29, owner: "things that are coming should be taken into
consideration so that next time that issue does not come"). Every failed step of every video is in
videos/<id>/run.json; this groups the last days' notes by checker and kind, so a writer starts from
the mistakes the last runs made instead of finding them again one re-render at a time.

    python -m generator.run failures [--days 14] [--format short|long]
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

# the kinds of failure, matched in order on a note; the advice is what prevents it at the writing stage
KINDS: list[tuple[str, str, str]] = [
    ("render", r"runs outside the frame|inside the bottom", "text off the frame: keep words short, labels ≤ 3 words; custom code uses design/fit.ts"),
    ("render", r"below the \d+ px minimum", "text under the minimum size: custom code never sets a font below minText(w, h)"),
    ("render", r"nothing new on screen", "a gap with nothing new: an action on every phrase, at most 2.5 s apart"),
    ("render", r"picture|shows|don't show|literal", "the picture doesn't show what is said: each action fires on the word that names it"),
    ("render", r"close or extreme|shot size|same size|in a row", "camera variety: a close shot at least every few seconds, never four of one size in a row"),
    ("render", r"props? of its own|were in v-|were in L-", "props: draw 8+ of the story's own things, not the last videos'"),
    ("render", r"^length|length about", "length outside the settings' range: count the words (about 175 a minute for Shorts, 215 long)"),
    ("render", r"empty|blank", "empty frames: something on screen from the first frame of every beat"),
    ("render", r"tsc|import|Hook\.tsx|Turn\.tsx|Payoff\.tsx|props\.tsx", "own code: type-safe (`!` or `??` on lookups), only kit imports"),
    ("render", r"thumbnail", "thumbnail rules: ≤ 4 words, no digits, adds to the title, big at phone size"),
    ("number_check", r"neither a script input|which no maths computes", "a typed figure in the title or description: write {placeholders}"),
    ("number_check", r"has no value or series|no maths named", "an @reference to a key the maths doesn't have: the error lists the keys"),
    ("number_check", r"no word .* in this beat", "an event on a word the line doesn't say: use a word spelled exactly as in `say`"),
    ("number_check", r"opens like a line", "a line that opens like a recent script's: new words"),
    ("number_check", r"typed number", "a digit in shown text: use a placeholder"),
    ("number_check", r"four words", "thumbnail words: four at most"),
    ("number_check", r"hook gives no reason|curiosity", "a hook that gives the answer: open the question and promise the answer"),
    ("number_check", r"no one explains|speaker changes|one-liners|beats average", "nobody explains: one voice carries it in full sentences, the cast react"),
    ("number_check", r"tease|turn|payoff|promise|level|climbing|build", "the story spine: promise early, rising stakes, a turn, the payoff"),
    ("fact_review", r"most people|everyone|nobody|unsourced|statistic", "a 'most people' claim with no source: cut it or say 'many'"),
    ("fact_review", r"assum|average|certain|guarantee|as if", "an assumption said as a certainty: say 'if it grows 7% a year' and show the assumption"),
    ("fact_review", r"description|title|promise", "title or description promises what the video doesn't show, or a count that doesn't match its list"),
    ("fact_review", r"overstat|misleading|exaggerat", "overstated: the line claims more than the numbers show"),
    ("fact_review", r"rule|regulat|law|tax|FCA|RBI|IRS|SEC", "a rule or tax stated loosely: name the country and say it as the rule says"),
    ("qa_review", r"cut|edge|off the|cropped", "something cut at the edge: actors within spots 0.2–0.8 (Shorts), things inside the frame"),
    ("qa_review", r"counter|HUD", "the HUD counter: set it in the beat whose line says that figure, labelled for who is speaking"),
    ("qa_review", r"caption", "on the captions band (Shorts: 72% down in build/shot): keep labels and faces above it"),
    ("qa_review", r"overlap|cover|on top of|behind|touch", "two things on top of each other: space items ≥ 0.2 apart, actors beside things, not behind"),
    ("qa_review", r"small|tiny|unreadable|hard to read|contrast", "too small or low contrast: items size ≥ 0.12, labels on plain ground"),
    ("qa_review", r"empty|blank|nothing", "an empty stretch: the first thing appears at the beat's start"),
    ("qa_review", r"says|line says|while .* says|doesn't match|wrong prop", "the picture says something else than the line: the prop is the thing named"),
    ("qa_review", r"hook|first frame", "the hook: words and the main thing on screen at frame 0"),
]


def _kind(agent: str, note: str) -> str:
    for a, pat, advice in KINDS:
        if a == agent and re.search(pat, note, re.IGNORECASE):
            return advice
    return f"other {agent.replace('_', ' ')}"


def recent(root: Path, days: int = 14, fmt: str | None = None, now: datetime | None = None) -> list[dict]:
    """[{agent, kind, count, videos, example}] for failed steps in the last `days`, most frequent first."""
    since = (now or datetime.now(timezone.utc)) - timedelta(days=days)
    groups: dict[tuple[str, str], dict] = defaultdict(lambda: {"count": 0, "videos": set(), "example": ""})
    for f in sorted((root / "videos").glob("*/run.json")):
        vid = f.parent.name
        if fmt and (vid.startswith("L-") != (fmt == "long")):
            continue
        try:
            steps = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        for s in steps:
            if s.get("status") != "failed" or s.get("agent") not in ("render", "number_check", "fact_review", "qa_review", "planner"):
                continue
            try:
                when = datetime.fromisoformat(str(s.get("startedAt")))
            except ValueError:
                continue
            if when < since:
                continue
            for n in s.get("notes") or []:
                n = str(n).strip()
                if not n or n.lower().startswith(("verify item checked", "confirmed ok", "minor")):
                    continue
                g = groups[(s["agent"], _kind(s["agent"], n))]
                g["count"] += 1
                g["videos"].add(vid)
                g["example"] = n[:200]
    out = [{"agent": a, "kind": k, "count": g["count"], "videos": sorted(g["videos"]), "example": g["example"]} for (a, k), g in groups.items()]
    return sorted(out, key=lambda x: (-len(x["videos"]), -x["count"]))


def report(root: Path, days: int = 14, fmt: str | None = None, top: int = 15) -> str:
    rows = recent(root, days, fmt)
    if not rows:
        return f"No failed steps in the last {days} days."
    lines = [f"What failed in the last {days} days ({sum(r['count'] for r in rows)} notes), most widespread first. "
             "Avoid each while writing; the fix is after the arrow:"]
    for r in rows[:top]:
        lines.append(f"- [{r['agent']}] {len(r['videos'])} videos, {r['count']}× → {r['kind']}\n    e.g. {r['example']}")
    return "\n".join(lines)
