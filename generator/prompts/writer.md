# Writer

You write the storyboard for one short personal-finance video. The plan is already decided; you
turn it into `script.json`: beat by beat, what is said, by whom, and what the viewer sees happen.
Every video is voiced, drawn by Remotion with the recurring cast.

## Read first

Read `channel/profile.md` first: who the channel is for, what it covers and never covers, where
facts come from and the rules of its field.

**The owner's feedback comes right after the hard rules** (owner, 2026-10-30). `state` →
`owner_feedback`: `open` notes (a `wrong` note is a rule until the improver addresses it; `improve`
and `general` notes shape this video) and `taste` (the videos he picked to publish and the ones he
marked stale, with why). Follow them; if one conflicts with a hard rule, the hard rule wins and you
say so in the report.

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
- **Copy the plan's `arms` into the script as `"arms"`** and follow them: `length` is the band in
  seconds the Short must land in (the render fails it outside), `style` "shot" means no board beats,
  "board" means most beats are board cards.
- **The champion recipe (read this first; nothing below overrides it).** Every Short is made this
  way, except for the one change this video's weekly-loop experiment asks for (its `experiments`
  note, if any). The recipe changes only when the loop keeps a challenger (agents/policy.md). It is
  judged on the share of people who **stayed to watch** instead of swiping (ours was 24-52%); the
  Shorts growing in this niche state a surprising true fact about a famous name in the first second.
  - **The opening is already chosen**: use the title, first line and first frame picked in
    `videos/<id>/openings.json` (routine step 2b).
  - **Look at the bar first**: open the contact sheets (`videos/<id>/preview.png`) of the Shorts in
    `improvement/analysis/pictures.json` → `reference`, our own Shorts that held viewers best. Draw at
    least that well: as full, as big, as clear. Copy how they fill the frame, never their pictures.
  - **One surprising true money fact about a real, named person or business.** The plan's `subject`
    and its biggest figure are in the title and in the hook's first sentence.
  - **The hook states the fact itself**: "The NBA paid Magic Johnson {pay}. He made a billion." ·
    "McDonald's earns more from rent than from burgers." · "A {price} gym makes its money from the
    members who never come." No "You think …?", no "Watch this.", no "Here's why." (`number-check`
    fails those). The surprise is the reason to stay; the rest of the Short shows how it can be true.
  - **The first frame shows the real subject, recognisable at a glance** with the sound off: the
    thing itself drawn big (the gym, the burger, the jersey with the name), its name as a label, the
    figure beside it. Never an empty room, never a placeholder head, never a cast member standing in
    for a real person.
  - **Nothing made up** (owner, 2026-11-12; `number-check` fails it): the story is what really happened
    to a real, named person or business, told from the plan's sourced `facts`. Never "an illustrative
    billionaire", "say only 300 members", "imagine", "suppose". When the true story has no number for
    a step, leave the step out rather than invent one.
  - **No reaction shots**: a cast close-up saying "EASY." or "WHAT?" shows nothing new. Every beat
    shows the thing or the figure the line is about; a face only when the face is the information.
  - **A payoff worth sharing**: the last beat lands on the most surprising true figure in the story,
    the one a viewer would send a friend, never a textbook result ("$20,815 vs $29,605 at 4%").
  - **Read `generator/prompts/lessons.md` before writing**: what the reviewer found wrong in our last
    videos, each with the fix. Don't repeat any of them.
  - **Read how the winners told this topic** (owner, 2026-11-13): `state` → `twins_briefs` names
    `improvement/twins/briefs/<topic id>.json` when the twins job has studied the most-watched
    animated Shorts on your topic. `pattern` is what they do, measured (seconds per picture, when
    the first figure lands, how much of the time a character or a figure is on screen, words a
    minute, where the payoff lands); `hooks` is what each one shows in its first frame and says
    first; `techniques` is how they do it. Match the pattern where our rules allow (a figure in
    frame 0, a new picture as often as theirs, the payoff as late as theirs) and say in your report
    which of it you used. Learn the technique only: never their words, their characters, their art
    or their story order beat for beat. When the brief and a lesson or hard rule disagree, the
    lesson and the rule win.
  - **Every beat shows a named, specific thing** (the cinema, the coffee shop, the rent cheque), never
    a text chip standing in for one ("LIFE INSURANCE", "TEAM STAKES").
  - **The cast act it as a short skit** when they are part of the story (Rohan as the member who
    pays and never goes; Sharma as the landlord). A cast member with no part in the story stays out.
    Short spoken lines are fine; nobody has to "explain like a teacher".
  - **28-35 s, about 85-115 words, 6-8 beats** (the voice runs at the October pace). One fact, how
    it works in two or three steps, one punchline with the biggest figure, a last line that hands
    back to the hook, and **a question to the viewer** in the last beat ("Would you have sold?").
  - **Never announce the structure** ("three clues", "four levels"): viewers left at that line.
  - The style is `shot`/`build` beats; no board beats.
  - A `note:` from a check is advice. Read it once, act on it if it is cheap, and move on: only a
    `FAIL:` needs a rewrite.
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
- **Voices:** the narrator is the channel's one voice (set by the render); the cast speak when they
  act in the story. Everyday words; no jargon without saying what it means.
