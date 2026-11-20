# Advice: disasters and engineering failures (20 Nov 2026)

Sources: `families.json` (1,230 titles labelled out of 4,149 scanned), `counts.json`, the shot sheets and build spec
(`style-study/2026-11-20-references.md`), and `comments.md`. Every figure below comes from those files.

**How to read the medians:** the on-niche medians are pulled down by about 12 new tiny channels (6–842 subs) that
each post many low-effort videos and get 9–285 views. A family's **outlier** (×) and **hit rate** say more than its
median. The bar is the well-made channels: Fascinating Horror 635,479, Plainly Difficult 401,670 and Fault Lines'
1,941,409.

## Topic kinds to make (long videos, 8–10 min), ranked

| # | Kind | Numbers | Share of month 1 (~15 long) | Our example titles | Hits it rests on |
|---|---|---|---|---|---|
| 1 | **Recent crash, reconstructed** (days to weeks old, from official statements, ATC and ADS-B data) | core: 1.37×, **30% hits** (44 long); the 1 Nov Learjet 60 crash got 1.9M (Fault Lines), 3.1M + 2.8M (Flying for Money), 8.3M (Captain Steeeve) within 3 weeks | **whenever one happens** (fast lane, takes the next slot) | "The Last 90 Seconds of …", "What the Radar Shows About …" | dcfldWqanJc, Ayk__UBphmU |
| 2 | **It went wrong**: rides, stunts, amateur engineering, fairground and stadium failures | **core: 1.93×, 409,809 median** (13 long); a gap (few channels post it) | **3 of 15** | "The Ride That Was Never Tested at Full Speed", "The Stunt That Ignored Its Own Maths" | NiIZ8SU_bis, Szjrjma49JM |
| 3 | **Rail crash** | 1.04×, 15% hits, **154,694 median** (10 long) | **3 of 15** | "The Signal That Showed Green", "Train Driver Couldn't Hear the Warning" | 2l3_547XTdY, Y5NuJDMYKlU |
| 4 | **Air crash, minute by minute (historic)**: ends on the rule it created | 1.05× on all channels (27); Fascinating Horror's Eastern 212 got 2.4M | **3 of 15** | "The Rule Written After This Crash", "Could Any Pilot Have Saved It?" | _blF6L04Dfk |
| 5 | **Bridge, dam or building: every corner cut** | 0.84–1.0×, 13–14% hits; Plainly Difficult 629K, 561K | **3 of 15** | "Every Corner Cut: The Flyover That Fell", "The Brand-New Dam That Failed" | plYQ-StbrOE, zjSuCwk8f1A |
| 6 | **Space mission failure** | core: 1.59× (11 long); a gap | **1 of 15** | "One Unit Mistake Lost a $125M Spacecraft" | qfCTDPMFLfQ |
| 7 | **Ship sinking / maritime, industrial** | 0.93–0.99×, 11–13% hits | **2 of 15** | "The Ferry That Sailed With Its Doors Open" | QCzC7H1HttY |

