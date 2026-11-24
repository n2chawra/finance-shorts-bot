# The flat kit (`remotion/src/flat/`)

How every video is drawn since 2026-11-13 (owner: "I absolutely loved this… now new videos are made
like this"). A **directed** beat is one SVG per frame: a place built for the line, the cast acting in
it, the figure written on a thing in that place, a camera that moves, every change on a spoken word.
House style: an ink outline on every shape, one painted shadow tone per shape, gradient glows for
light, Poppins for words. The director's rules are in `generator/prompts/director.md`; each channel's
reference videos (its approved samples) are its bar.

## `kit.tsx`

| Piece | What it draws |
|---|---|
| `motion(p)` | timing on the story clock: `t`, `end`, `at(word, fallback)`, `lerp`, `pop`, `pulse`, `wave`, `after` |
| `Stage` | the frame: an SVG the size of the video (`p.tl.width × p.tl.height`), a background, a lens vignette, `defs` for gradients |
| `View` | the camera: `zoom`, `cx`, `cy` (the point looked at), `rot`; zoom stops at `MAX_ZOOM` 1.3 for videos from 2026-11-17 (`camera.ts`; owner: keep all things in the picture) |
| `Layer` | parallax: moves `depth` times the camera's pan |
| `Flash` | a flash across the frame inside an SVG (a cut on a word) |
| `Glow` | a soft screen-blended light: lamps, screens, windows, spotlights |
| `Block` | a rectangle with ink and a shadow strip (walls, furniture, signs, boxes, buildings) |
| `Ball` | a round thing with a shadow crescent (heads, hands, coins, plants, wheels) |
| `Limb` | a thick inked line (poles, rails, cables, arms of things) |
| `Txt` | words in the scene; `deco` for fine print the probe skips |
| `Tag` | a stamped label (a price tag, "$139 / YEAR"); `k` stamps it in |
| `Coin`, `Cash` | money as things; `Coin spin` turns it |
| `Card` | a phone notification / receipt line |
| `Display` | an LED counter / billboard / scoreboard with a label and a big figure |
| `CityWindow` | a window onto a city, night or day |
| `isoProjector`, `IsoBlock`, `pts` | isometric buildings (a city from above, a warehouse), windows that switch on |
| `countText(final, k)` | a code-computed figure counted up on screen ("$11B" at 0.5 → "$6B") |
| `rng(seed)` | seeded randomness (scatter, windows, stars); never `Math.random` |
| `SourceLine` | the "Data: … · month" line, once a video, on the beat `showsSource` picks |
| `shade(hex, amt)` | darker / lighter tones of a colour |

## `india.tsx` (India's official map, 2026-11-24, the India Maps channel)

India with its 28 states and 8 UTs on **India's official outline** (`data/india.json`, built by
`scripts/build_india_map.py` from Natural Earth's public-domain India's-view outline and admin-1 states; the parts
Natural Earth leaves out are assigned as the Survey of India map shows them), over a shaded-relief base
(`public/maps/south-asia-relief.jpg`, Natural Earth, public domain). The India Maps channel never draws another
India outline. Inside a `Stage`/`View` (or a bare SVG):

