# Champion recipe: Disaster Desk

The writer and the director follow this wherever CLAUDE.md describes Paisa Panchayat's recipe (money Shorts, the 28–35 s
length, the flat cast). The hard rules do not change:
- true, sourced facts;
- every figure from code or a sourced `facts` entry;
- one narrator (bm_lewis);
- no real person's words in the voice.

Sources: `research/advice.md`, `research/report.md`, `research/style.json`, `research/sound.md`, `research/comments.md`
and `style-study/2026-11-20-references.md` (the build spec). Long-first: the long video is the channel, and each Short
promotes one.

The references are a starting point, not a template (owner, 20 Nov): keep what works and beat them on the picture and
the sound.

## The story

- **One failure, one cause chain, one change.** Every video names the rule, standard or design fix that came out of it,
  and when. "Rules are written in blood" is the most-liked kind of comment.
- **Topic shares, month 1 (per 15 long videos):**

  | Kind | Share |
  |---|---|
  | stunt, ride or amateur build gone wrong (core, 1.93×, 409,809 median) | 4 |
  | historic air crash ending on its rule | 4 |
  | bridge, dam or building, every corner cut | 4 |
  | rail crash (154,694 median) | 3 |
  | space mission failure (core, a gap) | 1 |
  | ship or industrial | when a strong story is ready |

- **Fast lane:** a major recent crash (official statements, ATC as text, ADS-B data) takes the next slot, labelled
  preliminary, with a follow-up when the preliminary report lands.
- **Avoid:** natural-disaster explainers, fiction, open blame, gore.
- **The turning figure:** hold the survivor or death figure for one beat ("about 50 were alive… only 10 survived"). It
  never goes in the title or the first line.
- **Technical depth:** explain the physics properly, one step at a time, on a flat diagram. Viewers write paragraph-long
  explanations in the comments.
- **One human moment,** told with respect: a crew member who went back, a last radio call shown as text, a passer-by.

## Long videos: 8–10 minutes (480–600 s)

### The first 45 seconds

1. **Frame 1 is the moment of failure, or one beat before it,** in 3D, with a mono caption (date · place · altitude,
   speed or load) and the tag "3D reconstruction · not actual footage". Never a logo ident or a sponsor.
2. **The vehicle or structure named by 2 s.**
3. **A figure on screen by 5 s:** altitude, speed, load or a clock.
4. **The whole arc in 45 s,** without the toll: what it was, what went wrong, how fast it happened.
5. **The promise of one cause chain:** "It wasn't one mistake. It was five, and the last one took eleven seconds."
6. **Title card with a drop to silence** (0.8 s), then the drone returns.

### The body

- **Chapters** (with chapter cards):
  1. who, what and where;
  2. how it was meant to work (flat diagram);
  3. the chain, one link per beat, each proven with a document or photo;
  4. the last minutes (a clock and the story's live instrument on screen);
  5. the failure;
  6. what the investigation found (the report page, finding highlighted);
  7. what changed.
- **The moment of failure:** silence for 0.6–1.0 s, then the failing part in 3D cutaway (stress colour climbing to red,
  shear, hinge or buckle) slowed down, one sub-boom on the frame it gives way, then the wide shot from far away. No
  bodies, no impact close-ups.
- **The ending:** the cause scorecard (each link stamped), the change it led to, and one question for the comments
  ("Which of these five should have stopped it?").

### Pace

- About 150 words a minute (voice speed 0.92), short sentences with a pause after each.
- A new thing on screen at least every 4 s: a label typing on, a figure, a stress colour step, an instrument tick.
- A cut or major camera move every 10–15 s. One 3D move runs about 11 s.

## Promo Short (30–50 s, one per long video)

- **Frame 1:** the vehicle or structure a second before it fails, in 3D, with the caption and the tag. Named by 2 s, a
  figure by 3 s.
- **The beats:** the one cause on a flat diagram, then silence, the failure in cutaway and the sub-boom, then one
  question the long video answers. The long video is set as the Short's related video.
- **Pace:** voice speed 1.0. A cut every 2–3 s in the first 10 s, then every 4–5 s.

## The look

- **Every kit in every video:**
  - 3D (`remotion/src/three/`, `three/disaster/`) for the vehicle, the structure, the path and the failure;
  - flat 2D (`remotion/src/flat/`) for cross-sections, force arrows, cause chains, maps and instruments;
  - the doc kit (`remotion/src/doc/`) for the report page with the highlighter, licensed photos, chapter cards and the timeline.
- **A new look every video:** one recipe from `channel.json` `look.rotation`, never one of the last 4. The 3D look pass,
  the flat palette and the doc grade all follow it.
- **The director's kit for this channel:** `remotion/src/disaster/` (README there) for the look recipe
  (`<DisasterLookProvider value={style.recipe}>`, `useDisasterLook`, `Texture`) and the flat/doc pieces (ForceDiagram,
  CauseChain, Elevation, the Instrument set, Callout, HonestyTag, ReportPage, CauseBoard), and `remotion/src/three/disaster/`
  for the 3D pieces in the same look (`LOOKS[recipe].three`). The plan sets `style.recipe`; check-plan refuses a recent one.
- **Constant identity across looks:** mono labels typing on the spoken word, the honesty tags, and red only for the failure.
- **Our upgrades over the references:**
  - type-accurate 3D;
  - the failing part shown instead of a cut to black;
  - one continuous world moving between kits;
  - labels drawing on the word;
  - the story's own live instrument;
  - the real report page;
  - designed sound.

## Titles and thumbnails

- **Titles:** a claim or question that names the vehicle or structure and the mystery ("The Bridge That Was Built to
  Fail", "Could Any Pilot Have Saved It?"). No death toll, no "horror", no clickbait about victims.
- **Thumbnails:** the vehicle or structure at its moment of failure in our 3D, with the failing part in red, at most 3
  words, and no faces of victims.
