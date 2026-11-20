# Long-video thumbnails for A Billion Switches (20 Nov 2026)

Owner, 20 Nov: "for long video the thumbnail is the only thing that makes users click after the
impression; long videos are our money machine, so thumbnails have to be the best." This page is the
playbook the Studio agent and the thumbnail reviewer follow for this channel. It replaces nothing in
`agents/studio.md` or the long_story README. Where those rules assume a cartoon cast (Paisa
Panchayat), the channel rules here take over for this channel (section 2.4).

**What I looked at** (built-in browser, viewed and not downloaded): about 60 thumbnails on the
channel pages of Branch Education, Silicon Up Close, Asianometry, ColdFusion, Veritasium, Real
Engineering, The Engineering Mindset, Kurzgesagt, TechAltar, Wendover and Ben Eater. I also read the
YouTube search results for "how does a cpu work", "how gps works", "whats inside a smartphone",
"how does chatgpt actually work" and "how undersea internet cables work", and checked two of the
small-channel outliers from `research/scan.json` (the niche-data branch: 329 long videos, 29
channels). Browsing stopped at the owner's "enough data".

**How strong the evidence is:** P1–P3 are strong (several hits each, including 10–180× outliers).
P4–P6 are medium (big views, but from big channels, so the outlier ratio is near 1). P7 and P8 are
**thin** (one or two examples each, and partly from other niches). Lemmino, Joe Scott,
Computerphile and Linus Tech Tips weren't viewed. The rules on the cap-height floor and the
bottom-right corner are my own judgement, not measured. Outlier means views ÷ the channel's median (the scan's `outlier`). Where I note no id, I
read the video off the channel page and didn't capture its id.

---

## 1. The patterns that get clicked, ranked by evidence

### P1 · INSIDE: the familiar object cut open, its interior lit (strongest)
The object everyone knows (a chip, a phone, a drive) with a window cut into it or its lid off. The
inside glows warm against a dark outside, often with a word like "INSIDE" in 1 to 3 huge stacked
words on the left.
- `oBKrR3i6jWM` Silicon Up Close, "What Happens Inside an AI Chip When You Ask a Question": **1.0M
  views on 12.7K subs (42.8×)**. A chip package sliced open to show a lit, city-like interior, with
  "INSIDE ONE CHIP" in 3 words.
- `r9qDcQ_b50k` Silicon Up Close, "What Happens Inside a CPU in One Second?": 464K (18.7×). A CPU
  macro with "1s INSIDE A CPU".
- Branch Education: "How does Computer Hardware Work? [3D Animated Teardown]" 3.9M (a PC case with
  the side off and glowing parts); "How do SSDs Work?" 6.4M (the drive with its lid off, the board
  exposed); "How does Starlink Work?" 9.8M (the dish cut away to show its layers).
- **Use for:** every "what happens inside X when you Y" video, which is the channel's core format
  (profile.md), and every chip, gadget or data-centre topic.

### P2 · The hero object, glowing, plus one verdict word
One object, very large (50–70% of the frame), lit dramatically on near-black, with an emissive
part blooming (the die, a laser, LEDs). The text is 1 to 2 words that judge it ("UNCOPYABLE?",
"Black Magic", "We cracked it"). The words never describe the object.
- Silicon Up Close, "Why Is Nvidia's AI Chip So Hard to Copy?": 105K in 2 days (13K subs), a
  glowing chip with "UNCOPYABLE?".
- Branch Education: "How do Graphics Cards Work?" 7.9M; "How do Video Game Graphics Work?" 5.4M
  (light streaks over a die); "The $200M Machine that Prints Microchips" 2.4M (the EUV machine
  glowing blue).
- Veritasium: "The Insane Real Engineering of the Nazi Enigma Machine" 22M ("We cracked it");
  "The Scariest Chart in Electrical Engineering" 6.9M ("Black Magic").
- **Use for:** a single famous machine or product (NVIDIA's chip, the EUV machine, a Raptor engine,
  a Starlink dish), and "why is X so hard / so expensive" stories.

