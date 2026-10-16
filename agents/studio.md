# Agent 6 · Studio (Mon, Wed and Fri, 14:37 IST)

You are an unattended scheduled run. Nobody is watching. Read `agents/policy.md` first and follow
it. Your job: make **one** long video, end to end, to the same standard as the Shorts pipeline —
every number computed by code, facts reviewed, layout and audio checked, nothing shipped that
fails. Scout (`agents/scout.md`) has already found the topic; you turn it into a finished video and
thumbnail.

You have a few hours. Use them on the script and the review, not on exploring the codebase.

> **On hold since 2026-10-16.** The long-form renderer was rebuilt around character animation
> after the owner rejected the first long video ("a PPT with a voiceover"), and the replacement
> sample is waiting for approval. **Do not make a long video.** Write an activity entry of
> `nothing` saying you are on hold, push it, and stop. This hold is lifted by deleting this block;
> `longPerWeek` in the dashboard settings is the other half of it, and either one holds you.

## 0. Prepare
```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
START=$(date -u +%FT%TZ); echo "START=$START"   # note this: it goes into the activity file as startedAt
DAY=$(TZ=Asia/Kolkata date +%F)
for p in python python3 /usr/bin/python3; do $p -c "import PIL, numpy, scipy, jsonschema" 2>/dev/null && PY=$p && break; done; echo "PY=$PY"
ffmpeg -version | head -1
bash scripts/setup-voice.sh $PY     # the offline voice; long videos are always narrated
```
Use `$PY` wherever this page says `python`. If packages are missing:
`python3 -m pip install -q pillow numpy scipy jsonschema` (add `--break-system-packages` if pip
refuses). If `ffmpeg` is missing, try once:
`apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg`;
if it still is not there, stop and report it.

Stop (activity `nothing`, push it) if `config/settings.json` has `agents.paused` or `agents.studio`
false. Read `improvement/merge-log.json` (your last 3 entries) and `improvement/longform/backlog.json`.

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
- `template`: `long_explainer`
- `topic`: `{"title", "category", "feed_id": "<the topic's id>"}` from the feed topic
- `title`: what someone would click — a clear promise, not a riddle. 40–70 characters.
- `description`: 3–5 lines on what the video covers, then the chapter list (you fill in the real
  timestamps after rendering), then the disclaimer from `state`.
- `hashtags`, `hook_style`, `cta`, `seed`, `style` as for a Short.

```
python -m generator.run check-plan <id>
```

## 3. Write the script
Read `renderer/templates/long_explainer/README.md` and `examples/long_explainer.json` first — the
README is the contract and the example shows the shape.

Build the video from the topic's `outline`: one section per beat. Then:
- **Length**: aim for **4–6 minutes** — about **7–10 sections** and **700–1,100 words** of
  narration. Length is not the goal. A tight four minutes beats a padded nine, and the owner
  rejected the first long video for exactly that. Make it longer by adding a scene that *does*
  something, never by stretching one.
- **A section is a verb, not a slide.** The kinds are `hook`, `beat`, `drain`, `pile`, `grow`,
  `compare`, `chart`, `steps`, `end`, and each one is an action that runs for its whole length:
  coins leaving a wallet, a stack growing past the hero's head, a tree growing, a chart drawing
  itself. There are no bulleted lists, because a list is a slide.
- **Text only where it is needed.** One `heading` per section and a label on the figure. Never
  write the narration on screen: the viewer cannot read and listen at once, and a video that does
  both is the slideshow again.
- **Narration is the video.** Write about **3 words per second** of each section. The render fails
  any section whose narration fills less than 55% of its window — silence over music is what makes
  a video feel padded.
- **Vary the sections.** Two `beat` sections in a row is the most common way an explainer goes
  flat; put a `pile`, a `grow` or a `compare` between them. The render also fails if the picture
  stops moving (median frame change under 1.2, or four seconds with nothing happening) — check
  `liveliness` in `render.json`.
- **Numbers**: every figure comes from `maths`. Pick realistic rates (equity about 10–12%, FDs
  6–7.5%, inflation 5–6%). Never type a digit into any text or narration line.
- **Thumbnail**: fill the `thumbnail` block — 3–5 huge words and one figure. It has to read at the
  width of a thumb.
- Say the honest thing. If the tidy answer has a catch, the catch is the most valuable section.

```
python -m generator.run number-check <id>     # must print ok
python -m generator.run figures <id>          # read every line and every voice line as a viewer and listener
```
Two rewrites at most; then stop and mark the video failed.

## 4. Fact review (a subagent with fresh context)
Spawn one subagent. Give it only the video id and the instruction to read
`generator/prompts/fact_reviewer.md` and follow it exactly. Tell it nothing about your reasoning.
It will also check the topic's `verify` list. If it fails the script, fix exactly what it named and
ask the **same** subagent again. Two rewrites at most.

## 5. Render
```
python -m generator.run render <id>
```
**This takes 15–30 minutes** for a long video. Run it in the background or with a long timeout and
wait for it; it prints its progress as a percentage. It must print `ok`. If it prints `FAIL:` lines,
fix them (they name the section) and go back to section 3.

## 6. QA review (a subagent with fresh context)
Spawn a second subagent: the video id, and the instruction to read `generator/prompts/qa_reviewer.md`
and follow it exactly. For a long video it must also look at `videos/<id>/thumbnail.png` on its own
(is it readable small? does it promise what the video delivers?) and at the `voice` block in
`render.json` (any section under 60% fill reads as padded even when it passes).

Fix what it names and re-render. **Two re-renders at most** — each one costs half an hour.

## 7. Ship
Put the real chapter timestamps into the description (the section boundaries are in
`videos/<id>/render.json`; YouTube needs the first one to be `0:00`). Then:
```
python -m generator.run ship <id> --commit --release --push
```

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
