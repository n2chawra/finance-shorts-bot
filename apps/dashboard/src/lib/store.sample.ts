/**
 * In-memory store filled with generated SAMPLE data (reset when the dev server restarts). Used
 * when DATABASE_URL is not set; store.db.ts is the real implementation with the same functions.
 */
import fs from "node:fs";
import path from "node:path";

import type { Analytics, ManualUpload, Overview, Run, Settings, Template, Video, VideoAction, VideoDetail } from "./schemas";

const VERSION = 7; // bump to regenerate the sample data without restarting the server
const IST_OFFSET = "+05:30";
const DAY_MS = 86_400_000;

type TemplateRow = Pick<Template, "id" | "name" | "description" | "version" | "weight" | "enabled"> & { durationSec: number };
type Store = { version: number; videos: VideoDetail[]; templates: TemplateRow[]; runs: Run[]; settings: Settings };

const TEMPLATES: TemplateRow[] = [
  { id: "two_friends_race", name: "Two friends race", description: "Two people invest the same amount; the early starter wins.", version: 2, weight: 1, enabled: true, durationSec: 60 },
  { id: "myth_vs_fact", name: "Myth vs fact", description: "A money belief is stamped MYTH, then tested with two growth rates.", version: 1, weight: 1, enabled: true, durationSec: 50 },
  { id: "money_leak_meter", name: "Money leak meter", description: "A small regular expense added up, then compared with investing it.", version: 1, weight: 1.2, enabled: true, durationSec: 54 },
  { id: "quiz_countdown", name: "Quiz countdown", description: "Three options, a five-second countdown, then the computed answer.", version: 1, weight: 0.8, enabled: true, durationSec: 48 },
];

// [title, category] per template, used round-robin so templates rotate
const TOPICS: Record<string, [string, string][]> = {
  two_friends_race: [
    ["Rahul vs Amit: who retires richer?", "compounding"], ["She started her SIP ten years early", "sip"],
    ["Same salary, very different retirements", "retirement"], ["The cost of waiting five years to invest", "compounding"],
    ["NPS early bird vs late starter", "nps"], ["PPF at twenty-two vs PPF at thirty-two", "ppf"],
    ["Twins, one SIP each, one big difference", "sip"], ["Stop investing at thirty-five and still win?", "compounding"],
    ["Step-up SIP vs flat SIP: the race", "sip"], ["ELSS now or ELSS later?", "tax"], ["Index fund early vs index fund late", "index_funds"],
  ],
  myth_vs_fact: [
    ["Myth: a savings account keeps your money safe", "inflation"], ["Myth: FDs always beat inflation", "fd"],
    ["Myth: you need lakhs to start investing", "sip"], ["Myth: paying the minimum due is fine", "credit_card"],
    ["Myth: gold never loses", "gold"], ["Myth: term insurance is wasted money", "insurance"],
    ["Myth: renting is throwing money away", "home_loan"], ["Myth: a big tax refund is good news", "tax"],
    ["Myth: cash at home is the safest money", "inflation"], ["Myth: no-cost EMI costs nothing", "emi"],
    ["Myth: you can time the market", "index_funds"],
  ],
  money_leak_meter: [
    ["What your food delivery habit really costs", "spending"], ["The daily chai that adds up", "spending"],
    ["Unused subscriptions: the silent leak", "subscriptions"], ["Cab rides vs metro, twenty years later", "spending"],
    ["Weekend shopping, long-term bill", "spending"], ["A new phone every year: the real price", "spending"],
    ["Late fees and penalties add up", "credit_card"], ["Impulse buys on sale days", "spending"],
    ["Eating out twice a week", "spending"], ["The convenience fee nobody notices", "subscriptions"],
    ["Paying for a gym you never visit", "subscriptions"],
  ],
  quiz_countdown: [
    ["Quiz: how much does a small SIP become?", "sip"], ["Quiz: what does this home loan really cost?", "emi"],
    ["Quiz: how fast does money double?", "compounding"], ["Quiz: FD or RD, which pays more?", "fd"],
    ["Quiz: what is this lumpsum worth later?", "compounding"], ["Quiz: how much a month for a crore?", "sip"],
    ["Quiz: the real cost of a car loan", "emi"], ["Quiz: PPF at maturity", "ppf"],
    ["Quiz: what inflation does to a lakh", "inflation"], ["Quiz: the step-up SIP surprise", "sip"],
    ["Quiz: how big should an emergency fund be?", "emergency_fund"],
  ],
};

