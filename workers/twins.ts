/**
 * Twins, nightly (01:37 IST, .github/workflows/twins.yml): for the topics the planner will see next
 * and for our Shorts published a few days ago, find the most-watched animated Shorts on the same
 * topic, have Gemini watch them (and ours) into shot sheets, and write what the winners do that we
 * don't. Owner-approved 2026-11-13. Free tier only.
 *
 *   npm run twins -- night [outDir]       the nightly job (calibrates first if it never has)
 *   npm run twins -- calibrate            Gemini on our own Shorts against their timeline.json
 *   npm run twins -- topic <topicId>      one brief now (testing)
 *
 * Writes on main: improvement/twins/{sheets,briefs,gaps}/*.json, model.json, calibration.json,
 * last-run.json (our own analysis: structure, no transcripts or frames). YouTube data (titles, views)
 * goes only to <outDir>/twins.json for the market-data branch and to the dashboard (RepoDoc "twins"),
 * both replaced every night.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { type Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { GeminiUnavailable, generate, parseJson, type Part } from "./lib/gemini.ts";
import { VideoDetails, durationSec } from "./lib/market.ts";
import {
  type Brief, type Candidate, type GapReport, type Sheet, SHEET_PROMPT, SHEET_SCHEMA, STILLS_PROMPT, STILLS_SCHEMA, StillsAnswer, TwinsConfig,
  brief, calibrate, cleanSheet, gapReport, isAnimated, measures, median, outlierScore, rankCandidates, searchFor, styleModel, truthOf,
} from "./lib/twins.ts";
import { youtubeConfigured } from "./lib/uploads.ts";
import { accessToken } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "improvement", "twins");
const API = "https://www.googleapis.com/youtube/v3";
const DAY_MS = 86_400_000;

const readJson = <T = unknown>(file: string, fallback: T): T => (existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : fallback);
const writeJson = (file: string, data: unknown) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data, null, 2) + "\n"); };
const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

// ---------------- YouTube ----------------

const SearchIds = z.object({ items: z.array(z.object({ id: z.object({ videoId: z.string().optional() }) })).default([]) });
const ChannelUploads = z.object({ items: z.array(z.object({ id: z.string(), contentDetails: z.object({ relatedPlaylists: z.object({ uploads: z.string().optional() }) }).optional() })).default([]) });
const PlaylistItems = z.object({ items: z.array(z.object({ contentDetails: z.object({ videoId: z.string() }) })).default([]) });
const Stats = z.object({ items: z.array(z.object({ id: z.string(), statistics: z.object({ viewCount: z.string().optional() }) })).default([]) });
const Mine = z.object({ items: z.array(z.object({ id: z.string() })).default([]) });

class YouTube {
  units = 0;
  constructor(private token: string) {}
  async get<T>(url: string, schema: { parse: (x: unknown) => T }, cost = 1): Promise<T> {
    this.units += cost;
    const res = await fetch(url, { headers: { authorization: `Bearer ${this.token}` } });
    if (!res.ok) throw new Error(`${res.status} ${url.split("?")[0]}: ${(await res.text()).slice(0, 200)}`);
    return schema.parse(await res.json());
  }
  async myChannel(): Promise<string | null> {
    return (await this.get(`${API}/channels?part=id&mine=true`, Mine).catch(() => ({ items: [] }))).items[0]?.id ?? null;
  }
  async details(ids: string[]) {
    const out: z.infer<typeof VideoDetails>["items"] = [];
    for (let i = 0; i < ids.length; i += 50) out.push(...(await this.get(`${API}/videos?part=snippet,contentDetails,statistics&id=${ids.slice(i, i + 50).join(",")}`, VideoDetails)).items);
    return out;
  }
  /** Median views of each channel's latest uploads: the yardstick for "beat its own channel". */
  async channelMedians(channelIds: string[], cache: Map<string, number | null>): Promise<void> {
    const todo = channelIds.filter((c) => !cache.has(c));
    for (let i = 0; i < todo.length; i += 50) {
      const list = await this.get(`${API}/channels?part=contentDetails&id=${todo.slice(i, i + 50).join(",")}`, ChannelUploads).catch(() => ({ items: [] }));
      for (const ch of list.items) {
        const uploads = ch.contentDetails?.relatedPlaylists.uploads;
        if (!uploads) { cache.set(ch.id, null); continue; }
        const items = await this.get(`${API}/playlistItems?part=contentDetails&maxResults=30&playlistId=${uploads}`, PlaylistItems).catch(() => ({ items: [] }));
        const ids = items.items.map((x) => x.contentDetails.videoId);
        const stats = ids.length ? await this.get(`${API}/videos?part=statistics&id=${ids.join(",")}`, Stats).catch(() => ({ items: [] })) : { items: [] };
        cache.set(ch.id, median(stats.items.map((s) => Number(s.statistics.viewCount ?? 0)).filter((v) => v > 0)));
      }
      for (const c of todo.slice(i, i + 50)) if (!cache.has(c)) cache.set(c, null);
    }
  }
  async search(q: string, cfg: TwinsConfig["search"], now: Date): Promise<string[]> {
    const params = new URLSearchParams({ part: "id", type: "video", videoDuration: "short", order: "relevance", maxResults: String(cfg.maxResults), q,
      publishedAfter: new Date(now.getTime() - cfg.years * 365 * DAY_MS).toISOString(), relevanceLanguage: cfg.relevanceLanguage, regionCode: cfg.regionCode });
    return (await this.get(`${API}/search?${params}`, SearchIds, 100)).items.map((i) => i.id.videoId).filter((x): x is string => !!x);
  }
}

