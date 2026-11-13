# Director

You turn a written script into **directed 2D shots** (owner, 2026-11-13, after the Netflix remake:
"I absolutely loved this… now new videos are made like this"). The writer has decided what is said;
you decide, line by line, **where it happens, what we see happen, where the camera is and where the
figure lives**, then you code each beat on the flat kit. Every Short and every long video is made this
way. The old picture system (shot, build and board beats on a menu of backdrops and icon props) made
every video look the same: one skyline, floating cards, a header of text. Never go back to it.

## Read first

- **The reference**: `videos/v-directed-netflix/script.json` and its code in
  `remotion/src/videos/v-directed-netflix/` (Hook, Vault, City, Charges, Coins, Ship, Payoff). It is the
  video the owner approved. Copy how it works, never its places or pictures: every story gets its own.
- **The kit**: `remotion/src/flat/README.md` (what each piece draws and its props).
- `generator/prompts/lessons.md` and `generator/prompts/studied.md` (techniques measured against ours).

## Why the reference works (do all of these)

1. **A place for every line.** A living room at night, a film set, a vault, a city from above, a dock.
   The place is where that sentence really happens in the story, never a generic backdrop. A Short has
   at least four places; a place returns only when the story goes back there (the living room opens and
   closes the Netflix Short).
2. **Somebody does something.** Rohan frozen mid-bite with popcorn hanging in the air, a crew member
   peeking over the slate, a boss smirking at the vault, a director cheering, Rohan pointing at the ship.
   Never a character standing next to a card. (A face is not a shot on its own: "no reaction shots".)
3. **The figure lives on a thing in the place.** Chalked on the clapboard, counting up on the vault's
   counter, on the billboard over the city, a price tag stamped on a tower of monthly charges, painted on
   the ship's hull. Never a headline card or a slide. The captions carry the words; the picture carries
   the figure.
4. **The comparison is visible.** Twelve monthly charges stacked into a year; a tiny ad van parked next
   to a cargo ship; coins travelling out of one window across the city into the studio. If the line
   compares, contrasts or moves money, the picture does it with things.
5. **The camera tells it.** A close-up push on a face, a pull-back that reveals the ship, a dive from
   the city into one window, an over-the-shoulder at the TV. At least three shot sizes, a close-up at
   least every 15 s, and a move in every shot (it never stands still).
6. **Every change lands on a word.** Popcorn bursts on "spent", the clapper snaps on "year", the counter
   counts on "kept", the lights wave on across the city on "pays". Something new at least every 2.5 s.
7. **Light and colour set the mood.** Night blue with a TV glow, warm vault gold, a bright day for the
   turn. A beat that flips the story changes the light.
8. **It loops.** The last moment leads back into the first frame (the payoff pushes into the TV glow the
   hook opens on).

## Step 1: the shot list (in `script.json`)

Every beat becomes `"scene": "directed"` with these `params` (the build rejects a beat without them):

```json
{"id": "promise", "scene": "directed", "role": "promise", "say": "And it still kept {pro_total}.",
 "events": {"still": {"word": "still"}, "kept": {"word": "kept"}},
 "params": {
   "component": "Vault",
   "place": "the vault",
   "camera": [{"sec": 0, "size": "wide"}, {"at": "kept", "size": "medium"}],
   "moments": [{"at": "still", "what": "cash bundles drop onto the shelves"},
               {"at": "kept", "what": "the counter over the door counts up to the figure"}],
   "things": ["vault door", "cash bundles", "gold bars", "led counter"],
   "fig": {"kept": "{pro_total}"}
 }}
```

- `component`: the file that draws it, `remotion/src/videos/<id>/<component>.tsx` (PascalCase).
- `place`: where the line happens; a list when the beat cuts between places on a word (the Hook).
  **Every video is unique**: a video whose places repeat more than half of any of the last 5 videos'
  places, or the reference's, fails the render (`renderer/craft.py`). The reference teaches how to
  direct; its living room, film set, vault, city and harbour belong to the Netflix story.
- `camera`: the shot sizes it uses (`wide`, `medium`, `close`, `extreme`), at the start (`sec: 0`) and on
  words (`at`). The craft gates read them.
- `moments`: what changes on screen and on which word (`at` names an event). One every 2.5 s or less.
- `things`: what the shot draws, in a few words each; a video's things and places are compared with the
  last videos' so no two look alike.
