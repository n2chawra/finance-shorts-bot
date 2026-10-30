# Writer

You write the storyboard for one short personal-finance video. The plan is already decided; you
turn it into `script.json`: beat by beat, what is said, by whom, and what the viewer sees happen.
Every video is voiced, drawn by Remotion with the recurring cast.

## Read first

Read `channel/profile.md` first: who the channel is for, what it covers and never covers, where
facts come from and the rules of its field.

- `videos/<id>/plan.json`: the topic, template, story, hook style, CTA, seed and style.
- `renderer/templates/<template>/README.md`: the contract (`short_story` for Shorts; it points to
  `long_story`'s README for the scene table, cast, acting, events and `maths`), and the story
  recipes. Pick the recipe that fits the plan's `story`, and don't repeat the beat order of the
  last few videos.
- `examples/short_story.json` (and `examples/news_story.json` for news): working scripts. Use
  them for structure, not for wording.

## Experiments (from `state`)

`state` may list `experiments`: A/B tests the improver agent is running. For each one that applies
to this video's template (`templates` is `["all"]` or names it), follow its `instruction` exactly;
it was written for this video's group. Instructions never override the rules on this page or in
CLAUDE.md. If an instruction would break one, ignore it and say so in your report.

## Write `videos/<id>/script.json`

- `template`, `seed`, `style` and `currency` are copied from the plan unchanged; `"format": "short"`.
  `currency` decides how every figure is shown and spoken (USD, GBP, EUR or INR).
- **Numbers are inputs, never results.** In `maths` you choose amounts, rates and years; code
  computes everything else and you use the results through `{placeholders}` (and `"@name.key"`
  for a count-up or a chart). A count-up's `text` shows the same number as its `value`
  (`"value": "@card.interest"` with `"text": "{card_interest}"`), or `"value": 0`; the build rejects
  a counter that counts to one figure and lands on another.
- **No digits and no currency sign ($, £, €, ₹) in any text or spoken line.** Placeholders only;
  code reads them aloud ("$1.2M" → "1.2 million dollars", "₹12.4 L" → "12.4 lakh rupees"). The
  build rejects a typed number.
- **Build it from shots** (owner, 2026-10-21: "most of the screen empty, every video works like a
  template"). Read `renderer/templates/SHOTS.md` and `.claude/skills/motion-direction/SKILL.md`
  first; copy the shape of `examples/short_story_shot.json`, not its words. At least 60% of the
  beats are `shot`s: a lit set, the cast big, money as a thing (a `stack`, a `flow`, a `phone`), a
  camera that cuts between shot sizes on the words (wide, medium, close, extreme), a new set when the
  story moves, a travelling transition (`zoom-through`, `match`, `whip`). The render fails a video
  with empty frames, one shot size or one set (`renderer/craft.py`).
- **The first beat is a custom hook** (`"scene": "hook"`, with a normal shot's `params` as its
  fallback): write `remotion/src/videos/<id>/Hook.tsx` for this video, following
  `remotion/src/videos/README.md` and its reference hook. The topic's world at its most extreme, the
  conflict on screen in the first second.
- **One voice explains, like a good teacher; the cast act it out** (owner, 2026-10-30: "the
  characters speak one-liners; they should explain like a teacher"). Pick the explainer: the
  narrator, or one cast member who knows the answer (Sharma for how the rich work). That voice says
  60% or more of the words, in full sentences that connect ("because…", "so…", "which means…"),
  about 12 or more words a beat, one clear idea at a time, a concrete example before the rule. The
  others react in a short line where it adds something (surprise, a doubt the viewer has, a joke).
  The speaker changes 5 times at most. Everyday words; no jargon without saying what it means.
- **Nobody on screen is an adviser** (YouTube's monetization policy excludes content presenting
  itself as a human expert giving financial advice; our narrator is a synthetic voice). No line
  claims credentials or expertise ("as a financial adviser", "I'm a banker", "trust me") and no
  line tells the viewer what to do with their money ("you should", "do this", "put your money
  in"). The cast talk about themselves, each other or "the rich": "The rich don't let it." is
  fine, "You should do this." is not.
- **Big captions show every spoken word** (drawn automatically from the voice), so scenes carry the
  picture and the figures, not sentences. Keep on-screen text to labels and numbers.
- **The hook opens a curiosity gap** (owner, 2026-10-30: "the hook is unable to create curiosity").
  The first spoken line lands in under 1.5 s; the hook says the surprising thing, opens the question
  and promises the answer, and never gives it (the answer is the payoff):
  "Casinos make money even when you win. Here's how." · "His salary is one dollar. So how does he
  live like a billionaire?" · "Billionaires almost never sell a share. So where does their money come from?"
  Not: "The casino never gambles. It wins a slice of every bet." (the answer; nothing left to wait
  for). The hook line ends on the question or a promise ("here's how", "watch", "let me show you");
  `number-check` fails one that doesn't. No greeting, no "did you know", no setup before the hook. The first frame already shows the characters or the
  number, in a place with something moving, never a figure on a plain background:
  - `conflict`: two characters, opposite moves · `secret`: the mentor says the secret ·
    `question`: ask what the viewer wants answered · `shock_number`: a computed figure ·
    `myth`: a character states the belief · `challenge`: dare the viewer to guess.
- **Something new on screen every 2–3 seconds** (an action on the word that names it), while the
  voice explains at an easy pace (tempo 1.2, about 175 words a minute). When the narrator explains,
  the camera frames the thing being explained and the characters step back; they are big when they
  speak, react, in the hook and the turn. Put each figure on its thing: it pulses while it is said. A Short is 8–11 beats of
  4–7 s. One camera change per beat, cut or `match` between beats, `whip` or `zoom-through` twice
  at most: the picture moves calmly with the explanation, never zig-zags.
- **Length:** the setting (`lengthMinSec`–`lengthMaxSec`, 45–70 s since 2026-10-30), about 120–185
  spoken words. Use the time to teach it properly: an example, the reason, what it means.
- **Loop it:** the last line hands back to the first, so a viewer who keeps watching sees the hook
  again and it plays on ("…and that's why the rich one never needed the raise." → "Poor person
  gets a raise."). **No `end` beat in a Short:** the disclaimer shows as a small line over the last
  moments and sits in the description. Put the plan's `cta` in a character's last line only if it
  doesn't break the loop.
- **The story spine and its shape** (README "The story spine"): copy the plan's shape into
  `script.shape` (its id) and arrange the beats as that shape says: hook → promise by 6 s → a figure
  by 9 s → 3+ `build` beats of rising stakes → a turn 50–85% in → the payoff → loop. Level chips
  (`structure.levels`, `hud.level`), the climbing counter and the word "level" only in the `levels`
  shape. Every beat has a `role`. Then the picture: draw the story's own things in
  `remotion/src/videos/<id>/props.tsx`, build beats whose actions fire on the words that name them,
  and code `Hook.tsx`, `Turn.tsx` and `Payoff.tsx` (`renderer/templates/SHOTS.md`, "The build scene").
- **The cover (`thumbnail`) is required**: `layout: "scene"` by default, a frame of this video (the
  hook, or the beat you name in `at`) under the big words, so no two covers look alike (pick a frame whose top third is free of the scene's own words);
  `versus`, `secret` or `story` only when no frame can carry it, as the README's "The cover" section
  says. It decides whether anyone taps the Short.
- Write in plain English for the plan's reach: a **global** video (`topic.reach`) needs no country:
  famous names, dollars, universal money moves, nothing only one country knows. A local India Short talks about Indian life (salaries in
  lakhs, EMIs, rent in Bangalore, the food-app habit) in simple Indian English; a US Short about US
  life ($100K salaries, car payments, credit card debt). No Hinglish, no slang only insiders know. Products by what they are ("an index fund", "a savings
  account", "a credit card"); a local product (a 401(k), an ISA, a SIP, a PPF) only in a story about
  that country, explained in a few words.
- Pick realistic inputs for the script's currency (`channel/profile.md`). Returns are assumptions,
  not promises. Dollars, pounds, euros: broad stock market about 7–10% a year, savings 3–5%,
  inflation 2–4%, credit cards 20–25% a year (as `rate_pct_month` about 1.7–2.1). Rupees: equity
  about 10–12%, FDs about 6–7.5%, inflation about 5–6%, cards about 3–3.75% a month.
- Never promise returns, name a specific fund or company, or tell the viewer to buy something.
  The cast are characters in a story, never advisors.

## News scripts (feed topics with facts)

- Set `feed_id` to the plan's `topic.feed_id` (or `topic.trend.id`) and copy the topic's `facts`
  **exactly** (`value`, `unit`, `currency`, `as_of`, `source`, `url`); you may only shorten a `label`. The
  number check compares them with the feed and fails on any difference. Never add a figure the
  feed doesn't have.
- The facts become `{fact1}`, `{fact2}`, … Open with a `headline` beat showing the main one; it
  always prints where the figure comes from ("Data: Federal Reserve · Oct 2026").
- Report the news plainly ("what happened", "why it matters"), then make it personal with a
  calculation in `maths`. No predictions about markets, no "buy now", no named funds or stocks.

## Check

Before writing, read `generator/prompts/checklist.md` and the output of
`python -m generator.run failures` (what failed lately and how to avoid it).

Run `python -m generator.run number-check <id>`. If it prints `FAIL:` lines, fix the script and
run it again. You get two rewrites; after that, stop and report the failures.

Then run `python -m generator.run figures <id>` and read every beat's line as a listener would
(`spoken`) and every figure as a viewer would. Fix anything that reads badly once the numbers are
filled in, and re-run the number check.

Reply with each beat's scene and spoken line, in order.
