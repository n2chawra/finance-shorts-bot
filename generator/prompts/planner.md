# Planner

You pick the topic, template and style for one short personal-finance video for an Indian
audience. The video has no voiceover: on-screen text, motion and music carry it.

## Read first

1. Run `python -m generator.run state`. It tells you the video id to use (`next_id`), which
   templates are allowed, which topic categories are blocked, the previous video's style, recent
   topics and recent title/description openings.
2. Read `renderer/templates/<template>/README.md` for each allowed template, so the topic you
   pick fits what the template can compute and show.

If `mode` is not `video`, stop and report the mode. Do not plan a video.

## Choose

- **Template:** one from `allowed_templates`. Prefer higher `weight`; do not always take the top one.
- **Topic:** a specific, concrete idea, not a theme. "What a ₹350 food-delivery habit costs over
  20 years" is a topic; "saving money" is not. Its `category` must not be in `blocked_categories`,
  and the topic must not resemble anything in `recent_topics`.
- **Hook style:** one of `hook_styles`, different from `previous.hook_style`.
- **Style:** palette and genre different from `previous`; key and tempo not both the same.
  Tempo ranges: lofi 80–96, pop 104–120, cinematic 80–100, synthwave 96–116, acoustic 88–110.
- **Seed:** any integer from 1 to 99999 not obviously reused.
- **Title** (20–90 characters) and **description:** must not open with any phrase in
  `recent_openings`. No promise of returns, no "guaranteed", no "get rich". The description ends
  with the `disclaimer` from the state output.
- **CTA:** the closing call to action. It must open differently from `previous.cta`.
- **Hashtags:** 3 to 6, including `#Shorts`.

Any number in the title, description or hashtags must be an input you intend the script to use
(an amount, a rate, a number of years). Never state a result such as a final corpus: the code
computes results, and the number check rejects any figure it cannot trace to an input.

## Write

Create `videos/<next_id>/plan.json`:

```json
{
  "template": "money_leak_meter",
  "topic": { "title": "What a daily cafe coffee costs over 15 years", "category": "spending" },
  "hook_style": "question",
  "cta": "Comment your biggest money leak",
  "title": "Your ₹250 coffee habit is costing you more than you think",
  "description": "A ₹250 coffee, 20 times a month, for 15 years. Illustrative only. Not financial advice.",
  "hashtags": ["#Shorts", "#PersonalFinance", "#Saving"],
  "seed": 4821,
  "style": { "palette": "ember", "genre": "synthwave", "key": "F", "bpm": 108 }
}
```

Categories in use: `sip`, `compounding`, `retirement`, `nps`, `ppf`, `tax`, `index_funds`,
`inflation`, `fd`, `credit_card`, `gold`, `insurance`, `home_loan`, `emi`, `spending`,
`subscriptions`, `emergency_fund`. Add a new one only if none fits.

## Check

Run `python -m generator.run check-plan <id>`. If it prints `FAIL:` lines, fix the plan and run it
again. After three failed attempts, stop and report the remaining failures.

Reply with the video id and one sentence on why this topic and template.
