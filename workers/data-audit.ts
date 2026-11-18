/**
 * Data audit (daily, 13:53 IST cron, lands around 19:00, before the auditor agent): what does the dashboard show, what does
 * YouTube say, what is stored? For every active or paused channel, writes channels/<slug>/metrics/data-audit.json
 * for the auditor agent (which has no database or YouTube access) and raises owner notifications for what only
 * the owner can fix.
 *
 * The dashboard's numbers come from the dashboard's own data code (apps/dashboard/src/lib/store.db.ts)
 * run against the real database, so the audit checks exactly what the owner sees. Outside a request that
 * code reads the channel from CHANNEL (apps/dashboard/src/lib/channel-scope.ts), set here per channel.
 * Needs: DATABASE_URL (+ YT_* and the channel's token for the YouTube side; without them only the internal
 * checks run), and `npm ci` in apps/dashboard.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { PrismaClient, type Channel } from "@prisma/client";
import { z } from "zod";

import { audit, persistent, type DashVideo, type Issue, type YtVideo } from "./lib/data-audit.ts";
import { notify, resolveOthers } from "./lib/notify.ts";
import { accessToken, videoInfo } from "./lib/youtube.ts";
import { cpath, layout } from "./lib/channels.ts";
import { activeChannels, tokenOf } from "./lib/channel-auth.ts";
import { COST, QuotaKeeper } from "./lib/quota.ts";
import { youtubeClientConfigured } from "./lib/uploads.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const STORE = path.join(ROOT, "apps", "dashboard", "src", "lib", "store.db.ts");

// the dashboard's payloads, validated like any other external data
const Totals = z.object({ views: z.number(), likes: z.number(), comments: z.number(), liveAt: z.string().nullable() }).nullable();
const Videos = z.array(z.object({
  id: z.string(), title: z.string(), status: z.string(), totals: Totals,
  upload: z.object({ youtubeId: z.string().nullable(), state: z.string(), publishAt: z.string() }).nullable(),
}));
const Overview = z.object({ allTime: z.object({ views: z.number() }), last7: z.object({ views: z.number() }) });
const Analytics = z.object({ totals: z.object({ views: z.number() }) });
const Previous = z.object({
  videos: z.array(z.object({ id: z.string(), dashboard: z.object({ views: z.number() }).nullable() })).default([]),
  issues: z.array(z.object({ kind: z.string(), severity: z.enum(["error", "warning", "info", "owner"]), videoId: z.string().optional(), detail: z.string() })).default([]),
});
type Store = { listVideos: (f: object) => Promise<unknown>; getOverview: () => Promise<unknown>; getAnalytics: () => Promise<unknown> };

function previousAudit(out: string): z.infer<typeof Previous> {
  if (!existsSync(out)) return { videos: [], issues: [] };
  const parsed = Previous.safeParse(JSON.parse(readFileSync(out, "utf8")));
  return parsed.success ? parsed.data : { videos: [], issues: [] };
}

/** YouTube's own numbers with the channel's token, through the quota keeper (videos.list: 1 unit per 50 ids). */
async function youtubeNumbers(ch: Channel, ids: string[], quota: QuotaKeeper): Promise<Map<string, YtVideo> | null> {
  const t = youtubeClientConfigured() ? tokenOf(ch) : null;
  if (!t) {
    console.log(`::notice::${ch.id}: YouTube is not connected here: only the internal checks run.`);
    return null;
  }
  if (!quota.take("stats", Math.ceil(ids.length / 50) * COST.list)) {
    console.log(`::notice::${ch.id}: today's YouTube quota is kept for uploads: only the internal checks run.`);
    return null;
  }
  const info = await videoInfo(await accessToken(t.refreshToken, t.client), ids);
  return new Map([...info].map(([id, v]) => [id, {
    privacy: v.status.privacyStatus, views: v.statistics?.viewCount ?? 0, likes: v.statistics?.likeCount ?? 0, comments: v.statistics?.commentCount ?? 0,
  }]));
}

/** One channel's audit into its own metrics/data-audit.json. Channel #1's file and notification keys are as before;
 * another channel's keys are "<slug>:data-audit:…" (the form lib/scoped.ts gives its other notifications). */