const PALETTES = ["night", "forest", "plum", "ocean", "ember", "paper"];
const GENRES = ["lofi", "pop", "cinematic", "synthwave", "acoustic"];
const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STEP_SECONDS: [string, number][] = [
  ["planner", 42], ["writer", 75], ["number_check", 2], ["fact_review", 58], ["render", 165], ["qa_review", 47], ["ship", 12],
];

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** YYYY-MM-DD in IST. */
export function istDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}

function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

function publishAt(day: string, time: string): string {
  return new Date(`${day}T${time}:00${IST_OFFSET}`).toISOString();
}

function readScript(templateId: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "..", "..", "examples", `${templateId}.json`), "utf-8"));
  } catch {
    return null;
  }
}

function steps(r: () => number, failAt: string | null): VideoDetail["steps"] {
  let failed = false;
  return STEP_SECONDS.map(([agent, secs]) => {
    if (failed) return { agent, status: "skipped" as const, durationSec: 0, note: null };
    const durationSec = Math.max(1, Math.round(secs * (0.75 + r() * 0.5)));
    if (agent === failAt) {
      failed = true;
      return { agent, status: "failed" as const, durationSec, note: "Rejected after 2 rewrites" };
    }
    return { agent, status: "ok" as const, durationSec, note: null };
  });
}

