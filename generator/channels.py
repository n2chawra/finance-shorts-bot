"""Which channel a command works on, and where that channel's files live.

Every channel's own files (profile, topic feed, history, videos, metrics, the weekly loop…) live in
`channels/<slug>/`; shared code and settings stay where they are. `config/channel-layout.json` maps
each legacy repo path to its place in a channel folder. A channel whose folder doesn't exist yet
(Paisa Panchayat before the move, and the tests' temporary repos) keeps the legacy paths, so the
pipeline behaves the same either way.

The channel is `--channel` on a command (which sets `CHANNEL` for its subprocesses too), else the
`CHANNEL` environment variable, else the layout's default (`paisa-panchayat`).
"""
from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYOUT = ROOT / "config" / "channel-layout.json"
SLUG = re.compile(r"^[a-z0-9][a-z0-9-]{1,40}$")


@lru_cache(maxsize=1)
def layout() -> dict:
    return json.loads(LAYOUT.read_text(encoding="utf-8"))


def default() -> str:
    return layout()["default"]


def current() -> str:
    slug = os.environ.get("CHANNEL") or default()
    if not SLUG.match(slug):
        raise ValueError(f"bad channel slug {slug!r}")
    return slug


def use(slug: str | None) -> str:
    """Make `slug` the channel for this process and its subprocesses; returns the channel in use."""
    if slug:
        if not SLUG.match(slug):
            raise ValueError(f"bad channel slug {slug!r}")
        os.environ["CHANNEL"] = slug
    return current()


def channel_root(slug: str | None = None, root: Path = ROOT) -> Path:
    return root / "channels" / (slug or current())


def moved(slug: str | None = None, root: Path = ROOT) -> bool:
    """True once the channel has its own folder (its files are read from there)."""
    return channel_root(slug, root).is_dir()


def _mapped(rel: "str | Path") -> str | None:
    rel = rel.as_posix() if isinstance(rel, Path) else rel.replace("\\", "/")
    if rel.startswith("./"):
        rel = rel[2:]
    best: tuple[str, str] | None = None
    for key, value in layout()["map"].items():
        if key.endswith("/") and rel.startswith(key):
            hit = value + rel[len(key):]
        elif rel == key.rstrip("/"):
            hit = value.rstrip("/")
        else:
            continue
        if best is None or len(key) > len(best[0]):
            best = (key, hit)
    return best[1] if best else None


def cpath(root: Path, rel: "str | Path", slug: str | None = None) -> Path:
    """The path of a per-channel file given by its legacy repo-relative path `rel`.

    Inside the channel folder once it exists; otherwise (or for a shared path) `root / rel`.
    """
    mapped = _mapped(rel)
    if mapped is not None and moved(slug, root):
        return channel_root(slug, root) / mapped
    return root / rel


def rel(root: Path, legacy: "str | Path", slug: str | None = None) -> str:
    """`cpath` as a repo-relative POSIX string (for git, release notes and prompts)."""
    return cpath(root, legacy, slug).relative_to(root).as_posix()


def all_channels(root: Path = ROOT) -> list[str]:
    """Every channel with a folder, else just the default (before the move)."""
    base = root / "channels"
    found = sorted(p.name for p in base.iterdir() if p.is_dir() and SLUG.match(p.name)) if base.is_dir() else []
    return found or [default()]