// ---------------- the night ----------------

type Ctx = {
  cfg: TwinsConfig; key: string; yt: YouTube; now: Date; myChannel: string | null;
  medians: Map<string, number | null>; seen: Map<string, Candidate & { style?: string }>;
  decodesLeft: number; outOfQuota: boolean; tokens: number; models: Record<string, number>; errors: string[];
};

const sheetFile = (youtubeId: string) => path.join(DIR, "sheets", `${youtubeId}.json`);
const SheetFile = z.object({ youtubeId: z.string(), ours: z.string().nullable().optional(), model: z.string(), decodedAt: z.string(), sheet: z.unknown() });

/** A video's shot sheet: from the cache, or Gemini watches it now (one decode from tonight's budget). */
async function sheetOf(ctx: Ctx, youtubeId: string, ours: string | null = null): Promise<Sheet | null> {
  const file = sheetFile(youtubeId);
  if (existsSync(file)) {
    try { return cleanSheet(SheetFile.parse(readJson(file, null)).sheet); } catch { /* re-decode a sheet that no longer parses */ }
  }
  if (ctx.outOfQuota || ctx.decodesLeft <= 0) return null;
  ctx.decodesLeft--;
  const partsAt = (fps: number): Part[] => [{ file_data: { file_uri: watchUrl(youtubeId) }, ...(fps !== 1 ? { video_metadata: { fps } } : {}) }, { text: SHEET_PROMPT }];
  const log = (l: string) => console.error(`${new Date().toISOString().slice(11, 19)} sheet ${youtubeId}: ${l}`);
  const ask = (fps: number) => generate(partsAt(fps), { key: ctx.key, models: ctx.cfg.models, json: true, schema: SHEET_SCHEMA, timeoutMs: 150_000, maxTimeouts: 2, log });
  try {
    const r = await ask(ctx.cfg.fps).catch(async (e) => {
      // YouTube links may not take a custom frame rate: fall back to Gemini's default for the rest of the night
      if (ctx.cfg.fps === 1 || !/: 400 /.test(String(e))) throw e;
      ctx.errors.push(`fps ${ctx.cfg.fps} refused, using 1: ${String(e).slice(0, 160)}`);
      ctx.cfg = { ...ctx.cfg, fps: 1 };
      return ask(1);
    });
    const sheet = cleanSheet(parseJson(r.text));
    ctx.tokens += r.tokens ?? 0;
    ctx.models[r.model] = (ctx.models[r.model] ?? 0) + 1;
    writeJson(file, { youtubeId, ours, model: r.model, decodedAt: ctx.now.toISOString(), sheet });
    return sheet;
  } catch (e) {
    if (e instanceof GeminiUnavailable && e.quota) ctx.outOfQuota = true;
    ctx.errors.push(`sheet ${youtubeId}: ${String(e).slice(0, 300)}`);
    return null;
  }
}

