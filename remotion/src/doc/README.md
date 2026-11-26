# The documentary editor (`remotion/src/doc/`)

For the business documentaries channel (`business-documentaries-rise-and-fall-of`, 2026-11-19). It is a hybrid
documentary made of licensed stock footage, real photos and company assets, and documents and headlines as
evidence, plus our own motion graphics. Long videos are 1920×1080 and Shorts are 1080×1920. It has no AI scenes.
Media comes from the fetcher (`generator/media/`, staged to `remotion/public/media/<slug>/`) or from the
Commons photos in `public/real/`. Every piece reads paths with `staticFile`; the renderer never uses the network.

A beat says `"scene": "doc"` and needs **no code of its own**. Python fills every `{placeholder}` in its params
and checks the params with `renderer/timeline/build.py` `doc_problems`. `DocBeat.tsx` then draws them.

## Beat format

```json
{
  "id": "doubt", "scene": "doc", "say": "Its auditors had substantial doubt it would survive.",
  "events": { "auditors": {"word": "auditors"}, "doubt": {"word": "doubt"}, "survive": {"word": "survive"} },
  "params": {
    "place": "the annual report", "things": ["annual report", "highlighter"],
    "camera": [{"sec": 0, "size": "wide"}, {"at": "doubt", "size": "close"}],
    "moments": [{"at": "doubt", "what": "the highlighter swipes the line"}, {"at": "survive", "what": "the quote types on"}],
    "punch": "survive",
    "fig": {"debt": "{debt_total}"},
    "layers": [
      {"kind": "document", "src": "media/<slug>/enron-10k-p37.png", "box": [0.1, 0.42, 0.8, 0.03],
       "pushAt": "auditors", "markAt": "doubt", "underAt": "doubt", "quote": "…", "quoteAt": "survive",
       "source": {"form": "Form 10-K", "text": "Enron Corp.", "date": "2001-04-02"}}
    ],
    "overlays": [{"kind": "lowerThird", "name": "Arthur Andersen", "role": "Enron's auditor", "at": "auditors", "out": "survive"}]
  }
}
```

