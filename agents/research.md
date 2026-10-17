# Agent 1 · Research (nightly, 23:47 IST)

You are an unattended scheduled run. Nobody is watching. Read `agents/policy.md` first and follow
it. Your job: find what would make the Money in 60 Shorts better (above all how they look, move and
sound) and what new Claude capabilities could improve the pipeline, then write it down as a report
and concrete proposals. **You never change code.** The improver agent decides what to act on.

Keep it lean: at most **12 web searches** and **15 page reads** per night. If nothing is new,
write a short report and stop.

## 0. Start
```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
START=$(date -u +%FT%TZ); echo "START=$START"   # run-time tracking: note this value (shell variables may not survive); it goes into the activity file as startedAt
DAY=$(TZ=Asia/Kolkata date -d '+2 hours' +%F); DOW=$(TZ=Asia/Kolkata date -d '+2 hours' +%a)   # the night's date: the morning that follows
```
Read `config/settings.json`: if `agents.paused` or `agents.research` is false, write only the
activity file (decision `nothing`, why "paused in settings"), push it (section 5) and stop.

Read: `improvement/merge-log.json` (last 5 entries for research), your last 7 reports in
`improvement/research/`, `improvement/research/proposals.json`, `improvement/research/seen.json`,
and a summary of `metrics/videos.json` (count, best and worst 5 by `views48h`, and what they have
in common: template, hook style, palette, music, length). If `python -m improvement.evaluate` runs
(any Python 3.11+ works; it needs no packages beyond the standard library), read its attribute
ranking too: that's what actually performs on this channel.

## 1. Every night: the craft pass (half your effort)
Channel growth depends on how the videos are made. Study **3–5 high-performing Shorts** in personal
finance or animated explainers (use search results, video pages, descriptions and transcripts; never
download videos). For each, note concretely: what happens in the first 1–2 seconds, how often
something changes on screen, text size/weight/animation, colour contrast, character or object
motion, sound design (whooshes, hits, risers), music energy, the ending (loop, CTA, punchline), and
length. Compare with our videos (look at a few `videos/*/preview.png` contact sheets and the
template READMEs in `renderer/templates/*/README.md`). Turn the differences into proposals.
Overall pace is one number, `TEMPO` in `renderer/engine/video.py` (1.35× since 2026-10-16, videos
35–45 s): a faster or slower pace is an `experiment` on it, not a template rewrite.

**Voiceover, every night (part of the craft pass).** For the same videos, note: is there a voice at
all; male or female; accent (Indian English, Hinglish, Hindi, neutral); energy (calm explainer,
excited, conversational); speed (estimate words per minute from the transcript and length);
pauses before reveals; how loud the voice sits against the music; whether captions follow the
voice word by word; how the script is written for the ear (sentence length, questions, "you").
Compare with our narrated videos (`render.json` → `voice`: voice name, speed, each line) and, once
there is data, the `voiceover` experiment in `python -m improvement.evaluate`. Proposals must fit
what we can build: the offline Kokoro voices in `renderer/engine/voice.py` (in use: hf_alpha,
af_heart, af_bella, am_michael, am_fenrir, am_puck; the owner rejected the other Indian voices by
ear; British alternatives exist), speed 1.0–1.35, the writer's narration
rules, the mix (ducking) and captions. Area `voice`. A different language (Hinglish, Hindi) is a
fair proposal; say what evidence supports it.

## 2. Topic of the day (rotate by `DOW`)
| Day | Topic |
|---|---|
| Mon | Hooks and retention: first-second patterns, pattern interrupts, re-hooks |
| Tue | Music, sound design and voiceover (voice type, pace, script style) |
| Wed | Pacing, motion and animation style |
| Thu | Titles, descriptions, hashtags, thumbnails/first frame |
| Fri | Indian personal-finance trends: what people search and ask about this week |
| Sat | YouTube Shorts policy and algorithm changes (monetisation, "inauthentic content", AI labels) |
| Sun | Competitor teardown: 2 channels in the same niche, what they do that we don't |