/** Which candidates are animated, from 4 public stills each (one Gemini call for all of them). */
async function animatedOf(ctx: Ctx, topic: string, cands: Candidate[]): Promise<Map<string, string>> {
  const parts: Part[] = [];
  const ids: string[] = [];
  const titles: { id: string; title: string }[] = [];
  for (const c of cands) {
    const imgs: string[] = [];
    for (const name of ["hq1", "hq2", "hq3", "frame0"]) {
      const res = await fetch(`https://i.ytimg.com/vi/${c.youtubeId}/${name}.jpg`).catch(() => null);
      if (res?.ok) imgs.push(Buffer.from(await res.arrayBuffer()).toString("base64"));
    }
    if (!imgs.length) continue;
    ids.push(c.youtubeId);
    titles.push({ id: c.youtubeId, title: c.title });
    parts.push({ text: `Video ${c.youtubeId}:` }, ...imgs.map((data) => ({ inline_data: { mime_type: "image/jpeg", data } })));
  }
  const out = new Map<string, string>();
  if (!ids.length || ctx.outOfQuota) return out;
  try {
    const r = await generate([{ text: STILLS_PROMPT(topic, titles) }, ...parts], { key: ctx.key, models: ctx.cfg.models, json: true, schema: STILLS_SCHEMA, timeoutMs: 120_000, maxTimeouts: 2,
      log: (l) => console.error(`${new Date().toISOString().slice(11, 19)} stills: ${l}`) });
    ctx.tokens += r.tokens ?? 0;
    const answers = StillsAnswer.parse(parseJson(r.text));
    console.error(`stills for "${topic}": ${answers.map((a) => `${a.id} ${a.animated ? "animated" : "not animated"}${a.onTopic ? "" : ", off topic"}`).join("; ")}`);
    for (const a of answers) if (a.animated && a.onTopic) out.set(a.id, a.style);
  } catch (e) {
    if (e instanceof GeminiUnavailable && e.quota) ctx.outOfQuota = true;
    ctx.errors.push(`stills: ${String(e).slice(0, 300)}`);
  }
  return out;
}

/** The top animated Shorts on a search, each with its sheet. Sheets that turn out not animated are dropped. */
async function twinsFor(ctx: Ctx, topic: string, query: string, exclude: Set<string>): Promise<{ id: string; sheet: Sheet }[]> {
  const ids = await ctx.yt.search(query, ctx.cfg.search, ctx.now);
  const details = await ctx.yt.details(ids);
  await ctx.yt.channelMedians([...new Set(details.map((d) => d.snippet.channelId).filter((x): x is string => !!x))], ctx.medians);
  const cands: Candidate[] = details.map((d) => {
    const views = Number(d.statistics.viewCount ?? 0), m = d.snippet.channelId ? ctx.medians.get(d.snippet.channelId) ?? null : null;
    return { youtubeId: d.id, title: d.snippet.title, channel: d.snippet.channelTitle, channelId: d.snippet.channelId ?? null, views,
      durationSec: durationSec(d.contentDetails.duration), publishedAt: d.snippet.publishedAt, channelMedian: m, outlier: outlierScore(views, m) };
  });
  const mine = new Set([...exclude, ...(ctx.myChannel ? [ctx.myChannel] : [])]);
  const ranked = rankCandidates(cands, ctx.cfg.search, mine).slice(0, ctx.cfg.stillsFor);
  const animated = await animatedOf(ctx, topic, ranked);
  const out: { id: string; sheet: Sheet }[] = [];
  for (const c of ranked) {
    if (out.length >= ctx.cfg.perTopic) break;
    if (!animated.has(c.youtubeId)) continue;
    const sheet = await sheetOf(ctx, c.youtubeId);
    if (!sheet) continue;
    ctx.seen.set(c.youtubeId, { ...c, style: animated.get(c.youtubeId) });
    if (isAnimated(sheet)) out.push({ id: c.youtubeId, sheet });
  }
  return out;
}

