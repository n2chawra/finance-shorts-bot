# The disasters 2D/doc kit (`remotion/src/disaster/`)

For Disaster Desk (`channels/disasters-and-engineering-failures-expla/`, 2026-11-20; build spec
`style-study/2026-11-20-references.md` §2, §3, §8, §9). The 3D pieces are in `../three/disaster/`.
Every piece takes `look` (or reads the video's look from `DisasterLookProvider`), is a pure function of
the frame `t`, and takes times (`at`, `breakAt`, `drawAt`…) as frames on the same clock (a beat passes
its spoken words' frames). Figures come only from numeric props, formatted here; never type one.

## The look (`looks.ts`, `Texture.tsx`)

One recipe per video: `style.recipe` in the plan, one of channel.json `look.rotation.recipes`, never one of
the last `avoidLast` (`generator/looks.py` `recipe_problems`, run by check-plan). Wrap the video in
`<DisasterLookProvider value={recipe}>`; pieces call `useDisasterLook()`.

| token | what |
|---|---|
| `bg`, `ink`, `line`, `accent`, `label`, `muted`, `panel` | palette; `fail` is always a red (the failure only), `ok` the normal state |
| `fluid`, `solid`, `solidShade` | water/air and structure fills in cross-sections |
| `textures` | overlays `<Texture t>` draws over the frame: grid, dust, paper, chalk, grain, scanline, halftone, rain, haze, hatch (seeded, no files) |
| `stroke`, `wobble` | outline weight; a hand wobble on drawn lines (chalk, desk) |
| `fonts` | `mono` Courier Prime (labels), `value` Anton (readouts), `title` Playfair Display, `body` Poppins |
| `camera` | the recipe's camera language (a hint for the director and the 3D rig) |
| `mix` | kit shares in % (3D / flat / doc / cards) |
| `three`, `grade`, `surface` | the matching 3D look (`three/disaster/look.tsx`), doc grade and page surface |

Recipes: night-grid, blueprint, clay-studio, chalk-site, investigators-desk, instrument-panel, storm-weather,
archive-rebuild, satellite-atlas, cross-section. `LookBackground` paints the look's backdrop.

## Pieces

SVG `<g>` (inside a flat `Stage`/`View` or any `<svg>`, parent coordinates):

| piece | props |
|---|---|
| `ForceDiagram` | `x, y, size, value` 0..1, `forces` [{label, angle [a0,a1] (0 up), len [l0,l1], tone, dashed, at}], `body` wing/box/none, `bank` [b0,b1], `title` |
| `CauseChain` | `x, y, w, links` [{label, at}], `broken` (index), `breakAt`, `vertical`, `size` |
| `Callout` | `point`, `label` (both [x,y]), `text`, `sub`, `tone`, `at`, `outAt`: the leader draws, then the mono label types on |
| `Elevation` | box `x, y, w, h`, `kind` bridge/dam/hull/building, `axis` {max, unit, ticks, label}, `level` 0..1 + `levelLabel`, `dims` [{from, to (box shares), label, at}], `stress` 0..1 (grey → amber → red), `fail` 0..1 (girder hinges, dam cracks, hull lists, column buckles), `failPart`, `drawAt` |
| `AltimeterTape` | `value, step, unit, floor` (red below) |
| `SpeedDial` | `value, max, unit, redFrom, ticks` |
| `LoadGauge` | `value, limit, unit, limitLabel` |
| `ListAngle` | `deg, limit` |
| `WaterLevel` | `value, max, unit, danger` |
| `MissionClock` | `seconds` (time of day), `flag` paused/speed, `rate` |
| `Arrow`, `MonoLabel` | building blocks |

HTML over the frame:

| piece | props |
|---|---|
| `HonestyTag` | `tag`: reconstruction / reported / principle / paused / speed (channel.json `honestyTags`) or own text; top-left mono, fine print |
| `ReportPage` | doc `DocumentProp` props (`lines`/`hi`/`phrase` or `src`/`box`, `focusAt`, `hiAt`, `underAt`) + `agency`, `report`, `page`, `date` (ISO), `kind` |
| `CauseBoard` | `title`, `causes` [{label, detail, at, verdict cause/factor/ruled out}]: each stamped on its word |

## Test reel

`DisasterKitDemo` (Root, 10 s, 1920×1080): every piece in night-grid, cross-section and chalk-site.
`npx remotion still src/index.ts DisasterKitDemo out.png --frame=60` (sheets at 60/160/260, cards at 98/198).
