# two_friends_race

Two people invest the same amount every month. The first starts early (and may stop early); the
second starts later. The first puts in less and still ends with more. 60 s, seven scenes:
hook → person A saves → person B saves → question + countdown → growth chart → result → takeaway.

Ported from `reference/rahul_vs_amit_v2.py`. Example script: `examples/two_friends_race.json`.

## Inputs

`monthly`, `annual_return_pct`, `end_age`, two `people` (`name`, `start_age`, `stop_age`), `seed`,
optional `style`, and `text`. See `schema.json`. Character colours come from the palette.

The template refuses a script where the first person does not both invest less and end with more,
because the scenes are built around that outcome.

## Text and placeholders

Text lines must not contain digits or `₹`. Refer to numbers with placeholders; the template
computes them:

| Placeholder | Example |
|---|---|
| `{a}`, `{b}` | Rahul, Amit |
| `{monthly}` | ₹5,000 |
| `{rate}` | 12% |
| `{a_start}`, `{a_stop}`, `{b_start}`, `{b_stop}`, `{end_age}` | 25, 35, 35, 60, 60 |
| `{a_years}`, `{b_years}` | 10, 25 |
| `{a_invested}`, `{b_invested}` | ₹6.0 L, ₹15.0 L |
| `{a_invested_long}`, `{b_invested_long}` | ₹6 Lakh, ₹15 Lakh |
| `{a_final}`, `{b_final}` | ₹2.30 Cr, ₹94.9 L |
| `{invested_ratio}` | 2.5× (B's total ÷ A's total) |
| `{final_ratio}` | 2.4× (A's final ÷ B's final) |

Lines that are too wide are shrunk to fit; keep them short (max 40 characters) so they stay large.

## Maths

One contribution at the start of each month from `start_age` up to `stop_age`, compounded monthly
at `annual_return_pct / 12`, left invested until `end_age`.

## Where each line appears

| Scene | Your lines | Shown with them by the template |
|---|---|---|
| Hook | `hook_title`, `hook_sub`, `hook_tease` | both characters with name tags and "VS" |
| Person A | `a_intro`, `a_amount`, then `a_note` (pill at the bottom) | "Invested:" counting up; a filling jar; "Age N" |
| Person B | `b_intro`, `b_amount`, then `b_note` | the same for the second person |
| Question | `question_setup`, `question`, `question_cta` | a card per person: years invested and total put in; a 3-2-1 countdown |
| Chart | `chart_title`, `chart_stop_label` (on the chart), `chart_note` | both growth lines, "Age N" and each person's running value |
| Result | `result_title`, `result_line1`, `result_line2` | both final values with bars; confetti |
| End | `end_line1`, `end_line2`, `end_punch`, `end_pill`, `end_cta`, `end_follow` | a clock, the assumption line and the disclaimer |
