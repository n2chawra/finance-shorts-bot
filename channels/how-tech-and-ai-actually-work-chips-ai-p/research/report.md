# Niche report: How tech and AI actually work

The research behind `advice.md` (18 Nov 2026). Sources: `scan.json` (6 searches + 3 references → 45 channels, 3,924 videos), Claude's labels of every title (kept off main), 27 shot sheets (`sheets/`), comments under 12 long hits, and the build spec `style-study/2026-11-18-references.md`.

## Families (`families.json`)

Tiers: core ≥1.5× outlier or ≥20% hits; avoid <0.7×; gap = core and posted by ≤3 channels in 30 days. `science-body-nature` and `other` (2,335 videos together) are off-niche pulls from the "how does it work animation" search.

| Family | Kind | Videos | Median outlier | Hits | Median views | Channels, 30 d | Direction | Tier |
|---|---|---|---|---|---|---|---|---|
| internet-and-networks | long | 15 | 1.61 | 32% | 991 | 1 | None | core · gap |
| tech-history | short | 185 | 1.58 | 21% | 10,161 | 11 | 1.8 | core |
| ai-how-it-works | long | 22 | 1.27 | 34% | 1,336 | 3 | 11.36 | core · gap |
| chips-and-hardware | long | 36 | 1.09 | 20% | 131,628 | 4 | 2.39 | core |
| machines-vehicles | short | 630 | 1.05 | 21% | 8,621 | 24 | 39.55 | core |
| news-and-events | short | 16 | 1.36 | 10% | 6,004 | 5 | None | low |
| gadget-inside | long | 18 | 1.05 | 7% | 216 | 2 | 1.36 | low |
| chips-and-hardware | short | 75 | 1.03 | 19% | 3,811 | 9 | 0.18 | low |
| tech-business-story | long | 46 | 1.03 | 4% | 292,160 | 5 | 6.6 | low |
| ai-tech-skit | short | 81 | 1.01 | 18% | 1,137,384 | 1 | 28.4 | low |
| ai-how-it-works | short | 35 | 1 | 10% | 1,480 | 6 | 1.81 | low |
| science-body-nature | short | 1159 | 1 | 17% | 6,418 | 19 | 5.99 | low |
| machines-vehicles | long | 58 | 1 | 8% | 1,351 | 11 | 0.26 | low |
| news-and-events | long | 35 | 0.98 | 6% | 165,125 | 5 | 9.71 | low |
| other | short | 1102 | 0.96 | 14% | 37,952 | 22 | 31.76 | low |
| software-and-code | short | 86 | 0.95 | 6% | 1,606 | 4 | 5.06 | low |
| science-body-nature | long | 33 | 0.87 | 5% | 1,626 | 2 | None | low |
| tech-history | long | 12 | 0.83 | 8% | 312 | 5 | 0.02 | low |
| tech-business-story | short | 54 | 0.79 | 10% | 10,714 | 5 | 2.68 | low |
| other | long | 41 | 0.79 | 3% | 240,655 | 4 | 55.95 | low |
| internet-and-networks | short | 49 | 0.76 | 11% | 1,305 | 10 | 12.87 | low |
| gadget-inside | short | 123 | 0.72 | 11% | 1,655 | 11 | 16.63 | low |
| ai-tech-skit | long | 1 | None | 0% | 644,478 | 1 | None | unknown |
| software-and-code | long | 12 | 0.46 | 0% | 476 | 2 | None | avoid |

## Style targets (`style.json`, medians and middle half)

**Shorts** (19 sheets)

| Measure | Median | Middle half |
|---|---|---|
| durationSec | 72 | 58.6–97.4 |
| secPerShot | 5.64 | 5.07–12.17 |
| cutsFirst3s | 1 | 0–1 |
| firstFigureSec | 9.5 | 4–40 |
| subjectNamedSec | 0 | 0–1 |
| figureShare | 0.13 | 0.08–0.29 |
| characterShare | 0.12 | 0–0.56 |
| textShare | 0.45 | 0.26–0.99 |
| movingShare | 0.56 | 0.4–0.75 |
| motion | 1.43 | 1.2–1.81 |
| wordsPerMin | 151 | 144–166 |
| payoffAt | 0.52 | 0.3–0.72 |

**Long** (8 sheets)

| Measure | Median | Middle half |
|---|---|---|
| durationSec | 1271.75 | 870–1583 |
| secPerShot | 55.41 | 31.07–71.33 |
| cutsFirst3s | 0 | 0–0 |
| firstFigureSec | 16 | 6–38 |
| subjectNamedSec | 2 | 0–3 |
| figureShare | 0.16 | 0.09–0.28 |
| characterShare | 0.4 | 0.06–0.73 |
| textShare | 0.48 | 0.33–0.58 |
| movingShare | 0.49 | 0.39–0.73 |
| motion | 1.02 | 1.02–1.31 |
| wordsPerMin | 158.5 | 155–162 |
| payoffAt | 0.2 | 0.2–0.2 |

Picture language: Shorts are 10 of 19 3D animation; object shots dominate (141 of 218 Shorts shots). Long references mix 3D, doodle and footage. Captions: phrase captions in 14 of 19 Shorts; none in long videos.

## Sound

Measured with the yt-style probe on 5 references (Branch Education long and Short, ColdFusion long, Silicon Up Close long, Inside Decoded Short; the Professor Of AI reading came from an auto-dub track and is weak): a dark, low-brightness bed (348–463 Hz centroid), 18–26 dB under the voice, a 16–27 dB drop before reveals, 5–10 soft effects a minute in long videos and 10–30 brighter ones in Shorts; narration 150–200 words a minute. The channel's own `sound` spec is in the build spec; nothing is borrowed from Paisa Panchayat.

## What the comments say (12 long hits; paraphrased)

- **Asked for next:** the step from transistors to an AI answer; what one AI question costs in power and water; how AI serves billions at once; the machines that make chips; HBM and the memory wall; why RAM and SSD prices jumped; chip-to-chip links; cryptography keys; ray tracing; data-centre cooling.
- **Praised:** animation that shows the process happening (11 of 12 videos), clarity without dumbing down, vouched for by engineers (~10), zooms through scale (~6), a calm narrator (4).
- **Complained:** "beautiful but I still don't get it" when a causal step is skipped (~6); factual slips caught and upvoted (7 videos), including wrong drawings; in-video sponsors; suspected AI-made videos.
- **Audience:** US, UK, Australia; many engineers, students and retired computing people; no Indian or Brazilian cluster.

## Gaps

- **How AI works (long)** and **internet and networks (long)**: core with ≤3 channels posting in 30 days.
- **The full causal chain**: the most-praised hit (`oBKrR3i6jWM`) is also the most complained-about for skipping the step from hardware to answer. Our long videos never skip a step.

## Risks turned into setup rules

1. **Accuracy**: every claim sourced (manufacturer docs, papers, reputable press) and every diagram checked by the fact review; engineers watch and correct drawings.
2. **AI-made suspicion**: no tell-tale AI script phrases (the writer's banned list), a calm natural narrator, real depth. The craft must show.
3. **No rumours, reviews, hacking how-tos, AI hype stated as fact, or chip politics beyond sourced facts** (the owner's off-limits list).
4. **Not ours**: footage, presenters and viral clips are recreated in 3D and tagged "3D recreation".
5. **Quota**: about 1,886 units a day for this channel; the quota increase must be approved before 2 Shorts a day.
6. **One-channel demand**: AI skits are tested, not assumed.
