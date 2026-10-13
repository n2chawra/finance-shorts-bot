# Build plan

Work one milestone at a time. Each milestone ends with its done-criteria checked and a short
note under "Log". Don't start the next milestone until the current one is done.

## M1 — Render engine + first templates
- [x] Scaffold repo layout from CLAUDE.md; download Poppins (OFL) into `assets/fonts/`
- [x] Split `reference/rahul_vs_amit_v2.py` into `renderer/engine/` (drawing, easing, characters,
      camera punch/shake, confetti, audio synth, ffmpeg mux) + `templates/two_friends_race/`
- [x] Each template has `schema.json`; `cli.py` validates script JSON against it
- [x] Music generator with variety: key, tempo, genre presets, seeded
- [x] Build 3 more templates: `myth_vs_fact`, `money_leak_meter`, `quiz_countdown`
- [x] Preview mode: contact sheet of key frames

Done when: `python renderer/cli.py examples/<template>.json` renders a valid 45–60 s mp4 for all
4 templates, and two scripts with different seeds produce visibly different style and music.

## M2 — Generator + checks
- [ ] `generator/history.py` (history.json read/write), `variety.py` with unit tests
- [ ] `numbers.py`: SIP, lumpsum, inflation, EMI, CAGR, FD; Indian formatting; tests
- [ ] Prompts for planner, writer, fact reviewer, QA reviewer, template builder
- [ ] `generator/run.py`: one full generation run end to end, writing `videos/<id>/` and
      a Release asset via `gh`

Done when: running the generation flow manually in a Claude Code session produces one complete
video folder + release asset, with all three checks recorded in the manifest.

## M3 — Routine
- [ ] Write the routine prompt (`generator/prompts/routine.md`), self-contained
- [ ] Create the routine at claude.ai/code/routines, every 6 h at :07, attached to this repo
- [ ] Run it 3 times; measure Pro usage per run; tune (fewer retries, smaller previews) if heavy

Done when: 3 consecutive unattended runs each produce a valid, distinct video.

## M4 — Database + ingest
- [ ] Supabase or Neon Postgres with pgvector; Prisma schema from CLAUDE.md; migrations
- [ ] `workers/ingest.ts` + `.github/workflows/ingest.yml` (hourly)

Done when: new manifests appear in Postgres as `queued` within an hour of a routine run.

## M5 — YouTube publishing
- [ ] Google Cloud project, YouTube Data API v3, OAuth consent screen set to Production,
      refresh token script (`workers/auth.ts`, run once locally)
- [ ] Apply for the API audit (so uploads aren't stuck private)
- [ ] `workers/publish.ts` + `publish.yml` (daily): oldest queued → upload private with
      publishAt 19:07 IST, thumbnail, title, description, tags; retries; status updates
- [ ] `workers/stats.ts` + `stats.yml` (daily)
- [ ] `workers/watchdog.ts`: Telegram alerts

Done when: one video goes out on schedule unattended and its stats show up the next day.

## M6 — Dashboard

Backend (Next.js route handlers + Prisma, Zod-validated):
- [ ] Auth: single-owner login (password or Google), every route protected
- [ ] `GET /api/overview`: counts by status, backlog size, next upload, recent failures
- [ ] `GET /api/videos` (filter: status, template, topic, date; search), `GET /api/videos/:id`
- [ ] `POST /api/videos/:id/skip | delete | upload-now`, `PATCH /api/queue/order`
- [ ] `GET/PATCH /api/templates` (enable/disable, weight), `GET /api/runs`
- [ ] `GET /api/analytics` (views/subs over time, top/bottom videos, best weekday)
- [ ] `GET/PATCH /api/settings`: upload time, backlog cap, length range, disclaimer text,
      alert preferences, global pause. Workers read settings from the DB, not hard-coded values
- [ ] Publisher retries a failed upload max 3 times (`Upload.attempts`), then `failed` + alert

Frontend (mobile-first):
- [ ] Overview page: status counts, backlog, next scheduled upload, failure list
- [ ] Calendar of scheduled/published uploads (past + upcoming)
- [ ] Video list with search + filters
- [ ] Video detail: player, thumbnail, key-frame contact sheet, scene-by-scene script, the three
      check results, agent run timeline, YouTube link, stats chart
- [ ] Queue controls: skip, delete, drag to reorder, upload now, pause all uploads
- [ ] Templates page: avg views per template, enable/disable, weight, sample preview video
- [ ] Analytics page: views + subscribers over time, best/worst videos, best upload days
- [ ] Runs page: every routine run, result, duration, errors, link to the Claude session
- [ ] Settings page (fields above)
- [ ] Deploy to Vercel

Done when: everything above works on a phone.

## M7 — Feedback loop
- [ ] Weekly analyst routine: adjusts template weights from stats, suggests new template ideas
- [ ] Template builder runs when backlog is full

## Later (not scheduled)
- Edit title/description of a queued video before upload
- Thumbnail A/B testing
- "Generate a video on this topic" request from the dashboard (fires the routine's API trigger)
- Cross-post to Instagram Reels

## Log
- 2026-10-13: Prototype renderer (`reference/rahul_vs_amit_v2.py`) produced a 60 s Short with
  synthesized music + SFX. Starting M1.
- 2026-10-13: Repo scaffolded, Poppins added, local toolchain set up (Python 3.14 venv at
  `C:\venvs\finance-shorts-bot`, ffmpeg 9.0.2). Prototype renders on Windows unchanged apart from
  the font path: 1080×1920, 30 fps, H.264 + AAC, 60.0 s, peak −1.0 dB, mean −18.7 dB, 142 s to
  render. To fix during the engine split: the "...then STOPS at 35" pill sits ~70 px from the
  bottom edge (rule is 120 px).
- 2026-10-13: Engine split out (`renderer/engine/`), `two_friends_race` template, `cli.py` with schema
  validation, `--preview` and `--frames`. Engine output checked against the prototype: soundtrack
  sample-identical, result frame (confetti + flash) pixel-identical. Deliberate changes: text kept
  120 px clear of the bottom, minimum 44 px text, exact disclaimer wording, over-wide lines shrink to
  fit. Script text may not contain typed digits or ₹; numbers come from placeholders. Full render
  takes ~150 s locally. Still fixed in this template: palette, music, scene timings.
- 2026-10-13: M1 done. Four templates (`two_friends_race` 60 s, `myth_vs_fact` 50 s,
  `money_leak_meter` 54 s, `quiz_countdown` 48 s) render to valid 1080×1920 H.264 + AAC mp4s at
  −1 dB peak and −17.6 to −19 dB mean. Style (six palettes, character looks, five music genres, key,
  80–120 BPM) is resolved from the seed unless the script pins it; seeds 3 and 4 of the same script
  give ocean/cinematic vs plum/lo-fi. 107 tests, including a layout-rule check (44 px minimum,
  bottom 120 px clear, nothing off-screen) run through every second of every example. Not done by
  ear or eye: nobody has listened to the four new genres or watched the new templates in motion.
  Not varied yet: SFX set, scene timings.
- 2026-10-13: M2–M5 skipped for now at Naishadh's request; starting M6 on in-memory sample data.
