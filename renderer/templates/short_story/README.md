# short_story — Shorts on Remotion

A vertical Short (1080×1920; its length is the setting `lengthMinSec`–`lengthMaxSec`, 35–50 s since 2026-10-29) told in beats by the recurring cast, drawn by Remotion.
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
- **Pace** (owner, 2026-10-30: "too fast, I need to watch it twice", then "a little faster"): tempo 1.2,
  about **175 spoken words a minute**, voice and animation together. The length is the setting (`lengthMinSec`–
  `lengthMaxSec` in `config/settings.json`, 20–35 s since 2026-11-04, the length of every 1K-view Short): **60–100 words in 6–8 beats**
  of 3–5 s, following "The story spine" below. One question, one surprise, one punchline. No `chapter` beats.
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

## The board: rooms and cards (owner, 2026-11-02; a test variant for Shorts since 2026-11-04, used when the plan's `arms.style` is `board`; long videos keep it)

After a frame-by-frame study of The Curious Plot (their "$0 salary" Short 43K, "egg selling" 1.3M;
ours on the same topic 151) and four demos the owner reviewed (`v-remake-salary`): the question is
asked in a **room**, every answer is a **card**, a new picture every sentence, every clause animated,
and the whole story readable with the sound off. `scene: "board"`, `remotion/src/studio/board.tsx`.

- **Room** (`cast` given): both characters stand low, the picture floats big above them. For the
  asker's questions and reactions.
- **Card** (no `cast`): one flat colour (`bg`: sand, sky, mint, plum, night, coral, cream, slate, blue,
  purple, teal, gold; a different one each card), the picture fills the middle. For every answer.
- **One sentence per beat** (6.5 s of speech at most), a **new picture every beat**, every board beat
  opens with its `header` (the point, readable on mute) and its picture in place at `sec: 0`.
- **A card is a labelled diagram, not one icon**: 3+ changes and 2+ pieces of text (rows, chips,
  labels, callouts, a term). A thing comes back in at most 4 beats, drawn differently (`state`).
- Clause coverage: 90%+ of spoken clauses get their own change within 0.8 s (`renderer/craft.py`).

```json
{"id": "salary", "scene": "board", "role": "promise", "speaker": "rohan", "transition": "slide",
 "say": "His salary is {fact1}. A year.", "events": {"his": {"word": "His"}, "salary": {"word": "salary"}, "year": {"word": "year"}},
 "params": {"header": "His salary", "sub": "Meta's founder", "bg": "coral", "items": [],
            "actions": [{"sec": 0, "do": "doc", "title": "Pay slip", "rows": [{"label": "Pay to", "value": "Mark Zuckerberg"},
                                                                            {"label": "Amount", "value": "{fact1}", "at": "salary"}],
                         "stamp": {"text": "One dollar", "at": "salary"}},
                        {"at": "year", "do": "calendar", "steps": ["January", "April", "August", "December"], "flipAt": "year", "label": "Pay for the year"},
                        {"at": "year", "do": "chip", "text": "Per year"}]}}
```

params: `header`, `sub?`, `bg`, `stage?` (a room's world: flat, street, city, field, kitchen, office,
night, desert, studio, space), `cast?` ([{who, spot, acting}]), `items` (the video's own props:
{id, prop, x?, y?, size?, label?, tag?, state?, hidden?}; a thing without `x` is placed by count, in
a room it floats above the cast), `actions` (each on a spoken word: `at` an event, or `sec`).

| verb | what it does | params |
|---|---|---|
| `header` | rewrites the line at the top | `text`, `sub?` |
| `doc` | a document whose rows fill in on their words; a value can be struck and replaced | `title`, `rows: [{label, value, at?, strike?: {to, at}}]`, `stamp?: {text, at}`, `tone?` |
| `equation` | a sum written term by term, the result counts up | `terms: [{text, at?}]`, `result: {text, value?, at?}` |
| `term` | a named money word with one line | `name`, `line?`, `kicker?` |
| `chip` | a small label joining the picture | `text`, `tone?` (good, bad, accent, blue) |
| `bars` | bars growing side by side, can turn red | `items: [{label, text, value, at?, tone?, turn?}]`, `title?` |
| `ring` | a donut filling to a share, a pointer chip on its slice | `value` (percent, `@ref`), `text`, `label?`, `callout?` |
| `grid` | N units (up to 400), a share marked or locked | `n`, `share?`, `lock?`, `prop?`, `text?`, `label?`, `cols?`, `markAt?` |
| `calendar` | a page turning, or ticking through steps | `from`/`to` or `steps: [...]`, `label?`, `flipAt?` |
| `buttons` / `click` | buttons appearing one per word; a hand cursor presses one | `items: [{text, at?, prop?}]` / `index` |
| `person` | an ID card | `name`, `kicker?`, `figure?`, `value?`, `prop?` |
| `clear` | the panels go, the stage comes back | |
| `enter` | a thing arrives: flies in, grows out of `from`, `how: "rise"` (out of the ground), `how: "drop"` | `target`, `from?`, `how?` |
| `swap` / `move` / `try` | turns into another prop / goes to a thing or place / heads for a thing and bounces back | `into` / `to` / `to` |
| `flow` | money flies from one thing to another | `target`, `to`, `n?`, `text?` |
| `stamp` / `cross` / `tick` / `strike` | marks on a thing | `text` / – / – / `text?` (the new tag) |
| `arrow` / `bubble` / `step` | an arrow with a label / a speech bubble / an actor steps forward | `to`, `text?` / `text` / `target: who` |
| `grow`, `shrink`, `state`, `tag`, `label`, `count`, `multiply`, `glow`, `shake` | as in the build scene | |

