# Finance Shorts Bot: the complete guide

This folder explains the whole project, from the one-minute pitch to how every piece works. Read
it top to bottom once, then use it as a reference when someone asks you a question.

**Channel:** Money in 60 (YouTube Shorts) · **Dashboard:** https://courageous-granita-bb8b51.netlify.app
· **Repo:** `n2chawra/finance-shorts-bot` (private)

## Start here

| # | Page | Read it when you want to… | Level |
|---|---|---|---|
| 1 | [The big picture](01-the-big-picture.md) | explain the project to anyone in two minutes | Plain |
| 2 | [Architecture](02-architecture.md) | show how the parts connect and why it was built this way | Technical |
| 3 | [A day in the life](03-a-day-in-the-life.md) | know what runs when, hour by hour (IST) | Both |
| 4 | [How a video is made](04-making-a-video.md) | walk through one generation run, step by step | Both |
| 5 | [The renderer](05-the-renderer.md) | explain how code turns a script into an animated video with music | Technical |
| 6 | [Publishing and YouTube](06-publishing-and-youtube.md) | explain uploads, scheduling, the audit, stats and live counts | Both |
| 7 | [The dashboard](07-the-dashboard.md) | demo the dashboard and explain each page | Both |
| 8 | [Data model](08-data-model.md) | explain the database tables and the video status flow | Technical |
| 9 | [Operations](09-operations.md) | run it day to day, fix problems, know the costs and limits | Both |
| 10 | [FAQ and glossary](10-faq-and-glossary.md) | answer the questions people usually ask | Both |

The source of truth for rules and constraints is [`CLAUDE.md`](../../CLAUDE.md); milestones and the
build log live in [`PLAN.md`](../../PLAN.md). Older diagrams made for the YouTube audit are in
[`docs/channel/diagrams`](../channel/diagrams).

## The 60-second pitch

> I built a system that makes and publishes a short personal-finance video for Indian viewers
> every day, with no human in the loop. Claude, running on a schedule in the cloud, picks a topic,
> writes the script and reviews it. My Python engine turns that script into an animated 9:16
> video with its own synthesized music: no voiceover, no stock footage, no copyrighted audio.
> Every number on screen is computed by code, never typed by the AI, and separate AI reviewers
> check the facts and the finished frames before anything ships. GitHub Actions moves finished
> videos into a database and uploads one a day to YouTube. A live dashboard shows the queue,
> the schedule, every run and every view. It runs entirely on free tiers plus a Claude Pro
> subscription.

## A five-minute presentation, in order

1. **The problem** (30 s): short-form finance content works, but making a good video every day
   by hand is a lot of work, and mass-produced AI videos get demonetised for being repetitive.
2. **What it does** (45 s): one unique Short a day, fully automated, with a backlog of up to 30
   ready videos. Show the [dashboard Overview](07-the-dashboard.md#overview).
3. **How a video is made** (90 s): the nine steps in [How a video is made](04-making-a-video.md),
   stressing *numbers are computed, not written* and *separate reviewers with fresh context*.
4. **Why it won't look mass-produced** (45 s): enforced variety rules: template, topic, colours,
   music, hook and wording rotate on every video ([details](04-making-a-video.md#variety-rules)).
5. **Architecture** (60 s): the diagram in [Architecture](02-architecture.md): cloud AI sessions
   never hold secrets, GitHub is the hand-off point, Actions do the privileged work.
6. **Reliability** (30 s): five runs a day for a three-video target, self-repair of template
   bugs, retries, and a live dashboard ([Operations](09-operations.md)).
7. **Close** (20 s): cost is a Claude Pro subscription; everything else is free tier.
