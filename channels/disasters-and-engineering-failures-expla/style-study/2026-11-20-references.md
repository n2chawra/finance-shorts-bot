# Build spec: the disaster and engineering-failure references (20 Nov 2026)

One pass, read by the pack, the director and the kit builders. Watched in the built-in browser,
nothing downloaded; techniques only, never their words, models or art. Owner rules for this pass:
sampled moments only (first 60 s, 5–10 moments, a burst at the failure, the last 20 s); skip
non-animated references; the references are a reference, not the style: we copy what works and
beat it. Sheets in `research/sheets/`, sound in `research/sound.md`.

| Ref | Channel (subs) | Views | Status |
|---|---|---|---|
| dcfldWqanJc Florida Learjet, 3D | Fault Lines (11K) | 1.94M | sampled: the main 3D reference |
| plYQ-StbrOE Kolkata flyover | Plainly Difficult (1.1M) | 628K | sampled: flat 2D diagrams + footage |
| Ayk__UBphmU Spain train crash, 3D | Major Disasters (420) | 186K | sampled: low-budget 3D, respect framing |
| _blF6L04Dfk Eastern 212 | Fascinating Horror (1.47M) | 2.4M | **stopped at 140 s** (photo-driven): hook and structure only |
| V0CGuxCbeIk pilot saves 167 (Short) | Athena_Explains (27.8K) | 7.4M | sampled |
| L73NEgH36JU Learjet (Short) | Inside Decoded | 1.9M | sampled |
| JUevp0TSZME Learjet (Short) | World explained | 2.5M | sampled |
| -17mPnFxi30 | Practical Engineering | 5.6M | **skipped** (filmed; owner) |
| KE_-tg3Y1fY Longtan bridge | Engineering Revealed | 389K | **skipped**: AI-generated photoreal stills of a construction, not a failure |
| B7JTpjSl5Vs | ProjectTomorrow (Short) | – | **not reached** (owner stopped the pass) |

## Where we beat them (picture and sound)

1. **Type-accurate 3D, not a generic jet.** Fault Lines flies a Gulfstream-like model while telling a
   Learjet 60 story; Major Disasters' trains are boxes in a void. Our `three/Hero` + `Proc` builds the
   actual type (silhouette, engines, livery colours from a licensed photo) and the real place from
   map data, so the reconstruction looks like *that* aircraft, bridge or ship.
2. **Show the failing part, not a black frame.** Both 3D channels cut to black at the impact. We keep
   the respect (no bodies, no impact gore) but show the *mechanism* at the moment of failure: a
   cutaway of the joint, bolt or hull plate with stress colour climbing to red on the word, the part
   shearing in slow motion (`three/Cutaway`, `Explode`), then the wide shot from far away. That is the
   shot none of them has, and it is what the title promises ("what went wrong").
3. **One continuous world across kits.** They hard-cut between unrelated pictures (3D, then a flat
   card, then a news clip). We move *through* the world: the 3D camera pushes into a cockpit screen that
   becomes a flat 2D diagram, a document's figure lifts off the page into the 3D scene as a label
   (`three/LookMorph`, doc `Transitions`). Every kit, one film.
4. **Labels that draw on the spoken word.** Their callouts pop in whole. Ours: the leader line draws to
   the part, the mono label types on as the word is spoken, figures count to their value
   (`params.fig`), and the report sentence gets the highlighter wipe in the doc kit.
5. **A live instrument per story, done properly.** Inside Decoded's telemetry panel and World
   explained's vertical-speed meter carry tension. We make it the story's own instrument (altimeter
   tape, a train's speed dial, a bridge's load gauge, a ship's list angle, a dam's water level)
   driven by the timeline's numbers, with honest "time paused" / "2× speed" flags, and it ticks in
   the audio.
6. **The real report on screen.** None of them shows the investigation document. We bring the NTSB /
   AAIB / RAIB / commission report page in (doc kit `DocumentProp`, highlighter on the finding,
   page number and date), so the cause is proven, not asserted.
7. **Sound design they don't have** (see `research/sound.md`): a breathing drone instead of nothing,
   mechanical foley on things moving, silence then one sub-boom at the failure, a clock tick.
8. **A different look every video** (§7) where each reference is locked into one look forever.

## 1. What the picture is made of (long)

| Kind | Fault Lines | Plainly Difficult | Major Disasters | **Our target** |
|---|---|---|---|---|
| 3D reconstruction (vehicle, path, place) | ~50% | 0 | ~45% | **35–45%** (`three/`) |
| Flat 2D diagrams (mechanism, physics, cross-sections) | ~25% (forces, storm, debris, bars) | ~35% (side elevations, joint) | ~10% (signal panel) | **20–25%** (`flat/`) |
| Cards (facts, titles, chapter, warning) | ~15% | ~5% + scorecard ending | ~10% (warning, memorial) | **8–10%** |
| Real photos / footage / documents | ~5% (one CC photo) | ~45% (stock, CCTV, satellite, screenshots) | ~25% (news footage) | **15–20%**: licensed photos, report pages, satellite/map (`doc/`); no news footage |
| Person on camera | 0 | 0 | 0 | **0** |

