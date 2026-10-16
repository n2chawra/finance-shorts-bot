# money_news

A finance news story told for one viewer: the headline figure slams in within the first second,
then what happened, why it matters, what it means for you (a worked example), and the source.
52 s, five scenes: hook → what happened → why it matters → what it means for you → takeaway.

Use it **only for a topic from the research feed** (`state` → `topic_feed`) that comes with
sourced facts. Example script: `examples/money_news.json`.

## Inputs

`feed_id` (the topic's id), `facts` (1–3 sourced figures), `example` (`kind`, `amount`, `years`,
`rate_pct`), `seed`, optional `style`, and `text`. See `schema.json`.

### Sourced facts

Copy each fact **exactly** from the topic's `facts` in the feed: `value`, `unit`, `as_of`, `source`
and `url` must match, or the number check fails. You may only shorten the `label` (no digits). The
first fact is the headline figure. Units: `rupees`, `rupees_lakh`, `rupees_crore`, `percent`,
`count`, `count_lakh`, `count_crore` (₹31,781 Cr, 6.5%, 9.87 Cr ...). The fact reviewer opens every
`url` and fails the video if a figure doesn't match its source. The screen always shows
"Data: <source> · <month year>".

### The example ("what it means for you")

| `kind` | Shows | Bars |
|---|---|---|
| `sip` | `amount` a month for `years` at `rate_pct` | you put in → it becomes |
| `lumpsum` | `amount` once for `years` at `rate_pct` | you put in → it becomes |
| `inflation` | what `amount` buys after `years` at `rate_pct` inflation | today → in N years |

Pick the kind that connects the news to the viewer's own money, with realistic rates (CLAUDE.md
and writer.md ranges).

## Text and placeholders

Text lines must not contain digits or `₹`.

| Placeholder | Example |
|---|---|
| `{fact_a}`, `{fact_b}`, `{fact_c}` | ₹31,781 Cr (sourced facts, in order) |
| `{fact_a_label}` ... | SIP money in one month |
| `{amount}`, `{amount_long}` | ₹5,000 |
| `{years}`, `{rate}` | 15, 12% |
| `{result}`, `{result_long}` | ₹25.2 L, ₹25.2 Lakh |
| `{invested}`, `{gains}`, `{ratio}` | ₹9.0 L, ₹16.2 L, 2.8× (sip and lumpsum only) |
| `{lost_pct}` | 27% (inflation only) |

## Maths

SIP: monthly contribution at the start of each month, compounded monthly. Lump sum: compounded
yearly. Inflation: `amount ÷ (1 + rate)^years`.

## Where each line appears

| Scene | Your lines | Shown with them by the template |
|---|---|---|
| Hook | `headline1` (the news in plain words) | "MONEY NEWS" stamp, **the first fact's value in huge type** and its label |
| What happened | `what_title`, `headline2` (below the cards) | one card per fact (value + label); the source pill |
| Why it matters | `why_title`, `why_line1`–`why_line3` (three short points, up to 36 characters) | coloured bullets |
| What it means for you | `you_title`, `you_line` (below the bars) | a pill with the example's inputs; two growing bars with values |
| End | `end_line1`, `end_line2`, `end_punch`, `end_cta`, `end_follow` | the source line, the assumption line and the disclaimer |

`headline1` must not repeat the figure (it is right above it). `why_line*` are reasons a viewer
cares, not more numbers. Report news, never predict markets or tell people what to buy.

## Voiceover scenes

`hook`, `what`, `why`, `you`, `end`. The hook line starts after the headline figure lands.