- `place`, `camera` (shot sizes) and `moments` follow the directed-beat rules, and the craft gates read them.
- Every moment key holds an **event name**, which is a spoken word in `events`: `at` and `out` (when a layer or
  overlay is on screen; a layer's own clock starts at its `at`), `pushAt`, `markAt`, `underAt`, `quoteAt`,
  `drawAt`, `countAt`, `fillAt`, `leftAt`, `rightAt`, `winAt`, `landAt`, `titleAt`, a headline's `on: [...]`, a chart
  mark's `at` and a pin's `on`.
- Each figure is a key of `params.fig`, or a `{placeholder}` written directly: a chart's `figure`, its bars'
  `figs`, a split side's `figure`, a product wall's `count` and a label's `text`. A chart's shape comes from `values`
  (`"@maths.series"` or the facts' numbers). The chart prints no axis numbers.
- Digits are allowed only in these fields:
  - `src` and `icons` paths under `media/`, `real/` or `doc-demo/`
  - `date` (ISO; shown as "Apr 2, 2001")
  - `form` ("Form 10-K")
  - numbers (`year: 1997`, `values`)

  Any other text holding a digit fails the typed-number check.
- `layers` are drawn bottom first. `enter` is `cut` (the default), `fade` or `flash`.

## Layers

| kind | piece | params |
|---|---|---|
| `footage` | `Footage` | `src`, `trim` (s), `rate`, `len` (the clip's s; holds its last frame), `aspect` (4:3 or vertical → blurred pillarbox), `move` push/pull/drift-left/drift-right/rise/fall/still, `amount`, `focus`, `grade`, `grain`, `vignette`, `letterbox`, `blur`, `dim`. Always muted. |
| `photo` | `PhotoPan` | `src`, `aspect`, `focus` [x,y], `move`, `amount`, `frame` full/polaroid/clipping/torn, `treatment` none/sepia/bw/archive, `caption`, `surface` desk/felt/dark/paper, `landAt`, `tilt`, `pos` |
| `document` | `DocumentProp` | `src` + `box` [x,y,w,h], or `lines` + `header` {form, company, title} + `hi` + `phrase`; `pushAt`, `markAt`, `underAt`, `quote`, `quoteAt`, `source` {form, text, date}, `stamp`, `tilt`, `push`, `surface` |
| `headline` | `Headline` | `items` [{outlet, date, title, deck?, style paper/web, hi?}], `on` [events], `markAt`, `plate` (false over footage) |
| `chart` | `DocChart` | `type` line/bar, `values`, `labels`, `title`, `sub`, `figure`, `figLabel`, `figs`, `icons`, `hiBar`, `tone` rise/fall/neutral, `zero`, `marks` [{i, label, at?}], `drawAt`, `drawLen`, `countAt`, `plate` (false: a dark veil over the layer under it instead of the charcoal backdrop) |
| `timeline` | `Timeline` | `marks` [{year, label, at, src?}] |
| `split` | `Split` | `left`/`right` {name, src, fit cover/contain, figure, sub, color}, `leftAt`, `rightAt`, `countAt`, `win`, `winAt` |
| `map` | `DocMap` | `fit` [countries] or `center` [lon,lat] + `scale`, `hi` [countries], `pins` [{lonlat, label, on}] |
| `chapter` | `ChapterCard` | `n`, `title`, `kicker`, `style` serif/caps/tape, `plate`, `titleAt` |
| `polaroids` | `PolaroidRow` | `items` [{src, aspect, caption, at, bw}] (each print unblurs and lifts on its `at`, the others dim), `surface`, `bw`, `dim`. Two rows in a Short. |
| `products` | `ProductStage` | `mode` stage/pallet/wall, `items` [{src (transparent PNG), aspect, label, at}], `backdrop` charcoal/paper; pallet/wall: `count` (a `params.fig` key; at most 240 units drawn, the full figure lands after), `countLabel`, `fillAt`, `fillLen` |

| `montage` | `Montage` | `items` [{src, focus, caption, at}] (at least 3, each a different picture), `mode` punch (hook: a zoom punch + flash per picture) / stack (prints thrown onto a desk) / grid (an evidence wall), `every` (frames), `grade` |
| `logo` | `LogoSticker` | a company's transparent logo PNG on an off-white die-cut plate over the layer under it (dark logos stay readable): `src`, `aspect`, `pos` [x,y], `size` (plate width share, default 0.62), `tilt`; drops in on `at`. Only to identify the company the line is about. |
| `depth` | `Depth` | 2.5D: `src` (the photo, greyed and blurred behind), `cut` (its cut-out PNG from `python -m generator.media cutout`, in front), `title` + `sub` between the layers on `titleAt`, `side`, `tone`, `bgTreatment` bw/archive/none, `particles` |

Overlays: `lowerThird` {name, role}, `source` {form?, text, date?, pos}, `label` {text, sub, tone white/red},
`chapter` (the same card over the picture under it), and the marks (`Annotate.tsx`, 2026-11-20): `arrow` {from, to, label}, `stamp` {text, pos, tone, tilt} (slams
and shakes the picture; no digits), `date` {date (ISO), sub, pos top/center}. The red ring (`CircleMark`) is
not a doc overlay: the owner dropped it on 20 Nov.

**Text over a photo** (2026-11-26, from four Shorts that failed QA three rounds running): a photo has its own faces,
signs and words. Every text layer that sits over one (`headline`, `source`, `poster` title and figure, a `depth` sub,
labels) goes on plain ground: set the photo's `focus` so its faces and lettering sit away from where the text lands,
or move the text with `pos`. A `depth` push keeps the eyes at least 15% below the top edge.

Entrances (`Transitions.tsx`): a layer's `enter` is cut, fade, flash, whip-left, whip-right, zoom, focus, shutter,
glitch, drop, iris or slide-up. Left out, the kit picks one by the layer's kind (full-frame pictures whip, zoom, focus,
glitch or flash; framed things drop, slide or open; the poster flashes) and never the same twice in a row; the
video's first layer is a plain cut. A soft light leak drifts over every doc beat.

Variety across the video (`renderer/timeline/build.py` `doc_video_problems`, owner 2026-11-20): a Short shows each
picture once (the last beat may repeat the first picture), at least 3 device kinds (a document or headline among them),
an overlay on every other beat; a long video at most twice a picture, never in neighbouring beats, 5 device kinds.

Grades (`theme.tsx` `GRADES`): `doc`, `cold`, `warm`, `night`, `bleach`, `archive`, `bw`, `none`. Each grade is a tone
curve for each channel (an SVG table, which works like a 1D LUT) followed by CSS adjustments.

## Figure objects

A spoken figure becomes an object that moves twice, never just big type (style study §2, §6). Layer kinds,
drawn by `FigureLayer.tsx` (`Figures.tsx`, `Poster.tsx`). Every figure field (`figure`, `was`, `now`, `tag`,
`from`, `to`, `figs`, an other bar's `figure`) is a key of `params.fig`; a text field may name one as `{key}`
("{drop} from peak"). `values` are numbers (bar heights, shares), never shown. `plate: false` drops the
charcoal backdrop so the object sits over the layer under it.

| kind | what it does | params |
|---|---|---|
| `count` | Over the layer under it, which dims and blurs: the figure counts up (~1.8 s), kicks on landing, an italic serif unit line settles under it. | `figure`, `unit`, `eyebrow`, `countAt`, `countLen` (frames), `tone` gold/white/red/mint, `dim`, `blur`, `pos` center/low, `plate: true` for the backdrop instead |
| `listing` | A phone-style resale listing slides up; its price flips to the new price (the old one struck through), then a red loss tag slams in at an angle. | `src` (transparent PNG), `aspect`, `title`, `platform`, `date`, `seller`, `was`, `now`, `tag`, `flipAt`, `tagAt` |
| `ticker` | A split-flap board; each digit rolls down through every digit to the new price, then label-maker tape types on under it. | `label` ("EXMP · NYSE"), `from`, `to`, `flipAt`, `tape`, `tapeAt` |
| `sink` | A bar grows to its old height, then sinks (red) and leaves a dashed ghost of where it was, the old figure faded on the ghost; a red tag lands in the gap. Grey rival bars optional. | `name`, `values` [old, new], `figs` [old, new], `tag`, `title`, `sub`, `others` [{name, value, figure}], `drawAt`, `sinkAt` |
| `donut` | A ring fills to the first share (gold), the rest follow in greys; the figure counts in the middle. | `values` (shares), `figure`, `label`, `title`, `sub`, `legend`, `fillAt`, `tone` |
| `poster` | Shorts: the one big result as a movie-poster card for ~7 s (make the beat that long). Cuts in, no count-up: date, title, a giant gold figure with a sheen, a subline in caps, over a darkened photo that keeps pushing. Every other figure in the Short lives only in the captions. | `src`, `focus`, `date`, `title`, `figure`, `sub` ("worldwide · on a {budget} budget"), `face` serif/display, `on` |

## Test reel

`Demo.tsx` defines `DocDemo` (1920×1080), `DocDemoShort` and `DocDemoClip`. `DocDemoClip` generates the placeholder night-city clip
in `public/doc-demo/`. The reel plays doc beats through the real `StoryVideo`:

Captions: a `doc`-scene Short gets 1-3-word Anton capitals, one yellow key word, no box, centred at 64% height (`fx/chunkCaptions.tsx`; preview `DocDemoShortCaptions`); keep labels out of roughly 1110-1350 px. A long doc video keeps the directed captions.

    npx remotion still src/index.ts DocDemo out.png --frame=470

## Thumbnails (`doc/thumb/`)

A long video's three thumbnails follow the channel's playbook
(`channels/business-documentaries-rise-and-fall-of/style-study/2026-11-20-thumbnails.md`). Each is the video's own
`remotion/src/videos/<id>/<Component>.tsx` (spec `"layout": "custom"`, `"component"`), rendered 1280×720 by the
`thumbnail` step (`python -m renderer.thumbs render <id>`), composed from these parts (import `../../doc/thumb`):

| Part | What it draws | Pattern |
|---|---|---|
| `DocThumb` | the frame; `guide` shows `CORNER` (bottom-right 22%×16%, the duration stamp: keep it clear) | all |
| `Plate` | `grid` off-white grid paper, `brand` a radial in the brand colour (`color`), `dark` charcoal with a vignette | all |
| `ProductHero` | a cut-out PNG as a sticker: white edge, rim light, contact shadow, tilt; `damage: {crack, dust, grey}` | P1 P2 P4 P5 |
| `CrashLine` | a thick stylised line, `crash`, `v` or `spike`: green rises, red falls (losses only), white edge, arrowhead; `crashKey()` gives the turning point to put the product on | P1 |
| `VerdictTag` | `stamp` (Annotate's rubber stamp, landed) or `block` (tilted red/white label lines, "/" breaks) | P1 P2 |
| `PriceJump` | "$45 → $400": the old figure struck through, an arrow, the new one bigger; green up, red down | P4 |
| `VersusSplit` | two brand plates, a tilted seam, a VS badge; the two cut-outs go in as children | P5 |
| `PersonCutout` | a real person's licensed cut-out, dark grade (`bleach` by default), rim light, big on one side, optional red slash | P3 |

- **Words** always go through `StackWords` (Anton, capitals ≥ 11% of the height; `shadow="light"` for dark words on
  the grid plate). `VerdictTag` and `PriceJump` size their Anton by the same floor (`capSize`).
- **Cut-outs**: `python -m generator.media cutout --channel <slug> <asset id>` makes `<id>-cut.png` (logged as a
  derived asset, credited) and prints the `aspect` and the subject `box` the hero parts take. `stage` copies it into
  `public/media/<slug>/`.
- **Figures** only from the spec: `"figure": "{loss}"` (a tag) or `"jump": {"from": "{then}", "to": "{now}",
  "labels": ["Then", "Now"], "dir": "up"}`, filled by Python (both must be the script's figures), shortened on screen
  by `shortFig` ("$185.1M" → "$185M"). A verdict that isn't the `words` goes in `"verdict"`.
- Demos: `remotion/src/videos/L-20261119-01/ThumbDead.tsx` (P1), `ThumbBrand.tsx` (P2), `ThumbPrice.tsx` (P4);
  stills in `channels/business-documentaries-rise-and-fall-of/samples/thumbs/`.
