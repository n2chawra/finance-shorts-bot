# The dive kit (`remotion/src/dive/`)

For Going Down (`channels/going-down/`, 2026-11-21): a Short that dives straight down under a real place
through its real layers, a depth meter counting, each layer landing on the word that names it, a pull-back
showing the whole stack, then a ride back up so the last frame is the first (a loop). The owner-approved
reference is the Grand Central sample (`E:/work/going-down-sample`); `DiveKitDemo` rebuilds it from params.
Drawn on the flat kit (`../flat/kit.tsx`): ink outlines, painted shadows, glows.

## How it works

Every beat of a dive video is `"scene": "directed"` with `params.component: "Dive"`, and the video's folder
holds one file, `remotion/src/videos/<id>/Dive.tsx`:

```tsx
import Dive from "../../dive/Dive";
export default Dive;
```

`Dive` reads **all** beats' `params.dive` from the timeline (`world.ts` `diveWorld`), so every beat draws the
same world and the camera continues across cuts: it eases from the previous beat's depth to this beat's.
Depths come from `params.fig` (sourced facts Python fills: `"fig": {"depth": "{m42_ft}"}` → "105 ft"); the
kit reads the number from the figure, prints the figure as written on the layer's sign and computes metres
(`ft × 0.3048`) for the meter. A `ft`/`fromFt`/`toFt` number is placement only and is never printed. Layers
crowded together are spread out (at least 820 px apart), so add `world.note: "... · not to scale"`.

## `params` of a dive beat

```jsonc
{ "component": "Dive", "place": "...", "camera": [...], "moments": [...], "things": [...],   // the usual directed params
  "fig": { "depth": "{shuttle_ft}" },          // every figure on screen
  "dive": {
    "move": "dive",          // surface (hold on the landmark) | dive (to this beat's first layer) | pullback (whole stack) | rideup (back to the first frame) | hold
    "on": "twenty",          // the event the camera lands on (dive) or pulls back on (pullback); default the beat's start
    "pull": "escalators",    // optional: a pull-back later in the same beat, on this word
    "zoom": 1.1,             // landing zoom, 0.8..1.3
    "layer": { ... },        // or "layers": [ ... ] (the first one is the camera's target)
    "world": { ... }         // first beat only
  } }
```

`world`: `look` (below), `strata` [{`kind` soil|clay|sand|gravel|bedrock|chalk|water, `toFt` (band bottom,
placement), `label`}], `unit` "ft" (default) or "m" (meter shows m first), `note` (fine print at the top).

## Pieces (`layer.kind`)

