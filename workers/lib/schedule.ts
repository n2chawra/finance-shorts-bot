/**
 * The routine schedule and the overlap check. Routines run on the Claude Pro plan's 5-hour usage
 * windows (see CLAUDE.md), so a run that outlasts its slot eats into the next one and the video run
 * may no longer start a fresh window. Times are IST (UTC+5:30); keep this list in step with the
 * cron lines of the routines at claude.ai → Code → Routines.
 */
export type RunId = "auditor" | "research" | "video-main" | "improver" | "dashboard" | "video-spare";

/** In order of the night: window A (23:00, 23:47), window B (04:07, 06:17, 07:37), window C (09:07). */
export const SCHEDULE: readonly { id: RunId; label: string; ist: string }[] = [
  { id: "auditor", label: "Auditor", ist: "23:00" },
  { id: "research", label: "Research", ist: "23:47" },
  { id: "video-main", label: "Video main run", ist: "04:07" },
  { id: "improver", label: "Improver", ist: "06:17" },
  { id: "dashboard", label: "Dashboard", ist: "07:37" },
  { id: "video-spare", label: "Video spare run", ist: "09:07" },
];

export const MAX_VIDEO_MAIN_MIN = 180;
const MIN = 60_000, DAY = 86_400_000, IST_OFFSET = 330 * MIN;

export type ObservedRun = { id: RunId; start: Date; finish: Date };
export type ScheduleFinding = { title: string; detail: string; fix: string };

const entry = (id: RunId) => SCHEDULE.find((s) => s.id === id)!;
const clockMin = (ist: string): number => Number(ist.slice(0, 2)) * 60 + Number(ist.slice(3));

/** The instant (ms) of `ist` clock time on the IST calendar day `dayOffset` days from `ref`'s IST day. */
function instant(ist: string, ref: Date, dayOffset: number): number {
  const istDayStart = Math.floor((ref.getTime() + IST_OFFSET) / DAY) * DAY - IST_OFFSET;
  return istDayStart + dayOffset * DAY + clockMin(ist) * MIN;
}

/** Scheduled instant of `id` closest to `near` (a run's actual start, up to ~5 min late). */
function scheduledNear(id: RunId, near: Date): number {
  return [-1, 0, 1].map((d) => instant(entry(id).ist, near, d)).reduce((a, b) => (Math.abs(b - near.getTime()) < Math.abs(a - near.getTime()) ? b : a));
}

/** First scheduled instant of `id` strictly after `after` (ms). */
function nextInstant(id: RunId, after: number): number {
  return [-1, 0, 1, 2].map((d) => instant(entry(id).ist, new Date(after), d)).filter((t) => t > after).sort((a, b) => a - b)[0]!;
}

const hhmm = (ms: number) => new Date(ms + IST_OFFSET).toISOString().slice(11, 16);
const mins = (ms: number) => Math.round(ms / MIN);
/** finish + 10 min, rounded up to 5 min, as an IST clock time */
const suggestStart = (finish: number) => hhmm(Math.ceil((finish + 10 * MIN) / (5 * MIN)) * 5 * MIN);

/** Which video run is this: the one scheduled nearest to its start. */
export function videoRunId(start: Date): "video-main" | "video-spare" {
  const d = (id: RunId) => Math.abs(scheduledNear(id, start) - start.getTime());
  return d("video-main") <= d("video-spare") ? "video-main" : "video-spare";
}

/**
 * One finding for last night's runs, or null when all is well. Raised when:
 *  - a run finished after the next scheduled run's start (they shared a usage window or ran together),
 *  - the video main run finished after the spare run's start (09:07), or
 *  - the video main run took more than 3 hours.
 */
export function scheduleOverlap(runs: ObservedRun[]): ScheduleFinding | null {
  const lines: string[] = [];
  const fixes: string[] = [];
  for (const r of runs) {
    const startMs = scheduledNear(r.id, r.start);
    const idx = SCHEDULE.findIndex((s) => s.id === r.id);
    const next = SCHEDULE[(idx + 1) % SCHEDULE.length]!;
    const nextStart = nextInstant(next.id, startMs);
    const took = mins(r.finish.getTime() - r.start.getTime());
    const run = `${entry(r.id).label} ran ${hhmm(r.start.getTime())}–${hhmm(r.finish.getTime())} IST (${took} min)`;
    if (r.finish.getTime() > nextStart) {
      lines.push(`${run}, ${mins(r.finish.getTime() - nextStart)} min past the ${next.label}'s start at ${next.ist}.`);
      fixes.push(r.id === "video-main"
        ? `Shorten the video run (fewer rewrites, leaner reviews) rather than moving it: it must start at ${entry("video-main").ist} to open a fresh usage window.`
        : `Move the ${next.label} from ${next.ist} to ${suggestStart(r.finish.getTime())} IST (or shorten the ${entry(r.id).label}); check it still ends before the run after it.`);
    }
    if (r.id === "video-main") {
      const spare = nextInstant("video-spare", startMs);
      if (r.finish.getTime() > spare) {
        lines.push(`${run}: after the spare run's start at ${entry("video-spare").ist}, so the spare could not rescue a shortfall.`);
        fixes.push(`Move the Video spare run from ${entry("video-spare").ist} to ${suggestStart(r.finish.getTime())} IST, or shorten the main run.`);
      }
      if (took > MAX_VIDEO_MAIN_MIN) {
        lines.push(`${run}: over the ${MAX_VIDEO_MAIN_MIN / 60} h limit for the video main run.`);
        fixes.push(`Find what slowed the main run (rewrites, failed renders) in claude.ai → Code → Routines → Video main run, and trim it.`);
      }
    }
  }
  if (!lines.length) return null;
  return {
    title: "A routine overran its slot",
    detail: lines.join("\n"),
    fix: [...new Set(fixes)].map((f, i) => `${i + 1}. ${f}`).join("\n") + "\nSchedules are changed at claude.ai → Code → Routines; then update SCHEDULE in workers/lib/schedule.ts.",
  };
}

/** Group per-video step windows into runs: videos separated by more than `gapMin` start a new run. */
export function clusterRuns(steps: { videoId: string; start: Date; end: Date }[], gapMin = 60): { start: Date; finish: Date; videos: number }[] {
  const perVideo = new Map<string, { s: number; e: number }>();
  for (const x of steps) {
    const w = perVideo.get(x.videoId), a = x.start.getTime(), b = Math.max(a, x.end.getTime());
    if (!w) perVideo.set(x.videoId, { s: a, e: b }); else { w.s = Math.min(w.s, a); w.e = Math.max(w.e, b); }
  }
  const runs: { s: number; e: number; videos: number }[] = [];
  for (const w of [...perVideo.values()].sort((x, y) => x.s - y.s)) {
    const last = runs.at(-1);
    if (last && w.s - last.e <= gapMin * MIN) { last.e = Math.max(last.e, w.e); last.videos++; } else runs.push({ ...w, videos: 1 });
  }
  return runs.map((r) => ({ start: new Date(r.s), finish: new Date(r.e), videos: r.videos }));
}
