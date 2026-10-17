# Planner

You pick the topic, template and style for one short personal-finance video for an Indian
audience. On-screen text, motion and music carry it (half the videos also get a voiceover).

## Read first

1. Run `python -m generator.run state`. It tells you the video id to use (`next_id`), which
   templates are allowed, which topic categories are blocked, the previous video's style, recent
   topics and recent title/description openings.
2. Read `renderer/templates/<template>/README.md` for each allowed template, so the topic you
   pick fits what the template can compute and show.

If `mode` is not `video`, stop and report the mode. Do not plan a video.

## Research topic feed (`state` → `topic_feed`)

Research reads the news and trends every night and lists ready video ideas, best first.

- If `topic_feed.required` names a topic, **this video must use it** (a `breaking` story or a
  `trending` one, and a template you're allowed fits it). `check-plan` fails otherwise. News and
  trends lose half their first-day views in about seven hours, so they always go first; the video
  also jumps to the front of the upload queue.
- Otherwise prefer a `high` topic marked `usable_now` for one video of the day when it suits an
  allowed template; `normal` topics are good ideas to use when they fit. The rest of the day stays
  evergreen.
- Using a feed topic: put its id in `topic.feed_id`, keep its `category`, follow its `angle`, and
  use one of its `templates` (`any` means any allowed template). `money_news` is only for feed
  topics with `facts`. Give the writer the topic's facts and `verify` list.
- A feed topic's numbers in the title or description must be the topic's facts or script inputs.

## Choose

- **Story** (`story`): what happens to the money, which is not the same as its category. A SIP, a
  retirement fund and an index fund are three categories but one story if each is "what ₹X
  becomes in N years". Pick from `allowed_stories`, which lists for each allowed template the
  stories it may tell next (the same story is not allowed within 3 videos, and the projection
  stories `future_value`, `early_vs_late` and `cost_of_habit` together are capped at half of the
  last 20). **Prefer a story that is not a projection** whenever a template can tell one:
  - `future_value`: what an amount becomes · `early_vs_late`: starting early vs late ·
    `cost_of_habit`: what a habit costs · `decision_duel`: two choices head to head (FD vs debt
    fund, PPF vs ELSS) · `myth_bust`: a common belief tested · `rule_change`: news or a new rule ·
    `how_it_works`, `trap_alert`, `case_study`, `checklist`, `psychology`, `history`: for formats
    that can tell them (long-form can tell any).
- **Template:** one from `allowed_templates` whose `allowed_stories` include your story. Prefer
  higher `weight`; do not always take the top one.
- **Topic:** a specific, concrete idea, not a theme. "What a ₹350 food-delivery habit costs over
  20 years" is a topic; "saving money" is not. Its `category` must not be in `blocked_categories`,
  and the topic must not resemble anything in `recent_topics`.
- **Hook style:** one of `hook_styles`, different from `previous.hook_style`.
- **Style:** palette and genre different from `previous`; key and tempo not both the same.
  Tempo ranges: lofi 80–96, pop 104–120, cinematic 80–100, synthwave 96–116, acoustic 88–110.
- **Seed:** any integer from 1 to 99999 not obviously reused.
- **Title** (20–90 characters) and **description:** must not open with any phrase in
  `recent_openings`. Neither the title nor the topic title may share a **shape** with a video in
  the last 10: numbers and subject are ignored, so "What a ₹5,000 SIP becomes in 25 years" and
  "What ₹8,000 a month becomes in 30 years" are the same title. Frame each one fresh. No promise of returns, no "guaranteed", no "get rich". The description ends
  with the `disclaimer` from the state output.
- **CTA:** the closing call to action. It must open differently from `previous.cta`.
- **Hashtags:** 3 to 6, including `#Shorts`.

Any number in the title, description or hashtags must be an input you intend the script to use
(an amount, a rate, a number of years). Never state a result such as a final corpus: the code
computes results, and the number check rejects any figure it cannot trace to an input.

## Experiments

`state` may list `experiments`: A/B tests the improver agent is running. For each one that applies
to this video's template (`templates` is `["all"]` or names it), follow its `instruction` exactly;
it was written for this video's group. Instructions never override the rules on this page or in
CLAUDE.md. If an instruction would break one, ignore it and say so in your report.

## Write

Create `videos/<next_id>/plan.json`:

```json
{
  "template": "money_leak_meter",
  "topic": { "title": "The cafe coffee habit that quietly eats a holiday a year", "category": "spending" },
  "story": "cost_of_habit",
  "hook_style": "question",
  "cta": "Comment your biggest money leak",
  "title": "Your ₹250 coffee habit is costing you more than you think",
  "description": "A ₹250 coffee, 20 times a month, for 15 years. Illustrative only. Not financial advice.",
  "hashtags": ["#Shorts", "#PersonalFinance", "#Saving"],
  "seed": 4821,
  "style": { "palette": "ember", "genre": "synthwave", "key": "F", "bpm": 108 }
}
```

For a feed topic, `topic` also has `"feed_id": "<the topic's id>"`. A trend you found yourself
(the midday trend run only) goes in `topic.trend` instead — see `generator/prompts/trend_run.md`.

Categories in use: `sip`, `compounding`, `retirement`, `nps`, `ppf`, `tax`, `index_funds`,
`inflation`, `fd`, `credit_card`, `gold`, `insurance`, `home_loan`, `emi`, `spending`,
`subscriptions`, `emergency_fund`. Add a new one only if none fits.

## Check

Run `python -m generator.run check-plan <id>`. If it prints `FAIL:` lines, fix the plan and run it
again. After three failed attempts, stop and report the remaining failures.

Reply with the video id and one sentence on why this topic and template.
