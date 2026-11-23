/**
 * Watchdog (hourly): looks for anything that needs the owner and raises it on the dashboard's
 * Notifications page, with what broke, the impact and the exact fix. Every check resolves its own
 * notification once the condition clears, so the page only ever shows what is wrong right now.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { PrismaClient, type Channel } from "@prisma/client";

import { TOKEN_FIX, type Notice, type WorkflowRun, notify, resolve, resolveOthers, workflowNotices } from "./lib/notify.ts";
import { istHour, istWeekday } from "./lib/ist-clock.ts";
import { istDay, missedSlots, istTime } from "./lib/publishing.ts";
import { type ObservedRun, clusterRuns, isScheduled, scheduleOverlap, videoRunId, videoSteps } from "./lib/schedule.ts";
import { loadSettings, type Settings } from "./lib/settings.ts";
import { youtubeClientConfigured } from "./lib/uploads.ts";
import { CHANNEL_ONE } from "./lib/channels.ts";
import { activeChannels, channelSettings, tokenOf } from "./lib/channel-auth.ts";
import { scopedPrisma } from "./lib/scoped.ts";
import { TokenError, accessToken } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOUR = 3_600_000;
const SITE = process.env.DASHBOARD_URL ?? "https://courageous-granita-bb8b51.netlify.app";
const ROUTINES = "claude.ai → Code → Routines";

type Check = { key: string; raise: Notice | null };

const notice = (key: string, severity: Notice["severity"], title: string, detail: string, fix: string): Notice => ({ key, source: "watchdog", severity, title, detail, fix });

/**
 * One channel's video pipeline (its own videos, queue, slots and settings). `prisma` is narrowed to the
 * channel (lib/scoped.ts); `key` and `label` keep channel #1's notification keys and titles as before and
 * give another channel "<key>:<slug>" and its name, the convention stats and publish use.
 */
const PIPELINE_KEYS = ["no-videos", "made-today-zero", "queue-empty", "backlog-low", "slot-missed", "uploads-paused"] as const;
type ChannelRun = { key: (k: string) => string; label: string; channelId?: string };

