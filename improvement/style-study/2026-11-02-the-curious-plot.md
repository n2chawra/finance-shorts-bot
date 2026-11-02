# The Curious Plot (@thecuriousplotmedia), studied 2026-11-02

Why this channel: the owner's reference. Their "Why Billionaires Take $0 Salary… But Never Go Broke"
(43K views, 114 s) is the same topic as our $1-salary Short (v-20261028-02, 151 views). Their biggest:
"How $100 Became $204,984: The Egg Selling Mindset" (1.3M, 148 s); also "₹30,000 → ₹470 crore a year"
(122K, 120 s), "Why Are Dubai Locals So Rich?" (94K, 113 s). 12.4K subscribers, 34 videos.

Studied in the built-in browser, nothing downloaded: ~150 frames (0.25–1 s apart on the two main
Shorts, 1–5 s on the others), the full scripts of the two main Shorts read from the live captions
(not kept), 50 s of sound on the salary Short with `audio-probe.js`. Earlier study in this folder:
Casual Finance (2026-10-19, documents and evidence, no music); this one is about cards and dialogue.

## What is NOT the gap (measured against ours)
Sentence length (theirs ~7–9 words, ours 7.7–10.5), the number of animation actions (similar), the
speaking pace (~190 vs ~175 words a minute) and camera motion (they have none at all).

## Script
- **A question in the viewer's voice about every 9 s** (13 in 114 s; ours one every ~20 s): a curious
  grandson asks, the grandpa answers. Doubt → how → "give me a real example" → outrage → "and people
  like us?" → "so what's the lesson?".
- **Answer early, then dig deeper** (an onion): the hook's question is answered within seconds and each
  answer opens the next layer. A small payoff every 5–10 s.
- **Concrete**: real names with sourced figures (Musk's $0 salary, Bezos ~$80K, Ellison's pledged
  shares, the 25 richest paying 3.4%, Buffett 0.1%), or a parable whose every number is built from
  units with the sum said out loud ("365 × 1 = $365").
- **A named term per step** (organic growth, leverage, "loan is not income", step-up in basis).
- **Ending**: a 3-line contrast recap, the lesson, a question to the viewer ("Which son are you?").

## Animation
- **Every clause gets its own literal picture within ~0.5 s** ("they don't sell" → a stamp; "pledge"
  → an arrow; "to a bank" → the bank; "take a loan" → cash). Readable with the sound off.
- **Rooms and cards**: questions in the room with both characters; every answer a full-frame card
  without them, a new composition and colour every ~5 s.
- **A card is a labelled diagram**: a pay slip with real data in rows (PAY TO / AMOUNT, $327,461
  stamped to $0), a calendar ticking years, chips (PER YEAR, FOR DECADES), a donut with a pointer chip
  on its slice and a caption under it, a SELL button clicked by a cursor, bars turning red.
- A **two-level header** (the point, then a smaller line), **subtitles as whole sentences** with the
  speaker's name, a thin progress bar on top. Flat or pixel art, few colours, the cast small.

## Sound
Music ~29 dB under the voice (ours ~13), soft and slow (~76 BPM), dropping out ~0.5 s before reveals
(7 times in 50 s), ~12 soft pops a minute on entrances.

## What we built (all in this change)
The `board` scene (rooms and cards, docs, sums, terms, chips, bars, ring with callout, grid, calendar
steps, buttons and click, person cards, marks, arrows, bubbles, things that rise, drop, swap, try and
bounce back), stacked panels, sentence subtitles with the speaker's name, story checks (question every
12 s, one sentence per beat, new picture per beat, labelled cards, props at most 4 beats, the ending's
question, the explainer answering on cards), clause coverage ≥ 90%, the mute review, sourced facts in
every video, the `rate` calculation and `year` facts, three shapes (`question-chain`, `ladder`,
`true-history`), rotating looks, quieter music with drops and automatic pops, Shorts 60–90 s.
Reviewed by the owner on four takes of `v-remake-salary` (local demo, not shipped).

## Not copied
Their characters, art, layouts, words and hooks (no group stereotypes in titles).