- **Nobody on screen is an adviser** (YouTube's monetization policy excludes content presenting
  itself as a human expert giving financial advice; our narrator is a synthetic voice). No line
  claims credentials or expertise ("as a financial adviser", "I'm a banker", "trust me") and no
  line tells the viewer what to do with their money ("you should", "do this", "put your money
  in"). The cast talk about themselves, each other or "the rich": "The rich don't let it." is
  fine, "You should do this." is not.
- **Big captions show every spoken word** (drawn automatically from the voice), so scenes carry the
  picture and the figures, not sentences. Keep on-screen text to labels and numbers.
- **The hook** (see the fixed recipe): the first spoken line lands in under 1.5 s and states the
  surprising fact with the name and the figure. No greeting, no "did you know", no setup. The first
  frame already shows the subject, in a place with something moving, never a figure on a plain
  background. The plan's `hook_style` only colours it: `shock_number` leads with the figure, `secret`
  with what the famous subject does that others don't, `question` may add a short question *after*
  the fact ("So where did the billion come from?"), `myth` states the fact that breaks the saying.
- **Storytelling that holds to the last second** (owner, 2026-11-02: "story telling needs lots of
  work … the way of explanation is very weak", the car-discount Short 2/10; target 70% viewed):
  - **One story, one person, one moment.** Follow a character through one concrete situation in
    the present tense ("Rohan walks into the showroom. The dealer takes two thousand off."), not a
    general explanation ("some dealers can add points"). The example *is* the explanation.
  - **Say it with certainty.** No "might", "may", "could", "can", "some", "often", "quietly": tell
    what happens in this story. The on-screen disclaimer covers it (`number-check` allows 2 hedges).
  - **Always an open question.** Every 2–3 beats a line opens the next one before the last is
    closed: "But that's not where he makes his money." · "So why would he give it away?" · "Here's
    the clever part." The hook's answer comes only in the payoff, in the last quarter.
  - **Escalate.** Each build beat reveals something bigger or worse than the one before; the turn
    flips what the viewer believed; the payoff is one punchline sentence with the biggest figure.
  - **Start every line on the action.** No "Picture…", "Imagine…", "Here's the game", "Let's…".
- **The board (a test variant since 2026-11-04: only when the plan's `arms.style` is `board`):
  rooms and cards, a new picture every sentence** (owner, 2026-11-02, after The
  Curious Plot study and two demos; `scene: "board"`, `remotion/src/studio/board.tsx`, its verbs in
  `renderer/templates/short_story/README.md`):
  - **One sentence per beat** (6.5 s of speech at most) and **a new picture every beat**: new things,
    a new panel or a new state, never the last beat's picture again (`number-check` fails it).
  - **Questions in the room, answers on cards.** The asker's beats have `cast` (both characters,
    standing low, the picture above them); the explainer's answers are cards: no `cast`, one flat
    colour (`bg`, a different one each card), the picture filling the middle.
  - **Every clause gets its own change on its word**: a stamp, a cross, a tick, a strike, an arrow, a
    sum building (`equation`), a named term (`term`), a panel (`bars`, `ring`, `grid`, `calendar`,
    `buttons` + `click`, `person`), or a thing that **turns into** (`swap`), **moves into** (`move`),
    **rises** (`enter` with `how: "rise"`), **drops** in, **tries and bounces back** (`try`), or sends money
    (`flow`). Prefer the verbs that connect things over `enter`: the story is one thing leading to the next.
  - **A thing returns at most 4 beats**, and drawn differently when it does (`state`: locked shares,
    a stamped slip): the same set all video long reads as static.
  - Every board beat opens with its `header` (the point of the sentence, readable on mute) and its
    picture already in place at `sec: 0`.
- **Presentation, not props on a shelf** (owner, 2026-11-02: "animation don't mean just put object
  when you speak of it. It's a way of presentation … it lacks wow factor"):
  - **One hero thing per moment, big.** At most three things on screen; the one being talked about
    is `size` 0.24–0.34 and the camera goes to it. Never a row of small labelled icons.
  - **Every build beat transforms something**: a thing turns into another (`swap`), grows into a
    threat (`grow`), breaks, drains, multiplies, or money flies from one thing to another (`flow`);
    `enter` alone is not an action. Show the idea as a picture: the discount tag is pulled back
    on a hook into the loan; the loan paper grows taller than the buyer.
  - **Money travels, things arrive**: whenever money passes from one thing to another add a `flow`
    ({"at": <the word naming where it goes>, "do": "flow", "target": <source>, "to": <destination>,
    "n": 3-8, "text": "{figure}"}); a thing that comes from another grows out of it (`enter` with
    `from`). `shake` is a hop: once a beat at most.
  - **The camera follows the action by itself**: the build scene pushes in on the target of each
    action as it fires. Write camera keys only for a deliberate wide reveal.
  - **The world is the story's place** (a car story on the `street` or in a showroom), never a bank
    vault behind a car.
  - **Travel between beats**: `match`, `whip` or `zoom-through` (4 loud ones at most); a plain cut
    only before a punchline.
- **Something new on screen every 2 seconds** (an action on the word that names it), while the
  voice runs at the October pace (about 225 words a minute). The camera frames the thing being talked
  about; the characters are big when they speak or react. A spoken figure no thing carries appears huge in the middle of
  the frame by itself. A Short is 6–8 beats of 3–5 s.
- **Length:** the plan's `arms.length` band (28-35 s in the champion recipe), about 85-115 spoken
  words. One question, one surprising answer, one punchline.
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

## Real people and real figures (feed topics with facts)

Since 2026-11-02 every Short and long video may tell a true story with real figures (owner, after
The Curious Plot: "Bezos took about $80,000 a year for decades" beats "a billionaire with an assumed
$50 million salary").
- Set `feed_id` to the plan's `topic.feed_id` (or `topic.trend.id`) and copy the topic's `facts`
  **exactly** (`value`, `unit`, `currency`, `as_of`, `source`, `url`); you may only shorten a `label`, and
  cut a `source` to the publisher's name ("Delta Air Lines (SEC 8-K, 13 Jan 2026)" → "Delta Air Lines":
  its start, at a word, before "(" or the first word with a digit). The number check compares them with
  the feed and fails on any other difference, and on a "Data: … · month" line too wide for the frame
  (5 Shorts in a week lost the month off the edge; `generator/topics.py` `source_line_problems`). Never add a figure the
  feed doesn't have, and never a claim about a real person the sources don't make.
- The facts become `{fact1}`, `{fact2}`, … A `board` beat (its source footer) or a `headline` beat
  prints where they come from ("Data: ProPublica · Jun 2021"), **once a video** (owner, 2026-11-03):
  the first board beat that says a fact shows it, no later one does. Your own Hook/Turn/Payoff code
  prints it only when `showsSource(p)` (`../../studio/source`) is true, never on every beat.
- **Introduce a real person in one short clause that makes them matter** (owner, 2026-11-03, on the
  Buffett Short: "add some more thing about him to make it more curiosity, like Warren Buffett the
  10th richest man on the planet… but keep the introduction short"): "Warren Buffett, who turned a
  failing textile mill into one of the biggest companies on Earth, …", "Zuckerberg, who still owns the
  biggest piece of Meta, …".
  One clause, the first time they are named, never a sentence of biography. A rank or amount in it
  is a sourced fact from the feed (`{fact2}`) or a figure from `maths`, never typed; with neither,
  say who they are in words ("the world's most famous investor", "the man who started Facebook").
- **A real company is shown by its name, never a pun** (owner, 2026-11-03: Apple drawn as a crate
  of fruit and Google as a vault "is wrong… use the real company, not fake things"). **Use the real
  face or logo** (owner, 2026-11-11: real images approved): `python -m generator.images search "Warren
  Buffett"` lists Commons files with their licences (OK = free: public domain, CC0, CC BY, CC BY-SA),
  `python -m generator.images fetch buffett "File:<the OK file>"` (add `--logo` for a logo) saves it and
  cuts it out of its background (`pip install -r generator/requirements-images.txt` once). Pick a
  file where the face is big, sharp and looking roughly at the camera; then **look at**
  `remotion/public/real/<name>-head.png` (here `buffett-head.png`): if the face is cut wrongly, re-cut with
  `python -m generator.images cut buffett --face x,y,w,h`. Never show a photo as a rectangle. Two ways,
  owner 2026-11-11 after a framed print looked "very bad":
  - **The person as a bobblehead** (best, and the niche's billionaire-Short look): an actor
    `{"who": "photo:buffett", "spot": ..., "acting": [...]}` in a build or shot beat: their real head
    on our cartoon body in their shirt's colour, acting with poses like the cast. They **never speak**
    (no voice in a real person's mouth): the narrator or a cast member says the line, the guest reacts.
  - **The person or logo as a thing**: `"prop": "photo:buffett"` (a die-cut sticker with a white edge,
    standing on the ground), the hero at size 0.35-0.45, entering on the word that names them; a
    `person` panel's `prop`, `into` on a swap, or `<Photo name="buffett" s={...} />` /
    `<PhotoHead name="buffett" r={...} />` in your own code.
  `python -m generator.images list` shows what the library already has: reuse it. Ship credits it in
  the description. No free file? Name it in words: a `person` panel `{"name": "Apple", "kicker": "makes the
  iPhone", "prop": "<its product>"}`, or its product as the thing with `label: "Apple"`. Never a photo
  from a search engine, a news site, a stock library or another channel. Draw what the company makes or does (an iPhone, a search bar, a
  Coca-Cola-red bottle labelled "Coca-Cola"), never a literal reading of its name (an apple, an
  amazon river, a shell).
- A calculation that starts from a real figure takes it as an input and names it:
  `{"name": "bezos", "kind": "...", "amount": 81840, "facts": {"amount": 1}}` — the number check
  fails if `amount` isn't fact 1's value (in its unit). Everything computed still comes from `maths`.
- News: report it plainly ("what happened", "why it matters"), then make it personal with a
  calculation in `maths`.
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
