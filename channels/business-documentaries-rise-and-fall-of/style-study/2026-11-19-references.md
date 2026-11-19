# Build spec: the business-documentary references (19 Nov 2026)

One pass, read by the pack, the director and the kit builders; nobody re-researches it. Merged from four
watching agents' notes (`parts/w1.md` KFC + Modern MBA, `parts/w3.md` the small channels that broke out,
`parts/w4.md` the Shorts; `parts/w2.md` Company Man + Pepsi if it lands) and their 12 shot sheets in
`research/sheets/`. Watched in the built-in browser, nothing downloaded; techniques only, never their
words, footage or art. Long references were sampled (first 60–77 s closely, 6–10 moments after), so the
sheets' whole-video shot counts read low; the cut rates below are from the opening minutes.

| Ref | Channel (subs) | Views | Watched for |
|---|---|---|---|
| hJTqDdf4jQc KFC "losing America" | Bagholder Association (10.8K) | 591K | owner's favourite; the document device |
| PU1zr8ka-0s buffets, BJ3PhlQ609w Xbox | Modern MBA (848K) | 839K, 651K | archival-led long form |
| V6-3wqQoxT0 Labubu, IbRizya_h1w Stanley | Fortune & Fall (6.5K) | 2.28M, 84K | small-channel breakout |
| 6vTs9_bOobQ Q Mobile | GroBez (12.6K) | 520K | title/topic only (host on camera, not ours) |
| vBw4jNaJQ28, 2e7oAauw1os, kbT_upHAakE | Rise Fall Repeat (19.9K) | 2.28M, 487K, 314K | the Shorts |
| P2V-vFct8FY Gatorade vs Powerade, mrG4vD37Rqo Fazoli's | Company Man (1.8M) | 628K, 376K | wars and declines (`parts/w2.md`) |
| PptRrzYY61w, HwFT0SF_dZc | ColdFusion (5.3M) | 2.77M, 95K | sheets reused from the tech channel |

Company Man in brief: ~40% stock, 25% archive, 15% logos and products, 8% charts, 5% headlines; one brand
colour per video frames the pillarboxed old ads, charts and quote cards; the same chart for two years shows
the fall; hard cuts on the noun spoken (23 a minute in the hook, 4–6 s after); 187–190 words a minute, no
captions; decade or "Behind the Decline of" chapter cards; ends on 3 questions for the comments.

## 1. What the picture is made of (long)

| Kind | KFC | Fortune & Fall | Modern MBA | **Our target** |
|---|---|---|---|---|
| Modern stock footage | ~60% | ~40% | ~10% | **35–45%** (Pexels, Pixabay, Commons video) |
| Archival footage / photos | ~12% | 10–25% (photos, cut-outs) | ~80% (old TV ads, news) | **15–20%**: Commons, LoC, public-domain photos with an archival grade (no TV ads: not licensable) |
| Documents and headlines | ~12% | ~15% | a few clippings | **15–20%**: the core device (§3) |
| Motion graphics (charts, figures, maps) | ~6% + 5 chapter cards | ~25% | data cards | **20–25%**: our edge; build on the word |
| Person on camera | 0 | 0 | 0 | **0** |

`style.json` agrees: footage is the largest shot kind (64 of 140 measured long shots), then text cards
(20), charts (12), photos (8); `cast: false`, no burned-in captions on long videos.

## 2. How the picture is made (what happens on the spoken word)

- **Every shot moves.** Footage gets a slow push or drift (0.5–1.5%/s); stills get Ken Burns. Hard cuts
  only (no wipes); a cut every **~2.2 s in the hook, 3–5 s after** (KFC), ~3 s (Fortune & Fall: 19.9
  pictures a minute).
- **One look holds everything together**: one backdrop per channel (charcoal with a paper-texture card,
  or a grey grid), one accent colour, red only for losses. Rise Fall Repeat's lesson: one grade over every
  source makes mixed stock read as one film.
