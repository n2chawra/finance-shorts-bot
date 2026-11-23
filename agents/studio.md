# Agent 6 · Studio (Mondays and Wednesdays, 08:05 IST: two long videos a week, out Wednesday and Friday at 20:07)

Owner, 2026-11-16: two long videos a week (`longPerWeek` 2), out Wednesday and Friday nights. Each run
still makes **one**; `state --format long` says `video` while this week has fewer than two, so the
Monday run fills Wednesday's slot and the Wednesday run fills Friday's.

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
for p in python python3 /usr/bin/python3; do $p -c "from PIL import Image; import numpy, scipy, jsonschema" 2>/dev/null && PY=$p && break; done; echo "PY=$PY"
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
false. Read `improvement/merge-log.json` (your last 3 entries) and `channels/<channel>/longform/backlog.json`:
every open item with `route: adopt` and `where: script` is a rule for tonight's script, on top of the
README. You never change code; scene, design and recipe items are the improver's.

## 0b. The owner's feedback (every run)
Run `python3 -m generator.feedback --agent studio` and follow `agents/policy.md`, "The owner's feedback":
fix every note in your lane tonight (notes handed to you first), hand on what belongs to another agent,
and answer each in `channels/<channel>/feedback-acks/studio.json` (commit it with your branch).

## 1. Decide whether to make one
```
python -m generator.run state --format long --channel <channel>
```
`mode` tells you: `paused` or `idle` → write the activity file saying why, push, and stop. `video` →
make one, using `next_id` as the id for the whole run.

`topic_feed` lists Scout's topics, best first (topics the owner pinned, `"pin": 1, 2…`, lead in that order). Take the first one marked `usable_now`; after the pins, prefer
`priority: high`. If the feed is empty, stop with an activity entry saying so and raise an `info`
notification for the owner — do not invent a topic, Scout's research is what makes these good.

## 2. Plan
Write `channels/<channel>/videos/<id>/plan.json`, following `generator/prompts/planner.md` for the fields, with:
- `template`: `long_story`
- `topic`: `{"title", "category", "feed_id": "<the topic's id>"}` from the feed topic
- `story`: the topic's long format (`formats` in `state`, from the channel's
  `research/formats.json`) and `demand`: the topic's reference
  video `{title, views, url}`. `check-plan` fails without both (owner reset, 2026-10-21).
- **No Short of ours is needed** (owner, 2026-11-22, on every channel): any usable feed topic can be
  made. Never stop a run, or skip a long video, because no Short has enough views. If the topic names a
  `from_short`, the first 30 s restate that Short's hook and promise the full answer, and the
  description's first line links it ("The 30-second version: https://youtube.com/shorts/<its YouTube id>"),
  and after shipping you raise an owner notification: "In YouTube Studio open the Short <title> →
  Related video → pick <this long video>" (the API can't set it). Without one, open on the long video's
  own question. The channel's long length (`longLengthMinSec`–`longLengthMaxSec` in `state`).
- `title`: phrased as people search the topic's question, else a big promise someone would click, in
  the shape of the reference video's ("Once you understand X, you'll never Y"). 40–70 characters.
- `description`: 3–5 lines on what the video covers, then the chapter list (you fill in the real
  timestamps after rendering), then the disclaimer from `state` (the channel's `channel.json`; Shorts carry
  the same line).
- `hashtags` (3–6, no `#Shorts`), `hook_style`, `cta`, `seed`, `style` as for a Short.

```
python -m generator.run check-plan <id> --channel <channel>
```

## 3. Write the script
**First, what keeps failing** (2026-10-29): read `generator/prompts/checklist.md` and run
`python -m generator.run failures --format long --channel <channel>`. Write so that none of it happens again.

