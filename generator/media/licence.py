"""Which licences a monetised documentary channel can use, and what each one asks of us.

`classify` returns ok / review / no with a reason. Only `ok` passes `check`; a `review` asset needs the
owner's OK recorded on it (`"ownerOk": "<date, who, why>"`). Sources and their terms were researched on
2026-11-19 (pexels.com/license, pixabay.com/service/license-summary, Commons reuse guide, sec.gov
accessing-edgar-data); the record keeps the terms as they were on the fetch date.
"""
from __future__ import annotations

import re

from ..images import licence_ok as commons_licence_ok

OK, REVIEW, NO = "ok", "review", "no"

# Standing restrictions per source: they travel with every record so an editor sees them at use time.
PEXELS_RULES = [
    "no identifiable person shown in a bad light (never a stranger's face under fraud or scandal narration)",
    "no implied endorsement by a person or brand in the frame",
    "brands and logos in the frame are not licensed",
    "no standalone redistribution of the raw file",
]
PIXABAY_RULES = [
    "no commercial use of a clip showing a recognisable trademark, logo or brand",
    "no misleading or deceptive use; nothing unlawful with identifiable people",
    "no standalone redistribution of the raw file",
]
EDGAR_RULES = [
    "the company wrote the filing: show it only to report on or comment on it (fair use, not a licence)",
    "cite the filing on screen: Source: SEC EDGAR, Form <type>, <date>",
    "exhibits may hold third-party material (photos, press releases): don't show those",
]
COMMONS_FLAGS = {
    "trademarked": "trademark: show only to identify the company, never altered or implying endorsement",
    "personality": "identifiable person: personality rights; never in a negative or endorsing light without care",
    "insignia": "official insignia: identification only",
}

LICENCE_URLS = {
    "pexels": "https://www.pexels.com/license/",
    "pixabay": "https://pixabay.com/service/license-summary/",
    "edgar": "https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data",
}

NEVER = re.compile(r"\b(editorial|non-?commercial|\bnc\b|\bnd\b|no ?deriv|restricted licen[cs]e|fair use|all rights reserved|press kit)\b", re.I)


def normalise(source: str, licence: str) -> str:
    """A short machine id for the licence: pd, cc0, cc-by-4.0, cc-by-sa-3.0, pexels, pixabay, filing…"""
    s = (licence or "").strip().lower()
    if source in ("pexels", "pixabay"):
        return source
    if source == "edgar":
        return "filing"
    if not s:
        return "unknown"
    if s.startswith(("public domain", "pd")) or "pdm" in s:
        return "pd"
    if s.startswith("cc0"):
        return "cc0"
    m = re.match(r"cc[ -]by(-sa)?[ -]?(\d(\.\d)?)?", s)
    if m:
        return "cc-by" + ("-sa" if m.group(1) else "") + (f"-{m.group(2)}" if m.group(2) else "")
    if s == "attribution":
        return "cc-by"
    return re.sub(r"[^a-z0-9.]+", "-", s).strip("-") or "unknown"


def classify(source: str, licence: str, flags: list[str] | None = None) -> tuple[str, str]:
    """ok / review / no, with the reason."""
    lic = (licence or "").strip()
    if NEVER.search(lic) or any(NEVER.search(f or "") for f in flags or []):
        return NO, f"{lic or 'licence'}: editorial-only, non-commercial, no-derivatives or fair-use material is not licensed for a monetised channel"
    if source == "pexels":
        return (OK, "Pexels License: free commercial use, no attribution required") if lic.lower().startswith("pexels") \
            else (REVIEW, f"unexpected Pexels licence {lic!r}")
    if source == "pixabay":
        return (OK, "Pixabay Content License: free commercial use, no attribution required") if lic.lower().startswith("pixabay") \
            else (REVIEW, f"unexpected Pixabay licence {lic!r}")
    if source == "commons":
        return (OK, f"{lic}: free licence (PD, CC0, CC BY, CC BY-SA)") if commons_licence_ok(lic) \
            else (NO, f"{lic or 'unknown licence'}: Commons files must be PD, CC0, CC BY or CC BY-SA")
    if source == "edgar":
        return OK, "public SEC filing, shown as commentary with an on-screen citation"
    return REVIEW, f"{source}: no automatic rule for this source; the owner decides"


def attribution(source: str, licence: str, author: str, title: str, url: str, kind: str) -> tuple[bool, str]:
    """(required?, the credit line for the description). Courtesy credits are written even when not required."""
    what = "Video" if kind == "video" else "Document" if kind == "document" else "Photo"
    n = normalise(source, licence)
    if source == "pexels":
        return False, f"{what} by {author} on Pexels ({url})"
    if source == "pixabay":
        return False, f"{what} by {author} from Pixabay ({url})"
    if source == "edgar":
        return True, f"{title}, SEC EDGAR ({url})"
    if source == "commons":
        required = n.startswith("cc-by")
        return required, f"{what}: {author}, {licence}, via Wikimedia Commons ({url})"
    return True, f"{what}: {author}, {licence} ({url})"


def restrictions(source: str, commons_flags: str = "") -> list[str]:
    if source == "pexels":
        return list(PEXELS_RULES)
    if source == "pixabay":
        return list(PIXABAY_RULES)
    if source == "edgar":
        return list(EDGAR_RULES)
    flags = [f.strip().lower() for f in re.split(r"[|,;]", commons_flags or "") if f.strip()]
    return [COMMONS_FLAGS.get(f, f) for f in flags]
