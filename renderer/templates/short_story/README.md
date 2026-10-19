# short_story — Shorts on Remotion

A vertical Short (1080×1920, 30–45 s) told in beats by the recurring cast, drawn by Remotion.
Same pipeline, scenes, cast, numbers and rules as [`long_story`](../long_story/README.md): read
that README for the script fields, `maths` kinds, beats, events, acting and the scene table.
Example: [`examples/short_story.json`](../../../examples/short_story.json). There is no
`schema.json`: `python -m generator.run number-check <id>` validates the whole script.

## What is different in a Short

- `"format": "short"`, `"template": "short_story"`.
- **Pace:** tempo 1.3 (voice included), about **185 spoken words a minute**. 30–45 s is
  **95–135 words in 6–9 beats**. No `chapter` beats.
- **The first second is the hook.** The first beat's opening lines (`"at": "start"`) are on screen
  from frame 0, because that frame is what the feed shows: a big figure or a sharp question.
- **One idea.** A Short makes one point with one calculation. Cut every beat that doesn't move it.
- **No captions on screen**: the voice carries the words, the picture carries the figures.
- **Vertical layouts**: scenes stack their content for the tall frame. Keep `actors` to one or two
  per `stage` beat, near the middle (`x` 0.3–0.7).
- **Loop:** let the last line lead back into the first, so a replay feels continuous.
- End with the `end` beat (it carries the disclaimer).

## The visual kit in a Short

Most beats should be `prop`, `screen`, `equation` or `kinetic` with a `presenter` at the bottom:
the graphic carries the figure in the top part, a cast member talks below (see the long_story
README for every option). Use a `kinetic` typed card for the turn of the story, one `stage` beat
for a character moment with a `bubble`, and keep plain `bignumber` beats rare. Example:
[`examples/short_story_kit.json`](../../../examples/short_story_kit.json).

## Evidence: `source` and `pen` (2026-10-19)

From the Casual Finance study (`improvement/style-study/2026-10-19-casual-finance.md`): show the
proof at the moment of the claim, and mark it up while it is spoken.
- **`source`**: for a news fact, draw the document: `publisher` (words only), `title`, and `lines`,
  each `{text, highlight?, underline?, at?}` (`underline`: a red marker line under the words). The highlighted line is the sentence being spoken, with the fact as
  a placeholder (`{fact1}`); it sweeps yellow on its `at` event. The "Data: …" source line shows at
  the foot of the card automatically. Use it once per news Short, right after the headline.
- **`pen`** (on `source`, `screen` and `chart`): hand-drawn marks that draw on at a word: `circle`
  (`x`, `y`, `r`), `underline` and `arrow` (`x`, `y` → `x2`, `y2`), `gap` (a double arrow from `y` to
  `y2` at `x`), `tick`, `cross`, `note` (`text`, a placeholder or short words). Positions are 0..1
  of the card or plot. `color`: `bad` (default), `good`, `accent`, `ink`. One or two marks per beat.
- **Pointer**: a presenter can point at the evidence with a stick: pose `aimUp` (Short) or `aim`
  (long) with `prop: "pointer"` / `"pointerUp"`.

## Look and motion (owner, 2026-10-19)

The long_story README's **Look and motion** rules apply to Shorts too: the first frames show the
topic and the shock together; no text-only slides (at most one `bignumber`/`reveal`); something
always moves; and each scene's `place`, `time`, `land` and `weather` fit this story. The story
scenes work vertically: `bill` (a small payment turning into a big bill) is the strongest hook for
a cost; `road` for anything that takes years; `fork` instead of side-by-side bars. Retired:
`monster`. Avoid: `towers`.

## Story recipes

Pick the recipe that fits the plan's `story`; never reuse the beat order of the last few Shorts.

| recipe | beats |
|---|---|
| **Trap alert** | the shocking cost (`reveal`) → how the trap works (`statement`/`monster`) → what it does in a year (`split`) → how long it lasts (`calendar`) → the way out (`towers`) → a cast line → `end` |
| **Two lives** | two people, one choice (`stage`, two actors) → the gap after a year (`split`) → the gap after N years (`chart` or `towers`) → who wins and why (`bignumber`) → `end` |
| **Myth bust** | the myth, said by a character (`stage`) → "actually…" (`reveal`) → the numbers (`split`/`chart`) → the rule of thumb (`checklist` with one or two items) → `end` |
| **The leak** | a small daily habit (`stage` with a prop) → its monthly cost (`bignumber`) → the yearly drain (`monster`/`snowball`) → what that money could become (`towers`) → `end` |
| **Quiz** | a question with the stakes (`bignumber`) → two or three options (`checklist`) → the answer lands on a word (`reveal`) → why (`split`) → `end` |
| **Trailer** (Studio only, for a long video it just shipped) | the long video's hook, re-laid for 9:16 (`kinetic` box or `screen`) → its strongest figure or reveal (`source`, `screen` with `pen`, or `reveal`) → the open question the long video answers, left open → `end` with a CTA pointing to the full video. Plan `trailer_of: "<L-id>"`, the long video's `maths`/`facts`, its narrator. 30–45 s. |
