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
