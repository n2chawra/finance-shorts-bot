"""NASA Image and Video Library (images-api.nasa.gov): photos and video, no key.

NASA's own media are not copyrighted (US government works). Some items were made by others (a
contractor's or an agency's photo, an AP picture): when the photographer or secondary creator is not
NASA, or the description claims a copyright, the item is flagged and goes to the owner. The NASA
insignia and logos are never licensed, and no use may imply NASA endorses us (licence.NASA_RULES).
"""
from __future__ import annotations

import re
import urllib.parse

from ..store import MediaError, cache_root, get_json
from .base import Provider

API = "https://images-api.nasa.gov"
DAY = 24 * 3600
THIRD = re.compile(r"©|\bcopyright\b|\bcourtesy\b|\bgetty\b|\b(ap|reuters|afp) photo\b", re.I)
AGENCY = re.compile(r"\b(AP|Reuters|AFP|Getty|ESA|JAXA|Roscosmos|SpaceX|Boeing|Lockheed|Northrop|Blue Origin|"
                    r"Associated Press|Shutterstock|Alamy)\b")


def third_party(d: dict) -> list[str]:
    """Flags for an item that was not made by NASA (the owner decides those)."""
    flags = []
    for k in ("photographer", "secondary_creator"):     # NASA's own photographers are named too: only outside holders count
        v = (d.get(k) or "").strip()
        if v and (THIRD.search(v) or AGENCY.search(v)):
            flags.append(f"third-party credit: {v[:80]}")
    if THIRD.search(d.get("description") or ""):
        flags.append("third-party credit: the description names another rights holder")
    return flags


class Nasa(Provider):
    name = "nasa"
    interval = 0.5
    slug = "_shared"

    def _json(self, url: str, ttl: float = DAY) -> dict:
        return get_json(url, self.headers(), self.name, self.interval, cache_key=url, ttl=ttl, cache_dir=cache_root(self.slug))

    def search(self, query, kind="photo", n=10, orientation=None, category=None):
        params = {"q": query, "media_type": "video" if kind == "video" else "image", "page_size": max(1, min(n, 100))}
        if category:
            params["center"] = category
        items = (self._json(API + "/search?" + urllib.parse.urlencode(params)).get("collection") or {}).get("items") or []
        return [self._cand((it.get("data") or [{}])[0], kind) for it in items[:n] if it.get("data")]

    def resolve(self, kind, ident):
        items = (self._json(API + "/search?" + urllib.parse.urlencode({"nasa_id": ident})).get("collection") or {}).get("items") or []
        if not items or not items[0].get("data"):
            raise MediaError(f"nasa:{ident}: not in the NASA Image and Video Library")
        d = items[0]["data"][0]
        hrefs = [i.get("href", "") for i in ((self._json(f"{API}/asset/{urllib.parse.quote(ident)}", ttl=0).get("collection") or {})
                                              .get("items") or [])]
        kind = "video" if d.get("media_type") == "video" else "photo"
        order = ("~orig.mp4", "~large.mp4", "~medium.mp4", "~mobile.mp4") if kind == "video" else ("~large.jpg", "~orig.jpg", "~medium.jpg")
        url = next((h for want in order for h in hrefs if h.endswith(want)), "")
        if not url:
            raise MediaError(f"nasa:{ident}: no {'MP4' if kind == 'video' else 'JPEG'} file")
        return {**self._cand(d, kind), "url": url.replace("http://", "https://", 1).replace(" ", "%20"),
                "ext": url.rsplit(".", 1)[-1].lower()}

    def _cand(self, d: dict, kind: str) -> dict:
        nid = d.get("nasa_id", "")
        date = (d.get("date_created") or "")[:10]
        return {"ref": f"nasa:{kind}:{nid}", "source": "nasa", "kind": kind, "id": nid,
                "title": (d.get("title") or nid) + (f" ({date})" if date else ""),
                "author": d.get("photographer") or d.get("secondary_creator") or f"NASA{' ' + d['center'] if d.get('center') else ''}",
                "authorUrl": "", "page": f"https://images.nasa.gov/details/{urllib.parse.quote(nid)}", "url": "",
                "ext": "mp4" if kind == "video" else "jpg", "licence": "NASA media (public domain, US government work)",
                "licenceUrl": "https://www.nasa.gov/nasa-brand-center/images-and-media/", "flags": third_party(d)}
