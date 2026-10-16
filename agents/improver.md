# Agent 2 · Improver (nightly, 06:17 IST)

You are an unattended scheduled run. Nobody is watching. Read `agents/policy.md` first and follow
it. Your job: make the videos better over time, mostly **how they look, move and sound**, using
evidence. Each night you decide one of: close experiments that have matured, fix a recurring
failure, start one new experiment, adjust templates, or **wait**. Waiting is a good decision when
the data isn't in yet; say so and stop early.

## 0. Prepare
```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
START=$(date -u +%FT%TZ); echo "START=$START"   # run-time tracking: note this value (shell variables may not survive); it goes into the activity file as startedAt
DAY=$(TZ=Asia/Kolkata date +%F); DOW=$(TZ=Asia/Kolkata date +%a)
for p in python python3 /usr/bin/python3; do $p -c "import PIL, numpy, scipy, jsonschema" 2>/dev/null && PY=$p && break; done; echo "PY=$PY"
```
If no interpreter has the packages: `python3 -m pip install -q pillow numpy scipy jsonschema`
(add `--break-system-packages` if pip refuses). If `ffmpeg` is missing, try once:
`apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg`.
Use `$PY` wherever this page says `python`.

Stop (activity `nothing`, push it) if `config/settings.json` has `agents.paused` or
`agents.improver` false.

Read: `improvement/merge-log.json` (your last 5 entries; if the last was blocked, fixing that reason
is tonight's first job), `improvement/journal.md` (last 20 lines), `improvement/experiments.json`,
`config/experiments.json`, new proposals in `improvement/research/proposals.json`, the latest
research report, `metrics/runs.json` (last 7 days). Then run:
```
python -m improvement.evaluate
```

## 1. Close matured experiments (follow the verdict exactly)
For each experiment the evaluator marks:
- **keep**: make the "on" behaviour the default. Remove the `self.flag("<id>")` branches (keep the
  on-path) or fold the prompt note into `generator/prompts/planner.md`/`writer.md`. Set its status to
  `kept` in both `config/experiments.json` and `improvement/experiments.json`, with the result
  (ratio, confidence, n). Proposal status → `kept`.
- **revert**: delete the on-path code / prompt note; status `reverted`; proposal → `reverted`.
- **extend**: set `"extended": true` and `"maxDays": <days so far + 14>`; nothing else.
- **abandon**: like revert, status `abandoned`.
- **wait**: nothing. Note the expected date in the journal.
Closing counts as tonight's change if it touches code.

## 2. Fix recurring failures
If the evaluator lists recurring failures (the same QA/fact reason twice in 3 days), fix the cause
(usually a template layout bug or a prompt that keeps producing rejected scripts) before starting
anything new. Reproduce with `python renderer/cli.py examples/<template>.json --frames <t>` or
`--preview`, fix, check the frames again. These are fixes, not experiments.

## 3. Template portfolio (rules, not taste)
From the evaluator's **Templates** section:
- `reweight` / `retire` advice: apply by appending to `improvement/template-decisions.json`
  `{"id": "<DAY>-<template>-<action>", "template": "…", "action": "reweight|retire|enable",
  "weight": 1.3, "why": "<the evaluator's reason>", "at": "<DAY>"}`. Ingest applies each id once.
  Change a template's weight at most once a week.
- **Add a template** when fewer than 6 are enabled, or research's best idea is a new format: follow
  `generator/prompts/template_builder.md` (it must look and move differently from the others),
  render **two test videos** (`python renderer/cli.py <script> --out /tmp/t1` full render, check
  layout and audio levels in render.json) and get a fresh QA subagent to review both contact sheets
  (`generator/prompts/qa_reviewer.md`). Only if both pass: add `examples/<template>.json`, a
  number-check function in `generator/numbers.py`, tests, and a decision `{"action": "reweight",
  "weight": 0.5}` so it starts small. Record it as an experiment in `improvement/experiments.json`
  with area `template`. At most one new template a week.

## 4. Start at most one new experiment
Only if: fewer running experiments than `agents.maxActiveExperiments`, nothing from steps 1–3
changed code tonight, and no running experiment shares the proposal's area. Pick the proposal with
the best effect × confidence ÷ effort, preferring the craft areas (motion, pacing, text, colour,
sound, music, hook, ending), then script and title.

1. Implement it **behind a flag**:
   - Renderer change: in the template(s) or `renderer/engine/`, branch on `self.flag("<id>")`. The
     off-path must stay exactly as today.
   - Script/title change: no code; add a `prompt` block `{"on": "<instruction>", "off": null}` to the
     experiment. `generator.run state` hands it to the planner/writer for videos in the on-group.
2. Register it in `config/experiments.json`:
   `{"id": "<kebab>", "area": "…", "status": "running", "startedAt": "<DAY>", "templates": ["all" or names],
   "share": 0.5, "prompt": {…} (optional), "proposal": "<proposal id>", "description": "…"}`
   and in `improvement/experiments.json` with the same id plus `"metric": "views48h"`,
   `"guard": "qa_failures"`, `"minPerArm": 8`, `"maxDays": 14`, `"hypothesis": "…"`.
3. Check both variants for every affected template:
   `python renderer/cli.py examples/<t>.json --preview --flag <id>=on --out /tmp/<t>-on` and
   `--flag <id>=off`. Get a fresh QA subagent to review the "on" contact sheets
   (`generator/prompts/qa_reviewer.md`, it compares with the "off" sheets). Fix or drop it if QA fails.
4. `python -m pytest renderer generator improvement -q` must pass.
5. Proposal status → `testing`.

## 5. Claude updates
If research found a Claude capability that improves the pipeline within your lane (prompt
structure, how subagents are used in `generator/prompts/*.md` except `routine.md`), you may apply it
as tonight's change. Anything needing the owner (routine model, schedule, `routine.md`) goes into
`improvement/notifications/improver.json` as an `info` item with exact steps.

## 6. Otherwise wait
If nothing matured and nothing qualifies: decision `waited`, `nextCheck` = the earliest date an
experiment can mature (the evaluator says how many videos are missing; two uploads a day ≈ one more
video per arm per day).

## 7. Sundays: weekly summary
Write `improvement/weekly/<YYYY>-W<week>.md`: what changed, what was kept or reverted (effect sizes),
what's running, template weights, the best and worst performers, and next week's focus.

## 8. Finish (always)
Append one line per decision to `improvement/journal.md`:
`<DAY> <acted|waited>: <what> because <why>. Re-check <date>.`
Write `improvement/activity/<DAY>-improver.json` (policy.md format: findings = the evaluator's key
numbers; changes = what you changed with the experiment id) and rewrite
`improvement/notifications/improver.json`. Then:
```
git checkout -B agent/improver/$DAY
date -u +%FT%TZ   # finishedAt: take it now, right before the commit; write it and START into the activity file (startedAt / finishedAt), then commit
git add -A generator renderer examples config/experiments.json improvement
git commit -q -m "Improver $DAY: <one-line summary>"
git push origin HEAD:refs/heads/agent/improver/$DAY
```
Never `git add` anything outside your lane (the guard will block the whole branch). End with a
5-line report: verdicts applied, change made (or why you waited), next check date, owner items.
