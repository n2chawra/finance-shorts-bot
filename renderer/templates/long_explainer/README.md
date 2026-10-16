# long_explainer

A landscape (1920×1080) explainer of 5–15 minutes, built from sections. Aim for **8–11 minutes**:
past 8 minutes a video can carry mid-roll ads, which is where long-form earns.

Example script: `examples/long_explainer.json` (9.1 min, 11 sections).

## Shape

```json
{ "template": "long_explainer", "seed": 77, "style": {...},
  "maths": [ {"name": "sip_plan", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 20} ],
  "sections": [ {"kind": "hook", "seconds": 28, "chapter": "The question", "text": {...}} ],
  "voice": {"s1": "...", "s2": "..."} }
```

Sections are numbered `s1`, `s2`, … in order; those are the names the `voice` object uses.

## `maths`: every number on screen

Each entry is one calculation, done by code. `name` becomes the placeholder prefix, so
`{"name": "sip_plan", ...}` gives `{sip_plan_final}`, `{sip_plan_invested}` and so on. Names must
be unique; at most 8.

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

`seconds` is 12–90 per section; the whole video must land between 5 and 15 minutes. The last
section must be `end` (it carries the disclaimer). Every section takes `text.heading` except `end`,
and may take `text.sub`.

| `kind` | Also needs | Shows |
|---|---|---|
| `hook` | `big` + `label`, **or** `items` | the opening: one huge figure, or the question as points |
| `points` | `items` (up to 5) | points revealed one at a time |
| `number` | `big`, `label`, optional `note` | one figure, as large as it fits |
| `compare` | `left_title`/`left_value`/`left_lines`, same for `right`, optional `verdict` | two cards side by side |
| `bars` | `series` (maths names), optional `field` and `labels` | a bar per calculation |
| `chart` | `series` (maths names), optional `labels` and `x_label` | the lines growing year by year |
| `steps` | `items` (2–4) | numbered steps in a row |
| `recap` | `items` (up to 4) | the takeaways, as cards |
| `end` | `items` (1–2), `cta`, `channel`, `assumption` | the closing card, source line and disclaimer |

`bars` takes `field`: `final` (default), `invested`, `gains`, `emi` or `total_paid`. `chart` cannot
plot an `emi` calculation (a loan has no year-by-year line) — use `bars`.

Text may not contain digits or `₹`: every figure goes in as a `{placeholder}`. Lines wrap
automatically, so a long point will not shrink to unreadable — but keep headings under about 60
characters so they stay on one line.

## Voiceover

One line per section, keyed `s1`…`sN`, each up to 1300 characters. The same placeholders work and
are read aloud in words ("ten thousand rupees"). A line must fit its section's speaking window
(the section's seconds, less about half a second at each end); code speeds a line up a little if
needed and fails the render with the character count to cut if it still does not fit.

**Write about 3 words for every second of the section** — a 40-second section needs roughly 120
words. The render fails a section whose narration fills less than 55% of its window, because a long
stretch of silent music is what makes a video feel padded. Write for the ear: short sentences, one
idea at a time, and say what the viewer is looking at rather than reading the screen out loud.

## Pacing

A long video is not a stretched Short. It runs at `tempo` 1.0, so a section's `seconds` are real
seconds, and the way to make a video longer is **more sections, not longer ones**: 8–11 minutes
means roughly 12–16 sections and 1,500–2,000 words of narration. (The example is deliberately
compact at about 6 minutes and 11 sections.) Vary the section kinds: a run of three `points` sections in a row is what makes an
explainer feel long. The strongest order is usually hook → setup → the numbers → a chart → why →
the catch → what to do → recap → end.
