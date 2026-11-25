# Routine: one generation run

You are an unattended scheduled run for the video platform. Nobody is watching and nobody
will answer questions. Do one run as described here, then stop. Work only in this repository.

**First, before anything else: ask `state` whether this run may go on (owner, 2026-11-23).** Run
`python -m generator.run state --channel <channel>` with the channel this run's prompt names (`CHANNEL=<slug>`,
`--channel <slug>`). If the prompt names no channel (and it is not the shared spare run below), run
`python -m generator.run state` with no channel: it answers `"stop": "no channel"`. On **any** answer with a
`stop` field (`"channel deleted"`: the owner deleted this channel; `"no channel"`: an old routine of a deleted
channel), this routine must not run again: if you have the scheduled-task tools (`list_triggers`,
`update_trigger`), find this routine (the one whose prompt matches this run) and set it `enabled: false`;
if you don't have them, just end. Either way end the run at once and write nothing else (no sync, no file,
no commit, no push, no activity). Every other `generator.run` command refuses to run without a channel. The
shared agents (auditor, improver, dashboard, monthly) are exempt (`agents/policy.md`).

Keep the run lean: it uses a Claude Pro plan's quota. Read only the files this page names, do not
run the test suite, do not explore the codebase, and do not improve things you were not asked to.

**Channel paths (multi-channel layout, 2026-11-17).** Each channel's own files live in `channels/<channel>/`, where `<channel>` is the channel this run is for: the `CHANNEL` your prompt names. Pass `--channel <channel>` to every `python -m generator.run` command. Shared code, `config/settings.json` and `improvement/activity/` stay where they are. Every channel has `channels/<channel>/channel.json` (its language, voices, currency, numbers mode, disclaimer, true or fiction stories, look; `python -m generator.pack show <channel>`) and `channels/<channel>/prompts/recipe.md`, its champion recipe: where CLAUDE.md describes a recipe, topics or look, each channel follows its own recipe.md and pack; the hard rules (true facts or declared fiction, figures from code, uniqueness, voice only from Kokoro) bind every channel.

**The spare run with many channels** (09:07, shared). When the prompt says "spare run" and names no channel: for every channel in `config/channels.json` with `status: "active"`, run `python -m generator.run state --channel <channel>`; skip any whose answer has a `stop` field (never disable the spare run for it); take the one in `mode: "video"` with the smallest `backlog` (ties: the first in the file) and do one run for it. If none is in `mode: "video"`, report "nothing to make up" and stop. One channel a spare run.

## 0. Prepare

```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
for p in python python3 /usr/bin/python3; do $p -c "from PIL import Image; import numpy, scipy, jsonschema" 2>/dev/null && PY=$p && break; done; echo "PY=$PY"
ffmpeg -version | head -1
```

`PY` is the Python that has the packages. **Wherever this page or the other prompt files say
`python`, run that interpreter instead**, and tell your subagents which one it is. The machine
can have several Pythons and only one has the packages.

- If no interpreter has the packages (`PY` is empty), run
  `python3 -m pip install -q pillow numpy scipy jsonschema` (add `--break-system-packages` if pip
  refuses), then use `python3`.
- Run `bash scripts/setup-cloud.sh $PY` once now: the offline voice, the Remotion packages and a
  headless Chrome (quick when cached). If it fails, stop and report its last line: videos cannot
  be voiced or drawn without it.
- If `ffmpeg` is missing, try once:
  `apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg`.
  If it is still missing, stop and report "ffmpeg could not be installed" with the error text.
## 1. Decide what this run does

Read the `state` you ran first (`python -m generator.run state --channel <channel>`). If it has a `stop` field,
you already ended (the rule at the top of this page). Otherwise read `mode`:

| mode | What to do |
|---|---|
| `paused` | Nothing. Report "generation is paused" and stop. |
| `idle` | Only the editor step (section 8), then report the `reason` and stop. |
| `video` | Make videos in a loop (section 1a), then the editor step (section 8). `videos_today` of `daily_target` are already made. |