async function pipelineChecks(prisma: PrismaClient, now: Date, s: Settings, run: ChannelRun): Promise<Check[]> {
  const notice = (key: string, severity: Notice["severity"], title: string, detail: string, fix: string): Notice =>
    ({ key: run.key(key), source: "watchdog", severity, title: `${run.label}${title}`, detail, fix, ...(run.channelId ? { channelId: run.channelId } : {}) });
  const latest = await prisma.video.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } });
  const hours = latest ? (now.getTime() - latest.createdAt.getTime()) / HOUR : Infinity;
  const today = istDay(now);
  const madeToday = await prisma.video.count({ where: { createdAt: { gte: new Date(`${today}T00:00:00+05:30`) } } });
  // queued Shorts: every check below is about Short slots, and a queued long video fills only its own weekly
  // slot (12 Nov: one long video queued, no Shorts, and the slot-missed notice blamed Publish)
  const backlog = await prisma.video.count({ where: { status: "queued", deletedAt: null, format: { not: "long" } } });
  // a Short slot that passed 20+ minutes ago today with nothing uploaded for it (12 Nov 2026: GitHub
  // dropped every Publish run for 9 hours and the 19:07 slot went empty without anyone knowing)
  const shortUploads = (await prisma.upload.findMany({
    where: { state: { in: ["scheduled", "uploaded", "published"] }, video: { format: { not: "long" }, deletedAt: null },
             publishAt: { gte: new Date(`${today}T00:00:00+05:30`) } }, select: { publishAt: true } })).map((u) => u.publishAt);
  const empty = s.uploadsPaused ? [] : missedSlots(now, s.uploadTimes, shortUploads, -20, 24).map((d) => istTime(d));
  return [
    { key: run.key("no-videos"), raise: !s.generationPaused && hours > 26 ? notice("no-videos", "critical", `No new videos for ${Number.isFinite(hours) ? Math.floor(hours) : "many"} hours`,
      "The nightly video run hasn't produced anything. The queue will run dry.",
      `1. Open ${ROUTINES} → Finance Shorts generation and read the latest run.\n2. If it hit the Pro usage limit, nothing to do: the next run continues.\n3. If it errored, paste its report into a Claude Code session in this project.`) : null },
    { key: run.key("made-today-zero"), raise: !s.generationPaused && istHour(now) >= 11 && madeToday === 0 && hours <= 26 ? notice("made-today-zero", "warning", "No videos made today yet",
      "The 04:07 IST run made nothing and the 09:07 spare run didn't catch up.", `Check ${ROUTINES} for today's two runs and their reports.`) : null },
    { key: run.key("queue-empty"), raise: backlog === 0 && !s.uploadsPaused ? notice("queue-empty", "critical", "The upload queue is empty",
      "The next upload slot has nothing to publish.", "Videos usually arrive overnight. If this lasts past 10:00 IST, check the video runs (see 'No new videos')."): null },
    { key: run.key("backlog-low"), raise: s.alerts.lowBacklog && backlog > 0 && backlog < s.alerts.lowBacklogThreshold ? notice("backlog-low", "warning", `Only ${backlog} videos ready`,
      `Fewer than ${s.alerts.lowBacklogThreshold} videos are queued; at two uploads a day that's under ${Math.ceil(backlog / 2)} days.`, "Nothing to do if runs are healthy; it refills by about one a day.") : null },
    { key: run.key("slot-missed"), raise: empty.length ? notice("slot-missed", "critical", `Today's ${empty.join(", ")} Short slot${empty.length === 1 ? " was" : "s were"} missed`,
      backlog === 0 ? "Nothing was uploaded for it, and no Short is queued: the video runs made fewer Shorts than there are slots."
        : "Nothing was uploaded for it although Shorts are queued: the Publish workflow didn't run in time.",
      "1. GitHub → Actions → Publish → Run workflow (upload_now 1 posts the next Short now).\n2. If Publish keeps missing runs, check that GITHUB_ACTIONS_TOKEN is set in Netlify (the publish heartbeat needs it).\n3. If no Short is queued, start the video routine by hand.") : null },
    { key: run.key("uploads-paused"), raise: s.uploadsPaused ? notice("uploads-paused", "info", "Uploads are paused (you post by hand)",
      "The bot uploads nothing while this is on.", "When Google approves the YouTube API audit: Settings → Uploads → turn off 'Pause all uploads'.") : null },
  ];
}

/** Platform-wide: the agents' master switch. */
function agentsPausedCheck(s: Settings): Check {
  return { key: "agents-paused", raise: s.agents.paused ? notice("agents-paused", "info", "Self-improving agents are paused",
    "Research, improver and dashboard agents do nothing while this is on.", "Settings → Self-improving agents → turn the master switch back on.") : null };
}

async function siteCheck(): Promise<Check> {
  try {
    const res = await fetch(`${SITE}/api/health`, { signal: AbortSignal.timeout(20_000) });
    if (res.ok) return { key: "site-down", raise: null };
    return { key: "site-down", raise: notice("site-down", "critical", "The dashboard is not responding", `${SITE}/api/health answered ${res.status}.`,
      "1. Open Netlify → your project → Deploys and check the latest deploy.\n2. If the database is the problem, check Supabase is not paused (free projects pause after a week idle).") };
  } catch (e) {
    return { key: "site-down", raise: notice("site-down", "critical", "The dashboard is not responding", `${SITE}/api/health: ${e instanceof Error ? e.message : e}`,
      "1. Open Netlify → Deploys and check the latest deploy.\n2. Check Supabase is not paused.") };
  }
}

