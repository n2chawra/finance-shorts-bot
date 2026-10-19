# long_story — long-form videos on Remotion

A long video (4–6 min, 1920×1080) told as a story by the recurring cast, drawn by Remotion from a
timeline Python builds. Example: [`examples/long_story.json`](../../../examples/long_story.json).

```
script.json ──python -m renderer.timeline.build──▶ timeline.json + audio.wav
            ──python -m renderer.remotion────────▶ video.mp4, thumbnail.png, preview.png, render.json
```

Python owns every number, every moment and every sound. Remotion only draws.

## The script

| field | |
|---|---|
| `format` | `"long"` |
| `seed` | integer; picks narrator and music when not pinned |
| `narrator` | optional Kokoro voice for the narrator; render replaces a missing one, or the previous video's, with the voice used longest ago |
| `style` | optional `{palette, genre, key, bpm}` (resolved from the seed otherwise) |
| `currency` | `USD`, `GBP`, `EUR` or `INR`, from the plan: how every figure is shown and spoken (rupees use lakh and crore, the others K/M/B) |
| `maths` | named calculations, `[{name, kind, ...inputs}]`; see below |
| `thumbnail` | `{who, pose, expression, figure: "{placeholder}", words: ≤4 words, angle, layout: "story", hero, tag?, small?, to?}`. **Use `layout: "story"`** (owner, 2026-10-19): one picture that says the topic, an object (`hero`: card, phone, house, car, cash, piggy) with the small amount stuck on it (`tag` words + `small`, a placeholder), an arrow to a receipt with `to` ("You pay") and the `figure`, the cast member reacting; `words` **name the topic** ("Paying the minimum?", not "17 years?!") |
| `thumbnails` | two more thumbnails for YouTube's Test & Compare, same fields, each with a different `angle`: `number`, `question`, `reaction`, `versus` or `warning` (rendered as `thumbnail-b.png`, `thumbnail-c.png`) |
| `beats` | the video, in order |

**Numbers.** Text never contains a digit or a currency sign (`$`, `£`, `€`, `₹`). Every figure comes
from a placeholder `{<maths name>_<key>}` (shown as `$1.2M` or `₹1.7 L` in the script's currency,
spoken as words), and a param may pull a raw value or a
chart series with `"@<maths name>.<key>"`. The builder rejects anything else.

| kind | inputs | figures (placeholder keys) | series |
|---|---|---|---|
| `card_min_due` | amount, rate_pct_month, min_due_pct, min_due_floor | amount, min_due, rate_month, rate_year, rate_effective, min_due_pct, months, years, total_paid, interest, ratio, paid_year1, owed_year1, interest_year1 | balance, paid, ticks, years |
| `emi` | amount, rate_pct, years | amount, rate, months, emi, total_paid, interest | — |
| `sip` | monthly, rate_pct, years | amount, rate, years, final, final_long, invested, gains, ratio | value |
| `lumpsum` | amount, rate_pct, years | amount, rate, years, final, final_long, gains, ratio | value |

## A beat

```json
{ "id": "year-result", "scene": "split", "speaker": "narrator", "transition": "slide", "camera": "drift",
  "say": "By now, he has paid {card_paid_year1}. And he still owes {card_owed_year1}.",
  "events": { "paid": { "word": "paid" }, "owed": { "word": "owes" } },
  "sfx": [ { "kind": "pop", "at": "paid" }, { "kind": "boom", "at": "owed", "gain": 0.7 } ],
  "params": { ... the scene's params ... } }
```

- A beat lasts as long as its line (0.35 s lead, 0.5 s tail; `min_sec` to hold longer). A beat
  with no `say` (a chapter card) lasts 2.4 s.
- `speaker`: `narrator` or a cast member (`rohan`, `priya`, `sharma`, `sikka`), who then speaks in
  their own voice and lip-syncs.
- `events` name moments: `{"word": "owes"}` (when that word is spoken), `{"word": 3}` (the 4th
  word), `{"sec": 1.5}`, `{"end": 0.5}`. Every beat also has `start`, `speech` and `end`. Scene
  params and `sfx` refer to events by name, so the picture moves on the word.
- `sfx`: pop, pop-high, whoosh, clink, ding, boom, fail, tick, beep, riser, kaching.
- `camera`: drift (default), push, pull, pan-left, pan-right, rise, still, or `punch:<event>`
  (a jolt on that event). The camera never parks.
- `transition` into this beat: cut (default), fade, slide, slide-up, zoom, wipe, iris, whip.

## Marks with the pen (`pen` on `source`, `screen`, `chart`)

