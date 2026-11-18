# Advice: How tech and AI actually work

From the full research of 18 Nov 2026: 3,924 scanned videos, every one labelled into 12 families (`families.json`); 27 reference videos watched frame by frame (`sheets/`, `style.json`); comments under 12 long hits; the build spec in `style-study/2026-11-18-references.md`. Every figure below comes from those files. Video ids link as `https://youtube.com/watch?v=<id>`.

## 1. Topic kinds to make (core first)

| # | Kind | Format | The numbers | Share of month 1 |
|---|---|---|---|---|
| 1 | **Inside the chip / hardware**: what happens inside X when you Y | long | median 132K views, 20% hits, only 4 channels posted in 30 days, rising (2.4×) | 2 of 4 long |
| 2 | **How AI actually works** | long | 34% hits (the best rate), 3 channels in 30 days (a gap), rising fastest (11.4×) | 1 of 4 long |
| 3 | **Internet and networks** (cables, satellites, wifi, data centres) | long | 32% hits, 1 channel in 30 days (a gap); thin data (15 videos, median 991) | 1 of 4 long |
| 4 | **Invention Shorts**: how a thing you use was invented | Short | tech-history 1.58×, 21% hits; its modern inventions (142 Shorts) median 22K, 25% hits | ~40% of Shorts |
| 5 | **The zoom Short**: one scale dive or one exploded part, cut from that week's long video | Short | Branch Education's Shorts of this kind: 140K–1.0M (`_gbDFq5h9KI`, `VUPxowV0fsk`, `Bez-2cvYja0`) | ~40% of Shorts |
| 6 | **Machines that are tech** (EVs, rockets, drones, power) | Short | core: 21% hits, median 8.6K, but crowded (24 channels) | ~20% of Shorts |

Our example titles (our own words):
1. "What Happens Inside Your Phone When You Unlock It With Your Face" · "How a Chip Factory Prints 100 Billion Switches on One Chip" · "What Happens Inside a Graphics Card in One Frame". Rests on `oBKrR3i6jWM` (1.02M, 12.7K-sub channel), `r9qDcQ_b50k` (447K), `9kM3mnxrMMM` (1.56M).
2. "How an AI Turns Your Question Into an Answer, Every Step" · "Why AI Makes Things Up" · "What One AI Question Really Costs in Power and Water". Rests on `vIM9qCyfVmg` (622K, 2.3K-sub channel), `oBKrR3i6jWM`. The comments ask for exactly the step from transistors to an answer, which `oBKrR3i6jWM` skipped.
3. "How Your Message Crosses the Ocean in a Tenth of a Second" · "How Starlink's Flat Dish Aims Without Moving". Rests on `cKnwkxItL2M` (5.5M), `DW-aL_MiUz4` (4.6M).
4. "The First Computer Mouse Was Made of Wood" · "Why Your Keyboard Isn't in ABC Order". Rests on `XFY7-td3LA8` (35.6M), `ZDhDxu5eNig` (6.6M), `qylpF98bjZI` (4.0M). The family's ancient-craft videos (water wheels, wood repair) are left out.

**To test, not make yet: AI skit Shorts.** A 3D character acts out a gag about AI (`-8XlWwznPHE`, 18M). Their median is 1.14M views, but all 81 come from a single channel (Professor Of AI). Its tier is low (1.01×), and the demand may be that channel's own audience rather than the format. It goes into the first look tests (`cycle/backlog.json`) once the 3D character exists.

## 2. Kinds to avoid

- **Software and code, long**: 0.46×, 0 hits in 12 videos.
- **Gadget-inside Shorts** (0.72×, median 1.7K) and **internet Shorts** (0.76×, median 1.3K). These topics work long and fail short.
- **Tech-business stories**: 4% hits long, 0.79× Shorts. The big medians (ColdFusion 1.2M) belong to big channels, and the format is footage-led.
- **News, rumours, unreleased products, reviews**: the owner's off-limits list.

## 3. How many to post

| | Research (`counts.json`) | Owner's request |
|---|---|---|
| Shorts a day | **1**: channels with a Shorts hit post about 0.8 a day | 2 |
| Long a week | **1**: 4 small channels had a long hit (10% hit rate) | 1 (10–15 min) |

**Recommendation:** launch at 1 long video a week and 1 Short a day, and go to 2 Shorts a day once the YouTube quota increase is approved. This channel needs about 1,886 units a day; about 7,536 of 10,000 are already used. At 1 Short a day each weekly-loop test takes about 16 days instead of 7.

## 4. Shorts, long or both

**Both, long-first.** Long videos earn the money and give small channels their breakouts: 4 of 8 tech channels under 100K subscribers had a long hit. Most Shorts are cut from that week's long video (its best zoom or exploded part, 45–60 s), so each one also trails the long video.

## 5. The look

- **3D, not flat.** 10 of 19 reference Shorts are 3D animation, and "object" shots outnumber everything else (141 of 218 Short shots, 90 of 218 long shots). The look is a lit 3D object on a dark studio stage, a camera that never stops, labels pinned to parts, and one accent colour. The 3D engine session is building it (`remotion/src/three/`).
- **No recurring cast** (`style.json`: `cast: false` for Shorts). The long references' character share comes from one doodle channel. A 3D character appears only in the skit test.
- **Not ours**, and what replaces it: footage and stock clips become 3D recreations (with a "3D recreation" tag, as `pBBBNOUxDh4` does); talking heads and presenters become the narrator over objects; news clips become a lit document prop with its source line; viral real clips are recreated in 3D.
- **Craft is the selling point.** Commenters praise "real animation in a sea of AI slop" and catch drawing errors. A wrong diagram costs more here than in any of our other niches.

## 6. The first second

- **The subject is on screen from frame 0** (84% of Shorts name or show it by 2 s), and the frame is already moving and strange: a phone shattering into layers, a chip seen as a city, a car upside down mid-loop.
- **At most 2–3 words on screen.** The calmest opening (a product resting on a plain backdrop) was the weakest Short watched (48K).
- **A figure in the first 3 s is rare** (11%); the hits open on the picture. Long videos show the first figure at about 16 s and put a big comparison within 10 s ("your phone does more maths in a second than…").
- **Pace**: Shorts change shot every ~5.6 s with ~151 words a minute; long videos run ~158 words a minute, with a promise (a map of the video) by about 60 s and the first payoff at about 20% in.
- Loops: 26% of Shorts and 38% of long videos end where they began.

## 7. What the verdict got wrong

- **Shorts aren't uniformly thin.** Invention Shorts have a median of 22K and zoom Shorts reach 140K–1M; the 4.0K median was all tech-titled Shorts together.
- **The AI-skit demand rests on one channel** (81 of 81 skits), so it is a test, not a core format.
- **The audience is US, UK and Australia, not India**: no Indian or Brazilian cluster in the comments, and many engineers and students. USD, an American narrator, and claims an engineer would sign off.
- **Internet and networks long** ranks core on thin data (15 videos); judge it by our own first one.
