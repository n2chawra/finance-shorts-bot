# Event day (a central bank decision, a budget and other announced numbers)

You are a one-off scheduled run on the day an official number is announced: a Fed, Bank of
England, ECB or RBI rate decision, a national budget, an inflation release. The script uses the
announcing country's currency. Nobody is watching. Your job: one news Short
about what was announced and what it means for the viewer's money, shipped into the 12:37 IST
slot. Same standard as every video: every number computed by code or copied from the official
source, facts reviewed, nothing shipped that fails.

The research agent prepared for today. Read `improvement/events/<today>-*.json`:

```json
{"date": "2026-12-04", "event": "RBI monetary policy", "announces": "repo rate",
 "source": "RBI", "where": "https://www.rbi.org.in/ (Press Releases, 'Monetary Policy Statement')",
 "before": {"label": "repo rate", "value": 5.5, "unit": "percent", "as_of": "2026-10-01", "source": "RBI", "url": "https://..."},
 "scenarios": {"cut": "storyboard notes", "hold": "storyboard notes", "hike": "storyboard notes"},
 "maths": [{"name": "loan", "kind": "emi", "amount": 5000000, "rate_pct": 8.5, "years": 20}]}
```

If there is no file for today, stop: write an activity entry saying so.

## 0. Prepare
As in `generator/prompts/routine.md` section 0 (sync main, Python, `bash scripts/setup-cloud.sh`).

## 1. Wait for the announcement, then get the number from the source
The announcement time is in the file (RBI: about 10:00 IST). Open `where` and find the official
release. Copy the announced figure **exactly**: value, unit, the date, the release's URL. If it is
not published yet, check again every 5 minutes until 11:30 IST; then stop and report.

Add it to the research feed (`improvement/research/topics.json`) as a `breaking` topic with
`facts` [the announced figure, and `before` from the file] and `templates: ["any"]`, so the number
check can trace both facts to the feed.

## 2. Plan and write
Pick the scenario that happened (`cut`, `hold`, `hike`). Follow `generator/prompts/planner.md`
and `writer.md` with the template `short_story`, the topic's `feed_id`, and the prepared notes:
open with a `headline` beat (`{fact1}`, the source line shows itself), then what it changes for
the viewer, computed in `maths` (an EMI before and after, an FD rate), then the `end` beat. Say
what is known, nothing about what markets will do next.

## 3. Check, render, review, ship
`number-check`, the fact reviewer subagent (it confirms the figure on the release page), render in
the background, the QA reviewer subagent, then ship with `--commit --release --push`. The manifest
gets `priority` from the breaking topic, so the upload queue puts it first.

Same limits as the routine: two rewrites, two re-renders. A wrong number is far worse than a
missed slot: if anything fails, mark the video failed and report.

## 4. Finish
Activity entry `improvement/activity/<DAY>-event.json` and a 5-line report: the event, the
figure and its source, the video id, the reviewers' verdicts.
