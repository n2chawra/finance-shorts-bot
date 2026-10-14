# Finance Shorts Bot

Automated pipeline that creates short, unique, music-and-motion-graphics personal-finance videos
(no voiceover) for an Indian audience, uploads exactly one per day to YouTube Shorts, and shows
everything on a dashboard.

Owner: Naishadh (full-stack, Next.js/TypeScript/Node/Python). Prefers direct, concise communication.
Read `PLAN.md` for milestones and current status. Update its checkboxes as work lands.

---

## Hard constraints

- **No voiceover.** On-screen text, motion, music and sound effects carry the whole explanation.
- **One upload per day** at 19:07 IST (configurable). Never more.
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
Claude Code routine (every ~6h, cloud)
  └─ planner → writer → number check → fact review → render → QA review
  └─ commits videos/<id>/manifest.json + thumbnail.png
  └─ uploads videos/<id>/video.mp4 as a GitHub Release asset (tag: video-<id>)
        │
        ▼
GitHub repo (handoff point; sessions never hold DB or YouTube credentials)
        │
        ▼
GitHub Actions (cron)
  ├─ ingest.yml   hourly   new manifests → Postgres (status: queued)
  ├─ publish.yml  daily    oldest queued video → YouTube (private + publishAt) → status: scheduled
  └─ stats.yml    daily    YouTube Analytics → video_stats
        │
        ▼
Postgres (Supabase/Neon free tier) ◄── Next.js dashboard (Vercel)
```

Start zero-server (GitHub Actions + Vercel + free Postgres). Move to a VPS with BullMQ/Redis only
if free tiers get in the way. Keep the worker code portable so it runs in both places.

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
  `everyNthRun`). Workers read these from the DB. Routines have no DB access, so the hourly
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

- Default quota 10,000 units/day; `videos.insert` costs 1,600. One upload/day is safe.
- Unverified API projects upload as private only. Apply for the audit early.
- Schedule by uploading with `privacyStatus: private` + `publishAt` (ISO 8601).
- Shorts: vertical/square, up to 3 min. Keep ours ≤ 60 s.

## Coding conventions

- TypeScript strict, Zod for every external payload (manifests, YouTube responses).
- Python: type hints, no global state in templates, each template a pure function of
  (script, style, t) → frame.
- Small commits with clear messages. Tests for variety rules, number checks and Indian formatting.
- Watchdog alerts on Telegram: failed run, failed upload, backlog < 5, token errors.
