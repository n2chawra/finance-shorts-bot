# Style study: the tech and AI references (18 Nov 2026)

Four watchers worked in the built-in browser: frames sampled, 0.2–1 s bursts, word timings read from each video's own transcript (counted, never kept), sound measured with the yt-style probe. Nothing was downloaded. Shot sheets are in `research/sheets/<id>.json`; measured targets in `research/style.json` (19 Shorts, 8 long). This merges `.niche-data/tech-spec-{branch,cf-asia,shorts,long}.md`. Technique only: never their art, words, characters or audio.

## What was watched

| Channel | Long | Shorts | Partial or missing |
|---|---|---|---|
| Branch Education | C8YtdC8mxTU (owner's favourite; probed 0–77 s, frames to 21 min) | _gbDFq5h9KI (probed), VUPxowV0fsk, Bez-2cvYja0, V8m9UTl9aqw, bUt19gIN7jM | 9kM3mnxrMMM first 47 s only, no sheet; N_6k_jd5pnA, TfhL5kBiQVI not watched |
| ColdFusion | PptRrzYY61w (probed 73–163 s), eXXwN_TDdLU, e2zjpCqTmyo | HwFT0SF_dZc, aGLsZCeblcs, 7NrUaYGSZgU, dUqfSHOUgP0 | |
| Asianometry | HUBB8DoiB80 (not probed) | | 3nTpW52nioI and 4 Shorts not watched; channel never probed |
| Silicon Up Close | oBKrR3i6jWM (probed 52–117 s; ad hid ~200–295 s), r9qDcQ_b50k (ad hid ~360–430 s; not probed) | | |
| Xplained with Mushrooms | vIM9qCyfVmg (probed 130–272 s; sparse after 2 min) | | |
| Niche Shorts | | Professor Of AI -8XlWwznPHE (probed), n8MwM1H5q5o, RVNLQh1ykeE; Inside Decoded pBBBNOUxDh4 (probed), WIF1fFTU4LI, rkM1MKuIy-0, jg--ayui56w; Business Insider tDjrFOKRAVw; Algorithmswithpeter s-D0jm9j7H0; AI Tech 3.7 rHk5j8d8yog | AI Tech 3.7 probe dropped after 18 s (tab taken) |
| Not covered | The Space Race DW-aL_MiUz4 (length only), Business Insider cKnwkxItL2M | | |

## Picture

Our models are Branch Education and Silicon Up Close: objects as the actors, a camera that never stops, scale as the story. ColdFusion and Asianometry are 80–90% footage and photos; from them we take only graphic moves (chart hook, lit documents, equivalence chains, chapter rhythm). style.json agrees: 141 of 219 Shorts shots are `object`, 10 of 19 Shorts are 3D animation.

| Technique (where seen) | What we have | What we build |
|---|---|---|
| Hero object alone on a studio floor before the line (Branch, Inside Decoded) | `Stage3D`, `Proc` (board, chip package, die, FinFET, phone) | Dark studio preset, reflective floor, bloom, real depth of field |
| Exploded view on the key noun, 1–1.5 s ease-out; lift-out from a repeating field (Branch, 5 of 6) | `Explode` | `Lift` variant (rise, shadow, label, sink) |
| Cutaway / wall dissolve as the camera dives in, ~3× scale in 1 s, motion blur | `Cutaway`, `Camera3D` | Shell fade, motion blur |
| One continuous scale dive with a label per level; every big figure restated at body or city scale (Branch, Silicon) | `ScaleZoom` | Instanced fields, scale badge, `ScaleCompare` |
| Look morph on one shot: textured → glowing wireframe → clay → textured (Branch hook) | none | `LookMorph` |
| Glowing paths: beams off mirrors, data streaks, metro-map pipelines | `SignalPath` | Beam bounce, node labels |
| Overlays on the word: force arrows, bouncing pointers, the answer glowing, scan dome, radar rings (Inside Decoded, Prof. of AI) | none | `Pointer3D`, `Highlight`, `ScanDome` |
| Magnifier bubble with scale bar (Branch) | none | `Inset3D` |
| Dark photoreal places to fly through: server aisle, wiring tunnel, fin hall, atom lattice (Silicon) | none | `Place3D` library |
| Line chart drawing on, camera following the pen, dive with loss label (ColdFusion hook) | none | `LineChart` |
| Equivalence chain with a trucking camera (ColdFusion) | none | `EquivChain` + tech icon set |
| Lit document, spoken sentence lit, highlighter pass (ColdFusion) | none | `LitDoc` + source chip |
| Dark UI cards: one per spoken item, named one turns gold, compare pairs, giant figure + timeline (Silicon CPU film) | flat kit (bright, cartoon) | `CardDeck` on a dark base |
| 3D skit: character mid-problem, one readable action per 1.5–3.5 s beat, one-colour silhouette extras (Prof. of AI) | `Character3D` "Byte" (6 poses, faces) | More poses, walk, `Extras` |
| Photo cards sliding in on names (ColdFusion) | `photo.tsx` | Board layout + slide-ins |

**Pace.** Shorts: a new picture every 3–5 s (style.json 5.6 s per shot; probes 17–19.5 cuts a minute), one continuous move in the first 3 s, and on a spoken list a change per item (0.3–0.5 s bursts). Long: style.json's 55 s per shot counts continuous moves as one; by eye Silicon changes every ~4 s, ColdFusion 4.7 s, Branch holds a diagram 10–40 s while something moves. Transitions are zooms, match cuts and morphs; hard cuts mainly in bursts.

### Base look

- **Studio:** near-black navy (~#0B0E14), faint perspective floor grid, glossy reflective floor for showroom objects. A light variant (pale grey-blue gradient) only for a clean "how it works" diorama. No grain or texture.
- **Light:** soft key + rim, volumetric shafts in places, shallow depth of field close on chips; a hook may open out of focus.
- **Materials:** brushed aluminium, glossy black plastic and glass with one moving streak, copper wiring, red-brown silicon, iridescent wafer, white/grey matte clay for "how" models, x-ray glass shell.
- **One accent: amber (~#FFB23E)** for figures, the named item, signals and the answer that glows; everything else steel grey and white. Between Silicon's copper/gold and ColdFusion's orange, and not Paisa Panchayat's caption yellow.
- **Fonts (SIL OFL; need download into `assets/fonts/` and the owner's OK):** display/figures Barlow Condensed SemiBold–Bold (alt. Oswald, Bebas Neue); labels/captions Inter (alt. IBM Plex Sans; Poppins fallback); tags JetBrains Mono or IBM Plex Mono.

### Labels and figures on the word

- Labels: thin light sans, white, leader line ending in a dot, writing on with their noun (`Label3D`).
- Figures: long videos use a lower-left condensed-caps label that fades and rises over 0.5 s on the spoken number, with underline and grey source line, held ~6 s. Also: a count-up pinned to the scene, a dimension bracket on the part, a curly bracket counting layers. Shorts use a top pill. Never a separate number card in 3D. Every value from `params.fig`.
- Honesty tags: small mono caps lower left ("ILLUSTRATION", "OUR MODEL"), a mode badge top left while a scale trick runs; "Data: <source> · <month>" in the same style.

## Shorts

**First second.** Frame 0 is already moving and strange: an object doing the impossible, a character mid-problem, or the camera mid-dive or pull-back. The subject is visible or named at 0 s (style.json median 0; by 2 s in 84%). At most 2–3 words in the first second (a label or one slammed word). The figure waits (by 3 s in only 11%; median 9.5 s), as our recipe wants. Never a still hero object: the phone-on-a-void open was weakest (48K).

**Skit staging.** Wide on the whole situation → low cut to one figure → punchline as one action on one line; 1.5–3.5 s a beat, one big body action. Props explain (a scan dome sweeps, a chat answer pops over a phone, the answer glows). Extras are one repeated figure in one flat colour. Explainer shots between gags use x-ray shells, arrows and rings.

**Pace.** ~150 words a minute (style.json 151; Branch 130–150). Picture every 3–5 s. Payoff around halfway (median 0.52). Ours loop to the first frame (26% of references do).

**Captions.** 14 of 19 references use phrase captions: 2–5 words, white bold, thin outline, no box, ~5% of frame height, at ~60% height. Ours: 2–4-word phrases, white, figures amber, no box, ending ≥340 px above the bottom; one big slam word in the hook only.

**Length (owner decision).** References run 59–97 s (median 72). Paisa Panchayat's 28–35 s rule is from its own data; propose 45–60 s to start and let the weekly loop decide.

## Long (12–16 min)

| Part | When | What |
|---|---|---|
| Hook | 0–10 s | The viewer's everyday act plus one staggering comparison drawn as a picture; subject named by 2 s, an awe figure by 10 s (Silicon at 6 s). No title card; no sting over 2 s |
| Promise | by 60 s | The route: "by the end you'll know X, Y, Z"; tease two images that return later |
| First payoff | 40–75 s | A small one, early (Silicon 1:12, CPU film 0:44) |
| Chapters | 7–10 × 60–120 s | Each a scale step deeper, or build the machine then run it; chapter card = one word on a dimmed scene; named in the description |
| Turn | 65–75% | The surprise that flips the picture |
| Ending | last 60–90 s | Climb back out, total the count, echo the first line; at most one comment question |

Voice 155–165 words a minute (style.json 158). No burned-in captions (0 of 8). 2–3 places per chapter, camera always gliding.

## Sound

| Video | Bed under voice | Duck | Effects/min | Tempo, brightness | Drops |
|---|---|---|---|---|---|
| Branch long | 23.9 dB | 17 dB | 4.7, low thuds | 146 (73), 348 Hz, bass 0.40 | 3, 16–27 dB, ≤4.4 s |
| Branch Short | 25.9 dB | n/a | 12.3, bright, front-loaded | 140.5, 433 Hz | none |
| Silicon long | 23 dB | ~5 dB (reads low) | 6–10 est. | unreliable, 364 Hz | |
| ColdFusion long | 18 dB | | 5–8 by eye (probe 31, news audio) | 125, 463 Hz | 25 dB, 3.3 s |
| Prof. of AI | 22.5 dB (auto-dub) | | 10.5, low thuds | 156, 389 Hz | 0.4 s, 15–19 dB |
| Inside Decoded | 39 dB | | 32, bright | 128, 819 Hz | 0.3–0.45 s silences |
| Mushrooms | no music | | ~3 | | 0.2–0.5 s silences |

**Recommended `channel.json` `sound`:**

```json
"sound": {
  "_why": "measured on the references 2026-11-18 (style-study/2026-11-18-references.md): dark ambient-electronic bed ~24 dB under the voice, ~12 dB duck, 6 effects/min long and 12 in Shorts, machine sounds only, a drop before each reveal",
  "genres": ["circuit", "datahall"],
  "bedLevel": 0.36,
  "duck": 0.9,
  "sfx": ["whoosh", "swell", "tick", "glass", "thud", "pop"],
  "transitionSfx": "whoosh",
  "maxSfxPerMinute": 12,
  "longSfxPerMinute": 6,
  "preRevealDrop": { "db": -20, "sec": 2.0, "shortSec": 0.4 }
}
```

- **Genres (new):** `circuit`, a dark pulse with a soft arpeggio and almost no kick, 70–75 BPM half-time (140–150 full); `datahall`, an ambient drone with high shimmer, 60–66 BPM, for long chapters. Both dark (350–450 Hz, bass share 0.2–0.3). Distinct from Paisa Panchayat (lofi/pop/cinematic/synthwave/acoustic, pulsing bed, money sounds, ~13 dB under) and geography (bright `explorer`/`atlas`, ~30 dB under).
- **Levels:** ~24 dB under the voice, ~12 dB duck (measured range 5–17). The linear values are first guesses between Paisa Panchayat (0.5/0.89) and geography (0.32/0.93); calibrate on sample 1 with the timeline stems' `under`.
- **Effects:** ~6/min long, 10–12/min Shorts (front-loaded). Machine sounds only: airy whoosh on a big move or dive, sub swell on a scale reveal, tick on a card or digit flip, glass tone when a figure lands, one thud on the turn, soft pop for a Shorts callout. No ka-ching, clink or map sounds. `swell`, `glass`, `longSfxPerMinute` and `preRevealDrop` need code.
- **Drop:** bed down ~20 dB for 2 s before each chapter reveal and the turn (long); 0.4 s before the payoff (Shorts).
- **A/B later, not default:** a 0.3–0.4 s silence between sentences (Inside Decoded, Mushrooms).

## Kit gaps (merged, ranked)

"Sample 1" = the first long sample and its first Short.

1. **`Stage3D` look pass** (3D, sample 1, M): dark studio preset, reflective floor + grid, bloom (`@react-three/postprocessing`), real DOF, materials (iridescent wafer, clay, x-ray shell, emissive).
2. **Hero asset library** (3D, sample 1, L, the long pole): GPU card, wafer, server rack, data-centre aisle, a machine with an interior; ours or CC0. A cheap model kills the look.
3. **Word-timed camera** (3D, sample 1, S–M): `Camera3D` keys from `timeline.json` word events, a fast dive (3–10× in 1 s) with motion blur, drone pull-back, 0.3–0.5 s cut bursts on lists.
4. **`Place3D` + fly-through rail** (3D, sample 1, L): server aisle, campus at dusk, wiring tunnel, fin hall, atom lattice, fibre bundle, volumetric shafts; 2–3 suffice for sample 1.
5. **Figures and tags on the word** (3D + flat, sample 1, M): `FigLabel3D` count-up from `params.fig`, `Bracket3D`, `FigureLowerThird`, `TopPill`, `HonestyTag` + mode badge.
6. **Scale tools** (3D, sample 1, M): `InstancedField` with per-instance glow, scale badge on `ScaleZoom`, `ScaleCompare`.
7. **Overlays** (3D, sample 1, M): `Pointer3D`, `Highlight` (answer glows amber), `ScanDome`/radar rings, beam bounce on `SignalPath`.
8. **`LookMorph`** (3D, sample 1, S): textured → wireframe glow → clay on one mesh.
9. **Dark flat cards** (flat, sample 1, M): `CardDeck` (per-item build, amber named item, compare pair, figure + timeline, flowchart) and `ChapterCard`.
10. **`LineChart` + `EquivChain`** (flat, sample 1 long, M), with a tech icon set.
11. **`LitDoc`** (flat, sample 1 long, S–M): replaces every article screenshot.
12. **AI pictures** (3D + flat, sample 1 if the topic is AI, M): `TokenLattice` (our own network shape, not a brain), `ChatBubble` typing tokens.
13. **Fonts, captions, 3D render path** (sample 1, S): OFL fonts, phrase captions, `chromiumOptions.gl` in `scripts/render.ts`.
14. **Sound** (sample 1, S–M): `circuit`/`datahall` beds, `swell`/`glass` SFX, drop and long-rate keys.
15. **Skit cast** (3D, later, L): walk, crouch, hands on head, hold phone, slump-walk, sit; `Extras` crowd; night-set preset.
16. **`Inset3D`** magnifier (3D, later, S–M).
17. **`PhotoBoard`** (flat, later, S).
18. **Analogy machines**, e.g. a marble adder (3D, later, M each).
19. **Diagram space**: frustum, pixel grid, matrices (3D, later, M).
20. **Globe and diorama props** (3D, later, M).

## What is not ours, and what replaces it

| Theirs | Ours |
|---|---|
| Stock and drone footage | Directed places in 3D or flat; `Char` or Byte in a room |
| Product macro footage, real die photos | Our 3D models and procedural dies, tagged "illustration" |
| Talking heads, presenters | None; voice narrator, a cast member as the viewer |
| Viral clips with reactions | A 3D recreation with our character and a sourced fact |
| News clips, interviews, CEO stage footage | A news-desk place with our words on a ticker; Commons photo head on a body, never speaking |
| Article, filing and chart screenshots | `LitDoc` with source chip; `LineChart` from `params.fig` |
| AI-generated cutaways and stills | Our 3D cutaways and flat places |
| Borrowed cartoon characters, victim clips | Our cast; a sourced quote card |
| Their music, stings, logos | Synthesized beds; no sting over 2 s |

## Disagreements and weak numbers

- **Effects rate:** the Shorts watcher wants 20–30/min (Inside Decoded's 32, a near voice-only mix); Branch's Short measured 12.3, long watchers 4–10. We take 12 and 6.
- **Bed level:** 18 dB (ColdFusion watcher) to 30–35 dB (Shorts watcher); probes cluster at 22.5–26, so ~24.
- **Duck:** Branch 17 dB vs Silicon 5 (reads low); ~12.
- **Voice pace:** ColdFusion 175–200, Asianometry 135; we follow style.json (151 Shorts, 158 long).
- **Long length:** the ColdFusion watcher planned for 3–4 min (Paisa Panchayat's setting); this channel is 12–16 min, so 7–10 chapters, not 3–4.
- **Accent:** violet/cyan/green (Branch), orange (ColdFusion), copper/gold (Silicon); amber is our pick, for the owner to confirm.
- **Captions:** boxed, word-by-word and phrase all seen; we use phrases, no box.
- **Weak numbers:** Prof. of AI probed on the Hindi auto-dub track; ColdFusion's 31 effects/min inflated by news audio; Silicon's duck and tempo unreliable, and ads hid ~95 s and ~70 s of its two films; Asianometry, Silicon's CPU film, Business Insider, Algorithmswithpeter and AI Tech 3.7 never probed; Branch long probed for 77 s only; Mushrooms sparse after 2 min; long `secPerShot` (55 s) is not a cut target.