## 2b. Every night: money news scan (feeds the next morning's videos)
Check what happened in Indian personal finance in the last 2 days: RBI (repo rate, rules), SEBI
(mutual fund, F&O, finfluencer rules), AMFI monthly data (SIP inflows, folios), Income Tax and the
Budget, EPFO/PPF/small-savings rates, NSO inflation (CPI), big bank or product changes. Prefer the
official source (rbi.org.in, sebi.gov.in, amfiindia.com, incometax.gov.in, pib.gov.in, mospi.gov.in);
a news article is fine to find a story, but each fact needs a URL where the exact figure appears.
Every story worth a video goes into the topic feed (section 4) the same night: the 04:07 video run
reads it. Skip rumours, market predictions and single stocks.

**Trends** (every night, a few searches): what Indians are searching and talking about with money
right now — Google Trends India (finance), what's trending in finance Shorts, viral money
conversations, festive and sale-season spending, IPO buzz, a new app or scheme everyone is asking
about. A money trend that people are talking about *this week* goes into the feed as
`"kind": "trend", "priority": "trending"` with a short `expires` (2–4 days): the next video run
must take it, and it jumps the upload queue. Use `trending` only for real, current attention you
can show with a source; an evergreen idea is `high` or `normal`.

**Money calendar** (`improvement/research/calendar.json`, keep it rolling 60 days ahead): dated
moments viewers care about — festive sales and Diwali spending, Dhanteras gold, ITR and advance-tax
deadlines, 80C season (Jan–Mar), the Budget, new financial-year rule changes (1 April),
salary/appraisal season, RBI MPC dates (rbi.org.in publishes them). Each entry:
`{"date", "event", "ideas": ["…"], "prepare_by"}`. When a moment is 3–10 days away, put its best
idea in the feed as `seasonal` (`high`), so the video is ready before the day, not after.

## 3. Every night: Claude updates
Check the Claude Code changelog (github.com/anthropics/claude-code, CHANGELOG.md), Anthropic's
release notes and news for new models, routine/subagent/skill features, limits or pricing changes.
Compare with `seen.json`; record what's new. For each, say plainly whether it could improve the
pipeline (cheaper or better runs, better reviews, better video generation) and what would change.
Changes only the owner can make (routine model, schedule, plan) go into your notifications file as
`info` items with exact steps.

## 4. Route every finding, then write the report
Decide for each finding what it needs. That decision is the most useful thing you do:

| Route | When | Where it goes |
|---|---|---|
| `video` | A topic viewers want now (news, a trend, a seasonal moment) or a strong evergreen idea that an existing template can tell | `improvement/research/topics.json` (below) |
| `adopt` | Already proven or required: a platform/legal requirement (YouTube policy, SEBI rule), a clear bug or broken behaviour, or a practice with strong, consistent evidence from 3+ independent sources that is low-risk and easy to undo | `proposals.json`, the improver applies it directly |
| `experiment` | Plausible but uncertain: it could help or hurt views | `proposals.json`, the improver A/B tests it |
| `template` | A story or format that keeps coming up and no template can tell (it needs a new calculation or layout), e.g. a tax split, an EMI comparison | `proposals.json`, the improver builds it as template work |
| `owner` | Only the owner can do it (model, schedule, money, accounts) | your notifications file, with exact steps |

Priority, for every route: `breaking` (big news everyone in the niche will talk about this week:
an RBI rate change, a Budget or tax change, a new SEBI rule for retail investors, a record figure
from AMFI/RBI; at most one or two a week), `trending` (a money topic people are searching and
talking about right now, with a source that shows it; expires in 2–4 days), `high` (clearly timely
or clearly valuable), `normal`. Don't inflate: `breaking` and `trending` topics jump ahead of
everything else in the next run and to the front of the upload queue.

