# What keeps failing, and how to write it right the first time

2026-10-29, owner: "every time it takes lots of retries before it gets shipped". The last 33
videos took up to twelve failed steps each. Each item below cost several re-renders or rewrites.
Writers (the video routine, Studio) read this before writing a script, and again before the stills.

**Start with the owner's notes.** `state` → `owner_feedback`: his open notes come right after the
hard rules (a `wrong` note is a rule until the improver addresses it), and his picks and stales show
what he wants on the channel. `failures` prints the open notes at the top too.

**Then what failed lately.** `python -m generator.run failures --format short` (or `long`)
groups the last two weeks' failed checks with the fix for each. Avoid every item it lists.

**After every edit, run the quick check.** `python -m generator.run lint <id>` takes about twenty
seconds. It builds the timeline on an estimated voice and runs every check that needs no pixels: the
story spine, the picture following the words, gaps, shot sizes, devices, props against recent
videos, the thumbnail spec, length and your own code (`tsc`). Fix until it prints `ok`, and only then
spend a minute on `render --preview` and a QA round. Timing findings are on the estimated voice, so
fix any beat near a limit as well.

## Numbers and words (number check)
- No digit in anything shown or said: figures are `{placeholders}`, and so are **the title and the
  description**. "{worth_final} in one year" is filled from the maths at ship time; a typed "$500K"
  fails. Years and dates ("2027", "October 28") are fine.
- `@name.key` reads a maths result or one of its own inputs (`@home.amount`). The error lists the
  keys when one is wrong.
- An event's `word` is spelled exactly as in `say`. A figure is spoken as words, so put events on
  the words around it, never on the figure.
- Ids may be anything (`y1`, `c6-worth`): they are never shown.
- **Say every figure the picture shows** (`spoken_figure_problems`, owner 2026-11-11 on the Ohtani
  Short: "animation were showing numbers difference but voice speaking was very little to understand"):
  after the hook, each `{figure}` in a beat's params is in that beat's `say` or an earlier one, with
  what it means ("the deal is {fact1}, but he takes {fact4} a year now; the rest waits ten years").
  No riddles in place of numbers ("far more", "a side cheque"): the viewer must follow the story
  with the sound on and the screen off. Short on words? Cut a beat, not the explanation.
- **Millions and billions read as words** (owner, 2026-11-05): "$10 billion", never
  "$10,000,000,000". Give money inputs round values (`10000000000` shows as "$10 billion", `1500000` as
  "$1.5 million"); a title or description showing 7+ digits fails the number check.
- No line opens like a line in the last ten scripts (the error quotes it). Write your own openings
  and skip stock ones ("to be fair", "so the money", "that's more than").

