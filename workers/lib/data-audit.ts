/**
 * Data audit rules: compare what the dashboard shows with YouTube and with the database, and name
 * every mismatch. Pure functions over plain data, so they are unit-tested and the auditor agent can
 * trust them (this file is owner-only in scripts/guard.py: the measuring stick never changes with
 * the code it measures).
 */
export type Severity = "error" | "warning" | "info" | "owner";

export type Issue = {
  kind: string;
  severity: Severity;
  videoId?: string;
  youtubeId?: string;
  detail: string;
};

export type DashVideo = {
  id: string;
  title: string;
  status: string;
  upload: { youtubeId: string | null; state: string; publishAt: string } | null;
  totals: { views: number; likes: number; comments: number; liveAt: string | null } | null;
};

export type YtVideo = { privacy: string; views: number; likes: number; comments: number };

export type AuditInput = {
  now: Date;
  videos: DashVideo[];
  /** youtubeId → YouTube's own numbers; null when YouTube isn't connected (checks that need it are skipped) */
  youtube: Map<string, YtVideo> | null;
  /** videoId → Analytics rows stored in VideoStat */
  analytics: Map<string, { day: string; views: number }[]>;
  /** videoId → dashboard views in the previous audit */
  previous: Map<string, number>;
  overview: { allTimeViews: number; last7Views: number };
  analyticsTotalViews: number;
  statsRefreshedAt: Date | null;
};

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const istDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const ago = (now: Date, iso: string) => `${Math.round((now.getTime() - Date.parse(iso)) / 60_000)} min ago`;

/** Allowed difference before two counts are called different: YouTube's counters are a little noisy. */
const slack = (n: number, pct: number, min: number) => Math.max(min, Math.round(n * pct));

