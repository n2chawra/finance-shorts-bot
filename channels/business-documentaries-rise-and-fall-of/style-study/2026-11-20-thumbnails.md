# Long-video thumbnails: what gets clicked in this niche (20 Nov 2026)

The owner: "for long video the thumbnail is the only thing that makes users click after the impression; long videos are
our money machine." This is the playbook the Studio agent (`agents/studio.md`, "Three thumbnails") and the thumbnail
reviewer follow for every Craze & Crash long video. It adds to the Studio rules and doesn't replace them: `renderer.thumbs refs`
still finds the topic's own hits, and this file says which pattern to pick from them and how to draw it.

**Method.** I looked at about 80 thumbnails in the built-in browser. Nothing was downloaded. Each was viewed at about
180 px wide, which is close to phone feed size. The sources were the latest 30 uploads of Bagholder Association,
Fortune & Fall, Modern MBA, Magnates Media, ColdFusion, Company Man, GroBez, Ascendants, Wendover and Business Casual
(sorted by views, the hits set beside the same channel's flops), the scan's outliers (`research/scan.json`
`long.topIds`), the Crocs topic's own hits, and three search results pages ("why everyone stopped buying", "rise and
fall of a company", "why did this company fail"). View counts are as shown on 20 Nov 2026.

---

## 1. The patterns, ranked by evidence

### P1. The ruined product on a crash chart (strongest for us: no face needed)
The product is cut out and huge, and it is **damaged**: spilled, rusted, crushed, dusty or sad. Behind it a stock line
rises green on the left and crashes red on the right, ending in an arrow. It sits on an off-white grid-paper plate,
with 1–2 heavy black words across the top that give a verdict.
- `3Hp03-lSQRw` Pepsi "Is (Finally) Getting What They Deserve" **1.3M** (Bagholder, 10.9K subs, ~120× subs): a spilled
  Pepsi bottle, "NOBODY BUYS".
- `uhlWTcTUiQg` Krispy Kreme **734K**, `Stz7bzbHRV4` Gillette **655K** (a rusted razor), `dXAg22W25DM` Wendy's **464K**
  ("GREEDY", a melting Frosty), `XiVD6HLEiLU` Pizza Hut **256K** ("NOBODY EATS").
- `V6-3wqQoxT0` Labubu **2.2M** (Fortune & Fall, 6.5K subs, the niche's biggest outlier): the toy looks sad and fills the
  left half, a red chart arrow crashes across the top, the words are "WORTHLESS NOW" in white and red blocks, with the
  store behind.
- **The counter-evidence matters.** The same template flopped on the same channel: Party City `TJ2JRsLq7A4` 10K,
  Sriracha `KVhEUel93rM` 22K, and Atari `WbY4joeot5M` 12K (no chart, no words). A copycat of it got 354 views
  (`5_Li_xGpjNQ`). **The template doesn't make the hit. It makes a strong topic read in half a second.** The topic
  still has to be a product millions hold or have held.
- Use for: **craze** (Labubu, Stanley, Prime, Crocs), **crash**, **"greedy" price rises**, and the decline of a
  product people buy.

### P2. The brand, huge, with a verdict tag
The logo, packaging or storefront fills the frame on the brand's own colour. A tag in red or white gives the verdict:
"CLOSED?", "WHAT WENT WRONG?!", "DYING", "GAME OVER", "The Decline of… What Happened??".
- Company Man's whole catalogue: Crocs `JJO7hDTOMuA` **1.09M**, Gatorade vs Powerade 628K, Fazoli's 376K, Popeyes 332K.
- GroBez (12.6K subs): Dentonic `HIfcdMnw7Fc` **582K**, Q Mobile `6vTs9_bOobQ` **519K**, Haleeb `cSNKyBuLa4s` 326K. Each
  is a storefront or factory with the logo and a red "CLOSED?" tag (plus a host face, which we don't have).
- Search-page hits: Patanjali `Yx6jES9RV6E` **1.5M** ("DYING"), boAt `cnNCNBZvehk` **1.1M**, IKEA `K7yOhKXuRck` **925K**
  and Lululemon `yJ66cU4wF50` **829K** ("WHAT WENT WRONG?!"), `ohCAPyqlJpo` **3.1M** (a Deloitte tower, "GAME OVER").
- Use for: **"what happened to X"**, nostalgic brands and decline. It is weakest when the logo isn't instantly known.

### P3. The real person: one face, one reaction, dark and cinematic
A founder or CEO, close and big, lit dark, with 1–3 words or a small phrase, and sometimes a red crash line.
- ColdFusion (5.3M subs): Nvidia `PptRrzYY61w` **2.8M** ("It's getting worse."), OpenAI `-q2n5DkDoMQ` **2.2M**
  ("Whoops"), `7K_sA6o1dOE` **1.5M** ("$35 BILLION WIPED"), GoPro `25ckBnzay8Y` **1.3M** (a laughing founder,
  "WORTHLESS", a red crash line).
- Magnates Media (1.86M): Rockefeller `fNh_GyRbJDA` **7.7M** ("DARK TRUTH"), WeWork `c9Xm1bT50DQ` **2M**, PayPal
  `DwTK_VT54OY` 1.6M. These are painted portraits, centred, with villain lighting and money piles.
- Fortune & Fall PRIME `ktZkBA3VNKI` **128K** (20× subs): the bottle plus the founder looking worried, "GO BANKRUPT?".
- `AnOqz5TsumU` Boeing **1.3M** ("FALL OF BOEING", a grey face cut by a red slash).
- Use for: **scandal, fraud, a founder's ego**, and wars between two people. **It needs a freely licensed photo** from
  Commons with a strong expression. Most Commons portraits are calm and posed, so this pattern is often unavailable to
  us, and a calm face is worse than no face (`renderer/thumbs.py` CALM).

### P4. The figure jump, before → after (thin evidence: no million-view example in our sample)
Two prices or two numbers with an arrow between them. This is the one place a figure *is* the thumbnail.
- Stanley `IbRizya_h1w` **89K** (13× subs): "$45 → $400", a pink cup, auction paddles.
- Dollar Tree `QIpyVbNJybY` 159K ("$1 → $1.25"), DS Group "₹0 → ₹10,000 CR", WeWork "$47 BILLION → BANKRUPT".
- Use for: **craze resale prices, price hikes, a market-share collapse ("40% → 3%"), and valuation to zero**.

### P5. Versus: a split with two logos or two products
- Gatorade vs Powerade `P2V-vFct8FY` **628K**, Sega vs Nintendo `fHVbFtTbEgo` **378K**, Root Beer Wars 213K (Company
  Man), Adidas vs Puma brothers `QpNJcAEI-Ts` **1.6M** (Magnates; two faces under the two logos).
- Use for: **business wars**, and "the rival that won".

### P6. The immersive "economics of" scene
A real place, shot from the viewer's own eye line and packed with the product, with the topic named in a bold
title-style lockup.
- Modern MBA: Marijuana `niQ7mk13xew` **1.7M**, Buffets `PU1zr8ka-0s` **839K**, Self-checkout `oPeX6FO2zls` 721K, Texas
  BBQ 702K, Xbox `BJ3PhlQ609w` 651K. Their low end (GoPro `vJi0SzEws9s` 120K) uses the same style, so here too the
  style alone doesn't carry it.
- It is busy, and it works because the channel (848K) is trusted. For us it is **a later pattern** for industry and
  "how it makes money" stories, and it costs a big build.

### P7. The object with a feeling (pairs with P1)
A mascot or product given an emotion: the sad Labubu, Ronald McDonald as a clown (Magnates `MhspjNiER9Q` **2.9M**), an
angry Angry Bird (`R5LmR9xvSw0` 127K). Without a face on screen, **the product's own "face" carries the emotion**.

### P8. The document as the hero (weak: support only)
None of the ~80 hits led with a page of text. The one Crocs-topic hit with a document (`9Hf_ZnZF3EQ` 131K) leads with a
person. At 168 px a page reads as grey texture. **Our document device belongs in the video. In a thumbnail use at most
one magnified phrase or a stamp, never the page.**

### What the feed looks like (what we compete against)
On all three search pages most thumbnails have a **host's face**, **red with white or black heavy words**, and a logo.
Red is everywhere. What stands out among them: Bagholder's **off-white grid paper**, Company Man's **flat brand colour**,
and ColdFusion's **dark, quiet frame with small italic words**. We have no host, so we win with **an object that has
an emotion, on a plate that isn't red**.

### Which pattern for which story (A = first choice; B and C come from different rows)

| Story type | A | B | C |
|---|---|---|---|
| Craze (a product boomed and busted) | P1 ruined product + crash | P4 price jump | P7 sad mascot / P3 founder |
| Crash / bankrupt / closing | P1 | P2 brand + "CLOSED?" | P3 founder |
| Business war | P5 versus | P1 the loser's product ruined | P4 market share |
| Scandal / fraud | P3 face, dark (if Commons has one) | P1 + stamp | P4 valuation → zero |
| Comeback | P1 with a **V-line** (crash, then rise) | P4 then → now | P2 brand + "BACK?" |
| Industry / how it makes money | P6 scene | P4 | P1 |

The three must be **different patterns**. Test & Compare calls near-identical variants inconclusive, which the scout
found on 22 Oct.

---

## 2. Hard rules

1. **≤ 3 words** (4 only if one is a figure). Heavy condensed caps, cap height **≥ 12% of the frame height** (≥ 86 px
   at 1280×720). Test it: shrink to **168×94 px**. The words must read and the subject must be recognisable by its
   outline alone.
2. **One focal subject** filling **≥ 40%** of the frame, **cut out** from its background (white sticker edge or rim
   light, drop shadow). **Never a rectangular photo with its own floor or background** behind it. At most 3 things in
   all (subject, device, words).
3. **Emotion every time.** We have no presenter, so the emotion must come from: the product damaged (spilled,
   cracked, rusted, dusty, sinking), a red crash line or arrow, a sad or angry mascot, a reacting real face (never
   calm), or a verdict word (WORTHLESS, NOBODY BUYS, GREEDY, DEAD?, BANKRUPT?).
4. **Colour logic.** Subject and ground contrast in both colour and brightness (no black clog on dark wood, no blue clog
   on sand). **Red means loss** (line, arrow, tag), and **green only for the rise before it, or a comeback**. One
   accent colour on the words. Prefer a **non-red plate** (off-white grid paper, the brand's own colour, or charcoal)
   so we stand out in a red feed.
5. **Keep the bottom-right ~18% × 14% clear**: the duration stamp covers it. Keep 3% from every edge.
6. **Figures are short and true.** "$185M", never "$185.1M": a decimal is unreadable at phone size. At most one figure,
   only when the figure *is* the shock (P4). It comes from `tl.figures`, never typed.
7. **Honest words.** A verdict the video proves. When it is in doubt, it ends in "?" ("BANKRUPT?" for a company that
   only nearly was). The thumbnail never promises a different video from the title.
8. **Never**: a text-heavy document page as the hero, a busy stock photo as the whole frame, a calm portrait, two
   competing focal points, more than one colour of highlight, another channel's image, art or face, a logo or photo
   from anywhere but Commons (the real-photo rule), or a copy of a competitor's exact template (`5_Li_xGpjNQ` copied
   Bagholder and got 354 views).

### Title and thumbnail are one pair
- **The title says *what***: the subject plus the question, 60 characters at most ("Why Everyone Stopped Buying Crocs").
- **The thumbnail says *why click***: the emotion or the stakes in 1–3 words, sharing **at most one word** with the
  title (already checked by `spec_problems`).
- **Together they ask one question the video answers early**: title "Why everyone stopped buying Stanley" + thumbnail
  "$45 → $400" leaves the viewer asking "then why stop?".
- **Never restate the title's twist.** If the title says "(and Then Didn't)", the thumbnail must not say "THEN HUGE".
  It should show the low point.

---

## 3. Our three Crocs thumbnails (`videos/L-20261119-01/`) against the hits

Title: "Why Everyone Stopped Buying Crocs (and Then Didn't)". Studio's own scores were A 7, B 5, C 6, and it picked A.

**A, "NEARLY BUST" (green plate, photo card, red arrow, "LOST $185.1M"). Fair score: 6/10.**
What works: the brand-green plate is the most feed-distinct of the three, there are two words, and the red arrow
reads as a fall.
- The clogs are a **rectangular photo on a wood floor**, tilted like a card. At phone size, two black clogs on brown
  wood are one dark blob, and the subject doesn't separate from the plate. **Fix:** one clog, cut out (`python -m
  generator.media cutout`), in a bright Crocs colour that contrasts with the plate (lime or orange on charcoal, or a
  black clog on the off-white grid), filling ≥ 45% of the frame.
- No emotion on the product. **Fix (P1):** make it look dead: dusty, cracked, a crumpled "CLEARANCE" sticker on it,
  sitting at the bottom of a red crash line that turns up again (a V), the comeback the title promises.
- "NEARLY" is a hedge word and the weaker half. **Fix:** "ALMOST DEAD" or "WORTHLESS?". Both are true to 2008 and add
  emotion without repeating the title.
- The "LOST $185.1M" tag and the arrowhead sit in the **duration-stamp corner**, and the decimal is unreadable small.
  **Fix:** "−$185M" on a small red tag at the bottom of the V, upper middle, away from the bottom-right.

**B, "AUDITORS WORRIED" (the filing with the line ringed). Fair score: 4/10.**
The real filing is our signature, but at 168 px the page is grey texture (P8). The ring, the highlight, the words and
the photo card fight each other, and the inset clog has a blurred rectangle behind it.
- **Fix:** cut the page down to the one phrase, magnified ~4× ("SUBSTANTIAL DOUBT", highlighted), slightly tilted on
  charcoal, with a red rubber stamp "GOING CONCERN?" and a cut-out clog overlapping the corner. Or drop B for a **P4
  price** variant (the share price, peak → low, as two big figures from `tl.figures`), which is a different and
  testable pattern.

**C, "DEAD. THEN HUGE" (sand photo, empty beige half, red V line). Fair score: 5/10.**
The V-line tells the arc in one shape, the right idea for a comeback.
- The sand photo is busy, and blue clogs on sand are low-contrast. The right half is empty beige, and the line runs
  through the words.
- "THEN HUGE" **repeats the title's "(and Then Didn't)"**: it gives away the twist the title holds back.
- **Fix:** one cut-out clog at the bottom of the V on a full-bleed plate. Words: "DEAD?" alone, or "2008: DEAD". The
  line goes behind the clog, never through the words.

**Best next set for Crocs:** A = P1 dusty cut-out clog at the bottom of a V on off-white grid, "ALMOST DEAD", "−$185M"
tag. B = P4 share price peak → low. C = P2 the Crocs wordmark (Commons) cracked on Crocs green, "WHAT HAPPENED?".

---

## 4. Gaps in our kit to draw the winning patterns

Today `remotion/src/studio/thumb.tsx` has Glow, Face (the cast: off-brand for this channel, which has no cast), Thing
(flat cast props), Words, Arrow, Ring, Badge and Split. The doc kit already has the pieces to build on:
`generator.media cutout` (rembg), `doc/ProductStage.tsx` (die-cut PNGs), `doc/DocChart.tsx`, `doc/Annotate.tsx`
(stamp, circle, arrow) and `studio/photo.tsx`.

| # | Gap | Pattern | Size |
|---|---|---|---|
| 1 | **`<Cutout>`**: a licensed photo's cut-out (`<id>-cut.png`) as the hero, with a white sticker edge, rim light, drop shadow, scale/rotate/flip | P1 P2 P4 P5 P7 | **S** (pipeline exists) |
| 2 | **`<TrendLine shape="crash" \| "v" \| "spike">`**: a thick stylised line with a white edge, green → red segments, an arrowhead, behind or through the subject; shape from `maths` series or a preset | P1 P3 comeback | **S** |
| 3 | **`<Plate kind="grid-paper" \| "brand" \| "charcoal">`**: off-white grid paper, a radial in the brand colour, dark cinematic vignette | all | **S** |
| 4 | **Damage**: crack overlay, dust/grime, desaturate-to-grey, tilt and "sinking", a clearance sticker (a spill is harder) | P1 P7 | **M** (spill **L**) |
| 5 | **`<PriceJump from to>`**: two figure chips (`tl.figures`, short format "$185M") with a heavy arrow, the old one struck through | P4 | **S** |
| 6 | **Verdict blocks**: Labubu-style white/red block word, rubber stamp "BANKRUPT?" (reuse Annotate stamp), torn label | all | **S** |
| 7 | **Versus**: Split + "VS" badge + two cut-outs or logos facing | P5 | **S** |
| 8 | **Real-person cut-out bust** with grade (dark, contrast, rim light) and a red slash or crack, from a Commons photo; a check that the face isn't calm | P3 | **M** (often blocked by Commons supply) |
| 9 | **Logo cracking / greying** (a Commons wordmark split by a crack, half desaturated) | P2 | **M** |
| 10 | **Storefront + "CLOSED?" sign** over a licensed exterior photo | P2 | **M** |
| 11 | **Phone-size gate**: render at 168×94 and score word legibility and subject silhouette (extends `phone_metrics`); flag anything in the stamp corner | rules 1, 5 | **M** |
| 12 | "Economics of" immersive scene composite | P6 | **L** (later) |

**Order:** 1, 2, 3 and 5 first (all S). Together they draw P1 and P4, the two strongest patterns we can always make.

**Built (20 Nov):** `remotion/src/doc/thumb/` (README "Thumbnails" in `remotion/src/doc/README.md`): #1 `ProductHero`,
#2 `CrashLine`, #3 `Plate`, #4 `ProductHero` `damage` (crack, dust, grey; no spill or clearance sticker yet), #5
`PriceJump`, #6 `VerdictTag` (stamp and blocks), #7 `VersusSplit`, #8 `PersonCutout` (no calm-face check yet). Still
open: #9 a logo split half grey, #10 a storefront "CLOSED?" sign, #11 the phone-size gate, #12. Demos for Crocs (P1,
P2, P4): `samples/thumbs/`.

---

## 5. Scoring checklist (10 points) and the A/B plan

The Studio agent rates all three thumbnails with this checklist (`score` = points), and the QA reviewer re-rates them
on `thumbnail*.png` and `renderer.thumbs feed`. **Ship at ≥ 8. At 6–7, fix the named point. Below 6, redraw.**

1. **One subject ≥ 40%** of the frame, cut out, outline recognisable.
2. **Reads at 168 px**: words legible, subject named at a glance (look at the feed sheet, not the full-size PNG).
3. **≤ 3 words**, a verdict or the stakes, **≤ 1 word shared** with the title, the title's twist not given away.
4. **An emotion carrier**: damage, a crash line or arrow, a mascot or reacting face, a verdict word.
5. **The pattern fits the story type** (table in §1), and A, B and C are three different patterns.
6. **Contrast**: subject vs ground and words vs ground (passes `phone_metrics`).
7. **Colour logic**: red only for loss, one accent, the plate differs from the 4 neighbours on the feed sheet.
8. **Honest**: every word and figure is proved by the video; "?" when in doubt; figures from `tl.figures`, short form.
9. **Clean**: ≤ 3 things, the bottom-right stamp corner clear, 3% margins.
10. **Would a stranger click it over the hits beside it?** Title and thumbnail together ask one question the video
    answers in the first minute.

### A/B: what we can and can't automate
- **YouTube Test & Compare** tests up to 3 thumbnails, titles, or title + thumbnail. It picks the winner by **watch-time
  share**, not CTR. It runs a few days to two weeks. It is **only in YouTube Studio on a computer**, needs advanced
  features, and doesn't work on Shorts or private videos. The help page names no API, and the Data API's
  `thumbnails.set` sets one thumbnail only, so **our publish worker can't start a test**. The dashboard already tells
  the owner to upload all three in Studio (`apps/dashboard/src/app/queue/page.tsx`), and `improvement/evaluate.py`
  reads the logged winners.
  Sources: [Google: A/B test titles & thumbnails](https://support.google.com/youtube/answer/16391400),
  [Google: Test & compare thumbnails](https://support.google.com/youtube/answer/13861714),
  [Tubefilter, Jul 2025: titles added](https://www.tubefilter.com/2025/07/16/youtube-feature-test-and-compare-titles-thumbnails/).
- **Plan, best first:**
  1. **Owner runs Test & Compare** on each long video at publish with all three thumbnails (about 2 minutes in Studio),
     and logs YouTube's verdict on the dashboard. This gives the best signal, because watch time also punishes a
     thumbnail that over-promises.
  2. **When he doesn't**, an automatic swap (a proposal, not built). Publish with `thumbnail_pick`. After **48 h and
     ≥ 1,000 impressions** (Reporting API CTR, which `stats-deep.yml` already collects), if CTR is below the channel's
     long-video median (or below 4% before we have a median), `thumbnails.set` the next-ranked one (50 units) and
     measure the next 48 h, at most 2 swaps, then keep the best. Compare **browse-feature CTR** only, because search
     and suggested traffic shift with age, and treat it as directional (a time-sequential test).
  3. Log each result as `{pattern, story type, CTR, impressions, winner}` so the table in §1 is re-ranked from our own
     data after ~10 long videos ("own style first").

### Outside evidence (brief)
- YouTube's thumbnail spec: 16:9, at least 640 px wide; the help page recommends as large as possible (it lists
  3840×2160), 2 MB on mobile; thumbnails follow the Community Guidelines
  ([Google](https://support.google.com/youtube/answer/72431)). We render 1280×720, which is valid. Rendering 2× would be
  sharper on TV screens.
- The leaked MrBeast production guide (Sept 2024, reported, not verified) ranks **CTR, average view duration and average
  view percentage** as the three numbers, and starts a video from its title and thumbnail
  ([Tubefilter](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/),
  [Simon Willison](https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/)). For us, that means we
  design the packaging before the script, and the first minute must pay off the thumbnail's promise.
- Paddy Galloway (via summaries of his podcasts and posts): packaging is the difference between 1M and 28M views; make
  **3 thumbnail options** per video (only 20–30% of channels do); keep words to ~4–5 at most; the title and thumbnail
  together should raise questions in the viewer's mind; an educational video can show a picture that represents its
  theme even if that exact shot isn't in the video
  ([Colin and Samir](https://www.colinandsamir.com/resources/the-new-rules-of-youtube-from-paddy-galloway),
  [thread](https://threadreaderapp.com/thread/1874513765762531734)).
- 1of10 and vidIQ: I found no public, citable study on text amount or faces vs objects. 1of10 is an outlier-search and
  thumbnail-generation tool ([1of10](https://1of10.com/)). Our own outlier views above (Bagholder's hits vs flops, the
  354-view copycat) are the stronger evidence for this niche: **the topic and the emotion beat the template**.