Rules from the hits and the comments: **one disaster, one cause chain, one rule that changed** (top comments: "rules
are written in blood"). Hold the death or survivor figure for a turn, never in the title. Explain the physics
properly (viewers write long technical comments). Add one named human moment.

## Shorts (the owner's plan: 1 promo Short per long video)

- Each Short is the long video's moment of failure: 30–50 s, a 3D shot, ending on a question the long video answers,
  with the long video linked as the Short's related video.
- The Shorts families that work: **flight-sim what-if** (core, 1.58×, 870,502 median, a gap), **air crash explained**
  (core, 1.59×), **how engineering works** (core, 1.52×, 24% hits, 88 Shorts). The 3D look carries Shorts in this
  niche (Athena_Explains 7.45M, Inside Decoded 2.09M, World explained 2.56M).

## Kinds to avoid

- **Natural disasters explained**: long 0.66×, Shorts 0.61×.
- **Building collapse or fire Shorts**: 0.62×.
- **Fictional miniature disaster FX**: 0.61×, and fiction is off our true-only rule anyway.
- **Pure "how engineering works" long videos without a failure**: 1.0× long, but the hits are failure stories.

## How many to post

| | Code's advice (`counts.json`) | Owner's plan |
|---|---|---|
| Long videos | 2 a week ("11 small channels had a long hit, hit rate 11%") | **one every 48 h (~3.5 a week)**, 8–10 min |
| Shorts | 3 a day (hit channels post ~1.5 a day, +1 for the weekly loop) | **1 promo Short per long** |

The owner's numbers win. Note: the weekly loop needs about 8 Shorts a side to judge a test, so with ~3.5 Shorts a week
the Shorts tests run slower (judged on long videos' first-minute hold instead). Each long video is one Studio run
(Max-plan usage), so ~3.5 runs a week.

## Length

Owner's choice: **8–10 min** (480–600 s). The data's best band is 10–15 min (on-niche median 775 vs 285 for 6–10 min,
16% hits). 8+ min keeps mid-rolls. The references sit at 9–11 min (Fascinating Horror 11, Plainly Difficult 9–10,
Fault Lines 10), so 9–10 min is the sweet spot inside the owner's range.

## The first second

- Open **at the moment of failure** (or one beat before it) with a date, place and altitude/speed caption, then cut
  back: "To understand why, we go back …". Fault Lines opens on the jet cruising with "35,000 FEET · NOVEMBER 1, 2026".
- First line ≤ 15 words, naming the vehicle or structure and the time: a clock is the hook.
- A reconstruction label in the corner from frame 1 when the shot is realistic 3D: "3D reconstruction · not actual
  footage".

## What the verdict got wrong

- "Low supply" holds only for **well-made** videos: the bottom of the niche is flooded.
- **Breaking crashes** are the biggest single opportunity and were missing from the verdict: they need a fast lane
  (a video within 2–5 days of a crash, sourced from official statements and flight data, labelled preliminary) and a
  follow-up when the preliminary report lands (a two-part story).

## The look

Full detail is in `style-study/2026-11-20-references.md`. The references are a starting point, not a template (owner,
20 Nov): we keep what works (the hook, the pacing, a clock or instrument during the failure) and beat them on the picture.

- **The picture language of the hits**: 3D reconstruction (all 3 measured Shorts and 2 of the long references), flat
  engineering diagrams (Plainly Difficult), maps and route paths, and mono date/altitude captions. No presenter, no cast:
  real people appear as licensed photos only (`style.json`: `cast: false`).
- **Every kit in every video**: 3D for the moment of failure and the vehicle or structure, flat 2D for cross-sections,
  force and cause-chain diagrams, and maps, and the doc kit for the real investigation report page with the finding
  highlighted, plus licensed photos.
- **Where we beat them** (8 upgrades): 3D models of the actual type, not a generic jet; the failing part shown in a
  cutaway at the moment of failure instead of a cut to black; one continuous world moving between kits; labels that
  draw on the spoken word; the story's own live instrument; the real report on screen; designed sound; a new look every video.
- **No repeated look** (owner): 10 look recipes (Night Grid, Blueprint, Clay Studio, Chalk Site, Investigator's Desk,
  Instrument Panel, Storm Weather, Archive Rebuild, Satellite Atlas, Engineer's Cross-Section). Each video draws one,
  never one of the last 4, with a code gate in the build. Constant across looks: the honesty tags, the mono label
  system, and red always meaning the failure.
- **Honesty tags**: "3D reconstruction · not actual footage", "as reported", "general principle". The references use
  them on almost every shot, and YouTube's synthetic-content rules want them.
- **Sound** (`sound.md`): a beatless low drone about 33 dB under the voice that rises between sentences, real silence
  before the failure, then one sub-boom; ≤3 effects a minute in long videos; mechanical foley. Voice about 134–164 wpm
  (Kokoro speed ≈0.85–0.9).
- **Pace caveat**: the long sheets were sampled, so `style.json`'s long seconds-per-shot (≈57 s) is not a real target.
  Use the measured cuts a minute instead: 2.5–5.6 (one 3D move ≈11 s; Plainly Difficult holds longer).

## Build items (step 4)

- **Large:** a disaster 3D hero library (jet, train, ship hull, bridge, dam, building by type); 3D terrain or towns from map data.
- **Medium:** `Failure3D` (stress colour, shear, hinge, buckle); the path ribbon with its drop curtain; instruments driven
  by `maths`; the engineering cross-section kit; cloud, sea and smoke; transitions between kits; two beds and their effects.
- **Small:** `ForceDiagram` + `CauseChain`; tag presets and `Callout3D`; report sources in the media fetcher; a
  `CauseBoard` ending; a clay material; 9:16 camera presets for the promo Short.
- **Render:** 3D only at the key 60–120 s, or render those beats on the PC.
