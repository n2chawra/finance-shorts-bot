# myth_vs_fact

A money belief is stated and stamped MYTH, then tested: the same amount grows at two yearly
rates side by side (for example a savings account against rising prices). 50 s, six scenes:
myth → setup → FACT slam → two bars racing year by year → the gap → takeaway.

Example script: `examples/myth_vs_fact.json`.

## Inputs

`amount` (one-time, rupees), `years`, two `tracks` (`label`, `rate_pct`), `seed`, optional
`style`, and `text`. See `schema.json`.

The first track is what the myth relies on; the second is what it is up against and must have the
higher rate. The template refuses the script otherwise, or if both end at the same displayed value.

## Text and placeholders

Text lines and track labels must not contain digits or `₹`.

| Placeholder | Example |
|---|---|
| `{amount}`, `{amount_long}` | ₹1.0 L, ₹1 Lakh |
| `{years}` | 15 |
| `{a_label}`, `{b_label}` | Savings account, Rising prices |
| `{a_rate}`, `{b_rate}` | 3%, 6% |
| `{a_final}`, `{b_final}` | ₹1.6 L, ₹2.4 L |
| `{gap}` | ₹83,859 (second final − first final) |
| `{real_value}` | ₹65,008 (the first track measured against the second) |
| `{lost_pct}` | 35% (share of the amount's value lost against the second track) |

## Maths

`amount × (1 + rate)^years` for each track, compounded yearly.
`real_value = amount × a_final ÷ b_final`; `lost_pct = 1 − real_value ÷ amount`.

## Where each line appears

The template adds its own numbers to several scenes. Write each line to read correctly beside them.

| Scene | Your lines | Shown with them by the template |
|---|---|---|
| Myth | `myth_line1`, `myth_line2` (one sentence in a speech bubble) | "MYTH" stamp |
| Setup | `setup_title`, then `setup_note` (pill at the bottom) | the amount in large type; a pill with the first track's label and rate |
| Fact | `bust_line` (shown briefly, then replaced), `bust_sub` | "FACT" stamp |
| Race | `race_title` | two bars with each track's label, rate and growing value; "Year N" |
| Result | `result_line1` **directly above the gap**, `result_line2` below it | **`{gap}` in very large type between the two lines**; both final values at the bottom |
| End | `end_line1`, `end_line2`, `end_punch`, `end_cta`, `end_follow` | the assumption line and the disclaimer |

`result_line1` must introduce the gap (for example "You fall behind by"). `result_line2` is a
separate, complete thought. Do not split one sentence across them: the gap sits in between.
