"""Where media lives (the cache outside git, the render staging folder, the licence log) and polite HTTP."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from ..channels import channel_root

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CACHE = Path("E:/media-cache")


class MediaError(Exception):
    """A problem the user can fix (a missing key, a bad reference, a refused licence): printed, never a traceback."""


# ---- paths -------------------------------------------------------------------------------------------

def cache_root(slug: str) -> Path:
    """The channel's media cache, outside the repo (MEDIA_CACHE, default E:\\media-cache)."""
    base = Path(os.environ.get("MEDIA_CACHE") or DEFAULT_CACHE)
    return base / slug


def stage_root(slug: str, root: Path = ROOT) -> Path:
    """Where a render reads its media: remotion/public/media/<slug>/ (git-ignored)."""
    return root / "remotion" / "public" / "media" / slug


def log_path(slug: str, root: Path = ROOT) -> Path:
    return channel_root(slug, root) / "media" / "licences.json"


# ---- the licence log ---------------------------------------------------------------------------------

def load_log(slug: str, root: Path = ROOT) -> dict[str, dict]:
    p = log_path(slug, root)
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}


def save_log(slug: str, log: dict[str, dict], root: Path = ROOT) -> None:
    p = log_path(slug, root)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(dict(sorted(log.items())), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(p)


def record(slug: str, rec: dict, root: Path = ROOT) -> dict:
    """Add or replace one asset's record (keyed by its id)."""
    log = load_log(slug, root)
    log[rec["id"]] = rec
    save_log(slug, log, root)
    return rec


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def probe(path: Path, kind: str) -> dict:
    """Size, and duration/dimensions where they can be read (ffprobe for video, Pillow for images)."""
    out: dict = {"bytes": path.stat().st_size}
    if kind == "video" and shutil.which("ffprobe"):
        try:
            r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                "stream=width,height:format=duration", "-of", "json", str(path)],
                               capture_output=True, text=True, timeout=60)
            j = json.loads(r.stdout or "{}")
            st = (j.get("streams") or [{}])[0]
            out.update({k: v for k, v in {"width": st.get("width"), "height": st.get("height"),
                                          "durationSec": round(float((j.get("format") or {}).get("duration") or 0), 2) or None}.items() if v})
        except (OSError, ValueError, subprocess.SubprocessError):
            pass
    elif path.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".tif", ".tiff"):
        try:
            from PIL import Image
            with Image.open(path) as im:
                out.update({"width": im.width, "height": im.height})
        except Exception:   # noqa: BLE001 - a size we can't read is just left out
            pass
    return out


# ---- HTTP --------------------------------------------------------------------------------------------

_last: dict[str, float] = {}
_lock = threading.Lock()


def _wait(bucket: str, interval: float) -> None:
    with _lock:
        gap = time.monotonic() - _last.get(bucket, 0.0)
        if gap < interval:
            time.sleep(interval - gap)
        _last[bucket] = time.monotonic()


def open_url(url: str, headers: dict, bucket: str, interval: float, timeout: int = 60):
    """GET with a per-source rate limit, waiting out 429/503 (Retry-After) a few times."""
    for attempt in range(6):
        _wait(bucket, interval)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == 5:
                raise
            time.sleep(max(float(e.headers.get("Retry-After") or 0), 2 ** attempt))
    raise RuntimeError("unreachable")


def get_json(url: str, headers: dict, bucket: str, interval: float, cache_key: str | None = None,
             ttl: float = 0, cache_dir: Path | None = None) -> dict:
    """A JSON GET, optionally cached on disk for `ttl` seconds (Pixabay's terms require 24 h).
    `cache_key` names the entry so an API key in the URL never ends up in a file name."""
    f = None
    if ttl and cache_key and cache_dir:
        f = cache_dir / "_http" / bucket / (hashlib.sha256(cache_key.encode()).hexdigest()[:32] + ".json")
        if f.is_file() and time.time() - f.stat().st_mtime < ttl:
            return json.loads(f.read_text(encoding="utf-8"))
    with open_url(url, headers, bucket, interval) as r:
        data = json.load(r)
    if f:
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps(data), encoding="utf-8")
    return data


def download(url: str, dest: Path, headers: dict, bucket: str, interval: float, max_bytes: int | None = None) -> Path:
    """Stream a file to `dest` (via a .part file), refusing anything over `max_bytes`."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    part = dest.with_name(dest.name + ".part")
    n = 0
    with open_url(url, headers, bucket, interval, timeout=120) as r, open(part, "wb") as f:
        for chunk in iter(lambda: r.read(1 << 20), b""):
            n += len(chunk)
            if max_bytes and n > max_bytes:
                f.close()
                part.unlink(missing_ok=True)
                raise MediaError(f"{url}: over {max_bytes // (1 << 20)} MB; pick a smaller rendition or raise --max-mb")
            f.write(chunk)
    part.replace(dest)
    return dest


_snapshots: dict[str, str | None] = {}


def licence_snapshot(url: str, headers: dict) -> str | None:
    """sha256 of the licence page as it reads today (proof of the terms on the fetch date); None if unreachable."""
    if url not in _snapshots:
        try:
            with open_url(url, {"User-Agent": headers.get("User-Agent", "Mozilla/5.0")}, "licence", 1.0, timeout=30) as r:
                _snapshots[url] = hashlib.sha256(r.read()).hexdigest()
        except Exception:   # noqa: BLE001 - the snapshot is best effort; the record still says which terms applied
            _snapshots[url] = None
    return _snapshots[url]
