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
- [x] `generator/history.py` (history.json read/write), `variety.py` with unit tests
- [x] `numbers.py`: SIP, lumpsum, inflation, EMI, CAGR, FD; Indian formatting; tests
- [x] Prompts for planner, writer, fact reviewer, QA reviewer, template builder
- [x] `generator/run.py`: one full generation run end to end, writing `videos/<id>/` and
      a Release asset via `gh`

Done when: running the generation flow manually in a Claude Code session produces one complete
video folder + release asset, with all three checks recorded in the manifest.

## M3 — Routine
- [x] Write the routine prompt (`generator/prompts/routine.md`), self-contained
- [ ] Create the routine at claude.ai/code/routines, every 6 h at :07, attached to this repo
- [ ] Run it 3 times; measure Pro usage per run; tune (fewer retries, smaller previews) if heavy

Done when: 3 consecutive unattended runs each produce a valid, distinct video.

## M4 — Database + ingest
- [x] Supabase or Neon Postgres with pgvector; Prisma schema from CLAUDE.md; migrations
- [x] `workers/ingest.ts` + `.github/workflows/ingest.yml` (after each video release, plus every 6 hours)

Done when: new manifests appear in Postgres as `queued` within an hour of a routine run.

## M5 — YouTube publishing
- [x] Google Cloud project, YouTube Data API v3, OAuth consent screen set to Production,
      refresh token script (`workers/auth.ts`, run once locally)
