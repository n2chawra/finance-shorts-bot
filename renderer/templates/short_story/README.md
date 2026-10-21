# short_story — Shorts on Remotion

A vertical Short (1080×1920, 20–35 s) told in beats by the recurring cast, drawn by Remotion.
Same pipeline, scenes, cast, numbers and rules as [`long_story`](../long_story/README.md): read
that README for the script fields, `maths` kinds, beats, events, acting and the scene table.
Example: [`examples/short_story.json`](../../../examples/short_story.json). There is no
`schema.json`: `python -m generator.run number-check <id>` validates the whole script.

## The shot system (required since 2026-10-21)

**Read [`../SHOTS.md`](../SHOTS.md) and `.claude/skills/motion-direction/SKILL.md` first.** A new
Short is built from composed `shot` beats (a lit set, the cast big, money as a thing, a camera
with shot sizes) plus a custom `hook` for its first beat: at least 60% of the beats, or the render
fails. The older scenes below (`stage`, `bill`, `road`, `fork`, `prop`, `kinetic`…) may still fill
a beat or two, never more. Reference: [`examples/short_story_shot.json`](../../../examples/short_story_shot.json).

## What is different in a Short

- `"format": "short"`, `"template": "short_story"`.
- **Pace:** tempo 1.4 (voice included), about **200 spoken words a minute**. 20–35 s is
  **65–115 words in 7–11 short beats**. No `chapter` beats.
- **The first second is the hook.** The first beat's opening lines (`"at": "start"`) are on screen
  from frame 0, because that frame is what the feed shows: a big figure or a sharp question.
- **One idea.** A Short makes one point with one calculation. Cut every beat that doesn't move it.
- **A new picture every 3 s.** A beat longer than 5 s needs a named event at least every 3 s (a
  line appearing, a count-up, a pose, a camera punch), or split it in two. Spoken figures are long
  ("two thousand eight hundred fifty-four pounds"), so the gap is usually around a number.
  `number-check` prints a `WARN:` line for each beat that misses it; fix those before rendering.
- **Big captions on screen** (owner, 2026-10-21): every spoken word is drawn big over the picture,
  automatically: at about 40–48% of the height in a `stage` beat (on the wall above the cast's
  heads) and at about 66–74% in every other scene; the hook's first words are already there in
  frame 0. Keep those bands free of other text; put scene labels and figures in the top half.
- **Vertical layouts**: scenes stack their content for the tall frame. Keep `actors` to one or two
  per `stage` beat, near the middle (`x` 0.3–0.7).
- **Loop:** the last line leads back into the first, so a replay feels continuous.
- **No `end` beat:** the disclaimer shows as a small line over the last moments and is in the
  description (owner, 2026-10-21). An end card stops the loop.

## The visual kit in a Short

(Before the shot system) Most beats were `prop`, `screen`, `equation` or `kinetic` with a `presenter` at the bottom:
the graphic carries the figure in the top part, a cast member talks below (see the long_story
README for every option). Use a `kinetic` typed card for the turn of the story, one `stage` beat
for a character moment with a `bubble`, and keep plain `bignumber` beats rare. Example:
[`examples/short_story_kit.json`](../../../examples/short_story_kit.json).

## Evidence: `source` and `pen` (2026-10-19)

From the Casual Finance study (`improvement/style-study/2026-10-19-casual-finance.md`): show the
proof at the moment of the claim, and mark it up while it is spoken.
- **`source`**: for a news fact, draw the document: `publisher` (words only), `title`, and `lines`,
  each `{text, highlight?, underline?, at?}` (`underline`: a red marker line under the words). The highlighted line is the sentence being spoken, with the fact as
  a placeholder (`{fact1}`); it sweeps yellow on its `at` event. The "Data: …" source line shows at
  the foot of the card automatically. Use it once per news Short, right after the headline.
- **`pen`** (on `source`, `screen` and `chart`): hand-drawn marks that draw on at a word: `circle`
  (`x`, `y`, `r`), `underline` and `arrow` (`x`, `y` → `x2`, `y2`), `gap` (a double arrow from `y` to
  `y2` at `x`), `tick`, `cross`, `note` (`text`, a placeholder or short words). Positions are 0..1
  of the card or plot. `color`: `bad` (default), `good`, `accent`, `ink`. One or two marks per beat.
- **Pointer**: a presenter can point at the evidence with a stick: pose `aimUp` (Short) or `aim`
  (long) with `prop: "pointer"` / `"pointerUp"`.

