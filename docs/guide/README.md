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
| 11 | [Self-improving agents](11-self-improving-agents.md) | explain how the system improves itself every night | Both |
| 12 | [Run times](12-run-times.md) | see how long each routine takes and whether the schedule fits the usage windows | Both |

The source of truth for rules and constraints is [`CLAUDE.md`](../../CLAUDE.md); milestones and the
build log live in [`PLAN.md`](../../PLAN.md). Older diagrams made for the YouTube audit are in
[`docs/channel/diagrams`](../channel/diagrams).

## How to view the diagrams

The diagrams (architecture, sequence, state and the database `erDiagram`) are written in
[Mermaid](https://mermaid.js.org): text inside ```` ```mermaid ```` blocks that a viewer draws as a
picture. Pick whichever is handiest:

1. **On GitHub (easiest).** Open the page in the repo, for example
   [`docs/guide/08-data-model.md`](https://github.com/n2chawra/finance-shorts-bot/blob/main/docs/guide/08-data-model.md).
   GitHub draws Mermaid automatically, private repos included. Hover over a diagram for
   zoom and full-screen buttons.
2. **In VS Code.** Install the extension **Markdown Preview Mermaid Support**
   (`bierner.markdown-mermaid`), open the `.md` file and press `Ctrl+Shift+V` (or `Ctrl+K V` for a
   side-by-side preview). VS Code's built-in preview shows the raw text without that extension.
3. **In the Mermaid Live Editor.** Copy everything between ```` ```mermaid ```` and ```` ``` ````,
   paste it into https://mermaid.live, and export it as PNG or SVG for slides. It draws in your
   browser, but the diagram text ends up in the page URL, so use it for diagrams you don't mind
   sharing.

The older audit diagrams in [`docs/channel/diagrams`](../channel/diagrams) are already PNGs, ready
for slides.

## The 60-second pitch

> I built a system that makes and publishes a short personal-finance video for Indian viewers
> every day, with no human in the loop. Claude, running on a schedule in the cloud, picks a topic,
> writes the script and reviews it. My Python engine turns that script into an animated 9:16
> video with its own synthesized music: no voiceover, no stock footage, no copyrighted audio.
> Every number on screen is computed by code, never typed by the AI, and separate AI reviewers
> check the facts and the finished frames before anything ships. GitHub Actions moves finished
> videos into a database and uploads two a day to YouTube. A live dashboard shows the queue,
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
6. **Reliability** (30 s): one night run makes three videos, a spare run covers failures, self-repair of template
   bugs, retries, and a live dashboard ([Operations](09-operations.md)).
7. **Close** (20 s): cost is a Claude Pro subscription; everything else is free tier.
