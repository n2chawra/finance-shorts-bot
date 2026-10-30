# What keeps failing, and how to write it right the first time

2026-10-29, owner: "every time it takes lots of retries before it gets shipped". The last 33
videos took up to twelve failed steps each. Each item below cost several re-renders or rewrites.
Writers (the video routine, Studio) read this before writing a script, and again before the stills.

**Start with what failed lately.** `python -m generator.run failures --format short` (or `long`)
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
- **The hook opens a question and promises the answer, and never gives it**: "Casinos make money
  even when you win. Here's how." The hook line ends on the question or "here's how / watch / let
  me show you".
- **One voice explains** (60%+ of the words, full sentences, 12+ words a beat); the cast react. The
  speaker changes 5 times at most.
- **Shape**: the plan's shape in `script.shape`; level chips and the word "level" only in `levels`.
- **The thing, not the character**: in a narrator beat the camera frames the item being explained;
  every figure sits on its thing (it pulses while said).
- **Calm**: cut or match between beats, whip or zoom-through twice at most, one camera change a beat.

## Pictures (render gates and QA)
- **Something new at least every 2.5 s:** an action on every phrase, each on the word that names it
  (70% of a beat's actions must show what is said then).
- **The thing named is the thing drawn.** "a whole car" shows a car prop, not a rocket.
- **Actors at spots 0.2–0.8 in a Short, beside things, never behind them.** Items at least 0.2 apart
  in `x` at the same height, and `size` 0.12 or more.
- **Labels of at most three words; tags hold a figure.** They are drawn after the camera, clamped
  inside the frame and kept off the captions band, but a long label still shrinks.
- **The HUD counter** shows on `build` and `shot` beats and gives way on its own on type, stats,
  case, chapter and custom beats. Set it in the beat whose line says that figure, with a label for
  whose figure it is (`"Rohan's pot"`), so it never shows the last speaker's number.
- **Inputs before results:** show the amount and the rate before the figure they make.
- **The first frame of the hook** has words and the main thing on screen, never an empty or dark frame.
- **A close or extreme shot every few seconds,** and never four shots of one size in a row.
- **Props:** eight or more of the story's own, at most 30% shared with the last ten videos. Prop
  lettering is fine on the subject; ghost and corner props lose theirs automatically.

## Your own code (Hook.tsx, Turn.tsx, Payoff.tsx, props.tsx)
- Size every word with `fitLine` / `fitWords` and `minText(w, h)` from `../../design/fit`, and keep
  it inside `safeBox(w, h)`. That avoids every "runs outside the frame" and "below the minimum" failure.
- Type-safe: a lookup that may be undefined gets `!` or `?? fallback` (`tsc` fails the file).
- Only kit imports, no randomness or clocks: use `random(seed)` from remotion.

## Length
- Read the range from `config/settings.json` (`lengthMinSec`–`lengthMaxSec` for Shorts,
  `longLengthMinSec`–`longLengthMaxSec` for long videos). It changes. Count words at about 200 a
  minute (Shorts) or 215 a minute (long), and check `lint`'s estimate.
