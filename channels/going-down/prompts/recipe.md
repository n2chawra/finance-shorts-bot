# Champion recipe: Going Down

The writer and the director follow this recipe wherever CLAUDE.md describes Paisa Panchayat's.

The hard rules still apply:
- true, sourced facts;
- every figure from code or a sourced `facts` entry;
- one narrator (am_michael, speed 1.3);
- no real person's words in the voice.

The reference is the owner-approved Grand Central sample (21 Nov 2026). Its params example and its rendered frames
are in `remotion/src/dive/README.md`. Every video should look and move like it, in a new place with a new palette.

## The story: one place, straight down

- **Length:** 20–25 s, 7 beats, about 60–75 spoken words.
- **Lines:** short. One layer per line.
- **Beats:**
  1. **Hook.** Name the place and ask what is under it, e.g. "What's under Grand Central? Let's go down." The
     subject is named in the first sentence. Never the answer.
  2–4. **Layers, in depth order.** One beat per layer: the depth figure first, then what it is, e.g. "Twenty feet: the
     shuttle train." The dive lands on the figure word.
  5. **The strange one.** The secret, hidden or odd layer gets a little more time: a room left off plans, a buried
     river, a bunker, ruins. Say legends as legends.
  6. **The payoff.** The deepest point, with the most surprising sourced figure: an escalator ride time, a depth
     taller than a building, the concrete poured. The camera pulls back to show the whole stack.
  7. **The loop line.** It rides back up and ends on words that lead into the first line, e.g. "…just to get back up
     to Grand Central."
- **Layer count:** at least 4 layers with sourced depths, and at least 4 different kinds of piece (tunnel, chamber,
  cavern, shaft, foundation, strata, water). A layer with no published depth may appear on screen without a number,
  but it is never spoken with a guessed one.
- **Numbers:** depths are said in the unit the source gives (feet in the US, metres elsewhere). The meter shows both,
  with the conversion done by code. Figures are words in the voice ("a hundred and fifty feet").
- **Topic kinds:** landmark dive about half, station dive about a third, foundation dive the rest. At least one Short
  in three is outside the US and UK. Never the same city twice in a row.
- **Hook check:** never "You think X?" and never "Watch this".

## Title and description

- **Title:** "What's Under <Place>?" or "How Deep Does <Place> Go?". The place is named, and the payoff figure is never
  in the title. At most 60 characters.
- **Description:**
  - one line on what is down there;
  - "Sources:" followed by each source, named;
  - the disclaimer: "Depths from published sources. Cutaway illustrations, not to scale."

## The look (the director, `remotion/src/dive`)

- **Every beat is directed on the dive kit.** It is one continuous world: the camera dives on the word that names each
  layer, a train, vehicle or rider moves in every layer, and each layer has a station-style sign with its depth from
  `params.fig`.
- **The depth meter** sits on the left all the way down.
- **On the payoff,** the camera pulls back to the whole stack and the payoff figure appears on a thing in the scene
  (a timer, a sign, a counter).
- **The last frame matches the first,** so the Short loops.
- **New every video:** palette, sky and time of day (look recipe rotation in channel.json). Never the last 3.
- **Captions:** big white words with figures in yellow, ending at least 340 px above the bottom edge.

## Sound

- The shared cinematic bed, low and ducked under the voice.
- A whoosh on every dive.
- A rush into the deepest level.
- One sub-boom on the payoff.
- A thud on the loop.