## 2. How each picture is made (what happens on which words)

- **The flight/route path is the spine** (Fault Lines 5–30 s, Inside Decoded end, World explained
  map): a white ribbon over a dark navy grid; an orange/red curtain drops from it to the ground; the
  colour changes at the moment things go wrong (cyan → orange, blue → red by descent rate). Mono
  callouts sit at each event (cruise altitude, the turn, impact + time + place), each a dark box with
  an orange or red title and a grey subline. The camera orbits it again in later chapters.
- **Labels and fonts**: everything technical is a letter-spaced **mono** (small caps, 60–70% white),
  with one warm accent (orange `#F0A030`-ish) for labels and **red only for the failure**; values in a
  bold geometric sans; chapter or explainer titles in an elegant **serif** centred over a darkened
  3D shot (Fault Lines 316 s). Major Disasters: white pill with black bold text for figures and
  clocks ("63 KM", "08:31").
- **Honesty tags** on nearly every shot (top-left mono): "3D reconstruction – not actual footage",
  "illustrative path – based on reported tracking data", "as reported by media – not yet verified",
  "general principle – not a finding about this flight", "reconstructed – not original audio",
  "own 3D graphic – not to scale". This is the genre's trust device; we adopt it as standard.
- **Physics diagrams** (Fault Lines 330 s): a front view reduced to a line and a circle, force arrows
  that tilt as spoken (green lift, red side force, blue dashed weight), and a yellow mono cause chain
  at the bottom ("less lift → nose drops → spiral") that fills arrow by arrow.
