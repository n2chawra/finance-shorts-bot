# India Maps: build spec from the references (24 Nov 2026)

One viewing, written once so nobody re-researches it (owner, 2026-11-18). Watched in the built-in browser:
Mihul Rawat "How Punjab was Divided" (LnFMoSO6s-s, 4.1M), Bharat Animatrix "Which Indian State Is Your Favourite
Singer From?" (M1w5mnFCgRg, 7.2M), QuickShot Maps' Alexander-in-India map story (Hd7_HnogBaE, 1.6M, 6K subs),
Shivang Verse "Indian ₹500 vs …" (VB9RJADsUg4, 2.6M). Shot sheets in `research/sheets/`. Technique only: never their
words, art, photos or voices.

## How the picture is made

**The base.** All four use a **relief or satellite base map** of South Asia (greens, browns, blue sea, shaded
mountains). Not a flat colour sheet like our geography channel. India sits on top as a **flat painted shape**:
one colour (Mihul: ochre) or flag stripes (Shivang). States are thin white or dark outlines.

**What happens on a word.** The map never sits still; each sentence changes it:
- a state or region **paints in** a new solid colour (orange, crimson, green, blue), outline first, then the fill;
- a **dividing line draws on** and the two sides take different colours (partition);
- the camera **pushes in** from all-India to one state and **pulls back** to show the result;
- a **big year label** (white, heavy, ~15% of the frame width) lands on the key date;
- a **round flag sticker** pops on the side that a sentence is about;
- routes draw as **red arrows** city by city (QuickShot), battle sites as orange shapes joined by arrows;
- objects and photos are **die-cut stickers** that drop onto the state (Bharat Animatrix: a person's photo with a
  name tag; Shivang: a banknote, foods, drinks piled onto a country shape).

**The every-state move (the core format).** Satellite India → fly to state 1 → it lights up in a colour → a sticker
(a thing, a food, a festival, a monument) and a Devanagari/English name tag stand on it → fly to the next. Every
visited state **stays coloured**, so the map fills up; the last shot pulls back to the whole map, fully coloured.
That end frame is the payoff and the loop.

**Labels.** State names in white uppercase Latin with a dark shadow (Mihul), or a small pill tag. Chapter titles
in **large gold or white Devanagari** at the top (QuickShot). Our map labels must be Devanagari or Hinglish to match.

**Captions.** Sentence captions in Devanagari, bottom, white on a dark bar (3 of 4). Our captions are word-by-word
from the voice timings; Devanagari, in the frame's safe zone.

**Cast.** No characters, apart from a few tiny pin figures marking crowds. Real people appear only as photo stickers.
Our version: Commons photos as die-cut stickers (CLAUDE.md "Real photos"), never their photos; no talking cartoons.

**Ending.** Either the fully coloured map (loop) or a **two-option comment poll** card ("what would have happened:
1 or 2", QuickShot). Both are cheap for us and drive comments ("mera state?").

## How it sounds

Measured with the yt-style audio probe (Mihul: 28 s; QuickShot: 40 s):

| | Mihul Rawat | QuickShot Maps |
|---|---|---|
| Voice share | 44% (pauses between short lines) | 41% |
| Music under the voice | **37 dB** under (barely there) | **20.5 dB** under |
| Music character | dark (centroid 388 Hz), ~110 BPM, low confidence | dark (327 Hz), cinematic, no steady beat |
| Effects | 15 a minute, mostly bright whooshes on map moves, a low hit on the opening and on the key date | 6 a minute, all low booms on chapter changes |
| Drops | music drops 32 dB for 4 s after the hook | — |
| Picture changes | continuous camera, 6 hard cuts a minute | 9 a minute |

Bharat Animatrix is music-only (no narration); Shivang is a fast narrator over a light bed.

Our `channel.json` `sound` follows from this: a **dark, low cinematic bed** (sub-heavy pads, slow pulse), sitting
**about 25 dB under the voice** (between the two; check on a Kokoro build: bedLevel ~0.16, duck 0.85, then measure
`music_under_voice_db`), **whoosh on every camera move or paint-in** and a **low hit on the key date or reveal**,
about 12 effects a minute, and a **pre-reveal drop** (about −18 dB for 0.5 s) before the payoff.
Our own beds only; never borrowed from another channel.

## The first second

Frame 0 is always the map: India already on screen (3 of 4), the subject named by 1 s, a question in the title or
the first line (3 of 4). Our rule: **frame 0 = India on the relief base with the subject state already lit**, first
line a question in under 12 words, the state named in the first two seconds.

## Kit gaps (build before sample 1)

1. **Official India layer** (`remotion/src/flat/india.tsx`, new, additive): India's official boundary (all of
   J&K, Ladakh, Arunachal) with 28 states and 8 UTs, from an openly licensed source (DataMeet's Survey-of-India-based
   shapes; licence checked and recorded in `credits.json`), simplified to SVG paths with Devanagari and English names.
   Never Natural Earth's India outline. Neighbours from Natural Earth, clipped to India's official border.
2. **Relief base** (new): a shaded-relief/hypsometric raster of South Asia from Natural Earth's public-domain rasters,
   cropped and colour-graded once into `remotion/public/maps/`; no clouds (owner rule from the geography channel).
3. **Paint-in and split moves** on the India layer: outline draw → fill (`k` 0→1), recolour, a line that draws and
   splits a region into two fills, states that stay coloured (fill-up map).
4. **Sticker drops**: Commons photos and drawn objects dropping onto a state with a name tag (reuse
   `remotion/src/studio/photo.tsx` stickers).
5. **Year label and flag sticker** (reuse `flags.tsx`).
6. **Poll end card** (two numbered options and a comment prompt; Devanagari).
7. **Hindi text**: Devanagari in Poppins (glyphs present); captions from Kokoro Hindi timings (check
   `words_from_phonemes` on Hindi); numbers spoken as Hindi words by code.
