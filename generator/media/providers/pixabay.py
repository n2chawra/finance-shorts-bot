"""Pixabay (pixabay.com/api/docs): photos and videos. 100 requests/60 s; responses must be cached 24 h;
files are downloaded, never hotlinked; no systematic mass downloading."""
from __future__ import annotations

import urllib.parse

from ..store import cache_root, get_json
from .base import Provider

API = "https://pixabay.com/api/"
DAY = 24 * 3600


class Pixabay(Provider):
    name = "pixabay"
    interval = 0.7
    key_env = "PIXABAY_API_KEY"
    signup = "https://pixabay.com/api/docs/ (free account)"
    slug = "_shared"   # the 24 h response cache sits in the channel's cache; library sets this

    def _get(self, kind: str, params: dict) -> dict:
        base = API + ("videos/" if kind == "video" else "")
        cache_key = base + "?" + urllib.parse.urlencode(sorted(params.items()))   # without the key
        url = base + "?" + urllib.parse.urlencode({"key": self.key(), **params})
        return get_json(url, self.headers(), self.name, self.interval, cache_key=cache_key, ttl=DAY,
                        cache_dir=cache_root(self.slug))

    def search(self, query, kind="video", n=10, orientation=None):
        p = {"q": query[:100], "per_page": max(3, min(n, 200)), "safesearch": "true"}
        if kind == "photo":
            p["image_type"] = "photo"
            if orientation in ("landscape", "portrait"):
                p["orientation"] = "horizontal" if orientation == "landscape" else "vertical"
        hits = self._get(kind, p).get("hits", [])[:n]
        return [self._video(h) if kind == "video" else self._photo(h) for h in hits]

    def resolve(self, kind, ident):
        hits = self._get(kind, {"id": str(int(ident))}).get("hits", [])
        if not hits:
            from ..store import MediaError
            raise MediaError(f"pixabay:{kind}:{ident} not found")
        return self._video(hits[0]) if kind == "video" else self._photo(hits[0])

    def _common(self, h: dict, kind: str) -> dict:
        user = h.get("user") or "Unknown"
        return {"ref": f"pixabay:{kind}:{h['id']}", "source": "pixabay", "kind": kind, "id": str(h["id"]),
                "title": h.get("tags") or f"Pixabay {kind} {h['id']}", "author": user,
                "authorUrl": f"https://pixabay.com/users/{user}-{h.get('user_id')}/" if h.get("user_id") else "",
                "page": h.get("pageURL", ""), "licence": "Pixabay Content License",
                "licenceUrl": "https://pixabay.com/service/license-summary/", "flags": []}

    def _video(self, h: dict) -> dict:
        vids = h.get("videos") or {}
        f = next((vids[q] for q in ("large", "medium", "small", "tiny") if (vids.get(q) or {}).get("url")), {})
        return {**self._common(h, "video"), "url": f.get("url", ""), "ext": "mp4", "width": f.get("width"),
                "height": f.get("height"), "durationSec": h.get("duration")}

    def _photo(self, h: dict) -> dict:
        url = h.get("largeImageURL") or h.get("webformatURL", "")
        return {**self._common(h, "photo"), "url": url, "ext": url.rsplit(".", 1)[-1].lower() if "." in url[-6:] else "jpg",
                "width": h.get("imageWidth"), "height": h.get("imageHeight")}
