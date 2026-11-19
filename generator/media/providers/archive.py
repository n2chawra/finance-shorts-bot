"""Internet Archive (archive.org): public-domain film, the Prelinger Archives first. No key.

Search is archive.org's Advanced Search; one item's files and licence come from the Metadata API
(archive.org/metadata/<id>). The licence is the item's `licenseurl` (else its `rights` text): only
public domain, CC0 and CC BY pass on their own (licence.classify); an item with neither field is
"review", because archive.org gives no warranty on Prelinger films. A film's soundtrack may still be
copyrighted, so every clip is logged with "mute" (our sound is synthesised anyway). We pick an MP4
derivative (h.264 first) that fits under the size cap.
"""
from __future__ import annotations

import re
import urllib.parse

from ..store import MediaError, cache_root, get_json
from .base import Provider

SEARCH = "https://archive.org/advancedsearch.php"
META = "https://archive.org/metadata/"
DETAILS = "https://archive.org/details/"
DOWNLOAD = "https://archive.org/download/"
HOUR = 3600
FIELDS = ("identifier", "title", "creator", "year", "licenseurl", "rights", "collection")

# Public-domain film collections worth searching for 1930s-70s b-roll (offices, factories, retail, ads).
COLLECTIONS = ("prelinger",)
MP4 = re.compile(r"mpeg4|h\.264|mp4", re.I)


def licence_name(url: str | None, rights: str | None) -> str:
    """A readable licence name from a Creative Commons URL (else the rights text, else '')."""
    u = (url or "").strip().lower()
    if u:
        if "publicdomain/mark" in u:
            return "Public Domain Mark 1.0"
        if "publicdomain/zero" in u:
            return "CC0 1.0"
        if "licenses/publicdomain" in u:
            return "Public domain (CC Public Domain Dedication)"
        m = re.search(r"licenses/([a-z-]+)/(\d(?:\.\d)?)", u)
        if m:
            return f"CC {m.group(1).upper()} {m.group(2)}"
        return url.strip()
    r = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", rights or "")).strip()
    return r[:200]


def _one(v) -> str:
    return (v[0] if isinstance(v, list) and v else v or "") if not isinstance(v, (int, float)) else str(v)


def best_mp4(files: list[dict], max_bytes: int) -> dict | None:
    """The best MP4 under `max_bytes`: largest frame, h.264 derivatives before the original; else the smallest MP4."""
    mp4 = [f for f in files if f.get("name", "").lower().endswith(".mp4") and MP4.search(f.get("format") or "")]
    if not mp4:
        return None
    size = lambda f: int(f.get("size") or 0)
    area = lambda f: int(f.get("width") or 0) * int(f.get("height") or 0)
    fits = [f for f in mp4 if 0 < size(f) <= max_bytes]
    if fits:
        return max(fits, key=lambda f: (area(f), (f.get("format") or "").lower() == "h.264", -size(f)))
    return min(mp4, key=size)


class Archive(Provider):
    name = "archive"
    interval = 1.0          # archive.org asks for a polite rate; no published number
    slug = "_shared"
    max_mb = 400

    def _json(self, url: str, ttl: float = HOUR) -> dict:
        return get_json(url, self.headers(), self.name, self.interval, cache_key=url, ttl=ttl, cache_dir=cache_root(self.slug))

    def search(self, query, kind="video", n=10, orientation=None, category=None):
        if kind != "video":
            return []
        colls = [c.strip() for c in (category or "").split("|") if c.strip()] or list(COLLECTIONS)
        q = f"({query}) AND mediatype:movies AND collection:({' OR '.join(colls)})"
        params = [("q", q), *[("fl[]", f) for f in FIELDS], ("rows", max(1, min(n, 100))), ("page", 1),
                  ("sort[]", "downloads desc"), ("output", "json")]
        docs = ((self._json(SEARCH + "?" + urllib.parse.urlencode(params)).get("response") or {}).get("docs")) or []
        return [self._cand(d) for d in docs]

    def resolve(self, kind, ident):
        meta = self._json(META + urllib.parse.quote(ident), ttl=0)
        m = meta.get("metadata") or {}
        if not m:
            raise MediaError(f"archive:{ident}: no such item on archive.org")
        if _one(m.get("mediatype")) != "movies":
            raise MediaError(f"archive:{ident}: is {_one(m.get('mediatype')) or 'not a film'}, not a film")
        f = best_mp4(meta.get("files") or [], self.max_mb << 20)
        if not f:
            raise MediaError(f"archive:{ident}: no MP4 file in the item")
        c = self._cand(m)
        length = f.get("length") or ""
        secs = float(length) if re.fullmatch(r"[\d.]+", length) else None
        c.update({"url": DOWNLOAD + urllib.parse.quote(ident) + "/" + urllib.parse.quote(f["name"]), "file": f["name"],
                  "width": int(f["width"]) if f.get("width") else None, "height": int(f["height"]) if f.get("height") else None,
                  "durationSec": round(secs, 2) if secs else None, "sound": _one(m.get("sound"))})
        return c

    def _cand(self, d: dict) -> dict:
        ident = _one(d.get("identifier"))
        lic_url = _one(d.get("licenseurl"))
        year = _one(d.get("year")) or _one(d.get("date"))[:4]
        title = _one(d.get("title")) or ident
        colls = d.get("collection") or []
        colls = [colls] if isinstance(colls, str) else colls
        return {"ref": f"archive:video:{ident}", "source": "archive", "kind": "video", "id": ident,
                "title": title + (f" ({year})" if year and year not in title else ""),
                "author": _one(d.get("creator")) or ("Prelinger Archives" if "prelinger" in colls else "Unknown"),
                "authorUrl": "", "page": DETAILS + ident, "url": "", "ext": "mp4",
                "licence": licence_name(lic_url, _one(d.get("rights"))),
                "licenceUrl": lic_url if lic_url.startswith("http") else "",
                "flags": [], "collection": colls, "year": year}
