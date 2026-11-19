"""One interface for every source: search(query, kind, n) -> candidates; resolve(ref) -> one candidate.

A candidate is a plain dict: ref (`<source>:<kind>:<id>`, what `fetch` takes), source, kind (video |
photo | document), id, title, author, authorUrl, page (the human page), url (the file to download),
ext, licence, licenceUrl, flags (the source's own restriction tags), width, height, durationSec.
The library downloads `url`, hashes it and writes the licence record, so a provider only talks to its API.
"""
from __future__ import annotations

import os

from ..store import MediaError

KINDS = ("video", "photo")


class Provider:
    name = "base"
    interval = 1.0              # seconds between requests (the source's rate limit, with margin)
    key_env: str | None = None  # the environment variable holding the API key, if one is needed
    signup = ""                 # where the owner gets that key

    def key(self) -> str:
        if not self.key_env:
            return ""
        k = os.environ.get(self.key_env, "").strip()
        if not k:
            raise MediaError(f"{self.name}: set {self.key_env} (a free key from {self.signup}); "
                             f"Commons and EDGAR work without keys")
        return k

    def headers(self) -> dict:
        from ...images import user_agent
        return {"User-Agent": user_agent()}

    def search(self, query: str, kind: str = "video", n: int = 10, orientation: str | None = None) -> list[dict]:
        raise NotImplementedError

    def resolve(self, kind: str, ident: str) -> dict:
        raise NotImplementedError


def best_video_file(files: list[dict], max_width: int = 1920) -> dict | None:
    """The largest MP4 rendition no wider than `max_width` (1080p is plenty for a 1080p render)."""
    mp4 = [f for f in files if f.get("url") and (f.get("width") or 0) <= max_width]
    return max(mp4, key=lambda f: (f.get("width") or 0) * (f.get("height") or 0), default=None)