Hand-drawn marks that draw themselves on at a word (Casual Finance study, 2026-10-19): `circle`
(`x`, `y`, `r`), `underline` and `arrow` (`x`, `y` → `x2`, `y2`), `gap` (a double arrow from `y` to
`y2` at `x`), `tick`, `cross`, `note` (`text`: a placeholder or a few words, never a typed number).
Positions are 0..1 of the card or plot; `color` is `bad` (default), `good`, `accent` or `ink`;
`at` names the event. One or two marks a beat: they point at what is being said.

## Cast and acting

`rohan` (first job, eager), `priya` (sharp friend, explains), `sharma` (retired banker, dry), and
`sikka` (the coin mascot, cheers; appears through `stage.sikka`). They are story characters, never
an advisor: the narrator explains, nobody tells the viewer what to buy.

An actor: `{who, x: 0..1, scale?, enter?: left|right, exit?: left|right, turn?: -1..1, acting: [...]}`.
Each acting key `{sec | at: event, pose?, expression?, turn?, prop?, bubble?}` blends in with a springy settle.
`bubble` puts a speech bubble with a few words (`{text: "Total due!"}`) or a thought bubble with an
icon (`{icon: "!" | "?" | "$" | "idea"}`) beside the character's head for about 2.6 s (`seconds` to change).

- poses: stand, wave, point, pointUp, think, shrug, celebrate, facepalm, hips, phone, present,
  thumbsUp, worried, aim, aimUp (the right hand raised at the content, for the pointer)
- expressions: neutral, happy, laugh, shock, sad, worried, angry, thinking, proud, confused, smirk
- props: phone, letter, card (left hand); pointer, pointerUp (a pointer stick in the right hand: use with `aim` / `aimUp`)

## Scenes

| scene | shows | params |
|---|---|---|
| `stage` | the cast acting on a set | `set` (home, store), `actors` [actor], `chip` {text, at}, `sikka` {x, at, expression, cheer, drop} |
| `chapter` | chapter card with progress segments | `kicker`, `title` |
| `bignumber` | kinetic lines of text and figures, optional actor on the right | `lines` [{text, style: hero/sub/danger/good/kicker, at, value?}], `actor` |
| `reveal` | the big hit: shake, burst, lines, actor peeking from below | as `bignumber` |
| `statement` | a card statement, total vs minimum due, a finger picks one | `total`, `min`, `totalAt`, `minAt`, `pick` (min/total), `pickAt` |
| `monster` | **retired** (owner, 2026-10-19: childish): interest eating money is the `bill`, `road` or a `prop` bucket | `label`, `labelAt`, `name` |
| `snowball` | a snowball rolling and growing downhill | `label`, `tick` |
| `calendar` | a calendar flipping months | `pages`?, `loops` (number or `@x.years`), `label`, `labelAt`, `sub`, `subAt` |
| `split` | two figures side by side, counting up | `left`/`right` {label, text, value, at} |
| `chart` | lines drawing themselves, with marks | `series`, `series2`, `ticks`, `xticks`, `xLabel`, `label1`, `label2`, `marks` [{x, text, at}], `drawFrom`, `drawTo` |
| `towers` | **avoid** (owner, 2026-10-19: bars are basic): compare with `fork` instead | `title`, `items` [{label, text, value, at, color: danger/good}] |
| `checklist` | steps ticking off, active one highlighted | `title`, `items` [{text, icon: autopay/emi/debit/check}], `active`, `actor` |
| `end` | the CTA, the cast, the assumption and the disclaimer | `cta`, `follow`, `assumption` |
| `prop` | **a money prop carrying the figure, in a place** | `world`, `prop`, `text` (the figure), `value`?, `label`?, `kicker`?, `sub`?, `at`, `fill`? (stack 0..1), `level`? (bucket 0..1), `presenter`? |
| `screen` | **a chart drawing itself on a wall screen**, led by a dot, with callouts | `world` (office), `city`?, `title`, `series` (the bad news, red), `series2`? (the good, green), `label1`, `label2`, `callouts` [{x: 0..1, text, at}], `source`?, `drawFrom`, `drawTo`, `pen`?, `presenter`? |
| `source` | **the evidence: a drawn document card**, the spoken sentence highlighted yellow as it is read, the "Data: …" line at its foot | `publisher` (words), `title`?, `lines` [{text, highlight?, underline?, at?}] (facts as `{fact1}`; `underline` draws a red marker line under the words), `pen`?, `pattern`?/`world`?, `presenter`? |
| `equation` | **icons with operators between them** (a phone + interest, a house > one person) | `title`, `items` [{icon, text?, value?, label?, at}], `ops` ["+", "<", ">", "=", "vs", "→"], `pattern`?/`world`?, `presenter`? |
| `kinetic` | **a short phrase typed in letter by letter** (`mode: type`) or **a statement box** over a place (`mode: box`) | `mode`, `lines` [{text, at}], `world`? (box), `presenter`? |
| `bill` | **the hook: a small payment on the phone, and a bill unrolling out of it to what it really costs**, in a lit room | `who`, `screen` [{text, at}] (the phone: a label, then the small figure), `lines` [{text}] (2-3 bill lines), `total` {label, text, at}, `place`?, `time`?, `weather`? |
| `road` | **a journey through time: the camera travels down a road past signposts** | `who`, `signs` [{label, text?, at, good?}] (Year one … Year N), `title`?, `land`?, `time`?, `weather`? |
| `fork` | **two roads from one spot: a short one to a finish arch, a long one into the haze** | `who`, `short` / `long` {label, time, cost, at}, `pose`?, `land`?, `time`?, `weather`? |