/** Our published Shorts with their YouTube ids, newest first. */
async function ourShorts(): Promise<{ videoId: string; youtubeId: string; publishAt: Date }[]> {
  if (!process.env.DATABASE_URL) return [];
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.upload.findMany({
      where: { youtubeId: { not: null }, publishAt: { lte: new Date() }, video: { deletedAt: null, format: "short" } },
      select: { youtubeId: true, publishAt: true, video: { select: { id: true } } }, orderBy: { publishAt: "desc" }, take: 60,
    });
    return rows.filter((r) => r.youtubeId && r.publishAt).map((r) => ({ videoId: r.video.id, youtubeId: r.youtubeId!, publishAt: r.publishAt! }));
  } finally {
    await prisma.$disconnect();
  }
}

const historyEntry = (videoId: string) => (readJson<{ id: string; topic?: { title?: string; feed_id?: string } }[]>(path.join(ROOT, "history", "history.json"), []))
  .find((e) => e.id === videoId);
const feedTopic = (id: string | undefined) => (id ? (readJson<{ topics: { id: string; title: string; search?: string }[] }>(path.join(ROOT, "improvement", "research", "topics.json"), { topics: [] }).topics.find((t) => t.id === id)) : undefined);
const dropsOf = (videoId: string) => (readJson<{ videos: { id: string; drops?: { at: number; drop: number }[] }[] }>(path.join(ROOT, "metrics", "analytics.json"), { videos: [] })
  .videos.find((v) => v.id === videoId)?.drops ?? []);

async function runCalibration(ctx: Ctx, ours: { videoId: string; youtubeId: string }[]) {
  const picked = ours.filter((o) => existsSync(path.join(ROOT, "videos", o.videoId, "timeline.json"))).slice(0, ctx.cfg.calibration.videos);
  const scores = [];
  for (const o of picked) {
    const sheet = await sheetOf(ctx, o.youtubeId, o.videoId);
    if (!sheet) { scores.push({ videoId: o.videoId, youtubeId: o.youtubeId, error: "no sheet" }); continue; }
    const tl = readJson<Parameters<typeof truthOf>[0]>(path.join(ROOT, "videos", o.videoId, "timeline.json"), { fps: 30, durationInFrames: 0, beats: [] });
    scores.push({ videoId: o.videoId, youtubeId: o.youtubeId, ...calibrate(sheet, truthOf(tl), ctx.cfg.calibration) });
  }
  const scored = scores.filter((s): s is typeof s & { passed: boolean } => "passed" in s);
  const passed = scored.length >= Math.min(3, picked.length) && scored.filter((s) => s.passed).length / Math.max(1, scored.length) >= 0.8;
  const cal = { writtenAt: ctx.now.toISOString(), passed, videos: scores.length, passedVideos: scored.filter((s) => s.passed).length, thresholds: ctx.cfg.calibration, scores };
  writeJson(path.join(DIR, "calibration.json"), cal);
  return cal;
}

async function runBriefs(ctx: Ctx, exclude: Set<string>, only?: string) {
  const upcoming = only
    ? [feedTopic(only)].filter((t): t is NonNullable<typeof t> => !!t).map((t) => ({ id: t.id, title: t.title, search: t.search ?? null }))
    : (JSON.parse(execFileSync("python3", ["-m", "generator.twins_feed", "--n", "16"], { cwd: ROOT, encoding: "utf8" })) as { id: string; title: string; search: string | null }[]);
  const todo = upcoming.filter((t) => only || !existsSync(path.join(DIR, "briefs", `${t.id}.json`))).slice(0, only ? 1 : ctx.cfg.nightly.topics);
  const written: string[] = [];
  for (const t of todo) {
    if (ctx.outOfQuota || ctx.decodesLeft <= 0) break;
    const q = searchFor(t);
    const twins = await twinsFor(ctx, t.title, q, exclude).catch((e) => { ctx.errors.push(`brief ${t.id}: ${String(e).slice(0, 200)}`); return []; });
    if (!twins.length) continue;
    writeJson(path.join(DIR, "briefs", `${t.id}.json`), brief(t.id, q, twins, ctx.now));
    written.push(t.id);
  }
  return written;
}

