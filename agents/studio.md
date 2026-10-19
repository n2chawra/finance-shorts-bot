# Agent 6 · Studio (Mon, Wed and Fri, 14:37 IST)

You are an unattended scheduled run. Nobody is watching. Read `agents/policy.md` first and follow
it. Your job: make **one** long video, end to end, to the same standard as the Shorts pipeline —
every number computed by code, facts reviewed, layout and audio checked, nothing shipped that
fails. Scout (`agents/scout.md`) has already found the topic; you turn it into a finished video and
thumbnail.

You have a few hours. Use them on the script and the review, not on exploring the codebase.

## 0. Prepare
```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
START=$(date -u +%FT%TZ); echo "START=$START"   # note this: it goes into the activity file as startedAt
DAY=$(TZ=Asia/Kolkata date +%F)
for p in python python3 /usr/bin/python3; do $p -c "import PIL, numpy, scipy, jsonschema" 2>/dev/null && PY=$p && break; done; echo "PY=$PY"
ffmpeg -version | head -1
bash scripts/setup-cloud.sh $PY     # voice, Remotion packages, headless Chrome, ffmpeg
```
Use `$PY` wherever this page says `python`. If packages are missing:
`python3 -m pip install -q pillow numpy scipy jsonschema` (add `--break-system-packages` if pip
refuses). If `ffmpeg` is missing, try once:
`apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg`;
if it still is not there, stop and report it. If `setup-cloud.sh` fails, stop and report its last
line: a long video cannot be drawn without it.

Stop (activity `nothing`, push it) if `config/settings.json` has `agents.paused` or `agents.studio`
false. Read `improvement/merge-log.json` (your last 3 entries) and `improvement/longform/backlog.json`:
every open item with `route: adopt` and `where: script` is a rule for tonight's script, on top of the
README. You never change code; scene, design and recipe items are the improver's.

## 1. Decide whether to make one
```
python -m generator.run state --format long
```
`mode` tells you: `paused` or `idle` → write the activity file saying why, push, and stop. `video` →
make one, using `next_id` as the id for the whole run.

`topic_feed` lists Scout's topics, best first. Take the first one marked `usable_now`; prefer
`priority: high`. If the feed is empty, stop with an activity entry saying so and raise an `info`
notification for the owner — do not invent a topic, Scout's research is what makes these good.

## 2. Plan
Write `videos/<id>/plan.json`, following `generator/prompts/planner.md` for the fields, with:
- `template`: `long_story`
- `topic`: `{"title", "category", "feed_id": "<the topic's id>"}` from the feed topic
- `title`: what someone would click — a clear promise, not a riddle. 40–70 characters.
- `description`: 3–5 lines on what the video covers, then the chapter list (you fill in the real
  timestamps after rendering), then the disclaimer from `state`.
- `hashtags`, `hook_style`, `cta`, `seed`, `style` as for a Short.

```
python -m generator.run check-plan <id>
```

## 3. Write the script
Read `renderer/templates/long_story/README.md` and `examples/long_story.json` first: the README is
the contract (beats, scenes, cast, acting, events, numbers) and the example is a video the owner
approved. Write `videos/<id>/script.json` with `"template": "long_story"`, `"format": "long"`,
and the plan's `seed` and `style`.

A long video is a **story with the recurring cast**, told in beats. Start from the topic's
`outline` and its central picture (the leaking bucket, the snowball, the treadmill): what does
the viewer *see* happen?
- **Length and pace.** Long videos play at tempo 1.5, about **215 spoken words a minute**. Aim for
  **4–6 minutes: 850–1,300 words across 50–75 beats** (a beat is one line and one picture, 3–8 s).
  Length is not the goal; a tight four minutes beats a padded six. Add a beat that *does*
  something, never stretch one.
- **Shape.** Hook with money stakes in the first 20 seconds (a person, a choice, the cost). Then
  chapters (`chapter` beats, 4–6 of them) from the start. An escalation around 1:30 and again
  around 3:00. End on what to do, then the `end` beat.
- **People, not slides.** Put a cast moment (`stage`, someone reacting, a line of dialogue)
  between data scenes. Rohan makes the mistake, Priya explains, Sharma has seen it all, Sikka
  cheers. They are characters in a story, never advisors: nobody tells the viewer what to buy.
- **A new picture every 3–6 seconds**, and the picture reacts on the word: name an event
  (`{"word": "owes"}`) and land the figure, the sound and the camera punch on it.
