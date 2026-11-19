"""Wikimedia Commons: photos and video (WebM/Ogg), PD, CC0, CC BY and CC BY-SA only.

Reuses generator/images.py (its API calls, User-Agent, licence filter and metadata parsing). A
photo is fetched as a 1920 px rendition; a video as the original file (Commons has no MP4)."""
from __future__ import annotations

from ... import images
from ..store import MediaError
from .base import Provider

IIPROP = {"prop": "imageinfo", "iiprop": "url|size|mime|mediatype|extmetadata", "iiurlwidth": 1920}


class Commons(Provider):
    name = "commons"
    interval = 0.5

    def search(self, query, kind="video", n=10, orientation=None):
        ft = "filetype:video" if kind == "video" else "filetype:bitmap|drawing"
        q = images._get({"action": "query", "generator": "search", "gsrsearch": f"{query} {ft}", "gsrnamespace": 6,
                         "gsrlimit": max(1, min(n, 50)), **IIPROP})
        pages = sorted((q.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
        return [self._cand(p) for p in pages if "imageinfo" in p]

    def resolve(self, kind, ident):
        title = ident if ident.startswith("File:") else f"File:{ident}"
        page = next(iter(images._get({"action": "query", "titles": title, **IIPROP})["query"]["pages"].values()))
        if "imageinfo" not in page:
            raise MediaError(f"{title}: not a file on Wikimedia Commons")
        return self._cand(page)

    def _cand(self, page: dict) -> dict:
        e = images._entry(page)
        ii = page["imageinfo"][0]
        video = (ii.get("mime") or "").startswith(("video/", "application/ogg")) or ii.get("mediatype") == "VIDEO"
        kind = "video" if video else "photo"
        url = (ii["url"] if video or (ii.get("mime") or "").endswith("svg+xml") and not ii.get("thumburl") else e["url"]).split("?utm_")[0]
        ext = url.split("?")[0].rsplit(".", 1)[-1].lower()
        return {"ref": f"commons:{kind}:{page['title']}", "source": "commons", "kind": kind, "id": page["title"],
                "title": page["title"], "author": e["author"], "authorUrl": "", "page": e["page"], "url": url, "ext": ext,
                "licence": e["license"], "licenceUrl": e["licenseUrl"], "flags": [e["restrictions"]] if e["restrictions"] else [],
                "width": ii.get("width"), "height": ii.get("height"),
                "durationSec": round(float(ii["duration"]), 2) if ii.get("duration") else None}
