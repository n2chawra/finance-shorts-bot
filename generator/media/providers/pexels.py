"""Pexels (pexels.com/api): photos and videos, free commercial use. 200 requests/h, 20,000/month."""
from __future__ import annotations

import urllib.parse

from ..store import get_json
from .base import Provider, best_video_file

API = "https://api.pexels.com"


class Pexels(Provider):
    name = "pexels"
    interval = 1.0
    key_env = "PEXELS_API_KEY"
    signup = "https://www.pexels.com/api/ (free account)"

    def headers(self) -> dict:
        return {**super().headers(), "Authorization": self.key()}

    def _get(self, path: str, params: dict | None = None) -> dict:
        url = API + path + ("?" + urllib.parse.urlencode(params) if params else "")
        return get_json(url, self.headers(), self.name, self.interval)

    def search(self, query, kind="video", n=10, orientation=None):
        p = {"query": query, "per_page": max(1, min(n, 80))}
        if orientation:
            p["orientation"] = orientation          # landscape | portrait | square
        if kind == "video":
            return [self._video(v) for v in self._get("/videos/search", p).get("videos", [])]
        return [self._photo(v) for v in self._get("/v1/search", p).get("photos", [])]

    def resolve(self, kind, ident):
        return self._video(self._get(f"/videos/videos/{int(ident)}")) if kind == "video" \
            else self._photo(self._get(f"/v1/photos/{int(ident)}"))

    def _video(self, v: dict) -> dict:
        f = best_video_file([x for x in v.get("video_files", []) if x.get("file_type") == "video/mp4"]) or {}
        user = v.get("user") or {}
        return {"ref": f"pexels:video:{v['id']}", "source": "pexels", "kind": "video", "id": str(v["id"]),
                "title": urllib.parse.unquote((v.get("url") or "").rstrip("/").rsplit("/", 1)[-1]) or f"Pexels video {v['id']}",
                "author": user.get("name") or "Unknown", "authorUrl": user.get("url", ""), "page": v.get("url", ""),
                "url": f.get("link", ""), "ext": "mp4", "licence": "Pexels License", "licenceUrl": "https://www.pexels.com/license/",
                "flags": [], "width": f.get("width") or v.get("width"), "height": f.get("height") or v.get("height"),
                "durationSec": v.get("duration")}

    def _photo(self, p: dict) -> dict:
        src = p.get("src") or {}
        url = src.get("large2x") or src.get("original", "")
        return {"ref": f"pexels:photo:{p['id']}", "source": "pexels", "kind": "photo", "id": str(p["id"]),
                "title": p.get("alt") or f"Pexels photo {p['id']}", "author": p.get("photographer") or "Unknown",
                "authorUrl": p.get("photographer_url", ""), "page": p.get("url", ""), "url": url,
                "ext": "png" if ".png" in url.split("?")[0].lower() else "jpg", "licence": "Pexels License",
                "licenceUrl": "https://www.pexels.com/license/", "flags": [], "width": p.get("width"), "height": p.get("height")}
