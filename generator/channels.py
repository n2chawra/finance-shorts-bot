"""Which channel a command works on, and where that channel's files live.

Every channel's own files (profile, topic feed, history, videos, metrics, the weekly loop…) live in
`channels/<slug>/`; shared code and settings stay where they are. `config/channel-layout.json` maps
each legacy repo path to its place in a channel folder. A channel whose folder doesn't exist yet
(the tests' temporary repos) keeps the legacy paths, so the pipeline behaves the same either way.

The channel is `--channel` on a command (which sets `CHANNEL` for its subprocesses too), else the
`CHANNEL` environment variable, else the layout's default (`geography-maps-geopolitical-mysteries`).

A channel the owner deleted on the dashboard is `deleted()`: config/channels.json (written by ingest) no
longer lists it, or lists it as being deleted, or its folder is gone (delete-channel.yml). `generator.run`
then does nothing for it: `state` answers `{"stop": "channel deleted"}` so the routine disables itself, and
every other command fails before it writes a file (a deleted channel's paths would fall back to the repo root).
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


GONE = ("deleting", "deleted")
STOP = {"stop": "channel deleted"}


class ChannelDeleted(RuntimeError):
    """A command named a channel the owner deleted."""


def _entries(root: Path) -> dict | None:
    f = root / "config" / "channels.json"
    if not f.is_file():
        return None
    try:
        entries = json.loads(f.read_text(encoding="utf-8")).get("channels")
    except (ValueError, AttributeError):
        return None
    return entries if isinstance(entries, dict) and entries else None


def deleted(slug: str | None = None, root: Path = ROOT) -> bool:
    """True when the channel was deleted, or is being deleted: config/channels.json lists other channels but not
    this one, or lists it as deleting; or other channels have folders and this one's is gone. A repo with
    neither file nor folders (the tests' temporary repos) has no deleted channel."""
    slug = slug or current()
    entries = _entries(root)
    if entries is not None:
        entry = entries.get(slug)
        if not isinstance(entry, dict) or entry.get("status") in GONE:
            return True
    base = root / "channels"
    if base.is_dir() and any(p.is_dir() and SLUG.match(p.name) for p in base.iterdir()) and not (base / slug).is_dir():
        return True
    return False


def require_live(slug: str | None = None, root: Path = ROOT) -> str:
    """The channel, or ChannelDeleted when it was deleted (so nothing is written for it)."""
    slug = slug or current()
    if deleted(slug, root):
        raise ChannelDeleted(f"channel {slug!r} was deleted (config/channels.json no longer runs it): nothing to do")
    return slug


def all_channels(root: Path = ROOT) -> list[str]:
    """Every channel with a folder that isn't being deleted, else just the default (before the move)."""
    base = root / "channels"
    found = sorted(p.name for p in base.iterdir() if p.is_dir() and SLUG.match(p.name)) if base.is_dir() else []
    entries = _entries(root)
    if entries is not None:   # a channel being deleted still has its folder until delete-channel.yml runs
        found = [s for s in found if (entries.get(s) or {}).get("status") not in GONE]
    return found or [default()]


PROMPT_NAME = re.compile(r"^[a-z][a-z0-9_-]*$")


def prompt_files(name: str, slug: str | None = None, root: Path = ROOT) -> list[Path]:
    """The files of an agent prompt: the shared generator/prompts/<name>.md, then the channel's own
    channels/<slug>/prompts/<name>.md when it has one (its additions; where they differ, the channel's wins)."""
    if not PROMPT_NAME.match(name):
        raise ValueError(f"bad prompt name {name!r}")
    files = [f for f in (root / "generator" / "prompts" / f"{name}.md", channel_root(slug, root) / "prompts" / f"{name}.md") if f.is_file()]
    if not files:
        raise ValueError(f"no prompt called {name!r} (generator/prompts/{name}.md)")
    return files


def prompt(name: str, slug: str | None = None, root: Path = ROOT) -> str:
    """The prompt an agent follows: the shared one with the channel's own appended."""
    parts = []
    for f in prompt_files(name, slug, root):
        text = f.read_text(encoding="utf-8").rstrip()
        if parts:
            text = (f"\n\n---\n\n<!-- {f.relative_to(root).as_posix()}: this channel's own additions; "
                    f"where they differ from the shared prompt above, these win -->\n\n" + text)
        parts.append(text)
    return "".join(parts) + "\n"