## 1a. The video loop

One run makes all of the day's missing videos, so the setup above happens once a day instead of
once per video. For each video, do sections 2 to 7 (or the failure path), then run
`python -m generator.run state --channel <channel>` again:

- If `mode` is still `video`, start the next video with the new `next_id`.
- Otherwise the day's target is met: stop the loop.

Limits per run: at most **`daily_target` shipped videos** (from `state`: 3 a day) and at
most **`daily_target` + 2 attempts** (shipped + failed). Stop
when either is reached, even if the target isn't met; a later run makes up the rest.

**One video failing never ends the run.** Whatever stops a video — a check that won't pass, a
website the fact reviewer can't reach, a render error — mark that video failed (the failure path
below) and go on to the next one with a different template. Only the run-level blockers listed
under "Rules for every run" end the run early.

Keep each video lean: a brand-new fact-review subagent and a brand-new QA subagent per video
(never reuse the previous video's), and don't re-read files you already read this run unless
they changed (a template README you haven't read yet is fine). Pick a different template for
each video; `state` already excludes recently used ones.

Video runs never build or change templates: that is the improver agent's job (`agents/improver.md`).
The one exception is the channel's **kit** (`look.kits` in its `channel.json`, else its `look.engine`, else
the flat kit; section 3c): the video run grows that kit itself when a topic needs a piece it lacks (section 3c).

## 2. Plan (you)

Follow `generator/prompts/planner.md`. Use the id from `next_id` for the whole run.

**A promo channel** (`state` has a `promo` block; owner, 2026-11-25): every Short promotes one of the channel's long
videos (the planner's "A promo channel" section and the channel's recipe). Read that long video's `script.json` and its
beat code in `remotion/src/videos/<L-id>/` before writing: the facts, places and vehicle are the long video's, cut to
9:16 and 30–50 s. `mode` is `idle` when every recent long video already has its promos: report it and stop.

## 2b. Three openings, one picked by a fresh reviewer (Shorts; owner, 2026-11-12)

Most viewers decide in the first second. Before writing the script, draft **three different
openings** for the plan's fact and write them to `channels/<channel>/videos/<id>/openings.json`:
`{"options": [{"key": "A", "title": "...", "first_line": "...", "first_frame": "..."}, ...]}`: each a
title, the hook's first spoken sentence and one sentence describing the first frame, each following
the writer's fixed recipe, and different from each other in how they open (lead with the figure,
the name, or the contrast). Then spawn one subagent with fresh context and give it only the video
id and the instruction to read `generator/prompts/hook_judge.md` and follow it. Use the opening it
picks: its title goes into the plan (`plan.title`), its first line and first frame into the hook
beat. One round only; never argue with the pick.

## 3. Write (you)

First read `generator/prompts/checklist.md` and run `python -m generator.run failures --format short --channel <channel>`:
the mistakes the last runs made, each with its fix (2026-10-29: videos took up to twelve failed
steps to ship). Then follow `generator/prompts/writer.md`. It ends with the number check, which is
code and must print `ok`.

## 3b. Direct (you; owner, 2026-11-13: "now new videos are made like this")

Follow `generator/prompts/director.md`: every beat becomes a **directed 2D shot**. Give each its place,
camera, moments, things and figures in the script, then code it in `remotion/src/videos/<id>/` as one
file per beat on the flat kit (`remotion/src/flat/`). A new place for every line, someone doing
something, the figure on a thing in that place, a camera that moves, every change on a spoken word.

**A channel with its own director prompt** (`channels/<channel>/prompts/director.md`): run
`python -m generator.run prompt director --channel <channel>` and follow what it prints (the shared prompt
with the channel's additions appended; where they differ, the channel's win). A channel whose `channel.json`
`look.engine` is `doc` (the business documentaries) tells every beat as `"scene": "doc"` from params alone,
with no code per beat and its media through `python -m generator.media`; lint and render fail any other scene,
and the render fails any media not in the channel's licence log.

