# Planner

You pick the topic, format and style for one Short for the channel this run is for. Every video is a
voiced story drawn by Remotion from the writer's storyboard.

**The channel decides** (multi-channel): its `profile.md`, `prompts/recipe.md` (topic kinds and their
shares, the first second, length, look), `channel.json` (language, currency, numbers mode, disclaimer,
cast) and `research/formats.json` win over this page wherever they differ. Many examples below are money
stories because the platform began on a finance channel; read them as patterns, not topics.

## Read first

Read `channels/<channel>/profile.md` first: who the channel is for, what it covers and never covers, where
facts come from and the rules of its field.

**The owner's feedback comes right after the hard rules** (owner, 2026-10-30). `state` →
`owner_feedback`: `open` notes (a `wrong` note is a rule until the improver addresses it; `improve`
and `general` notes shape this video) and `taste` (the videos he picked to publish and the ones he
marked stale, with why). Follow them; if one conflicts with a hard rule, the hard rule wins and you
say so in the report. A note that asks to change the recipe itself (length, hook, pace, voice, format,
style) is not applied here: it becomes the next weekly-loop test (agents/policy.md); notes about
something wrong in a video still shape this one.

1. Run `python -m generator.run state --channel <channel>`. It tells you the video id to use (`next_id`), which
   templates are allowed, which topic categories are blocked, the previous video's style, recent
   topics and recent title/description openings.
2. Read `renderer/templates/<template>/README.md` for each allowed template, so the topic you
   pick fits what the template can compute and show.

If `mode` is not `video`, stop and report the mode. Do not plan a video.

## The champion recipe (the weekly loop, owner 2026-11-12)
Every Short follows one recipe, which changes only when the weekly loop keeps a tested challenger
(agents/policy.md); this video's experiment note, if it has one, is the only exception. Shorts are
judged on the share of people who **stayed to watch** instead of swiping (ours was 24-52%). What the review found: of the
people YouTube showed a Short to, most swiped within a second or two, because the title and the first
sentence hid the subject. The same Magic Johnson story got 70,000 views on a small channel titled
"The NBA Paid Magic Johnson $40M. He Made A Billion" and 419 on ours as "The basketball star who got
rich off the court".
- **Pick one surprising true money fact about a real, named person or business** (how a famous
  business really makes money, a billionaire question, money at scale), with its figures as `facts`
  from the topic feed. A trap or a which-one-are-you may take one Short in three; personal-budget
  formats (`tier: low`) are off. `check-plan` enforces both.
- **The thing in your hand** (owner, 2026-11-16, after the content research: every Short stopped at
  150-1,190 views, and from 9-16 Nov only 1 of 31 topics was about something the viewer touches).
  Two in three Shorts start from something the viewer buys, pays for or watches and go behind it to
  the real business: what it makes on the thing you buy ("How much does a petrol pump make on one
  litre?", 1.49M views on a 1.5K-subscriber channel), why it is so cheap or so expensive ("Why is
  Costco's hot dog still $1.50?", 624K), a real game, film or tour priced in your money ("How GTA 6
  could cost you $11,000", 978K), a celebrity's money moving (net worth year by year, per second, who's
  richer), what the workers at a place you visit earn. At most one Short a day is a pure celebrity or
  company figure, and it is still asked about something the viewer can picture. Skip a lane other
  channels posted 5+ times this week with nothing above 5K (this week: Apple's services share,
  Costco's operating income, Elon's net worth in cash).
- **The title names the subject and asks; the payoff waits** (owner, 2026-11-16; of 20 money Shorts at
  160K-9.6M views, none stated its answer in the title and 13 asked a question; ours with a question
  had a median of 637 views, name-and-figure statements 456). "How much does Costco make on a {price}
  hot dog?" · "Why does Google pay Apple to be the search bar?" At most one figure in the title, and
  never the payoff's: "A streaming giant spent $17.1B on new shows and still kept $11B" told the whole story,
  and 33% left at 5.9 s on the line the title had already said (`number-check` fails it). Never a
  title that hides who it is about ("The basketball star who…", "The biggest pay deal ever…"). The
  plan's `subject` is that name; the description's first two lines and one hashtag carry it too.