function build(): Store {
  const r = rng(20261013);
  const now = new Date();
  const today = istDay(now);
  const settings: Settings = {
    uploadTimes: ["12:37", "19:07"], backlogCap: 30, lengthMinSec: 45, lengthMaxSec: 60,
    disclaimer: "Illustrative only. Not financial advice.", uploadsPaused: false,
    generationPaused: false, templateWork: { maxPerDay: 1, maxTemplates: 10 },
    alerts: { failedRun: true, failedUpload: true, tokenErrors: true, lowBacklog: true, lowBacklogThreshold: 5 },
    agents: { paused: false, research: true, improver: true, dashboard: true, auditor: true, maxActiveExperiments: 3 },
  };
  const scripts = Object.fromEntries(TEMPLATES.map((t) => [t.id, readScript(t.id)]));
  const evening = settings.uploadTimes[settings.uploadTimes.length - 1];   // sample history: one a day at the last slot
  const todaysSlotPassed = now.getTime() >= Date.parse(publishAt(today, evening));
  const nextDay = todaysSlotPassed ? addDays(today, 1) : today;

  const PUBLISHED = 28, QUEUED = 12;
  const total = PUBLISHED + 1 + QUEUED + 2;
  const videos: VideoDetail[] = [];
  for (let i = 0; i < total; i++) {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const [title, category] = TOPICS[tpl.id][Math.floor(i / TEMPLATES.length) % TOPICS[tpl.id].length];
    const id = `v${String(i + 1).padStart(3, "0")}`;
    let status: Video["status"], failReason: string | null = null, failAt: string | null = null;
    let upload: Video["upload"] = null, queuePosition: number | null = null, createdAt: Date;
    const stats: VideoDetail["stats"] = [];

    if (i < PUBLISHED) {
      status = "published";
      const day = addDays(nextDay, -(PUBLISHED - i));
      const at = publishAt(day, evening);
      createdAt = new Date(Date.parse(at) - (3 + r() * 4) * DAY_MS);
      upload = { youtubeId: null, publishAt: at, state: "published", error: null, attempts: i === 9 ? 2 : 1 };
      const reach = (500 + r() * r() * 9000) * tpl.weight * (i === 17 ? 3.2 : 1);
      const pct = 55 + r() * 28;
      // YouTube Analytics lags by a day: stats run from the publish day to yesterday
      const age = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`)) / DAY_MS) - 1;
      for (let k = 0; k <= Math.min(age, 27); k++) {
        const views = Math.round(reach * (0.42 * Math.exp(-k / 2.2) + 0.012) * (0.8 + r() * 0.4));
        stats.push({
          day: addDays(day, k), views, likes: Math.round(views * (0.04 + r() * 0.03)), comments: Math.round(views * 0.004 * (0.5 + r())),
          subsGained: Math.round(views * 0.005 * (0.4 + r() * 1.2)), avgViewPct: Math.round(pct * 10) / 10,
        });
      }
    } else if (i === PUBLISHED) {
      status = "scheduled";
      const at = publishAt(nextDay, evening);
      createdAt = new Date(Date.parse(at) - 4.4 * DAY_MS);
      upload = { youtubeId: null, publishAt: at, state: "scheduled", error: null, attempts: 1 };
    } else if (i <= PUBLISHED + QUEUED) {
      status = "queued";
      queuePosition = i - PUBLISHED;
      createdAt = new Date(now.getTime() - (QUEUED + 1 - queuePosition) * 0.3 * DAY_MS - r() * 3_600_000);
    } else if (i === total - 2) {
      status = "failed";
      failAt = "fact_review";
      failReason = "Fact review rejected the script twice: a tax claim did not match the current rules.";
      createdAt = new Date(now.getTime() - 1.3 * DAY_MS);
    } else {
      status = "failed";
      failAt = "qa_review";
      failReason = "QA review: a caption overlaps the chart in scene 5 after 2 re-renders.";
      createdAt = new Date(now.getTime() - 4.2 * DAY_MS);
    }

    const views = stats.reduce((s, x) => s + x.views, 0);
    const failedAtQa = failAt === "qa_review", failedAtFact = failAt === "fact_review";
    videos.push({
      id, templateId: tpl.id, topic: { title, category }, status, failReason, title,
      description: `${title}. ${settings.disclaimer} #shorts #personalfinance #${category.replace("_", "")}`,
      tags: ["shorts", "personalfinance", category.replace("_", ""), "india"],
      durationSec: tpl.durationSec,
      style: { palette: PALETTES[Math.floor(r() * PALETTES.length)], genre: GENRES[Math.floor(r() * GENRES.length)], key: KEYS[Math.floor(r() * KEYS.length)], bpm: 80 + Math.floor(r() * 41) },
      thumbnailUrl: `/sample/${tpl.id}/thumbnail.png`, previewUrl: `/sample/${tpl.id}/preview.png`, fileUrl: `/sample/${tpl.id}/video.mp4`,
      createdAt: createdAt.toISOString(), queuePosition, upload,
      totals: stats.length
        ? { views, likes: stats.reduce((s, x) => s + x.likes, 0), comments: stats.reduce((s, x) => s + x.comments, 0), subsGained: stats.reduce((s, x) => s + x.subsGained, 0), avgViewPct: stats[0].avgViewPct, liveAt: null }
        : null,
      script: scripts[tpl.id],
      qaChecks: [
        { checker: "number_check", passed: true, notes: ["All displayed figures recomputed from inputs."] },
        { checker: "fact_review", passed: !failedAtFact, notes: failedAtFact ? ["Tax claim does not match current rules.", "Rewrite 2 repeated the claim."] : ["Claims, Indian context and disclaimer OK."] },
        ...(failedAtFact ? [] : [{ checker: "qa_review" as const, passed: !failedAtQa, notes: failedAtQa ? ["Scene 5: caption overlaps the chart.", "Still present after 2 re-renders."] : ["No overlaps, text sizes OK, length in range."] }]),
      ],
      steps: steps(r, failAt), stats,
    });
  }

  const runs: Run[] = videos.map((v) => {
    const durationSec = v.steps.reduce((s, x) => s + x.durationSec, 0);
    return {
      id: `run-${v.id}`, kind: "video", videoId: v.id, title: v.title, status: v.status === "failed" ? "failed" : "ok",
      startedAt: new Date(Date.parse(v.createdAt) - durationSec * 1000).toISOString(), durationSec,
      error: v.failReason, sessionUrl: null, steps: v.steps,
    };
  });
  [[2.6, "Improve quiz_countdown: larger option cards", true], [9.1, "Build template: money_leak_meter", true], [15.4, "Build template: emi_breakdown (QA failed)", false]].forEach(([ago, title, ok], i) => {
    runs.push({
      id: `run-t${i + 1}`, kind: "template_work", videoId: null, title: title as string, status: ok ? "ok" : "failed",
      startedAt: new Date(now.getTime() - (ago as number) * DAY_MS).toISOString(), durationSec: 540 + i * 95,
      error: ok ? null : "Test video 2 failed QA: text below 44 px in the summary scene.", sessionUrl: null,
      steps: [{ agent: "template_builder", status: "ok", durationSec: 300 + i * 60, note: null }, { agent: "render ×2", status: "ok", durationSec: 190 + i * 20, note: null }, { agent: "qa_review", status: ok ? "ok" : "failed", durationSec: 50 + i * 15, note: null }],
    });
  });
  runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return { version: VERSION, videos, templates: TEMPLATES.map((t) => ({ ...t })), runs, settings };
}

