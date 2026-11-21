"""history/history.json: one entry per shipped video, oldest first. It is the source of truth for
the variety rules inside routines. history/template_work.json logs template-building runs."""
import json
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .settings import ROOT
from . import channels
from .channels import cpath

IST = timezone(timedelta(hours=5, minutes=30))
REQUIRED = ("id", "created_at", "template", "topic", "title", "description", "hook_style", "cta", "style")


def now() -> datetime:
    return datetime.now(timezone.utc)


def ist_day(iso: str) -> str:
    """YYYY-MM-DD in IST for an ISO timestamp."""
    return datetime.fromisoformat(iso).astimezone(IST).strftime("%Y-%m-%d")


def _read(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError(f"{path} must contain a JSON list")
    return data


def _write(path: Path, data: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def load(root: Path = ROOT) -> list[dict]:
    return _read(cpath(root, "history/history.json"))


def append(entry: dict, root: Path = ROOT) -> None:
    """Add a shipped video. Refuses incomplete entries and duplicate ids."""
    missing = [k for k in REQUIRED if k not in entry]
    if missing:
        raise ValueError(f"history entry is missing {', '.join(missing)}")
    entries = load(root)
    if any(e["id"] == entry["id"] for e in entries):
        raise ValueError(f"history already has {entry['id']}")
    _write(cpath(root, "history/history.json"), [*entries, entry])


def of_format(entries: list[dict], fmt: str = "short") -> list[dict]:
    """Entries of one format. Videos shipped before long-form existed have no `format`."""
    return [e for e in entries if e.get("format", "short") == fmt]


# Each channel numbers its ids from its own block of ten (channel 0: 01-10, channel 1: 11-20, ...), so two
# channels' runs that start at the same time never pick the same id (2026-11-21: Paisa Panchayat's Uber Short
# and How Tech Works' transistor Short were both v-20261121-01, and the second mp4 landed in the first one's
# release). Blocks are kept in config/id-blocks.json and only ever appended to, so a channel keeps its block.
ID_BLOCKS = "config/id-blocks.json"
BLOCK = 10


def id_block(slug: str | None = None, root: Path = ROOT) -> int:
    """The channel's block number, assigned on first use (the next free one)."""
    slug = slug or channels.current()
    f = root / ID_BLOCKS
    data = json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {}
    blocks: dict = data.setdefault("blocks", {})
    if slug not in blocks:
        blocks[slug] = max(blocks.values(), default=-1) + 1
        data.setdefault("note", "Each channel's block of video ids (block b numbers its ids from b*10+1). Append only: "
                        "never renumber a channel. Read by generator/history.py next_id.")
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    return int(blocks[slug])


def _git(root: Path, *args: str, timeout: int = 60) -> str | None:
    try:
        r = subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return r.stdout if r.returncode == 0 else None


def fetch_main(root: Path = ROOT) -> bool:
    """Fetch origin/main quietly; False when there is no remote or the network is down."""
    return _git(root, "fetch", "-q", "origin", "main", timeout=120) is not None


def origin_ids(prefix: str = "v", root: Path = ROOT) -> dict[str, str]:
    """Video ids on origin/main (as last fetched) -> the channel folder holding them ("" for the old videos/)."""
    out: dict[str, str] = {}
    listing = _git(root, "ls-tree", "-d", "--name-only", "origin/main", "channels/")
    for ch in (listing or "").split():
        slug = ch.rstrip("/").split("/")[-1]
        for d in (_git(root, "ls-tree", "-d", "--name-only", "origin/main", f"channels/{slug}/videos/") or "").split():
            name = d.rstrip("/").split("/")[-1]
            if name.startswith(f"{prefix}-"):
                out.setdefault(name, slug)
    for d in (_git(root, "ls-tree", "-d", "--name-only", "origin/main", "videos/") or "").split():
        name = d.rstrip("/").split("/")[-1]
        if name.startswith(f"{prefix}-"):
            out.setdefault(name, "")
    return out


def used_ids(entries: list[dict], prefix: str, root: Path = ROOT) -> set[str]:
    """Every id in use anywhere: this channel's history, every channel's videos and history, origin/main."""
    used = {e["id"] for e in entries} | {p.name for p in (cpath(root, "videos")).glob(f"{prefix}-*") if p.is_dir()}
    # ids are unique across every channel: the database and the release tags key videos by id alone
    for d in (root / "channels").glob(f"*/videos/{prefix}-*") if (root / "channels").is_dir() else []:
        if d.is_dir():
            used.add(d.name)
    for f in (root / "channels").glob("*/history/history.json") if (root / "channels").is_dir() else []:
        try:
            used |= {e["id"] for e in json.loads(f.read_text(encoding="utf-8")) if e.get("id")}
        except (ValueError, KeyError):
            pass
    used |= set(origin_ids(prefix, root))
    return used


def next_id(entries: list[dict], at: datetime | None = None, root: Path = ROOT, fmt: str = "short") -> str:
    """v-YYYYMMDD-NN for a Short, L-YYYYMMDD-NN for a long video (IST date), from this channel's block of
    ids, skipping used ones."""
    prefix = "v" if fmt == "short" else "L"
    day = (at or now()).astimezone(IST).strftime("%Y%m%d")
    used = used_ids(entries, prefix, root)
    n = id_block(None, root) * BLOCK + 1
    while f"{prefix}-{day}-{n:02d}" in used:
        n += 1
    return f"{prefix}-{day}-{n:02d}"


def taken_elsewhere(vid: str, root: Path = ROOT) -> str | None:
    """Who already holds `vid` on origin/main (after a fresh fetch), when it isn't this video: another
    channel's folder, or this channel's own folder with a manifest already shipped. None when it is free
    or origin can't be reached."""
    if not fetch_main(root):
        return None
    holder = origin_ids(vid.split("-")[0], root).get(vid)
    if holder is None:
        return None
    if holder and holder != channels.current():
        return f"channel {holder}"
    if not holder:
        return "the old videos/ folder"
    shipped = _git(root, "cat-file", "-e", f"origin/main:{channels.rel(root, f'videos/{vid}')}/manifest.json")
    return "an earlier video of this channel" if shipped is not None else None


def ready_count(entries: list[dict], settings: dict, fmt: str = "short") -> int:
    """Backlog of one format: videos queued in the database plus those shipped since the last ingest."""
    by_format = settings.get("backlogByFormat") or {}
    queued = int(by_format[fmt]) if fmt in by_format else (int(settings.get("backlog", 0)) if fmt == "short" else 0)
    since = settings.get("ingestedAt")
    cutoff = datetime.fromisoformat(since) if since else None
    fresh = sum(1 for e in of_format(entries, fmt) if cutoff is None or datetime.fromisoformat(e["created_at"]) > cutoff)
    return queued + fresh


def ist_week(iso: str) -> str:
    """ISO year-week in IST, e.g. '2026-W42'. Long videos are planned per week, not per day."""
    d = datetime.fromisoformat(iso).astimezone(IST)
    y, w, _ = d.isocalendar()
    return f"{y}-W{w:02d}"


def load_template_work(root: Path = ROOT) -> list[dict]:
    return _read(cpath(root, "history/template_work.json"))


def append_template_work(template: str, action: str, enabled: bool, root: Path = ROOT, at: datetime | None = None) -> dict:
    entry = {"at": (at or now()).isoformat(), "template": template, "action": action, "enabled": enabled}
    _write(cpath(root, "history/template_work.json"), [*load_template_work(root), entry])
    return entry