- **The hook asks the same question in spoken words** (the writer's contract): no "You think …?",
  no "Watch this.".
- A `note:` from a check is advice, never a reason to plan again: only a `FAIL:` is.

## A promo channel: every Short promotes a long video (owner, 2026-11-25)

When `state` has a `promo` block (the channel's `channel.json` `cadence.promoOnly`; Disaster Desk), the Short is a
promo of one of the channel's long videos and the topic feed is empty on purpose:
- Take the first entry of `promo.targets` (another one only if the first can't pass the variety rules). Set
  `"promo_of": "<its id>"` and `topic.feed_id` to its `feed_id`, `topic.category` to its `category`. Its facts are
  the long video's feed topic's (`python -m generator.run state --format long --channel <channel>` is not needed:
  read `channels/<channel>/videos/<id>/script.json` of the long video for the story and its `facts`).
- Pick a moment of the long video no promo has told yet (`promoted_moments`), and a promo format from `formats`.
- Everything else below still applies (story, demand, shape, hook, look, title rules); the variety rules treat the
  long video and its other promo as the same story, so the category and the topic may repeat.

## Step 0 for a Short: take the variant system's options
Run `python -m improvement.arms assign --video <id>` and copy its JSON into the plan as `"arms"`
(`check-plan` fails a plan without it or with options changed). While the variant system is off it returns the
same options for every Short and decides nothing else:
- `length` "28-35": the Short's length in seconds (tell the writer; the render checks it).
- `title` "figure_or_name": a money figure or a famous name in the title (the recipe asks for the
  name, and at most one figure, never the payoff's).
- `style` "shot": shot/build beats, no board cards.
- `category`: nothing to do; the publisher uploads every video in one category.
The hook style and the topic kind are yours: rotate `hook_style` as the variety rule asks.
The plan always names `"subject"`: the famous person or company the story is about ("Elon Musk",
"MrBeast", "Costco"); `check-plan` fails without it.

## What to make: demand first (owner reset, 2026-10-21)

The channel exists to make videos **people already want to watch**, not news. Before the reset the
feed was news first: 17 Shorts got 1–60 views each and viewers watched under 35% of them. What gets
millions is curiosity, awe, envy and the fear of being cheated, in the shapes the niche's hits use
(`formats` in `state`).

1. **Pick a format from `formats`** (in `state`; `channels/<channel>/research/formats.json`). Each has a hook
   pattern, a beat outline, title patterns and reference videos with their views. Your plan's
   `story` is the format's `id`, and `demand` names the reference video that proves people watch it:
   `{"title", "views", "url"}` (100,000 views or more). `check-plan` fails without both.
   Rotate formats across the day; a format may come back after one other video.
   **Core formats first** (owner, 2026-10-30): at least 2 of every 3 Shorts use a `tier: core` format
   (`core_formats` in `state`). When `core_needed` is true this one must. The third may test any
   format; `tier: low` formats only when nothing better fits.
1b. **Pick the shape** (`shape`): how the beats are arranged, from `shapes` in `state` (the library,
   least used first; `blocked` ones were used in the last 3 videos). Choose by the topic: one hidden
   answer is a `reveal`, two people one difference a `versus`, a ladder people climb `levels` (at
   most 1 in 3 videos), one change over time `before-after` or `timeline`, an imagined scenario
   `what-if`, a few things of one kind a `countdown`. When none fits, invent one:
   `"shape": {"id": "the-heist", "name": "The heist", "beats": "hook -> ... -> payoff", "why": "..."}`.
   It joins the library when the video ships, and the improver keeps it if it performs.
2. **Pick the reach (`topic.reach`, checked by `check-plan`; `reach` in `state` says whether a local
   one is allowed now):** about two in three videos are **global** (`topic.reach: "global"`, `currency: USD`): a video anyone in the world can relate to with no
   local knowledge: famous people, places and companies everyone knows (Elon Musk, McDonald's, Apple, the
   Sahara, the Titanic), how the rich think, borrow and avoid selling, money at an unimaginable scale, and
   universal mechanics (compounding, debt, inflation). No country's tax rules, products or festivals. Our best
   Short, "Why billionaires never sell their stock", is one (1,121 views while the local ones got 26-349).
   **Known everywhere, not just big** (owner, 2026-11-14, on the Costco Short: "who doesnt know about
   costco will leave"): ask whether a viewer in India, Nigeria or the Philippines has used or heard of the
   subject. A brand that trades mainly in one country (Costco, Walmart, Target, Chipotle, Flipkart, Tesco)
   is local however big it is there; `check-plan` fails one in a global plan.
   A **local** video (`"local"`: an India story in rupees with Indian life, or a US one with a 401(k),
   an IRS refund, Black Friday) is fine only with `topic.reach_reason`: an occasion within two weeks
   (`{"kind": "occasion", "name": "Diwali", "date": "2026-11-08"}`) or a local reference video with
   1M+ views (`{"kind": "demand"}`). At most one local Short a day and 4 in any 11.
3. **Pick a specific situation inside the format** that anyone feels: a famous person's or company's
   money move, a raise, a first salary, a credit card bill, a car loan, the food-app habit, what a
   billion dollars looks like. Never a policy, a central bank or an index level.
3b. **Not a textbook topic** (owner, 2026-11-09: "the 3 topics for today are pretty basic … I don't
   think most people would want to see it"). The format can be right and the topic still basic: the
   test is whether a typical viewer already knows the answer. Before you pick, say the surprise in
   one line to yourself; if it's something people have heard all their lives, pick another topic.
   - Basic (skip): "your bank lends your savings and pays you almost nothing" (everyone knows banks
     lend deposits), what interest or inflation is, why to budget, "save more than you spend".
   - Not basic: a famous name doing something that contradicts what everyone assumes, or money at a
     scale nobody pictures: "Delta earns more from its Amex card than from flying", "billionaires
     never sell their stock, they borrow against it", "Musk's salary is $0", "what a billion dollars
     looks like stacked". Our 1K+ Shorts were all of this kind; a famous name alone isn't enough
     ("an athlete got rich off the court" is basic unless the how is surprising).
   Among feed topics of similar score, take the less obvious one.
4. **Topic feed (`topic_feed`):** research's ideas, already tagged with a format: **every unused
   topic, old or new, best `score` first**. `why_score` shows the parts: proven demand (capped at
   10M views), our own results with that format (`ours`) and with that topic category
   (`ours_category`: views at 48 h against our median, and stayed to watch against our average), a
   bonus for a format we haven't told lately (`explore`: test every kind of video, not only the most
   viewed), global, priority, and age (`generator/topics.py`). `topic_feed.own_results` lists our
   stories and categories best first, with `winning` and `losing`: **our own viewers outrank another
   channel's reference video** (owner, 2026-11-27). Between topics of similar score, take the one in a
   winning category; take a losing one only with a clearly different angle, and say why in the plan.
   A group with one or two Shorts is a hint, not a verdict. Judge the whole list, not just
   the newest night's: an older topic with a stronger reference is often the better video. Pick the
   one with the biggest proven demand that fits today's rules (reach, category, format), put its id
   in `topic.feed_id`; none is forced. A `breaking` or `trending` topic is worth
   taking when it's something everyone is talking about (a viral scam, a tax change people are
   angry about), told in one of the formats, never as a news bulletin. A topic with `facts` keeps
   its sourced numbers (a `headline` or `board` beat shows the source); give the writer its facts and
   `verify`. **Prefer topics with facts** (owner, 2026-11-02): real names with real figures hold
   viewers far longer than invented examples. A topic told as a parable (`ladder` shape) needs none.
5. A feed topic's numbers in the title or description must be the topic's facts or script inputs.

## Choose

- **Story** (`story`): the format id (above). `allowed_stories` lists what may come next.
- **Template:** one from `allowed_templates` (`short_story` for Shorts).
- **Currency** (`currency`): `USD` for every global video; `INR` for a local India one, `USD` for a
  local US one (`GBP`/`EUR` only for a story about the UK or Europe); see `channels/<channel>/profile.md`.
- **Topic:** a specific, concrete situation, not a theme. "Rich vs poor: what each does with a
  ₹20,000 raise" is a topic; "saving money" is not. Its `category` must not be in
  `blocked_categories`, and the topic must not resemble anything in `recent_topics`.
- **Hook style:** one of `hook_styles` (`conflict` and `secret` suit the skit formats), different
  from `previous.hook_style`.
- **Style:** palette and genre different from `previous`; key and tempo not both the same. Never a palette in `looks.retired_palettes` (check-plan fails it).
- **Look** (`style.look`, the board's look; `state.looks` has the options and the last videos' looks):
  `{"stage", "header", "holder", "entrance"}`, not the same combination as any of the last 10 videos and
  neither the stage nor the header style of the previous one (`check-plan` enforces it). Pick what
  suits the story (a night stage for a secret, a receipt for a shop's money, a phone for an app).
- **Shape** for a question with layers: `question-chain` (one asks, another answers on
  cards; real names and sourced facts); for one money idea shown as people climbing it: `ladder` (a
  parable, the sum built from units at every step, a named term per step); for how a real company or
  place got rich: `true-history` (dated facts). Their rules: `renderer/templates/short_story/README.md`.
  Tempo ranges: lofi 80–96, pop 104–120, cinematic 80–100, synthwave 96–116, acoustic 88–110.
- **Seed:** any integer from 1 to 99999 not obviously reused.
- **Title** (20–60 characters works best on Shorts; at most 90) and **description:** write titles
  like the format's `titles`: curiosity, envy or a warning, the way the reference videos do it
  ("How the rich…", "Rich vs Poor: …", "The ___ trap", "Why ___ never…", "What ___ really
  leaves you"). One emoji is fine. No news words ("announces", "this month", "decides", "hike").
  Must not open with any phrase in `recent_openings` and must not share a shape with the last
  3 videos. No promise of returns, no "guaranteed". The description's first line restates the
  hook as a question; the line before the disclaimer names where the facts come from:
  "Sources: <each fact's `source`, once each> (<month year of the newest `as_of`>). The characters are
  not advisers." (research adopt, 2026-11-14: every Short is true since 12 Nov, so "illustrative
  numbers" was untrue, and the same boilerplate on every upload reads as mass-produced). Only a video
  with no `facts` keeps "An animated story with illustrative numbers; the characters are not
  advisers.". It ends with the `disclaimer` from the state output (check-plan fails
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

Create `channels/<channel>/videos/<next_id>/plan.json`:

```json
{
  "template": "short_story",
  "topic": { "title": "Why billionaires borrow against their shares instead of selling", "category": "wealth", "reach": "global" },
  "story": "secret_of_rich",
  "shape": "reveal",
  "demand": { "title": "rich vs poor parents buying you a car", "views": 8800000, "url": "https://www.youtube.com/shorts/vGQZuTfIWnU" },
  "hook_style": "secret",
  "cta": "Would you borrow or sell? Comment",
  "currency": "USD",
  "title": "Why billionaires never sell their stock 🤫",
  "description": "Worth billions on paper, almost no tax. Here's the trick.
Sources: Forbes, ProPublica (Nov 2026).
<the channel's disclaimer from state>",
  "hashtags": ["#Shorts", "#RichVsPoor", "#Money", "#PersonalFinance"],
  "subject": "",
  "seed": 4821,
  "style": { "palette": "ember", "genre": "synthwave", "key": "F", "bpm": 108,
             "look": {"stage": "flat", "header": "strip", "holder": "blackboard", "entrance": "pop"} }
}
```

For a feed topic, `topic` also has `"feed_id": "<the topic's id>"`. A trend you found yourself
(the midday trend run only) goes in `topic.trend` instead — see `generator/prompts/trend_run.md`.

A channel whose `cycle/plan-rules.json` has `mapAnswer` (the geography channel, owner 2026-11-20: "anything
topics that are explained not in the map are wrong") also writes `topic.map_answer`: one line naming what on
the map the answer is (a border, a route, a shape, a distance, where a place sits next to another; a feed
topic's own `map_answer` when it has one). If the answer is a machine, a law, a habit or a cut-away, pick
another topic: check-plan fails it (`generator/planrules.py`).

Categories in use: `compounding`, `investing`, `index_funds`, `retirement`, `credit_card`, `debt`,
`mortgage`, `loans`, `inflation`, `interest_rates`, `savings`, `emergency_fund`, `budgeting`,
`spending`, `subscriptions`, `tax`, `insurance`, `housing`, `gold`, `salary`, `car`, `business`, `wealth`; India stories also `sip`, `fd`,
`ppf`, `nps`, `emi`, `home_loan`. Add a new one only if none fits.

## Check

Run `python -m generator.run check-plan <id> --channel <channel>`. If it prints `FAIL:` lines, fix the plan and run it
again. After three failed attempts, stop and report the remaining failures.

Reply with the video id and one sentence on why this topic and template.