const g = globalThis as unknown as { __fsbStore?: Store };
function db(): Store {
  if (g.__fsbStore?.version !== VERSION) g.__fsbStore = build();
  return g.__fsbStore;
}

function summary(v: VideoDetail): Video {
  const { script: _s, qaChecks: _q, steps: _t, stats: _st, ...rest } = v;
  void _s; void _q; void _t; void _st;
  return rest;
}

const queue = (s: Store) => s.videos.filter((v) => v.status === "queued").sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));

// ---------------- queries ----------------

export function getSettings(): Settings {
  return db().settings;
}

export function patchSettings(patch: Partial<Settings>): Settings {
  const s = db();
  s.settings = { ...s.settings, ...patch, alerts: { ...s.settings.alerts, ...patch.alerts }, templateWork: { ...s.settings.templateWork, ...patch.templateWork } };
  return s.settings;
}

export function listVideos(f: { status?: string; template?: string; category?: string; q?: string }): Video[] {
  const q = f.q?.trim().toLowerCase();
  return db().videos
    .filter((v) => (!f.status || v.status === f.status) && (!f.template || v.templateId === f.template) && (!f.category || v.topic.category === f.category))
    .filter((v) => !q || `${v.title} ${v.topic.category} ${v.templateId} ${v.id}`.toLowerCase().includes(q))
    .sort((a, b) => (b.upload?.publishAt ?? b.createdAt).localeCompare(a.upload?.publishAt ?? a.createdAt))
    .map(summary);
}

export function getVideo(id: string): VideoDetail | null {
  return db().videos.find((v) => v.id === id) ?? null;
}

export function listQueue(): Video[] {
  return queue(db()).map(summary);
}