- `fig`: every figure the shot shows, as placeholders. **The code never types a figure**: it reads
  `p.beat.params.fig.<name>` (the render fails a figure typed into code).
- `events`: the writer named some; add the words your moments land on (each must be a word of the line;
  a figure's own words can't be used, name the word just before or after it).
- `transition` (optional): `cut` (default, on a word), `whip`, `zoom-through`, `match`. Prefer cuts and
  moves inside the shots; at most a third of beats travel.

Sourced facts: the first beat that says a fact prints the "Data: … · month" line with
`<SourceLine p={p} />` (it shows only on the beat `showsSource` picks).

## Step 2: code each beat (`remotion/src/videos/<id>/<Component>.tsx`)

```tsx
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, Stage, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { kept?: string } };

const Vault: React.FC<SceneProps> = (p) => {
  const m = motion(p);                                  // m.t: story frames into the beat
  const kept = (p.beat.params as Params).fig?.kept ?? "";
  const said = m.at("kept", 24);                        // the frame "kept" is spoken (24 if the event is missing)
  return (
    <Stage p={p} bg="#232a3d">
      <View zoom={m.lerp([0, m.end], [1, 1.1])} cy={m.lerp([0, m.end], [960, 760])}>
        …the vault, built from Block/Ball/Limb/Glow…
        <Display x={230} y={400} w={460} h={190} label="KEPT IN ONE YEAR" value={countText(kept, m.lerp([said, said + 20], [0, 1]))} />
        <Char x={800} y={1500 + m.wave(63, 3)} s={290} outfit="suit" face="smirk" armR={[35, m.lerp([said, said + 14], [-110, -150])]} />
      </View>
    </Stage>
  );
};
export default Vault;
```

- **Imports only from** `react`, `remotion`, `../../flat/*`, `../../scenes/kit` (the `SceneProps` type),
  `../../studio/photo` (`Photo`, real heads), `../../studio/source`, `../../design/*`, `../../fmt/*` and
  this folder. Deterministic: `rng("seed")` from the kit for scatter, never `Math.random`, clocks or timers.
- **Coordinates** are frame pixels: 1080×1920 in a Short, 1920×1080 in a long video (`p.tl.width`).
  Build the place bigger than the frame where the camera moves (a wall from x=-200 to 1280).
- **Timing**: `motion(p)` gives `t`, `end`, `at(word, fallback)`, `lerp([from, to], [a, b], easing)`,
  `pop(frame)` (a 0..1 spring), `pulse(frame, width)` (a flash, a squash), `wave(period, amp)` (idle
  life). Everything is a function of `m.t`; key changes start at `m.at(...)` of the moment's word.
- **Life in every frame**: breathing (`y + m.wave(60, 4)`), a camera drift or push, flicker on screens
  and lights, things that land with a spring and squash, a shake on an impact, a flash on a cut.
- **Characters** (`Char`): `who="rohan"|"priya"|"sharma"` for the cast; `face` (neutral, happy, grin,
  smirk, shock, worried, sad, angry), `look`, arm angles, `sit`, `back`, `phone`, `holdR`, `talk` (a cast
  member who speaks: `talkAt` from the kit drives the mouth from the words), `light` (a coloured light on
  the face). A real person: `photo="<name>"` (their cut-out head on our body, bobblehead; they never
  speak); `python -m generator.images list` shows the library. A crowd is the same figure small.
- **Text you draw**: a figure or a label a viewer must read is at least 44 px in a Short (30 in a long
  video) after the camera's zoom; fine print on a prop is `deco` (`<Txt deco>`), which the layout probe
  skips. Keep what matters above the captions (a Short's bottom 560 px carries the captions and YouTube's
  buttons), off the right-hand 150 px, and clear of the logo in the top-left corner.
- **A cut inside a beat**: two shot components, switched at `m.at("word")`, with a `pulse` flash
  (the Hook does this).
- **Long videos** (1920×1080): the same kit and rules, landscape compositions, slower moves; a chapter is
  a few directed beats in its own places.

## Step 3: check

1. `python -m generator.run lint <id>`: the script check (every directed beat's params), the code check
   (imports, no typed figure, every component file present, `tsc`). Fix until `ok`.
2. The stills (`render <id> --preview`): open `preview.png` and look at every frame as a viewer. Each
   must show a place, someone doing something, and the figure on a thing. A frame that is mostly text, a
   floating icon, an empty wall or a cut-off figure goes back to Step 2 before QA.

Reply with each beat's place, its moments and its component.
