# Champion recipe: India Maps

The writer and the director follow this over the shared prompts' defaults (which use English money stories and other
lengths as examples). The hard rules do not change: true, sourced facts; figures from code or from a sourced `facts`
entry; one narrator; captions of every word; India's official map only (profile.md).

## The story

- **One map, one question.** Every Short asks one question about India's map and answers it on the map.
- **Topic kinds** (research/advice.md, families.json): every state's ___ on one map (1 in 2); how a state was formed
  or joined (1 in 5); India and the world (1 in 5); a state against a country (1 in 10).
- **True:** every label and figure is sourced. An every-state video's labels come from the topic's `items` (one
  source per list), never typed from memory; a state the source lacks is left grey, never guessed.

## The first second

- **Frame 0 is India on the map**, already lit where the story is: the state named in the title already painted, or
  all of India waiting to be filled for an every-state video. Never a title card, never a person.
- The **first line is the title's question**, under 12 words, in Hindi ("हर स्टेट का ऑफिशियल जानवर कौन-सा है?");
  the state or subject named within 1 s.
- No figure in the first 2 s; the first figure by 8 s, on a label on the map (a year, a count).
- Talk to the viewer once ("आपका स्टेट कौन-सा है?").

## Length and pace

- **25–50 seconds** (every-state fills up to 50; the others 25–40). Narration at 1.5× (channel.json `voiceSpeed`).
- Every-state: a new state every 1–2 seconds on its own spoken label, in a route across the map (north to south,
  or a loop); one surprising state gets a longer beat. The others: a new map change every 2–3 seconds.
- The payoff is the most surprising fact, near the end; then the whole map pulls back, filled, and the last line
  loops to frame 0 or asks "aapka state?".

## The look (our own, research/2026-11-24 build spec)

- **The map is the whole stage**: `IndiaMap` (`remotion/src/flat/india.tsx`) on the shaded-relief base, the world
  outside India dimmed, India a pale paper sheet with white state lines. No rooms, no characters standing around.
- **A state is made on screen on its word**: its outline draws (`draw`), the colour brushes in from a point
  (`paint`), it lifts off the sheet with its shadow (`lift`), a bright line runs round its border (`trace`). Painted
  states stay painted: an every-state video ends on a full map.
- **Labels on the map**: `StateTag` pills in Devanagari (state names, the item: "बाघ", "1956"); a big year label on a
  formation's key date; Commons photos as die-cut stickers dropping onto a state (an animal, a bird, a monument),
  with the credit in the description.
- **Camera**: push in from all of India to the state, pull back to show the result, follow a route; at least three
  shot sizes (all India, a region, one state).
- **Every video its own device**: rotate between the fill-up route, the split line (formation), the lifted state laid
  on another country (state vs country), the straight line across the world (India and the world). Never the same
  device and palette two videos running.
- **Colour**: one strong colour per state from the palette, never two neighbours the same; the subject state in the
  brightest tone; text white on ink pills, Devanagari in Poppins.

## Words

- Everyday spoken Hindi, short sentences, common English words in Devanagari (स्टेट, मैप, बॉर्डर).
- Numbers only from placeholders, spoken as Hindi words by code; years the Hindi way (उन्नीस सौ छप्पन).
- No "क्या आप जानते हैं" as a first line more than once in five videos.

## Sound

- The channel's own beds (`tanpura` for every-state and India-and-world, `monsoon` for formation stories), about
  25 dB under the voice; a whoosh on every camera move and paint-in, a low hit on the key date and the payoff, about
  12 effects a minute; a short drop before the payoff.
