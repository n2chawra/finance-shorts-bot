---
name: new-channel
description: Set up a new YouTube channel on the platform (docs/plans/multi-channel.md, step 3). Use when the owner says "/new-channel", adds a channel, or a channel on the Channels page is waiting for its next setup step (quick verdict, full research, build, samples). Runs on the owner's PC in the Claude desktop app, which has the browser.
---

# New channel setup

A channel moves through stages kept in `channels/<slug>/setup.json` (and on the Channels page):

`scanning → verdict → (owner: Continue / Stop) → research → build → samples → review → launched`

Each phase below is idempotent: read the stage first, do only the phase the channel is in, then
write the next stage to `setup.json` and commit. Ingest copies it to the dashboard (`workers/lib/setup-sync.ts`);
a stage past `verdict` only shows once the owner clicked Continue.

## 0. Find the work

```bash
python -c "import json;c=json.load(open('config/channels.json'))['channels'];print({k:v.get('setup') for k,v in c.items() if v['status']=='setup'})"
```

- No channel in setup and the owner gave a niche: create it on the dashboard (Channels → Add channel)
  or with `POST /api/channels`; never by hand in the database.
- `setup.decision.choice == "stop"`: do nothing for it.
- Pick the oldest channel that has work. One channel a session.

## 1. Scan (stage `scanning`, no `research/scan.json` yet)

The dashboard starts `niche-scan.yml` on "Add channel". If it didn't (no Actions token), start it:

```bash
gh workflow run niche-scan.yml -f slug=<slug>
```

Before that, if the owner's niche is broad, write `channels/<slug>/research/scan-request.json` with
3–6 searches that cover the niche's kinds of video (the niche in viewers' words, not ours), and the
reference channel links from the request. Wait for the run; `scan.json` lands on main.

## 2. Quick verdict (stage `scanning`, `research/scan.json` present, no `research/verdict.json`)

Read `research/scan.json` (aggregates) and the titles on the data branch:

```bash
git fetch -q origin niche-data && git show origin/niche-data:<slug>.json > .niche-data/<slug>.json
```

Score every point from the data, with the evidence (CLAUDE.md never lets a number be invented):

- **Demand:** Shorts and long medians (90 days), small channels with a 5× hit (`smallChannelsWithHit` of
  `smallChannels`), direction (>1 rising), crowding (`activeChannels30d`).
- **Money:** monetisation path (1,000 subs + 4,000 watch hours in 12 months, or 10M Shorts views in 90
  days: which fits the medians), advertiser-friendliness, RPM band for the niche (published creator
  reports; say it is an estimate and name the source), other income.
- **Doable by us:** can the flat kit (`remotion/src/flat/`), Kokoro voices, synthesized music and
  Commons photos make what the hits show? Real footage, gameplay, faces on camera or licensed music
  as the core of the hits → "not doable". Language voiced? True sources to cite? Policy: reused
  content, AI labelling, medical/financial claims, kids content.
- **Earnings at 6 and 12 months:** low / likely / high USD a month with the assumptions (videos a day,
  views, RPM, when the partner programme is reached). Estimates, never facts.

Write `channels/<slug>/research/verdict.json`:

```json
{ "call": "go | go-with-conditions | dont", "reason": "one line",
  "conditions": [], "for": ["three strongest, each with its number"], "against": ["three"],
  "earnings": { "m6": {"low":0,"likely":0,"high":0}, "m12": {"low":0,"likely":0,"high":0}, "assumptions": "" },
  "demand": { "shortsMedianViews90d": 0, "smallChannelsWithHit": "a/b", "direction": 0, "longMedianViews90d": 0 },
  "doable": { "look": "", "voice": "", "policy": "" }, "writtenAt": "<ISO time>" }
```

and `research/verdict.md` (the same, readable, with the evidence linked: video ids as
`https://youtube.com/watch?v=<id>`). Then `setup.json` → `{"stage": "verdict", "note": "Waiting for your Continue or Stop"}`.
Commit and push (`git add channels/<slug>`), then tell the owner the verdict in two lines.

Do not copy titles into files on main beyond a few quoted examples in `verdict.md`: per-video
YouTube API data lives only on the `niche-data` branch (30 days).

## 3. Full research (stage `research`, after the owner's Continue)

About 2–3 hours, on the owner's PC (it has the browser). Write `setup.json` →
`{"stage": "research", "note": "<what you are doing>"}` and push at each part, so the Channels page
shows progress.

**a. Topic families (labels by Claude, ranking by code).** Get the raw scan
(`git show origin/niche-data:<slug>.json > .niche-data/<slug>.json`). Read every title and give each a
topic family: what the video is *about* and *how* it is told, 6–14 families for the niche (for
channel #1 these would be "billionaire money", "how a famous business makes money", "salary
breakdowns", "market news", "personal budget tips"…). Label every title, not a sample: an unlabelled
video can't count. Write `.niche-data/<slug>-labels.json` (video id → family; it holds no titles but stays
off main with the raw data).

