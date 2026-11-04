/**
 * Stats, the deep daily pass (2026-11-03): everything Studio shows beyond the daily numbers.
 *  - Breakdowns (lib/analytics.ts KINDS) for the channel over 7, 28, 90 and 365 days (all formats; and
 *    Shorts and long separately over 28 and 90), and for each video over its life (videos published in
 *    the last 90 days daily, older ones on Sundays).
 *  - Thumbnail impressions and click-through from the YouTube Reporting API's reach report (needs the
 *    Reporting API switched on in the Google Cloud project; until then a notification says so).
 *  - Public comments, read with the Data API key (YT_API_KEY; skipped without it).
 * All of it is replaced on every run; stats.ts wipes it after 30 days without a refresh.
 */
import { PrismaClient, type Prisma } from "@prisma/client";

import { KINDS, breakdownRows, parseCsv, queryOf, rangeStart, reachRows, type Format } from "./lib/analytics.ts";
import { notify, resolve } from "./lib/notify.ts";
import { istDay } from "./lib/publishing.ts";
import { youtubeConfigured } from "./lib/uploads.ts";
import { accessToken, comments, report } from "./lib/youtube.ts";

const DAY_MS = 86_400_000;
const CHANNEL_RANGES: [number, Format[]][] = [[7, ["all"]], [28, ["all", "short", "long"]], [90, ["all", "short", "long"]], [365, ["all"]]];

async function saveBreakdowns(prisma: PrismaClient, scope: string, rows: Prisma.BreakdownCreateManyInput[]): Promise<void> {
  await prisma.$transaction([prisma.breakdown.deleteMany({ where: { scope } }), prisma.breakdown.createMany({ data: rows })]);
}

async function fetchScope(token: string, scope: string, opts: { startDate: string; endDate: string; video?: string; format?: Format }, perVideo: boolean, errors: string[]) {
  const out: Prisma.BreakdownCreateManyInput[] = [];
  for (const k of KINDS) {
    if (perVideo && !k.perVideo) continue;
    try {
      const rows = breakdownRows(k, await report(token, queryOf(k, opts)));
      out.push(...rows.map((r) => ({ scope, kind: k.kind, key: r.key, views: r.views, watchMinutes: r.watchMinutes, share: r.share, extra: r.extra ?? undefined })));
    } catch (e) {
      errors.push(`${scope} ${k.kind}: ${e instanceof Error ? e.message : e}`);
    }
  }
  return out;
}

// ---- Reporting API ----
const REPORTING = "https://youtubereporting.googleapis.com/v1";
type Job = { id: string; reportTypeId: string };