Common: `depth` (fig key, default "depth"), `ft` (placement when no figure), `label` (sign words), `on` (its
moment, default the beat's `on`), `counter` {`fig`, `label`, `on`}: a display on screen (top right, clear of the meter) that counts a
figure up on its word (the 90 s ride) and shows until its beat ends; `counter.y` moves the display down the screen (default 300) when it would cover a sign.

| kind | params | draws |
|---|---|---|
| `surface` | `preset` station / tube (a London Underground front) / needle (a supertall with setbacks and a spire) / tower / stadium / monument / bridge / dam / street, `label`, `wall`, `trim`, `glass`, `color`, `vehicle` | sky, skyline, the landmark, the street with looping traffic (boats for bridge/dam) |
| `tunnel` | `type` subway / rail / road / utility, `color` (vehicle), `stripe`, `bullets` [[text, colour]], `light`, `dir` 1/-1 | a lit cross-section, track or road, the sign with the depth, a train/car running through on its word (utility: cables, flowing) |
| `chamber` | `type` secret / vault / bunker / machine, `props` [machines, lamp, blueprint, safe, gold, crates, bunks, pipes, desk], `stamp` + `stampOn`, `plansOn`, `color` | a room in the rock; the stamp lands on its word; a depth tag (or a sign when `label`) |
| `cavern` | `levels` 1/2, `trains` [stripe per level], `stripe` (car body), `bullets`, `light`, `color` | a deep hall with platforms and moving trains, its sign |
| `shaft` | `type` escalator / elevator / stairs / pipe, `fromFt`, `toFt`, `side`, `riders`, `glowOn`, `color`, `stripe` | runs between two depths with riders; glows on its word |
| `foundation` | `type` piles / raft / caissons, `count`, `color` | from the street to its depth, driven down on its word, a depth tag |
| `water` | `type` river / aquifer / sea, `toFt`, `color` | a water band (waves, bubbles, a sea bed) with its sign |
| `deepest` | `text` ("deepest point") | the payoff: a beacon ring and a stamped tag "TEXT · DEPTH" on its word |
| `counter` | `counter` only | nothing in the world: holds a beat's on-screen counter (the payoff figure on a pull-back) |

### More pieces (`more.tsx`, 2026-11-22)

The first kit drew transit only, so a day of Going Down Shorts failed QA (a stone town drew as a city street,
carved rooms as one bunker box). The video run now adds what a topic needs (`generator/prompts/routine.md`
section 3c). Every piece has something alive in it, and a `label` (sign) or depth tag.

| kind | params | draws |
|---|---|---|
| `room` | `type` living / stable / press / storage / church / kitchen / door / tombs / ossuary / grave, `people`, `stamp` + `stampOn` (door), `color` (rock) | a carved, arched cave room: people at home, animals at a trough, someone treading grapes with juice running, jars, kneeling people and candles, an oven, a round stone door rolling shut on its word, burial niches, an ossuary wall of stacked bones and skulls with visitors walking past (2026-11-23), a grave shrine on a red wall with candles and someone kneeling (2026-11-23) |
| `hall` | `count` (3-9 pillars), `color` | a pillared hall: two rows of pillars rising on its word, light shafts, mist, a walker with a lamp |
| `passage` | `type` walk / water / sewer, `people`, `dir`, `color`, `stripe` (water) | an arched passage: people walking with lamps, or water surging on its word with debris |
| `pumps` | `count` (2-4) | a pump room: impellers spinning faster from its word, water rising up the pipes |
| `pour` | `color` | floodwater pouring in from the left into a rising, churning pool |
| `dig` | `label`, `bullets`, `color` (box), `light` | a station still being built (2026-11-23): a shored concrete box, a tunnel-boring cutterhead turning in the end wall, workers walking, a welder's sparks, a crane hook swinging; its sign with the depth |
| `spiral` | `fromFt`, `toFt`, `ft`, `side`, `riders`, `glowOn`, `color`, `label` | a spiral stair in a round shaft (2026-11-23): flights zigzag down the drum around a newel post, people climbing up and walking down, the drum glowing on its word, its sign beside the bottom |
| `vent` | `label`, `color`, `light` | a ventilation shaft's fan room (2026-11-23): a big fan turning, air arrows rising up a shaft that fades out above, a worker with a lamp on the gantry, its sign |
| `surface` presets | `town`, `field`, `sea`, `mountain`, `pyramid`, `dome`, `arena`; `plate` (default on for these; `true` adds one to the older presets) | low stone houses with a dome and a tower and people walking; a field with a small building, trees and a goal; the sea with ferries and white cliffs; a snowy peak with a train leaving a portal; a pyramid in sand; a domed basilica; an arena of arches. All have a dark name plate with the `label` |

Kit-wide since 2026-11-22: a sign or tag fades when it is far from the camera's point (a neighbour layer never
sits under the top note or the captions); the `note` shows only near the street; whatever arrived on its word
leaves over the last second (`outro`), so the last frame is the first.

## Camera rules

- One layer per beat; the camera **dives on the word that names the layer** (`on`: the depth figure's first
  word, "twenty"), landing 14 frames after it with a small shake.
- **Pull back on the payoff** (`pull` or a `pullback` beat): the whole stack in one frame, the meter holding
  at the deepest depth.
- The last beat is `rideup`: the camera returns to the opening framing and ends on it, so the loop is seamless
  (traffic and riders loop a whole number of times over the video).
- At least **4 distinct layer kinds** a video (surface + three of tunnel/chamber/cavern/shaft/foundation/water/deepest),
  and never the same landmark preset + look as the last 3 videos.

## Looks (`looks.ts`)

`world.look`: dusk (the sample), noon, night, storm, desert, arctic. Rotate per video, never one of the last 3,
and vary the layers' own colours (line colours are the real ones: the 7 is purple).

## Example: Grand Central (`Demo.tsx` `DEMO_PARAMS`)

street `surface` station "Grand Central Terminal" (look dusk, strata soil to 60 ft, Manhattan schist) →
shuttle `tunnel` on "twenty" (S, grey) → lex `tunnel` on "fifty" (4 5 6 green, dir -1) → seven `tunnel` on
"eighty" (Flushing, purple) → m42 `chamber` secret on "hundred", stamp M42 on "m42", plans on "blueprints" →
madison `cavern` on "hundred" + escalator `shaft` 62→130 ft glowing on "escalators", `pull: "escalators"`,
counter `ride` "RIDE UP" on "ninety" → loop `rideup`.

`npx remotion still src/index.ts DiveKitDemo out.png --frame=300` (street 20, shuttle 100, M42 300, cavern 470,
pull-back 540, ride up 640).