When the script and the code are written, run `python -m generator.run lint <id> --channel <channel>` (about twenty
seconds, no voice or frames) and fix until it prints `ok`. Run it again after every later fix, before
the stills.

Reference: the channel's 3 best published Shorts by `stayed` (engaged views ÷ views) in `channels/<channel>/metrics/videos.json` (entries with `format: "short"`): each one's `channels/<channel>/videos/<id>/script.json` and `preview.png` and its code in `remotion/src/videos/<id>/` (no published Short yet: the channel's newest shipped Short in `channels/<channel>/videos/`) (`generator/prompts/director.md`, "The bar", prints their ids; copy how they work, never
their places or pictures). The render checks every
file (imports, no figure typed into code, every directed beat's file present, no randomness or
clocks, `tsc`). Ship commits the folder with the video.

## 3c. Kit gaps: grow the kit, never drop the video (owner, 2026-11-22)

Owner, after a run failed all three Shorts because the channel's kit had no piece for what the topic showed: "fix it
so that it never fails again: the kit improves itself when making video so no run stops this way". The channel's
kits are its `channel.json` `look.kits` (e.g. the disasters channel: `three`, `flat`, `doc`), else its
`look.engine` (`three`, `doc`), else the flat kit; each lives in `remotion/src/<kit>/` with a README that lists
its pieces:

