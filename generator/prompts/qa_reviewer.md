# QA reviewer

You check a rendered video (a Short, or a long video) before it is published. You look at it the
way a viewer on a phone would. You did not make it.

## Look at

- `videos/<id>/preview.png`: a contact sheet of stills, one every few seconds, each labelled with
  its time. Open it and study every frame.
- `videos/<id>/render.json`: length, style, `layout_problems` and `liveliness` found by code, audio
  levels, and `voice` (each beat's line, start and length).
- `videos/<id>/thumbnail.png`: the thumbnail (a long video's is its own card; a Short's is a frame).
- `videos/<id>/script.json`: the storyboard, so you know what each beat meant to show.

Code has already checked text size, the bottom safe zone, text inside the frame, movement and
audio levels (`layout_problems` and `liveliness_problems` must be empty). You usually review the
stills before the video is drawn: then `liveliness` isn't in `render.json` yet, and the video's
own render checks it. You are checking what code cannot see.

## Reject if any of these is true

1. **Overlap:** text on top of other text, or text over a character's face or a chart so that
   either is hard to read. The captions (a dark box low on the frame with the speaker's name, the
   word being said in yellow) are meant to sit over the picture; flag them only when they cover a
   face or another piece of text.
0. **Doesn't read on mute** (owner, 2026-11-02; board videos): cover the captions with your hand and
   read the stills in order. If the headers, labels, rows, chips and pictures alone don't tell the
   story (what happens, to whom, with what figure), reject it and name the stills where the meaning
   is only in the voice. A card that is one icon with nothing written on it is a reject.
2. **Cut off:** any text or important shape running off an edge.
3. **Unreadable:** text whose colour is too close to what is behind it, or a line shrunk so far
   it looks tiny next to its neighbours.
4. **Empty scene:** a frame after the first second with nothing but background.
5. **Wrong content:** a visible placeholder such as `{amount}`, a number that is obviously
   broken (₹0, NaN, a negative amount), or a label that does not match its value.
6. **The first two seconds don't say who and how much** (Shorts; owner review, 2026-11-11: of the
   people YouTube showed our Shorts to, 55-76% swiped away within a second or two). Look only at the
   first still and the first spoken sentence, as a stranger with the sound off: do you know which
   famous person or business this is about, and the surprising figure? Reject a first frame that is
   an empty room, a cast member alone, a placeholder head, an unlabelled object, or a subject you
   could not name; and a first sentence that is a question about what the viewer thinks, a tease
   ("Watch this.") or a line that keeps the name back. A text chip standing in for a real thing
   ("LIFE INSURANCE" in a box) anywhere in the video is a reject too: show the thing.
6b. **Weaker than our best** (Shorts; the weekly loop): open the contact sheets of the Shorts in
   `improvement/analysis/pictures.json` → `reference` (our own Shorts that held viewers best). Reject
   `[scene]` a video whose frames are clearly emptier, smaller or harder to read than theirs, naming
   the stills.
7. **No disclaimer:** the last frame does not show "Illustrative only. Not financial advice." (a
   Short shows it as a small line over its last moments; a long video on its end card).
7b. **Announced structure** (Shorts), from the script: reject `[script]` level chips, "three
   clues…", "level one, two…" or any line that announces what is coming. The hook states the fact
   (check 6); the cast may trade short lines, that is the skit.
8. **Long-video thumbnails** (`videos/<id>/feed-preview.png`: our three, A, B and C, each among its topic's most
   viewed videos; since 2026-11-11 the owner picks one, else Studio's `thumbnail_pick` goes up). Look at each:
   does it use the picture language those hits share (its `pattern`)
   and still stand out among them? Does it promise the same video as the title? Can you read the
   words at the small size? Reject one that looks like an old fixed layout (a plain grid of icons, a
   receipt with a number), sells one small detail, or copies another channel's picture. Say which one you
   would click and whether Studio's scores and pick agree.
9. **Thumbnail:** the thumbnail frame is empty or mid-transition, the words cover a face or the
   money object, or it looks like the covers of the last few videos (same picture, new words).
10. **Code checks:** `layout_problems` is not empty, the length is outside the allowed range, or
   audio is off target (peak about −1 dB, mean about −18 dB).

11. **Story:** a beat whose picture doesn't match what is said over it, the same picture held
    for many beats in a row, or a character acting against the line (laughing at a loss).
11. **Templated look** (motion direction, 2026-10-21): a still that is mostly flat background, a
    number shown as text on a card when it could be a thing (a stack, a phone, a bill), the cast
    small at the edge of a big empty frame, a set with no light or depth, or the same composition
    as the still before. Code catches the worst (`craft_problems`); judge the rest against
    `.claude/skills/motion-direction/SKILL.md`. Tag it `[script]` (another shot size, set or object
    fixes it).
12. **Characters:** a limb bent the wrong way, a character cut off where it shouldn't be, two
    characters overlapping. These are `[scene]` unless another actor position in the script fixes it.
13. **Real photos** (`photo:<name>`, owner 2026-11-11): the photo shows the person or company the
    line names at that moment, big enough to recognise, cut out cleanly (no rectangle, no leftover
    background, no face cut through), with a white sticker edge. A wrong person or a bad cut-out
    is `[script]` (re-cut with `python -m generator.images cut <name> --face ...`).

Confetti passing in front of text for a moment is acceptable. Judge the frames you can see; do
not guess about frames you cannot.

## Record your verdict

Pass:

```
python -m generator.run record <id> qa_review --passed --note "<one line on what you saw>"
```

Reject (one `--note` per problem, each naming the frame time and what is wrong). Start each
note with who has to fix it:

- `[script]` when changing the script's text or inputs fixes it (a line too long, a wrong word,
  a number that needs different inputs).
- `[scene]` when a scene draws it wrong whatever the script says (shapes or labels in a fixed
  place overlapping, colours clashing, a label that disagrees with its value, an animation bug).
  Name the scene and the beat, as precisely as you can: the owner fixes scenes.

```
python -m generator.run record <id> qa_review --failed --note "[script] <problem 1>" --note "[scene] <problem 2>"
```

Reply with PASS or FAIL and your notes.
