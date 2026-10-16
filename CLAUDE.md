# Finance Shorts Bot

Automated pipeline that creates short, unique, music-and-motion-graphics personal-finance videos
(with an A/B-tested voiceover) for an Indian audience, uploads exactly one per day to YouTube Shorts, and shows
everything on a dashboard.

Owner: Naishadh (full-stack, Next.js/TypeScript/Node/Python). Prefers direct, concise communication.
Read `PLAN.md` for milestones and current status. Update its checkboxes as work lands.

---

## Hard constraints

- **Voiceover only from the offline voice engine** (`renderer/engine/voice.py`, Kokoro, Apache-2.0;
  installed by `scripts/setup-voice.sh`, never committed). One Indian-English and five American
  voices, rotated per video; numbers are spoken as words.
  Spoken numbers come only from code placeholders. No recorded, cloned or online voices. Since
  2026-10-16 it runs as the `voiceover` A/B experiment on half of new videos; on-screen text,
  motion, music and sound effects must still carry the video on their own.
- **Two uploads per day**, at 12:37 and 19:07 IST (setting `uploadTimes`). Never more than one video per slot.
- **Generation keeps going** on a schedule to build a backlog, capped at **30 ready videos**.
  When the backlog is full, generation runs improve or add templates instead of making videos.
- **Every video must be unique.** YouTube demonetizes repetitive, mass-produced content
  ("inauthentic content"). The variety rules below are mandatory, not nice-to-have.
- **Every number on screen is computed by code**, never typed by an LLM.
- **All audio is synthesized in code** (music + SFX). No downloaded music, no copyrighted assets.
- Every video ends with the disclaimer: "Illustrative only. Not financial advice."
- Generation runs as **Claude Code routines on a Claude Pro plan** (subscription usage, no API key).
  Keep runs lean. Never enable paid usage credits.

## Architecture

```
Claude Code routine (cloud: 04:07 IST makes all 3 of the day's videos in one session;
                     09:07 IST spare run makes up any shortfall, else idles)
  └─ planner → writer → number check → fact review → render → QA review
  └─ commits videos/<id>/manifest.json + thumbnail.png
  └─ uploads videos/<id>/video.mp4 as a GitHub Release asset (tag: video-<id>)
        │
        ▼
GitHub repo (handoff point; sessions never hold DB or YouTube credentials)
        │
        ▼
GitHub Actions (cron)
  ├─ ingest.yml   on push/release + every 6h   new manifests → Postgres (status: queued)
  ├─ publish.yml  daily    fills today's slots from the queue → YouTube (private + publishAt) → scheduled
  └─ stats.yml    daily    YouTube Analytics → video_stats
        │
        ▼
Postgres (Supabase free tier) ◄── Next.js dashboard (Netlify)
```

Start zero-server (GitHub Actions + Netlify + free Postgres). Move to a VPS with BullMQ/Redis only
if free tiers get in the way. Keep the worker code portable so it runs in both places.

## Self-improving agents (`agents/`, `improvement/`)

Four nightly Claude Code routines check and improve the automation itself, 23:00–09:00 IST:
**auditor** (23:00, after the 22:30 `data-audit.yml` compares the dashboard's numbers with YouTube and
the database into `metrics/data-audit.json`: fixes data bugs and code bugs anywhere, one refactor a
night; may change `workers/` and `lib/live-stats.ts` but never uploads, sign-in or the audit itself),
**research** (23:47, reports + proposals, never code), **improver** (06:17, A/B experiments on ~50% of
videos via `config/experiments.json`, keep/revert by `python -m improvement.evaluate`, template
weights/retire/new, fixes recurring failures) and **dashboard** (07:37, bug hunt + smoke tests, UI
trends Mon/Wed/Fri). Agents only push `agent/<name>/<date>` branches; `.github/workflows/agent-merge.yml`
merges them only if `scripts/guard.py` (path allow-lists, hard-rule invariants, size/daily limits)
and the tests pass. They report to `improvement/activity/` (dashboard Agents page) and raise
owner-only problems in `improvement/notifications/` (dashboard Notifications page, with the hourly
`watchdog.yml`). Rules: `agents/policy.md`. Never weaken the guard, the policy or the evaluator's
rules to let an agent change through.

