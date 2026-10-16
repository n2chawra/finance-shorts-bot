# 12 · Run times: how long each routine takes, and the schedule

Why this exists: the routines are timed around the Claude Pro plan's 5-hour usage windows, so a run
that outlasts its slot can break the plan (the 04:07 video run must open a fresh window). Until
2026-10-16 nothing recorded how long a run took. This page has the first measurement, the tracking
that now runs every night, and the schedule recommendation.

## 1. Measured: the night of 15 → 16 October (IST)

**This night is not representative.** Every routine's first step (`git checkout main && git pull
--ff-only`) failed on the cloud environment's stale clone. `scripts/sync-main.sh` fixed that at
02:47Z (08:17 IST), before the 09:07 spare run. Short runs below are mostly runs that worked around
the failure or had nothing to do, not what a full night costs.

| Run | Scheduled (IST) | Started (IST) | Finished (IST) | Duration | Overlap with next scheduled run | Cut short / failed |
|---|---|---|---|---|---|---|
| Auditor | 23:00 | ~23:06 (est.) | 23:10 (exact: commit 17:40:11Z) | ~4–5 min (est.) | none (next: Research 23:47) | Ran, but its branch went to `claude/…` and sat unmerged until it was re-pushed at 02:48Z (merged 02:49Z). Not representative. |
| Research | 23:47 | 23:47–23:49 (est.) | 23:49 (exact: commit 18:19:34Z) | at most ~2.5 min (upper bound) | none (next: Video main 04:07) | Worked around the failed checkout; merged. Craft pass skipped, so short. |
| Video main run | 04:07 | ~04:07 (est.) | ~04:08 | 31 s (owner's session) | none | **Failed**: stopped after 31 s on the git error. 0 of 3 videos. |
| Improver | 06:17 | 06:17–06:18 (est.) | 06:18 (exact: commit 00:48:16Z) | at most ~1.5 min (upper bound) | none (next: Dashboard 07:37) | Decided "waited" (no performance data), so short by design. Merged. |
| Dashboard | 07:37 | ~07:38 (est.: 02:08Z) | 07:42 (exact: commit 02:12:41Z) | ~4.5 min (est.) | none (next: Video spare 09:07) | Pushed to `claude/…`; re-pushed 02:48Z, merged 02:51Z. |
| Video spare run | 09:07 | 09:08:22 (exact: first step stamp 03:38:22Z) | 09:17:41 (exact: last step 03:47:41Z) | ~9.3 min of steps (exact) | none (next: Auditor 23:00) | Fine: made all 3 videos (`v-20261016-01…03`; one planner retry, one fact-review retry). |

Gaps between scheduled starts, for scale: Auditor→Research 47 min, Research→Video main 4 h 20 min,
Video main→Improver 2 h 10 min, Improver→Dashboard 1 h 20 min, Dashboard→Spare 1 h 30 min,
Spare→Auditor 13 h 53 min. The longest observed run (10 min) used under a quarter of the
tightest gap.

### Method, and what is exact
- **Exact**: the spare run's start (first step stamp) and finish (last step stamp) come from
  `videos/v-20261016-0*/manifest.json` `agentRuns[].startedAt/finishedAt`, which the code steps stamp.
  Finish times of agent runs are exact to the minute: the committer time of the agent's commit
  (`git log origin/main`, and `improvement/merge-log.json` for the merge). Merge times are the Action's.
- **Estimated**: agent start times. Agents did not record any start, and routines fire up to ~5 min
  after the cron time, so a start is the scheduled time or the owner's note of when the session
  began. Durations built on a start estimate are marked est. or "at most".
- **Not available**: the session-list tool returned nothing in this unattended run, so no session
  start/end times were read from Claude Code itself. The 31 s video-run figure is the owner's.
- Commit times are when the agent *committed*; the push followed within seconds.

## 2. What went wrong last night, and the fix
The cloud clone's local `main` was stale (23 old commits with no common ancestor with GitHub's), so
every routine's `git checkout main && git pull --ff-only` failed. The video run stopped after 31 s;
the auditor and dashboard pushed to `claude/…` branches, which the merge workflow did not take;
research and improver worked around it. The fix (already on `main`): `bash scripts/sync-main.sh` as
the first command of every routine, agents push `HEAD:refs/heads/agent/<name>/<date>`, and
`scripts/tests/test_routine_prompts.py` keeps the prompts that way.

## 3. Recommendation: change nothing
One disrupted night says nothing about full-length runs, and no clock overlap was seen. Keep:

| Routine | Cron (UTC) | IST |
|---|---|---|
| Auditor | `30 17 * * *` | 23:00 |
| Research | `17 18 * * *` | 23:47 |
| Video main | `37 22 * * *` | 04:07 |
| Improver | `47 0 * * *` | 06:17 |
| Dashboard | `7 2 * * *` | 07:37 |
| Video spare | `37 3 * * *` | 09:07 |

The only tight slot is **Auditor → Research (47 min)**. The auditor runs installs, tests and a
refactor, so a full night may well exceed 47 min; last night's 5 min says nothing about that. If the
`schedule-overlap` warning (below) names it, move Research to 00:00 IST, cron `30 18 * * *` (UTC).
Do not go later than 00:20: everything must be finished by 00:30, because anything starting in
00:30–04:07 opens its own usage window and the 04:07 video run would no longer start a fresh one.
I cannot edit routines from an unattended run, so no change was applied. Revisit after about a
week of recorded times.

## 4. How the tracking works now
1. **Agents** (`agents/auditor|research|improver|dashboard.md`): note `START=$(date -u +%FT%TZ)` right
   after `bash scripts/sync-main.sh` (still the first command), take the finish time right before the final
   commit, and write both as `startedAt` / `finishedAt` in `improvement/activity/<day>-<agent>.json`
   (format in `agents/policy.md`; both optional).
2. **Ingest** (`workers/lib/agents-sync.ts`) stores them in the new nullable `AgentActivity.startedAt` /
   `finishedAt` columns (migration `20261016120000_agent_run_times`, applied by the ingest workflow).
3. **Dashboard, Agents page**: each activity card shows e.g. `23:04–23:51 IST, 47 min`; a **Run times**
   card shows per agent the last night, the 7-night average and the max, plus the video runs. Video
   runs are computed from the `AgentRun` step times already in the database: first step start to
   last step end per video, videos less than an hour apart form one run (04:07 main vs 09:07 spare).
4. **Watchdog** (`workers/lib/schedule.ts`, hourly): `SCHEDULE` lists each run's IST start. One
   `warning` notification, `schedule-overlap`, is raised when a run finished after the next
   scheduled run's start, when the video main run finished after 09:07 IST, or when it took over 3 h. It
   states the exact times and a suggested new start, and resolves itself once a night is clear.
   Keep `SCHEDULE` in step with the routines' cron lines when you change them.

Tests: `workers/tests/schedule.test.ts` (overlap rules, run clustering).

## 5. Side finding
`improvement/notifications/auditor.json` used the key `items`, but ingest reads `notifications`, so
the auditor's owner notifications would have been ignored with a warning. Fixed in this change.
