"""Official investigation report pages as document props (the disasters channel; owner, 2026-11-20).

A report is a PDF published by a safety board or inquiry. `fetch_report` downloads it into the media cache,
finds the page holding a phrase (or takes a page number), renders that page to PNG and logs both in the
channel's licence log, so a directed beat can show the real page with the finding highlighted (doc kit
`DocumentProp`, `remotion/src/disaster/ReportPage`). Only the agencies below are accepted: each with the
licence its reports carry, checked on 2026-11-20.

    python -m generator.media report --channel <slug> <pdf url> --find "probable cause"
    python -m generator.media report --channel <slug> <pdf url> --page 74
"""
from __future__ import annotations

import hashlib
import re
import urllib.parse
from pathlib import Path

from ..images import user_agent
from .store import ROOT, MediaError, cache_root, download, record

# host suffix → (agency, licence name, licence url, verdict note). US federal works are public domain
# (17 U.S.C. §105); UK reports are Crown copyright under the Open Government Licence v3.0; Canada's TSB under the
# Open Government Licence – Canada; ATSB under CC BY 4.0; the BEA's under France's Licence Ouverte 2.0.
AGENCIES: dict[str, tuple[str, str, str]] = {
    "ntsb.gov": ("US National Transportation Safety Board", "Public domain (US government work)", "https://www.usa.gov/government-copyright"),
    "csb.gov": ("US Chemical Safety Board", "Public domain (US government work)", "https://www.usa.gov/government-copyright"),
    "nasa.gov": ("NASA", "Public domain (US government work)", "https://www.nasa.gov/nasa-brand-center/images-and-media/"),
    "faa.gov": ("US Federal Aviation Administration", "Public domain (US government work)", "https://www.usa.gov/government-copyright"),
    "fra.dot.gov": ("US Federal Railroad Administration", "Public domain (US government work)", "https://www.usa.gov/government-copyright"),
    "nist.gov": ("US National Institute of Standards and Technology", "Public domain (US government work)", "https://www.nist.gov/oism/copyrights"),
    "osha.gov": ("US Occupational Safety and Health Administration", "Public domain (US government work)", "https://www.usa.gov/government-copyright"),
    "dot.gov": ("US Department of Transportation", "Public domain (US government work)", "https://www.usa.gov/government-copyright"),
    "assets.publishing.service.gov.uk": ("UK government (AAIB / RAIB / MAIB)", "Open Government Licence v3.0", "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"),
    "gov.uk": ("UK government (AAIB / RAIB / MAIB)", "Open Government Licence v3.0", "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"),
    "tsb.gc.ca": ("Transportation Safety Board of Canada", "Open Government Licence - Canada", "https://open.canada.ca/en/open-government-licence-canada"),
    "bst-tsb.gc.ca": ("Transportation Safety Board of Canada", "Open Government Licence - Canada", "https://open.canada.ca/en/open-government-licence-canada"),
    "atsb.gov.au": ("Australian Transport Safety Bureau", "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"),
    "bea.aero": ("BEA (France)", "Licence Ouverte 2.0", "https://www.etalab.gouv.fr/licence-ouverte-open-licence/"),
}
REPORT_RULES = [
    "show the page to report on the investigation; cite the agency, report number and date on screen",
    "the report may reproduce third-party photos (news agencies, witnesses): crop to the text and the board's own diagrams",
    "never alter the finding's words; highlight only",
    "victims' names and personal details in the report are not shown",
]


def agency(url: str) -> tuple[str, str, str]:
    host = (urllib.parse.urlparse(url).hostname or "").lower()
    for suffix, a in AGENCIES.items():
        if host == suffix or host.endswith("." + suffix):
            return a
    raise MediaError(f"{host or url}: not an official investigation body this channel takes reports from "
                     f"({', '.join(sorted(AGENCIES))}; generator/media/reports.py AGENCIES)")


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def page_texts(pdf: Path) -> list[str]:
    import pypdfium2 as pdfium
    doc = pdfium.PdfDocument(str(pdf))
    try:
        return [doc[i].get_textpage().get_text_range() for i in range(len(doc))]
    finally:
        doc.close()


def find_page(texts: list[str], phrase: str, nth: int = 1) -> int:
    """0-based index of the nth page holding `phrase` (whitespace and case ignored), skipping a contents page."""
    want, hits = _norm(phrase), []
    for i, t in enumerate(texts):
        n = _norm(t)
        if want in n and not re.search(r"\bcontents\b", n[:400]):
            hits.append(i)
    if len(hits) < nth:
        raise MediaError(f"no page holds {phrase!r} ({len(hits)} found)")
    return hits[nth - 1]


def render(pdf: Path, index: int, out: Path, scale: float = 2.5) -> Path:
    import pypdfium2 as pdfium
    doc = pdfium.PdfDocument(str(pdf))
    try:
        img = doc[index].render(scale=scale).to_pil().convert("RGB")
    finally:
        doc.close()
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, optimize=True)
    return out


def fetch_report(slug: str, url: str, find: str | None = None, page: int | None = None, nth: int = 1,
                 title: str | None = None, root: Path = ROOT) -> dict:
    """Download a report PDF, log it, and (with `find` or `page`) render that page to PNG and log it too."""
    from . import may_use
    from .library import _build
    if not may_use(slug, "report"):
        raise MediaError(f"report: not allowed on {slug} (generator/media/__init__.py CHANNEL_SOURCES)")
    body, lic, lic_url = agency(url)
    rid = hashlib.sha1(url.encode()).hexdigest()[:12]
    name = title or urllib.parse.unquote(Path(urllib.parse.urlparse(url).path).stem)[:80]
    pdf = cache_root(slug) / "report" / f"report-{rid}.pdf"
    if not pdf.is_file():
        download(url, pdf, {"User-Agent": user_agent()}, "report", 2.0, 200 << 20)
    c = {"ref": f"report:document:{url}", "source": "report", "kind": "document", "id": rid, "title": name,
         "author": body, "page": url, "url": url, "ext": "pdf", "licence": lic, "licenceUrl": lic_url, "flags": []}
    meta = {"agency": body, "citation": f"Source: {body}, {name}"}
    doc = record(slug, _build(slug, c, pdf, meta), root)
    if find is None and page is None:
        return doc
    texts = page_texts(pdf)
    i = page - 1 if page else find_page(texts, find or "", nth)
    if not 0 <= i < len(texts):
        raise MediaError(f"{name}: has {len(texts)} pages")
    png = render(pdf, i, cache_root(slug) / "report" / f"report-{rid}-p{i + 1:03d}.png")
    pc = {**c, "id": f"{rid}-p{i + 1:03d}", "ref": f"report:document:{url}#p{i + 1}", "title": f"{name}, page {i + 1} of {len(texts)}",
          "ext": "png"}
    return record(slug, _build(slug, pc, png, {**meta, "page": i + 1, "pages": len(texts), "find": find, "of": doc["id"]}), root)
