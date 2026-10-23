/**
 * Data audit (daily, 13:53 IST cron, lands around 19:00, before the auditor agent): what does the dashboard show, what does
 * YouTube say, what is stored? Writes metrics/data-audit.json for the auditor agent (which has no
 * database or YouTube access) and raises owner notifications for what only the owner can fix.
 *
 * The dashboard's numbers come from the dashboard's own data code (apps/dashboard/src/lib/store.db.ts)
 * run against the real database, so the audit checks exactly what the owner sees.
 * Needs: DATABASE_URL (+ YT_* for the YouTube side; without them only the internal checks run),
 * and `npm ci` in apps/dashboard.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { audit, persistent, type DashVideo, type Issue, type YtVideo } from "./lib/data-audit.ts";
import { notify, resolveOthers } from "./lib/notify.ts";
import { accessToken, videoInfo } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "metrics", "data-audit.json");
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

function previousAudit(): z.infer<typeof Previous> {
  if (!existsSync(OUT)) return { videos: [], issues: [] };
  const parsed = Previous.safeParse(JSON.parse(readFileSync(OUT, "utf8")));
  return parsed.success ? parsed.data : { videos: [], issues: [] };
}

async function youtubeNumbers(ids: string[]): Promise<Map<string, YtVideo> | null> {
  if (!["YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"].every((k) => process.env[k])) {
    console.log("::notice::YouTube is not connected here: only the internal checks run.");
    return null;
  }
  const info = await videoInfo(await accessToken(), ids);
  return new Map([...info].map(([id, v]) => [id, {
    privacy: v.status.privacyStatus, views: v.statistics?.viewCount ?? 0, likes: v.statistics?.likeCount ?? 0, comments: v.statistics?.commentCount ?? 0,
  }]));
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const now = new Date();
  try {
    const store = (await import(pathToFileURL(STORE).href)) as Store;
    const videos: DashVideo[] = Videos.parse(await store.listVideos({}));
    const overview = Overview.parse(await store.getOverview());
    const analyticsPage = Analytics.parse(await store.getAnalytics());

    const linked = videos.filter((v) => v.upload?.youtubeId && ["scheduled", "published"].includes(v.upload.state));
    const youtube = await youtubeNumbers(linked.map((v) => v.upload!.youtubeId!));
    const rows = await prisma.videoStat.findMany({ where: { upload: { video: { deletedAt: null } } }, select: { day: true, views: true, upload: { select: { videoId: true } } } });
    const analytics = new Map<string, { day: string; views: number }[]>();
    for (const r of rows) analytics.set(r.upload.videoId, [...(analytics.get(r.upload.videoId) ?? []), { day: r.day.toISOString().slice(0, 10), views: r.views }]);
    const refreshed = await prisma.setting.findUnique({ where: { key: "statsRefreshedAt" } });

    const before = previousAudit();
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
    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");

    // the owner hears only about what needs them, or what the auditor failed to fix for two nights
    const raised = new Set<string>();
    const unlinked = issues.filter((i) => i.kind === "unlinked");
    if (unlinked.length) {
      raised.add("data-audit:unlinked");
      await notify(prisma, { key: "data-audit:unlinked", source: "data-audit", severity: "warning", title: `${unlinked.length} published video${unlinked.length === 1 ? " has" : "s have"} no YouTube link`,
        detail: unlinked.map((i) => i.detail).join("\n"), fix: "For each video: open it in the dashboard → Mark as uploaded → paste its YouTube link → Save." });
    }
    if (repeated.length) {
      raised.add("data-audit:persistent");
      await notify(prisma, { key: "data-audit:persistent", source: "data-audit", severity: "warning", title: "Dashboard numbers are still wrong after a night",
        detail: repeated.map((i) => `${i.kind}${i.videoId ? ` (${i.videoId})` : ""}: ${i.detail}`).join("\n"),
        fix: "The auditor agent tries to fix these every night. If this stays open, open the Agents page → Auditor to see what it found, and the latest metrics/data-audit.json in the repo." });
    }
    await resolveOthers(prisma, "data-audit:", raised);
    console.log(JSON.stringify(report.summary));
    for (const i of issues.filter((x) => x.severity !== "info")) console.log(`- [${i.severity}] ${i.kind}${i.videoId ? ` ${i.videoId}` : ""}: ${i.detail}`);
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await main();
  process.exit(0);   // the dashboard's connection pool would otherwise keep the process alive
} catch (e) {
  console.error(`::error::${e instanceof Error ? e.stack ?? e.message : e}`);
  process.exit(1);
}
