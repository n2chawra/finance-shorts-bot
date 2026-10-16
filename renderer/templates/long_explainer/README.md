# long_explainer

A landscape (1920×1080) character-led explainer of 3–15 minutes. Aim for **4–6 minutes**.

Length is not the goal. The first version of this template chased 8–11 minutes for mid-roll ads
and shipped something the owner described as "a PPT with a voiceover" — so the target is now a
tight four to six minutes that someone actually watches to the end.

Example script: `examples/long_explainer.json` (3 min, 8 sections).

## The one rule

**A section is a verb, not a slide.** Every section is an action that runs for its *whole* length:
coins falling out of a wallet, a stack of coins growing past the hero's head, a tree growing while
the sun crosses the sky, a chart drawing itself. The same character — same colour, same face — is
in every scene, so the video is one continuous story rather than a deck of cards.

Two things follow from that:

- **Text only where it is needed.** One `heading` per section, a label on the figure, and that is
  usually all. Never put the narration on screen: nobody can read and listen at once, and a video
  that does both is the slideshow again.
- **Nothing is ever frozen.** The render measures it (`Video.liveliness`) and fails a video whose
  median frame change drops below 1.2, that is still in more than 15% of samples, or that has a
  four-second stretch with nothing moving. For scale: the Shorts score 1.5–2.3; the rejected first
  long video scored **0.02** and was frozen for 82% of its runtime.

## Shape

```json
{ "template": "long_explainer", "seed": 77, "style": {...},
  "maths": [ {"name": "habit", "kind": "sip", "monthly": 9000, "rate_pct": 12, "years": 20} ],
  "sections": [ {"kind": "hook", "seconds": 18, "text": {"heading": "..."}} ],
  "voice": {"s1": "...", "s2": "..."},
  "thumbnail": {"line1": "...", "line2": "...", "big": "{habit_final}"} }
```

Sections are numbered `s1`, `s2`, … in order; those are the names the `voice` object uses.

## `maths`: every number on screen

Each entry is one calculation, done by code. `name` becomes the placeholder prefix, so
`{"name": "habit", ...}` gives `{habit_final}`, `{habit_invested}` and so on. Names must be
unique; at most 8.

| `kind` | Needs | Means |
|---|---|---|
| `sip` | `monthly`, `rate_pct`, `years` | a fixed amount invested every month |
| `lumpsum` | `amount`, `rate_pct`, `years` | one amount invested once, compounded yearly |
| `fd` | `amount`, `rate_pct`, `years` | a fixed deposit, compounded quarterly |
| `inflation` | `amount`, `rate_pct`, `years` | what an amount will buy after years of rising prices |
| `emi` | `amount`, `rate_pct`, `years` | a reducing-balance loan |

Placeholders for every kind: `{n_amount}`, `{n_rate}`, `{n_years}`, `{n_final}`, `{n_final_long}`,
`{n_invested}`, `{n_gains}`, `{n_ratio}`. Also `{n_emi}` and `{n_total_paid}` for `emi`, and
`{n_lost_pct}` for `inflation`. For `inflation`, `final` is what the money is worth later and
`gains` is what it lost.

Rates must stay realistic (equity about 10–12%, FDs 6–7.5%, inflation 5–6%) — the fact reviewer
checks this.

## Sections

`seconds` is 10–75 per section; the whole video must land between 3 and 15 minutes. The last
section must be `end` (it carries the disclaimer). Every section except `end` takes
`text.heading`, and may take `text.sub`.

| `kind` | Also needs | What happens |
|---|---|---|
| `hook` | optional `big` + `label` | the hero walks the whole width of the frame — the opening shot is never still |
| `beat` | optional `note` | one idea; the hero paces and reacts, and that is the whole scene |
| `drain` | `maths`, `label`, optional `foot` | coins fall out of the hero's wallet while a counter climbs to the figure |
| `pile` | `maths`, `label`, optional `coins` (8–60) | the same money stacks up coin by coin, past the hero's head |
| `grow` | `maths`, `label` | a tree grows and the sun crosses the sky while the counter climbs |
| `compare` | `series` (two or three), `left_title`, `right_title` | towers rise side by side, figures counting up, coins raining in |
| `chart` | `series` (two or three), optional `labels` | the axes sweep out and each line draws itself, the hero watching |
| `steps` | `items` (2–4 short phrases) | the hero walks the steps; a marker lands at each stop |
| `end` | `cta`, `channel`, `assumption` | the hero celebrates; the ask and the disclaimer hold still beside him |

`maths` names one calculation; `series` names two or three. Either can pick a field with a dot —
`"habit.invested"` — which is how you put two sides of the *same* calculation against each other
(spent it vs invested it). Without a suffix the section's `field` applies, and that defaults to
`final`. `chart` cannot plot an `emi` calculation (a loan has no year-by-year line) — use
`compare`.

`pose` and `mood` can be set per section (`think`, `worried`, `proud`, …). They are independent:
the hero can walk away worried or point at a number proudly.

Text may not contain digits or `₹`: every figure goes in as a `{placeholder}`. Lines wrap
automatically, so a long label will not shrink to unreadable — but keep headings under about 60
characters so they stay on one line.

## Voiceover

One line per section, keyed `s1`…`sN`, each up to 1300 characters. The same placeholders work and
are read aloud in words ("ten thousand rupees"). A line must fit its section's speaking window
(the section's seconds, less about half a second at each end); code speeds a line up a little if
needed and fails the render with the character count to cut if it still does not fit.

**Write about 3 words for every second of the section** — a 30-second section needs roughly 90
words. The render fails a section whose narration fills less than 55% of its window, because a
long stretch of silent music is what makes a video feel padded. Write for the ear: short
sentences, one idea at a time, and say what the viewer is *looking at* rather than reading the
screen out loud.

## Pacing

A long video is not a stretched Short. It runs at `tempo` 1.0, so a section's `seconds` are real
seconds, and the way to make a video longer is **more scenes, not longer ones**: 4–6 minutes means
roughly 7–10 sections and 700–1,100 words of narration.

Vary the kinds. Two `beat` sections in a row is the quickest way to go flat; put a `pile`, a `grow`
or a `compare` between them. The order that works is the shape of a story, not a list of facts:
hook → the leak → a year of it → the turn → invested instead → side by side → what to do → end.
