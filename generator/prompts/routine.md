# Routine: one generation run

You are an unattended scheduled run for the Finance Shorts Bot. Nobody is watching and nobody
will answer questions. Do one run as described here, then stop. Work only in this repository.

Keep the run lean: it uses a Claude Pro plan's quota. Read only the files this page names, do not
run the test suite, do not explore the codebase, and do not improve things you were not asked to.

## 0. Prepare

```
git checkout main && git pull --ff-only
python -c "import PIL, numpy, scipy, jsonschema" || pip install -q -r renderer/requirements.txt || pip install -q --break-system-packages -r renderer/requirements.txt
ffmpeg -version | head -1
```

If `ffmpeg` is missing, try once: `apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg`.
If it is still missing, stop and report "ffmpeg could not be installed" with the error text.

## 1. Decide what this run does

Run `python -m generator.run state` and read `mode`:

| mode | What to do |
|---|---|
| `paused` | Nothing. Report "generation is paused" and stop. |
| `idle` | Nothing. Report the `reason` and stop. |
| `video` | Make one video: sections 2 to 7. |
| `template_work` | Follow `generator/prompts/template_builder.md`, then section 8. |

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

If it fails the video: fix the script lines it named, re-run the number check, ask the fact
reviewer to re-review the changed lines, render again, and ask the **same** QA subagent to
review again. Two re-renders at most.

## 7. Ship

When number check, fact review and QA review have all passed:

```
python -m generator.run ship <id> --release --commit --push
```

This uploads `video.mp4` as GitHub Release `video-<id>`, writes the manifest, appends to
history, commits to `main` and pushes.

- If the **release upload** fails, do not retry more than once. Run
  `python -m generator.run ship <id> --commit --push` instead so the manifest and history are
  saved with `uploaded: false`, and say clearly in your report that the mp4 was not uploaded and
  why (include the error text). The mp4 is lost when this session ends; a later run cannot
  recover it.
- If the **push** fails, run `git pull --rebase origin main` and `git push origin HEAD:main`
  once. If it still fails, report it.

### If the video cannot be made to pass

After the limits above are used up (three plan attempts, two rewrites, two re-renders):

```
python -m generator.run fail <id> --reason "<which check failed and why, one sentence>"
git add videos/<id> && git commit -q -m "Mark video <id> failed" && git push origin HEAD:main
```

A failed video is never released. Do not start a second video in the same run.

## 8. After template work

Commit the template (or the improvement) and `history/template_work.json` to `main` and push:

```
git add renderer generator examples history && git commit -q -m "<what you built or changed>" && git push origin HEAD:main
```

Only push a template whose two test videos passed. Never push a template that fails
`python -m pytest renderer generator -q` (this is the one case where you run the tests).

## Rules for every run

- Never edit `config/settings.json`, `CLAUDE.md`, `PLAN.md`, anything under `apps/`, `workers/`
  or `.github/`, or these prompt files.
- Never force-push, delete a branch, or rewrite history.
- Never commit an mp4 or wav file.
- Do not use any connector or reach any website. Everything you need is in the repository.
- If something outside these instructions blocks you, stop and report it. Do not improvise a
  way around it.

## Report

End with a short report, because the run's status light does not show whether the task worked:

- mode, and the video id or template name
- for a video: template, topic, title, and the result of each step (plan, number check, fact
  review, render, QA review, ship), with how many rewrites or re-renders were needed
- whether the release asset was uploaded
- anything that failed, with the exact error text