async function auditChannel(prisma: PrismaClient, store: Store, ch: Channel, quota: QuotaKeeper, now: Date): Promise<void> {
  const first = ch.id === layout().default;
  const key = (k: string) => (first ? k : `${ch.id}:${k}`);
  const label = first ? "" : `${ch.name}: `;
  const out = cpath(ROOT, "metrics", "data-audit.json");
  const videos: DashVideo[] = Videos.parse(await store.listVideos({}));
  const overview = Overview.parse(await store.getOverview());
  const analyticsPage = Analytics.parse(await store.getAnalytics());

  const linked = videos.filter((v) => v.upload?.youtubeId && ["scheduled", "published"].includes(v.upload.state));
  // a channel with nothing on YouTube yet has nothing to compare: the internal checks only, and a note in the file
  if (!linked.length) console.log(`${ch.id}: no videos on YouTube yet (${videos.length} in the database).`);
  const youtube = linked.length ? await youtubeNumbers(ch, linked.map((v) => v.upload!.youtubeId!), quota) : null;
  const rows = await prisma.videoStat.findMany({ where: { upload: { video: { deletedAt: null, channelId: ch.id } } }, select: { day: true, views: true, upload: { select: { videoId: true } } } });
  const analytics = new Map<string, { day: string; views: number }[]>();
  for (const r of rows) analytics.set(r.upload.videoId, [...(analytics.get(r.upload.videoId) ?? []), { day: r.day.toISOString().slice(0, 10), views: r.views }]);
  // stats keeps channel #1's refresh time under the plain key, another channel's as "statsRefreshedAt:<slug>" (stats.ts)
  const refreshed = await prisma.setting.findUnique({ where: { key: first ? "statsRefreshedAt" : `statsRefreshedAt:${ch.id}` } });

  const before = previousAudit(out);
  const issues = audit({
    now, videos, youtube, analytics,
    previous: new Map(before.videos.filter((v) => v.dashboard).map((v) => [v.id, v.dashboard!.views])),
    overview: { allTimeViews: overview.allTime.views, last7Views: overview.last7.views },
    analyticsTotalViews: analyticsPage.totals.views,
    statsRefreshedAt: typeof refreshed?.value === "string" ? new Date(refreshed.value) : null,
  });
  const repeated = persistent(issues, before.issues as Issue[]);

  const count = (s: Issue["severity"]) => issues.filter((i) => i.severity === s).length;
  const report = {
    note: "Nightly data audit: dashboard vs YouTube vs database. Written by the data-audit workflow; read by the auditor agent (agents/auditor.md).",
    generatedAt: now.toISOString(),
    ...(first ? {} : { channel: ch.id }),
    ...(linked.length ? {} : { noData: "No video of this channel is on YouTube yet: nothing to compare." }),
    youtubeChecked: youtube !== null,
    summary: { videos: videos.length, checked: linked.length, error: count("error"), warning: count("warning"), info: count("info"), owner: count("owner"), persistentErrors: repeated.length },
    issues,
    videos: linked.map((v) => {
      const yt = youtube?.get(v.upload!.youtubeId!);
      const stats = analytics.get(v.id) ?? [];
      return {
        id: v.id, title: v.title, youtubeId: v.upload!.youtubeId, state: v.upload!.state, publishAt: v.upload!.publishAt,
        dashboard: v.totals && { views: v.totals.views, likes: v.totals.likes, comments: v.totals.comments, liveAt: v.totals.liveAt },
        youtube: yt ?? null,
        analytics: { views: stats.reduce((a, s) => a + s.views, 0), days: stats.length, lastDay: stats.map((s) => s.day).sort().at(-1) ?? null },
      };
    }),
  };
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2) + "\n");

  // the owner hears only about what needs them, or what the auditor failed to fix for two nights
  const channelId = first ? {} : { channelId: ch.id };
  const raised = new Set<string>();
  const unlinked = issues.filter((i) => i.kind === "unlinked");
  if (unlinked.length) {
    raised.add(key("data-audit:unlinked"));
    await notify(prisma, { key: key("data-audit:unlinked"), ...channelId, source: "data-audit", severity: "warning", title: `${label}${unlinked.length} published video${unlinked.length === 1 ? " has" : "s have"} no YouTube link`,
      detail: unlinked.map((i) => i.detail).join("\n"), fix: "For each video: open it in the dashboard → Mark as uploaded → paste its YouTube link → Save." });
  }
  if (repeated.length) {
    raised.add(key("data-audit:persistent"));
    await notify(prisma, { key: key("data-audit:persistent"), ...channelId, source: "data-audit", severity: "warning", title: `${label}Dashboard numbers are still wrong after a night`,
      detail: repeated.map((i) => `${i.kind}${i.videoId ? ` (${i.videoId})` : ""}: ${i.detail}`).join("\n"),
      fix: "The auditor agent tries to fix these every night. If this stays open, open the Agents page → Auditor to see what it found, and the latest metrics/data-audit.json in the repo." });
  }
  await resolveOthers(prisma, key("data-audit:"), raised);
  console.log(`== ${ch.name} (${ch.id}) → ${path.relative(ROOT, out).replace(/\\/g, "/")}`);
  console.log(JSON.stringify(report.summary));
  for (const i of issues.filter((x) => x.severity !== "info")) console.log(`- [${i.severity}] ${i.kind}${i.videoId ? ` ${i.videoId}` : ""}: ${i.detail}`);
}

/** Every active or paused channel with a folder in turn; one failing channel doesn't stop the others. */
async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const now = new Date();
  const failures: string[] = [];
  const before = process.env.CHANNEL;
  try {
    const store = (await import(pathToFileURL(STORE).href)) as Store;
    const quota = await QuotaKeeper.load(prisma);
    for (const ch of await activeChannels(prisma, true)) {
      if (!existsSync(path.join(ROOT, "channels", ch.id)) && ch.id !== layout().default) {
        console.log(`::notice::${ch.id} has no channel folder yet: skipped.`);
        continue;
      }
      process.env.CHANNEL = ch.id;   // the dashboard's data code and cpath read it
      try {
        await auditChannel(prisma, store, ch, quota, now);
      } catch (e) {
        console.error(`::error::${ch.id}: ${e instanceof Error ? e.stack ?? e.message : e}`);
        failures.push(ch.id);
      }
    }
    await quota.save();
  } finally {
    if (before === undefined) delete process.env.CHANNEL; else process.env.CHANNEL = before;
    await prisma.$disconnect();
  }
  if (failures.length) throw new Error(`data audit failed for ${failures.join(", ")}`);
}

try {
  await main();
  process.exit(0);   // the dashboard's connection pool would otherwise keep the process alive
} catch (e) {
  console.error(`::error::${e instanceof Error ? e.stack ?? e.message : e}`);
  process.exit(1);
}
