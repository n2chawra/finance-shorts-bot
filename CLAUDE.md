# Faceless Video Platform

Automated pipeline that makes unique, narrated, motion-graphics videos for several YouTube channels
and uploads them: **Shorts** (vertical) and **long videos** (landscape). Each channel has its own
niche, recipe, look, voice and schedule; the platform (planner → writer → checks → director → render →
QA → ship → upload → stats → self-improving agents) is shared. A dashboard shows everything.

Owner: Naishadh (full-stack, Next.js/TypeScript/Node/Python). Prefers direct, concise communication.
Read `PLAN.md` for milestones and current status. Update its checkboxes as work lands.

## Channels

Every channel lives in `channels/<slug>/` and is listed in `config/channels.json` (written by ingest
from the `Channel` table; `status` setup, review, active, paused or deleting). Code reads channel paths through
`generator/channels.py` and `workers/lib/channels.ts`; every `python -m generator.run` command takes
`--channel <slug>`. The **default channel** is `geography-maps-geopolitical-mysteries`.

| Slug | Channel | Look (`channel.json` → `look`) |
|---|---|---|
| `geography-maps-geopolitical-mysteries` | Geography, maps & geopolitical mysteries | flat political maps with small characters (flat kit) |
| `how-tech-and-ai-actually-work-chips-ai-p` | How Tech Works | 3D studio explainer (`look.engine: three`, `remotion/src/three/`) |
| `business-documentaries-rise-and-fall-of` | Craze & Crash | hybrid documentary (`look.engine: doc`, `remotion/src/doc/`) |
| `disasters-and-engineering-failures-expla` | Disaster Desk | investigative reconstruction (`look.kits`: three, flat, doc; `remotion/src/disaster/`) |
| `india-maps` | Naksha Bharat (Hindi) | India's official map with states made on screen (`remotion/src/flat/india.tsx`) |

What belongs to one channel is in its folder, not in this file:

- `channel.json`: language, voices, currency, numbers mode (`finance` | `simple` | `none`), disclaimer,
  `stories` (true or declared fiction), look, sound, upload category, length (`python -m generator.pack show <slug>`).
- `profile.md`: who it's for, what it covers and never covers, where facts come from, its field's rules.
  Every agent reads it first.
- `prompts/recipe.md`: the **champion recipe** (topic kinds, the first second, length and pace, the
  look, the ending). Where a shared prompt (`generator/prompts/*.md`, `agents/*.md`, template READMEs)
  gives a default, the channel's recipe and pack win. `prompts/lessons.md` and `prompts/studied.md`
  are its lessons from its own and studied videos.
- Settings (Shorts a day, upload times, long videos a week and days, length, pauses) are per channel on
  the dashboard (`Channel.settings`, mirrored into `config/channels.json`); `config/settings.json` holds
  the platform defaults.
- Also: `research/` (formats, shapes, topic feed), `longform/`, `cycle/` (weekly loop), `videos/`,
  `history/`, `metrics/`, `analysis/`, `notifications/`, `feedback-acks/`, `market.json`, `experiments.json`.

**Adding a channel**: the `/new-channel` skill (`.claude/skills/new-channel/`, `docs/guide/13-new-channel.md`,
`docs/plans/multi-channel.md`): verdict → research → build the pack → samples → owner review → Launch →
routines. **Deleting a channel** (owner, 2026-11-23): Channels page → Delete → `POST /api/channels/[id]/delete`
sets status `deleting`; `.github/workflows/delete-channel.yml` (`workers/delete-channel.ts`) purges its
database rows, release videos and repo folder, and the channel's routines disable themselves at their
next run. Two earlier channels were removed this way on 2026-11-23.

---

## Hard constraints (every channel)

