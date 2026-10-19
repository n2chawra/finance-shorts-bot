# Casual Finance (@CasuallyFinance), studied 2026-10-19

Why this channel: the fastest-growing animated finance channel found. Joined 17 Jul 2025; by
19 Oct 2026 it had 420K subscribers, 210 videos and 29.5M views. Long videos get 0.5–2.3M views
each; Shorts get 18–120K. Audience is US, topics are the US economy (housing, debt, markets).

Studied: the long video "The New American Housing Crisis Has Landed" (15:20, 2.3M views in 2 weeks)
and the Short "58% More Home Sellers Than Buyers... So Why Are We Still Paying More?" (62 s, 120K
views in 3 days). Watched in the built-in browser; 25 frames sampled; 33 s of sound measured with
`audio-probe.js` on the long video. Nothing downloaded. First study in this folder.

## Breakdown

| Area | What they do |
|---|---|
| Hook | Frame 0 is evidence, not a character: a news article zoomed to its headline, the stick-figure narrator beside it pointing with a stick. By 2 s a chart from the source is on screen with "58%" handwritten next to the rising line. The thumbnail promise ("This should've crashed") is answered with data in the first 5 s. |
| Pace | 12.6 picture changes a minute (probe), one every ~4.8 s. Between changes, something small moves: a doodle drawn in, a figure's expression changes, a highlight sweeps a sentence. Slower than our Shorts (3–5 s), similar to our long-video target (3–6 s). |
| Camera | Almost none. Slow pans down long documents; no punch-ins, shake or parallax. |
| Characters | One stick-figure narrator (round head, simple hair, thin lines), drawn as if by hand. Acting is just the face: worried, shocked open mouth, smug; holds a pointer stick or cash. A recurring **USA-shaped character with a face** stands for the country; small cartoon houses, a bank, money with legs. |
| Worlds | Plain white. No sets or depth. The "world" is the evidence: real report pages, charts and articles, full-frame. |
| Text | The source's own text, with the spoken sentence highlighted in yellow as it's read. Handwritten marker notes on top: big numbers ("58%"), short phrases. The Short adds handwritten-font word captions (we can't: no captions rule). |
| Numbers / data | Charts are the source's own, shown still; the drama is drawn on them: a red double arrow for a gap, a handwritten figure beside the peak, a green tick, a circle. Doodles draw on stroke by stroke in about 1 s. |
| Colour | White page, black ink, one highlight colour (yellow), red for bad and green for money and good. |
| Transitions | Hard cuts. |
| Ending | End card: "Subscribe for more", the channel name, a suggested video, and shout-outs to paying members. No disclaimer. The Short ends abruptly on a worried face (no call to action), which invites a replay. |
| Sound | Voice only. True silences (−50 dB) between sentences of 0.15–0.95 s: there is no music bed at all (voice 35 dB above the bass floor; ours keeps music about 13 dB under the voice). 1.8 sound effects a minute, none on cuts (0 of 7). Tempo and key unreadable because there is no music. A male US narrator, conversational, with natural pauses. |
| Thumbnail + title | A big serif headline in black on white ("This Should've Crashed."), a red line chart spiking to "2026", the US-map character and a small house. Titles are urgent and slightly ominous about the economy ("...Has Landed", "...Is Breaking", "Somebody Is Quietly Repricing America"). |
| Shorts | Cut from the long videos: the Short is the long video's opening, re-laid for 9:16 with captions. Shorts views run 1–5% of the long videos'; they act as trailers. |

## What makes it work

1. **Evidence first.** Every claim is shown on an official source with the exact sentence
   highlighted. It feels like being let in on something, not taught.
2. **Cheap art, strong acting.** A stick figure with three expressions and one pointer carries 15
   minutes because the documents and doodles carry the information.
3. **Urgent, recurring big story.** The US economy as an unfolding crisis, told weekly, with the
   country itself as a character.
4. **Long videos are the business.** Two long videos a week earn millions of views; Shorts
   are trailers for them.

## Mapped onto our kit

| Their technique | We have it? | Gap | Proposed change | Size |
|---|---|---|---|---|
| Source shown full-frame with the spoken sentence highlighted | `headline` beat and the "Data: <source> · <month>" line (`renderer/templates/long_story/README.md`) | No full-frame source view; no highlight sweep | A `source` scene: our own drawn document card (publisher name, title, date, the sourced sentence) with a yellow highlight sweeping each phrase on its word event, presenter pointing. Never a screenshot of the real page (no copied assets); the text comes from the feed's `facts` with its URL. | M |
| Hand-drawn marks on charts (circle, arrow, gap arrow, handwritten figure, tick) drawn on at a word | `screen` and `chart` callouts; a pulse circle in `data.tsx` | No marker layer that draws on stroke by stroke | A `marks` option on `screen`, `chart` and the new `source` scene: circle, underline, arrow, double arrow, tick, handwritten figure (from `maths` placeholders only), each with `at`. | S–M |
| Narrator points at the evidence with a stick | Presenter `point` pose (`remotion/src/cast/`) | No pointer prop, no aim at a target | A `pointer` prop and an aim target (callout id) for `point`. | S |
| The country as a character (US map with a face) | Sikka, the coin character | No country characters | Simple original country characters (US, UK, India) as cast props with faces, for economy stories. Experiment only. | M–L |
| No music bed; few sound effects | Music bed ducked 0.6 under the voice (`VOICE_DUCK`, `renderer/timeline/build.py`); SFX on most events | Our long videos may be busier to listen to than they need to be | A/B for long videos: music bed about 10 dB lower (or off under speech) and SFX only on reveals. Look and sound changes are judged on % viewed. | S |
| Shorts cut from the long video | Shorts and long videos are made separately | Shorts don't send viewers to long videos | Studio also makes a 30–45 s "trailer" Short from each long video's hook and best beat, re-laid for 9:16, linked to the long video. Feeds the watch-hours route to monetization. | L |
| Thumbnail: headline + spiking red chart + character | `Thumbnail.tsx`: words, figure, character | No mini chart | A `chart` option in the thumbnail block (a spiking line from `maths`). | S |

Left out: burned-in captions (our hard rule: no on-screen captions); screenshots of real articles
or charts (no copied assets; we redraw from sourced facts instead).

## Ranked by expected effect on % viewed

1. **`source` scene with a highlight sweep**, for news Shorts and long videos. Shows credibility at
   the moment of the claim. Demo: the US energy inflation news Short (`videos/v-20261019-03`).
2. **Marker marks drawn on charts at word events.** Gives a chart a reason to be watched second by
   second. Demo: `examples/short_story_kit.json` (its `screen` beat).
3. **Quieter or no music under long-video narration** (A/B). Cheap, and their 2.3M-view videos
   have none. Demo: the first long video.
4. **Pointer stick + aimed `point`** on presenters. Small, ties the cast to the data. Demo: any
   presenter beat.
5. **Trailer Shorts from each long video.** Not a % viewed change but the biggest growth lever:
   it turns Shorts views into long-video watch hours. Owner decision (it changes Studio's output).
