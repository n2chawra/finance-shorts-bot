# 7. The dashboard

*What each page shows and does. Live at https://courageous-granita-bb8b51.netlify.app (password
protected). Code: [`apps/dashboard/`](../../apps/dashboard).*

## Getting around

- **Sidebar** grouped by job: *Pipeline* (Overview, Queue, Calendar, Videos), *Insights*
  (Analytics, Runs), *Configure* (Templates, Settings). Collapse it to icons with the panel button.
  On a phone, the ☰ button opens it as a slide-out menu.
- **Top bar**: where you are, plus the **Live** indicator (green pulsing dot, "updated 12s ago").
- **Command palette**: `Ctrl K` (or `⌘ K`, or `/`): jump to any page, find a video by title or id,
  pause/resume uploads or generation, switch theme, sign out.
- **Keyboard**: `G` then a letter jumps to a page: `G O` Overview, `G Q` Queue, `G C` Calendar,
  `G V` Videos, `G A` Analytics, `G R` Runs, `G T` Templates, `G S` Settings.
- **Theme**: light, dark or match system (bottom of the sidebar).
- **Live data**: every page refetches every 30 s while the tab is visible, and right after any
  action you take.

## Pages

### Overview
The daily health check.
- **Status badges**: uploads on/paused, what the next routine run will do.
- **KPIs**: views and subscribers for the last 7 days with change vs the 7 before and a 14-day
  sparkline; backlog against the cap of 30; **made today** against the target of 3.
- **Next upload**: the next scheduled video with a live countdown to its slot.
- **Generation**: the next run's mode and why, template work today, templates built, last run;
  pause/resume.
- **Daily output**: 14 day-blocks, coloured by whether the 3-a-day target was met (hover for
  shipped/failed counts).
- **Pipeline**: one bar split by status (in progress, queued, scheduled, published, failed);
  each part links to the filtered video list.
- **Latest published** (with views) and **recent failures** (with the reason).

### Queue
The upload order. Drag rows (desktop) or use the arrows; the ⋯ menu has *Open*, *Upload now*,
*Skip to end* and *Delete*. Shows the date each video would go out, and the uploads on/off switch.

### Calendar
A month grid: published days show the thumbnail and views, scheduled and planned days (from the
queue order) are marked. Click a day for details on the right.

### Videos
Every video the routines made. Tabs by status with counts, search (title, topic, id), filters by
template and topic. Click a row to open it.

### Video page
- **Download** the mp4, **Mark as uploaded** (paste the YouTube link; can be added later), and
  the ⋯ menu (Upload now, Skip, Delete).
- **YouTube details** tab: title, description (copy includes hashtags), tags (copy for the Tags
  box or as hashtags) with character counts, and the settings to pick in Studio.
- **Performance** tab: live views, likes, comments; watch % and subscribers; views per day.
- **Checks & run** tab: number check, fact review and QA notes; the run timeline; the contact
  sheet QA reviewed.
- **Script** tab: the inputs the code computes from, and the on-screen text in order.

### Analytics
7/14/28-day range with change vs the previous period; lifetime views (live); average % viewed;
views and subscribers per day; average views by upload weekday; best and weakest videos on the
same scale. Every chart has a "Show as table" view.

### Runs
Every routine run that committed something. Success rate, videos shipped, average duration, a
strip of recent outcomes, filters (videos, templates, failed), and an expandable step timeline per
run with a link to the video.

### Templates
Each template's sample video, description, average views, how many made and published, an
enable switch and a **weight** slider (how often the planner favours it; 1.0 is neutral).

### Settings
Generation (pause, backlog cap, template runs per day, maximum templates), uploads (pause, upload
time), video rules (length range, disclaimer), Telegram alert preferences. A bar appears when you
have unsaved changes. Workers read these on every run; routines get them via
`config/settings.json` on the next ingest.

## How it's built

| Piece | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict |
| Data fetching | TanStack Query: 30 s polling, refetch on focus, cache invalidation after every write |
| UI | Tailwind CSS 4 with design tokens (light and dark), Radix UI primitives (dialogs, menus, tabs, switches, sliders, tooltips, toasts), `cmdk` command palette, Motion animations, Lucide icons, Geist font |
| Charts | Hand-written SVG: area chart with crosshair tooltip, bar chart, bar list, sparkline, day tracker, category bar |
| Validation | Zod on every API payload, both ways |
| Database | Prisma over the `pg` driver (one network round trip per query) with JOIN-loaded relations |
| Auth | Single owner password (`DASHBOARD_PASSWORD`), HMAC-signed session cookie (`SESSION_SECRET`), checked in middleware for every page and API route |
| Media | `/api/media/<id>/<kind>` serves thumbnails and contact sheets from the repo and redirects video requests to a short-lived GitHub Release URL |
| Hosting | Netlify (functions in us-east-2), builds only when `apps/dashboard` changes |
| Sample mode | Without `DATABASE_URL` it runs on built-in sample data (handy for local UI work) |

### API routes

| Route | Does |
|---|---|
| `GET /api/overview` | counts, backlog, generation mode, next upload, last 7 days, recent |
| `GET /api/queue` · `PATCH /api/queue/order` | queue and reorder |
| `GET /api/videos?status&template&category&q` · `GET /api/videos/<id>` | list and detail |
| `POST /api/videos/<id>/<skip\|delete\|upload-now>` | queue actions |
| `POST /api/videos/<id>/manual-upload` | mark uploaded by hand `{ youtubeId, publishedAt }` |
| `GET/PATCH /api/templates`, `GET /api/runs`, `GET /api/analytics`, `GET/PATCH /api/settings` | the rest |
| `POST/DELETE /api/login` | sign in / out |
| `GET /api/health` | public, data-free: server region and one database round trip in ms |
