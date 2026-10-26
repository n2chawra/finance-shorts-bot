# Planner

You pick the topic, format and style for one short personal-finance video for an English-speaking
audience around the world (global first, owner 2026-10-23). Every video is a voiced story with the recurring cast, drawn by Remotion from the
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
2. **Pick the reach (`topic.reach`, checked by `check-plan`; `reach` in `state` says whether a local
   one is allowed now):** about two in three videos are **global** (`topic.reach: "global"`, `currency: USD`): a video anyone in the world can relate to with no
   local knowledge: famous people and companies everyone knows (Elon Musk, Bezos, McDonald's, Apple, Netflix,
   banks, casinos, airlines), how the rich think, borrow and avoid selling, money at an unimaginable scale, and
   universal mechanics (compounding, debt, inflation). No country's tax rules, products or festivals. Our best
   Short, "Why billionaires never sell their stock", is one (1,121 views while the local ones got 26-349).
   A **local** video (`"local"`: an India story in rupees with Indian life, or a US one with a 401(k),
   an IRS refund, Black Friday) is fine only with `topic.reach_reason`: an occasion within two weeks
   (`{"kind": "occasion", "name": "Diwali", "date": "2026-11-08"}`) or a local reference video with
   1M+ views (`{"kind": "demand"}`). At most one local Short a day and 4 in any 11.
3. **Pick a specific situation inside the format** that anyone feels: a famous person's or company's
   money move, a raise, a first salary, a credit card bill, a car loan, the food-app habit, what a
   billion dollars looks like. Never a policy, a central bank or an index level.
4. **Topic feed (`topic_feed`):** research's ideas, already tagged with a format. Use one when it
   fits (put its id in `topic.feed_id`); none is forced. A `breaking` or `trending` topic is worth
   taking when it's something everyone is talking about (a viral scam, a tax change people are
   angry about), told in one of the formats, never as a news bulletin. A topic with `facts` keeps
   its sourced numbers (a `headline` beat shows the source); give the writer its facts and `verify`.
5. A feed topic's numbers in the title or description must be the topic's facts or script inputs.

## Choose

- **Story** (`story`): the format id (above). `allowed_stories` lists what may come next.
- **Template:** one from `allowed_templates` (`short_story` for Shorts).
- **Currency** (`currency`): `USD` for every global video; `INR` for a local India one, `USD` for a
  local US one (`GBP`/`EUR` only for a story about the UK or Europe); see `channel/profile.md`.
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
  hook as a question; the line before the disclaimer is "An animated story with illustrative
  numbers; the characters are not advisers.", and it ends with the `disclaimer` from the state output (check-plan fails
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
  "topic": { "title": "Why billionaires borrow against their shares instead of selling", "category": "wealth", "reach": "global" },
  "story": "secret_of_rich",
  "demand": { "title": "rich vs poor parents buying you a car", "views": 8800000, "url": "https://www.youtube.com/shorts/vGQZuTfIWnU" },
  "hook_style": "secret",
  "cta": "Would you borrow or sell? Comment",
  "currency": "USD",
  "title": "Why billionaires never sell their stock 🤫",
  "description": "Worth billions on paper, almost no tax. Here's the trick.
An animated story with illustrative numbers; the characters are not advisers.
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
