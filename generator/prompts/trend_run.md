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
```
Then the rest of section 0 of `generator/prompts/routine.md` (find the Python, ffmpeg, the voice).

## 1. Should this run make anything?

Run `python -m generator.run state`.
- `paused`: report "generation is paused" and stop.
- `video`: a `breaking` or `trending` topic is already waiting in the feed (`topic_feed.required`)
  or today's videos aren't all made. Make **one** video by following `routine.md` sections 2–7,
  then stop. Skip the sweep.
- `idle`: today's videos are made. If `videos_today` is already more than `daily_target`, an extra
  video was made today: stop. Otherwise do the sweep.

## 2. The sweep (at most 4 web searches, 4 page reads)

Look for one Indian personal-finance topic that lots of people are searching or talking about
**today or since yesterday**:
- Google Trends India for money terms (gold price, IPO, tax, EMI, UPI, SIP, credit card, PF…).
- News from the last 24 hours: RBI, SEBI, Income Tax, EPFO, a bank or app change that affects
  ordinary savers.
- What finance Shorts are being made about right now.

It is worth a video only if **all** of these hold:
1. It is current: you can show a source dated today or yesterday that shows the attention.
2. It is about the viewer's money, and you can explain what it means for them without predicting
   prices or giving buy/sell advice (SEBI: no recent market prices used to suggest future prices,
   no return claims, no single stocks).
3. A template allowed in `state` can tell it (read its README), with a story in `allowed_stories`.
4. It isn't already in `recent_topics` or the feed.

If nothing passes, report what you checked in two lines and stop.

## 3. Make the video

Follow `routine.md` sections 2–7 for **one** video, with these changes to the plan:
- Put the trend in the plan as `topic.trend` (not `feed_id`; video runs never edit the feed):
  ```json
  "topic": {"title": "...", "category": "gold",
            "trend": {"id": "trend-<YYYY-MM-DD>-short-slug", "why_now": "what is happening now",
                      "sources": ["https://..."], "found": "<YYYY-MM-DD>", "expires": "<today + 1 to 3 days>",
                      "facts": [ ... only for money_news, each with the exact figure at its url ... ]}}
  ```
- For `money_news`, the script's `feed_id` is the trend's `id`, and every fact must appear exactly
  at its `url` (the fact reviewer checks this, by the page or by web search).
- `check-plan` checks the trend's sources and expiry; `ship` marks the video `trending` so it goes
  to the front of the upload queue.

Everything else is the normal run: number check, fact review, render, QA review, ship. If the
video can't pass, mark it failed (routine.md's failure path) and stop — don't try a second one.

## Report

- what the sweep found (or that nothing passed), with the sources
- the video id, title and the result of each step, if you made one
- anything that failed, with the exact error text