- **Old 4:3 or vertical sources sit on a blurred copy of themselves** (pillarbox blur), with an archival
  grade (desaturated, grain, slight gate weave) so they sit in their era.
- **A name spoken → its photo arrives**: B&W tilted polaroids that unblur, one per name; footage can
  freeze into a polaroid.
- **A figure spoken → it becomes an object that moves twice**: a count-up over dimmed footage; a resale
  listing card whose price flips with a red "−88%" tag; a split-flap ticker rolling down; a bar that sinks
  and leaves a dashed ghost of its old height; logo bars; a donut. The figure is never just typed big.
- **Overlays on footage**: date slam, place label (city · venue), name lower-third, source chip
  ("REPORT" / "ESTIMATE" + outlet name), red caption tag, a white label box lower-left for one spec.
- **Chapters**: 4–5 s silent cards: a small red "CHAPTER N:" over a big heavy-italic white title on a
  slowly pushing still, with a music drop (KFC); or label-maker tape (Fortune & Fall). Labubu had 9.

## 3. The document device (the channel's signature)

When a figure or claim is spoken, **the page that holds it is on screen**: an annual-report table, a
filing, a court document, an article. Off-white page, soft paper shadow, a 3–5% push to the line, then a
**yellow highlighter wipe across the exact sentence on the word** (~1.2–1.6 s, multiply blend, ragged
edge); the rest of the page can blur while the paragraph lifts. KFC's frame 0 is a report table with a cell
already highlighted. Quotes are typed-on cards with one phrase boxed.

Sources: SEC EDGAR filings (public; the fetcher renders the page to PNG), court opinions (public domain),
Commons scans, press releases (quoted and cited). **News articles and social posts are rebuilt as our own
typeset cards** carrying the real sourced sentence and "Source: <outlet>, <date>": never a screenshot of
someone's site.

## 4. The hook (long)

| | First frame | Subject | First figure | Shape |
|---|---|---|---|---|
| KFC | report table, cell highlighted | named 1 s | 0 s | global scale → fast foreign montage (0.7 s clips) → "but at home…" 19 s → ranking chart + highlighted article 26–36 s → paradox 45 s → question → Chapter 1 at 64 s |
| Labubu | auction-hall footage with the toy | shown 0 s | 8 s count-up | whole rise and fall in 60 s → "no rival did it, one decision did" → subscribe ask → title card |
| Stanley | a hand puts the cup in a car | shown 1 s | 7 s | "you've seen this cup" → sold out, stampedes → cool-down → "it wasn't luck" 67 s |

Rules: **the object on screen in frame 1**; the subject named by 1 s; a figure before 10 s; the fall
before 50 s; the promise of one cause by ~65 s; then a title or chapter card. `style.json` long:
subject named at 0.5 s median, first figure 7 s, payoff at 38% of the runtime.

## 5. Pace and voice

- Words a minute: **146 median** (137–165) across the long sheets; KFC ~131–150 with pauses, Modern MBA ~165.
  Kokoro ≈164 wpm per unit speed → voice speed ≈ **0.9** for long, ≈0.9 for Shorts (146.5 wpm median).
- Long length: references 989–2,313 s (median 1,071 s); the scan's best band is 15–25 min.
- Ending: the plain-words mechanism ("scarcity was the product"), a short lessons section, a comment
  question, a 20 s end screen. Modern MBA runs a mid-film sponsor read (later, for us).

## 6. The Shorts

- Rise Fall Repeat (the Shorts that broke out) are **AI stills** (not ours), but the method carries: one
  full-frame picture per sentence, a constant push, hard cuts every **~4.2 s** (33 shots in 140 s),
  first cut at 2.3–3.4 s, one grade over everything.
- **Hook**: the title and the first line state the same paradox; the end figure in the first 5 s; a claim,
  never a question. A famous brand + an underdog, misery stacked for 60–90 s, then the reversal.
- **The one big result** gets a gold "poster" card (giant gold figure, the cost in a subline) for ~7 s;
  every other figure only in the captions.