async function reach(prisma: PrismaClient, token: string): Promise<string> {
  const h = { authorization: `Bearer ${token}` };
  const types = await fetch(`${REPORTING}/reportTypes`, { headers: h });
  if (types.status === 403) {
    await notify(prisma, { key: "reporting-api-needed", source: "stats", severity: "warning", title: "Switch on the YouTube Reporting API: long videos can't be fixed blind",
      detail: "Impressions and click-through rate come only from the YouTube Reporting API, which is still off in the Google Cloud project that holds our YouTube sign-in. Our long videos got 1–11 views each, and without impressions we can't tell whether YouTube isn't showing them or people see them and don't click.",
      fix: "Open https://console.developers.google.com/apis/api/youtubereporting.googleapis.com/overview?project=926280782174 (signed in as the channel's Google account) and click Enable. The next daily stats run creates the report job; numbers arrive about 2 days later." });
    return "reporting API off";
  }
  if (!types.ok) throw new Error(`reportTypes ${types.status}`);
  await resolve(prisma, "reporting-api-off");
  await resolve(prisma, "reporting-api-needed");
  const ids: string[] = ((await types.json()) as { reportTypes?: { id: string }[] }).reportTypes?.map((t) => t.id) ?? [];
  const typeId = ids.find((i) => /^channel_reach_basic/.test(i)) ?? ids.find((i) => /reach/.test(i));
  if (!typeId) return `no reach report for this channel (types: ${ids.length})`;
  const jobs: Job[] = ((await (await fetch(`${REPORTING}/jobs`, { headers: h })).json()) as { jobs?: Job[] }).jobs ?? [];
  let job = jobs.find((j) => j.reportTypeId === typeId);
  if (!job) {
    const res = await fetch(`${REPORTING}/jobs`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify({ reportTypeId: typeId, name: "Paisa Panchayat reach" }) });
    if (!res.ok) throw new Error(`could not create the reach job: ${res.status} ${await res.text()}`);
    job = (await res.json()) as Job;
    return `reach job created (${typeId}); the first report arrives in about 2 days`;
  }
  const since = new Date(Date.now() - 60 * DAY_MS).toISOString();
  const list = ((await (await fetch(`${REPORTING}/jobs/${job.id}/reports?createdAfter=${since}`, { headers: h })).json()) as { reports?: { downloadUrl: string; startTime: string }[] }).reports ?? [];
  const rows: Prisma.BreakdownCreateManyInput[] = [];
  const seen = new Set<string>();
  // newest first, so a re-issued day keeps its latest numbers
  for (const r of list.sort((a, b) => b.startTime.localeCompare(a.startTime))) {
    const csv = await (await fetch(r.downloadUrl, { headers: h })).text();
    for (const x of reachRows(parseCsv(csv))) {
      const key = `${x.youtubeId}|${x.day}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ scope: "reach", kind: "videoDay", key, views: x.impressions, share: x.ctr });
    }
  }
  await saveBreakdowns(prisma, "reach", rows);
  // put them on the daily rows right away (stats.ts keeps them on later runs)
  const uploads = await prisma.upload.findMany({ where: { youtubeId: { not: null } }, select: { id: true, youtubeId: true } });
  const byYt = new Map(uploads.map((u) => [u.youtubeId!, u.id]));
  for (const r of rows) {
    const [yt, day] = r.key.split("|") as [string, string];
    const uploadId = byYt.get(yt);
    if (uploadId) await prisma.videoStat.updateMany({ where: { uploadId, day: new Date(`${day}T00:00:00Z`) }, data: { impressions: Math.round(r.views ?? 0), ctr: r.share ?? 0 } });
  }
  return `${list.length} reach reports, ${rows.length} video-days`;
}

async function main(): Promise<void> {
  if (!youtubeConfigured()) return;
  const prisma = new PrismaClient();
  const errors: string[] = [];
  try {
    const token = await accessToken();
    const end = istDay(new Date(Date.now() - DAY_MS));
    let channelRows = 0;
    for (const [days, formats] of CHANNEL_RANGES) {
      for (const format of formats) {
        const scope = `channel:${format}:${days}`;
        const rows = await fetchScope(token, scope, { startDate: rangeStart(end, days), endDate: end, format }, false, errors);
        await saveBreakdowns(prisma, scope, rows);
        channelRows += rows.length;
      }
    }

    const sunday = new Date().getUTCDay() === 0;
    const uploads = await prisma.upload.findMany({ where: { youtubeId: { not: null }, state: { in: ["scheduled", "published"] }, video: { deletedAt: null } }, select: { id: true, videoId: true, youtubeId: true, publishAt: true } });
    let videoRows = 0, videosDone = 0;
    for (const u of uploads) {
      const start = istDay(u.publishAt);
      if (start > end) continue;
      const recent = Date.now() - u.publishAt.getTime() < 90 * DAY_MS;
      const scope = `video:${u.videoId}`;
      const have = await prisma.breakdown.count({ where: { scope } });
      if (!recent && !sunday && have) continue;
      const rows = await fetchScope(token, scope, { startDate: start, endDate: end, video: u.youtubeId! }, true, errors);
      await saveBreakdowns(prisma, scope, rows);
      videoRows += rows.length;
      videosDone++;
    }

    let reachNote = "";
    try {
      reachNote = await reach(prisma, token);
    } catch (e) {
      errors.push(`reach: ${e instanceof Error ? e.message : e}`);
    }

    let commentCount = 0;
    const key = process.env.YT_API_KEY;
    if (key) {
      for (const u of uploads) {
        try {
          const list = await comments(key, u.youtubeId!);
          await prisma.$transaction([
            prisma.comment.deleteMany({ where: { uploadId: u.id } }),
            prisma.comment.createMany({ data: list.map((c) => ({ ...c, uploadId: u.id, publishedAt: new Date(c.publishedAt) })), skipDuplicates: true }),
          ]);
          commentCount += list.length;
        } catch (e) {
          errors.push(`comments ${u.videoId}: ${e instanceof Error ? e.message : e}`);
        }
      }
    }
    await prisma.setting.upsert({ where: { key: "statsDeepAt" }, update: { value: new Date().toISOString() }, create: { key: "statsDeepAt", value: new Date().toISOString() } });
    console.log(JSON.stringify({ through: end, channelRows, videosDone, videoRows, reach: reachNote, comments: key ? commentCount : "no YT_API_KEY", errors: errors.slice(0, 20), errorCount: errors.length }, null, 2));
    if (errors.length > 10) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await main();
} catch (e) {
  console.error(`::error::${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
}
