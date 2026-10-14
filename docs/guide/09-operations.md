# 9. Operations

*Running it day to day: what to check, what to do when something breaks, and what it costs.*

## Your daily five minutes (while uploading by hand)

1. Open the dashboard **Overview**: is *Made today* moving towards 3? Any **recent failures**?
2. **Queue** → top video → **Download** → upload in YouTube Studio (copy buttons for the text) →
   **Mark as uploaded** with the Shorts link.
3. Glance at **Runs** if the daily-output tracker shows amber or red.

After the YouTube audit is approved: turn **Pause uploads** off in Settings. Step 2 disappears.

## Where to look when something's wrong

| Symptom | Likely cause | Where to look | Fix |
|---|---|---|---|
| A run shows **Failed** | QA or fact review rejected it after all retries | Runs → expand the run; video page → *Checks & run* | Usually nothing: the run already retried with another template, and the make-up runs cover the day. If the same template keeps failing, disable it on **Templates** and say so in a Claude session |
| *Made today* stays at 0 | Routine didn't run, or hit the Pro usage limit | claude.ai → Routines → *Finance Shorts generation* → recent runs | Later runs (14:07, 21:07) make up; check the run report text |
| New video not on the dashboard | Release or ingest workflow failed | GitHub → Actions → *Release video* / *Ingest* | Re-run the failed workflow |
| Upload failed | YouTube error or token problem | Actions → *Publish*; video page shows the upload error | It retries at 13:07 / 16:07; after 3 failures the video is marked failed |
| "Token" errors in Actions | Refresh token revoked/expired | Actions → *Publish* or *Stats* log | Run `npm run auth` in `workers/` again and update `YT_REFRESH_TOKEN` (`gh secret set`) |
| Thumbnails/videos don't load on the dashboard | `GITHUB_TOKEN` in Netlify expired | Browser shows broken images | Create a new fine-grained read-only token, update it in Netlify, redeploy |
| Live view counts missing | `YT_API_KEY` missing, or the video is private | Video page → Performance | Add the key in Netlify and redeploy; private videos have no public counts |
| Dashboard says *Offline, retrying* | Database or Netlify hiccup | `GET /api/health` | Usually resolves on its own |

## Pausing things

| To stop… | Do this | Effect |
|---|---|---|
| Uploads | Settings → *Pause all uploads* (or Ctrl K → *Pause uploads*) | publish job does nothing; generation continues |
| Generation | Settings → *Pause generation* | routines start but do nothing (takes effect on the next ingest, within ~6 h, or right away if a run pushes) |
| Everything | Disable the routine on claude.ai, and pause uploads | nothing runs |

## Secrets and where they live

| Secret | Where | Used by |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | GitHub secrets + Netlify | workers, dashboard |
| `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` | GitHub secrets | publish, stats |
| `DASHBOARD_PASSWORD`, `SESSION_SECRET` | Netlify | dashboard sign-in |
| `GITHUB_TOKEN` (fine-grained, read-only), `GITHUB_REPOSITORY` | Netlify | dashboard media |
| `YT_API_KEY` | Netlify | live view counts |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | GitHub secrets (planned) | watchdog alerts |

Routines get **none** of these.

## Costs and limits

| Service | Plan | Usage | Headroom |
|---|---|---|---|
| Claude (routines) | Pro subscription | 5 runs/day; a video run takes about 4–8 minutes of session time | Runs are spread across separate 5-hour usage windows; paid usage credits are never enabled |
| GitHub Actions | Free (private repo: 2,000 min/month) | release + ingest per video, publish ×3, stats ×8, ingest ×4 a day: roughly 25–35 min/day | comfortable |
| Netlify | Free | builds only when `apps/dashboard` changes; serverless functions for the API | comfortable |
| Supabase | Free (500 MB) | a few thousand rows | years of headroom |
| YouTube Data API | 10,000 units/day | 1,600 per upload + ≤ ~1,500 for live counts | comfortable |
| GitHub Releases | Free | one ~5–15 MB MP4 per video | fine |

## Running things by hand

```bash
# Dashboard locally (sample data if DATABASE_URL is unset)
npm --prefix apps/dashboard run dev
# A workflow on demand
gh workflow run ingest.yml
gh workflow run publish.yml
gh workflow run stats.yml
# All Python tests
python -m pytest renderer generator -q
# Worker tests
npm --prefix workers test
```

The routine itself can be run on demand from claude.ai → Routines → *Run now*.

## Still to do

- Telegram watchdog alerts (failed run, failed upload, backlog < 5, token errors).
- Move GitHub Actions off the deprecated Node 20 runtime.
- Real embeddings (pgvector) for near-duplicate topic detection.
