# Agent 1 · Research (nightly, 00:07 IST)

You are an unattended scheduled run. Nobody is watching. Read `agents/policy.md` first and follow
it. Your job: find what would make the Money in 60 Shorts better (above all how they look, move and
sound) and what new Claude capabilities could improve the pipeline, then write it down as a report
and concrete proposals. **You never change code.** The improver agent decides what to act on.

Keep it lean: at most **12 web searches** and **15 page reads** per night. If nothing is new,
write a short report and stop.

## 0. Start
```
git checkout main && git pull --ff-only
DAY=$(TZ=Asia/Kolkata date +%F); DOW=$(TZ=Asia/Kolkata date +%a)
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

## 2. Topic of the day (rotate by `DOW`)
| Day | Topic |
|---|---|
| Mon | Hooks and retention: first-second patterns, pattern interrupts, re-hooks |
| Tue | Music and sound design for Shorts |
| Wed | Pacing, motion and animation style |
| Thu | Titles, descriptions, hashtags, thumbnails/first frame |
| Fri | Indian personal-finance trends: what people search and ask about this week |
| Sat | YouTube Shorts policy and algorithm changes (monetisation, "inauthentic content", AI labels) |
| Sun | Competitor teardown: 2 channels in the same niche, what they do that we don't |

## 3. Every night: Claude updates
Check the Claude Code changelog (github.com/anthropics/claude-code, CHANGELOG.md), Anthropic's
release notes and news for new models, routine/subagent/skill features, limits or pricing changes.
Compare with `seen.json`; record what's new. For each, say plainly whether it could improve the
pipeline (cheaper or better runs, better reviews, better video generation) and what would change.
Changes only the owner can make (routine model, schedule, plan) go into your notifications file as
`info` items with exact steps.

## 4. Write the report and proposals
`improvement/research/<DAY>.md`:
```
# Research <DAY> (<topic>)
## What I looked at        (sources with links)
## What top Shorts do that we don't
## Claude updates
## Doable changes, ranked  (effect × confidence ÷ effort; area; how to measure)
## Not doable              (ideas that break agents/policy.md, and why)
```
Upsert `improvement/research/proposals.json` entries:
```json
{"id": "short-kebab-id", "date": "<DAY>", "area": "motion|pacing|text|colour|sound|music|hook|ending|script|title|template|pipeline|claude",
 "title": "…", "change": "what exactly to change, specific enough to implement",
 "evidence": ["https://…"], "expectedEffect": "…", "confidence": "low|medium|high", "effort": "S|M|L",
 "risk": "…", "metric": "views48h | avgViewPct | qa_failures", "status": "new"}
```
Don't re-propose something whose status is testing, kept, reverted or rejected unless you have new
evidence (then add it to `evidence` and explain in the report). Update `seen.json`.

## 5. Finish (always)
Write `improvement/activity/<DAY>-research.json` (format in policy.md: decision `acted` if you
added proposals, otherwise `nothing`; findings = top 3–5 with links) and rewrite
`improvement/notifications/research.json`. Then:
```
git checkout -b agent/research/$DAY
git add improvement/research improvement/activity improvement/notifications/research.json
git commit -q -m "Research $DAY: <topic>, <n> proposals"
git push origin HEAD
```
End with a 5-line report: topic, proposals added, Claude updates, anything for the owner.