/** The channel's own YouTube sign-in (no API quota: only the OAuth token endpoint). A channel not connected yet is skipped. */
async function tokenCheck(ch: Channel, run: ChannelRun): Promise<Check | null> {
  if (!youtubeClientConfigured()) return null;
  const t = tokenOf(ch);
  if (!t) {
    console.log(`::notice::${ch.id} is not connected to YouTube yet: no sign-in check.`);
    return null;
  }
  const key = run.key("youtube-token");
  try {
    await accessToken(t.refreshToken, t.client);
    return { key, raise: null };
  } catch (e) {
    if (!(e instanceof TokenError)) return null;   // network hiccup: don't raise or resolve
    return { key, raise: { key, source: "watchdog", severity: "critical", title: `${run.label}YouTube sign-in stopped working`,
      detail: `Google rejected the stored token: ${e.message}. Uploads and stats are stopped.`, fix: TOKEN_FIX, ...(run.channelId ? { channelId: run.channelId } : {}) } };
  }
}

/** Latest completed run of each workflow on main: failed → warning, succeeded → resolved. Asked per
 * workflow: since Publish runs every 20 minutes (2026-11-12) the 60 newest runs on main covered only
 * ~12 h, so a daily job's failure dropped out of view and its notice was closed while still red. */
async function workflowChecks(): Promise<Check[] | null> {
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return null;
  const get = async <T>(url: string): Promise<T | null> => {
    const res = await fetch(`https://api.github.com/repos/${repo}/${url}`, { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" } });
    return res.ok ? ((await res.json()) as T) : null;
  };
  const wfs = await get<{ workflows: { id: number; name: string; state: string }[] }>("actions/workflows?per_page=100");
  if (!wfs) return null;
  const runs: WorkflowRun[] = [];
  for (const wf of wfs.workflows.filter((w) => w.state === "active" && w.name !== "Watchdog")) {
    const page = await get<{ workflow_runs: WorkflowRun[] }>(`actions/workflows/${wf.id}/runs?branch=main&status=completed&per_page=1`);
    if (!page) return null; // never resolve notices from a partial picture
    runs.push(...page.workflow_runs.slice(0, 1));
  }
  return workflowNotices(runs);
}

function agentChecks(now: Date, enabled: Record<string, boolean>, paused: boolean): Check[] {
  const out: Check[] = [];
  const today = istDay(now);
  const logFile = path.join(ROOT, "improvement", "merge-log.json");
  const log = existsSync(logFile) ? (JSON.parse(readFileSync(logFile, "utf8")) as { merges: { agent: string; result: string; dayIst: string; reasons: string[]; runUrl: string }[] }).merges : [];
  for (const agent of ["research", "improver", "dashboard", "auditor", "scout", "studio"]) {
    const mine = log.filter((m) => m.agent === agent);
    const [prev, last] = mine.slice(-2);
    const blocked = !!prev && !!last && prev.result === "blocked" && last.result === "blocked" && prev.dayIst !== last.dayIst;
    out.push({ key: `agent-blocked:${agent}`, raise: blocked && last ? notice(`agent-blocked:${agent}`, "warning", `The ${agent} agent's changes were blocked twice`,
      `Last reasons: ${last.reasons.join("; ")}`, `Usually the agent fixes this itself next night. If it keeps happening, look at ${last.runUrl} and tell a Claude Code session what you see.`) : null });
    const dir = path.join(ROOT, "improvement", "activity");
    const everReported = existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(`-${agent}.json`));
    const reported = existsSync(path.join(dir, `${today}-${agent}.json`));
    // Studio runs Mondays and Wednesdays at 08:05 (owner, 2026-11-16: two long videos a week), Scout Mon/Thu at 09:37 (owner, 2026-11-02); the others every night, done by 10:00 IST
    const when = agent === "studio" ? { days: [1, 3], afterHour: 19 } : agent === "scout" ? { days: [1, 4], afterHour: 11 } : { days: [0, 1, 2, 3, 4, 5, 6], afterHour: 10 };
    const dueToday = when.days.includes(istWeekday(now));
    // only once the agent has reported at least once: before its first night there's nothing to miss
    const silent = !paused && enabled[agent] && everReported && dueToday && istHour(now) >= when.afterHour && !reported;
    out.push({ key: `agent-silent:${agent}`, raise: silent ? notice(`agent-silent:${agent}`, "warning", `The ${agent} agent didn't report last night`,
      "Its routine didn't run, ran out of usage, or failed before writing its activity log.", `Open ${ROUTINES} → the ${agent} agent and read the last run.`) : null });
  }
  return out;
}

/** Start/finish of each routine over the last 30 h: agents from their activity stamps, video runs from step times. */
async function scheduleCheck(prisma: PrismaClient, now: Date): Promise<Check | null> {
  const since = new Date(now.getTime() - 30 * HOUR);
  const agents = await prisma.agentActivity.findMany({ where: { startedAt: { gte: since }, finishedAt: { not: null } }, select: { agent: true, startedAt: true, finishedAt: true } });
  const steps = await prisma.agentRun.findMany({ where: { videoId: { not: null }, startedAt: { gte: since } }, select: { videoId: true, agent: true, startedAt: true, finishedAt: true } });
  const observed: ObservedRun[] = agents.flatMap((a) => (isScheduled(a.agent) ? [{ id: a.agent, start: a.startedAt!, finish: a.finishedAt! }] : []));
  for (const r of clusterRuns(videoSteps(steps))) {
    observed.push({ id: videoRunId(r.start), start: r.start, finish: r.finish });
  }
  if (!observed.length) return null;   // nothing recorded: leave any earlier verdict as it is
  const f = scheduleOverlap(observed);
  return { key: "schedule-overlap", raise: f ? notice("schedule-overlap", "warning", f.title, f.detail, f.fix) : null };
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const now = new Date();
  try {
    const s = await loadSettings(prisma);
    const checks: Check[] = [];
    // each active channel's pipeline and sign-in, with its own settings (a paused channel makes and uploads nothing)
    for (const ch of await activeChannels(prisma, true)) {
      const first = ch.id === CHANNEL_ONE;   // channel #1 kept the plain keys (lib/channel-scopes.ts PLAIN_KEY_CHANNEL)
      const run: ChannelRun = first ? { key: (k) => k, label: "" } : { key: (k) => `${k}:${ch.id}`, label: `${ch.name}: `, channelId: ch.id };
      // a paused channel's pipeline notices close: nothing is expected of it
      if (ch.status !== "active") { checks.push(...PIPELINE_KEYS.map((k) => ({ key: run.key(k), raise: null }))); continue; }
      try {
        checks.push(...(await pipelineChecks(scopedPrisma(prisma, ch.id), now, channelSettings(s, ch.settings), run)));
        const token = await tokenCheck(ch, run);
        if (token) checks.push(token);
      } catch (e) {
        console.error(`::warning::${ch.id}: ${e instanceof Error ? e.message : e}`);   // the other channels' checks still run
      }
    }
    checks.push(agentsPausedCheck(s), await siteCheck(),
      ...agentChecks(now, { research: s.agents.research, improver: s.agents.improver, dashboard: s.agents.dashboard,
                            auditor: s.agents.auditor, scout: s.agents.scout, studio: s.agents.studio }, s.agents.paused));
    const sched = await scheduleCheck(prisma, now);
    if (sched) checks.push(sched);
    const wf = await workflowChecks();
    if (wf) {
      checks.push(...wf);
      await resolveOthers(prisma, "workflow:", new Set(wf.filter((c) => c.raise).map((c) => c.key)));
    }
    for (const c of checks) {
      if (c.raise) await notify(prisma, c.raise);
      else await resolve(prisma, c.key);
    }
    const open = await prisma.notification.count({ where: { resolvedAt: null } });
    console.log(JSON.stringify({ raised: checks.filter((c) => c.raise).map((c) => c.key), open }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  try {
    await main();
  } catch (e) {
    console.error(`::error::${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}
