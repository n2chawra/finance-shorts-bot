# quiz_countdown

A "how much will you have?" question with three options, a five-second countdown, the reveal,
and a breakdown of money put in against growth. 48 s, six scenes:
hook → question → options + countdown → reveal → where it comes from → takeaway.

Example script: `examples/quiz_countdown.json`.

## Inputs

`kind` (`sip`: `amount` every month; `lumpsum`: `amount` once), `amount`, `years`,
`annual_return_pct`, `distractors`, `seed`, optional `style`, and `text`. See `schema.json`.

`distractors` are two multipliers of the correct answer (for example `[0.45, 0.7]`). The wrong
options are computed from them, so no option value is typed by hand. Each must be at least 15%
away from 1. The slot (A, B or C) holding the correct answer is picked from the seed. The
template refuses a script whose three options look the same on screen.

## Text and placeholders

Text lines must not contain digits or `₹`.

| Placeholder | Example |
|---|---|
| `{amount}` | ₹10,000 |
| `{years}`, `{rate}` | 20, 12% |
| `{answer}`, `{answer_long}` | ₹99.9 L, ₹99.9 Lakh |
| `{invested}` | ₹24.0 L |
| `{gains}` | ₹75.9 L (answer − invested) |
| `{ratio}` | 4.2× (answer ÷ invested) |
| `{letter}` | A, B or C: where the correct answer is |

## Maths

`sip`: one contribution at the start of every month, compounded monthly at `annual_return_pct / 12`.
`lumpsum`: `amount × (1 + rate)^years`, compounded yearly.