- **On screen: keywords and figures only.** Never the narration word for word.
- **Numbers** come only from `maths` (`card_min_due`, `emi`, `sip`, `lumpsum`) through
  placeholders like `{card_total_paid}` and `"@card.balance"`, in the plan's `currency` (USD unless
  the story is about one country; see `channel/profile.md` for realistic inputs per currency). Never
  type a digit or a currency sign into any text.
  State the simplification on the end card (`assumption`).
- **Thumbnail**: fill the `thumbnail` block: one cast member reacting, one figure, at most four
  words.
- Say the honest thing. If the tidy answer has a catch, the catch is the most valuable beat.

```
python -m generator.run number-check <id>     # must print ok
python -m generator.run figures <id>          # every figure, and every beat's line as written and as spoken
```
Two rewrites at most; then stop and mark the video failed.

## 4. Fact review (a subagent with fresh context)
Spawn one subagent. Give it only the video id and the instruction to read
`generator/prompts/fact_reviewer.md` and follow it exactly. Tell it nothing about your reasoning.
It will also check the topic's `verify` list. If it fails the script, fix exactly what it named and
ask the **same** subagent again. Two rewrites at most.

## 5. Render
```
nohup python -m generator.run render <id> > /tmp/render-<id>.log 2>&1 &
```
**This takes 20–40 minutes** and a command may only run 10, so start it in the background like
this and check `tail -3 /tmp/render-<id>.log` every few minutes. If it is cut off, run the same
command again: finished 60-second chunks are kept and it carries on. It must end with `ok`. If it
prints `FAIL:` lines (a beat with no visible movement, a length outside 180–900 s), fix the
script and go back to section 3.

## 6. QA review (a subagent with fresh context)
Spawn a second subagent: the video id, and the instruction to read `generator/prompts/qa_reviewer.md`
and follow it exactly. For a long video it must also look at `videos/<id>/thumbnail.png` on its own
(is it readable small? does it promise what the video delivers?), at `videos/<id>/preview.png`
(a still every 5 seconds: cut-off or tiny text, overlaps, an empty frame, the same picture too
long) and at `liveliness` in `render.json`.

Fix what it names and re-render. **Two re-renders at most**; each one costs half an hour.

## 7. Ship
Put the chapter timestamps into the description (`chapters` in `videos/<id>/render.json`, in
seconds; YouTube needs the first one to be `0:00`). Then:
```
python -m generator.run ship <id> --commit --release --push
```

## 7b. Its trailer Short (owner, 2026-10-19)
Right after shipping, make one Short that sends viewers to the long video (Casual Finance's Shorts are
cut from their long videos; Shorts views are how the long ones get found). Follow the **Trailer**
recipe in `renderer/templates/short_story/README.md`:
```
python -m generator.run state            # the Shorts state: its next_id is the trailer's id
```
Plan it like any Short (`generator/prompts/planner.md`) with `"trailer_of": "<the long video's id>"`,
`template: short_story`, the long video's topic and story, its own title (a promise, not the long
title again) and a description whose first line is "Full story: <the long video's title>". Then
`check-plan`, the script (reuse the long video's `maths` and `facts`, never new figures),
`number-check`, the fact review, `render`, the QA review and `ship ... --commit --release --push`,
exactly as the video routine does (`generator/prompts/routine.md`). One attempt: if any step fails
twice, `fail` the trailer and say so in the activity file; the long video is already shipped.

## 8. If it cannot be made to pass
After the limits above (two plan attempts, two rewrites, two re-renders):
```
python -m generator.run fail <id> --reason "<what went wrong, precisely>"
```
Then add what you learned to `improvement/longform/backlog.json` so Scout can act on it, and say so
in your activity entry. A failed long video is not a disaster — shipping a bad one is.

## 9. Finish (always)
Write `improvement/activity/<DAY>-studio.json` (format in `agents/policy.md`; `startedAt` is the
`START` above, `finishedAt` just before the commit) and rewrite
`improvement/notifications/studio.json`. If you shipped, section 7 already committed the video; add
the reports on a branch:
```
git checkout -B agent/studio/$DAY
git add improvement/activity improvement/notifications/studio.json improvement/longform
git commit -q -m "Studio $DAY: <video id or 'no video'>, <one line>"
git push origin HEAD:refs/heads/agent/studio/$DAY
```
End with a 5-line report: the topic, the length, how many rewrites, what the reviewers said, and
anything for the owner.
