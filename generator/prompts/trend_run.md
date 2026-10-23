# Routine: midday trend run (~11:30 IST)

You are an unattended scheduled run. Nobody is watching. Your job: catch a money trend **today**,
while people are still talking about it, and make **at most one** Short about it. News and trends
lose half their first-day views in about seven hours; a video you ship by about 15:00 IST is
uploaded for the 19:07 slot and jumps the queue.

Most days there is no strong new trend. Then you stop after the sweep — that is a good run.
Keep it lean: it shares a Pro-plan usage window with other routines.

## 0. Prepare

```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
python3 -m pip install -q -r renderer/requirements.txt   # add --break-system-packages if pip refuses
```
Then the rest of section 0 of `generator/prompts/routine.md` (find the Python, ffmpeg, the voice).

## 1. Should this run make anything?

Run `python -m generator.run state`.
- `paused`: report "generation is paused" and stop.
- `video`: a `trending` topic is waiting in the feed (`topic_feed.urgent`) or today's videos
  aren't all made. Make **one** video by following `routine.md` sections 2–7,
  then stop. Skip the sweep.
- `idle`: today's videos are made. If `videos_today` is already more than `daily_target`, an extra
  video was made today: stop. Otherwise do the sweep.

## 2. The sweep (at most 4 web searches, 4 page reads)

Look for one money moment that lots of people **around the world** (or in India or the US) are
talking about **today or since yesterday**. A global one (a billionaire, a famous company, something
anyone can relate to) is best: `topic.reach: "global"`. A one-country trend is `"local"` with
`topic.reach_reason: {"kind": "occasion", "name": "<the trend>", "date": "<today>"}`, and only if
`reach.local_allowed` in `state` is true (`generator/reach.py`). Look for the kind that fills finance Shorts comments, not a news bulletin (owner reset,
2026-10-21: central bank decisions and inflation releases are not trends people watch):
- A viral money conversation: a salary reveal, a scam everyone is warning about, a celebrity or
  billionaire money story, a sale everyone is buying in, a tax change people are angry about.
- What finance Shorts are blowing up right now (`market-data`: `market.json`).
- Google Trends (India and US) for money terms.

It is worth a video only if **all** of these hold:
1. It is current: you can show a source dated today or yesterday that shows the attention.
2. It is about the viewer's money, and you can explain what it means for them without predicting
   prices or giving buy/sell advice (no recent market prices used to suggest future prices, no
   return claims, no single stocks).
3. It can be told in one of the `formats` in `state` (rich vs poor, what the rich know, the trap,
   how they make money, salary breakdown…), with that format's `story` and `demand`.
4. It isn't already in `recent_topics` or the feed.

If nothing passes, report what you checked in two lines and stop.

## 3. Make the video

Follow `routine.md` sections 2–7 for **one** video, with these changes to the plan:
- Put the trend in the plan as `topic.trend` (not `feed_id`; video runs never edit the feed):
  ```json
  "topic": {"title": "...", "category": "gold",
            "trend": {"id": "trend-<YYYY-MM-DD>-short-slug", "why_now": "what is happening now",
                      "sources": ["https://..."], "found": "<YYYY-MM-DD>", "expires": "<today + 1 to 3 days>",
                      "facts": [ ... only for a news story, each with the exact figure at its url ... ]}}
  ```
- For a news story, the script's `feed_id` is the trend's `id`, and every fact must appear exactly
  at its `url` (the fact reviewer checks this, by the page or by web search).
- `check-plan` checks the trend's sources and expiry; `ship` marks the video `trending` so it goes
  to the front of the upload queue.

Everything else is the normal run: number check, fact review, render, QA review, ship. If the
video can't pass, mark it failed (routine.md's failure path) and stop — don't try a second one.

## Report

- what the sweep found (or that nothing passed), with the sources
- the video id, title and the result of each step, if you made one
- anything that failed, with the exact error text
