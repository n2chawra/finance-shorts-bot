# Agent 3 · Dashboard (nightly, 06:47 IST)

You are an unattended scheduled run. Nobody is watching. Read `agents/policy.md` first and follow
it. Your job: keep the dashboard (`apps/dashboard`, Next.js 15 + React 19 + Tailwind 4 + Radix +
Motion + TanStack Query) bug-free and steadily better, especially the pages the owner uses every
day: Overview, Queue, the video page (download, copy, mark as uploaded), Notifications and Agents.

## 0. Prepare
```
git checkout main && git pull --ff-only
DAY=$(TZ=Asia/Kolkata date +%F); DOW=$(TZ=Asia/Kolkata date +%a)
cd apps/dashboard && npm ci
```
Stop (activity `nothing`, push it) if `config/settings.json` has `agents.paused` or
`agents.dashboard` false. Read `improvement/merge-log.json` (your last 5 entries; a blocked branch is
tonight's first job), `improvement/dashboard/backlog.json` and your last 3 reports in
`improvement/dashboard/`.

## 1. Bug hunt (every night)
Run with sample data (no database): `DATABASE_URL= ` in the environment.
```
npx tsc --noEmit -p . && npx next lint
npx next build
npx playwright install chromium   # once per session
npx playwright test               # e2e/smoke.spec.ts: every page, no console errors, key flows
```
Then look at the screenshots in `test-results/` (desktop and phone, light and dark): overlapping or
cut-off text, broken layouts at phone width, unreadable contrast, empty states that look broken,
janky or missing loading states. Also read the code of one page you haven't reviewed recently for
real bugs (wrong data, stale state, missing error handling, accessibility: labels, focus, keyboard).
Check the live site answers: `curl -s https://courageous-granita-bb8b51.netlify.app/api/health`.
Add every bug to `backlog.json` (`{"id", "kind": "bug", "title", "detail", "page", "found": "<DAY>",
"status": "open"}`).

## 2. Trends (Mon, Wed, Fri only)
Research current dashboard UI/UX (at most 8 searches, 10 page reads): well-regarded product
dashboards and design systems, data-viz patterns, motion, accessibility. Write ideas into
`backlog.json` as `"kind": "idea"`, each tied to a page and a concrete benefit for this owner
(a one-person operator who checks the dashboard twice a day). Skip fashion that adds noise.

## 3. Ship at most one change
Pick the most valuable open item: a bug the owner would hit beats an idea; small beats large.
- Don't touch the same component again within 7 days unless it's a bug (check `lastTouched`).
- Stay in `apps/dashboard/src` (plus `e2e/` tests). Never touch auth, middleware, the login API,
  `lib/prisma.ts`, `lib/live-stats.ts` or Prisma. New dependencies only if clearly worth it.
- Keep the design system: tokens in `src/app/globals.css`, components in `src/components/ui.tsx`
  and `charts.tsx`; light and dark both; phone width; reduced motion respected.
- Add or extend a smoke test when you fix a bug, so it stays fixed.
- Re-run tsc, lint, build and the smoke tests; all must pass.
Mark the item `done` with the date and `lastTouched` for the component.

## 4. Finish (always)
Write `improvement/dashboard/<DAY>.md` (bugs found, what you changed and why, ideas added),
`improvement/activity/<DAY>-dashboard.json` (policy.md format) and rewrite
`improvement/notifications/dashboard.json` (e.g. the live site is down, a key the dashboard needs is
missing). Then from the repo root:
```
git checkout -b agent/dashboard/$DAY
git add apps/dashboard/src apps/dashboard/e2e apps/dashboard/package.json apps/dashboard/package-lock.json improvement/dashboard improvement/activity improvement/notifications/dashboard.json
git commit -q -m "Dashboard $DAY: <one-line summary>"
git push origin HEAD
```
The `Agent merge` workflow re-runs the build and smoke tests before merging; Netlify deploys from
main. End with a 5-line report.
