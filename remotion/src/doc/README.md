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
  `drawAt`, `countAt`, `leftAt`, `rightAt`, `winAt`, `landAt`, `titleAt`, a headline's `on: [...]`, a chart
  mark's `at` and a pin's `on`.
- Each figure is a key of `params.fig`, or a `{placeholder}` written directly: a chart's `figure`, its bars'
  `figs`, a split side's `figure` and a label's `text`. A chart's shape comes from `values`
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
| `chart` | `DocChart` | `type` line/bar, `values`, `labels`, `title`, `sub`, `figure`, `figLabel`, `figs`, `icons`, `hiBar`, `tone` rise/fall/neutral, `zero`, `marks` [{i, label, at?}], `drawAt`, `drawLen`, `countAt` |
| `timeline` | `Timeline` | `marks` [{year, label, at, src?}] |
| `split` | `Split` | `left`/`right` {name, src, fit cover/contain, figure, sub, color}, `leftAt`, `rightAt`, `countAt`, `win`, `winAt` |
| `map` | `DocMap` | `fit` [countries] or `center` [lon,lat] + `scale`, `hi` [countries], `pins` [{lonlat, label, on}] |
| `chapter` | `ChapterCard` | `n`, `title`, `kicker`, `style` serif/caps/tape, `plate`, `titleAt` |

Overlays: `lowerThird` {name, role}, `source` {form?, text, date?, pos}, `label` {text, sub, tone white/red} and
`chapter` (the same card over the picture under it).

Grades (`theme.tsx` `GRADES`): `doc`, `cold`, `warm`, `night`, `bleach`, `archive`, `bw`, `none`. Each grade is a tone
curve for each channel (an SVG table, which works like a 1D LUT) followed by CSS adjustments.

## Test reel

`Demo.tsx` defines `DocDemo` (1920×1080), `DocDemoShort` and `DocDemoClip`. `DocDemoClip` generates the placeholder night-city clip
in `public/doc-demo/`. The reel plays doc beats through the real `StoryVideo`:

    npx remotion still src/index.ts DocDemo out.png --frame=470
