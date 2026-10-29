# The shot system (every new video, since 2026-10-21)

The owner: "numbers in a box, two lines of text, most of the screen empty, every video works like
a template." The fixed layouts (`stage`, `bignumber`, `kinetic`, `split`…) are retired for new
videos: **at least 60% of a video's beats are `shot` (or the `hook`)**, or the render fails
(`renderer/craft.py`). Read `.claude/skills/motion-direction/SKILL.md` first. The reference Short
is `examples/short_story_shot.json` (with its hook in `remotion/src/videos/v-showcase-raise/Hook.tsx`):
it scored 9.3 on motion and the owner approved it.

## A shot

```json
{ "id": "rich", "scene": "shot", "speaker": "sharma", "transition": "match",
  "say": "Same raise. I invest all of it. Every single month.",
  "events": { "inv": { "word": "invest" } },
  "sfx": [ { "kind": "ding", "at": "inv" } ],
  "params": {
    "set": "penthouse",
    "actors": [ { "who": "sharma", "spot": "left", "acting": [ { "sec": 0, "pose": "present", "expression": "smirk", "turn": 0.3 },
                                                              { "at": "inv", "pose": "thumbsUp", "expression": "proud" } ] } ],
    "objects": [ { "kind": "stack", "id": "kept", "spot": "right", "amount": "@rich.final", "text": "{rich_final}",
                   "label": "Invested", "at": "inv", "tone": "good" } ],
    "camera": [ { "sec": 0, "size": "wide", "on": "room" }, { "at": "inv", "size": "medium", "on": "all", "move": true } ],
    "word": { "text": "Invest", "at": "inv", "color": "good", "where": "left" } } }
```

