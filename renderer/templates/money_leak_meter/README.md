# money_leak_meter

A small regular expense is added up (per month, per year, over the years on a gauge), then
compared with what the same money would have become as a monthly SIP. 54 s, seven scenes:
hook → leak counters → gauge → "what if you invested it?" → growth chart → spent vs invested → takeaway.

Example script: `examples/money_leak_meter.json`.

## Inputs

`item` (what the money goes on, lower case), `cost` (rupees each time), `times_per_month`, `years`,
`annual_return_pct`, `seed`, optional `style`, and `text`. See `schema.json`.

## Text and placeholders

Text lines and `item` must not contain digits or `₹`.

| Placeholder | Example |
|---|---|
| `{item}` | food delivery |
| `{cost}` | ₹350 |
| `{times}` | 8 |
| `{years}`, `{rate}` | 20, 12% |
| `{monthly}`, `{yearly}` | ₹2,800, ₹33,600 |
| `{spent}`, `{spent_long}` | ₹6.7 L, ₹6.7 Lakh |
| `{fv}`, `{fv_long}` | ₹28.0 L, ₹28 Lakh |
| `{gains}` | ₹21.3 L (fv − spent) |
| `{ratio}` | 4.2× (fv ÷ spent) |

## Maths

`monthly = cost × times_per_month`, `spent = monthly × 12 × years`. `fv` is a SIP of `monthly`
at the start of every month for `years`, compounded monthly at `annual_return_pct / 12`.

## Where each line appears

| Scene | Your lines | Shown with them by the template |
|---|---|---|
| Hook | `hook_title`, `hook_sub`, `hook_tease` | a wallet dropping coins |
| Leak | `leak_title`, then `leak_note` (pill at the bottom) | "Every month" and "Every year" cards with `{monthly}` and `{yearly}` |
| Meter | `meter_title`, and `meter_label` **directly under the total** | a gauge; **`{spent}` counting up in large type above `meter_label`**; "Year N" |
| Flip | `flip_line1`, `flip_line2` (one question across two lines) | a character |
| Grow | `grow_title` | a chart of money put in against its value; "Put in" and "Worth" with their values |
| Compare | `cmp_title`, `cmp_line` | two bars labelled "Spent" (`{spent}`) and "Invested" (`{fv}`) |
| End | `end_line1`, `end_line2`, `end_punch`, `end_cta`, `end_follow` | the assumption line and the disclaimer |

`meter_label` must read as a caption for the total above it (for example "gone on {item}").