Panels (`doc`, `bars`, `ring`, `grid`, `calendar`, `buttons`, `person`) build up into one picture,
three at most, stacked in the middle; chips line up under them; `clear` (or `"replace": true` on a
panel) starts over. While panels show, the stage's things step aside; the thing just acted on stays
sharp and the rest dim. Sourced facts print their source on the board ("Data: ProPublica · Jun 2021"), once, on the first
board beat that says one. A thing nothing acts on until 0.6 s into the beat enters just before its
first action (owner, 2026-11-03: "make them appear and animate"), so its first action goes on its word.

**The look** (`style.look` in the plan; `generator/looks.py`, rotated by `check-plan`): `stage`, `header`
(ribbon, sticky, neon, strip, chalk), `holder` for sums (box, receipt, phone, blackboard, sign),
`entrance` (pop, drop, slide, draw, stamp). The same combination never within 10 videos.

**Captions on a board video**: whole sentences in a dark box low on the frame with the speaker's
name, the word being said and every figure in yellow.

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
Shorts shelf. A Short without one fails the render.

**`scene`, the default** (owner, 2026-10-24: "the thumbnails look the same with different texts"): the cover is a frame of the video itself, its custom hook near the end by default, with the channel's look on top: the big `words` over a blurred, darkened band (the scene's own money objects carry the figures; `figure` stays required by the contract). Every video has its own hook and sets, so every cover is a different picture. `at` picks another beat (its id) and `sec` the second into it (story clock): choose the frame that tells the story at a glance, the cast big, a money object in view, nothing mid-transition. The fixed layouts below are for when no frame can carry the cover; never the same layout two videos in a row. The render fails a cover that looks like one of the last six of its format (`renderer/craft.py` `cover_problems`).

`{"layout": "scene", "at": "hook", "words": "Billionaires *never* sell", "figure": "{tax_total}", "tag": "Tax if you sell", "angle": "number", "who": "sharma"}`
(`who` stays required by the contract; the scene draws the cast itself). The other layouts, by format:

- **`versus`** (`rich_vs_poor`): a red and a green half, `POOR` and `RICH`. `who` (the poor move,
  e.g. rohan with `prop: "phone"`, worried) and `who2` (the rich one, sharma, proud); `small` the
  poor side's figure with `tag` above it ("Phone EMI"); `figure` the rich side's with `to` above it
  ("Invested"); `words` the topic ("Your {rich_amount} *raise*").
- **`secret`** (`secret_of_rich`, `how_they_make_money`, `billionaire_question`): dark and gold, the rich mentor smirking.
  `figure` the cost everyone else pays, crossed out, with `tag` ("Tax if you sell"); `small` what
  the rich keep, with `to` ("Stock keeps growing"); `words` the claim ("Billionaires *never* sell").
- **`story`** (`trap_alert`, `cost_of_habit`, `salary_breakdown`, `guess_the_number`, `money_scale`): the small
  amount on the thing (`hero`, `small`, `tag`) turning into the big one on a receipt (`figure`, `to`).

`words`: four at most, the topic in the viewer's words; one word between asterisks is highlighted
yellow. Figures are placeholders, like everywhere else. Example covers: `videos/v-20261021-04`,
`videos/v-20261021-05`.

## The story spine: depth without losing the hook (owner, 2026-10-26; shapes 2026-10-30)

Viewers left right after the hook (2026-10-26); then every Short got "four levels" and it read as
a template (2026-10-30). Every Short now names its **shape** (`plan.shape`, copied to `script.shape`):
how its beats are arranged, from the library in `improvement/research/shapes.json` (`python -m
generator.run state` lists it, least used first), or a new one the topic needs (`{id, name, beats,
why}` in the plan: it joins the library when the video ships). Pick the shape the topic asks for:
a hidden answer is a `reveal`, two people one choice a `versus`, a ladder people climb `levels`.
Every shape keeps one spine (`generator/story.py` checks it):

