# Routine: midday trend run (~11:30 IST)

You are an unattended scheduled run. Nobody is watching. Your job: catch a trend in the channel's niche (`profile.md`) **today**,
while people are still talking about it, and make **at most one** Short about it. News and trends
lose half their first-day views in about seven hours; a video you ship by about 15:00 IST is
uploaded for the channel's next upload slot and jumps the queue.

Most days there is no strong new trend. Then you stop after the sweep — that is a good run.
Keep it lean: it shares a Pro-plan usage window with other routines.

## 0. Is this channel live? (first, before anything else)

Run `python -m generator.run state --channel <channel>` with the channel this run's prompt names (no channel
named: `python -m generator.run state`). If the answer has a `stop` field (`"channel deleted"` or
`"no channel"`), follow the rule at the top of `generator/prompts/routine.md`: disable this routine with
`update_trigger` (`enabled: false`) if you have the scheduled-task tools, otherwise just end; write nothing else.

## 0a. Prepare

```
bash scripts/sync-main.sh   # always first: the cached clone's local main can be stale
python3 -m pip install -q -r renderer/requirements.txt   # add --break-system-packages if pip refuses
```
Then the rest of section 0 of `generator/prompts/routine.md` (find the Python, ffmpeg, the voice).

## 1. Should this run make anything?

Read the `mode` of the `state` you ran in section 0.
- `paused`: report "generation is paused" and stop.
- `video`: a `trending` topic is waiting in the feed (`topic_feed.urgent`) or today's videos
  aren't all made. Make **one** video by following `routine.md` sections 2–7,
  then stop. Skip the sweep.
- `idle`: today's videos are made. If `videos_today` is already more than `daily_target`, an extra
  video was made today: stop. Otherwise do the sweep.

## 2. The sweep (at most 4 web searches, 4 page reads)

Look for one moment in the niche that lots of people **around the world** (or in one country) are
talking about **today or since yesterday**. A global one (a famous person, place or company, something
anyone can relate to) is best: `topic.reach: "global"`. A one-country trend is `"local"` with
`topic.reach_reason: {"kind": "occasion", "name": "<the trend>", "date": "<today>"}`, and only if
`reach.local_allowed` in `state` is true (`generator/reach.py`). Look for the kind that fills the niche's Shorts
comments, not a news bulletin (a routine data release or an official announcement nobody discusses is not a trend):
- A viral conversation in the niche, as `channels/<channel>/profile.md` describes it (who the viewers are and
  what they care about).
- What the niche's Shorts are blowing up right now (`git show origin/market-data:<channel>/market.json` / `niche-data`).
- Google Trends for the niche's terms.

It is worth a video only if **all** of these hold:
1. It is current: you can show a source dated today or yesterday that shows the attention.
2. It is inside the channel's niche and recipe (`channels/<channel>/profile.md`, `channels/<channel>/prompts/recipe.md`):
   the subject is one the channel covers, the story is true and sourced the way the profile says facts are
   sourced, and it respects the rules of the field the profile names (for a money channel: no price
   predictions, buy/sell advice or return claims; for any channel: no speculation told as fact).
3. It can be told in one of the `formats` in `state`, with that format's `story` and `demand`.
4. It isn't already in `recent_topics` or the feed.

If nothing passes, report what you checked in two lines and stop.

## 3. Make the video

Follow `routine.md` sections 2–7 for **one** video, with these changes to the plan:
- Put the trend in the plan as `topic.trend` (not `feed_id`; video runs never edit the feed):
  ```json
  "topic": {"title": "...", "category": "<one of the channel's categories>",
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
