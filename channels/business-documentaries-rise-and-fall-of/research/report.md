# Niche report: business documentaries (19 Nov 2026)

The research behind `advice.md`. Sources: `scan.json` (6 viewer searches + 4 references, 4,744 videos,
45 channels), `families.json` (1,485 on-niche titles labelled by two agents, every title read),
`style.json` (13 shot sheets), `style-study/2026-11-19-references.md` (the build spec), `comments.md`,
and the money/licence notes (summarised in `verdict.md`).

## Families

| Family | Kind | Videos | × median | Hit rate | Median views | Tier | Channels 30 d |
|---|---|---|---|---|---|---|---|
| product boom and bust | long | 33 | 1.69 | 21% | 87,221 | core | 7 |
| brand backlash | long | 17 | 1.08 | 29% | 63,061 | core (gap) | 1 |
| founder story | short | 166 | 0.99 | 21% | 31,430 | core | 10 |
| company rise and fall | long | 149 | 1.37 | 17% | 107,641 | low | 14 |
| business war | long | 15 | 1.35 | 18% | 205,163 | low | 4 |
| product boom and bust | short | 36 | 1.41 | 17% | 9,258 | low | 6 |
| company rise and fall | short | 219 | 1.09 | 19% | 8,786 | low | 12 |
| country industry and economy | long | 28 | 0.95 | 10% | 183,338 | low | 3 |
| big tech and AI industry | long | 42 | 0.91 | 6% | 123,500 | low | 9 |
| how a business makes money | long | 68 | 0.87 | 8% | 82,452 | low | 12 |
| corporate scandal and fraud | long | 37 | 0.86 | 9% | 23,012 | low | 11 |
| finance deals and private equity | long | 36 | 0.78 | 5% | 238,214 | low | 9 |
| corporate scandal and fraud | short | 48 | 0.76 | 14% | 2,170 | low | 12 |
| finance deals and private equity | short | 51 | 0.59 | 0% | 3,629 | avoid | 9 |

(Tiers by `workers/niche-research.ts`: core ≥1.5× or ≥20% hits; avoid <0.7×.)

## Style targets (`style.json`)

- Long: subject named 0.5 s, first figure 7 s, 146 words a minute (137–165), payoff at 38% of the
  runtime; footage is the main shot kind; no captions; no cast.
- Shorts: 146.5 words a minute, first figure 8 s, word-by-word captions, payoff at 80%.
- Cut pace (from the opening minutes; sampled sheets read slow): long 2.2 s in the hook, 3–5 s after;
  Shorts ~4.2 s.

## Sound

Measured on four references (`yt-style` probe): music 22–36.5 dB under the voice in long videos, dark and
slow (76–78 BPM), 2–8 effects a minute placed on things arriving; Shorts louder with booms on cuts and
drops before reveals. Targets in the build spec §7.

## Comments' themes

Collectible bubbles, recipe and price changes, dead brands, rivalries; viewers praise storytelling and a
concrete opening figure, and complain about missing facts, US-only framing and errors.

## Gaps

- Brand backlash (long): core and posted by one channel in 30 days.
- Business wars: 205,163 median from only 15 videos and 4 channels.
- Few channels tell product booms and busts globally (prices in the viewer's own money; comments show
  PLN, EUR, INR).

## Risks turned into setup rules

1. **Defamation**: settled stories only (filings, regulator findings, court records, reputable outlets);
   every accusation attributed on screen; truth is the defence, "allegedly" is not.
2. **Licences**: every asset through `generator/media` and its licence log; the render fails on an
   unlogged asset; no identifiable stock person on a negative beat (Pexels); no trademark-centred
   Pixabay clips; press kits are editorial-only; logos only to identify, from Commons.
3. **Inauthentic content** (whole-channel): original scripts, our own graphics, real variety per video;
   never a narrated compilation of clips.
4. **Synthetic voice**: no real person's words in the TTS voice; quotes as text or documents.
5. **Global audience**: a beat on how the story went outside the US when it differs.
6. **Advertisers**: journalistic tone; no graphic detail of deaths.
7. **Partner programme**: 8,000 watch hours from 1 Feb 2027; long videos carry the channel there.