| field | |
|---|---|
| `set` | a lit, layered place: `flat` (a rented middle-class flat at night: fan, tubelight, window on the city), `penthouse` (glass wall on the night skyline, marble, gold: the rich side), `vault` (shelves of gold and notes under a spotlight: big reveals), `office` (cubicles at dusk), `bank` (marble hall, vault door, queue rope), `market` (an Indian street market at night: stalls, bulbs, an auto-rickshaw) |
| `actors` | `{who, spot: left\|center\|right\|0..1, scale?, acting, enter?, exit?, turn?}` (acting as in `long_story`'s Cast and acting). Default scale fills about half the frame height |
| `objects` | money as things (below). Give each an `id` (a word, no digits) to frame it or fly money to it |
| `camera` | keyframes `{sec \| at, size, on, move?}`. `size`: `wide` (the world), `medium` (waist up), `close` (face, phone, a stack top), `extreme` (eyes, one number). `on`: an actor's `who`, an object `id`, `all` (everyone and everything, centred) or `room`. `move: true` glides to the new framing; otherwise it cuts on the word. Close shots blur the set (depth of field). A shot `on` a stack frames its tag and label; a shot on a stack or a phone zooms out just enough to keep it whole (since 2026-10-26). A close-up on an actor still crops the other objects: keep money off-camera ones out of that beat or go `medium` on `all` |
| `word` | at most one big word per shot, dropped in and stamped with a shake: `{text, at, color: gold\|good\|bad\|white, where: top\|left\|right}`. Keep it off the money tags. Captions already show every spoken word |

### Money objects

| kind | what it is | fields |
|---|---|---|
| `stack` | a tower of cash bundles that grows bundle by bundle; heights are proportional between the stacks in a shot; the tag shows the figure when it is reached | `id, spot, amount: "@x.key", text: "{x_key}", label?, at?, tone?: good\|bad` |
| `flow` | notes flying in arcs from one place to another | `from`, `to`: an object `id`, an actor's `who`, or a spot; `at`, `dur?`, `n?` |
| `phone` | a big bank or shopping app: a title, a figure, line items arriving, notifications sliding in | `id, spot, height?: 0..1, title, figure?, at?, lines?: [{label, value?, at?}], toasts?: [{text, at?}]` |

Every figure is a placeholder, as everywhere. `amount` takes a raw value (`"@rich.final"`) only to
size a stack.

### Transitions

`zoom-through` (dive into the shot before and come out here: phone → bank app, window → city),
`match` (the same subject, a new world), `whip` (a fast pan), `cut`. Each travelling one carries
its own whoosh. Fades and slides are for chapters only.

## The rules the gates check (renderer/craft.py)

- At least 60% of the beats are `shot`/`hook`.
- At least 3 shot sizes in a Short and 4 in a long video; never the same opening size four shots
  in a row; a `close` or `extreme` shot at least every 15 s.
- No set in more than 2 shots in a row, nor in more than 45% of a Short's shots (25% in a long video).
- Fewer than 15% of the stills mostly empty background; fewer than 20% of consecutive stills alike.
- Motion median at least 3.0 (Shorts) or 2.0 (long).

## The custom hook (every video)

The first beat is `"scene": "hook"`. Its picture is written for this video: a component in
`remotion/src/videos/<video id>/Hook.tsx` (see `remotion/src/videos/README.md`). Give the hook beat
the `params` of a normal shot too: if the hook file is missing or fails its check, the render
draws the shot instead and says so.

## The build scene, and the picture following the words (owner, 2026-10-26)

"Animation should be dynamic to the script, not hardcoded props, so no two videos look alike."
Our Shorts lost most viewers right after the hook, where every video turned into the same phone →
stack → vault. The references show the rule: **what is on screen is what is being said, and it
changes on every phrase**. Zack D. Films (8.2M) cuts to a literal picture of each phrase; The Curious
Plot (1.1M) keeps one world and adds or changes a thing on each phrase (egg → hen → crate → a flock
of 312 hens), with a level tracker and a climbing number.

**Draw the story's own things** in `remotion/src/videos/<id>/props.tsx` (default-export
`{ name: PropFC }`, built with `../../studio/draw`: `Box`, `Ball`, `Shape`, `Shadow`, `Paint`,
`PALETTE`, `shade`, `bob`). A prop is drawn centred on x = 0, base on y = 0, about `s` tall; `k`
(0..1) and `state` are what the story changes (a chart's climb, `"crash"`, a loan `"signed"`).
Ten things for a 60-second Short is normal. Shared money things: `note`, `coin`, `cash`, `box`.
Example: `remotion/src/videos/v-remake-billionaires/props.tsx`.

**A build beat** (`"scene": "build"`) is one world filling up phrase by phrase:

```json
{ "id": "selltax", "scene": "build", "role": "level", "speaker": "sharma",
  "say": "Sell, and the tax man takes {tax_tax} of that cash. Gone.",
  "events": { "tax": { "word": "tax" }, "takes": { "word": "takes" }, "cash": { "word": "cash" }, "gone": { "word": "gone" } },
  "params": {
    "world": { "kind": "city", "tint": "red", "horizon": [ { "prop": "mansion", "x": 0.15, "size": 0.12 } ] },
    "actors": [ { "who": "sharma", "spot": 0.18, "acting": [ { "sec": 0, "pose": "shrug", "expression": "smirk" } ] } ],
    "items": [ { "id": "cash", "prop": "cash", "x": 0.48, "size": 0.14 },
               { "id": "tax", "prop": "taxman", "x": 0.8, "size": 0.2, "hidden": true } ],
    "actions": [ { "at": "tax", "do": "enter", "target": "tax" },
                 { "at": "cash", "do": "move", "target": "cash", "to": "tax" },
                 { "at": "gone", "do": "exit", "target": "cash" } ],
    "camera": [ { "sec": 0, "size": "wide", "on": "room" }, { "at": "gone", "size": "close", "on": "tax", "move": true } ],
    "hud": { "level": 1, "counter": { "value": "@tax.tax", "text": "{tax_tax}", "label": "Tax if he sells", "at": "takes" } } } }
```

- `world.kind`: field, street, city, bank, kitchen, office, night, desert, space, studio; `tint`: red,
  gold, blue, green, purple, dark; `horizon`: this video's props, small and far. One or two worlds a video.
- `items`: `{id, prop, x: 0..1, y?: above the ground, size?: share of height, label?, tag?, hidden?, state?, k?}`.
- verbs: `enter`, `exit`, `multiply {n (from @maths), text?}`, `grow`/`shrink {scale}`, `move {to: id | {x, y}}`,
  `swap {into: prop}`, `break`, `fill`/`drain {k}`, `state {state}`, `label {text}`, `tag {text}`,
  `count {value, text}`, `glow`, `shake`, `focus {size}` (camera).
- `camera` (since 2026-10-29): `on: "all"` frames every thing on screen and every actor head to feet;
  a `medium` or `close` shot on a thing that catches part of an actor zooms out just enough to keep
  that actor's head in frame (an actor wholly outside stays out), so item shots beside the cast are safe.
- **Each action fires on the word that names its thing** ("tax" enters the tax sack). An item's id,
  prop or label must share a word with what is said around that moment (`renderer/craft.py`).
- `hud`: the level tracker (`structure.levels` at the top of the script) and the climbing number;
  they carry over between beats. `"hud": {"hide": true}` on the hook.

**Custom beats**: besides `Hook.tsx`, write `Turn.tsx` and `Payoff.tsx` (`"scene": "custom",
"params": {"component": "Turn", ...}`), same contract as the hook (`remotion/src/videos/README.md`).

**The gates** (fail the render): nothing new on screen for more than 2.5 s in a shot or build beat;
under 70% of a build beat's actions showing a thing said at that moment; fewer than 8 props of its
own; more than 30% of its props used by one of the last 10 videos.
