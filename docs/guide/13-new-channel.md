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
4. The GitHub Actions secrets and Netlify variables listed in `CLAUDE.md` → Secrets.
5. The routines at claude.ai → Code → Routines, copied from the first channel's with the new
   repository: video main and spare runs, trend run, auditor, research, improver, dashboard,
   Scout, Studio and monthly review.

## 4. Usage: the real limit
Every routine of every channel draws on the same Claude plan's 5-hour windows. One channel already
fills a Pro plan's nights (the auditor was refused for usage on 16 Oct 2026). A second channel
needs a larger plan or its own account; schedule its routines in windows the first channel
doesn't use, and keep `docs/guide/12-run-times.md`'s measurements for each.
