/**
 * The full research's numbers for a channel being set up (multi-channel plan, step 3b). Run by the
 * /new-channel skill after Claude has labelled the scan's titles and written shot sheets of the
 * reference videos it watched in the browser:
 *
 *   npm run niche-research -- <slug> [raw.json] [labels.json]
 *
 * Reads   .niche-data/<slug>.json          the scan's raw data (git show origin/niche-data:<slug>.json)
 *         .niche-data/<slug>-labels.json   video id → topic family (Claude's labels; titles stay off main)
 *         channels/<slug>/research/sheets/*.json   shot sheets (lib/sheets.ts format, Claude's own words)
 *         channels/<slug>/research/scan.json
 * Writes  channels/<slug>/research/families.json  families with tiers, direction, crowding, gaps
 *         channels/<slug>/research/style.json     style targets, picture language, cast or not, the first second
 *         channels/<slug>/research/counts.json    Shorts a day and long a week, each with its reason
 *         .niche-data/<slug>-comments.txt         the most-liked comments under the hits (not committed)
 * The advice (research/advice.md) is written by Claude from these files; every figure in it comes from them.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { FamilyLabels, type KindSummary, type ScoredVideo } from "./lib/niche.ts";
import { DAILY_UNITS } from "./lib/quota.ts";
import { UPLOAD_UNITS, familyTrends, firstSecond, recommendCounts, styleTargets, topComments } from "./lib/research.ts";
import { type Sheet, cleanSheet } from "./lib/sheets.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
/** the dashboard's live counters and the stats reads, a day, across all channels */
const READ_UNITS = 1_450;

const readJson = <T,>(f: string): T => JSON.parse(readFileSync(f, "utf8")) as T;

/** Quota units a day left for a new channel's uploads, after every active channel's own. */
async function freeUnits(slug: string): Promise<{ free: number; why: string }> {
  if (!process.env.DATABASE_URL) {
    const free = DAILY_UNITS - READ_UNITS - 3 * UPLOAD_UNITS;
    return { free, why: `no database: assumed one other channel at 3 Shorts a day (${free} units free)` };
  }
  const prisma = new PrismaClient();
  try {
    const [rows, settings] = await Promise.all([prisma.channel.findMany({ where: { status: "active", NOT: { id: slug } } }), prisma.setting.findMany({ where: { key: { in: ["dailyVideoTarget", "longPerWeek"] } } })]);
    const platform = Object.fromEntries(settings.map((s) => [s.key, Number(s.value)]));
    let used = READ_UNITS;
    const parts: string[] = [];
    for (const c of rows) {
      const own = (c.settings ?? {}) as { dailyVideoTarget?: number; longPerWeek?: number };
      const perDay = own.dailyVideoTarget ?? platform.dailyVideoTarget ?? 3, perWeek = own.longPerWeek ?? platform.longPerWeek ?? 0;
      const u = Math.round((perDay + perWeek / 7) * UPLOAD_UNITS);
      used += u;
      parts.push(`${c.name} ${perDay}/day + ${perWeek}/week = ${u}`);
    }
    return { free: DAILY_UNITS - used, why: `${DAILY_UNITS} a day − ${READ_UNITS} reads − ${parts.join(", ") || "no other channel"}` };
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  const slug = process.argv[2];
  if (!slug || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(slug)) throw new Error("usage: niche-research <slug> [raw.json] [labels.json]");
  const dir = path.join(ROOT, "channels", slug, "research");
  const rawFile = process.argv[3] ?? path.join(ROOT, ".niche-data", `${slug}.json`);
  const labelsFile = process.argv[4] ?? path.join(ROOT, ".niche-data", `${slug}-labels.json`);
  if (!existsSync(rawFile)) throw new Error(`no raw scan at ${rawFile}: git show origin/niche-data:${slug}.json > ${rawFile}`);
  const raw = readJson<{ videos: ScoredVideo[]; comments?: Record<string, { text: string; likes: number }[]> }>(rawFile);
  const scan = readJson<{ shorts: KindSummary; long: KindSummary }>(path.join(dir, "scan.json"));
  const now = new Date().toISOString();
  const out: Record<string, unknown> = {};

  if (existsSync(labelsFile)) {
    const labels = FamilyLabels.parse(readJson(labelsFile));
    const families = familyTrends(raw.videos, labels);
    writeFileSync(path.join(dir, "families.json"), JSON.stringify({
      note: "Topic families from Claude's labels, ranked by the scan's numbers (workers/niche-research.ts). Tiers: core ≥1.5× or ≥20% hits, avoid <0.7×, unknown under 5 scored videos. gap: core and posted by ≤3 channels in 30 days.",
      rankedAt: now, labelled: Object.keys(labels).length, of: raw.videos.length, families }, null, 1) + "\n");
    out.families = families.filter((f) => f.tier !== "unknown").map((f) => `${f.kind} ${f.tier} ${f.medianOutlier}× ${f.family}${f.gap ? " (gap)" : ""}`);
  } else out.families = `no labels yet (${labelsFile})`;

  const sheetsDir = path.join(dir, "sheets");
  const sheets: Sheet[] = existsSync(sheetsDir) ? readdirSync(sheetsDir).filter((f) => f.endsWith(".json")).flatMap((f) => {
    try { return [cleanSheet(readJson(path.join(sheetsDir, f)))]; } catch (e) { console.log(`::warning::${f} is not a valid shot sheet: ${e instanceof Error ? e.message.slice(0, 120) : e}`); return []; }
  }) : [];
  if (sheets.length) {
    const shorts = sheets.filter((s) => s.durationSec <= 180), long = sheets.filter((s) => s.durationSec > 180);
    writeFileSync(path.join(dir, "style.json"), JSON.stringify({
      note: "Measured from the shot sheets of the reference videos (lib/sheets.ts measures). These are the channel's style targets; never copy words, characters or art.",
      measuredAt: now,
      shorts: shorts.length ? { ...styleTargets(shorts), firstSecond: firstSecond(shorts) } : null,
      long: long.length ? { ...styleTargets(long), firstSecond: firstSecond(long) } : null,
    }, null, 1) + "\n");
    out.style = `${shorts.length} Short and ${long.length} long sheets measured`;
  } else out.style = `no shot sheets yet (${sheetsDir})`;

  const quota = await freeUnits(slug);
  const counts = recommendCounts(scan.shorts, scan.long, quota.free);
  writeFileSync(path.join(dir, "counts.json"), JSON.stringify({ note: "Recommended video counts (lib/research.ts recommendCounts). The owner accepts or changes them on the Launch review.",
    at: now, ...counts, quota }, null, 1) + "\n");
  out.counts = counts;

  if (raw.comments && Object.keys(raw.comments).length) {
    mkdirSync(path.join(ROOT, ".niche-data"), { recursive: true });
    writeFileSync(path.join(ROOT, ".niche-data", `${slug}-comments.txt`), topComments(raw.comments).join("\n") + "\n");
    out.comments = `${Object.values(raw.comments).flat().length} comments → .niche-data/${slug}-comments.txt`;
  }
  console.log(JSON.stringify(out, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  try {
    await main();
  } catch (e) {
    console.error(`::error::${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}
