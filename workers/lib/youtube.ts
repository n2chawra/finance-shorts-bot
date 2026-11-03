/** YouTube Data API v3 and YouTube Analytics API over plain fetch. Every response is validated. */
import { open, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

export const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

/** Raised when Google rejects the refresh token: it was revoked, or the app was left in Testing. */
export class TokenError extends Error {}

const TokenResponse = z.object({ access_token: z.string(), expires_in: z.number().optional() });
const ErrorBody = z.object({ error: z.union([z.string(), z.object({ message: z.string() }).passthrough()]), error_description: z.string().optional() }).passthrough();

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

async function failText(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const body = ErrorBody.parse(JSON.parse(text));
    return typeof body.error === "string" ? `${body.error}${body.error_description ? `: ${body.error_description}` : ""}` : body.error.message;
  } catch {
    return `${res.status} ${text.slice(0, 300)}`;
  }
}

/** A short-lived access token from the stored refresh token. */
export async function accessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env("YT_CLIENT_ID"), client_secret: env("YT_CLIENT_SECRET"), refresh_token: env("YT_REFRESH_TOKEN"), grant_type: "refresh_token" }),
  });
  if (!res.ok) {
    const why = await failText(res);
    throw why.startsWith("invalid_grant") ? new TokenError(`YouTube refresh token rejected (${why}). Run the auth script again.`) : new Error(`token refresh failed: ${why}`);
  }
  return TokenResponse.parse(await res.json()).access_token;
}

export type VideoMeta = { title: string; description: string; tags: string[]; publishAt: Date };

const Inserted = z.object({ id: z.string(), status: z.object({ uploadStatus: z.string().optional(), privacyStatus: z.string().optional() }).passthrough().optional() }).passthrough();

/** Resumable upload of an mp4 as a private video that YouTube makes public at `publishAt`. */
export async function uploadVideo(token: string, file: string, meta: VideoMeta): Promise<string> {
  const size = (await stat(file)).size;
  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`, "content-type": "application/json; charset=UTF-8",
      "x-upload-content-length": String(size), "x-upload-content-type": "video/mp4",
    },
    body: JSON.stringify({
      snippet: { title: meta.title, description: meta.description, tags: meta.tags, categoryId: "27", defaultLanguage: "en" },
      status: { privacyStatus: "private", publishAt: meta.publishAt.toISOString(), selfDeclaredMadeForKids: false, containsSyntheticMedia: false, embeddable: true },
    }),
  });
  if (!init.ok) throw new Error(`upload could not start: ${await failText(init)}`);
  const location = init.headers.get("location");
  if (!location) throw new Error("upload could not start: no upload URL returned");

  const handle = await open(file);
  try {
    const put = await fetch(location, {
      method: "PUT",
      headers: { "content-type": "video/mp4", "content-length": String(size) },
      body: handle.readableWebStream() as unknown as BodyInit,
      duplex: "half",
    } as RequestInit);
    if (!put.ok) throw new Error(`upload failed: ${await failText(put)}`);
    return Inserted.parse(await put.json()).id;
  } finally {
    await handle.close();
  }
}

/** Set a video's custom thumbnail (a JPEG or PNG under 2 MB). YouTube needs the channel verified for
 * custom thumbnails; it answers 403 otherwise, which the caller reports instead of failing the upload. */
export async function setThumbnail(token: string, youtubeId: string, file: string): Promise<void> {
  const body = await readFile(file);
  if (body.length >= 2_000_000) throw new Error(`thumbnail ${path.basename(file)} is ${(body.length / 1e6).toFixed(1)} MB; YouTube allows under 2 MB`);
  const res = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${encodeURIComponent(youtubeId)}&uploadType=media`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": file.endsWith(".png") ? "image/png" : "image/jpeg", "content-length": String(body.length) },
    body,
  });
  if (!res.ok) throw new Error(`thumbnail not set: ${await failText(res)}`);
}

const VideoList = z.object({
  items: z.array(z.object({
    id: z.string(),
    status: z.object({ privacyStatus: z.string(), uploadStatus: z.string().optional(), rejectionReason: z.string().optional(), failureReason: z.string().optional() }).passthrough(),
    statistics: z.object({ viewCount: z.coerce.number().optional(), likeCount: z.coerce.number().optional(), commentCount: z.coerce.number().optional() }).optional(),
  })).default([]),
});
export type VideoInfo = z.infer<typeof VideoList>["items"][number];