Schedule by Pro-plan 5-hour usage windows (IST): window A 23:00–04:00 holds only non-critical work
(auditor 23:00, research 23:47); the video run at 04:07 always starts a fresh window B, followed
by improver 06:17 and dashboard 07:37 one after another; the spare video run at 09:07 starts a fresh
window C so it can still rescue a main run that hit the limit. Keep new routines inside this plan.

## Repo layout

```
apps/dashboard/          Next.js 15, App Router, TypeScript strict, Prisma, TanStack Query, Radix UI, Motion
workers/                 Node/TS scripts run by GitHub Actions: ingest, publish, stats, watchdog
renderer/                Python 3.12 render engine
  engine/                shared: canvas helpers, easing, characters, camera, audio synth, mux
  templates/<name>/      one folder per template: template.py + schema.json + README.md
  cli.py                 render a script JSON → mp4 (+ thumbnail, + preview contact sheet)
generator/               routine-side logic: history, variety rules, validation, number checks
  prompts/               prompts for planner, writer, fact reviewer, QA reviewer, template builder
videos/<id>/             manifest.json, script.json, thumbnail.png, preview.png (mp4 in Releases)
history/                 history.json: every generated video's topic, template, style (source of
                         truth for variety rules inside routines, mirrored into Postgres)
assets/fonts/            Poppins (OFL), downloaded from Google Fonts
reference/               original prototype renderer (rahul_vs_amit_v2.py)
.github/workflows/       ingest.yml, publish.yml, stats.yml
```

## Database (Prisma, Postgres + pgvector)

- `Template`: id, name, version, weight (float, default 1), enabled, lastUsedAt, createdAt
- `Topic`: id, category, title, embedding (vector), createdAt
- `Video`: id, templateId, topicId, status, script (jsonb), style (jsonb), fileUrl, thumbnailUrl,
  durationSec, title, description, tags[], createdAt
- `QaCheck`: id, videoId, checker (number_check | fact_review | qa_review), passed, notes (jsonb)
- `Upload`: id, videoId (unique), youtubeId, publishAt, state (pending | uploaded | scheduled |
  published | failed), error, attempts
- `VideoStat`: id, uploadId, day, views, likes, comments, subsGained, avgViewPct
- `AgentRun`: id, videoId?, agent, status, log (jsonb), startedAt, finishedAt, routineSessionUrl
- `Setting`: key, value (jsonb). Upload time, backlog cap, length range, disclaimer, alert prefs,
  `uploadsPaused`, `generationPaused`, `templateWork` (`maxPerDay`, `maxTemplates`,
  `everyNthRun`). Workers read these from the DB. Routines have no DB access, so the
  ingest job also writes them (plus the current backlog count) to `config/settings.json` in the
  repo, and routines read that file.
- `Video.queuePosition` (int) for manual reordering; publisher takes the lowest position.

Dashboard feature list (pages + API) lives in `PLAN.md` under M6.

Video status flow:
`planned → scripted → verified → rendered → qa_passed → queued → scheduled → published`
Any step can go to `failed` (with reason). `failed` videos are never uploaded.

## Generation run (what each routine session does)

1. **Read state**: `history/history.json`, count ready videos (`queued` + not yet ingested).
   If backlog ≥ 30 → do template work instead (step T) and stop.
2. **Planner (agent)**: pick a topic + template that pass the variety rules. Write `plan.json`.
3. **Writer (agent)**: produce `script.json` matching the template's `schema.json`.
   Numbers are inputs (principal, rate, years), not results.