export function audit(input: AuditInput): Issue[] {
  const { now, youtube } = input;
  const out: Issue[] = [];
  const published = input.videos.filter((v) => v.status === "published");

  for (const v of input.videos) {
    const yid = v.upload?.youtubeId ?? undefined;
    const at = { videoId: v.id, youtubeId: yid };
    const dash = v.totals;

    if (v.status === "published" && !yid) {
      out.push({ kind: "unlinked", severity: "owner", ...at, detail: `"${v.title}" is published but has no YouTube link, so it has no views or analytics. Open it in the dashboard → Mark as uploaded → paste the link.` });
    }

    const prev = input.previous.get(v.id);
    if (dash && prev !== undefined && dash.views < prev) {
      out.push({ kind: "went_down", severity: "error", ...at, detail: `Dashboard views fell from ${prev} (previous audit) to ${dash.views}. Shown counts must never go down.` });
    }

    const rows = input.analytics.get(v.id) ?? [];
    const days = new Set<string>();
    for (const r of rows) {
      if (days.has(r.day)) out.push({ kind: "duplicate_stat_day", severity: "error", ...at, detail: `Two Analytics rows for ${r.day}: views are counted twice.` });
      days.add(r.day);
    }

    if (!yid || !youtube || !v.upload || !["scheduled", "published"].includes(v.upload.state)) continue;
    const yt = youtube.get(yid);
    if (!yt) {
      out.push({ kind: "missing_on_youtube", severity: "warning", ...at, detail: `YouTube doesn't know video ${yid} (deleted, or a wrong link).` });
      continue;
    }
    const due = Date.parse(v.upload.publishAt) < now.getTime() - 6 * HOUR;
    if (yt.privacy === "public" && v.upload.state === "scheduled" && due) {
      out.push({ kind: "state_lag", severity: "error", ...at, detail: `Public on YouTube, but still "scheduled" here more than 6 h after its publish time (the stats job should have marked it published).` });
    }
    if (v.status === "published" && yt.privacy !== "public") {
      out.push({ kind: "state_wrong", severity: "warning", ...at, detail: `Marked published here, but ${yt.privacy} on YouTube.` });
    }
    if (yt.privacy !== "public") continue;   // private videos have no public counters to compare

    const shown = dash?.views ?? 0;
    if (shown > yt.views + slack(yt.views, 0.02, 5)) {
      out.push({ kind: "ahead_of_youtube", severity: "warning", ...at, detail: `Dashboard shows ${shown} views, YouTube ${yt.views}. Either YouTube removed invalid views or the dashboard over-counts.` });
    }
    if (shown < yt.views - slack(yt.views, 0.05, 5)) {
      const fresh = dash?.liveAt && now.getTime() - Date.parse(dash.liveAt) < 15 * 60_000;
      out.push(fresh
        ? { kind: "behind_youtube", severity: "error", ...at, detail: `Dashboard shows ${shown} views right after a live refresh (${ago(now, dash!.liveAt!)}), YouTube ${yt.views}.` }
        : { kind: "behind_youtube_stale", severity: "info", ...at, detail: `Dashboard shows ${shown} views, YouTube ${yt.views}; live counts last refreshed ${dash?.liveAt ? ago(now, dash.liveAt) : "never"} (they refresh while the dashboard is open).` });
    }
    for (const k of ["likes", "comments"] as const) {
      const d = dash?.[k] ?? 0;
      if (d > yt[k] + slack(yt[k], 0.05, 3)) out.push({ kind: `${k}_ahead_of_youtube`, severity: "warning", ...at, detail: `Dashboard shows ${d} ${k}, YouTube ${yt[k]}.` });
    }
    const counted = rows.reduce((a, r) => a + r.views, 0);
    if (counted > yt.views + slack(yt.views, 0.05, 10)) {
      out.push({ kind: "analytics_over_public", severity: "error", ...at, detail: `Stored Analytics add up to ${counted} views, more than YouTube's public ${yt.views}.` });
    }
    // Analytics lags 1–3 days; anything older than that should be stored
    const from = [istDay(new Date(v.upload.publishAt)), addDays(istDay(now), -365)].sort().at(-1)!;
    const until = addDays(istDay(now), -4);
    const missing: string[] = [];
    for (let d = from; d <= until; d = addDays(d, 1)) if (!days.has(d)) missing.push(d);
    if (missing.length && input.statsRefreshedAt && now.getTime() - input.statsRefreshedAt.getTime() < 12 * HOUR) {
      out.push({ kind: "analytics_gap", severity: "warning", ...at, detail: `No Analytics rows for ${missing.length} day(s) (${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ", …" : ""}) although the stats job ran recently.` });
    }
  }

  if (youtube && (!input.statsRefreshedAt || now.getTime() - input.statsRefreshedAt.getTime() > 48 * HOUR)) {
    out.push({ kind: "stats_stale", severity: "warning", detail: `YouTube Analytics were last refreshed ${input.statsRefreshedAt?.toISOString() ?? "never"}; the stats job runs every 3 h.` });
  }

  const sum = published.reduce((a, v) => a + (v.totals?.views ?? 0), 0);
  if (input.overview.allTimeViews !== sum) {
    out.push({ kind: "aggregate_mismatch", severity: "error", detail: `Overview all-time views ${input.overview.allTimeViews} ≠ ${sum}, the sum of the published videos' views.` });
  }
  if (input.analyticsTotalViews !== sum) {
    out.push({ kind: "aggregate_mismatch", severity: "error", detail: `Analytics page total views ${input.analyticsTotalViews} ≠ ${sum}, the sum of the published videos' views.` });
  }
  if (input.overview.last7Views > input.overview.allTimeViews) {
    out.push({ kind: "aggregate_mismatch", severity: "error", detail: `Overview 7-day views ${input.overview.last7Views} exceed all-time views ${input.overview.allTimeViews}.` });
  }
  return out;
}

/** Issues present in this audit and the previous one: the same kind on the same video (or channel-wide). */
export function persistent(now: Issue[], before: Issue[]): Issue[] {
  const key = (i: Issue) => `${i.kind}:${i.videoId ?? "*"}`;
  const old = new Set(before.filter((i) => i.severity === "error").map(key));
  return now.filter((i) => i.severity === "error" && old.has(key(i)));
}
