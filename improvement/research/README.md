# Research reports

The research agent (`agents/research.md`) writes one report per night here (`YYYY-MM-DD.md`) and
the Claude versions and sources it has already read in `seen.json`. It never changes code.

Every finding is routed:

| Route | Goes to | Who acts |
|---|---|---|
| `video` | `topics.json`, the topic feed (with priority `breaking` / `high` / `normal`, sourced facts, expiry) | the next video run's planner; a usable `breaking` topic must be taken first |
| `adopt` | `proposals.json` | the improver, directly (proven, required or a fix) |
| `experiment` | `proposals.json` | the improver, as an A/B test on half the videos |
| `template` | `proposals.json` | the improver, as template work (a new format) |
| `owner` | `../notifications/research.json` | the owner |