**Directed 2D shots, like the Shorts** (owner, 2026-11-13: "also fix in long video same thing"): every
beat except the `end` card is `"scene": "directed"`. (A channel whose `channel.json` `look.engine` is `doc`: every beat except the `end` card is
`"scene": "doc"` instead; follow `python -m generator.run prompt director --channel <channel>`.) Follow `generator/prompts/director.md` (Step 1: a
place, someone doing something, the figure on a thing, the camera and the moments on words; Step 2: one
file per beat in `remotion/src/videos/<id>/` on the flat kit, `remotion/src/flat/`). A long video is
1920×1080: compose for landscape (the channel's reference Shorts work wider, with the same kit,
places and ideas and slower moves). Each chapter gets its own places; a chapter opener is a
directed beat in the chapter's first place with its title on a thing there (a sign, a door, a screen),
not a title card. The render fails a video with empty frames, one shot size or one place
(`renderer/craft.py`).

Then read `renderer/templates/long_story/README.md` and `examples/long_story.json`: the README is
the contract (beats, scenes, cast, acting, events, numbers) and the example is a video the owner
approved. Write `channels/<channel>/videos/<id>/script.json` with `"template": "long_story"`, `"format": "long"`,
and the plan's `seed` and `style`.

A long video is a **story with the recurring cast**, told in beats. Start from the topic's
`outline` and its central picture (the leaking bucket, the snowball, the treadmill): what does
the viewer *see* happen?
- **Length and pace.** Long videos play at tempo 1.25, about **180 spoken words a minute** (1.5 and ~215 until the
  owner found it too fast, 2026-11-04). Aim for the setting `longLengthMinSec`–`longLengthMaxSec`
  (180–240 s: **540–720 words across 36–50 beats**) (a beat is one line and one picture,
  3–8 s). Add a beat that *does* something, never stretch one.
- **The first sentence states the stakes** (owner, 2026-11-22, on every channel): what is at stake in plain
  words, the small cause and how big it got (a toll, a sum, a scale), so someone who isn't already a fan wants
  the rest ("One changed rod on a hotel walkway killed 114 people."). Never a slow scene-setter first; keep the
  title free of it. The channel's recipe says how strongly (no horror on Disaster Desk).
- **Shape (the format's list).** A 30-second hook that promises every item and teases the worst one.
  Then one `chapter` per item (6–9), each a mini story with the cast, one or two computed figures
  and a cliffhanger into the next; a recap-and-tease every 2–3 minutes; the strongest item last.
  End on what to do, then the `end` beat. Big captions run along the bottom automatically.
- **Things happening, not slides.** On a channel with a cast (`look.cast`), put a cast moment between
  data scenes; on one without, something in the place acts (a map redraws, a part fails, a product
  moves). Characters are in a story, never advisers: nobody tells the viewer what to buy.
- **A new picture every 3–6 seconds**, and the picture reacts on the word: name an event
  (`{"word": "owes"}`) and land the figure, the sound and the camera punch on it.
- **On screen: keywords and figures only.** Never the narration word for word.
- **Numbers** come only from sourced `facts` and `maths` through placeholders like `{fact_area}` and
  `"@calc.total"`, in the plan's `currency` where money appears (the channel's `channel.json`). Never
  type a digit or a currency sign into any text.
  State the simplification on the end card (`assumption`).
- **Thumbnails**: three, coded for this video from its own topic's hits, rated, one picked (below).
- Say the honest thing. If the tidy answer has a catch, the catch is the most valuable beat.

```
python -m generator.run number-check <id> --channel <channel>     # must print ok
python -m generator.run figures <id> --channel <channel>          # every figure, and every beat's line as written and as spoken
python -m generator.run lint <id> --channel <channel>             # ~20 s: spine, picture, devices, props, thumbnail, own code; must print ok
```
Run `lint` after every change to the script or the video's code, before any stills: it finds in
seconds what used to cost a render each.
Two rewrites at most; then stop and mark the video failed.

