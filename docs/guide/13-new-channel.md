# 13 · Starting a second channel

The machine (routines, agents, guard, evaluator, renderer, dashboard, workers) is the same for every
channel. What makes a channel *this* channel lives in a few places. A new channel is a copy of the
repository with those places changed, its own accounts, and its own routines.

## 1. What describes the channel

| File | What it holds | Change for a new channel |
|---|---|---|
| `channel/profile.md` | audience, topics in and out, sources, calendar, rules of the field | rewrite it: every agent and the planner, writer and fact reviewer read it first |
| `config/market.json` | the searches the daily market job runs | the new niche's search terms, region and language |
| `remotion/src/cast/` | the recurring characters | new characters, or keep these if they fit |
| `renderer/templates/*/README.md`, `examples/` | story recipes with worked examples | examples in the new niche; the recipe shapes mostly carry over |
| `generator/prompts/planner.md` | the list of topic categories | the new niche's categories (and `generator/variety.py` if it names any) |
| `improvement/cycle/recipe.json`, `improvement/cycle/backlog.json` | the weekly loop's champion recipe and its waiting challengers | start the recipe from the lessons in section 5, empty the backlog's `history` and `stayedByCycle` |
| `generator/prompts/lessons.md`, `generator/prompts/studied.md` | mistakes the reviewer found in our videos; techniques from videos the owner studied | empty both: they are this channel's own (studied.md keeps its header) |

## 2. What is still finance- or India-specific in code
Be honest with yourself about these before choosing a niche far from personal finance:
- **Numbers:** the `maths` kinds (`sip`, `lumpsum`, `emi`, `card_min_due`) and their independent
  recomputation in the number check. A non-finance channel needs its own calculations, or none.
- **Formatting:** ₹, lakh and crore (`renderer/engine/` and `remotion/src/fmt/inr.ts`).
- **Voice:** the Kokoro voices chosen for Indian English (`renderer/timeline/build.py`).
- **Sourced facts:** the fact reviewer and the news `headline` beat expect official statistics.
- **The disclaimer** is a hard rule for a finance channel; another niche may need a different one
  (it is checked by the guard, so change it in `CLAUDE.md`, the guard and the end card together).

## 3. Accounts and infrastructure (one set per channel)
1. A new GitHub repository created from this one (keep `main` clean of the old channel's `videos/`,
   `history/`, `metrics/` and `improvement/` data).
2. A YouTube channel, a Google Cloud project with the YouTube Data and Analytics APIs, the OAuth
   consent screen in Production, and a refresh token (`cd workers && npm run auth`).
3. A Supabase project (Postgres) and a Netlify site for the dashboard.
4. The GitHub Actions secrets and Netlify variables listed in `CLAUDE.md` → Secrets, plus (added
   2026-11-13):
   - `GEMINI_API_KEY` (GitHub secret): a free Google AI Studio key, **no billing**, in its own
     project. The Study page uses it to watch YouTube videos. Free tier is about 20 requests a day per
     model; each studied link costs 2 (theirs and ours).
   - `GITHUB_ACTIONS_TOKEN` (Netlify): a fine-grained token for the new repo, "Actions: read and
     write" only. Without it "Upload now" and the Study page wait for GitHub's schedule, and the
     publish heartbeat (`netlify/functions/publish-heartbeat.mts`) does nothing.
   - `YT_API_KEY` (Netlify): a Data API key restricted to YouTube Data API v3, for the live counters.
5. The routines at claude.ai → Code → Routines, copied from the first channel's with the new
   repository: video main and spare runs, trend run, auditor, research, improver, dashboard,
   reviewer (Tue and Fri), Scout, Studio and monthly review.
6. Check the workflows run on the new repo: ingest (it applies the database migrations), publish,
   stats, stats-deep, market, watchdog, data-audit, agent-merge and study. GitHub's own schedule
   drops runs on busy days (12 Nov 2026: no Publish run for 9 hours), so Publish also runs after
   every Ingest and from the Netlify heartbeat.

## 4. Usage: the real limit
Every routine of every channel draws on the same Claude plan's 5-hour windows. One channel already
fills a Pro plan's nights (the auditor was refused for usage on 16 Oct 2026). A second channel
needs a larger plan or its own account; schedule its routines in windows the first channel
doesn't use, and keep `docs/guide/12-run-times.md`'s measurements for each.

## 5. What the first channel learned (start the next one here)
Written 13 Nov 2026, after 30 days: 95 videos made, 59 published, about 15,400 views, 14 subscribers.
The numbers behind each line are in `CLAUDE.md` and `PLAN.md` → Log.

**What viewers wanted**
- Big money beats personal budget: big-money titles had a median of 773 views, budget tips 118.
- Global beats local: famous people and companies travel; one-country stories stayed in the hundreds.
- Short beats long: Shorts of 35 s or less did several times better than 60 s ones.
- The first second decides almost everything: 93% of views came from the Shorts feed, and up to 76%
  of viewers swiped away. Name the person and the figure in the first frame and the first sentence.
- Most of the channel's views came from a handful of Shorts; the median Short got 79.

**How the machine should run from day one**
- **The weekly loop**: one champion recipe and one tested challenger at a time, judged by code
  (`improvement/evaluate.py`), with no owner review. Start it on day one, not after a month.
- **The Growth loop page** shows this week's test, the live scoreboard, the recipe, the queue and
  the reviewer's lessons; the Overview has a "This week's test" card.
- **The Study page**: the owner pastes YouTube links worth learning from (Shorts or long videos),
  optionally naming one of ours to compare with. Gemini watches both into shot sheets
  (`workers/lib/sheets.ts`), code measures them, and `workers/study.ts` applies the result: techniques
  to `generator/prompts/studied.md` for the writer, the biggest look difference as a weekly-loop
  challenger. Calibrated on our own Shorts (5 of 5 read right). Technique only, never their content.
- **Never an empty upload slot**: the video run keeps making Shorts until a full day of slots is ready
  (not just the daily target), and the watchdog raises a critical notice when a slot passes empty.

**What not to repeat**
- **A fully automatic competitor finder was built and dropped (13 Nov 2026).** YouTube shows cloud
  machines a reCAPTCHA, so nothing in the cloud can watch a video in a browser; and on our topics
  the most-watched Shorts were mostly talking heads or off-topic, not animation. Let the owner pick
  what to study instead. Its code is in the history of branch `claude/fervent-clarke-q7cx4o` if it is
  ever wanted again (gap reports, a nightly style model).
- **Show YouTube's own numbers.** The dashboard once took the larger of Analytics and the live counter,
  and let parallel requests overwrite each other, so views went up and down and didn't match YouTube.
  Now the live counter is the number wherever it exists, a write never replaces newer numbers, and a
  drop is followed only when two refreshes in a row show it (`lib/live-stats.ts`, `lib/live-counter.ts`).
- **Check the guard's lists by reading them.** A comment once swallowed two forbidden paths
  (`improvement/tests/*`, `improvement/merge-log.json`); they were restored on 13 Nov 2026.
- **An agent's test must not import a dashboard file that needs a package the workers don't have**
  (the auditor's merge was blocked by a `zod` import on 13 Nov 2026): keep shared logic in files with
  no imports (`apps/dashboard/src/lib/growth-logic.ts`).

