"""SEC EDGAR: company filings (10-K, 10-Q, 8-K, S-1…) as document props and as sourced figures.

No key. The SEC asks for at most 10 requests a second and a User-Agent naming the operator with a
contact address ("Name admin@domain"); without one it blocks the request, so SEC_USER_AGENT is required.
Filings are public records written by the company: we show them to report on them, with the citation
on screen (licence.EDGAR_RULES).
"""
from __future__ import annotations

import os
import re
import urllib.parse

from ..store import MediaError, cache_root, get_json
from .base import Provider

DATA = "https://data.sec.gov"
WWW = "https://www.sec.gov"
DAY = 24 * 3600


class Edgar(Provider):
    name = "edgar"
    interval = 0.12     # the SEC's limit is 10 requests/s
    slug = "_shared"

    def headers(self) -> dict:
        ua = os.environ.get("SEC_USER_AGENT", "").strip()
        if not ua or "@" not in ua:
            raise MediaError('edgar: set SEC_USER_AGENT to a name and a contact address, e.g. "Acme Research admin@acme.example" '
                             "(the SEC blocks requests without one; use a role mailbox, not a personal one)")
        return {"User-Agent": ua, "Accept-Encoding": "identity"}

    def _json(self, url: str, ttl: float = 0) -> dict:
        return get_json(url, self.headers(), self.name, self.interval, cache_key=url if ttl else None, ttl=ttl,
                        cache_dir=cache_root(self.slug))

    # ---- companies -----------------------------------------------------------------------------------
    def cik(self, q: str) -> tuple[int, str]:
        """A CIK and company name from a CIK, a ticker (current listings) or a company name (incl. defunct ones)."""
        q = q.strip()
        if q.isdigit():
            sub = self._json(f"{DATA}/submissions/CIK{int(q):010d}.json", ttl=DAY)
            return int(q), sub.get("name", "")
        tickers = self._json(f"{WWW}/files/company_tickers.json", ttl=DAY)
        for t in tickers.values():
            if t.get("ticker", "").upper() == q.upper():
                return int(t["cik_str"]), t.get("title", "")
        hits = (self._json(f"https://efts.sec.gov/LATEST/search-index?{urllib.parse.urlencode({'keysTyped': q})}", ttl=DAY)
                .get("hits") or {}).get("hits") or []
        if not hits:
            raise MediaError(f"edgar: no company matches {q!r}; pass its CIK (search at {WWW}/edgar/searchedgar/companysearch)")
        # the entity with the most filings (rank) is usually the parent company people mean
        best = max(hits[:10], key=lambda h: (h.get("_source") or {}).get("rank") or 0)
        return int(best["_id"]), (best.get("_source") or {}).get("entity", "")

    # ---- filings -------------------------------------------------------------------------------------
    def filings(self, cik: int, form: str = "10-K", year: int | None = None) -> list[dict]:
        """The company's filings of `form` (amendments too), newest first; `year` matches the filing or the period year."""
        sub = self._json(f"{DATA}/submissions/CIK{cik:010d}.json", ttl=DAY)
        name = sub.get("name", "")
        tables = [sub["filings"]["recent"]]
        for f in sub["filings"].get("files", []):
            if year is None or (f["filingFrom"][:4] <= str(year + 1) and f["filingTo"][:4] >= str(year)):
                tables.append(self._json(f"{DATA}/submissions/{f['name']}", ttl=DAY))
        out = []
        for t in tables:
            for i, kind in enumerate(t.get("form", [])):
                if kind.upper() not in (form.upper(), form.upper() + "/A", form.upper() + "405"):
                    continue
                filed, period = t["filingDate"][i], (t.get("reportDate") or [""] * len(t["form"]))[i] or ""
                if year is not None and str(year) not in (filed[:4], period[:4]):
                    continue
                out.append(self._cand(cik, name, kind, t["accessionNumber"][i], filed, period, t["primaryDocument"][i]))
        # newest first, then (stable) the exact form before amendments and a filing in the year asked first
        out.sort(key=lambda c: c["filed"], reverse=True)
        out.sort(key=lambda c: (c["form"] != form.upper(), year is not None and c["filed"][:4] != str(year)))
        return out

    def _cand(self, cik, name, form, acc, filed, period, doc) -> dict:
        folder = f"{WWW}/Archives/edgar/data/{cik}/{acc.replace('-', '')}"
        doc = doc or f"{acc}.txt"
        title = f"{name} Form {form}, filed {filed}" + (f" (period {period})" if period else "")
        return {"ref": f"edgar:document:{cik}/{acc}", "source": "edgar", "kind": "document", "id": f"{cik}/{acc}",
                "title": title, "author": name, "authorUrl": f"{WWW}/cgi-bin/browse-edgar?action=getcompany&CIK={cik}",
                "page": f"{folder}/{acc}-index.htm", "url": f"{folder}/{doc}", "ext": doc.rsplit(".", 1)[-1].lower(),
                "licence": "SEC filing (public record)", "licenceUrl": "https://www.sec.gov/privacy#dissemination",
                "flags": [], "form": form.upper(), "filed": filed, "period": period, "cik": cik, "accession": acc, "company": name}

    def search(self, query, kind="document", n=10, orientation=None):
        cik, _ = self.cik(query)
        return self.filings(cik)[:n]

    def resolve(self, kind, ident):
        cik_s, acc = ident.split("/", 1)
        cik = int(cik_s)
        for c in self._all(cik):
            if c["accession"] == acc:
                return c
        raise MediaError(f"edgar: filing {acc} not found for CIK {cik}")

    def _all(self, cik: int) -> list[dict]:
        sub = self._json(f"{DATA}/submissions/CIK{cik:010d}.json", ttl=DAY)
        tables = [sub["filings"]["recent"]] + [self._json(f"{DATA}/submissions/{f['name']}", ttl=DAY) for f in sub["filings"].get("files", [])]
        for t in tables:
            for i, kind in enumerate(t.get("form", [])):
                yield self._cand(cik, sub.get("name", ""), kind, t["accessionNumber"][i], t["filingDate"][i],
                                 (t.get("reportDate") or [""] * len(t["form"]))[i] or "", t["primaryDocument"][i])


# ---- pages -------------------------------------------------------------------------------------------

PAGE_BREAK = re.compile(r"<[^>]*page-break-(?:before|after)\s*:\s*always[^>]*>|<PAGE>|\f", re.I)


def split_pages(doc: str) -> list[str]:
    """A filing's pages: split on the page breaks EDGAR documents carry (CSS page breaks, <PAGE>, form feeds)."""
    parts = [p for p in PAGE_BREAK.split(doc)]
    return [p for p in parts if re.sub(r"<[^>]+>|&nbsp;|\s", "", p)] or [doc]


def _visible(page: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", page).replace("&nbsp;", " ").replace("&#160;", " ")).lower()


def page_with(pages: list[str], text: str, nth: int = 1) -> int:
    """The `nth` page whose visible text contains `text` (case and spacing ignored), passing over the table of
    contents unless it is the only match; -1 if none."""
    want = re.sub(r"\s+", " ", text).strip().lower()
    hits = [i for i, p in enumerate(pages) if want in _visible(p)]
    body = [i for i in hits if "table of contents" not in _visible(pages[i])] or hits
    return body[nth - 1] if 0 < nth <= len(body) else -1