- **Captions**: 1–3 words at a time, bold white capitals, one key word yellow, no box, centred at ~64%
  of the height (our Shorts rule keeps them ≥340 px above the bottom edge).
- **Ending**: a spoken lesson tied to the viewer ("look at your clothes" over the product in everyday
  use, YKK) — matches the thing-in-your-hand rule; none loop.
- Their Shorts run 106–147 s, but the scan's on-niche Shorts do best under 35 s (54,049 median, 81 videos)
  vs 23,214 at 35–70 s and 10,846 over 70 s → **our Shorts 30–55 s**, testing longer in the weekly loop.
- Side find (not this format): Signal 404's 10–14 s "text post" Shorts (a fixed paragraph over one product
  clip) pulled 2.7M and 11.8M; a cheap second format to test later.

## 7. Sound (measured)

| | KFC (long) | Labubu (long) | Marvel Short |
|---|---|---|---|
| Music under the voice | ~22 dB | **36.5 dB** | voice 16 dB over the music's bass |
| Character | dark, 76 BPM, 600 Hz brightness, no highs | dark, 723 Hz, 8% bass, slow pulse | dark, bass-heavy, ~78 BPM, G minor |
| Ducking | ~7 dB | not measurable | ~7.4 dB |
| Effects a minute | ~5–8 (thuds on cuts, swishes) | 5.5, soft clicks/pops on objects, none on cuts | 21, mostly low booms; 20 of 33 cuts hit |
| Drops | 4 in 77 s (one under a chapter card) | none | 5 drops of 12–19 dB, ~0.6 s, after the hook and before reveals |

**Our targets** (`channel.json` `sound`):
- **Long**: a dark, slow (70–85 BPM), low-mid bed ~32 dB under the voice (KFC 22, Labubu 36.5, Company
  Man ~36 with ~29 dB ducking and ~2 effects a minute),
  music up in the cold open and under chapter cards; ~5–6 effects a minute, soft and placed on things
  arriving (a figure flip, a tag, a highlighter swipe, a document landing), a low thud on chapter cards,
  nothing on plain cuts; a drop before the chapter card and before the payoff.
- **Shorts**: the same dark bed, louder (~18 dB under the voice), a low boom on most cuts (~15–20 a
  minute), a 0.6 s drop after the hook and before the reveal.
- Never channel #1's beds or effects. Check levels on a Kokoro build (`music_under_voice_db`).

## 8. Kit gaps → build items

Done or in progress:
1. **Licensed media fetcher** — `generator/media/` (Pexels, Pixabay, Commons video, EDGAR page renders;
   licence log `media/licences.json`; `check` fails a script with an unlogged asset). Needs the owner's
   Pexels and Pixabay keys and a `SEC_USER_AGENT` role mailbox.
2. **Documentary editor** — `remotion/src/doc/` (footage, photo pan, document prop, headline, overlays;
   being built).

Still to build (from the three parts; order = what the first sample needs):
3. Highlighter wipe on a word + page focus/blur (`DocumentProp`), and our typeset article/filing/post cards.
4. Footage player options: pillarbox blur, archival grade, freeze-to-polaroid, dim + blur behind a figure.
5. Figure objects: count-up with unit line, listing-card price flip + loss tag, split-flap ticker,
   sinking bar with ghost outline, logo bars, donut, the gold poster card (Shorts). Values from `params.fig`.
6. Overlays: date slam, place label, lower-third, source chip, red tag, label box, chapter card (two looks)
   with the music drop.
7. Polaroid row (unblur per name), product cut-out stage (pallet/wall grid of N units from `maths`).
8. Channel backdrop (charcoal paper / grid), one grade preset applied to every source.
9. Shorts captions: 1–3 words, yellow key word, no box.
10. Fonts (OFL, owner OK to download): a heavy condensed display face, a heavy italic, an italic serif,
    a typewriter mono.
11. Sound presets (§7) and an end screen (20 s, long videos).
12. Optional sources later: Library of Congress and Prelinger (archival), CourtListener.
