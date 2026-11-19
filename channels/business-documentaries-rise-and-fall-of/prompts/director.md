# Director: business documentaries (doc beats)

This channel's own addition to `generator/prompts/director.md` (read together with
`python -m generator.run prompt director --channel business-documentaries-rise-and-fall-of`). Where the
two differ, **this file wins**: this channel has no cast, no flat kit and no code per beat. Its engine is
`doc` (`channel.json` `look.engine`): **every beat is `"scene": "doc"`** (a long video's last beat is the
`end` card). Lint and the render fail any other scene. A doc beat is drawn from its params alone by
`remotion/src/doc/DocBeat.tsx`; you write no `remotion/src/videos/<id>/` files for it.

Read first: `remotion/src/doc/README.md` (the beat format, every layer and overlay and its params),
`prompts/recipe.md` (the story, the document device, the picture mix, Shorts vs long),
`style-study/2026-11-19-references.md` (the build spec), `prompts/lessons.md`.

## Step 1: the beat's picture

For each beat, decide what the viewer sees while that line is spoken, then write its params:

- `place` (where the line happens: "the Houston trading floor", "the 2001 annual report"), `things`,
  `camera` (shot sizes, at least three across the video), `moments` (what changes, each `at` an event),
  and `layers` (bottom first) with their `overlays`. `doc_problems` in `renderer/timeline/build.py`
  checks all of it.
- **Every change on a spoken word.** Name the word in `events` first, then use that event name in `at`,
  `out`, `pushAt`, `markAt`, `underAt`, `quoteAt`, `drawAt`, `countAt`, `leftAt`, `rightAt`, `winAt`,
  `landAt`, `titleAt`, a headline's `on`, a chart mark's `at` or a pin's `on`. A cut is a layer's `at`
  on the noun spoken.
- **Cut every 2–5 s**: about every 2.2 s in the cold open or the Short's hook, 3–5 s after. Something
  moves between cuts (a footage push, a Ken Burns pan, an overlay landing); the picture never holds still
  longer than `motion.maxGapSec` (3 s). A beat longer than one picture gets several layers that cut in on
  its words.
- **Every listed word is a picture**: a line that names things in a row shows each on its word
  (`generator/story.py` `list_problems` reads doc beats too).

### The picture mix (count by screen time across a long video; Shorts lean on footage and the poster)

| Layer kinds | Target |
|---|---|
| `footage` (Pexels, Pixabay, Commons video, Prelinger, NASA) | 35–45% |
| `photo` (Commons, Library of Congress, public domain; grade `archive`, `bw` or `sepia`) | 15–20% |
| `document` and `headline` | 15–20% |
| `chart`, `split`, `timeline`, `map`, `chapter` (graphics) | 20–25% |

Before lint, total the seconds per kind on the estimated timing and move beats between kinds until each is in
its band. Never a person on camera, a cast or an AI scene.

### The devices

- **The document (the signature).** When a figure or a claim is spoken, the page that holds it is on
  screen: a `document` layer with the filing page as `src` (from `edgar`) and the line's `box`, or
  typeset `lines` with `header`, `hi` and `phrase`. `pushAt` pushes 3–5% to the line, `markAt` swipes
  the yellow highlighter across **the exact sentence on its word**, `quote`/`quoteAt` types the sourced
  sentence, `source` {form, text, date} names it. News is a `headline` layer (our typeset card with the
  real sourced sentence and outlet), never a screenshot.
- **Figures as objects.** A spoken figure moves: a chart's count-up (`figure`, `countAt`), a bar sinking
  (`tone: "fall"`, red only for losses), a split's two sides counting (`countAt`, `win`), a label's red
  tag. Every figure is a `{placeholder}` from the script's `maths` or `facts`, through `params.fig` or a
  figure field; never a digit typed into any other text (the number check fails it). A chart's shape is
  `values` (`"@maths.series"` or the facts' numbers).
- **Chapter cards** (long videos, 5–9 chapters): a `chapter` layer (`n`, `title`, `kicker`, `titleAt`)
  for 4–5 s on a slowly pushing still or footage, the music dropping under it, a `thud` sfx. A chapter
  overlay can sit over the picture instead.
- **A name spoken → its photo arrives**: a `photo` layer with `frame: "polaroid"`, `treatment: "bw"`,
  `landAt` on the name, plus a `lowerThird` {name, role}. Real people only from Commons, LoC or public
  domain; never their words in the narrator's voice.
- **Places and dates**: `map` with `pins` on the words, `timeline` marks on the years, a `label` overlay
  for the place, a `source` overlay ("FILING", "REPORT" + outlet) whenever a fact is on screen.
- **One grade over every source** (`grade`: `doc` by default, `archive` for old photos, `night` or
  `cold` for the fall); old 4:3 or vertical sources use `aspect` (blurred pillarbox).

### What never goes on screen

- **No identifiable stock person on a negative beat** (a fall, a layoff, a fraud, a loss): use hands,
  backs, crowds out of focus, empty rooms, buildings, products or documents. A real, named person from
  the record is shown only as that person, from a licensed photo.
- **No logos except to identify** the company the line is about (a store sign, a product, a filing
  header); never as decoration or implied endorsement.
- No screenshot of another channel, a news site or a social post; no AI imagery.

## Step 2: find, fetch and log the media

All media come through the licensed fetcher; nothing is downloaded any other way.

    python -m generator.media search --channel business-documentaries-rise-and-fall-of --kind video "trading floor"
    python -m generator.media search --channel business-documentaries-rise-and-fall-of --source commons --kind photo "Enron Complex Houston"
    python -m generator.media search --channel business-documentaries-rise-and-fall-of --source archive "supermarket"
    python -m generator.media search --channel business-documentaries-rise-and-fall-of --source loc --kind photo "general store"
    python -m generator.media search --channel business-documentaries-rise-and-fall-of --source nasa "launch"
    python -m generator.media fetch  --channel business-documentaries-rise-and-fall-of <source>:<kind>:<id>
    python -m generator.media edgar  --channel business-documentaries-rise-and-fall-of --cik <ticker> --form 10-K --year <yyyy> --find "<the sentence>"

- Keyless sources: `commons` (photos and video; `--category` narrows to a Commons category), `archive`
  (Prelinger public-domain film; always muted), `loc`, `nasa`, `edgar` (filings rendered to a page
  image). `pexels` and `pixabay` are searched when `PEXELS_API_KEY` / `PIXABAY_API_KEY` are set; without
  them the keyless sources must carry the footage.
- Take only `OK` verdicts. A `REVIEW` verdict needs the owner's `ownerOk` on the asset; pick another.
- Name each fetched asset in its layer as `"src": "media/business-documentaries-rise-and-fall-of/<asset id>.<ext>"`
  (the id `fetch` prints; the extension of its file; a `media:<id>` string in a shown field fails the
  number check, so always the path). The render runs the
  licence check, fails on any asset that isn't logged in `media/licences.json` or that the channel may
  not use, stages the files into `remotion/public/media/<slug>/`, and ship adds every credit line to the
  description. `python -m generator.media check --channel business-documentaries-rise-and-fall-of <id>`
  runs the same check early.
- Every story gets its own pictures: no clip or photo from the last videos unless the story is the same
  subject.

## Then

Run `python -m generator.run lint <id> --channel business-documentaries-rise-and-fall-of` and fix until it
prints `ok` (it runs `doc_problems`, the engine check and the licence check without staging), then the
stills and the render as the routine says.
