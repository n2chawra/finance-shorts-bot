"""Settings a routine reads from config/settings.json.

Routines have no database access. The hourly ingest job (M4) rewrites this file from the Setting
table and the current backlog; until then the committed defaults apply.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DEFAULTS: dict = {
    "backlog": 0,                 # videos queued in the database at the last ingest
    "ingestedAt": None,           # ISO time of that ingest; newer history entries count as ready too
    "backlogCap": 30,
    "generationPaused": False,    # routines do nothing at all while this is on
    "uploadsPaused": False,
    "lengthMinSec": 20,
    "lengthMaxSec": 35,
    "longLengthMinSec": 480,      # long-form: 8-15 minutes, aiming for 8-12 (owner reset, 2026-10-21:
    "longLengthMaxSec": 900,      # the long winners run 12-30 min, and mid-roll ads start at 8)
    "longPerWeek": 0,             # long videos to make per IST week (0 pauses long-form)
    "longBacklogCap": 4,
    "disclaimer": "Illustrative only. Not financial advice.",
    "dailyVideoTarget": 3,        # videos to ship per IST day before any template work; then runs idle
    "templateWork": {
        "maxPerDay": 1,           # template-building runs allowed per IST day
        "maxTemplates": 10,       # stop building new templates at this many
        "everyNthRun": 5,         # 0 = build templates only when the backlog is full; otherwise once the
                                  # day's videos are made, one run that day builds or improves a template
    },
    "templates": {},              # per-template overrides: {"short_story": {"enabled": false, "weight": 0.8}}
}


def load(root: Path = ROOT) -> dict:
    """Defaults overlaid with config/settings.json (one level deep for nested objects)."""
    path = root / "config" / "settings.json"
    stored = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}
    out = {**DEFAULTS, **stored}
    out["templateWork"] = {**DEFAULTS["templateWork"], **stored.get("templateWork", {})}
    return out
