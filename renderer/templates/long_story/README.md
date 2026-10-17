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
| `narrator` | optional Kokoro voice for the narrator |
| `style` | optional `{palette, genre, key, bpm}` (resolved from the seed otherwise) |
| `maths` | named calculations, `[{name, kind, ...inputs}]`; see below |
| `thumbnail` | `{who, pose, expression, prop?, figure: "{placeholder}", words: ≤4 words, sub?}` |
| `beats` | the video, in order |

**Numbers.** Text never contains a digit or `₹`. Every figure comes from a placeholder
`{<maths name>_<key>}` (shown as `₹1.7 L`, spoken as words), and a param may pull a raw value or a
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

## Cast and acting

`rohan` (first job, eager), `priya` (sharp friend, explains), `sharma` (retired banker, dry), and
`sikka` (the coin mascot, cheers; appears through `stage.sikka`). They are story characters, never
an advisor: the narrator explains, nobody tells the viewer what to buy.

An actor: `{who, x: 0..1, scale?, enter?: left|right, exit?: left|right, turn?: -1..1, acting: [...]}`.
Each acting key `{sec | at: event, pose?, expression?, turn?, prop?}` blends in with a springy settle.

- poses: stand, wave, point, pointUp, think, shrug, celebrate, facepalm, hips, phone, present,
  thumbsUp, worried
- expressions: neutral, happy, laugh, shock, sad, worried, angry, thinking, proud, confused, smirk
- props (in the left hand): phone, letter, card

## Scenes

| scene | shows | params |
|---|---|---|
| `stage` | the cast acting on a set | `set` (home, store), `actors` [actor], `chip` {text, at}, `sikka` {x, at, expression, cheer, drop} |
| `chapter` | chapter card with progress segments | `kicker`, `title` |
| `bignumber` | kinetic lines of text and figures, optional actor on the right | `lines` [{text, style: hero/sub/danger/good/kicker, at, value?}], `actor` |
| `reveal` | the big hit: shake, burst, lines, actor peeking from below | as `bignumber` |
| `statement` | a card statement, total vs minimum due, a finger picks one | `total`, `min`, `totalAt`, `minAt`, `pick` (min/total), `pickAt` |
| `monster` | the interest monster eating coins | `label`, `labelAt`, `name` |
| `snowball` | a snowball rolling and growing downhill | `label`, `tick` |
| `calendar` | a calendar flipping months | `pages`?, `loops` (number or `@x.years`), `label`, `labelAt`, `sub`, `subAt` |
| `split` | two figures side by side, counting up | `left`/`right` {label, text, value, at} |
| `chart` | lines drawing themselves, with marks | `series`, `series2`, `ticks`, `xticks`, `xLabel`, `label1`, `label2`, `marks` [{x, text, at}], `drawFrom`, `drawTo` |
| `towers` | bars rising to compare | `title`, `items` [{label, text, value, at, color: danger/good}] |
| `checklist` | steps ticking off, active one highlighted | `title`, `items` [{text, icon: autopay/emi/debit/check}], `active`, `actor` |
| `end` | the CTA, the cast, the assumption and the disclaimer | `cta`, `follow`, `assumption` |

A figure with `value` counts up and lands exactly on Python's string. Every video ends with an
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

- Hook in the first 30 s with rupee stakes; chapters from the start; an escalation around 1:30
  and 3:00; a new visual idea every 3–6 s.
- On screen: keywords and figures only, never the narration word for word.
- Mix scenes: cast moments between data scenes, so the story stays about people.
- Checked on every render: a picture that keeps moving (`render.json` liveliness: median frame
  change ≥ 1.2, under 15% still samples, no 4-second stretch with nothing moving).