**b. Watch the references in the browser** (the `yt-style` skill's method; nothing is downloaded).
From `scan.json`, take the reference channels' top 5 Shorts and top 3 long videos by outlier score,
the owner's favourite reference if named, and 10 more top Shorts and 3–5 long videos from other
channels (`shorts.topIds`, `long.topIds`). For each, write a shot sheet to
`channels/<slug>/research/sheets/<videoId>.json` in the `workers/lib/sheets.ts` `Sheet` format (follow
`SHEET_PROMPT` there): every shot with its kind, characters, camera, transition, text, figure on screen
and motion; every sentence with its job and a gist **in your own words** (never their script); the
hook (first frame, first line ≤15 words, when the subject is named and the first figure shown or
spoken); captions, music, SFX; the ending. Measure the sound as `yt-style` does (tempo, key, levels,
ducking) into `research/sound.md`.

**c. The numbers.**

```bash
cd workers && npm run niche-research -- <slug>
```

writes `families.json` (tiers, direction, crowding, gaps), `style.json` (style targets, picture
language, cast or no cast, the first second) and `counts.json` (Shorts a day and long a week, each
with its reason, fitted to the quota left across channels), and puts the most-liked comments under
the hits in `.niche-data/<slug>-comments.txt`.

**d. Read the comments** for what viewers ask for next: 15–20 topic ideas in the audience's words
(paraphrased), plus the language and countries they show.

**e. Write `channels/<slug>/research/advice.md`**, shown on the Launch review:

- **Topic kinds to make**, ranked by `families.json` (core first), each with 2–3 example titles
  of our own, the niche hits it rests on (video ids) and its share of the first month.
- **Kinds to avoid**, with their numbers.
- **How many to post**: `counts.json`'s numbers and reasons; the owner's own numbers from the request
  next to them.
- **Shorts, long or both**, from `counts.json` and the long families.
- **The look**: the picture language and cast decision from `style.json`; anything in `notOurs`
  (footage, a person on camera) the channel replaces, and with what (places, objects, Commons photos).
- **The first second**: the opening rules from `style.json`'s `firstSecond` and the hooks you watched.
- **What the verdict got wrong**, if anything (for example the demand rests on one viral channel).

Also `research/report.md`: the niche report behind the advice (families table, style targets, sound,
comments' themes, gaps, risks turned into setup rules). Then `setup.json` → `{"stage": "build"}`,
commit (`git add channels/<slug>` — never `.niche-data/`) and push.

## 4. Build the channel pack (stage `build`)

```bash
python -m generator.pack scaffold <slug> --name "<working name>" --language <en-us|en-gb|hi|es|…> --numbers <none|simple|finance>
python -m generator.pack check <slug>      # repeat until it says OK
```

Scaffold makes the folders and starting files (never overwrites). Then fill, from the research:

- **`channel.json`**: language; voices (one Kokoro Shorts narrator speaking the channel's language, and
  long narrators); currency and currencies (if numbers aren't `none`); `numbers` (`finance` only for
  money maths, `simple` for counts and dates, `none` when the niche's hits show no computed figures);
  the **disclaimer** the niche needs (a fiction channel says the story is made up; health, legal and
  money niches say it is not advice); `stories` (`true` or `fiction`, from what the niche's hits are);
  `look.cast` (`none` when `style.json` says no cast, else the shared studio cast); `uploadCategory`.
- **`profile.md`**: who it is for, what it covers and never covers, where facts come from, the rules of
  its field, the risks from the verdict turned into rules. 150+ words.
- **`research/formats.json`**: the niche's formats from `families.json` (each: id, format short|long,
  name, hook, beats, tier core|low|avoid from the numbers, the hits it rests on as `demand`).
- **`research/shapes.json`**: keep the shared shapes the niche's hits use; drop the rest.
- **`research/topics.json`**: 15–20 first topics, the core families first; true channels carry sourced
  `facts` (value, unit, source URL, as_of) on each, exactly as channel #1's research agent writes them.
- **`prompts/recipe.md`**: the champion recipe: length, topic kinds and their shares, the opening rules
  from `firstSecond`, the look and style targets from `style.json`, the ending. The writer follows it
  where CLAUDE.md describes Paisa Panchayat's recipe.
- **`cycle/backlog.json`** `candidates`: what the research was unsure of, ranked, alternating
  first-second and look tests (the weekly loop's first challengers).
- **`market.json`** `queries`: the niche's searches for the daily market scan.
- **Branding kit** (`branding/`): 3 name ideas with their @handles checked on YouTube and searched for
  clashes, the description and keywords, and an avatar and banner drawn on the flat kit.

When `pack check` passes: `setup.json` → `{"stage": "samples"}`, commit and push.

## 5–6. Samples and review — being built (step 3d)

## Rules

- Technique only from other channels: never their words, characters, art or voice.
- Every figure in a verdict or advice comes from `scan.json`, `families.json` or a cited source.
- One channel's setup never touches another channel's folder or `channels/paisa-panchayat/`.