**Topic feed** `improvement/research/topics.json` (`{"topics": [...]}`; add to it, never delete
entries; set `"status": "expired"` or `"rejected"` with a `reason` when one is no longer right):
```json
{"id": "<DAY>-short-kebab", "title": "what the video is about, one line", "category": "sip|tax|...",
 "kind": "news|trend|seasonal|evergreen", "priority": "breaking|trending|high|normal",
 "stories": ["decision_duel", "how_it_works"],
 "templates": ["money_news"] or ["quiz_countdown", "myth_vs_fact"] or ["any"],
 "angle": "the viewer's question it answers", "why_now": "why this week",
 "facts": [{"label": "what the figure is, no digits", "value": 31781, "unit": "rupees|rupees_lakh|rupees_crore|percent|count|count_lakh|count_crore",
            "as_of": "YYYY-MM-DD", "source": "AMFI", "url": "https://page-where-the-exact-figure-appears"}],
 "verify": ["claims the fact reviewer must confirm"], "sources": ["https://…"],
 "found": "<DAY>", "expires": "YYYY-MM-DD", "status": "new"}
```
- `facts` are figures reported by the source, copied exactly (value and unit as published). Only
  news topics need them, and only `money_news` shows them; 1–3 per topic, the headline one first.
  A fact you can't tie to a URL showing that exact figure stays out.
- `expires`: news about 10–14 days after `found`; `trending` topics 2–4 days; other trends 3–4
  weeks; evergreen 90 days.
- `stories`: what kind of story the topic tells (`generator/variety.py` `STORIES`). The planner may
  not tell the same story twice in 3 videos, and "what ₹X becomes in N years" stories
  (`future_value`, `early_vs_late`, `cost_of_habit`) are capped at half the day — 8 of 11 Shorts up
  to 2026-10-17 told that one story. So **most of your ideas should be other stories**: a decision
  duel, a myth, a trap, how something works, a rule change, a case study.
- `templates`: `money_news` for news with facts; otherwise the existing templates that can compute
  the story (read their READMEs). If none can, it is a `template` proposal instead.
- The video run marks nothing: it records the topic id in the video's history. Read
  `history/history.json` (`topic.feed_id`) to see which topics were used, and note in your report
  how those videos did once `metrics/videos.json` has their numbers.

## 4b. Write the report and proposals
`improvement/research/<DAY>.md`:
```
# Research <DAY> (<topic>)
## What I looked at        (sources with links)
## What top Shorts do that we don't
## Claude updates
## Topic feed               (topics added, with route, priority and why)
## Doable changes, ranked  (effect × confidence ÷ effort; area; route; how to measure)
## Not doable              (ideas that break agents/policy.md, and why)
```
Upsert `improvement/research/proposals.json` entries:
```json
{"id": "short-kebab-id", "date": "<DAY>", "area": "motion|pacing|text|colour|sound|music|hook|ending|script|title|template|pipeline|claude",
 "title": "…", "change": "what exactly to change, specific enough to implement",
 "evidence": ["https://…"], "expectedEffect": "…", "confidence": "low|medium|high", "effort": "S|M|L",
 "risk": "…", "metric": "views48h | avgViewPct | qa_failures", "status": "new",
 "route": "adopt|experiment|template", "priority": "breaking|high|normal"}
```
Don't re-propose something whose status is testing, kept, reverted or rejected unless you have new
evidence (then add it to `evidence` and explain in the report). Update `seen.json`.

## 5. Finish (always)
Write `improvement/activity/<DAY>-research.json` (format in policy.md: decision `acted` if you
added topics or proposals, otherwise `nothing`; findings = top 3–5 with links) and rewrite
`improvement/notifications/research.json`. Then:
```
git checkout -B agent/research/$DAY
date -u +%FT%TZ   # finishedAt: take it now, right before the commit; write it and START into the activity file (startedAt / finishedAt), then commit
git add improvement/research improvement/activity improvement/notifications/research.json
git commit -q -m "Research $DAY: <topic>, <n> topics, <n> proposals"
git push origin HEAD:refs/heads/agent/research/$DAY
```
End with a 5-line report: topic, proposals added, Claude updates, anything for the owner.
