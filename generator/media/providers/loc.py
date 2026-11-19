"""Library of Congress (loc.gov JSON API): historic photos, and film where it is free to use. No key.

The JSON API allows 20 requests a minute (150 for image files) and blocks a client that goes over for
an hour, so requests are spaced 3.2 s apart and a 429 is waited out (store.open_url). loc.gov sits
behind Cloudflare: when it answers with a challenge page (403), we stop with a clear message and never
try to get past it. The licence is the item's rights advisory: "No known restrictions" passes;
anything else (rights not evaluated, publicity limits, copyright) is for the owner to decide.
"""
from __future__ import annotations

import re
import urllib.error
import urllib.parse

from ..store import MediaError, cache_root, get_json
from .base import Provider

WWW = "https://www.loc.gov"
DAY = 24 * 3600
IMAGE = ("image/jpeg", "image/png", "image/gif")


def _first(v) -> str:
    while isinstance(v, list):
        v = v[0] if v else ""
    return str(v or "").strip()


def _item_id(ident: str) -> str:
    """'2017762891', 'http://www.loc.gov/item/2017762891/' or 'https://www.loc.gov/pictures/item/…' → '2017762891'."""
    m = re.search(r"/item/([^/?#]+)", ident)
    return (m.group(1) if m else ident).strip("/ ")


def rights_text(d: dict) -> str:
    """The item's rights advisory (search results and item JSON both carry it in a few shapes)."""
    item = d.get("item") if isinstance(d.get("item"), dict) else {}
    for v in (d.get("rights_advisory"), item.get("rights_advisory"), d.get("rights_information"), item.get("rights_information")):
        t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", _first(v))).strip()
        if t:
            return t[:300]
    return ""


def best_file(resources: list[dict], kind: str, max_width: int = 3000) -> dict | None:
    """The largest JPEG/PNG no wider than `max_width` (TIFF masters are skipped), or the largest MP4 for film."""
    files = [f for r in resources or [] for group in (r.get("files") or []) for f in (group if isinstance(group, list) else [group])
             if isinstance(f, dict) and f.get("url")]
    if kind == "video":
        vids = [f for f in files if (f.get("mimetype") or "").startswith("video/mp4")]
        return max(vids, key=lambda f: (f.get("width") or 0) * (f.get("height") or 0) or f.get("size") or 0, default=None)
    imgs = [f for f in files if (f.get("mimetype") or "") in IMAGE and (f.get("width") or 0) <= max_width]
    return max(imgs, key=lambda f: (f.get("width") or 0) * (f.get("height") or 0), default=None)


class Loc(Provider):
    name = "loc"
    interval = 3.2          # 20 requests/min on the JSON API, with margin
    file_interval = 0.5     # 150/min for image files
    slug = "_shared"

    def _json(self, url: str, ttl: float = DAY) -> dict:
        try:
            return get_json(url, {**self.headers(), "Accept": "application/json"}, self.name, self.interval,
                            cache_key=url, ttl=ttl, cache_dir=cache_root(self.slug))
        except urllib.error.HTTPError as e:
            if e.code == 403:
                raise MediaError("loc: loc.gov answered with a bot challenge (HTTP 403), so its JSON API is closed to scripts from "
                                 "this network right now. Try again later (never solve the challenge); many LoC photos are "
                                 "also on Wikimedia Commons with the same rights") from None
            if e.code == 429:
                raise MediaError("loc: rate limited (HTTP 429); loc.gov blocks for up to an hour, so wait before retrying") from None
            raise

    def search(self, query, kind="photo", n=10, orientation=None, category=None):
        base = f"{WWW}/collections/{category.strip('/ ')}/" if category else (f"{WWW}/photos/" if kind == "photo" else f"{WWW}/film-and-videos/")
        params = {"q": query, "fo": "json", "c": max(1, min(n, 100))}
        if category:
            params["fa"] = "online-format:image" if kind == "photo" else "online-format:video"
        data = self._json(base + "?" + urllib.parse.urlencode(params))
        out = []
        for r in data.get("results") or []:
            if r.get("access_restricted"):
                continue
            ident = _item_id(r.get("id") or r.get("url") or "")
            if not ident:
                continue
            imgs = [u for u in (r.get("image_url") or []) if isinstance(u, str)]
            out.append(self._cand(ident, kind, r, url="", width=None, height=None, preview=imgs[-1] if imgs else ""))
        return out

    def resolve(self, kind, ident):
        iid = _item_id(ident)
        data = self._json(f"{WWW}/item/{urllib.parse.quote(iid)}/?fo=json", ttl=0)
        item = data.get("item") or {}
        if not item:
            raise MediaError(f"loc:{iid}: no such item")
        if item.get("access_restricted") or data.get("access_restricted"):
            raise MediaError(f"loc:{iid}: access restricted (only viewable at the Library)")
        f = best_file(data.get("resources") or [], kind)
        if not f:
            raise MediaError(f"loc:{iid}: no {'MP4' if kind == 'video' else 'JPEG/PNG'} file online")
        url = f["url"] if f["url"].startswith("http") else "https:" + f["url"] if f["url"].startswith("//") else WWW + f["url"]
        return self._cand(iid, kind, {**item, "rights_advisory": rights_text(data) or rights_text(item)}, url=url.split("#")[0],
                          width=f.get("width"), height=f.get("height"))

    def _cand(self, iid: str, kind: str, d: dict, url: str, width, height, preview: str = "") -> dict:
        title = _first(d.get("title")) or iid
        date = _first(d.get("date")) or _first(d.get("created_published"))
        author = _first(d.get("contributor_names")) or _first(d.get("contributor")) or _first(d.get("creator")) or "Unknown"
        part = d.get("partof")
        part = part[0] if isinstance(part, list) and part else part
        coll = _first(part.get("title")) if isinstance(part, dict) else _first(part)
        rights_url = _first(d.get("rights")) if _first(d.get("rights")).startswith("http") else f"{WWW}/legal/"
        ext = (url.split("?")[0].rsplit(".", 1)[-1].lower() if "." in url.rsplit("/", 1)[-1] else "jpg") if url else ("mp4" if kind == "video" else "jpg")
        return {"ref": f"loc:{kind}:{iid}", "source": "loc", "kind": kind, "id": iid,
                "title": title + (f" ({date})" if date and date not in title else ""), "author": author, "authorUrl": "",
                "page": f"{WWW}/item/{iid}/", "url": url, "ext": "jpg" if ext == "jpeg" else ext,
                "licence": rights_text(d), "licenceUrl": rights_url, "flags": [], "collection": coll,
                "width": width, "height": height, "preview": preview}