**Three thumbnails, made from this topic's own hits** (owner, 2026-11-11: "every topic's thumbnail should be
made using the topic's own videos' thumbnails, so that ours is close to what actually gets clicked. Plus give 3
thumbnails so that I can pick the best one, and if I don't, rate it yourself and pick it before upload"). After the script:
```
python -m renderer.thumbs refs <id>      # THIS topic's most viewed videos: the market search, the demand video, a live YouTube search
```
Open the sheet it prints (a PNG: look at it). Only this topic's videos count: never another topic's hits or the
channel-wide examples (lint fails a `references` id that isn't on the sheet). If the sheet is off topic, set a better
`search` on the long topic in `channels/<channel>/longform/topics.json` and run it again. Find the **three different
patterns** the hits use (the picture, the face, the words, the colours) and code one thumbnail per pattern with our
cast and this video's props, from `remotion/src/studio/thumb.tsx`: `remotion/src/videos/<id>/Thumb.tsx` (A),
`ThumbB.tsx` and `ThumbC.tsx`. Fill `thumbnail` (A) and `thumbnails` ([B, C]) as the long_story README says, each with
its own `component`, `pattern` and 3+ `references` from the sheet. After the stills, `python -m renderer.thumbs feed <id>`
puts all three among the hits: **rate each** (`score` 1-10, `why`: would a viewer pick it over the hits beside it? Does it
read at phone size, match the title, promise what the video delivers?) and set `thumbnail_pick` (`"a"`, `"b"` or `"c"`) to
the best. The owner picks on the dashboard (video page, "Pick the thumbnail"); if he doesn't, yours goes up. The
spec check fails a calm face, more than 3 things and a scale word the title doesn't use, on all three. Then follow the **Look and motion** rules in the long_story README for every beat: the hook shows
topic and shock in five seconds, no text-only slides, and each scene's place, time, land and weather
chosen for this story.

**A topic nobody has covered** (owner, 2026-11-23: "not every video might have a reference; some might be unique"):
when `python -m renderer.thumbs refs <id>` and a search find fewer than three hits on this topic, don't borrow another
topic's hits. Give each spec `"unique": "<what you searched and what came up>"` and design the three from the
channel's own thumbnail patterns and the video's strongest picture; references are then optional.

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
   nohup python -m generator.run render <id> --preview --channel <channel> > /tmp/stills-<id>.log 2>&1 &
   ```
   It builds the voice and timeline, draws the contact sheet, the thumbnail and the layout
   probe, and checks layout, length (the settings' range) and sound. It must end with `ok`. `FAIL:` lines:
   fix the script and go back to section 3.
2. **QA review** (section 6) on those stills; fix what it names and run the stills again (the
   voice is cached).
3. **The video**, once QA has passed:
   ```
   nohup python -m generator.run render <id> --channel <channel> > /tmp/render-<id>.log 2>&1 &
   ```
   **This takes 20–40 minutes** for 3–4 min at the shot system's detail, and a command may only run 10, so start it in the background like
   this and check `tail -3 /tmp/render-<id>.log` every few minutes. If it is cut off, run the same
   command again: finished 40-second chunks are kept and it carries on. It must end with `ok`. A
   `FAIL:` here is the motion gate (a beat with no visible movement): fix that beat and render
   again; a re-render that only changed the sound reuses the picture.

## 6. QA review (a subagent with fresh context)
Spawn a second subagent: the video id, and the instruction to read `generator/prompts/qa_reviewer.md`
and follow it exactly, on the stills from step 5.1. For a long video it must also look at
`channels/<channel>/videos/<id>/thumbnail.png` on its own (is it readable small? does it promise what the video
delivers?) and at `channels/<channel>/videos/<id>/preview.png` (a still every 5 seconds: cut-off or tiny text,
overlaps, an empty frame, the same picture too long).

Fix what it names and render the stills again. **Two rounds at most**.

## 7. Ship
Put the chapter timestamps into the description (`chapters` in `channels/<channel>/videos/<id>/render.json`, in
seconds; YouTube needs the first one to be `0:00`). Then:
```
python -m generator.run ship <id> --commit --push --media-branch --channel <channel>
```
This commits the manifest to `main`, then pushes the mp4 on a branch `media/<id>`; a workflow turns
it into Release `video-<id>` and deletes the branch. Cloud sessions may not create releases, so
never use `gh release` or `--release`. A long video is over GitHub's 100 MB file limit, so it goes up
in 90 MB parts that the workflow joins back (2026-10-21); nothing to do by hand.

## 8. If it cannot be made to pass
After the limits above (two plan attempts, two rewrites, two re-renders):
```
python -m generator.run fail <id> --reason "<what went wrong, precisely>" --channel <channel>
```
Then add what you learned to `channels/<channel>/longform/backlog.json` so Scout can act on it, and say so
in your activity entry. A failed long video is not a disaster — shipping a bad one is.

## 9. Finish (always)
Write `improvement/activity/<DAY>-studio.json` (format in `agents/policy.md`; `startedAt` is the
`START` above, `finishedAt` just before the commit) and rewrite
`channels/<channel>/notifications/studio.json`. If you shipped, section 7 already committed the video; add
the reports on a branch:
```
git checkout -B agent/studio/$DAY
git add improvement/activity channels/<channel>/notifications/studio.json improvement/longform $(ls channels/<channel>/feedback-acks/studio.json 2>/dev/null)
git commit -q -m "Studio $DAY: <video id or 'no video'>, <one line>"
git push origin HEAD:refs/heads/agent/studio/$DAY
```
End with a 5-line report: the topic, the length, how many rewrites, what the reviewers said, and
anything for the owner.

## The board and the build scene (retired for new videos, 2026-11-13)
The board (2026-11-02) and the build scene with its documentary devices (2026-10-26) told long videos
until the directed shots replaced them; they stay in the code only so old videos can be re-rendered.
What they taught still holds and the director keeps it: a question in the viewer's voice every 30 s,
readable on mute (the figure on a thing in the place), real names with the sourced facts Scout put in
the topic, one idea per beat.

## The story spine (owner, 2026-10-26)

A story spine: hook within 15 s, every chapter promised within 30 s, chapters with a climbing number,
a `tease` closing each chapter, a turn and a payoff (the long_story README "The story spine"). The
picture is directed (`generator/prompts/director.md`). The render fails a video that breaks the spine,
leaves 2.5 s with nothing new, or shows things nobody is saying.

## A channel's own thumbnail playbook (owner, 2026-11-20: "long videos are the money machine, the thumbnail has to be the best, every time")

When the channel's `channel.json` has a `thumbs` block (Craze & Crash, A Billion Switches), its playbook
(`thumbs.playbook`, the channel's `style-study/2026-11-20-thumbnails.md`) **replaces the cast-based thumbnail
advice above**:
- Read the playbook first: the ranked patterns (P1…P8), which story types each suits, the hard rules (words,
  size at 168 px wide, one focal subject filling 40–70%, colour logic, the bottom-right corner clear for the
  duration stamp, never the answer or the twist on the thumbnail), and the "never" list.
- Give each of A, B and C a `pattern_id` from `thumbs.patterns`, all three different, chosen by the playbook's
  story-type table (for example a crash: A = P1, B = P2, C = P4). Still take 3+ `references` from this topic's
  own sheet; when the sheet lacks a pattern, cite the playbook's example for it and say so in `why`.
- No cast face (`expression`) on these channels: the subject carries the emotion (a ruined product, a crash
  line, a lit interior, a real person's licensed photo). Craze & Crash draws on the doc kit (`remotion/src/doc/`:
  cut-outs from `python -m generator.media cutout`, plates, crash lines, stamps); A Billion Switches on the 3D
  thumbnail path (`LongThumb3D`, `remotion/src/three/`, `thumbLook`).
- **Score each with the playbook's 10-point checklist** (section 5), writing the points in `why`
  ("1,2,3,5,6,7,8,10 = 8; missed 4: five words"), set `score`, and pick the highest. **Ship only at 8+**: below
  that, fix the weakest point and re-score once (lint fails a pick under the bar).
- After publishing, the owner can run YouTube's Test & Compare with A, B and C in Studio (there is no API for
  it); say so in the run's report with the three file names.

## The title and the thumbnail are one pair (owner, 2026-10-26)

Our long videos got almost no clicks: the thumbnails sold one small detail (a receipt and a
figure) and twice promised a different video from the title ("The 6 levels of money" with "The
level two trap"). Write the pair together:
- **The title** says *what*: 60 characters at most, the format's proven shape.
- **The thumbnails** say *why click*, in the picture language this topic's own hits already use
  (`python -m renderer.thumbs refs <id>`), with 1-4 huge words that add the emotion or the stakes.
  Check all three in the feed (`python -m renderer.thumbs feed <id>`) before shipping and rate them: would you
  click ours over the hits next to it?