## Claims (fact review)
- **Assumptions are said as assumptions.** A return, a growth rate, a depreciation or a card's APR is
  "if it grows 7% a year" / "at a 22% card rate", and it appears on screen or on the end card. A
  figure that rests on an assumption is never said as a certainty ("it earns $700,000" → "at 7% a
  year, that's {x} a year").
- **No "most people", "everyone", "nobody"** without a source. Cut it or say "many".
- **Every comparison names its time** ("in 10 years", "a year").
- **No overstatement:** "could save", not "saved"; the hook says what the numbers show, no more.
- **Title and description promise only what the video shows.** A count matches its list ("five
  debts" = five levels). A figure the description mentions appears in the video.
- **Typical, not extreme, examples:** salaries, rates and minimums as they usually are in the story's
  country (a UK card minimum covers interest plus 1%; a US doctor earns about $350–400K, not $500K).
- **Rules and taxes as the rule says them,** with the country named. "Zero interest" deals mention
  the fee.
- Real people and companies: only well-known public facts, no invented quotes.

## Hook, voice and shape (owner, 2026-10-30)
- **The hook puts the belief to the viewer and denies it, and never gives the answer** (owner,
  2026-11-09): "You think McDonald's makes its money selling burgers? It doesn't." No stock tag after
  the denial ("Watch this.", "Here's why."), and not the same last 4 words as the last 6 Shorts'
  hooks (`generator/story.py` `hook_problems`).
- **One voice explains** (60%+ of the words, full sentences, 12+ words a beat); the cast react. The
  speaker changes 5 times at most.
- **Shape**: the plan's shape in `script.shape`; level chips and the word "level" only in `levels`.
- **The thing, not the character**: in a narrator beat the camera frames the item being explained;
  every figure sits on its thing (it pulses while said).
- **Directed**: one big hero thing per moment, every build beat transforms something, money travels
  (`flow`), travelling transitions (whip or zoom-through four times at most); no row of small labelled icons.
- **Story**: one person in one concrete moment, no more than 2 hedges (might, can, some), no warm-up
  opener, a new open question every 2–3 beats, the hook's answer only in the payoff.

## Pictures (render gates and QA)
- **Something new at least every 2.5 s:** an action on every phrase, each on the word that names it
  (70% of a beat's actions must show what is said then).
- **The thing named is the thing drawn.** "a whole car" shows a car prop, not a rocket.
- **Actors at spots 0.2–0.8 in a Short, beside things, never behind them.** Items at least 0.2 apart
  in `x` at the same height, and `size` 0.12 or more.
- **A `grow` near the edge is capped** at the room the thing has (anything up to 1.2 is kept and the
  thing slides in a little). To grow big, stand the thing nearer the middle (x 0.35–0.65).
- **Labels of at most three words; tags hold a figure.** They are drawn after the camera, clamped
  inside the frame and kept off the captions band, but a long label still shrinks.
- **The HUD counter** shows on `build` and `shot` beats and gives way on its own on type, stats,
  case, chapter and custom beats. Set it in the beat whose line says that figure, with a label for
  whose figure it is (`"Rohan's pot"`), so it never shows the last speaker's number.
- **A board beat speaks for 6.5 s at most** (one sentence, one picture), and no beat runs 3 s
  without an event: split a long promise or turn instead of stretching it (3 of the 2026-11-03
  Shorts were sent back for both).
- **A board room** (cast + things): leave the things' `y` unset so they float over the heads, and
  never put a thing's `x` on an actor's spot. Cards (no cast) have the whole middle to themselves.
- **Custom Turn bars:** a column label fits its column's width (`fitLine(label, fs, columnWidth)`),
  two short words at most, or two labels print over each other (QA, v-20261103-03).
- **Inputs before results:** show the amount and the rate before the figure they make.
- **The first frame of the hook** has words and the main thing on screen, never an empty or dark frame.
- **A close or extreme shot every few seconds,** and never four shots of one size in a row.
- **Props:** eight or more of the story's own, at most 30% shared with the last ten videos. Prop
  lettering is fine on the subject; ghost and corner props lose theirs automatically.

- **Things arrive on their words** (owner, 2026-11-03): a board thing nothing acts on until 0.6 s into
  the beat now waits off screen and enters just before its first action, so put each thing's first
  action on the word that names it; one that must be there at frame 0 needs an action at the start.
- **Board actions change the picture** (`mark_problems`, owner 2026-11-03: "same stuff coming"): at
  most 65% of a board video's actions may be marks (glow, stamp, bubble, cross, tick, strike, shake,
  label, tag, chip). Give clauses a change: enter, swap, flow, multiply, grow, or a panel.
- **No glow; one big hero** (`stage_problems`, owner 2026-11-11 on the Ronaldo Short: "the glowing thing
  is very poor… everything is in the middle, make screen bigger"): no `glow` action anywhere; a Short's
  build beat holds at most 3 things, the one the line is about at `size` 0.28-0.40, and a `grow` is
  1.3x or more. Don't open a beat on a mark at `sec: 0`; open it on a change.
- **The source line shows once** (owner, 2026-11-03): on the first board beat that says a fact; own
  code uses `showsSource(p)`.
- **The source line fits with its month** (2026-11-09: v-20261103-01, -04-03, -05-02, -09-01, -09-03
  cut it at the edge): cut each `facts[].source` to the publisher ("Delta Air Lines", "JPMorgan
  Chase"); the number check fails a line wider than the frame when there's detail left to cut.
- **No stretch of words only** (owner, 2026-11-04, v-20261104-02: 12 s of cards with no things): a
  card beat with a `person` or `doc` panel still lists 1–3 `items` that act on its words; they stand
  under the panel (a doc of at most three rows, no `equation` on the same beat). Two card beats in a
  row with a panel and no things is a fail.
- **Real people and companies** (owner, 2026-11-03): a person gets one short clause the first time
  they are named; a company is its name on a `person` panel or a label, never a pun object.

## Your own code (Hook.tsx, Turn.tsx, Payoff.tsx, props.tsx)
- Size every word with `fitLine` / `fitWords` and `minText(w, h)` from `../../design/fit`, and keep
  it inside `safeBox(w, h)`. That avoids every "runs outside the frame" and "below the minimum" failure.
- Type-safe: a lookup that may be undefined gets `!` or `?? fallback` (`tsc` fails the file).
- Only kit imports, no randomness or clocks: use `random(seed)` from remotion.
- **A place reads as that place** (owner, 2026-11-04: "the city props is shit", a tilted glass slab
  for Neom): a city, downtown or skyline is the shared `city` prop (towers with windows, roofs, a
  crane; `k` 0..1 = how much is built, `state: "dark"` = lights off), one tower is `building`. Your
  own props draw a recognisable thing with its telling details (a shop has an awning and a sign, a
  factory a chimney), never a plain box or slab with a label doing the work.

## Length
- Read the range from `config/settings.json` (`lengthMinSec`–`lengthMaxSec` for Shorts,
  `longLengthMinSec`–`longLengthMaxSec` for long videos). It changes. Count words at about 200 a
  minute (Shorts) or 180 a minute (long, tempo 1.25 since 2026-11-04), and check `lint`'s estimate.
