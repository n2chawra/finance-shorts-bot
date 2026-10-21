---
name: motion-direction
description: Art direction for Paisa Panchayat videos: how a shot is framed, lit, filled and moved so a video feels made, not templated. Read before writing a script's shots, a custom hook, a new scene, set or effect in remotion/src, or reviewing stills.
---

# Motion direction

The owner, 2026-10-21: "numbers in a box, two lines of text, most of the screen empty, every video
works like a template. How can I expect others to watch the full video if I don't like it myself?"
The voice, cast and scripts are right. This is about **what the screen shows**.

Studied the same day (frames sampled): Kurzgesagt (UBI, 10.9M), The Infographics Show (751K),
LITTLE BIT BETTER (2.5M), "How Rich Thinks" 2D Short (24M), TED-Ed (728K in 3 days), Primate and
Monkey Economics (1.2M, 7.6M), and Claude + Remotion builders (MoSidd, 233K). Notes:
`improvement/style-study/`.

## The seven rules

1. **Fill the frame.** The subject is big: a character at least 45% of the frame height in a
   medium shot, the money object the size of the idea. Empty flat colour is a bug. If a frame
   could be described as "a card on a background", it fails.
2. **Change the shot size.** Wide (the world, tiny people) → medium (waist up, the default) →
   close (the face, the phone, the bill) → extreme (eyes, one number, one coin). Cut on the
   spoken word. Never the same size four shots in a row; a close or extreme shot at least every
   15 s. Emotion lives in close-ups.
3. **Money is a thing, never a label.** A salary is a stack of notes that shrinks as rent, EMI and
   food take their cut; interest is a leak in a jar; a raise is a tower growing; inflation melts
   a pile. The figure rides on the thing (a counter on the stack, a stamp on the bill). Text on a
   card is the last resort.
4. **One metaphor per idea, and the world transforms.** Keep the character and pose, swap the set
   around them on a word (office → beach). A list video gives each item its own picture.
5. **Something changes every 1.5–3 s, each with its sound.** A pop for an element arriving, a
   whoosh for a move, a thud for a stamp, a cash register for a gain. Hold a still picture only as
   a deliberate beat (a punchline pause), never because nothing was planned.
6. **Text lives in the world.** The key word is painted on a wall, a sign, a phone screen, or
   drops in as a physical object and bounces. Captions carry every other word. At most one big
   word per shot.
7. **Every set is lit, layered and alive.** Three depth layers (foreground props, the action,
   the background) moving at different speeds; a key light and soft shadows; ambient motion (a
   fan, traffic, steam, a screen flicker, dust). Close shots blur the foreground and background.

## Transitions carry you somewhere

`zoom-through` (dive into the phone, the window, the coin and come out in the next place),
`match` (the same object in the same spot, a new world), `transform` (the set swaps around the
actor), `whip` (with a whoosh). Fades and slides are fillers: use them only between chapters.

## Hook (first 3 seconds)

The hook frame is the richest frame of the video: the topic's world at its most extreme (a vault
of gold, a mountain of bills, the phone exploding with EMI notifications), the character reacting
big, the conflict or the number in the first line. It is custom-built for each video (owner,
2026-10-21) from the library: characters, money kit, worlds, camera.

## Check a still before anything is rendered

Ask of every still: Is more than half of it flat background? Is the subject small? Is a number
shown as text when it could be a thing? Does it look like the still before it? Is the set unlit
and flat? Any yes: redo the shot. The code gates (`renderer/gates.py`) measure empty frames,
repeated pictures and shot variety, but a still can pass them and still be dull: judge it.

## How it is built

Remotion's own rules are in `.claude/skills/remotion-best-practices/` (timing and easing,
`perceptual-scale` zooms, transitions, motion blur, effects): follow them. Every animation is
driven by `useCurrentFrame()`; every figure comes from Python's placeholders; every frame is drawn
in code (no downloaded art, owner 2026-10-21).