| kit | where its pieces are listed | channel-specific part |
|---|---|---|
| `flat` | `remotion/src/flat/README.md`: the tables for `kit.tsx`, `map.tsx`, `cast.tsx` | `flat/tech/` (the tech channel's dark pieces, its own table) |
| `three` | `remotion/src/three/README.md`: "How a director codes a beat" (places, things, moves, scale, labels) | `three/disaster/` ("The disaster kit" section: looks, vehicles, structures) |
| `disaster` (2D/doc for the disasters channel) | `remotion/src/disaster/README.md`: "Pieces" (SVG and HTML tables) and "The look" | its pieces are exported from `remotion/src/disaster/index.ts` |
| `doc` | `remotion/src/doc/README.md`: "Layers" and "Figure objects" | `"scene": "doc"` beats need no code; a beat is params only |

1. **Before directing**, list what each beat must show (the place, the thing at its centre, what moves) and check
   it against the kit's README. A topic is never skipped or failed because the kit can't draw it yet.
2. **A missing or unrecognisable piece is added now**: a new component, preset or prop in the kit (in a new or
   existing file of the kit, exported from its `index.ts` where it has one), following the kit's contract
   (`remotion/src/flat/README.md` "Contract", the rules at the end of the 3D kit's "How a director codes a
   beat"): a pure function of the frame (no clocks, no `Math.random`; seeded `rng`/`random` only), figures
   only from `params.fig` (never typed in), times as frames on the story clock (`motion(p).at("word")` or the
   beat's word frames), anything that arrives on a word gone or settled in the last second so the loop
   matches. Add its row to the kit README's table. On a `doc` channel, prefer a combination of existing layers;
   a new layer kind is a new case in `remotion/src/doc/DocBeat.tsx` plus its name in `DOC_LAYERS`
   (`renderer/timeline/build.py`) and a row in the README "Layers" table. **Additive only**: never change how
   an existing piece draws, except to fix a bug a QA note named (say so in the report).
3. **Check it**: `cd remotion && npx tsc --noEmit -p .`, then `lint` and the stills; look at the frames where it
   shows.
4. **Commit the kit change on its own**, before ship: `git add remotion/src/<kit> && git commit -q -m "<Kit>
   kit: <piece> (for <id>)"`. Ship pushes it with the video.

The same applies to a QA `[scene]` note on a kit channel (section 6): fix the piece in the kit and re-render the
stills; it is never a reason to fail the video while QA rounds remain.

## 4. Fact review (a subagent with fresh context)

Spawn one subagent. Give it only this: the video id, and the instruction to read
`generator/prompts/fact_reviewer.md` and follow it exactly. Do not tell it what you think of the
script or why you wrote it that way. Wait for its verdict.

If it fails the script: fix the lines it named (section 3 again, including the number check),
then ask the **same** subagent to review again. Two rewrites at most.

**A corrected figure** (owner, 2026-11-22: the Channel Tunnel Short failed because the reviewer confirmed the
operator's 40 m but the feed only had Wikipedia's 45 m): when the reviewer replaces a feed figure with one it
confirmed on a more official source, add that figure to the topic's `facts` in
`channels/<channel>/research/topics.json` (label, value, unit, as_of, source, url as the reviewer gave them, plus
`"added_by": "fact_review <id>"`), use it in the script, and ask the reviewer to check the changed lines. A figure
the reviewer did not confirm on the page it names is never added. This does not count as a rewrite of its own.

## 5. Stills first, then QA review, then the video

Rendering the video is the slow part, so QA looks at the stills **before** it is drawn
(2026-10-21: most re-renders were QA or layout rejections found after a full render).

1. **Stills** (about a minute):
   ```
   python -m generator.run render <id> --preview --channel <channel>
   ```
   It builds the voice and timeline, draws the contact sheet (`preview.png`), the thumbnail and
   the layout probe, and checks layout, length and sound levels. It must print `ok`. `FAIL:` lines:
   fix the script and go back to section 3. **`NOTE:` lines (from any check) are advice** (owner
   review, 2026-11-11): act on one only when the fix is a line or two, never rewrite or re-render
   for a note alone, and carry on. A video should be done in about ten steps.
2. **QA review** (section 6) on those stills. Fix what it names and run the stills again; the
   voice is cached, so this is quick.
3. **The video**, once QA has passed:
   ```
   nohup python -m generator.run render <id> --channel <channel> > /tmp/render-<id>.log 2>&1 &
   ```
   A Short takes 2–5 minutes; check `tail -3 /tmp/render-<id>.log` every minute or two. It must
   print `ok`. A `FAIL:` here is the motion gate (`liveliness:`): fix the beat it names and render
   again.

   **The full render refuses to start until QA has passed the stills of exactly this script and beat code** (owner, 2026-11-25; `generator/run.py` `full_render_problems`). After any fix, whether from QA, the fact reviewer or a `FAIL:` line, render the stills again and have QA pass them before the full render. The one exception is a fix to the beat code alone after a full render failed only on the motion gate (`liveliness:` lines): render again straight away. `ship` refuses a video whose script or plan changed after QA passed. A re-render that only changed the sound reuses the picture already drawn, and the
   Remotion bundle is built once per run.

## 6. QA review (a subagent with fresh context)

Spawn one subagent. Give it only the video id and the instruction to read
`generator/prompts/qa_reviewer.md` and follow it exactly, opening the PNG files so it sees them.
It reviews the stills from step 5.1; after the video is rendered it doesn't need to look again
unless the video's render printed `FAIL:`.

If it fails the video, fix each problem according to its tag, render the stills again and ask the
**same** QA subagent to review again. Three rounds at most per video.

- **`[script]`:** fix the script lines it named, re-run the number check, ask the fact reviewer
  to re-review the changed lines, then render the stills again.
- **`[scene]` on a kit piece** (section 3c): fix or add the piece in the kit, commit it, render the
  stills again and ask the same QA subagent to look again. A round whose only notes are `[scene]` kit fixes does not
  count toward the three (owner, 2026-11-22: a kit problem never stops a run), up to five QA rounds in all.
- **`[template]`** or **`[scene]`** (other channels): a problem in how a scene draws (overlap, cut-off text, a frozen
  picture) is in Remotion code, which the routine does not change. First try a script fix that
  avoids it (another scene, fewer words on screen, an actor moved). If no script change can, go
  to "If the video cannot be made to pass" and name the scene and beat in the reason, so the
  owner can fix the scene.

## 7. Ship

When number check, fact review and QA review have all passed:

```
python -m generator.run ship <id> --commit --push --media-branch --channel <channel>
```

This writes the manifest, appends to history, commits to `main` and pushes, then pushes the mp4
on a new branch `media/<id>` (the current commit plus `video.mp4`). A GitHub Actions workflow turns that branch into
Release `video-<id>` and deletes the branch. Cloud sessions are not allowed to create releases
themselves, so do not try `gh release` or the `--release` flag.

- If `ship` says the id **is already used** (another run shipped it while you worked; ids are unique across
  channels because the database and the release tag key videos by id alone), run
  `python -m generator.run reid <id> --channel <channel>`: it moves the video, its own code and its history entry to a free id
  of this channel's block. Then ship the new id. Never ship two videos under one id.
- If the **push to main** fails, run `git pull --rebase origin main` and `git push origin HEAD:main`
  once, then `python -m generator.run media <id> --channel <channel>` to push the video branch.
- If the **media branch push** fails, retry `python -m generator.run media <id> --channel <channel>` once.
- If either still fails, report the exact error text. The mp4 is lost when this session ends;
  a later run cannot recover it.
### If the video cannot be made to pass

After the limits above are used up (three plan attempts, two rewrites, three re-renders), first
undo any template repair that did not lead to a pass (`git checkout -- renderer`), then:

```
python -m generator.run fail <id> --reason "<which check failed and why, one sentence>" --channel <channel>
git add channels/<channel>/videos/<id> && git commit -q -m "Mark video <id> failed" && git push origin HEAD:main
```

A failed video is never released. **Then go back to the loop** (section 1a): run
`python -m generator.run state --channel <channel>` again (it gives a new `next_id`) and, if its mode is still
`video` and the run's limits allow, make the next video with a **different template** from the
one that failed.

## 8. The editor (every run, also idle ones)

Follow `generator/prompts/editor.md`: score every ready Short (`python -m generator.run rank --channel <channel>`), look
at the top candidates, and commit `channels/<channel>/editor/ranking.json`. One Short goes out every
`shortEveryDays` days, so the best of the queue must be first (owner, 2026-10-30).

## Rules for every run

- Read the owner's notes in `state` (`owner_feedback`) before planning: they come right after the
  hard rules, and a `wrong` note is a rule until it is addressed.
- Never edit `config/settings.json`, `CLAUDE.md`, `PLAN.md`, anything under `apps/`, `workers/`
  or `.github/`, or these prompt files. Under `renderer/`, a video run may only make the
  template repair described in section 6. Under `remotion/src/<kit>/`, a kit channel's run may add pieces
  (section 3c).
- Never force-push, delete a branch, or rewrite history.
- Never commit an mp4 or wav file to `main`. The only place an mp4 goes is the `media/<id>` branch that `ship` creates.
- Do not use any connector. The only web access in a video run is the fact reviewer confirming
  sourced facts (`fact_reviewer.md`: the fact's page, or web search when that page can't be
  reached). Everything else you need is in the repository.
- **Stop the whole run only for a run-level blocker**: no working Python or ffmpeg after the
  install attempts in section 0, `state` failing, or pushing to `main` failing after the retry in
  section 7. Report it with the exact error text. Anything that blocks a single video is not a
  run-level blocker: fail that video and continue the loop (section 1a). Never improvise a way
  around a rule.

## Report

End with a short report, because the run's status light does not show whether the task worked:

- mode, and the video id or template name
- for a video: template, topic, title, and the result of each step (plan, number check, fact
  review, render, QA review, ship), with how many rewrites or re-renders were needed
- one block per video attempted in this run (shipped or failed), and how many of the daily target are now made
- any template repair (what was wrong, what you changed)
- whether the push to `main` and the push of `media/<id>` succeeded
- anything that failed, with the exact error text
