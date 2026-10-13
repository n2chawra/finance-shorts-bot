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

## Where each line appears

| Scene | Your lines | Shown with them by the template |
|---|---|---|
| Hook | `hook_line` | "QUIZ" stamp, a character and question marks |
| Question | `q_title`, then `q_line1`, `q_line2`, `q_line3` on one card, then `question`, `q_cta` | nothing else |
| Options | `question` again (smaller), `opt_cta` until the countdown starts | three cards A, B, C with the option values; a 5-to-1 countdown; "Time's up!" |
| Reveal | `reveal_line`, `reveal_note` | the same three cards with the correct one lit |
| Why | `why_title`, `why_line` | two bars labelled "You put in" (`{invested}`) and "Growth" (`{gains}`); "Total `{answer}`" |
| End | `end_line1`, `end_line2`, `end_punch`, `end_cta`, `end_follow` | the assumption line and the disclaimer |

`q_line1` to `q_line3` must state every input the viewer needs to answer. Do not reveal the
answer or its letter before `reveal_line`.
