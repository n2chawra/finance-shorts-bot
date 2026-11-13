# The flat kit (`remotion/src/flat/`)

How every video is drawn since 2026-11-13 (owner: "I absolutely loved this… now new videos are made
like this"). A **directed** beat is one SVG per frame: a place built for the line, the cast acting in
it, the figure written on a thing in that place, a camera that moves, every change on a spoken word.
House style: an ink outline on every shape, one painted shadow tone per shape, gradient glows for
light, Poppins for words. The director's rules are in `generator/prompts/director.md`; the approved
reference is `remotion/src/videos/v-directed-netflix/` with `videos/v-directed-netflix/script.json`.

## `kit.tsx`

| Piece | What it draws |
|---|---|
| `motion(p)` | timing on the story clock: `t`, `end`, `at(word, fallback)`, `lerp`, `pop`, `pulse`, `wave`, `after` |
| `Stage` | the frame: an SVG the size of the video (`p.tl.width × p.tl.height`), a background, a lens vignette, `defs` for gradients |
| `View` | the camera: `zoom`, `cx`, `cy` (the point looked at), `rot` |
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