## Look and motion (owner, 2026-10-19)

The long_story README's **Look and motion** rules apply to Shorts too: the first frames show the
topic and the shock together; no text-only slides (at most one `bignumber`/`reveal`); something
always moves; and each scene's `place`, `time`, `land` and `weather` fit this story. The story
scenes work vertically: `bill` (a small payment turning into a big bill) is the strongest hook for
a cost; `road` for anything that takes years; `fork` instead of side-by-side bars. Retired:
`monster`. Avoid: `towers`.

## The cover (`thumbnail`, required)

The cover is what makes someone tap (owner, 2026-10-21): on the channel page, in search and on the
Shorts shelf. A Short without one fails the render; a frame from the middle of the video is never
the cover. Three layouts, by format:

- **`versus`** (`rich_vs_poor`): a red and a green half, `POOR` and `RICH`. `who` (the poor move,
  e.g. rohan with `prop: "phone"`, worried) and `who2` (the rich one, sharma, proud); `small` the
  poor side's figure with `tag` above it ("Phone EMI"); `figure` the rich side's with `to` above it
  ("Invested"); `words` the topic ("Your {rich_amount} *raise*").
- **`secret`** (`secret_of_rich`, `how_they_make_money`): dark and gold, the rich mentor smirking.
  `figure` the cost everyone else pays, crossed out, with `tag` ("Tax if you sell"); `small` what
  the rich keep, with `to` ("Stock keeps growing"); `words` the claim ("Billionaires *never* sell").
- **`story`** (`trap_alert`, `cost_of_habit`, `salary_breakdown`, `guess_the_number`): the small
  amount on the thing (`hero`, `small`, `tag`) turning into the big one on a receipt (`figure`, `to`).

`words`: four at most, the topic in the viewer's words; one word between asterisks is highlighted
yellow. Figures are placeholders, like everywhere else. Example covers: `videos/v-20261021-04`,
`videos/v-20261021-05`.

## Story recipes: the formats people watch (owner reset, 2026-10-21)

The plan's `story` is a format from `improvement/research/formats.json` (hook, beats, reference
videos). Tell it as a **skit**: the cast talk to each other, react, and the numbers land on things
in a place. Most lines belong to characters (`speaker`), the narrator only links.

| format (`story`) | beats |
|---|---|
| **rich_vs_poor** | `stage`, two actors, the same moment (Rohan the poor move, Sharma or Priya the rich move), the hook line is the conflict → the poor move and its cost (`prop`/`bill` in a place, figure computed) → the rich move and what it becomes (`prop`/`road`) → the gap after N years (`fork`) → punchline line that loops to the hook |
| **secret_of_rich** | `stage`: the rich mentor (Sharma) says the secret in one line, Rohan: "Wait, what?" → the normal way and its cost (`bill` or `prop`) → the rich way step by step (`kinetic` box over an office or city world, or `equation`), figures computed → the catch (who it works for) → loop line |
| **trap_alert** | the shock number in a place (`bill` is ideal) → how the trap looks friendly (`prop` `tag` or `receipt`, a salesman character smiling) → what it really takes (`road` for years, `prop` `bucket`) → who it's built for → the one move that beats it (`fork`) → loop line |
| **how_they_make_money** | the everyday thing in its world (`prop` in `shop`, `street` with a bank, `city`) → what you pay → where their money really comes from, computed (`equation`, `screen` with `pen`) → the surprise, a character's outrage → loop line |
| **salary_breakdown** | the salary on a `bill` phone screen → each cost subtracted (`bill` lines, or a `kinetic` box per cost over the city) → what's left (`reveal`, once) → what the left-over becomes invested (`road`) → loop line "and that's ₹X a month" |
| **which_one_are_you** | "There are 5 money levels" → one short beat per level, a character acting it, one computed figure each (`stage` with `chip`, `prop`) → where most people are stuck → the one move up → "which one are you?" |
| **guess_the_number** | the question with stakes (a `stage` with three characters guessing) → the working, step by step (`equation`, `kinetic`) → the answer lands in the last seconds (`reveal`) → loop |
| **cost_of_habit** | the habit in its place (`prop` in a `kitchen`/`shop`) → per day → per year → invested instead for N years (`road`) → the small change (`fork`) → loop |

Any of these may use one `reveal`/`bignumber` at most. Example: `examples/short_story.json`.