async function runGaps(ctx: Ctx, ours: { videoId: string; youtubeId: string; publishAt: Date }[], exclude: Set<string>) {
  const due = ours.filter((o) => {
    const age = ctx.now.getTime() - o.publishAt.getTime();
    return age >= 2 * DAY_MS && age <= 12 * DAY_MS && !existsSync(path.join(DIR, "gaps", `${o.videoId}.json`));
  }).slice(0, ctx.cfg.nightly.ours);
  const written: string[] = [];
  for (const o of due) {
    if (ctx.outOfQuota) break;
    const mine = await sheetOf(ctx, o.youtubeId, o.videoId);
    if (!mine) continue;
    const entry = historyEntry(o.videoId);
    const topic = feedTopic(entry?.topic?.feed_id);
    const known = topic ? readJson<Brief | null>(path.join(DIR, "briefs", `${topic.id}.json`), null) : null;
    let twins: { id: string; sheet: Sheet }[] = [];
    if (known) {
      for (const id of known.twins) { const s = await sheetOf(ctx, id); if (s) twins.push({ id, sheet: s }); }
    } else {
      const q = searchFor({ search: topic?.search, title: topic?.title ?? entry?.topic?.title ?? "" });
      twins = await twinsFor(ctx, topic?.title ?? entry?.topic?.title ?? "", q, exclude).catch((e) => { ctx.errors.push(`gaps ${o.videoId}: ${String(e).slice(0, 200)}`); return []; });
    }
    if (!twins.length) continue;
    writeJson(path.join(DIR, "gaps", `${o.videoId}.json`), gapReport(o.videoId, o.youtubeId, mine, twins, dropsOf(o.videoId), ctx.now));
    written.push(o.videoId);
  }
  return written;
}

const listJson = <T>(dir: string): T[] => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => readJson<T>(path.join(dir, f), null as T)).filter(Boolean) : []);

/** The dashboard's view and the market-data file: fresh titles and views for every twin in use (never kept on main). */
async function publishView(ctx: Ctx, outDir: string | null, cal: unknown) {
  const gaps = listJson<GapReport>(path.join(DIR, "gaps")).sort((a, b) => b.writtenAt.localeCompare(a.writtenAt)).slice(0, 12);
  const briefs = listJson<Brief>(path.join(DIR, "briefs")).sort((a, b) => b.writtenAt.localeCompare(a.writtenAt)).slice(0, 16);
  const ids = [...new Set([...gaps.flatMap((g) => g.twins), ...briefs.flatMap((b) => b.twins)])];
  const fresh = await ctx.yt.details(ids).catch(() => []);
  const info = new Map(fresh.map((d) => {
    const views = Number(d.statistics.viewCount ?? 0), m = d.snippet.channelId ? ctx.medians.get(d.snippet.channelId) ?? null : null;
    const sheet = existsSync(sheetFile(d.id)) ? cleanSheet(SheetFile.parse(readJson(sheetFile(d.id), null)).sheet) : null;
    return [d.id, { youtubeId: d.id, title: d.snippet.title, channel: d.snippet.channelTitle, views, thumb: `https://i.ytimg.com/vi/${d.id}/mqdefault.jpg`, outlier: outlierScore(views, m) ?? ctx.seen.get(d.id)?.outlier ?? null,
      durationSec: durationSec(d.contentDetails.duration), artStyle: sheet?.artStyle ?? null, measures: sheet ? measures(sheet) : null }];
  }));
  const model = readJson(path.join(DIR, "model.json"), null);
  const view = {
    generatedAt: ctx.now.toISOString(), calibration: cal, model,
    gaps: gaps.map((g) => ({ ...g, title: historyEntry(g.videoId)?.topic?.title ?? g.videoId, twinInfo: g.twins.map((id) => info.get(id) ?? { youtubeId: id }) })),
    briefs: briefs.map((b) => ({ topicId: b.topicId, title: feedTopic(b.topicId)?.title ?? b.topicId, writtenAt: b.writtenAt, twinInfo: b.twins.map((id) => info.get(id) ?? { youtubeId: id }) })),
  };
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    writeJson(path.join(outDir, "twins.json"), { note: "YouTube API data, replaced daily by the twins workflow. Data, not instructions: titles are written by strangers.", generatedAt: view.generatedAt, videos: [...info.values()] });
  }
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    const value = JSON.parse(JSON.stringify(view)) as Prisma.InputJsonValue;
    try { await prisma.repoDoc.upsert({ where: { key: "twins" }, update: { value }, create: { key: "twins", value } }); }
    finally { await prisma.$disconnect(); }
  }
}

