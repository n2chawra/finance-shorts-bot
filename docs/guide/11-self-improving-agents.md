# 11. Self-improving agents

*The automation improves itself. Four agents run every night while the owner sleeps, change the
pipeline only when evidence supports it, and report everything on the dashboard. Instructions:
[`agents/`](../../agents); judging code: [`improvement/evaluate.py`](../../improvement/evaluate.py);
guardrails: [`scripts/guard.py`](../../scripts/guard.py).*

## The night shift (IST)

| Time | Who | What |
|---|---|---|
| 22:30 | Data audit (GitHub Action) | Compares every published video's numbers on the dashboard with YouTube and the database; writes `metrics/data-audit.json`; notifies the owner about unlinked videos and errors that last two nights |
| 23:00 | **Auditor** | Fixes what the data audit found, runs every check, reviews one area for bugs, and makes one careful refactor (DRY, single responsibility, dead code) when tests cover it |
| 23:47 | **Research** | Studies 3–5 top Shorts (hooks, motion, text, colour, sound, endings), the day's topic, and Claude/Claude Code updates. Writes a report and ranked proposals. Never changes code. |
| 04:07 | Video run | Makes the day's 3 videos, first in a fresh usage window |
| 06:17 | **Improver** | Runs the evaluator, closes matured experiments (keep or revert), fixes recurring failures, manages templates, and starts at most one new experiment, or decides to wait |
| 07:37 | **Dashboard** | Bug hunt every night (build, lint, smoke tests, screenshots); UI/UX trend research Mon/Wed/Fri; at most one fix or improvement |
| 09:07 | Spare video run | Makes up any missing videos, in a fresh usage window |

Why these times: the Pro plan meters usage in 5-hour windows. The auditor and research (23:00–04:00)
can't eat into the video run's budget, because the 04:07 video run always opens a new window; the
improver and dashboard agents run after it, one at a time; the 09:07 spare run opens another window,
so it can still make the day's videos if the main run hit the limit.

## How a change happens

```mermaid
flowchart LR
    R[Research<br/>proposals.json] --> I[Improver]
    M[metrics/videos.json<br/>metrics/runs.json] --> E[improvement.evaluate<br/>fixed rules] --> I
    I -- "one change behind an A/B flag" --> B[agent/improver/date branch]
    B --> G{Agent merge workflow<br/>guard + tests}
    G -- pass --> MAIN[main]
    G -- fail --> L[merge-log.json<br/>reason]
    MAIN --> V[next videos: half 'on', half 'off']
    V --> M
```

1. **Proposals, not code.** Research writes what to try and why, with sources.
2. **One change at a time, behind a flag.** The improver implements the best proposal so it applies
   to about half of new videos (chosen by video id), leaving the rest unchanged.
3. **The guard decides what may merge.** Agents can only push `agent/<name>/<date>` branches. The
   `Agent merge` workflow merges only when `scripts/guard.py` passes (allowed files only; the hard
   rules intact: disclaimer, 44 px text, safe zone, numbers checked by code, no audio files or
   network in the renderer, no secrets; size and daily limits) **and** all tests pass.
4. **Wait for data.** An experiment is judged once each group has 8 videos with 48-hour numbers
   (about 8 days at two uploads a day), or after 14 days.
5. **Numbers decide.** `improvement.evaluate` compares the groups: **keep** at +10% views with 80%
   confidence and no rise in QA failures; **revert** at −10%, or if QA failures go up; otherwise
   extend once, then abandon. The improver applies the verdict exactly.

## The auditor and the data audit

- **Data audit** (`workers/data-audit.ts`, rules in `workers/lib/data-audit.ts` with tests): runs the
  dashboard's own data code against the real database and compares it with YouTube's public counts and
  the stored Analytics. It flags counts that went down, counts behind YouTube right after a live
  refresh, counts ahead of YouTube, Analytics above the public count, duplicate or missing Analytics
  days, publish states out of step with YouTube, published videos without a link, stale Analytics and
  page totals that don't add up. Owner-only; agents can't change it.
- **Auditor** (`agents/auditor.md`): fixes the cause of every real mismatch with a test that fails
  without the fix, then hunts bugs in one area a night (generator, renderer, workers, dashboard data,
  dashboard UI) and ranks code-quality work in `improvement/auditor/backlog.json`. Refactors only code
  that tests cover, behaviour unchanged, under ~300 lines. Up to two branches a night (fixes, refactor).
- **Its access**: everything the improver and dashboard agents may change, plus `workers/` and
  `apps/dashboard/src/lib/live-stats.ts`. Never uploads, upload times, YouTube sign-in, settings
  defaults, login, Prisma, workflows, the guard, the policy or the data audit; never deletes tests.
- The merge workflow runs the test suites by area (Python, workers, dashboard), so a branch that
  touches all three runs all three.

## Templates follow the numbers

- Weights (how often the planner picks a template) follow performance once a template has 6
  videos with data, clamped between 0.4 and 2.0 so every template keeps being tested.
- A template with 10+ videos that is clearly worse than the rest (80% confidence, under 0.75× the
  median) is retired (disabled, kept in the repo).
- New templates are built when fewer than 6 are enabled or research finds a new format: two test
  renders plus QA first, then they start at weight 0.5.
- The improver writes these decisions to `improvement/template-decisions.json`; ingest applies each
  one to the database once.

## What the owner sees

- **Agents page**: one card per agent per night: what it did, what it found (with sources), whether
  it changed something or waited and **why**, and when it will check again. Tabs for experiments
  (with results), proposals and the merge log.
- **Notifications page** (bell in the top bar): only problems the automation can't fix itself, each
  with step-by-step fix instructions. Sources: the hourly watchdog (no videos, empty queue, site
  down, YouTube token, failed GitHub Actions, agents blocked or silent), the workers, the dashboard
  (GitHub token or YouTube API key rejected) and the agents (anything needing the owner, such as a
  Claude model or routine change). Items clear themselves once fixed.
- **Settings → Self-improving agents**: pause all, switch each agent off, and set how many
  experiments may run at once.

## Files

| Path | Written by | Purpose |
|---|---|---|
| `agents/policy.md`, `agents/*.md` | owner | rules and nightly instructions |
| `improvement/research/<date>.md`, `proposals.json`, `seen.json` | research | reports, ideas, Claude versions seen |
| `config/experiments.json` | improver | running A/B flags (read by the generator and renderer) |
| `improvement/experiments.json` | improver | experiment ledger with hypotheses and results |
| `improvement/template-decisions.json` | improver | template weight / retire decisions |
| `improvement/journal.md`, `weekly/` | improver | decision log, Sunday summaries |
| `improvement/dashboard/` | dashboard | bug and idea backlog, nightly reports |
| `improvement/activity/<date>-<agent>.json` | each agent | the Agents page |
| `improvement/notifications/<agent>.json` | each agent | owner-only problems |
| `improvement/merge-log.json` | Agent merge workflow | merged / blocked with reasons |
| `metrics/videos.json`, `metrics/runs.json` | ingest | what the evaluator judges by |
| `metrics/data-audit.json` | data-audit workflow | dashboard vs YouTube vs database, read by the auditor |
| `improvement/auditor/` | auditor | nightly reports, ranked backlog, which areas it reviewed when |