/** Status and public counters for any number of videos (1 quota unit per 50). Videos YouTube no longer knows are absent. */
export async function videoInfo(token: string, ids: string[]): Promise<Map<string, VideoInfo>> {
  const out = new Map<string, VideoInfo>();
  for (let i = 0; i < ids.length; i += 50) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status,statistics&id=${ids.slice(i, i + 50).join(",")}`, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`videos.list failed: ${await failText(res)}`);
    for (const v of VideoList.parse(await res.json()).items) out.set(v.id, v);
  }
  return out;
}

/** privacyStatus (and upload problems) for any number of videos. Videos YouTube no longer knows are absent. */
export async function videoStatuses(token: string, ids: string[]): Promise<Map<string, VideoInfo["status"]>> {
  return new Map([...(await videoInfo(token, ids))].map(([id, v]) => [id, v.status]));
}

const Channel = z.object({ items: z.array(z.object({ id: z.string(), snippet: z.object({ title: z.string() }).passthrough() })).default([]) });

/** The channel the token belongs to. */
export async function myChannel(token: string): Promise<{ id: string; title: string } | null> {
  const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`channels.list failed: ${await failText(res)}`);
  const ch = Channel.parse(await res.json()).items[0];
  return ch ? { id: ch.id, title: ch.snippet.title } : null;
}

export type DayStat = {
  day: string; views: number; likes: number; comments: number; subsGained: number; avgViewPct: number;
  engagedViews: number; watchMinutes: number; avgViewSec: number; shares: number; dislikes: number; subsLost: number; playlistAdds: number;
};
const Report = z.object({ columnHeaders: z.array(z.object({ name: z.string() })), rows: z.array(z.array(z.union([z.string(), z.number()]))).optional() });
export type Row = Record<string, string | number>;

/** One YouTube Analytics query, rows as objects keyed by column name. */
export async function report(token: string, params: Record<string, string>): Promise<Row[]> {
  const q = new URLSearchParams({ ids: "channel==MINE", ...params });
  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${q}`, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`analytics report failed (${params.dimensions ?? "totals"}${params.filters ? `; ${params.filters}` : ""}): ${await failText(res)}`);
  return rowsOf(Report.parse(await res.json()));
}

/** Analytics rows as objects (pure, tested). */
export function rowsOf(r: z.infer<typeof Report>): Row[] {
  const names = r.columnHeaders.map((h) => h.name);
  return (r.rows ?? []).map((row) => Object.fromEntries(names.map((n, i) => [n, row[i]!])));
}

/** Every per-day metric we keep (2026-11-03: everything Studio shows that the API gives). */
export const DAY_METRICS = "views,engagedViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,dislikes,comments,shares,subscribersGained,subscribersLost,videosAddedToPlaylists";

/** A row of DAY_METRICS as our field names (pure, tested). */
export function dayStat(r: Row): DayStat {
  const n = (k: string) => Number(r[k] ?? 0) || 0;
  return {
    day: String(r.day ?? ""), views: n("views"), likes: n("likes"), comments: n("comments"), subsGained: n("subscribersGained"),
    avgViewPct: n("averageViewPercentage"), engagedViews: n("engagedViews"), watchMinutes: n("estimatedMinutesWatched"),
    avgViewSec: n("averageViewDuration"), shares: n("shares"), dislikes: n("dislikes"), subsLost: n("subscribersLost"), playlistAdds: n("videosAddedToPlaylists"),
  };
}

/** Daily metrics for one video between two YYYY-MM-DD dates (inclusive). */
export async function dailyStats(token: string, youtubeId: string, startDate: string, endDate: string): Promise<DayStat[]> {
  const rows = await report(token, { startDate, endDate, dimensions: "day", filters: `video==${youtubeId}`, metrics: DAY_METRICS, sort: "day" });
  return rows.map(dayStat);
}

export type Retention = { curve: [number, number][]; relative: [number, number][] };

/** A video's audience retention curve over its whole life: [elapsed share 0..1, audienceWatchRatio],
 * up to 100 points, and the same points against YouTube's typical video of that length
 * (relativeRetentionPerformance, 0..1, 0.5 = typical). Empty when YouTube has too few views. */
export async function retentionCurve(token: string, youtubeId: string, startDate: string, endDate: string): Promise<Retention> {
  const rows = await report(token, {
    startDate, endDate, dimensions: "elapsedVideoTimeRatio", filters: `video==${youtubeId}`,
    metrics: "audienceWatchRatio,relativeRetentionPerformance", sort: "elapsedVideoTimeRatio",
  });
  const pts = (k: string) => rows.map((r) => [Number(r.elapsedVideoTimeRatio), Number(r[k])] as [number, number]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  return { curve: pts("audienceWatchRatio"), relative: pts("relativeRetentionPerformance") };
}

const Comments = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({
      totalReplyCount: z.number().default(0),
      topLevelComment: z.object({ snippet: z.object({
        authorDisplayName: z.string().default(""), textOriginal: z.string().default(""), likeCount: z.number().default(0), publishedAt: z.string(),
      }).passthrough() }).passthrough(),
    }).passthrough(),
  })).default([]),
});
export type YtComment = { id: string; author: string; text: string; likes: number; replies: number; publishedAt: string };

/** Up to 100 latest top-level public comments of a video, read with the Data API key (commentThreads
 * needs a wider sign-in scope than ours; public comments are readable with the key). 1 quota unit. */
export async function comments(apiKey: string, youtubeId: string): Promise<YtComment[]> {
  const q = new URLSearchParams({ part: "snippet", videoId: youtubeId, maxResults: "100", order: "time", textFormat: "plainText", key: apiKey });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?${q}`);
  if (res.status === 403 && (await res.clone().text()).includes("commentsDisabled")) return [];
  if (!res.ok) throw new Error(`comments failed for ${youtubeId}: ${await failText(res)}`);
  return Comments.parse(await res.json()).items.map((c) => {
    const s = c.snippet.topLevelComment.snippet;
    return { id: c.id, author: s.authorDisplayName, text: s.textOriginal.slice(0, 2000), likes: s.likeCount, replies: c.snippet.totalReplyCount, publishedAt: s.publishedAt };
  });
}