4. **Number check (code)**: compute every displayed figure from inputs; reject if the script
   hard-codes a result or any claim contradicts the math. Max 2 rewrites, then mark failed.
5. **Fact review (separate agent, fresh context)**: checks claims, Indian context (tax slabs,
   SEBI/RBI rules, product names), tone, disclaimer. It did not see steps 2–3 reasoning.
6. **Render (code)**: `renderer/cli.py script.json` → mp4 + thumbnail + preview contact sheet.
7. **QA review (separate agent)**: looks at the contact sheet + audio levels. Rejects overlaps,
   cut-off or tiny text, empty scenes, unreadable contrast, length outside 45–60s.
8. **Ship**: write manifest (title, description, hashtags, style, template, topic), append to
   history, commit to `main`, upload mp4 as a Release asset. Log every step as an AgentRun entry
   inside the manifest.

**T. Template work** (when backlog is full, or every ~5th run): build or improve a template,
render 2 test videos with it, QA them, and only then set it `enabled`. Limited by settings:
at most `templateWork.maxPerDay` runs a day (default 1) and no new templates past
`templateWork.maxTemplates` (default 10). With `generationPaused` a run does nothing at all.

The code steps are `python -m generator.run <state|check-plan|number-check|figures|record|render|ship|fail>`;
the agent steps follow `generator/prompts/*.md`.

## Variety rules (enforced in `generator/variety.py`, not just prompted)

- Same template not used in the last N videos, where N scales with enabled templates
  (`min(6, templates - 2)`: 2 with four templates, 6 from eight up); no template above 30% of the
  last 20 (looser below five templates).
- Same topic category not in the last 3 videos; near-duplicate topics not within 60 days
  (embedding cosine > 0.85 once topics live in pgvector; until M4 a word-overlap cosine > 0.6).
- Rotate per video: color palette, character designs, hook style (question / shock number /
  myth / challenge), music (key, tempo 80–120 BPM, genre: lo-fi / upbeat pop / cinematic /
  synthwave / acoustic-ish), SFX set, end CTA.
- Titles and descriptions must not reuse an opening phrase from the last 20 videos.

## Render engine conventions

- 1080×1920, 30 fps, H.264 + AAC, 45–60 s, peak audio around −1 dB, mean around −18 dB.
- First 1 s must hook (big number or question). A pattern interrupt every 3–5 s.
- Text: min 44 px, never within 120 px of the bottom edge (Shorts UI), keep away from the right
  edge buttons. Indian number formatting (₹, L, Cr).
- Deterministic: same script + seed → same video.
- Preview mode renders a contact sheet of key frames for QA without encoding the full video.

## Secrets (GitHub Actions secrets, never committed, never given to routines)

`DATABASE_URL`, `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`. The dashboard's own env vars live in Netlify: `DATABASE_URL`, `DIRECT_URL`,
`DASHBOARD_PASSWORD`, `SESSION_SECRET`, `GITHUB_TOKEN` (read-only, this repo), `GITHUB_REPOSITORY`,
`YT_API_KEY` (Data API key for live public counters). The Google OAuth consent screen must be in **Production** status, otherwise
refresh tokens expire after 7 days.

## YouTube API facts

- Default quota 10,000 units/day; `videos.insert` costs 1,600. Two uploads/day (3,200) is safe.
- Unverified API projects upload as private only. Apply for the audit early.
- Schedule by uploading with `privacyStatus: private` + `publishAt` (ISO 8601).
- Shorts: vertical/square, up to 3 min. Keep ours ≤ 60 s.

## Coding conventions

- TypeScript strict, Zod for every external payload (manifests, YouTube responses).
- Python: type hints, no global state in templates, each template a pure function of
  (script, style, t) → frame.
- Small commits with clear messages. Tests for variety rules, number checks and Indian formatting.
- Watchdog alerts on Telegram: failed run, failed upload, backlog < 5, token errors.