| Piece | What it draws |
|---|---|
| `IndiaMap` | the map: `focus` (state names or "India") framed with `pad`; the world outside India dimmed (`dim`), India a paper sheet (`sheet`) with white state lines; `states` ({ Telangana: { fill, k, draw, paint, from, lift, trace } }) makes a state on screen like `WorldMap`'s colours; painted states stay painted (an every-state fill-up); `names` writes unpainted states' Devanagari names faintly; `neighbourNames` the neighbours' |
| `StateTag` | a pill pinned to a state (its Devanagari name by default, or `text`), popping in with `k`; kept inside the frame, its stem pointing at the state |
| `frameOf(focus, w, h, pad)`, `lerpFrame(a, b, k)` | a framing as `{center, scale}` and the camera move between two; pass it as `IndiaMap frame` |
| `Plate` | an Indian number plate (white, ink border, blue IND strip, the state's letters) pinned to a state, dropping in with `k`, ringed by `glow`; letters only; `maxY` fades one that would fall in the captions' band |
| `stateColours(palette, names?, offset?)` | a colour per state, never the same as a state it touches |
| `INDIA_STATES`, `stateHi(name)` | the 36 names (English) and each one's Devanagari name |

`MapLabel`, `MapPin` and `MapRoute` work inside `IndiaMap` too. `IndiaSheet` (Root) is a test reel:
`npx remotion still src/index.ts IndiaSheet out.png --frame=100`.

## `map.tsx` (maps, 2026-11-17)

Natural Earth country outlines (public domain, `world-atlas`) drawn in the house style. Inside a `Stage`/`View`:

| Piece | What it draws |
|---|---|
| `WorldMap` | the map: `fit` (country names to frame) or `center` + `scale`; `kind` "world" (Natural Earth projection) or "flat" (Mercator, a region); `colors` ({ Chile: { fill, k } }, `k` fades a recolour in on a word; `draw` outlines it, `paint` brushes the colour in, `lift` raises it; `trace` (0 → 1) runs a bright line with a glowing head round its border until it closes, `traceColor` sets it; `flag: "<name>"` puts the whole flag, true to its 3:2 shape, inside the country as big as fits, over its colour, kept in frame; a flag the table lacks: just `fill`); `hide` (a disputed region a video can't show) |
| `FlagArt` (`flags.tsx`) | a country's flag in a box (South Africa and Lesotho added for v-20261124-11, Panama for v-20261124-12, Ethiopia, Somalia, Kenya and Tanzania for v-20261125-12) (`name`, `x`, `y`, `w`, `h`): stripes, crosses, discs, stars, simplified; `cover` fills a country's box at 3:2; `hasFlag(name)`, `FLAG_NAMES` (a planted flag, a sign; `FlagSheet` in Root shows them all) |
| `MapLabel` | a place name at [lon, lat] with an ink halo |
| `MapPin` | a pin that drops onto [lon, lat] |
| `MapRoute` | a great-circle route through stops, drawn as `k` goes 0 → 1; `mover` rides its tip (a ship, a plane) |
| `Lift` | a country's own shape laid over another place at true scale (Chile over India), sliding as `k` goes 0 → 1 |
| `useAt()` | [lon, lat] → [x, y] on the current map, to stand a character or a sign on a place |

Country names are Natural Earth's ("Chile", "Gambia", "Bosnia and Herz."). Borders are as controlled; a
video about a disputed border follows that country's official map or uses `hide`. `MapSheet` (Root) is a
test reel: `npx remotion still src/index.ts MapSheet out.png --frame=105`.

## `cast.tsx`

`Char` is a person: feet at (`x`, `y`), `s` pixels per body unit (about 2.8 units tall). `who` picks a
cast member's colours (rohan, priya, sharma); `face` (neutral, happy, grin, smirk, shock, worried, sad,
angry), `look`, `armL`/`armR` as [upper, fore] degrees (0 down, 90 out, 180 up, negative across the
body), `sit`, `back`, `tilt`, `phone`, `holdR`/`holdL` (draw something in the hand), `talk` (mouth open
0..1; `talkAt` drives it from the words), `blink`, `sweat`, `glasses`, `moustache`, `light`, and `photo`
(a real person's cut-out head from `remotion/public/real`, bobblehead; they never speak).

## Contract

A directed beat's file default-exports `React.FC<SceneProps>`, imports only the kit (see
`generator/prompts/director.md`), types no figure (it reads `p.beat.params.fig`), and is a pure function
of `p.frame` and the beat (`renderer/remotion.py` `custom_problems` checks it).

## `tech/` (tech channel, dark look, 2026-11-18)

Dark interface pieces for `how-tech-and-ai-actually-work-chips-ai-p`: near-black base, one amber accent,
condensed numerals (`Num`; Poppins squeezed until an OFL condensed face is added, `theme.tsx`). Inside a
`Stage`, every piece takes `m` (`motion(p)`), its words and figures as props (figures from `params.fig`) and
its moments as frames (`m.at("word")`); sizes follow the frame (`useUnit`), so they work in 1080×1920 and 1920×1080.

| Piece | What it draws |
|---|---|
| `CardDeck` | interface cards built one per spoken item (`on`), the named one (`hi`, `hiAt`) in the accent, the rest dim |
| `ChapterCard` | a long video's chapter: outlined number, accent rule, title word by word |
| `LineChart` | a line from `series` (Python's numbers) that draws `from` → `to`, the `endLabel` figure landing on the end point |
| `EquivChain` | icon = figure → a line draws to a familiar thing (`links`, `on`), the camera trucking along |
| `LitDoc` | a page where only sentence `lit` is lit at `litAt`, an optional highlighter pass, a `SourceChip` |
| `Icon` | line icons: chip, gpu, server, bolt, home, car, phone, bulb, cloud, doc, water, plane, city, brain |

Test reel: `TechFlatDemo` / `TechFlatDemoLong` (`tech/Demo.tsx`).