- **The weekly loop** (owner, 2026-11-12). Each channel's Shorts improve themselves one tested change
  a week, with no owner review (`agents/policy.md` "The weekly loop", `agents/improver.md`):
  - One champion recipe (`prompts/recipe.md`), at most one Shorts challenger per channel
    (`scripts/guard.py`); half the Shorts get it. Challengers come from `channels/<slug>/cycle/backlog.json`
    (research, the auditor, studies and the owner's notes feed it); cycles alternate a first-second
    test and a look test.
  - **Judged by code** (`CHANNEL=<slug> python -m improvement.evaluate`): stayed to watch pooled per
    side (engaged views ÷ views) for the first second, title, topic and story; held after the hook for
    look, motion and sound. Kept at +5 points with 80% confidence, reverted at −5, from 8 Shorts a
    side within 7 days (extended once). Never judged on views alone. The improver applies the verdict,
    folds a kept one into the recipe, starts the next and logs the change in `channels/<slug>/changes.json`.
  - **The picture is read from where viewers leave**: the auditor ties each drop to the picture on
    screen (`analysis/pictures.json`), retires the worst look and queues a look challenger.
  - **Lessons**: the reviewer (`agents/reviewer.md`) watches recent Shorts frame by frame next to their
    drop points and writes each mistake that cost viewers into `prompts/lessons.md`; the writer follows
    it and QA enforces it.
  - **Study**: the owner pastes YouTube links on the dashboard's Study page; `study.yml`
    (`workers/study.ts`, Gemini free tier, `GEMINI_API_KEY`) turns them and ours into shot sheets
    (`workers/lib/sheets.ts`), writes techniques to `prompts/studied.md` and queues the biggest look
    difference as a challenger. Technique only: never their words, characters or art.
  - **Escalation**: three cycles under 45% stayed to watch, the next test is a format change; six, one
    owner notification (change niche or stop).
- **True stories** (owner, 2026-11-12). A channel whose `stories` is `true` tells sourced facts about
  real, named people, places, businesses or events: no invented example, no reaction shots, a payoff
  that is the story's most surprising fact (`generator/story.py`). A fiction channel says so in its
  disclaimer.
- **Directed shots** (owner, 2026-11-13). Every beat of every new Short and long video (a long video's
  `end` card aside) is `"scene": "directed"` (or the channel's engine: `"doc"` for `look.engine: doc`):
  a **place built for that line**, **something happening in it**, **the figure on a thing in that
  place** (a sign, a label, a screen; never a headline card), a **camera that moves** (at least three
  shot sizes) and **every change on a spoken word**, ending on a loop into the first frame. The
  **director** (`generator/prompts/director.md`, after the writer and the fact review) gives each beat
  its `params` (component, place, camera, moments, things, fig) and codes it in
  `remotion/src/videos/<id>/` on the channel's kit (`remotion/src/flat/` by default; `three/`, `doc/`,
  `disaster/`). Figures come from `params.fig` placeholders; the code check fails a figure typed into a
  file (`renderer/remotion.py`), the build fails a directed beat without params, the craft gates read
  its places, sizes and moments. A channel drawn on a kit adds the pieces a topic needs during the video
  run, additively (`generator/prompts/routine.md`), so a missing piece never fails a video. The older
  shot, build and board scenes stay only so old videos re-render.
- **Voiceover only from the offline voice engine** (`renderer/engine/voice.py`, Kokoro, Apache-2.0;
  installed by `scripts/setup-voice.sh`, never committed). Each channel names its narrators in
  `channel.json` (one Shorts narrator; long videos may rotate). Numbers are spoken as words and only
  from code placeholders. No recorded, cloned or online voices. Every video is voiced, with captions of
  every word from the voice timings (`remotion/src/fx/captions.tsx`).
- **Every number on screen is computed by code**, never typed by an LLM. The one exception is a
  **sourced fact** (a script's `facts`): a figure published by an official or reputable source, put in
  the topic feed by research with its URL, copied unchanged into the script (the number check compares
  them; a calculation starting from one names it, e.g. `"facts": {"amount": 1}`), shown with
  "Data: <source> · <month>", and confirmed by the fact reviewer on the source page or, when that page
  can't be reached, by web search (the official source's own result, or two independent reputable
  outlets agreeing on value, unit and date). Otherwise the video fails. A failed video never ends a
  generation run; the run moves on.
- **All audio is synthesized in code** (music + SFX; each channel's beds and effects in
  `channel.json` → `sound`). No downloaded music, no copyrighted assets.
- **Real photos and logos** (owner, 2026-11-11): only freely licensed files from Wikimedia Commons
  (public domain, CC0, CC BY, CC BY-SA; never NC/ND, a search-engine image, a stock photo or a frame of
  another channel's video), fetched by `python -m generator.images fetch` into `remotion/public/real/`
  with author and licence in `credits.json`, cut out of their background, shown as a photo head on a
  cartoon body (a real person never speaks) or a die-cut sticker (`remotion/src/studio/photo.tsx`), and
  credited in the description at ship. Licensed stock footage for the doc kit comes only through
  `generator/media/` with its licence recorded. The renderer itself never uses the network.
- **Every video must be unique.** YouTube demonetizes repetitive, mass-produced content. The variety
  rules below are mandatory, and only ever get stricter.
- **Demand first**: every video tells a format people already watch in the millions in that niche
  (`channels/<slug>/research/formats.json`, `generator/formats.py`), named in the plan's `story` with a
  reference video in `demand`, arranged in a shape from `research/shapes.json` (`generator/shapes.py`).
  News is never a reason to make a video on its own.
- **Never a gap.** Each channel makes its `dailyVideoTarget` Shorts a day and every ready one goes out
  in its upload slots; one long video per slot on its long days. Each format fills from its own queue,
  so a missing long video never costs a Short its slot. A long topic never needs one of our Shorts
  (`from_short` is optional; `scripts/guard.py` keeps a views gate out).
- **Best video first**: the **editor** step (`generator/prompts/editor.md`, `python -m generator.run rank`)
  ranks every ready Short into `channels/<slug>/editor/ranking.json`; ingest turns it into the queue
  order. The owner can pick, reorder, mark stale (status `rejected`) and leave **feedback** on a video
  or a channel (`Feedback` table → `channels/<slug>/metrics/feedback.json`). Every agent whose lane can
  fix a note answers it (`agents/policy.md`, `python -m generator.feedback --agent <name>`) in
  `channels/<slug>/feedback-acks/<agent>.json`.
- **Backlog cap**: generation keeps going to a backlog of at most **30 ready videos** per channel; when
  full, a run does recipe work instead.
- **Disclaimer**: every description carries the channel's disclaimer (`channel.json`), checked by
  check-plan. It is not drawn in the video (owner, 2026-11-20). Long videos keep the end card.
- **Variant system off** (`config/arms.json` → `frozen`); style checks are notes (`renderer/advice.py`).
  Captions end 340 px above a Short's bottom edge; one upload category per channel; no country tag on
  global videos.
- **Claude Code routines on a Claude Pro plan** (subscription usage, no API key). Keep runs lean. Never
  enable paid usage credits.

## Architecture

```
Claude Code routines (cloud, per channel: a video run makes the day's Shorts in one session;
                      a spare run makes up any shortfall; Scout + Studio make long videos)
  └─ planner → writer → number check → fact review → director → render → QA review
  └─ commits channels/<slug>/videos/<id>/manifest.json + thumbnail.png
  └─ uploads video.mp4 as a GitHub Release asset (tag: video-<id>)
        │
        ▼
GitHub repo (handoff point; sessions never hold DB or YouTube credentials)
        │
        ▼
GitHub Actions (cron)
  ├─ ingest.yml   on push/release + every 6h   new manifests → Postgres (status: queued)
  ├─ publish.yml  hourly       fills each channel's slots from its queue → YouTube (private + publishAt)
  ├─ stats.yml    every 3h YouTube Analytics → VideoStat, ChannelDay, retention + drop points
  ├─ stats-deep.yml daily  traffic, searches, countries, demographics, devices, impressions/CTR, comments
  ├─ watchdog.yml hourly   public-counter snapshot → LiveSnapshot, alerts
  ├─ study.yml, market.yml, niche-scan.yml, data-audit.yml, agent-merge.yml
  └─ delete-channel.yml    purges a channel the owner deleted
        │
        ▼
Postgres (Supabase free tier) ◄── Next.js dashboard (Netlify)
```

Start zero-server (GitHub Actions + Netlify + free Postgres). Keep the worker code portable so it can
move to a VPS with BullMQ/Redis if free tiers get in the way.

**Routine times** follow the Pro plan's 5-hour usage windows (IST; `workers/lib/schedule.ts`): window A
23:00–04:00 holds non-critical work (auditor 23:00, research); the main video run at 04:07 opens window
B, followed by improver 06:17 and dashboard 07:37; the spare video run at 09:07 opens window C. A new
channel's routines come from `cd workers && npm run routines -- --add <slug>`; the Launch review refuses
a channel that doesn't fit. Routines of a paused channel exit in seconds; those of a deleted channel
disable themselves.

## Self-improving agents (`agents/`, `improvement/`)

Shared agents (auditor, improver, dashboard, monthly) work on every active or paused channel in turn
(`CHANNEL=<slug>`); per-channel agents (research, reviewer, scout, studio) work for the channel their
prompt names.

- **auditor** (23:00): compares the dashboard's numbers with YouTube and the database
  (`data-audit.yml` → `channels/<slug>/metrics/data-audit.json`), fixes data and code bugs, one refactor
  a night, writes the Analytics page's AI analysis into `channels/<slug>/analysis/`, runs the weekly
  picture tally.
- **research** (nightly, per channel): demand scan from `market.yml`'s `market-data` and the niche scan;
  reports, the topic feed and challengers, never code.
- **improver** (06:17): applies weekly-loop verdicts and kept changes, fixes recurring failures, changes
  scenes, kits, camera and design in `remotion/src` behind flags.
- **reviewer** (twice a week, per channel): lessons from our own Shorts.
- **dashboard** (Sundays): bug hunt and smoke tests.
- **scout** and **studio** (per channel with long videos): long topics, then the week's long videos.
- **monthly** (`agents/monthly.md`): off unless the owner turns it on.

Agents only push `agent/<name>/<date>[/<slug>]` branches; `.github/workflows/agent-merge.yml` merges them
only if `scripts/guard.py` (path allow-lists, hard-rule invariants, size/daily limits) and the tests pass.
They report to `improvement/activity/` (dashboard Agents page) and raise owner-only problems in
`channels/<slug>/notifications/`. Rules: `agents/policy.md`. Never weaken the guard, the policy or the
evaluator's rules to let an agent change through.

**Research routes every finding** (`research/README.md` in each channel): `video` → the topic feed
`research/topics.json` (the planner's `state.topic_feed`; a usable `breaking` topic first, a topic with
`facts` told as news); `adopt` → the improver applies it; `experiment` → the weekly loop; `template` → a
new format; `owner` → notifications.

## Two formats

Every video has a `format`. The frame and its layout rules come from a `Frame`
(`renderer/engine/canvas.py`): `SHORT` is 1080×1920 with the Shorts safe zone; `LONG` is 1920×1080,
smaller minimum text, slower voice. Camera, music, voice, layout checks, number checks and variety rules
are shared.

**One engine: Remotion.** Python owns every number, the timing and the sound; Remotion only draws. A
script is a **storyboard**: beats, each with a scene, a spoken line, named events the picture reacts
to, and the camera. `renderer/timeline/build.py` computes the `maths`, speaks each beat with Kokoro
(word and phoneme timings), mixes music + SFX + voice and writes `timeline.json`; `remotion/` draws it
(`renderer/remotion.py` renders, muxes and gates).

| | Shorts | Long-form |
|---|---|---|
| Made by | the channel's video routine | the **Studio** agent (`agents/studio.md`) |
| Topics from | the research agent's feed | the **Scout** agent's feed (`agents/scout.md`) |
| Template | `short_story` (1080×1920) | `long_story` (1920×1080, chapters) |
| Length / pace | the channel's length setting and recipe | the channel's long length setting |
| Ids | `v-YYYYMMDD-NN` (blocks per channel, `config/id-blocks.json`) | `L-YYYYMMDD-NN` |
| State | `python -m generator.run state --channel <slug>` | `... state --format long --channel <slug>` |

Three gates fail the render: **layout** (every visible text box, measured in the rendered stills by
`remotion/src/fx/probe.tsx`: at least the format's minimum size, clear of the bottom zone, inside the
frame), a long beat whose narration fills under 55% of its length, and **liveliness**
(`renderer/gates.py`: median frame change ≥ 1.2, under 15% still samples, no 4-second stretch with
nothing moving; a channel may tighten the gap in `channel.json` → `motion.maxGapSec`). The craft gates
(`renderer/craft.py`) fail empty frames, repeated pictures, one shot size or one place.

## Repo layout

```
apps/dashboard/          Next.js 15, App Router, TypeScript strict, Prisma, TanStack Query, Radix UI, Motion
workers/                 Node/TS scripts run by GitHub Actions: ingest, publish, stats, watchdog, study, delete-channel
renderer/                Python 3.12: numbers, timing and sound for the videos
  engine/                audio + music synth, Kokoro voice, money formatting, maths, style
  models/maths.py        named calculations
  timeline/build.py      storyboard script → timeline.json + audio.wav; check_script validates
  templates/<name>/      README.md: the writer's contract (short_story, long_story)
  remotion.py, gates.py  render with Remotion in chunks, mux, contact sheet, liveliness gate
remotion/                Remotion 4 + React: design rules, kits, cast, scenes, camera, compositions
  src/flat/              the flat 2D kit (directed beats)
  src/three/, src/doc/, src/disaster/   the 3D, documentary and disaster kits
  src/videos/<id>/       each video's own beat code
channels/<slug>/         one folder per channel (see Channels)
config/                  channels.json, settings.json, arms.json, id-blocks.json, channel-layout.json
generator/               routine-side logic: state, packs, history, variety rules, validation, number checks
  prompts/               planner, writer, fact reviewer, director, QA reviewer, editor, recipe builder
agents/                  the self-improving agents' prompts and policy
improvement/             evaluator, activity, merge log
assets/fonts/            Poppins (OFL)
.github/workflows/       ingest, publish, stats, watchdog, study, market, agent-merge, delete-channel …
```

## Database (Prisma, Postgres + pgvector)

- `Channel`: id (the folder slug), name, status, settings (jsonb, over the platform `Setting` rows),
  youtubeChannelId, refreshTokenEnc (encrypted), connectedAt
- `Template`: id, name, version, weight, enabled, lastUsedAt, createdAt
- `Topic`: id, channelId, category, title, embedding (vector), createdAt
- `Video`: id, channelId, templateId, topicId, status, script (jsonb), style (jsonb), fileUrl,
  thumbnailUrl, durationSec, title, description, tags[], queuePosition, createdAt
- `QaCheck`: id, videoId, checker (number_check | fact_review | qa_review), passed, notes (jsonb)
- `Upload`: id, videoId (unique), youtubeId, publishAt, state (pending | uploaded | scheduled |
  published | failed), error, attempts
- `VideoStat`, `ChannelDay`, `Breakdown`, `Comment`, `LiveSnapshot`, `Feedback`
- `AgentRun`: id, videoId?, agent, status, log (jsonb), startedAt, finishedAt, routineSessionUrl
- `Setting`: platform-wide key/value (backlog cap, alert prefs, `templateWork`). Routines have no DB
  access, so ingest writes settings and backlog counts to `config/settings.json` and `config/channels.json`.

Video status flow:
`planned → scripted → verified → rendered → qa_passed → queued → scheduled → published`
Any step can go to `failed` (with reason). `failed` videos are never uploaded.

## Generation run (what each video routine does, `generator/prompts/routine.md`)

1. **Read state** (`python -m generator.run state --channel <slug>`): history, backlog, settings, topic
   feed, owner feedback, lessons. Backlog full → recipe work (step T) and stop.
2. **Planner (agent)**: topic + format + shape that pass the variety rules → `plan.json`; `check-plan`.
3. **Writer (agent)**: the storyboard `script.json` from the template's README and the channel's recipe.
   Numbers are inputs, not results.
4. **Number check (code)**: computes every displayed figure; rejects hard-coded results. Max 2
   rewrites, then failed.
5. **Fact review (separate agent, fresh context)**: checks every claim and sourced fact, the field's
   rules, tone and disclaimer.
5b. **Director (agent)**: every beat becomes a directed shot on the channel's kit, then `lint`.
6. **Render (code)**: `python -m generator.run render <id>` → voice + timeline, Remotion render, mp4 +
   thumbnail + preview contact sheet, gates.
7. **QA review (separate agent)**: contact sheet + audio levels + lessons. Rejects overlaps, cut-off or
   tiny text, empty scenes, unreadable contrast, a repeated lesson, length outside the settings.
8. **Ship**: manifest (title, description with the disclaimer and photo credits, hashtags, style,
   template, topic), history, commit to `main`, mp4 as a Release asset. Every step is logged as an
   AgentRun entry in the manifest.

**T. Recipe work** (backlog full, or every ~5th run): add or improve a story recipe in a template's
README with a checked example (`generator/prompts/template_builder.md`), limited by
`templateWork.maxPerDay` (default 1) and `templateWork.maxTemplates` (default 10). Video runs don't
change shared scene code (kit pieces aside, above); the improver may, behind flags. With
`generationPaused` a run does nothing.

Code steps: `python -m generator.run <state|check-plan|number-check|figures|record|render|ship|fail> --channel <slug>`;
agent steps follow `generator/prompts/*.md`.

## Variety rules (enforced in `generator/variety.py`, not just prompted)

- Each plan's `story` is a demand-proven format of the channel; the same format not twice in a row.
- Same topic category not in the last 3 videos; near-duplicate topics not within 60 days (word-overlap
  cosine > 0.6 until embeddings are used).
- Rotate per video: palette or look, hook style, music (key, tempo, genre from the channel's beds), SFX
  set, end CTA.
- Titles and descriptions must not reuse an opening phrase from the last 20 videos; neither the title
  nor the topic title repeats a **shape** from the last 3 (numbers and subject removed).
- The same story kind not in the last 3 videos.
- **Trends**: a `trending` feed topic is offered first, earns one extra video past the daily target and
  jumps the upload queue (manifest `priority`); `generator/prompts/trend_run.md`.

## Render engine conventions

- Shorts 1080×1920, long 1920×1080, 30 fps, H.264 + AAC, peak audio around −1 dB, mean around −18 dB.
  A beat lasts as long as its spoken line; the whole video plays at its format's tempo.
- The first frame hooks. A new picture every 3–5 s (Shorts), 3–6 s (long).
- Text: Shorts min 44 px, never within 120 px of the bottom edge, away from the right-edge buttons
  (`remotion/src/design/frame.ts`). Money in the script's `currency` with international grouping and
  K/M/B, rupees with lakh and crore (`renderer/engine/formatting.py` `Money`, `remotion/src/fmt/inr.ts`).
- Deterministic: same script + seed → same video.
- `python -m renderer.remotion <timeline.json> --out <dir> --stills-only` renders a contact sheet for QA.

## Secrets (GitHub Actions secrets, never committed, never given to routines)

`DATABASE_URL`, `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `GEMINI_API_KEY`. Each channel's own YouTube refresh token is stored encrypted in
`Channel.refreshTokenEnc` (Connect YouTube on the Channels page; key derived from `SESSION_SECRET`). The dashboard's env
vars live in Netlify: `DATABASE_URL`, `DIRECT_URL`, `DASHBOARD_PASSWORD`, `SESSION_SECRET`,
`GITHUB_TOKEN` (read-only), `GITHUB_REPOSITORY`, `YT_API_KEY`, `GITHUB_ACTIONS_TOKEN` (Actions read and
write: starts Publish on "Upload now" and from `apps/dashboard/netlify/functions/publish-heartbeat.mts`
when Publish hasn't run for 65 minutes, because GitHub's cron drops runs on busy days). The Google OAuth
consent screen must be in **Production** status, otherwise refresh tokens expire after 7 days.

## YouTube API facts

- Three daily buckets per project, reset at midnight Pacific: **Video Uploads** 100 calls
  (`videos.insert`), **Search Queries** 100 calls (`search.list`), **Queries** 10,000 units for
  everything else (`thumbnails.set` 50, lists 1). The quota keeper (`workers/lib/quota.ts`) counts each
  and stops uploads at 95 (`YT_QUOTA_UPLOADS`, `YT_QUOTA_SEARCHES`, `YT_QUOTA_UNITS`). All channels share
  the project's quota.
- Unverified API projects upload as private only.
- Schedule by uploading with `privacyStatus: private` + `publishAt` (ISO 8601).
- Shorts: vertical/square, up to 3 min.

## Coding conventions

- TypeScript strict, Zod for every external payload (manifests, YouTube responses).
- Python: type hints, no global state in templates.
- Small commits with clear messages. Tests for variety rules, number checks and money formatting.
- Watchdog alerts on Telegram: failed run, failed upload, backlog < 5, token errors.