**Look and motion** (owner, 2026-10-19, after "this looks like a slide show"). Every frame is a
place with something moving; numbers live on things in that place.
- **The first five seconds show the topic and the shock together**: what the video is about and
  why it hurts or pays (`bill` for a cost that grows, `source` for news, a `prop` in a place).
  Never open on a figure on a plain background.
- **No text-only slides**: `bignumber` and `reveal` at most once a long video, never two in a row,
  and never as the opening. Prefer `bill`, `road`, `fork`, `prop`, `screen` (with `pen`), `source`.
- **Something always moves**: the story scenes move on their own (lights, dust, rain, snow, leaves,
  the road rushing past); keep `camera` moving (`drift`, `punch:<event>`).
- **Set each scene for this story, not the last one**: `place` (home, kitchen, office, cafe),
  `time` (dawn, noon, sunset, night), `land` (fields, desert, snow, city, coast) and `weather`
  (clear, rain, snow, leaves) should fit the script (a late-night bill in a dark room, a long winter
  of debt on a snowy road, a beach-holiday spend on the coast). Leave one out and it is picked per
  video, so videos never look the same; don't copy the previous video's choices.

**The visual kit** (2026-10-18, after studying the top animated finance channels): put figures on
things in places, not on empty backgrounds.
- `world`: `street` (with a bank), `kitchen`, `office` (window on the city), `shop`, `city`; add
  `"night": true` for drama. `city` (office or city world): `downtown`, `newyork`, `london`, `mumbai`
  — the country the story is about. A scene without a world uses `pattern`: `grid`, `dots`, `waves`, `rays`.
- `prop`: `cheque`, `stack` (cash that grows), `tag` (price tag), `anvil` (a rate crushing a card),
  `piggy`, `bucket` (money leaking away), `vault`, `receipt`, `calendar` (pages flip to the text).
- `icon` (equation): house, person, family, car, coffee, cash, card, cart, piggy, clock, chartup,
  chartdown, gift, plane.
- `presenter`: an actor (`{who, acting}`) who stays on screen and talks while the graphic plays: in a
  Short at the bottom, waist up (**use it in most Short beats**: the face keeps viewers), in a long
  video at the side. They lip-sync when the beat's `speaker` is them.
- Two bright palettes, `sky` and `mint`, sit beside the dark ones and `paper`.
- Every frame has a paper grain and the Sikka mark in the top-left corner (no text there).

A figure with `value` counts up and lands exactly on Python's string; its `text` must show that same
number (or `value` is 0), or the build fails. Every video ends with an
`end` beat, which always shows "Illustrative only. Not financial advice."

## Pace and length

Long videos play at **tempo 1.5** (`TEMPOS` in `renderer/timeline/build.py`; the owner watched
the first sample at 1.5× and called it right). The voice speaks at 1.5× and every pause,
animation, transition and camera move runs 1.5× faster with it, like watching at that playback
speed. Write on the story clock: `min_sec` and `{"sec": …}` events are story seconds.

At this pace narration runs about **215 words a minute**. A 4–6 min video needs roughly
**850–1,300 words** across 50–75 beats (the first sample: 574 words in 34 beats, which comes out
at about 2:45 at this pace, too short to ship).

## Craft rules

- Hook in the first 30 s with money stakes; chapters from the start; an escalation around 1:30
  and 3:00; a new visual idea every 3–6 s.
- On screen: keywords and figures only, never the narration word for word.
- Mix scenes: cast moments between data scenes, so the story stays about people.
- Checked on every render: a picture that keeps moving (`render.json` liveliness: median frame
  change ≥ 1.2, under 15% still samples, no 4-second stretch with nothing moving).