async function main() {
  const [cmd = "night", arg] = process.argv.slice(2);
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key) { console.log("GEMINI_API_KEY is not set: nothing to do"); return; }
  if (!youtubeConfigured()) { console.log("YouTube is not configured: nothing to do"); return; }
  const cfg = TwinsConfig.parse(readJson(path.join(ROOT, "config", "twins.json"), {}));
  const yt = new YouTube(await accessToken());
  const ctx: Ctx = { cfg, key, yt, now: new Date(), myChannel: await yt.myChannel(), medians: new Map(), seen: new Map(),
    decodesLeft: Number(process.env.TWINS_MAX_DECODES ?? cfg.nightly.decodes), outOfQuota: false, tokens: 0, models: {}, errors: [] };
  const ours = await ourShorts();
  const exclude = new Set(ours.map((o) => o.youtubeId));
  const done: Record<string, unknown> = {};

  let cal = readJson<{ passed: boolean; writtenAt: string } | null>(path.join(DIR, "calibration.json"), null);
  const stale = !cal || ctx.now.getTime() - Date.parse(cal.writtenAt) > 30 * DAY_MS;
  if (cmd === "search") {
    // a search phrase straight in (testing): its twins, each watched, and a brief named after the phrase
    const q = process.argv.slice(3).join(" ");
    const twins = await twinsFor(ctx, q, q, exclude);
    const id = `search-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
    if (twins.length) writeJson(path.join(DIR, "briefs", `${id}.json`), brief(id, q, twins, ctx.now));
    console.log(JSON.stringify({ query: q, picked: twins.map((t) => ({ id: t.id, ...ctx.seen.get(t.id), artStyle: t.sheet.artStyle, measures: measures(t.sheet) })), errors: ctx.errors, youtubeUnits: yt.units }, null, 2));
    return;
  }
  if (cmd === "probe") {
    // one of our Shorts (or a given YouTube id): how long Gemini takes and what it returns, nothing kept
    const o = arg ? { videoId: null, youtubeId: arg } : ours[0];
    if (!o) throw new Error("no Short to probe");
    const t0 = Date.now();
    const s = await sheetOf({ ...ctx, decodesLeft: 1 }, o.youtubeId, o.videoId);
    console.log(JSON.stringify({ youtubeId: o.youtubeId, seconds: Math.round((Date.now() - t0) / 1000), ok: !!s, measures: s ? measures(s) : null, errors: ctx.errors }, null, 2));
    return;
  }
  if (cmd === "calibrate" || stale) { cal = await runCalibration(ctx, ours); done.calibration = cal.passed; }
  if (cmd === "night" || cmd === "topic") {
    if (!cal?.passed) {
      ctx.errors.push("calibration has not passed: no briefs or gap reports until Gemini reads our own Shorts correctly");
    } else {
      done.briefs = await runBriefs(ctx, exclude, cmd === "topic" ? arg : undefined);
      if (cmd === "night") done.gaps = await runGaps(ctx, ours, exclude);
      const reports = listJson<GapReport>(path.join(DIR, "gaps"));
      writeJson(path.join(DIR, "model.json"), styleModel(reports, cfg.model, ctx.now));
    }
  }
  await publishView(ctx, cmd === "night" ? path.resolve(arg ?? "twins-data") : null, cal).catch((e) => ctx.errors.push(`view: ${String(e).slice(0, 200)}`));
  const run = { at: ctx.now.toISOString(), command: cmd, ...done, decodes: cfg.nightly.decodes - ctx.decodesLeft, outOfQuota: ctx.outOfQuota, tokens: ctx.tokens, models: ctx.models, youtubeUnits: yt.units, errors: ctx.errors };
  writeJson(path.join(DIR, "last-run.json"), run);
  console.log(JSON.stringify(run, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