- **Cross-sections** (storm 405 s; Plainly Difficult's flyover side elevation 330 s and joint 500 s):
  one flat plane, an altitude/height axis, arrows for flows; the failing part *moves* (the girders hinge
  off the pier as the truck's load arrives). Plainly Difficult's flat style: grey concrete shapes, no
  outlines, a gritty charcoal/chalkboard texture behind, a tiny stick-figure mascot in the corner.
- **Fact cards**: dark navy with drifting dust motes, orange mono label + white value per line,
  revealed line by line as spoken (Fault Lines 60 s).
- **Comparison bars**: a tiny blue square ("normal") against a long red bar ("this one"), the figure at
  the bar's end, a status chip about the source.
- **Places**: procedural low-poly towns (grey boxes, dot trees), a white ring on the ground at the
  crash site, a smoke column; Major Disasters' dark track with sphere trees and catenary masts; a
  signal-panel screen in a dark room.
- **Real photos**: one licensed photo of the vehicle type with a mono credit tag (Fault Lines 522 s);
  Plainly Difficult's satellite top-down of the route.
- **Shorts**: clay/untextured 3D (white mannequins, one accent colour, Athena), a tilted extruded map
  with red countries and yellow tags, a fuselage cutaway with passengers colour-coded, a telemetry HUD
  (clock, altitude, rate, data source) in every shot (Inside Decoded), a vertical-speed meter (World
  explained), a leading-edge close-up with ice and a cyan callout.

## 3. The moment of failure

| | How it is shown | Sound |
|---|---|---|
| Fault Lines | serif "how it works, in general" card → force diagram → banked jet in cloud ("no horizon") → dip to near-black while the dive is described | drone under, drop |
| Major Disasters | cab-height chase toward the stopped train under a green signal → **cut to black on impact** → real aerial wreck footage | silence |
| Plainly Difficult | real CCTV of the fall → aftermath photos → *later* the flat joint diagram that explains it | voice only |
| Inside Decoded (Short) | nose-down jet, "speed up 2×", falling-rate counter → blurred ground rushing up → toll card | — |

**Ours**: tension build (chase or orbit, the instrument climbing), a 0.6–1.0 s silence, then the
**mechanism shot** (cutaway of the part, stress colour to red, the part letting go in slow motion) with
one sub-boom, then a far wide shot (the path curtain or the structure from a distance) and the toll on a
quiet card. Never bodies, never the impact close; the mechanism is the reveal.

## 4. The hook (long)

| | First frame | First line (≤15 words, ours) | Subject | First figure | Shape |
|---|---|---|---|---|---|
| Fault Lines | 3D jet over clouds + reconstruction tag | a business jet cruising, bound for the islands | 0 s | spoken 0 s, shown ~18 s | whole story in 17 s (cruise → a minute → impact → nine dead) → method promise → subscribe ask 30 s → chapter 2 at 46 s |
| Major Disasters | red WARNING card, silent 7 s | condolences to the families | 12 s | 49 s | warning → memorial → present-tense "it's 8:30" cold open → the crash in one sentence at 76 s |
| Plainly Difficult | stock street footage | planners struggle to keep traffic moving | **64 s** | 25 s | slow context → foreshadow at 57 s → named at 64 s |
| Fascinating Horror | silent serif date card, ~6 s | on that date passengers sensed danger; the pilots did not | 4 s | none | dramatic irony → 12 s burst of fast cuts → slow holds |

Rules for us: **the vehicle/structure on screen in frame 1** with the honesty tag; a date/place line in
mono; the whole arc (normal → the minute → the outcome) inside 20 s; the first figure spoken by 5 s and
on a thing by 10 s; the promise of *the cause* ("one bolt / one setting / one decision") by ~25 s; a
respectful line (toll) but no 30 s memorial preamble; chapter 1 by ~45 s.

## 5. Pacing and voice

- Words a minute: Fault Lines ~140, Major Disasters ~134, Plainly Difficult ~164. Short sentences, a
  beat of silence after each. **Ours: ~145 wpm, Kokoro speed ≈0.88**, one narrator per video.
- Shot length: 3D moves are long (Fault Lines 5.6 cuts a minute, ~11 s; Major Disasters 4.1),
  diagrams 15–25 s while they build; Plainly Difficult 2.5 cuts a minute. Fascinating Horror front-loads
  a 12 s burst of 13 cuts. **Ours: 4–6 s in the hook, 6–10 s per 3D move, a diagram may hold 12–20 s
  only if something new happens every 2.5 s** (our liveliness gate).
- Chapters: 6–10 named chapters (Fault Lines 10 in 10 min). Ours: 6–8 chapter cards for 8–10 min.

## 6. The ending

- Fault Lines: known / unknown, condolences, a promise to rebuild when the official report lands,
  wordmark end card with a subscribe button. Major Disasters: open questions, sources in the
  description, corrections promised; last shot an empty track at dusk. Plainly Difficult: a
  signature **cause scorecard** with the causes stamped, and a comment question.
- **Ours**: the chain of causes as one picture (our own Swiss-cheese / domino board, stamped per cause,
  a signature that varies with the look), what changed afterwards (the rule, the redesign), the empty
  place at rest, a comment question, an end screen.

## 7. How the Short promotes a long

- The three disaster Shorts are standalone 50–114 s reconstructions of one moment; the end figure in
  the first 3 s (Inside Decoded "26,000 ft in ~1 min"), a live instrument in every shot, the toll card
  near the end, and the last shot is the cleanest wide (the path curtain) as the hand-off to the full
  version. Athena's 49 s: real hero face in frame 1, 10 cuts in 10 s.
- **Ours**: one promo Short per long, cut from the long's own 3D and diagrams (re-framed vertically,
  not letterboxed): the failure figure in frame 1, the instrument HUD, the moment up to the silence, the
  mechanism shot withheld; the last line points to the full reconstruction (related-video link + pinned
  comment). 35–55 s.

## 8. Mapping onto our kits

| Technique | Have | Lack | Build item (effort) |
|---|---|---|---|
| 3D vehicle hero | `three/Hero`, `Proc` (procedural, stylised) | aircraft, train, ship, bridge, dam, building heroes by type | **Disaster hero library**: parametric jet (wing/engine/tail layout), train set, ship hull, truss/girder bridge, dam, frame building (L) |
| Flight/route path ribbon + curtain + callouts | `three/SignalPath`, `Label3D` | a path from real lat/lon/alt samples, colour by a value, drop curtain | `Path3D` from timeline samples, colour ramp, curtain, event callouts (M) |
| Place from real geography | `flat/map.tsx`, `doc/DocMap` (2D) | 3D terrain/city from map data, low-poly town | `Terrain3D` (height grid + extruded footprints from OSM-style data fetched by the media fetcher, licensed) (L) |
| Cutaway / part failure | `three/Cutaway`, `Explode` | stress colour ramp, shear/hinge/buckle animation, slow-motion debris | `Failure3D`: stress shader on the part + fracture modes (shear, hinge, buckle, tear) on `params` (M–L) |
| Physics/force diagrams | `flat/kit.tsx` shapes, `doc/Annotate` | force arrows that tilt with a value, a cause-chain strip | `ForceDiagram` + `CauseChain` in `flat/` (S–M) |
| Cross-sections (structure, storm, hull) | `flat/` shapes | an engineering-elevation set (piers, girders, hull, dam profile), height axis | `Elevation` kit in `flat/` (M) |
| Live instrument HUD | `three/Overlays`, `doc/Overlays` | altimeter tape, speed dial, load gauge, list angle, water level, clock with paused/2× flags | `Instrument` set driven by `maths` (M) |
| Honesty tags + mono labels | `doc/Overlays` `SourceTag`, `MONO` | the standard tag set, typed-on labels with leader lines drawing to a 3D point | tag presets + `Callout3D` projecting to screen (S) |
| Report pages | `doc/DocumentProp` highlighter | report fetch (NTSB/AAIB/RAIB PDFs are public) → page render | add report sources to `generator/media/` (S) |
| Licensed photos / satellite | `doc/PhotoPan`, fetcher | public-domain satellite/aerial (USGS, NASA, Commons) | fetcher sources (S) |
| Chapter / warning / fact cards | `doc/ChapterCard`, `Timeline` | serif-over-3D chapter look, fact-sheet card | presets (S) |
| Cause scorecard ending | – | our own board (domino or cheese layers), stamps per cause | `CauseBoard` (S–M) |
| Kit-to-kit transitions | `three/LookMorph`, `doc/Transitions` | 3D screen → flat diagram, doc figure → 3D label | `MatchMove` transitions (M) |
| Clay / untextured 3D look | `three/post` look pass | a clay material preset, mannequin crowd | material preset + `Character3D` mannequin variant (S) |
| Weather/sea/smoke | `three/Field` (particles) | volumetric cloud deck, ocean surface, smoke column, rain | `Atmos3D` (M) |
| Sound (sound.md) | `renderer/engine/music.py`, `audio.py` | the two beds, foley set, failure silence + sub-boom, clock tick | beds + SFX kinds (M) |
| Vertical Shorts from long assets | Shorts pipeline | re-frame 3D cameras for 9:16 | camera presets per format (S) |

Fonts: mono (e.g. JetBrains Mono / IBM Plex Mono, OFL), a heavy geometric sans, an elegant serif
for titles: all OFL, owner OK to download as for channel #2.

## 9. Look rotation (no two videos alike)

Each video draws one recipe; the rotation never repeats the last 4. Every recipe uses all three kits;
the mix shifts. Grounded in what each reference does well, pushed further.

| # | Recipe | Palette | Kit mix (3D / flat / doc) | Camera language | Texture |
|---|---|---|---|---|---|
| 1 | **Night Grid** (Fault Lines' spine) | navy `#0D1B2A`, grid cyan, warm orange labels, red failure | 45 / 25 / 20 (+10 cards) | slow orbits around the path, push-ins to callouts | dust motes, soft bloom |
| 2 | **Blueprint** | cobalt blue, white line, yellow notes | 30 / 45 / 25 | locked orthographic elevations, pans along the structure, 3D only at the failure | paper grain, faint grid, ink bleed on lines |
| 3 | **Clay Studio** (Athena's clarity) | warm white clay, one accent per story (blue or orange), black void | 50 / 20 / 20 | turntable reveals, cutaway dollies, rack focus | soft AO shadows, no textures |
| 4 | **Chalk Site** (Plainly Difficult's world, ours) | charcoal board, concrete greys, hi-vis yellow | 25 / 50 / 25 | side-on tracking along the site, cut-in close-ups of the joint | chalk dust, rough board, hand-drawn arrows |
| 5 | **Investigator's Desk** | manila, off-white paper, red string, black type | 30 / 20 / 50 | top-down over a desk; the 3D model sits on the desk as a scale model; push into documents | paper, photo prints, tape |
| 6 | **Instrument Panel** | black glass, amber/green readouts, red alarms | 40 / 25 / 25 (HUD-heavy) | cockpit/cab POV, gauges in close-up, the outside world through the window | scanlines, glass reflections |
| 7 | **Storm Weather** | slate greys, sodium orange, white rain | 50 / 20 / 20 | handheld-feel drift, low angles, long lens compression | volumetric cloud, rain streaks, film grain |
| 8 | **Archive Rebuild** (for pre-1980 events) | sepia/teal duotone, cream labels | 35 / 25 / 40 (period photos and the report) | slow Ken Burns on photos that dissolve into the matching 3D angle | halftone, gate weave, scratches |
| 9 | **Satellite Atlas** | true-colour terrain muted, white routes, red site ring | 40 / 20 / 30 (maps, satellite) | top-down dives from orbit to street, tilt-up reveals | map tiles, atmosphere haze |
| 10 | **Engineer's Cross-Section** | white background, black line, one red, pale blue water/air | 25 / 55 / 20 | slicing cutaways, exploded views, slow parallax | technical hatching, dimension lines |

Rules: one look per video (the 3D look pass, the flat kit's palette and the doc grade all read the
same `style.look`), the honesty tags and the mono label system stay constant across looks (the
channel's identity), red always means the failure.
