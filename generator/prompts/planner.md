# Planner

You pick the topic, format and style for one short personal-finance video for English-speaking
viewers in India and the US. Every video is a voiced story with the recurring cast, drawn by Remotion from the
writer's storyboard.

## Read first

Read `channel/profile.md` first: who the channel is for, what it covers and never covers, where
facts come from and the rules of its field.

1. Run `python -m generator.run state`. It tells you the video id to use (`next_id`), which
   templates are allowed, which topic categories are blocked, the previous video's style, recent
   topics and recent title/description openings.
2. Read `renderer/templates/<template>/README.md` for each allowed template, so the topic you
   pick fits what the template can compute and show.

If `mode` is not `video`, stop and report the mode. Do not plan a video.

## What to make: demand first (owner reset, 2026-10-21)

The channel exists to make videos **people already want to watch**, not news. Before the reset the
feed was news first (Fed, ECB, energy caps, rate decisions): 17 Shorts got 1–60 views each and
viewers watched only 20–35% of them. What gets millions in finance is curiosity, envy and the fear
of being cheated: rich vs poor, what the rich know, traps, how companies really make money, what a
salary really leaves you, which money level you are on.

1. **Pick a format from `formats`** (in `state`; `improvement/research/formats.json`). Each has a hook
   pattern, a beat outline, title patterns and reference videos with their views. Your plan's
   `story` is the format's `id`, and `demand` names the reference video that proves people watch it:
   `{"title", "views", "url"}` (100,000 views or more). `check-plan` fails without both.
   Rotate formats across the day; a format may come back after one other video.
2. **Pick the market:** about half the Shorts are for **India** (`currency: INR`, Indian life:
   salaries in lakhs, EMIs, Swiggy and Zomato, rent in Bangalore or Mumbai, the rich uncle, the
   middle-class family) and half for the **US** (`USD`: $100K salaries, car payments, credit card
   debt, 401(k)s, rent in New York or Texas). Each day has at least one of each; alternate with the
   previous video.
3. **Pick a specific, everyday situation inside the format** that a 20–35-year-old lives: the first
   salary, a raise, a car loan, a phone on EMI, a credit card bill, rent vs buying, a wedding, the
   food-app habit. Never a policy, a central bank or an index level.
4. **Topic feed (`topic_feed`):** research's ideas, already tagged with a format. Use one when it
   fits (put its id in `topic.feed_id`); none is forced. A `breaking` or `trending` topic is worth
   taking when it's something everyone is talking about (a viral scam, a tax change people are
   angry about), told in one of the formats, never as a news bulletin. A topic with `facts` keeps
   its sourced numbers (a `headline` beat shows the source); give the writer its facts and `verify`.
5. A feed topic's numbers in the title or description must be the topic's facts or script inputs.

## Choose

- **Story** (`story`): the format id (above). `allowed_stories` lists what may come next.
- **Template:** one from `allowed_templates` (`short_story` for Shorts).
- **Currency** (`currency`): `INR` for an India Short, `USD` for a US one (`GBP`/`EUR` only for a
  story about the UK or Europe); see `channel/profile.md`.
- **Topic:** a specific, concrete situation, not a theme. "Rich vs poor: what each does with a
  ₹20,000 raise" is a topic; "saving money" is not. Its `category` must not be in
  `blocked_categories`, and the topic must not resemble anything in `recent_topics`.
- **Hook style:** one of `hook_styles` (`conflict` and `secret` suit the skit formats), different
  from `previous.hook_style`.
- **Style:** palette and genre different from `previous`; key and tempo not both the same.
  Tempo ranges: lofi 80–96, pop 104–120, cinematic 80–100, synthwave 96–116, acoustic 88–110.
- **Seed:** any integer from 1 to 99999 not obviously reused.
- **Title** (20–60 characters works best on Shorts; at most 90) and **description:** write titles
  like the format's `titles`: curiosity, envy or a warning, the way the reference videos do it
  ("How the rich…", "Rich vs Poor: …", "The ___ trap", "Why ___ never…", "What ___ really
  leaves you"). One emoji is fine. No news words ("announces", "this month", "decides", "hike").
  Must not open with any phrase in `recent_openings` and must not share a shape with the last
  3 videos. No promise of returns, no "guaranteed". The description's first line restates the
  hook as a question, and it ends with the `disclaimer` from the state output (check-plan fails
  without it: Shorts have no end card any more).
- **CTA:** a comment prompt that suits the format ("Which one are you?", "Rich or poor move?",
  "Did you fall for this?"). It must open differently from `previous.cta`.
- **Hashtags:** 3 to 6 for a Short, including `#Shorts`.

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
  "template": "short_story",
  "topic": { "title": "Rich vs poor: what each does with a ₹20,000 raise", "category": "salary" },
  "story": "rich_vs_poor",
  "demand": { "title": "rich vs poor parents buying you a car", "views": 8800000, "url": "https://www.youtube.com/shorts/vGQZuTfIWnU" },
  "hook_style": "conflict",
  "cta": "Rich move or poor move? Comment",
  "currency": "INR",
  "title": "Rich vs Poor: your ₹20,000 raise 💸",
  "description": "Same raise, two very different lives. Which one are you?
Illustrative only. Not financial advice.",
  "hashtags": ["#Shorts", "#RichVsPoor", "#Money", "#PersonalFinance"],
  "seed": 4821,
  "style": { "palette": "ember", "genre": "synthwave", "key": "F", "bpm": 108 }
}
```

For a feed topic, `topic` also has `"feed_id": "<the topic's id>"`. A trend you found yourself
(the midday trend run only) goes in `topic.trend` instead — see `generator/prompts/trend_run.md`.

Categories in use: `compounding`, `investing`, `index_funds`, `retirement`, `credit_card`, `debt`,
`mortgage`, `loans`, `inflation`, `interest_rates`, `savings`, `emergency_fund`, `budgeting`,
`spending`, `subscriptions`, `tax`, `insurance`, `housing`, `gold`, `salary`, `car`, `business`, `wealth`; India stories also `sip`, `fd`,
`ppf`, `nps`, `emi`, `home_loan`. Add a new one only if none fits.

## Check

Run `python -m generator.run check-plan <id>`. If it prints `FAIL:` lines, fix the plan and run it
again. After three failed attempts, stop and report the remaining failures.

Reply with the video id and one sentence on why this topic and template.