/** What the next routine run will do. Mirrors `state()` in generator/run.py. */
function generationState(s: Store, backlog: number): Overview["generation"] {
  const { backlogCap, generationPaused, templateWork: tw } = s.settings;
  const today = istDay(new Date());
  const templateRunsToday = s.runs.filter((r) => r.kind === "template_work" && istDay(new Date(r.startedAt)) === today).length;
  const mayBuild = templateRunsToday < tw.maxPerDay;
  const full = backlog >= backlogCap;
  const [mode, reason]: [Overview["generation"]["mode"], string] = generationPaused
    ? ["paused", "Generation is paused. Routines do nothing until you resume."]
    : full && mayBuild ? ["template_work", `Backlog has reached the cap of ${backlogCap}, so the next run builds or improves a template.`]
    : full ? ["idle", `Backlog is full and today's template-work limit (${tw.maxPerDay}) is used. The next run does nothing.`]
    : ["video", `Backlog ${backlog} is below the cap of ${backlogCap}, so the next run makes a video.`];
  return {
    mode, reason, templateRunsToday, maxTemplateRunsPerDay: tw.maxPerDay, templates: s.templates.length, maxTemplates: tw.maxTemplates,
    lastRunAt: s.runs[0]?.startedAt ?? null,
  };
}

export function getOverview(): Overview {
  const s = db();
  const counts: Record<string, number> = {};
  for (const v of s.videos) counts[v.status] = (counts[v.status] ?? 0) + 1;
  const next = s.videos.filter((v) => v.status === "scheduled").sort((a, b) => a.upload!.publishAt.localeCompare(b.upload!.publishAt))[0];
  const since = addDays(istDay(new Date()), -7);   // the 7 full days ending yesterday
  const recentStats = s.videos.flatMap((v) => v.stats).filter((x) => x.day >= since);
  return {
    source: "sample", counts, backlog: (counts.queued ?? 0), backlogCap: s.settings.backlogCap, uploadsPaused: s.settings.uploadsPaused,
    generation: generationState(s, counts.queued ?? 0),
    nextUpload: next ? { videoId: next.id, title: next.title, publishAt: next.upload!.publishAt, thumbnailUrl: next.thumbnailUrl } : null,
    recentFailures: s.videos.filter((v) => v.status === "failed").sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((v) => ({ videoId: v.id, title: v.title, reason: v.failReason ?? "Unknown", at: v.createdAt })),
    last7: {
      views: recentStats.reduce((a, x) => a + x.views, 0), subsGained: recentStats.reduce((a, x) => a + x.subsGained, 0),
      uploads: s.videos.filter((v) => v.status === "published" && istDay(new Date(v.upload!.publishAt)) >= since).length,
    },
    allTime: { views: s.videos.flatMap((v) => v.stats).reduce((a, x) => a + x.views, 0), liveAt: null },
    recent: s.videos.filter((v) => v.status === "published").sort((a, b) => b.upload!.publishAt.localeCompare(a.upload!.publishAt)).slice(0, 4).map(summary),
  };
}

export function listTemplates(): Template[] {
  const s = db();
  return s.templates.map((t) => {
    const mine = s.videos.filter((v) => v.templateId === t.id);
    const published = mine.filter((v) => v.totals);
    return {
      id: t.id, name: t.name, description: t.description, version: t.version, weight: t.weight, enabled: t.enabled,
      lastUsedAt: mine.map((v) => v.createdAt).sort().at(-1) ?? null,
      videoCount: mine.length, publishedCount: published.length,
      avgViews: published.length ? Math.round(published.reduce((a, v) => a + v.totals!.views, 0) / published.length) : null,
      sampleThumbnailUrl: `/sample/${t.id}/thumbnail.png`, sampleVideoUrl: `/sample/${t.id}/video.mp4`,
    };
  });
}

export function patchTemplate(id: string, patch: { enabled?: boolean; weight?: number }): Template | null {
  const t = db().templates.find((x) => x.id === id);
  if (!t) return null;
  if (patch.enabled !== undefined) t.enabled = patch.enabled;
  if (patch.weight !== undefined) t.weight = Math.round(patch.weight * 10) / 10;
  return listTemplates().find((x) => x.id === id) ?? null;
}

export function listRuns(): Run[] {
  return db().runs.slice(0, 60);
}

