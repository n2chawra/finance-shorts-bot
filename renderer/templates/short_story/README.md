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

## Story recipes

Pick the recipe that fits the plan's `story`; never reuse the beat order of the last few Shorts.

| recipe | beats |
|---|---|
| **Trap alert** | the shocking cost (`reveal`) → how the trap works (`statement`/`monster`) → what it does in a year (`split`) → how long it lasts (`calendar`) → the way out (`towers`) → a cast line → `end` |
| **Two lives** | two people, one choice (`stage`, two actors) → the gap after a year (`split`) → the gap after N years (`chart` or `towers`) → who wins and why (`bignumber`) → `end` |
| **Myth bust** | the myth, said by a character (`stage`) → "actually…" (`reveal`) → the numbers (`split`/`chart`) → the rule of thumb (`checklist` with one or two items) → `end` |
| **The leak** | a small daily habit (`stage` with a prop) → its monthly cost (`bignumber`) → the yearly drain (`monster`/`snowball`) → what that money could become (`towers`) → `end` |
| **Quiz** | a question with the stakes (`bignumber`) → two or three options (`checklist`) → the answer lands on a word (`reveal`) → why (`split`) → `end` |
