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
- `story`: the topic's long format (`formats` in `state`: `list_explained`, `once_you_understand`,
  `which_one_are_you`, `how_they_make_money`, `rich_vs_poor`) and `demand`: the topic's reference
  video `{title, views, url}`. `check-plan` fails without both (owner reset, 2026-10-21).
- `title`: a big promise someone would click, in the shape of the reference video's ("Every money
  trap the middle class falls into", "Once you understand X, you'll never Y"). 40–70 characters.
- `description`: 3–5 lines on what the video covers, then the chapter list (you fill in the real
  timestamps after rendering), then the line "An animated story with illustrative numbers; the
  characters are not advisers.", then the disclaimer from `state` (YouTube's policy on content that
  presents itself as an expert giving financial advice; Shorts carry the same line).
- `hashtags` (3–6, no `#Shorts`), `hook_style`, `cta`, `seed`, `style` as for a Short.

```
python -m generator.run check-plan <id>
```

## 3. Write the script
**The shot system first** (owner, 2026-10-21): read `renderer/templates/SHOTS.md`,
`.claude/skills/motion-direction/SKILL.md` and `examples/short_story_shot.json` (the approved
showcase, a Short: the same shots work in 16:9). At least 60% of the beats are `shot`s, each chapter
in its own set, the camera changing size on the words; then write the video's custom hook,
`remotion/src/videos/<id>/Hook.tsx` (`remotion/src/videos/README.md`). The render fails a video
with empty frames, one shot size or one set (`renderer/craft.py`).

Then read `renderer/templates/long_story/README.md` and `examples/long_story.json`: the README is
the contract (beats, scenes, cast, acting, events, numbers) and the example is a video the owner
approved. Write `videos/<id>/script.json` with `"template": "long_story"`, `"format": "long"`,
and the plan's `seed` and `style`.

A long video is a **story with the recurring cast**, told in beats. Start from the topic's
`outline` and its central picture (the leaking bucket, the snowball, the treadmill): what does
the viewer *see* happen?
- **Length and pace.** Long videos play at tempo 1.5, about **215 spoken words a minute**. Aim for
  **8–12 minutes: 1,700–2,600 words across 100–150 beats** (a beat is one line and one picture,
  3–8 s). Add a beat that *does* something, never stretch one.
- **Shape (the format's list).** A 30-second hook that promises every item and teases the worst one.
  Then one `chapter` per item (6–9), each a mini story with the cast, one or two computed figures
  and a cliffhanger into the next; a recap-and-tease every 2–3 minutes; the strongest item last.
  End on what to do, then the `end` beat. Big captions run along the bottom automatically.
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

**Three thumbnails** (owner, 2026-10-19): besides `thumbnail`, write `thumbnails` with two more, each
with a different `angle` from `number` (the figure leads), `question` (the words ask), `reaction` (a
cast member's face leads), `versus` (two things compared) and `warning` (a risk named). Give the
main one an `angle` too. They are tested against each other on YouTube (Test & Compare); read
`thumbnailAngles` in `python -m improvement.evaluate --json` first and make the angle that wins most
often the main one, with two others to keep learning.
All three use `layout: "story"` (one picture that says the topic: the `hero` object with the small
amount on it, an arrow to the receipt with the big `figure`, the cast member reacting); the angle
changes the `words`, and the words always **name the topic** ("Paying the minimum?"), never only a
figure. Follow the **Look and motion** rules in the long_story README for every beat: the hook shows
topic and shock in five seconds, no text-only slides, and each scene's place, time, land and weather
chosen for this story.

## 4. Fact review (a subagent with fresh context)
Spawn one subagent. Give it only the video id and the instruction to read
`generator/prompts/fact_reviewer.md` and follow it exactly. Tell it nothing about your reasoning.
It will also check the topic's `verify` list. If it fails the script, fix exactly what it named and
ask the **same** subagent again. Two rewrites at most.

## 5. Stills first, then QA review, then the video
The video is the slow part, so QA looks at the stills **before** it is drawn (2026-10-21: the
first long video was rendered three times, twice for problems the stills already showed).

1. **Stills** (a few minutes):
   ```
   nohup python -m generator.run render <id> --preview > /tmp/stills-<id>.log 2>&1 &
   ```
   It builds the voice and timeline, draws the contact sheet, the thumbnails and the layout
   probe, and checks layout, length (480–900 s) and sound. It must end with `ok`. `FAIL:` lines:
   fix the script and go back to section 3.
2. **QA review** (section 6) on those stills; fix what it names and run the stills again (the
   voice is cached).
3. **The video**, once QA has passed:
   ```
   nohup python -m generator.run render <id> > /tmp/render-<id>.log 2>&1 &
   ```
   **This takes 40–80 minutes** for 8–12 min at the shot system's detail, and a command may only run 10, so start it in the background like
   this and check `tail -3 /tmp/render-<id>.log` every few minutes. If it is cut off, run the same
   command again: finished 40-second chunks are kept and it carries on. It must end with `ok`. A
   `FAIL:` here is the motion gate (a beat with no visible movement): fix that beat and render
   again; a re-render that only changed the sound reuses the picture.

## 6. QA review (a subagent with fresh context)
Spawn a second subagent: the video id, and the instruction to read `generator/prompts/qa_reviewer.md`
and follow it exactly, on the stills from step 5.1. For a long video it must also look at
`videos/<id>/thumbnail.png` on its own (is it readable small? does it promise what the video
delivers?) and at `videos/<id>/preview.png` (a still every 5 seconds: cut-off or tiny text,
overlaps, an empty frame, the same picture too long).

Fix what it names and render the stills again. **Two rounds at most**.

## 7. Ship
Put the chapter timestamps into the description (`chapters` in `videos/<id>/render.json`, in
seconds; YouTube needs the first one to be `0:00`). Then:
```
python -m generator.run ship <id> --commit --push --media-branch
```
This commits the manifest to `main`, then pushes the mp4 on a branch `media/<id>`; a workflow turns
it into Release `video-<id>` and deletes the branch. Cloud sessions may not create releases, so
never use `gh release` or `--release`. A long video is over GitHub's 100 MB file limit, so it goes up
in 90 MB parts that the workflow joins back (2026-10-21); nothing to do by hand.

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

## The story spine and the build scene (owner, 2026-10-26)

Long videos now follow the Shorts upgrade: a story spine (hook within 15 s, every chapter promised
within 30 s, chapters as levels with a climbing number, a `tease` closing each chapter, a turn and a
payoff) and pictures made of the video's own drawn props in `build` beats that change on the words,
with coded `Hook.tsx`, `Turn.tsx` and `Payoff.tsx`. Read the long_story README "The story spine"
and `renderer/templates/SHOTS.md` "The build scene"; the reference is `L-remake-borrow`. The render
fails a video that breaks the spine, leaves 2.5 s with nothing new, or shows things nobody is saying.

## The title and the thumbnail are one pair (owner, 2026-10-26)

Our long videos got almost no clicks: the thumbnails sold one small detail (a receipt and a
figure) and twice promised a different video from the title ("The 6 levels of money" with "The
level two trap"). Write the pair together:
- **The title** says *what*: 60 characters at most, the format's proven shape.
- **The thumbnail** says *why click*: the whole promise as a picture (every item, the whole ladder,
  the two extremes) and 1-4 huge words that add the emotion or the stakes. No figure.
- Pick the type for the format (`renderer/thumbs.py` `FORMAT_TYPES`), three different types for
  the three thumbnails, and check them in the feed (`python -m renderer.thumbs feed <id>`) before
  shipping: would you click ours over the hits next to it?

