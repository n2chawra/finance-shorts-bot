/** YouTube Data API v3 and YouTube Analytics API over plain fetch. Every response is validated. */
import { open, stat } from "node:fs/promises";

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

export type DayStat = { day: string; views: number; likes: number; comments: number; subsGained: number; avgViewPct: number };
const Report = z.object({ columnHeaders: z.array(z.object({ name: z.string() })), rows: z.array(z.array(z.union([z.string(), z.number()]))).optional() });

/** Daily metrics for one video between two YYYY-MM-DD dates (inclusive). */
export async function dailyStats(token: string, youtubeId: string, startDate: string, endDate: string): Promise<DayStat[]> {
  const q = new URLSearchParams({
    ids: "channel==MINE", startDate, endDate, dimensions: "day", filters: `video==${youtubeId}`,
    metrics: "views,likes,comments,subscribersGained,averageViewPercentage", sort: "day",
  });
  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${q}`, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`analytics report failed for ${youtubeId}: ${await failText(res)}`);
  const report = Report.parse(await res.json());
  const col = (name: string) => report.columnHeaders.findIndex((h) => h.name === name);
  const [d, v, l, c, s, a] = ["day", "views", "likes", "comments", "subscribersGained", "averageViewPercentage"].map(col);
  return (report.rows ?? []).map((r) => ({
    day: String(r[d!]), views: Number(r[v!]), likes: Number(r[l!]), comments: Number(r[c!]), subsGained: Number(r[s!]), avgViewPct: Number(r[a!]),
  }));
}
