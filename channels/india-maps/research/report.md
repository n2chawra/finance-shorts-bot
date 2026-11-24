# India Maps: niche report (24 Nov 2026)

A lean research pass (owner, 24 Nov: "do we need full research?"): the scan, every on-niche title labelled, four
references watched once with the sound measured, and the numbers from `npm run niche-research`. It reuses the
geography channel's flat map kit and its build lessons; nothing here is re-researched later.

## Scan

6 India searches (English, Hinglish, Hindi; region IN) and 3 references (Mihul Rawat, Ankit map, Gyano Trick):
45 channels, 3,363 Shorts and 2,434 long videos. 19 of the 45 are news, exam prep or general entertainment (India
Today, Times Now, StudyIQ, Drishti, UPSC Wallah, The Lallantop…) and are left out; 26 map and geography channels
remain (2,310 videos). Some of those channels also post exam tricks and motivation; those uploads are labelled
`off-niche` (681).

## Families (Shorts; `families.json`)

| Family | n | Median views | Hit rate | Median outlier | Direction | Tier |
|---|---|---|---|---|---|---|
| every-state | 350 | 93,755 | 26% | 1.63 | 2.70 | core |
| india-and-world | 18 | 184,742 | 27% | 2.45 | 4.39 | core |
| cricket-celebs | 21 | 158,772 | 27% | 2.04 | 19.94 | core (not ours) |
| physical-climate | 23 | 13,807 | 20% | 0.87 | 1.81 | core |
| india-through-time | 12 | 350,112 | 17% | 1.37 | — | low |
| state-vs-country | 62 | 38,377 | 16% | 1.25 | 4.73 | low |
| religion-communal | 73 | 107,137 | 16% | 1.20 | 2.31 | low (not ours) |
| state-formation | 65 | 138,597 | 16% | 1.13 | 1.42 | low |
| what-if | 153 | 32,546 | 9% | 1.10 | 3.86 | low |
| history-on-map | 116 | 95,965 | 11% | 0.83 | 17.43 | low |
| borders-neighbours | 118 | 40,409 | 13% | 0.91 | 14.95 | low |
| state-explainer | 49 | 27,022 | 9% | 0.93 | 5.36 | low |
| projects-rivers | 43 | 23,609 | 12% | 0.69 | 15.39 | avoid |
| map-basics | 27 | 8,578 | 12% | 0.50 | 1.10 | avoid |

Labels: rule-based by Claude, checked by reading the unmatched titles (`.niche-data/india-maps-label.py`, off main).
137 Shorts stayed `other`.

Long videos: few per family (under 12 each); borders and projects score high on 6–8 videos. Too thin to plan on.

## Style targets (`style.json`, 4 Shorts)

Length median 52.5 s (28–77); subject named by 1 s; a question at the start in 3 of 4; text on screen half the time;
camera moving in 69% of shots; maps in 15 of 21 shots; captions as sentences (3 of 4). Shot lengths are long (median
10 s) because the map keeps changing inside one continuous shot; our directed beats still change the picture every
3–5 s on spoken words. Build spec: `style-study/2026-11-24-references.md`.

## Sound

`research/sound.md`: dark cinematic beds 20–37 dB under the voice; 6–15 effects a minute (whooshes on moves, low hits
on key moments); one 4 s drop after the hook.

## Comments

The scan collected no comments for this niche, so viewers' requests could not be read. The every-state format
invites "mera state?" comments on its own; the poll end card is our way to ask.

## Risks turned into setup rules

1. **India's map**: official boundary only (J&K, Ladakh, Arunachal in full); a new India layer from an openly
   licensed source; QA fails any frame with a different India outline.
2. **Communal topics**: the profile bans religion-vs-religion, gods-by-state rankings, "invaders" framing, Kashmir
   opinions, parties and leaders; Partition and divisions only as sourced history with dates and lines.
3. **Low pay per view**: Shorts volume; long videos only after a 500K Short.
4. **Kokoro Hindi**: the owner picks the narrator by ear at 1.5×; captions and Hindi number words checked on sample 1.
5. **Reused content**: own scripts and own map art; never a translation of the geography channel's videos.