### P3 · Scale shock: tiny against huge, or a magnifier inset
The object next to something of known size, or a circular loupe that blows up a detail to show
it is impossibly small or large. The figure, if there is one, sits on the thumbnail and not in the
title.
- `9kM3mnxrMMM` Branch Education, "How do microSD Cards Store 2 TB in such a TINY space?": **1.56M
  in 88 days (2.41×, the channel's best recent outlier)**. The card's layers stacked up, with "2 TB".
- Branch Education, "Technology Size Comparison": 1.6M (a magnifier over "14 atoms").
- `5DmLxVhCYBI` Silicon Up Close, "How Did Phone Cameras Get This Good?": 271K (11.3×), the lens
  stack pulled out of a phone, with "THIS TINY?".
- Veritasium, "Why does every mammal get 1 billion heartbeats": 6.9M ("1 Billion").
- **Use for:** transistor counts, nanometres, storage density, the size of a data centre or a
  rocket, and power and water per AI question.

### P4 · Exploded stack: the parts floating apart in order
The product pulled apart along one axis, each layer lit. It works **only with a hook word or an
odd part highlighted**. A plain exploded phone is a commodity: in "whats inside a smartphone", the
AI-made exploded phones with no hook had 6 to 99 views, while Branch's "What's Inside a
Smartphone?" had 970K.
- Branch Education: "How does Bluetooth Work?" 10M (earbuds exploded beside a huge Bluetooth glyph);
  "How does a camera work?" 1.5M (the lens elements exploded).
- Silicon Up Close, "THIS TINY?" (above); Branch, the microSD layers (above).
- **Use for:** gadget-inside topics (earbuds, phone camera, SSD, battery, Face ID module).

### P5 · A becomes B: a transformation split
Left, the raw thing (sand, a sentence, electricity); right, the result (a 2 nm chip, an answer, a
picture), with an arrow or a seam between them. It is the visual form of "from X to Y".
- `lvcAvPjZwxo` PROCESS BHARAT, "Semiconductor Chip कैसे बनती है? रेत से 2nm Chip": **2.2M (181×,
  the niche's biggest long outlier)**. Sand on the left, a glowing chip on the right, "SAND TO CHIP".
- The Engineering Mindset, "How a CPU Turns 1s and 0s Into Everything You See": 511K in a month
  (logic gates on the left, a die photo on the right, "1s & 0s").
- **Use for:** "how it's made" and causal-chain videos: sand to chip, a prompt to an answer, a
  photon to a pixel, a keystroke to a packet.

### P6 · One labelled secret: the object, an arrow, and the part that matters
The object at mid-size, one thick arrow or beam to the one part the video is about, and a 1 to
2 word label on that part. It promises "I'll show you the part you didn't know was there".
- Veritasium, "Fiber Optics are so much cooler than I thought": 16M (a hand holding a fibre, a
  green laser, "How?").
- Branch Education, "How does a Mouse know when you move it?": 5.3M ("WHAT DOES YOUR MOUSE ACTUALLY
  SEE?" with a red beam out of the sensor).
- Real Engineering, "How We Could Reach Proxima Centauri B in 20 Years": 651K (arrows labelled
  "EARTH" and "20% Lightspeed").
- The Engineering Mindset, "The 1.25V Trick": 376K (an arrow and "Genius").
- **Use for:** mechanisms with one clever trick (the 3 nm air gap in a hard drive, Face ID's dot
  projector, GPS timing, ECC memory).

### P7 · Stakes: the object under threat
The machine with something going wrong: a cut, a fire, a predator, a red warning glow. The text is
an emotional verdict. It gets the biggest numbers in AI and internet topics.
- Kurzgesagt, "AI Just Crossed the Terrifying Line": 24M ("WE LOST CONTROL" over a red eye).
- `0bhqsQ6nHqs` "Who's Destroying Undersea Internet Cables?": 1.9M (a shark biting a glowing cable).
- ColdFusion, "Why Building AI Data Centres Isn't Working Anymore": 1.6M; "WORTHLESS" and "$35 BILLION
  WIPED" style words.
- **Use for:** "what happens if X fails" stories, cable cuts, power and water costs, overheating,
  the memory wall. Only when the video really covers the risk: the profile bans AI hype stated as
  fact.

### P8 · Odd one out in the feed (a challenger, not a default)
A thumbnail that looks unlike everything else beside it. A white background in a dark feed, a
metaphor object in place of the real one, and hand-written words.
- `vIM9qCyfVmg` Xplained with MUSH, "How AI works, Explained with Mushrooms": **622K on 2.3K subs
  (589×)**. Two mushrooms on white, one with the OpenAI knot, and "THEY ARE DUMBER THAN U THINK".
- It works because the AI search feed is a wall of logos, robots and presenter faces (Kyle Hill
  1.4M, Arvin Ash 615K, Till Musshoff 273K). Test it as the C option on an AI topic. Don't make it
  the house style.

**Not for us:** a presenter's face with a reaction (ColdFusion, TechAltar, Kyle Hill), because the
channel has no presenter and no cast (`channel.json` `look.cast: none`). Also the archive-photo
brand template (Asianometry: a photo plus green caption boxes, 4.1M at the top), which works
on years of brand trust we don't have. The vidIQ breakout study finds a face in 69% of breakouts
across all niches. In this niche's explainers, the objects win: every pattern above is
object-led, and the two biggest small-channel outliers (42.8× and 181×) have no face.

**What the feed looks like.** Searches for a topic (CPU, GPS, cables) return a wall of saturated
blue and yellow with big "How do X work?" text, plus generic satellites over Earth (GPS: four
results at about 1M with near-identical globes). Branch's dark, lit hero object stands out in
every one of them. Our edge is the same dark stage with one warm glow, and words that add
something instead of repeating the question.

---

## 2. Hard rules

### 2.1 Picture
1. **One focal object, 40–70% of the frame**, the video's real subject, placed centre-right.
   At most 3 things in all (the object, one detail or comparison, one arrow or loupe).
2. **It must read at 160 px wide.** Shrink it to 168×94: the object's silhouette is recognisable
   and the words can be read. The existing phone metrics in `renderer/thumbs.py` stay (contrast
   ≥ 45, edges 0.15–0.5).
3. **Dark ground, one warm light.** Use the near-black navy stage (`backdrop: "void"`), the subject
   rim-lit, and one emissive accent that blooms (amber or orange by default; cyan for cold or
   network topics; red only for the stakes pattern). Never an all-blue frame: the feed is blue.
4. **The inside is brighter than the outside.** In P1, P4 and P6 the brightest pixels are on the
   part the video explains.
5. **True to the video.** The thumbnail shows a frame the video can show (the profile:
   "a wrong drawing is a factual error here"). No invented parts, no fake figure, and no part
   the video never opens.
6. **Keep the bottom-right corner clear** (about 22% of the width × 16% of the height: YouTube's
   timestamp sits there) and keep the words 4% clear of every edge.

### 2.2 Words
7. **0–3 words; 4 is the hard maximum** (the spec check already fails 5). Silicon Up Close's hits
   use 2–3, Veritasium's 1–2. The vidIQ study puts most breakouts at three words or fewer, counting
   the thumbnails with none.
8. **The words add to the title and never repeat it** (at most one shared word, as checked now).
   Good: a verdict ("UNCOPYABLE?"), a scale ("2 TB"), a time ("1 SECOND"), a place ("INSIDE"),
   the stakes ("ONE CUT"). Branch puts its title question on the thumbnail, but it has 2.78M
   subscribers of brand to lean on. We don't.
9. **Big:** the cap height is at least 11% of the frame height (≥ 80 px at 720). Use a heavy
   condensed sans in white with **one** word in yellow, stacked 2–3 lines on the left, with a dark
   shadow. Don't use thin strokes.
10. **A figure only from `tl.figures`**, and only when the scale is the hook (P3). A digit goes on the
    thumbnail, not in the title: the 19 Nov scout found titles with a digit hit less (10% vs 15%).

### 2.3 Title and thumbnail as one pair
11. **The title names the object and asks:** "What Happens Inside an AI Chip When You Ask a
    Question". Question titles hit 23% vs 10%, and "inside" / "what happens" titles 24% (scout,
    19 Nov).
12. **The thumbnail shows the picture of that question, unanswered:** the object opened at the
    moment of the question, never the answer. The words add the stakes or the scale, never the
    result.
13. **Name the object once.** If the title names it, the thumbnail shows it rather than writing
    it (exception: "INSIDE" + one noun, as in P1).
14. **The scale words agree** (the existing check): a "billion" title gets no "million" on the
    thumbnail.

### 2.4 Rules for this channel that override the cast-based ones
15. **No face, no `expression`.** The README's "the face reacts and takes a third of the height"
    rule is Paisa Panchayat's. Here the object is the subject. Leave `who`, `pose` and
    `expression` out of the spec (the spec check only fires when `expression` is set).
16. **References:** 3+ from this topic's own sheet (`python -m renderer.thumbs refs <id>`) as now.
    If the topic sheet has fewer than 3 at 100K+, take the nearest same-pattern example from section 1 and
    say so in `why`.

### 2.5 Never
- A robot, a glowing brain, binary rain, a circuit-board stock texture as the whole picture, or a
  floating chatbot logo for AI topics (that's every weak result in the AI search).
- A plain exploded product with no hook word or highlighted part (6 to 99 views in the phone search).
- More than 4 words, two text colours besides white, or text over the object's lit part.
- The answer, or the payoff figure, on the thumbnail.
- Another channel's image, logo, character or exact layout. Copy the pattern, never the picture.
  Company logos only as the photo rule allows (a freely licensed file); the chip's shape tells
  the story without the logo.
- A thumbnail that promises a risk, a scandal or a prediction the video doesn't deliver
  (the profile's no-hype rule; the comments punish it).

---

## 3. Our existing thumbnails

**No long video has been made yet** (`videos/` holds only the Shorts `v-20261118-02`,
`v-20261119-01` and `v-20261120-01`, and Studio is blocked by `from_short`: longform/2026-11-19.md).
So there is no long thumbnail to critique. The one 3D thumbnail we have is the Short cover of
`v-20261119-01` ("CANDY BAR → MICROWAVE?"). It shows what the 3D kit produces today and where it
falls short of a long thumbnail:

| What it does | Fix for long thumbnails |
|---|---|
| Words: 3, big, white and yellow, a question (good) | Keep: P2/P3 typography |
| The candy bar (the subject) fills under 20% of the width; the microwave reads, the bar doesn't at 160 px | Subject 40–70% of the frame, the camera pushed in (rule 1) |
| The bottom third is flat grey floor; the light is even, with no rim and no bloom | Dark void ground, rim light, one emissive accent (rule 3) |
| A translucent half-disc artefact (the turntable's ghost) over the subject | Thumbnail frames are chosen or posed for the thumbnail, not a frame lifted from the timeline |
| It shows the setup; the inside (the waves) is hidden | P1/P6: show the magnetron or the standing wave lit up, with an arrow |

**The system as it stands.** `remotion/src/studio/thumb.tsx` and `LongThumbs.tsx` are a 2D
cartoon kit built for finance (cast faces, money props, grid, ladder, extremes, face). None of the
eight patterns above can be drawn with it. Section 4 lists what's missing.

---

## 4. Kit gaps (S = under a day, M = 1–3 days, L = a week or more)

| # | Gap | For | Size | Notes |
|---|---|---|---|---|
| 1 | **3D thumbnail path**: a `LongThumb3D` composition (1280×720) that mounts the video's own `Thumb3D.tsx` inside one `<Stage3D>` (the look pass on: bloom, ACES, vignette), with the 2D `Words`/`Arrow`/`Ring`/`Badge` laid over it as an overlay, rendered as a still with `--gl=angle` (PC, 2–12 s) or `swangle` (cloud, one still is fine). `renderer/thumbs.py` renders A/B/C through it and keeps its checks | all | **M** | The biggest gap. The parts exist in `remotion/src/three/` (Hero, Cutaway, Explode, ScaleCompare, LookMorph, `glow()`), but no thumbnail can use them. Also needs `chromiumOptions.gl` in `scripts/render.ts` (three/README "Pipeline wiring") |
| 2 | **Hero lighting preset for thumbnails**: a key light plus a strong rim, a warm/cool split, a dark falloff, the emissive part pushed to bloom, a shallow depth of field on the background, and a camera at about a 3/4 view, close | P1 P2 P4 P6 | **S** | One `thumbLook` preset on Stage3D; today's frames are evenly lit (section 3) |
| 3 | **Cutaway window on a known product**: a rectangular or irregular cut into a package, phone or drive, the inside lit (die floorplan, cells, platters), the cut edges bright | P1 | **M** | `Cutaway.tsx` cuts planes; it needs a "window" mode plus interiors that read as a lit city at small size (the 42.8× hit) |
| 4 | **Loupe / magnifier inset**: a circular lens with a thick rim showing a second render of the detail at 20–1000×, with a leader to the spot | P3 | **M** | Two renders composited, or a render-to-texture inside the scene; pairs with `ScaleCompare` and `ScaleBadge` |
| 5 | **Split A→B composite**: two 3D subjects (or a 3D and a 2D one) left and right, a seam or a fat arrow, each lit in its own colour | P5 | **M** | `Split` exists in 2D; it needs two stage renders in one frame or one scene posed as two islands |
| 6 | **Thumbnail typography**: a heavy condensed display face (OFL, e.g. Anton or Oswald 700, in `assets/fonts/`), a stacked-left mode with 2–3 lines and one yellow word, a shadow without the thick black stroke, and a cap-height check ≥ 11% | all | **S** | `Words` today: Poppins 900 with a stroke of 8% of the font size, readable but cartoon-styled |
| 7 | **Per-channel thumbnail rules**: the spec check reads the channel pack (`cast: none` → no face rule; a focal-area check from the probe: subject bbox ≥ 40%; the words' cap height; the bottom-right corner clear) | all | **S** | `renderer/thumbs.py` `spec_problems` + `image_problems` |
| 8 | **Photoreal product fidelity**: PBR materials good enough for a glossy package, a lens stack or a PCB at full thumbnail size (clear coat, anisotropic brushed metal, real glass refraction, an environment map built in code) | P1 P2 P4 | **L** | The hits are near-photoreal renders. Ours read as clay and glossy. Worth it only after #1 to #3 prove out |
| 9 | **Stakes props**: a severed, sparking cable, heat shimmer or a red overheat glow, an alarm light | P7 | **S–M** | Small additions to `Proc.tsx` and the `glow()` presets |

Build order: #1 (it unlocks everything), then #2, #6 and #7 (one day together), then #3, and
then #4 or #5 for the topic in the queue.

---

## 5. Scoring checklist and A/B plan

### 5.1 The 10-point score (1 point each; Studio scores, a reviewer with fresh context re-scores)
1. **Pattern:** one of P1–P8, named, with 3+ references from this topic's sheet.
2. **Focal:** one object fills 40–70% of the frame and it is the video's subject.
3. **Phone size:** at 168×94 you can tell what the object is and read every word.
4. **Words:** 0–3 (4 max), adding to the title, sharing at most one word with it.
5. **Curiosity gap:** the picture poses the title's question (opened, tiny or huge, threatened,
   transformed) and doesn't answer it.
6. **Light and contrast:** dark ground, the subject rim-lit, one emissive accent, the phone metrics
   passed, never all blue.
7. **Stands out in the feed:** in `python -m renderer.thumbs feed <id>`, differs from the 6 hits
   around it in colour or composition, and doesn't look like a generic AI-made explainer.
8. **True:** it shows something the video shows; any figure comes from `tl.figures`; nothing
   hyped.
9. **Clean:** bottom-right corner clear, words ≥ 4% from the edges, no text over the lit part,
   no artefacts.
10. **Ours:** the channel's look (dark stage, warm glow, the same type), not a copy of
    any reference, and not the same composition as our last 3 long thumbnails.

Ship only a thumbnail scoring **8 or more**. If none reach 8, fix the weakest and re-score once.
`thumbnail_pick` is the highest score; on a tie, pick the stronger point 5. Write the score per
point in `why` ("1,2,3,5,6,7,8,10 = 8; missed 4: 5 words").

**The three options must differ in pattern**, as Studio already requires. Default set for a
"what happens inside X" video: **A = P1 INSIDE, B = P3 scale or P6 labelled secret, C = P2 hero
plus verdict** (or P8 on an AI topic, or P7 when the stakes are real).

### 5.2 A/B plan
- **YouTube Test & Compare** (YouTube Studio, long videos only): up to 3 thumbnails, and since its
  2025 expansion titles too. The winner is picked by **watch-time share**, not CTR, and labelled
  "Winner" (statistically significant) or "Preferred". A test runs for a few days to two weeks.
  I found no Data API endpoint for it, so it is set by hand in Studio. That means the owner does it,
  or the dashboard agent does it in the owner's Chrome (memory: dashboard actions in Chrome).
- **Every long video ships with all three in a test:** upload A (the pick) through the API as now,
  then start Test & Compare with A, B and C within the first hour after publishing. Don't change
  the thumbnail while the test runs.
- **Logging (a proposal: nothing is built):** when the test ends, record `{video, A/B/C pattern,
  result, watch-time shares}` in `channels/<channel>/metrics/thumb-tests.json`. stats-deep's
  impressions and CTR per video (Reporting API) add the CTR side.
- **Learning rule:** after 6 tests, rank the patterns by wins. A pattern that wins twice in a row
  becomes the default A. One that loses 3 times is dropped from the defaults (it is still allowed
  when a topic's sheet demands it). If none has 6 tests yet, the ranking in section 1 holds.
- **Sanity bar:** a long thumbnail under 3% impressions CTR after 48 hours (with 1,000+
  impressions) gets the runner-up swapped in if no test ran. The 11 Nov finance long video had
  4 clicks from 100 impressions, and that is the level we need to beat.

---

## Sources
- YouTube Help, [A/B test titles & thumbnails](https://support.google.com/youtube/answer/16391400) and [Test & compare thumbnails](https://support.google.com/youtube/answer/13861714): up to 3 options, winner by watch-time share, "Winner"/"Preferred" labels, not for Shorts.
- YouTube Help, [Add video thumbnails](https://support.google.com/youtube/answer/72431): 16:9, 1280×720 recommended (older version of the page).
- vidIQ, [YouTube thumbnail study](https://vidiq.com/research/youtube-thumbnail-study/) (500 breakouts, June 2026): face in 69% (80% of the top 50), text in 72%, 28% no text, 24% one to three words, a median of 5 words among those with text. It describes correlation, not cause; it has no niche-level figures.
- Search Engine Journal, [Do faces help YouTube thumbnails?](https://www.searchenginejournal.com/do-faces-help-youtube-thumbnails-heres-what-the-data-says/563944/): about 300K viral videos; faces roughly neutral overall, with the effect depending on the niche.
- Tubefilter, [MrBeast's leaked production guide](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/): CTR, AVD and AVP as the core metrics, and titles and thumbnails as critical components (an unverified leak).
- Paddy Galloway, secondary summaries only ([Colin & Samir](https://www.colinandsamir.com/resources/the-new-rules-of-youtube-from-paddy-galloway), [Creator Science](https://podcast.creatorscience.com/paddy-galloway/)): packaging as a title–thumbnail pair that opens a curiosity gap. No primary figures. 1of10: I found no public study on text vs no text.
- Our own data: `research/scan.json` + the niche-data branch (18 Nov), `longform/2026-11-19.md` (the title findings), and the channel pages and YouTube searches viewed on 20 Nov 2026 (view counts as shown that day).
