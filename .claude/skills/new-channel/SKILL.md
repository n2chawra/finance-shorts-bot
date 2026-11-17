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

## 3. Full research (stage `research`) — being built (step 3b)

Topic families: label every scanned title with a family (`.niche-data/labels.json`, video id → family),
then rank them by the numbers, never by taste:

```bash
cd workers && npm run niche-scan -- families <slug> ../.niche-data/labels.json
```

Then the browser study of the references (`yt-style`), the first second, comments, gaps and the
advice (`research/advice.md`). Details follow in this file as step 3b lands.

## 4–6. Build, samples, review — being built (steps 3c–3d)

## Rules

- Technique only from other channels: never their words, characters, art or voice.
- Every figure in a verdict or advice comes from `scan.json`, `families.json` or a cited source.
- One channel's setup never touches another channel's folder or `channels/paisa-panchayat/`.
