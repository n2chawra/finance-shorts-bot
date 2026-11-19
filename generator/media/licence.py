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
ARCHIVE_RULES = [
    "mute: soundtrack may be copyrighted (music and narration in a public-domain film can still be owned)",
    "archive.org gives no warranty on rights: keep the item page and licence as logged",
    "the item's description and metadata are not ours to copy; use the picture only",
]
LOC_RULES = [
    "rights as the Library's advisory read on the fetch date; no warranty from the Library",
    "identifiable people: publicity and privacy rights may still apply; never in a defamatory light",
    "never imply the Library of Congress endorses the channel",
]
NASA_RULES = [
    "the NASA insignia, worm and seal are not licensed: never shown as our branding",
    "never imply NASA endorses the channel, a product or a company",
    "identifiable people (astronauts, staff): no commercial endorsement use",
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
    "archive": "https://help.archive.org/help/prelinger-archive/",
    "loc": "https://www.loc.gov/legal/",
    "nasa": "https://www.nasa.gov/nasa-brand-center/images-and-media/",
}
NO_KNOWN = re.compile(r"\bno known (copyright )?restrictions\b", re.I)
RISKY_LOC = re.compile(r"\b(publicity|privacy|not been evaluated|not evaluated|undetermined|permission|copyright(ed)? (by|holder)|"
                       r"rights (status )?(may|could) apply|may be (protected|restricted))\b", re.I)

NEVER = re.compile(r"\b(editorial|non-?commercial|\bnc\b|\bnd\b|no ?deriv|restricted licen[cs]e|fair use|all rights reserved|press kit)\b", re.I)


def normalise(source: str, licence: str) -> str:
    """A short machine id for the licence: pd, cc0, cc-by-4.0, cc-by-sa-3.0, pexels, pixabay, filing…"""
    s = (licence or "").strip().lower()
    if source in ("pexels", "pixabay"):
        return source
    if source == "edgar":
        return "filing"
    if source == "nasa":
        return "pd-usgov"
    if source == "loc" and NO_KNOWN.search(s):
        return "no-known-restrictions"
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
    if source == "archive":
        n = normalise(source, lic)
        if n in ("pd", "cc0") or (n.startswith("cc-by") and not n.startswith("cc-by-sa")):
            return OK, f"{lic}: public domain / CC0 / CC BY on the item (archive.org gives no warranty)"
        if not lic:
            return REVIEW, "no licence on the archive.org item: most Prelinger films are public domain, but unmarked ones need the owner's OK"
        return REVIEW, f"{lic}: not public domain, CC0 or CC BY; the owner decides"
    if source == "loc":
        if NO_KNOWN.search(lic) and not RISKY_LOC.search(lic):
            return OK, f"Library of Congress: {lic.rstrip('.')}"
        return REVIEW, f"Library of Congress rights: {lic or 'not stated'}; the owner decides"
    if source == "nasa":
        third = [f for f in flags or [] if f.startswith("third-party")]
        if third:
            return REVIEW, f"NASA item made by someone else ({third[0]}); the owner decides"
        return OK, "NASA media: US government work, not copyrighted"
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
    if source == "archive":
        return n.startswith("cc-by"), f"Film: {title}, {author}, {licence or 'public domain'}, via the Internet Archive ({url})"
    if source == "loc":
        return False, f"{what}: {title}, {author}, Library of Congress ({url})"
    if source == "nasa":
        return False, f"{what}: {title}, NASA ({url})"
    return True, f"{what}: {author}, {licence} ({url})"


def restrictions(source: str, commons_flags: str = "") -> list[str]:
    if source == "pexels":
        return list(PEXELS_RULES)
    if source == "pixabay":
        return list(PIXABAY_RULES)
    if source == "edgar":
        return list(EDGAR_RULES)
    if source == "archive":
        return list(ARCHIVE_RULES)
    if source == "loc":
        return list(LOC_RULES)
    if source == "nasa":
        return list(NASA_RULES) + [f for f in re.split(r"\s*\|\s*", commons_flags or "") if f]
    flags = [f.strip().lower() for f in re.split(r"[|,;]", commons_flags or "") if f.strip()]
    return [COMMONS_FLAGS.get(f, f) for f in flags]
