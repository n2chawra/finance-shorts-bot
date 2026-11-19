# YouTube API usage

This system runs for one owner and publishes only to the owner's own YouTube channels: 3 brand channels
today, 5 planned. There are no third-party users. Every call uses either the OAuth token of the
channel it touches (scopes `youtube.upload`, `youtube.readonly`, `yt-analytics.readonly`) or, for
public counters and comments, the project's API key. The callers are GitHub Actions cron workers
(`workers/`) and the owner's dashboard (`apps/dashboard/`). Every worker call goes through a quota
keeper (`workers/lib/quota.ts`), which refuses a lower-priority call that would eat into what the
day's remaining uploads need.

## Quota costs

Google's quota cost table (developers.google.com/youtube/v3/determine_quota_cost, read 2026-11-19)
says that **`videos.insert` and `search.list` each have their own bucket**, with a default of 100
calls a day at 1 unit per call. All other methods share the 10,000-unit daily pool.

Our quota keeper (`workers/lib/quota.ts`) follows this model since 2026-11-19: uploads and searches
are counted as calls in their own buckets (uploads stop at 95), everything else in units. The older
single-pool figures (upload 1,600, search 100) are shown below too, so the request reads correctly
under either model.

## Methods called

| Method | Where it is called | When | Cost (pool / own bucket) | Older single-pool cost |
|---|---|---|---|---|
| `videos.insert` (resumable, `privacyStatus: private` + `publishAt`) | `workers/lib/youtube.ts` `uploadVideo`, from `workers/publish.ts` | publish.yml every 20 min; one call per filled slot | 1 call (insert bucket) | 1,600 |
| `thumbnails.set` | `workers/lib/youtube.ts` `setThumbnail`, from `workers/publish.ts` | right after each upload | 50 | 50 |
| `videos.list` (status, statistics; 50 ids a call) | `workers/lib/uploads.ts` `refreshPublished` (publish), `workers/snapshot.ts` (watchdog), `workers/data-audit.ts`, `workers/market.ts`, `apps/dashboard/src/lib/live-stats.ts` (API key) | publish every 20 min, hourly snapshot, daily audit, Mon/Thu market, dashboard every 5 min while open | 1 | 1 |
| `channels.list` (`mine=true`; `statistics` by id) | `apps/dashboard/src/lib/youtube-oauth.ts` and `workers/auth.ts` (on connecting a channel), `workers/market.ts` (subscriber counts) | on connect; Mon/Thu market | 1 | 1 |
| `commentThreads.list` (read only) | `workers/lib/youtube.ts` `comments` from `workers/stats-deep.ts` (API key); `workers/market.ts`; `workers/niche-scan.ts` | daily per channel for videos of the last 14 days; Mon/Thu; monthly | 1 | 1 |
| `search.list` | `workers/market.ts` (niche trends + reference thumbnails); `workers/niche-scan.ts` | Mon and Thu (market.yml); 1st of the month (niche-scan.yml) | 1 call (search bucket) | 100 |
| `playlistItems.list` | `workers/niche-scan.ts` (reference channels' uploads) | 1st of the month | 1 | 1 |
| YouTube Analytics `reports.query` | `workers/lib/youtube.ts` `report`, from `workers/stats.ts`, `workers/stats-deep.ts`, `workers/lib/analytics.ts` | every 3 h (stats.yml, stats-deep.yml) | YouTube Analytics API quota, not Data API units | same |
| YouTube Reporting API `jobs`, `reports` | `workers/stats-deep.ts` (impressions, CTR) | daily | Reporting API quota, not Data API units | same |

## Daily use, 3 channels today

Uploads: Shorts 1 + 2 + 2 = 5 a day, long videos 3 a week (peak day 7 uploads with two long videos).

| Method | Calls on a peak day | Units (current model) | Units (older model) |
|---|---|---|---|
| `videos.insert` | 7 | 7 of 100 insert calls | 11,200 |
| `thumbnails.set` | 7 | 350 | 350 |
| `videos.list` | ~590 (publish ≤216, snapshot 72, audit 3, dashboard ≤288, market ~10) | 590 | 590 |
| `channels.list` | ~10 | 10 | 10 |
| `commentThreads.list` | ~120 (daily ~76, market ~45) | 120 | 120 |
| `search.list` | 10 on a Mon/Thu (8 trend searches + ≤2 reference searches) | 10 of 100 search calls | 1,000 |
| **Shared pool total** | | **~1,070** | **~13,270** |

Under the older single-pool costs, a peak day already passes the default 10,000 units.

## Recommended quota, 5 channels

The plan for 5 channels is about 9 Shorts a day plus 2 long videos a week per channel (peak 13 uploads),
each channel's market scan on Mon/Thu (5 × 10 searches), and the monthly niche scan on the 1st
(about 15 searches per channel). We add room for failed uploads, which are retried up to 3 times.

| | Peak need | Request |
|---|---|---|
| `videos.insert` | 13 uploads + retries ≈ 16 calls | **200 calls a day** (older model: 25,600 units) |
| `search.list` | 50 (Mon/Thu) + 75 (monthly scan) = 125 calls | **300 calls a day** (older model: 12,500 units) |
| Shared pool (thumbnails, lists, comments) | ~650 + ~1,100 + ~250 ≈ 2,000 units | **10,000 units a day** (default is enough) |
| **Total under the older single pool** | ~42,000 units | **50,000 units a day** (~20% headroom) |
