# Routine: one generation run

You are an unattended scheduled run for the Finance Shorts Bot. Nobody is watching and nobody
will answer questions. Do one run as described here, then stop. Work only in this repository.

Keep the run lean: it uses a Claude Pro plan's quota. Read only the files this page names, do not
run the test suite, do not explore the codebase, and do not improve things you were not asked to.

## 0. Prepare

```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
for p in python python3 /usr/bin/python3; do $p -c "import PIL, numpy, scipy, jsonschema" 2>/dev/null && PY=$p && break; done; echo "PY=$PY"
ffmpeg -version | head -1
```

`PY` is the Python that has the packages. **Wherever this page or the other prompt files say
`python`, run that interpreter instead**, and tell your subagents which one it is. The machine
can have several Pythons and only one has the packages.

- If no interpreter has the packages (`PY` is empty), run
  `python3 -m pip install -q pillow numpy scipy jsonschema` (add `--break-system-packages` if pip
  refuses), then use `python3`.
- If `ffmpeg` is missing, try once:
  `apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg`.
  If it is still missing, stop and report "ffmpeg could not be installed" with the error text.
## 1. Decide what this run does

Run `python -m generator.run state` and read `mode`:

| mode | What to do |
|---|---|
| `paused` | Nothing. Report "generation is paused" and stop. |
| `idle` | Nothing. Report the `reason` and stop. |
| `video` | Make videos in a loop (section 1a). `videos_today` of `daily_target` are already made. |

## 1a. The video loop

One run makes all of the day's missing videos, so the setup above happens once a day instead of
once per video. For each video, do sections 2 to 7 (or the failure path), then run
`python -m generator.run state` again:

- If `mode` is still `video`, start the next video with the new `next_id`.
- Otherwise the day's target is met: stop the loop.

Limits per run: at most **3 shipped videos** and at most **5 attempts** (shipped + failed). Stop
when either is reached, even if the target isn't met; a later run makes up the rest.

Keep each video lean: a brand-new fact-review subagent and a brand-new QA subagent per video
(never reuse the previous video's), and don't re-read files you already read this run unless
they changed (a template README you haven't read yet is fine). Pick a different template for
each video; `state` already excludes recently used ones.

Video runs never build or change templates: that is the improver agent's job (`agents/improver.md`).

## 2. Plan (you)

Follow `generator/prompts/planner.md`. Use the id from `next_id` for the whole run.

## 3. Write (you)

Follow `generator/prompts/writer.md`. It ends with the number check, which is code and must
print `ok`.

## 4. Fact review (a subagent with fresh context)

Spawn one subagent. Give it only this: the video id, and the instruction to read
`generator/prompts/fact_reviewer.md` and follow it exactly. Do not tell it what you think of the
script or why you wrote it that way. Wait for its verdict.

If it fails the script: fix the lines it named (section 3 again, including the number check),
then ask the **same** subagent to review again. Two rewrites at most.

## 5. Render (code)

```
python -m generator.run render <id>
```

This takes several minutes: run it with a long timeout or in the background and wait for it.
It must print `ok`. If it prints `FAIL:` lines, fix the script and go back to section 3.

## 6. QA review (a subagent with fresh context)

Spawn one subagent. Give it only the video id and the instruction to read
`generator/prompts/qa_reviewer.md` and follow it exactly, opening the PNG files so it sees them.

If it fails the video, fix each problem according to its tag. Re-render and ask the **same**
QA subagent to review again. Three re-renders at most per video.

- **`[script]`:** fix the script lines it named, re-run the number check, ask the fact reviewer
  to re-review the changed lines, then render again.
- **`[template]`:** repair the template yourself; it would fail every future video too.
  1. Edit only `renderer/templates/<template>/template.py`. Make the smallest change that fixes
     the named problem. Do not restyle anything else. Every number on screen must still come
     from code, and the same script and seed must still give the same video.
  2. Run `python -m pytest renderer -q`. It must pass. If you cannot make it pass, undo your
     change with `git checkout -- renderer` and go to "If the video cannot be made to pass".
  3. Render again (section 5) and get the QA review again.
  4. Once the video passes, commit the repair before shipping, so it goes out with the video:
     `git add renderer/templates/<template> && git commit -q -m "Fix <template>: <what was wrong>"`

## 7. Ship

When number check, fact review and QA review have all passed:

```
python -m generator.run ship <id> --commit --push --media-branch
```

This writes the manifest, appends to history, commits to `main` and pushes, then pushes the mp4
on a new branch `media/<id>` (the current commit plus `video.mp4`). A GitHub Actions workflow turns that branch into
Release `video-<id>` and deletes the branch. Cloud sessions are not allowed to create releases
themselves, so do not try `gh release` or the `--release` flag.

- If the **push to main** fails, run `git pull --rebase origin main` and `git push origin HEAD:main`
  once, then `python -m generator.run media <id>` to push the video branch.
- If the **media branch push** fails, retry `python -m generator.run media <id>` once.
- If either still fails, report the exact error text. The mp4 is lost when this session ends;
  a later run cannot recover it.
### If the video cannot be made to pass

After the limits above are used up (three plan attempts, two rewrites, three re-renders), first
undo any template repair that did not lead to a pass (`git checkout -- renderer`), then:

```
python -m generator.run fail <id> --reason "<which check failed and why, one sentence>"
git add videos/<id> && git commit -q -m "Mark video <id> failed" && git push origin HEAD:main
```

A failed video is never released. **Then go back to the loop** (section 1a): run
`python -m generator.run state` again (it gives a new `next_id`) and, if its mode is still
`video` and the run's limits allow, make the next video with a **different template** from the
one that failed.

## Rules for every run

- Never edit `config/settings.json`, `CLAUDE.md`, `PLAN.md`, anything under `apps/`, `workers/`
  or `.github/`, or these prompt files. Under `renderer/`, a video run may only make the
  template repair described in section 6.
- Never force-push, delete a branch, or rewrite history.
- Never commit an mp4 or wav file to `main`. The only place an mp4 goes is the `media/<id>` branch that `ship` creates.
- Do not use any connector or reach any website. Everything you need is in the repository.
- If something outside these instructions blocks you, stop and report it. Do not improvise a
  way around it.

## Report

End with a short report, because the run's status light does not show whether the task worked:

- mode, and the video id or template name
- for a video: template, topic, title, and the result of each step (plan, number check, fact
  review, render, QA review, ship), with how many rewrites or re-renders were needed
- one block per video attempted in this run (shipped or failed), and how many of the daily target are now made
- any template repair (what was wrong, what you changed)
- whether the push to `main` and the push of `media/<id>` succeeded
- anything that failed, with the exact error text
