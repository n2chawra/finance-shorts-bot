# Style study: the geography references (18 Nov 2026)

Watched in the built-in browser (frames sampled, sound measured with the yt-style probe; nothing
downloaded): WorldShift "What If the Entire World Became One Country" (R1zt38xJ_V0) and Map & Myth "Why
Chile Is So Long & Narrow" (7iZflr3qD-4). Owner's note on our first sample: the sound was channel #1's,
the maps sat there finished instead of being made on screen, and the map effects looked poorer than the
references. Techniques only; never their art, words or audio.

## Picture

| Their technique | What we had | Change |
|---|---|---|
| A **textured map**: vintage parchment land with relief and paper grain, a grainy teal sea (WorldShift); photoreal relief (Map & Myth) | flat fills, plain blue sea | `WorldMap look="vintage"`: parchment land, relief and grain textures, coast halo rings in the sea, brown ink borders |
| The map **changes in front of you**: colours merge into one, an eraser rubs borders out, a country paints red along its coast, a measuring line draws on with its label | countries already coloured, things popping in finished | per-country `draw` (outline draws on, then the fill), `wipe` (the colour paints in from a point), `lift` (the country rises with a shadow); labels type on |
| A shape **lifted and dragged** across the map (Chile over India) | `Lift` existed, unused | used for the payoff |
| The map **tilts** toward the viewer at the open | flat | a perspective tilt in the hook |
| Chibi characters with big heads standing on the map; props fly (passports, a plane on a route, an eraser) | Char at full proportions | Char stays (our own cast style), smaller on the map; props travel |
| Serif place names, white with a dark halo; yellow measure labels | Poppins labels | labels kept in Poppins until a serif font is approved (OFL, needs a download) |

## Sound (measured)

| | WorldShift | Map & Myth | Ours (sample 1) |
|---|---|---|---|
| Music under the voice | 39 dB | 16 dB (Hindi voice, cinematic bed) | ~13–21 dB |
| Music character | bright, almost no bass (2%), ~150 BPM feel | slow cinematic (69 BPM), heavy bass | channel #1's cinematic pulse bed |
| Sound effects | ~5 a minute | ~3 a minute | ~20 a minute (2 per beat + transition whooshes) |
| Picture changes | every 3.7 s | — | every 2.4 s |

The channel's sound (`channel.json` → `sound`): its own light "explainer" bed (soft plucked marimba-like
notes, a shaker, almost no bass, no kick), about 30 dB under the voice, 4–6 effects a minute and only
map sounds: a pencil scribble when a line draws, a paper swish on a big camera move, a soft pin drop on a
flag or pin, a low thud on the turn. None of channel #1's money sounds (ka-ching, clink) and none of its
beds.
