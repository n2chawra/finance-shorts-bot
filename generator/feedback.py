"""The owner's feedback, for the video routine and the agents (owner, 2026-10-30: "my feedback should be
used in video generation and by the improver, so the system improves as well as the next video").

The dashboard stores it in Postgres; the ingest workflow exports it to `metrics/feedback.json`
(workers/lib/agents-sync.ts `feedbackExport`). Kinds: `choice` (why the owner picked a video to
publish), `stale` (why a video will never go out), `wrong` (something is wrong: a rule until it is
addressed), `improve` (do it better next time), `general` (about the channel). The improver answers
each open note in `improvement/feedback-acks.json`, which ingest brings back to the dashboard.
"""
from __future__ import annotations

import json
from pathlib import Path

from .settings import ROOT

ACKS_DIR = Path("improvement") / "feedback-acks"
LEGACY_ACKS = Path("improvement") / "feedback-acks.json"   # the improver's answers before 2026-11-10
HANDOFF = ("handed", "partly")
AGENTS = ("improver", "research", "dashboard", "auditor", "scout", "studio", "monthly")

FILE = Path("metrics") / "feedback.json"
SHOWN = 15     # notes handed to the planner and writer: the open ones and the newest


def load(root: Path = ROOT) -> list[dict]:
    path = root / FILE
    if not path.is_file():
        return []
    try:
        return [n for n in json.loads(path.read_text(encoding="utf-8")).get("notes", []) if isinstance(n, dict) and n.get("text")]
    except (OSError, ValueError):
        return []


def for_state(root: Path = ROOT, fmt: str = "short") -> dict:
    """What `state` hands the planner and the writer: the owner's open notes (rules until addressed),
    the latest picks and stales (the owner's taste), newest first."""
    notes = [n for n in load(root) if (n.get("video") or {}).get("format", fmt) == fmt or not n.get("video")]
    open_ = [n for n in notes if n.get("status") == "open" and n.get("kind") in ("wrong", "improve", "general")]
    taste = [n for n in notes if n.get("kind") in ("choice", "stale")][:8]
    slim = lambda n: {k: v for k, v in {  # noqa: E731
        "kind": n.get("kind"), "area": n.get("area"), "text": n.get("text"), "at": (n.get("at") or "")[:10],
        "video": (n.get("video") or {}).get("title"), "story": (n.get("video") or {}).get("story"),
        "shape": (n.get("video") or {}).get("shape"), "hook": (n.get("video") or {}).get("hook")}.items() if v}
    return {
        "rule": "The owner's notes come right after the hard rules. A `wrong` note is a rule until it is addressed; "
                "`improve` and `general` notes shape this video; `choice` and `stale` show what the owner wants on the channel.",
        "open": [slim(n) for n in open_[:SHOWN]],
        "taste": [slim(n) for n in taste],
    }


def taste_of(root: Path = ROOT) -> dict[str, float]:
    """+1 for each story or shape the owner picked to publish, -1 for each in a video marked stale."""
    out: dict[str, float] = {}
    for n in load(root):
        sign = {"choice": 1.0, "stale": -1.0}.get(n.get("kind") or "")
        v = n.get("video") or {}
        if not sign:
            continue
        for key in (f"story:{v.get('story')}", f"shape:{v.get('shape')}"):
            if not key.endswith(":None"):
                out[key] = out.get(key, 0.0) + sign
    return out


def report(root: Path = ROOT, fmt: str = "short") -> str:
    """The open notes as lines, for the top of `generator.run failures`."""
    s = for_state(root, fmt)
    if not s["open"]:
        return ""
    lines = ["The owner's open notes (they come first; a `wrong` note is a rule until it is addressed):"]
    lines += [f"- [{n['kind']}{'/' + n['area'] if n.get('area') else ''}] {n['text']}" + (f"  (on {n['video']!r})" if n.get("video") else "") for n in s["open"]]
    return "\n".join(lines)


def acks(root: Path = ROOT) -> list[dict]:
    """Every agent's answers so far, each with its `agent`."""
    files = [("improver", root / LEGACY_ACKS)] + [(f.stem, f) for f in sorted((root / ACKS_DIR).glob("*.json"))]
    out = []
    for agent, f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {}
        except (OSError, ValueError):
            continue
        out += [{**a, "agent": a.get("agent") or agent} for a in data.get("acks", []) if isinstance(a, dict) and a.get("id")]
    return out


def has_answered(agent: str, note_acks: list[dict]) -> bool:
    """Whether `agent` has answered a note: it closed it, or handed it on to someone other than an agent
    that handed it to `agent` (a handoff back to the hander is an earlier answer, so the note is due again).
    Mirrored in workers/lib/agents-sync.ts `ackState`."""
    handers = {a["agent"] for a in note_acks if a.get("action") in HANDOFF and a.get("to") == agent}
    return any(a.get("action") not in HANDOFF or a.get("to") not in handers
               for a in note_acks if a["agent"] == agent)


def for_agent(agent: str, root: Path = ROOT) -> list[dict]:
    """The owner's open notes this agent still has to read: not yet closed by any agent unless handed to this
    one, and not already answered by this one. Notes handed to it come first (`handed_to_you`)."""
    answers: dict[str, list[dict]] = {}
    for a in acks(root):
        answers.setdefault(a["id"], []).append(a)
    out = []
    for n in load(root):
        if n.get("status") != "open" or n.get("kind") not in ("wrong", "improve", "general"):
            continue
        mine = answers.get(n["id"], [])
        handed = [a for a in mine if a.get("action") in HANDOFF and a.get("to") == agent]
        if has_answered(agent, mine):
            continue     # answered it already (closed it, or did its part and passed the rest on)
        closed = [a for a in mine if a.get("action") not in HANDOFF]
        if closed and not handed:
            continue
        out.append({"id": n["id"], "kind": n.get("kind"), "area": n.get("area"), "text": n.get("text"), "at": (n.get("at") or "")[:10],
                    "video": n.get("video"), "handed_to_you": bool(handed),
                    "answers": [{k: a[k] for k in ("agent", "action", "to", "note", "commit") if a.get(k)} for a in mine]})
    return sorted(out, key=lambda n: not n["handed_to_you"])


def main(argv: list[str] | None = None) -> int:
    import argparse
    ap = argparse.ArgumentParser(description="The owner's open notes for one agent")
    ap.add_argument("--agent", required=True, choices=AGENTS)
    args = ap.parse_args(argv)
    print(json.dumps({"agent": args.agent, "rules": "agents/policy.md, 'The owner's feedback'", "notes": for_agent(args.agent)},
                     indent=1, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