- [ ] Apply for the API audit (so uploads aren't stuck private)
- [x] `workers/publish.ts` + `publish.yml` (daily): oldest queued → upload private with
      publishAt 19:07 IST, thumbnail, title, description, tags; retries; status updates
- [x] `workers/stats.ts` + `stats.yml` (daily)
- [ ] `workers/watchdog.ts`: Telegram alerts

Done when: one video goes out on schedule unattended and its stats show up the next day.

## M6 — Dashboard

Backend (Next.js route handlers + Prisma, Zod-validated):
- [x] Auth: single-owner login (password or Google), every route protected
- [ ] `GET /api/overview`: counts by status, backlog size, next upload, recent failures
- [ ] `GET /api/videos` (filter: status, template, topic, date; search), `GET /api/videos/:id`
- [ ] `POST /api/videos/:id/skip | delete | upload-now`, `PATCH /api/queue/order`
- [ ] `GET/PATCH /api/templates` (enable/disable, weight), `GET /api/runs`
- [ ] `GET /api/analytics` (views/subs over time, top/bottom videos, best weekday)
- [ ] `GET/PATCH /api/settings`: upload time, backlog cap, length range, disclaimer text,
      alert preferences, global pause. Workers read settings from the DB, not hard-coded values
- [ ] Publisher retries a failed upload max 3 times (`Upload.attempts`), then `failed` + alert

Frontend (mobile-first). Ticked pages run on in-memory sample data until M4 lands:
- [x] Overview page: status counts, backlog, next scheduled upload, failure list
- [x] Calendar of scheduled/published uploads (past + upcoming)
- [x] Video list with search + filters
- [x] Video detail: player, thumbnail, key-frame contact sheet, scene-by-scene script, the three
      check results, agent run timeline, YouTube link, stats chart
- [x] Queue controls: skip, delete, drag to reorder, upload now, pause all uploads
- [x] Templates page: avg views per template, enable/disable, weight, sample preview video
- [x] Analytics page: views + subscribers over time, best/worst videos, best upload days
- [x] Runs page: every routine run, result, duration, errors, link to the Claude session
- [x] Settings page (fields above)
- [ ] Deploy to Netlify (`netlify.toml`; builds skipped when `apps/dashboard` is unchanged)

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
- 2026-10-13: M6 started on sample data. `apps/dashboard` has all nine pages, Zod schemas for every
  payload, and the route handlers from the backend list (overview, videos, video actions, queue
  order, templates, runs, analytics, settings) backed by an in-memory store in `src/lib/store.ts`.
  Backend boxes stay unticked: no Prisma, no auth, no real publisher. Checked in the browser at
  desktop and 375 px: every page loads, queue reorder and pause work. `next build` not run yet.
  Found while building: the variety rule "same template not used in the last 5 videos" cannot be
  met with four templates; it needs at least six, or the rule needs relaxing.
- 2026-10-13: M2 done except the real GitHub upload. `generator/` has history, variety rules
  (template window scales with template count), the number check (closed-form formulas cross-check
  each template; unsupported numbers in titles and descriptions are rejected), five prompts and
  `python -m generator.run` for the code steps. 148 Python tests. One real end-to-end run with four
  subagents produced `videos/v-20261013-01/` (myth_vs_fact): QA review rejected the first render
  because a number the template draws sat in the middle of a sentence, the writer rewrote it, and
  number check, fact review and QA review then passed. Fix from that run: every template README
  now lists which numbers appear beside each script line. The release upload ran as a dry run:
  `ship --release` needs the `gh` CLI, a GitHub repo and a sign-in.
- 2026-10-13: Two gaps closed. `generationPaused` stops routines entirely; `templateWork.maxPerDay`
  (1) and `templateWork.maxTemplates` (10) cap template work. Both are in `config/settings.json`,
  `generator.run state`, and the dashboard Settings and Overview pages.
- 2026-10-13: Dashboard restyled with Radix UI (dialog, select, switch, slider, accordion, tooltip,
  toast, progress, toggle group), Motion animations, lucide icons and a light/dark/system theme
  switch. `next build` passes. Open notes from reviewers: the title of v-20261013-01 says "stays
  safe", which could be read as bank safety rather than buying power; myth_vs_fact shows the gap
  from unrounded values, so it can differ by 0.1 L from subtracting the two rounded finals.
- 2026-10-13: Code is on GitHub as the private repo `n2chawra/finance-shorts-bot`. The first video
  is uploaded as Release `video-v-20261013-01` (`video.mp4`, 6.2 MB) and its manifest records
  `uploaded: true`. That completes M2. Local `git push` from a non-interactive shell needs
  `gh auth setup-git` (git here uses Git Credential Manager, which wants a prompt).
- 2026-10-13: M3 started. `generator/prompts/routine.md` written; setup steps for the routine and its
  cloud environment are in `generator/README.md`. In a run the main session plans and writes, and
  only the two reviewers are subagents, to keep Pro usage down. Unverified until the first cloud
  run: whether `gh release create` can upload the mp4 through the GitHub proxy
  (`uploads.github.com` is not on the default network allowlist), and how long a render takes on
  the 4-vCPU cloud VM.
- 2026-10-13: First cloud routine run (after a setup-script fix) planned, wrote, fact-reviewed (one
  rewrite), rendered and QA-passed `v-20261013-02` in the cloud, then could not ship: cloud sessions
  get `403 Creating, editing, or deleting releases is not permitted for this session type`, and the
  push failed because the Claude GitHub App has no write access to the repo. That video was lost.
  Fix for releases: `ship --media-branch` pushes `media/<id>` (HEAD plus `video.mp4`) and
  `.github/workflows/release-video.yml` creates the release and deletes the branch. Verified with a
  `media/selftest` branch pushed from this machine: release `video-selftest` was created with the
  6.2 MB asset and the branch was removed. Still needed: install the Claude GitHub App on the repo.
- 2026-10-13: Second cloud run succeeded unattended: `v-20261013-02` (money_leak_meter, cab rides)
  passed all three checks first time, pushed to `main`, and the workflow created Release
  `video-v-20261013-02` (7.2 MB) and deleted `media/v-20261013-02`. That is 1 of the 3 consecutive
  runs M3 needs. Follow-ups applied: the routine now picks whichever Python has the packages (the
  VM had 3.11 and 3.13), and the money_leak_meter compare bar is labelled "If invested" instead of
  "Invested". The manifest's `release.uploaded` stays false on this path; the release itself is the
  record, and ingest (M4) should check for it.
- 2026-10-13: Three consecutive unattended cloud runs each shipped a distinct video, which meets the
  M3 done-criterion: `-02` money_leak_meter/spending/ember/synthwave, `-03` two_friends_race/sip/
  forest/lo-fi, `-04` quiz_countdown/fd/plum/pop. With `-01` that is all four templates, four
  categories, four palettes, four genres and four hook styles in four videos. Each has a Release
  with its mp4 and no media branch left behind. Still open in M3: the routine is on a daily
  schedule, not every 6 hours, and Pro usage per run has not been measured. The next run (the 5th)
  will be template work.
- 2026-10-13: M4 mostly done. Supabase (Singapore) has the schema; `workers/ingest.ts` run locally put
  the four videos in as `queued` with checks and run steps, is a no-op on a second run, and wrote
  backlog 4 to `config/settings.json`. The dashboard reads Postgres when `DATABASE_URL` is set
  (label "Live data") and sample data otherwise; all API routes return real rows. Not done: the
  `ingest.yml` run on GitHub failed because the `DATABASE_URL` and `DIRECT_URL` secrets are saved
  empty, so the done-criterion (a routine's video appearing as queued on its own) is unverified.
  Notes: API calls take 1.5–3 s locally (remote pooler, several queries each); cloud-made videos do
  not play in the local dashboard because their mp4s exist only in Releases; a wrong database
  password shows up as "can't reach database server" because the pooler answers slowly.
- 2026-10-13: M4 done. With the secrets set from the env file, `ingest.yml` succeeds on GitHub
  (migrations current, nothing new, settings unchanged). Pushing a `media/selftest` branch ran
  Release video and then Ingest automatically 18 seconds later, so a routine's video will be
  ingested within about a minute of its release. Not yet seen with a real new video, because the
  next routine run is template work.
- 2026-10-13: Reset at Naishadh's request: the four test videos' folders and `history/history.json`
  were cleared from the repo (still in git history), and `workers/reset-data.ts` added to empty the
  database's generated rows. Routine schedule changed to three runs a day (06:07, 14:07, 22:07 IST;
  cron `37 0,8,16 * * *` UTC). `templateWork.everyNthRun` set to 0 so every run makes a video until
  the backlog reaches the cap; template work then happens only when the backlog is full.
- 2026-10-13: Schedule is now 01:07 and 04:07 IST (overnight) and 14:07 IST (cron `37 8,19,22 * * *`
  UTC). Template building turned up: while there are fewer than 8 templates, a run builds a new one
  after every 2 videos (`everyNthRun` 3, at most one a day), counted from the last template run
  rather than from history length. The template window now reaches 6 videos at 8 templates. The
  unattended template-builder path has never run; its first run is the test.
- 2026-10-14: First unattended night: the 01:07 run's video failed QA twice (pink amount on a pink
  bar in the plum palette; bar value labels now use the text colour), the 04:07 run's video went
  through release and ingest with nobody involved. M5 code written: `workers/auth.ts` (one-time
  sign-in; stores the refresh token in `.env` and the GitHub secret without printing it),
  `publish.ts` (10:07/13:07/16:07 IST; one video for today's 19:07 slot, upload-now first,
  3 attempts then failed), `stats.ts` (08:47 IST, Analytics per day up to yesterday), and marking
  videos published once YouTube shows them public. Plain fetch + Zod, no new packages. Both
  workflows do nothing until the YouTube secrets exist. Not yet run against YouTube.
- 2026-10-14: YouTube connected to the channel DevDomain (consent screen in Production; homepage and
  privacy policy published from the public repo `n2chawra/finance-shorts-site`). The publish
  workflow uploaded `v-20261014-02` as YouTube video FJQ_HqX5ly0: processed, 51 s, Education, not for
  kids, private with publishAt 19:07 IST today. It stays private until the API audit is approved.
  Windows note: PowerShell here blocks npm.ps1, so local commands use `npm.cmd`.