1. **Hook** (`role: hook`, 4.5 s or less): **a curiosity gap**: the belief put to the viewer and
   denied (owner, 2026-10-31 and 2026-11-09). Never give the answer here: it is the payoff.
   - Good: "You think McDonald's makes its money selling burgers? It doesn't." / "You think
     billionaires live on their salary? Not one of them."
   - Bad: "Delta makes its money flying you? Watch this." (the belief, never denied, and a stock tag) /
     "The casino never gambles. It wins a slice of every bet." (the answer, so nothing to stay for)
   `generator/story.py` `hook_problems` fails a hook without the denial, with a stock tag after it
   ("Watch this.", "Here's why."), or ending like one of the last 6 Shorts' hooks.
2. **Promise** by 6 s (`role: promise`): what the viewer will get ("three clues, and the last one
   is the one they never tell you").
3. **A figure on screen** by 9 s.
4. **Rising stakes** (`role: build`, 3 beats or more; `role: level` in the levels shape): each beat
   a bigger piece of the answer, the picture changing on the words.
5. **The turn** (`role: turn`, 50–85% in): the piece nobody expects. A custom beat.
6. **The payoff** (`role: payoff`): answers the hook's question in one clear line. A custom beat.
7. **Loop** (`role: loop`): the last line leads back into the first.

**Levels only in the levels shape.** `structure.levels` (the level chips along the bottom), the
climbing counter and the word "level" belong to `levels`, which may be at most 1 in 3 videos.
Other shapes show their figures on things in the scene, and may still use `params.hud.counter`.

**Explain like a teacher** (owner, 2026-10-30: "characters speak one-liners; they should explain").
One voice carries the video, the narrator or one cast member as the teacher, saying 60% or more
of the words in full, connected sentences ("because… so… which means…"), 10–13 words a beat on
average. The others act it out and react in a short line. The speaker changes 5 times at most.

**The things take the centre, not the characters** (owner, 2026-10-30: "when the script explains
something shown in animation, the animation should be the centre of impression"). The cast are near-still
rigs: when the narrator explains, frame the thing being explained (`on`: an item or `all`), and
leave the characters out or let them stand small at the side (anyone not speaking is drawn smaller
by default). Characters are big when they speak or react, in the hook and in the turn.
`number-check` fails a narrator beat whose camera frames a person.

**Every spoken number moves.** While a figure is said, the thing carrying it (a tag, a label, a count)
pulses and glows, and a figure no thing carries pops on screen by itself (`studio/figures.ts`). Put
each figure on the thing it belongs to, so the number lands on the picture.

**Directed motion** (owner, 2026-11-02: "it's a way of presentation … it lacks wow factor"; calm,
one-move-per-beat camera until then). The build scene's camera follows the action by itself: it
pushes in on each thing as its action fires (holding a framing at least 1.2 s, moving in 1 s), so
write camera keys only for a deliberate wide reveal. One hero thing per moment, big (`size`
0.24–0.34), at most three on screen; every build beat transforms something (`swap`, `grow`,
`flow`, `multiply`, `break`, `drain`), money travels between things on `flow`. Travel between
beats with `match`, `whip` or `zoom-through` (four loud ones at most), a cut before a punchline.
`shake` (a hop) and `glow` stay accents.

Never: "Wait, what?", "Wait. So my…", "Same X. Same Y.", "didn't lift a finger", "for doing
nothing", or a line opening from the last 10 scripts. The picture follows every phrase: build
beats with the story's own props (`renderer/templates/SHOTS.md`, "The build scene").
Reference: `videos/v-remake-casino/script.json` (a `reveal`).

## Story recipes: the formats people watch (owner reset, 2026-10-21)

The plan's `story` is a format from `improvement/research/formats.json` (hook, beats, reference
videos). About two in three videos are **global** (`topic.reach`, `generator/reach.py`): dollars, famous
names and situations anyone in the world knows, no country's products or festivals. **At least 2
of every 3 Shorts are big money** (formats with `tier: core`: billionaire questions, money at
scale, how famous businesses make money, secrets of the rich told through real billionaires);
`state` says when the next one must be (`core_needed`). Formats with `tier: low` (salary
breakdowns, habit costs, "$X becomes $Y") rank last; tell them through big money or famous names.
The cast act the story out in a place and the numbers land on things, while one voice explains
it (above).

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
| **billionaire_question** (global) | the question everyone has asked, over the rich world (`shot` in `penthouse`, the cast big): "Why can't a billionaire just ___?" → the obvious answer, Rohan says it → where the money really is (`stack` of shares, not cash, figure computed) → what happens if they tried (the stack shrinks, a `flow` to the tax bill, computed) → the real answer in one line (`close` on Sharma) → loop line to the question |
| **money_scale** (global) | one note as a thing, then the camera pulls back as it multiplies (`shot` with `stack`s in `vault`, `wide` → `extreme`), each step ten or a thousand times bigger and each figure computed → what each step buys or how long a salary takes to earn it → the punchline comparison (seconds for a billionaire, a lifetime for a salary) → loop line |

Any of these may use one `reveal`/`bignumber` at most. Example: `examples/short_story.json`.
