"""history/history.json: one entry per shipped video, oldest first. It is the source of truth for
the variety rules inside routines. history/template_work.json logs template-building runs."""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .settings import ROOT

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
    return _read(root / "history" / "history.json")


def append(entry: dict, root: Path = ROOT) -> None:
    """Add a shipped video. Refuses incomplete entries and duplicate ids."""
    missing = [k for k in REQUIRED if k not in entry]
    if missing:
        raise ValueError(f"history entry is missing {', '.join(missing)}")
    entries = load(root)
    if any(e["id"] == entry["id"] for e in entries):
        raise ValueError(f"history already has {entry['id']}")
    _write(root / "history" / "history.json", [*entries, entry])


def next_id(entries: list[dict], at: datetime | None = None, root: Path = ROOT) -> str:
    """v-YYYYMMDD-NN (IST date), skipping ids already used in history or videos/."""
    day = (at or now()).astimezone(IST).strftime("%Y%m%d")
    used = {e["id"] for e in entries} | {p.name for p in (root / "videos").glob("v-*") if p.is_dir()}
    n = 1
    while f"v-{day}-{n:02d}" in used:
        n += 1
    return f"v-{day}-{n:02d}"


def ready_count(entries: list[dict], settings: dict) -> int:
    """Backlog: videos queued in the database plus those shipped since the last ingest."""
    since = settings.get("ingestedAt")
    return int(settings.get("backlog", 0)) + sum(1 for e in entries if since is None or e["created_at"] > since)


def load_template_work(root: Path = ROOT) -> list[dict]:
    return _read(root / "history" / "template_work.json")


def append_template_work(template: str, action: str, enabled: bool, root: Path = ROOT, at: datetime | None = None) -> dict:
    entry = {"at": (at or now()).isoformat(), "template": template, "action": action, "enabled": enabled}
    _write(root / "history" / "template_work.json", [*load_template_work(root), entry])
    return entry
