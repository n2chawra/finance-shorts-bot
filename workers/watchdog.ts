/**
 * Watchdog (hourly): looks for anything that needs the owner and raises it on the dashboard's
 * Notifications page, with what broke, the impact and the exact fix. Every check resolves its own
 * notification once the condition clears, so the page only ever shows what is wrong right now.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { TOKEN_FIX, type Notice, notify, resolve, resolveOthers } from "./lib/notify.ts";
import { istDay } from "./lib/publishing.ts";
import { loadSettings } from "./lib/settings.ts";
import { youtubeConfigured } from "./lib/uploads.ts";
import { TokenError, accessToken } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const HOUR = 3_600_000;
const SITE = process.env.DASHBOARD_URL ?? "https://courageous-granita-bb8b51.netlify.app";
const ROUTINES = "claude.ai → Code → Routines";

type Check = { key: string; raise: Notice | null };

const notice = (key: string, severity: Notice["severity"], title: string, detail: string, fix: string): Notice => ({ key, source: "watchdog", severity, title, detail, fix });

async function pipelineChecks(prisma: PrismaClient, now: Date): Promise<Check[]> {
  const s = await loadSettings(prisma);
  const latest = await prisma.video.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } });
  const hours = latest ? (now.getTime() - latest.createdAt.getTime()) / HOUR : Infinity;
  const today = istDay(now);
  const istHour = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
  const madeToday = await prisma.video.count({ where: { createdAt: { gte: new Date(`${today}T00:00:00+05:30`) } } });
  const backlog = await prisma.video.count({ where: { status: "queued", deletedAt: null } });
  return [
    { key: "no-videos", raise: !s.generationPaused && hours > 26 ? notice("no-videos", "critical", `No new videos for ${Number.isFinite(hours) ? Math.floor(hours) : "many"} hours`,
      "The nightly video run hasn't produced anything. The queue will run dry.",
      `1. Open ${ROUTINES} → Finance Shorts generation and read the latest run.\n2. If it hit the Pro usage limit, nothing to do: the next run continues.\n3. If it errored, paste its report into a Claude Code session in this project.`) : null },
    { key: "made-today-zero", raise: !s.generationPaused && istHour >= 9 && madeToday === 0 && hours <= 26 ? notice("made-today-zero", "warning", "No videos made today yet",
      "The 01:07 IST run made nothing and the 08:37 spare run didn't catch up.", `Check ${ROUTINES} for today's two runs and their reports.`) : null },
    { key: "queue-empty", raise: backlog === 0 && !s.uploadsPaused ? notice("queue-empty", "critical", "The upload queue is empty",
      "The next upload slot has nothing to publish.", "Videos usually arrive overnight. If this lasts past 10:00 IST, check the video runs (see 'No new videos')."): null },
    { key: "backlog-low", raise: s.alerts.lowBacklog && backlog > 0 && backlog < s.alerts.lowBacklogThreshold ? notice("backlog-low", "warning", `Only ${backlog} videos ready`,
      `Fewer than ${s.alerts.lowBacklogThreshold} videos are queued; at two uploads a day that's under ${Math.ceil(backlog / 2)} days.`, "Nothing to do if runs are healthy; it refills by about one a day.") : null },
    { key: "uploads-paused", raise: s.uploadsPaused ? notice("uploads-paused", "info", "Uploads are paused (you post by hand)",
      "The bot uploads nothing while this is on.", "When Google approves the YouTube API audit: Settings → Uploads → turn off 'Pause all uploads'.") : null },
    { key: "agents-paused", raise: s.agents.paused ? notice("agents-paused", "info", "Self-improving agents are paused",
      "Research, improver and dashboard agents do nothing while this is on.", "Settings → Self-improving agents → turn the master switch back on.") : null },
  ];
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

async function tokenCheck(): Promise<Check | null> {
  if (!youtubeConfigured()) return null;
  try {
    await accessToken();
    return { key: "youtube-token", raise: null };
  } catch (e) {
    if (!(e instanceof TokenError)) return null;   // network hiccup: don't raise or resolve
    return { key: "youtube-token", raise: { key: "youtube-token", source: "watchdog", severity: "critical", title: "YouTube sign-in stopped working",
      detail: `Google rejected the stored token: ${e.message}. Uploads and stats are stopped.`, fix: TOKEN_FIX } };
  }
}

/** Latest completed run of each workflow on main: failed → warning, succeeded → resolved. */
async function workflowChecks(): Promise<Check[] | null> {
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return null;
  const res = await fetch(`https://api.github.com/repos/${repo}/actions/runs?branch=main&status=completed&per_page=60`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
  });
  if (!res.ok) return null;
  const runs = ((await res.json()) as { workflow_runs: { name: string; conclusion: string; html_url: string; created_at: string }[] }).workflow_runs;
  const latest = new Map<string, (typeof runs)[number]>();
  for (const r of runs) if (!latest.has(r.name) && r.name !== "Watchdog") latest.set(r.name, r);
  return [...latest.values()].map((r) => {
    const key = `workflow:${r.name}`;
    return { key, raise: r.conclusion === "failure" ? notice(key, "warning", `GitHub Action "${r.name}" failed`, `Its last run (${r.created_at}) failed: ${r.html_url}`,
      "Open the link and read the red step. Often temporary (the next scheduled run fixes it). If it fails twice in a row, paste the log into a Claude Code session.") : null };
  });
}

function agentChecks(now: Date, enabled: Record<string, boolean>, paused: boolean): Check[] {
  const out: Check[] = [];
  const today = istDay(now);
  const istHour = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
  const logFile = path.join(ROOT, "improvement", "merge-log.json");
  const log = existsSync(logFile) ? (JSON.parse(readFileSync(logFile, "utf8")) as { merges: { agent: string; result: string; dayIst: string; reasons: string[]; runUrl: string }[] }).merges : [];
  for (const agent of ["research", "improver", "dashboard"]) {
    const mine = log.filter((m) => m.agent === agent);
    const [prev, last] = mine.slice(-2);
    const blocked = !!prev && !!last && prev.result === "blocked" && last.result === "blocked" && prev.dayIst !== last.dayIst;
    out.push({ key: `agent-blocked:${agent}`, raise: blocked && last ? notice(`agent-blocked:${agent}`, "warning", `The ${agent} agent's changes were blocked twice`,
      `Last reasons: ${last.reasons.join("; ")}`, `Usually the agent fixes this itself next night. If it keeps happening, look at ${last.runUrl} and tell a Claude Code session what you see.`) : null });
    const dir = path.join(ROOT, "improvement", "activity");
    const everReported = existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(`-${agent}.json`));
    const reported = existsSync(path.join(dir, `${today}-${agent}.json`));
    // only once the agent has reported at least once: before its first night there's nothing to miss
    const silent = !paused && enabled[agent] && everReported && istHour >= 10 && !reported;
    out.push({ key: `agent-silent:${agent}`, raise: silent ? notice(`agent-silent:${agent}`, "warning", `The ${agent} agent didn't report last night`,
      "Its routine didn't run, ran out of usage, or failed before writing its activity log.", `Open ${ROUTINES} → the ${agent} agent and read the last run.`) : null });
  }
  return out;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const now = new Date();
  try {
    const s = await loadSettings(prisma);
    const token = await tokenCheck();
    const checks: Check[] = [...(await pipelineChecks(prisma, now)), await siteCheck(), ...(token ? [token] : []),
      ...agentChecks(now, { research: s.agents.research, improver: s.agents.improver, dashboard: s.agents.dashboard }, s.agents.paused)];
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
