"""Fit a video's credit lines into its YouTube description.

YouTube takes 5000 bytes, and the publisher (workers/lib/publishing.ts youtubeMeta) cuts from the end,
which drops the credits and the hashtags. A long documentary can use over a hundred licensed photos
and filings (owner, 2026-11-25: L-20261125-31 shipped a 22,303-character description). So ship keeps
the full lines, each with its link, only when they fit; otherwise it writes one line per source,
grouped: Commons photos by licence and author, SEC filings by company and form with their years, and
the rest without links. As a last resort it shortens the longest list with "and N more".
"""
from __future__ import annotations

import re
from collections import OrderedDict

# What the description may hold at ship: YouTube's 5000 bytes minus what the publisher adds later
# (hashtags, the disclaimer if missing, a promo Short's "Full story" link).
BUDGET = 4500

_URL = re.compile(r"\s*\((https?://\S+)\)\s*$")   # a link may hold brackets (Commons file names)
_COMMONS = re.compile(r"^(Photo|Logo|Video|Document): (.+), ([^,]+), via Wikimedia Commons$")
_EDGAR = re.compile(r"^(.+?) Form ([\w-]+), filed (\d{4})-\d\d-\d\d(?: \(period [^)]*\))?, SEC EDGAR$")


def size(text: str) -> int:
    return len(text.encode("utf-8"))


def _join(base: str, lines: list[str]) -> str:
    return base.rstrip() + ("\n\n" + "\n".join(lines) if lines else "")


def _author(name: str) -> str:
    """A Commons author field as a short name: some hold a whole paragraph (cut at its first " - ", " (" or
    "." after a few words), some the same name twice ("Unknown authorUnknown author")."""
    name = " ".join(name.split())
    half = len(name) // 2
    if len(name) % 2 == 0 and name[:half] == name[half:]:
        name = name[:half]
    if len(name) > 60:
        cuts = [i for i in (name.find(" - "), name.find(" ("), name.find(". ")) if i >= 3]
        name = name[:min(cuts)] if cuts else name[:57].rstrip() + "…"
    return name.strip(" .,")


def compact(lines: list[str]) -> list[str]:
    """The credit lines grouped per source, without links (order of first appearance kept)."""
    commons: OrderedDict[str, OrderedDict[str, int]] = OrderedDict()   # licence -> author -> files
    kinds: set[str] = set()
    edgar: OrderedDict[str, OrderedDict[str, list[str]]] = OrderedDict()   # company -> form -> years
    rest: list[str] = []
    for line in lines:
        bare = _URL.sub("", line).strip()
        if m := _COMMONS.match(bare):
            kinds.add(m.group(1))
            authors = commons.setdefault(m.group(3).strip(), OrderedDict())
            who = _author(m.group(2))
            authors[who] = authors.get(who, 0) + 1
        elif m := _EDGAR.match(bare):
            years = edgar.setdefault(m.group(1).strip(), OrderedDict()).setdefault(m.group(2), [])
            if m.group(3) not in years:
                years.append(m.group(3))
        elif bare and bare not in rest:
            rest.append(bare)
    out = []
    if commons:
        what = "Photos" if kinds <= {"Photo"} else "Photos and logos" if kinds <= {"Photo", "Logo"} else "Media"
        groups = "; ".join(f"{lic}: " + ", ".join(f"{a} ×{n}" if n > 1 else a for a, n in authors.items())
                           for lic, authors in commons.items())
        out.append(f"{what} via Wikimedia Commons, by licence: {groups}")
    if edgar:
        out.append("Filings from SEC EDGAR: " + "; ".join(
            f"{co} " + ", ".join(f"{form} ({', '.join(sorted(ys))})" for form, ys in forms.items()) for co, forms in edgar.items()))
    return out + rest


def _shorten(line: str) -> str | None:
    """The line with its longest comma list one item shorter ("and N more"), or None when it can't shrink."""
    head, sep, body = line.partition(": ")
    if not sep:
        return None
    parts = body.split("; ")
    longest = max(range(len(parts)), key=lambda i: len(parts[i]))
    label, s2, items = parts[longest].rpartition(": ") if ": " in parts[longest] else ("", "", parts[longest])
    names = items.split(", ")
    more = 0
    if names and (m := re.match(r"and (\d+) more$", names[-1])):
        more = int(m.group(1))
        names = names[:-1]
    if len(names) <= 1:
        return None
    names = names[:-1] + [f"and {more + 1} more"]
    parts[longest] = (label + s2 if s2 else "") + ", ".join(names)
    return head + sep + "; ".join(parts)


def fit(base: str, lines: list[str], budget: int = BUDGET) -> str:
    """`base` with the credit `lines` added: in full if they fit, else grouped, else grouped and shortened."""
    lines = [ln for ln in lines if ln and ln not in base]
    full = _join(base, lines)
    if size(full) <= budget:
        return full
    short = compact(lines)
    while short and size(_join(base, short)) > budget:
        i = max(range(len(short)), key=lambda k: size(short[k]))
        cut = _shorten(short[i])
        if cut is None:
            short = short[:-1]          # nothing left to shorten: drop the last (least important) line
        else:
            short[i] = cut
    return _join(base, short)


def split(description: str) -> tuple[str, list[str]]:
    """A shipped description's text and its credit lines (the trailing block of lines that end in a link)."""
    paras = description.rstrip().split("\n\n")
    lines: list[str] = []
    while paras and all(_URL.search(ln) for ln in paras[-1].splitlines()):
        lines = paras.pop().splitlines() + lines
    return "\n\n".join(paras), lines