export function getAnalytics(): Analytics {
  const s = db();
  const published = s.videos.filter((v) => v.totals);
  const today = istDay(new Date());
  const byDay = new Map<string, { views: number; subsGained: number }>();
  for (let k = 28; k >= 1; k--) byDay.set(addDays(today, -k), { views: 0, subsGained: 0 });   // 28 full days ending yesterday
  for (const x of published.flatMap((v) => v.stats)) {
    const d = byDay.get(x.day);
    if (d) { d.views += x.views; d.subsGained += x.subsGained; }
  }
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wd = names.map(() => ({ views: 0, n: 0 }));
  for (const v of published) {
    const i = (new Date(`${istDay(new Date(v.upload!.publishAt))}T00:00:00Z`).getUTCDay() + 6) % 7;
    wd[i].views += v.totals!.views;
    wd[i].n += 1;
  }
  const ranked = published.map((v) => ({ videoId: v.id, title: v.title, templateId: v.templateId, views: v.totals!.views, thumbnailUrl: v.thumbnailUrl }))
    .sort((a, b) => b.views - a.views);
  const views = published.reduce((a, v) => a + v.totals!.views, 0);
  return {
    daily: [...byDay].map(([day, d]) => ({ day, ...d })),
    weekday: names.map((weekday, i) => ({ weekday, avgViews: wd[i].n ? Math.round(wd[i].views / wd[i].n) : 0, uploads: wd[i].n })),
    top: ranked.slice(0, 5), bottom: ranked.slice(-5).reverse(),
    totals: {
      views, subsGained: published.reduce((a, v) => a + v.totals!.subsGained, 0), videos: published.length,
      avgViewPct: published.length ? Math.round(published.reduce((a, v) => a + v.totals!.avgViewPct, 0) / published.length * 10) / 10 : 0,
    },
  };
}

// ---------------- mutations ----------------

function renumber(s: Store, ordered: VideoDetail[]): void {
  ordered.forEach((v, i) => { v.queuePosition = i + 1; });
  void s;
}

export function reorderQueue(ids: string[]): Video[] | null {
  const s = db();
  const q = queue(s);
  if (ids.length !== q.length || !q.every((v) => ids.includes(v.id))) return null;
  renumber(s, ids.map((id) => q.find((v) => v.id === id)!));
  return listQueue();
}

export function markUploaded(id: string, m: ManualUpload): { ok: true } | { ok: false; error: string } {
  const s = db();
  const v = s.videos.find((x) => x.id === id);
  if (!v) return { ok: false, error: "Video not found" };
  v.status = "published";
  v.queuePosition = null;
  v.failReason = null;
  v.upload = { youtubeId: m.youtubeId ?? v.upload?.youtubeId ?? null, publishAt: m.publishedAt, state: "published", error: null, attempts: v.upload?.attempts ?? 0 };
  renumber(s, queue(s));
  return { ok: true };
}

export function videoAction(id: string, action: VideoAction): { ok: true } | { ok: false; error: string } {
  const s = db();
  const v = s.videos.find((x) => x.id === id);
  if (!v) return { ok: false, error: "Video not found" };
  if (action === "delete") {
    if (v.status !== "queued" && v.status !== "failed") return { ok: false, error: "Only queued or failed videos can be deleted" };
    s.videos = s.videos.filter((x) => x.id !== id);
    s.runs = s.runs.map((r) => (r.videoId === id ? { ...r, videoId: null } : r));
    renumber(s, queue(s));
    return { ok: true };
  }
  if (v.status !== "queued") return { ok: false, error: "Only queued videos can be skipped or uploaded" };
  if (action === "skip") {
    renumber(s, [...queue(s).filter((x) => x.id !== id), v]);
    return { ok: true };
  }
  if (s.settings.uploadsPaused) return { ok: false, error: "Uploads are paused" };
  v.status = "scheduled";
  v.queuePosition = null;
  v.upload = { youtubeId: null, publishAt: new Date().toISOString(), state: "pending", error: null, attempts: 0 };
  renumber(s, queue(s));
  return { ok: true };
}
