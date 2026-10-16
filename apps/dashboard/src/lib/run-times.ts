/** Run times of the nightly routines: from the agents' own start/finish stamps and the video steps' AgentRun times. */
import type { Activity, VideoRun } from "./schemas";

const MIN = 60_000;
/** videos whose windows are further apart than this belong to different runs (04:07 main vs 09:07 spare) */
const RUN_GAP_MIN = 60;

const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
const clockFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export const minutesBetween = (start: string | Date, end: string | Date): number =>
  Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / MIN));

/** "23:04–23:51 IST, 47 min" */
export function fmtRunWindow(start: string, end: string): string {
  return `${clockFmt.format(new Date(start))}–${clockFmt.format(new Date(end))} IST, ${fmtMinutes(minutesBetween(start, end))}`;
}

export function fmtMinutes(min: number): string {
  return min >= 120 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
}

/** One window per video (first step start to last step end), then videos grouped into runs by gaps. */
export function clusterVideoRuns(steps: { videoId: string; start: Date; end: Date }[]): VideoRun[] {
  const perVideo = new Map<string, { start: number; end: number }>();
  for (const s of steps) {
    const w = perVideo.get(s.videoId);
    const a = s.start.getTime(), b = Math.max(a, s.end.getTime());
    if (!w) perVideo.set(s.videoId, { start: a, end: b });
    else { w.start = Math.min(w.start, a); w.end = Math.max(w.end, b); }
  }
  const runs: { start: number; end: number; videos: number }[] = [];
  for (const w of [...perVideo.values()].sort((x, y) => x.start - y.start)) {
    const last = runs.at(-1);
    if (last && w.start - last.end <= RUN_GAP_MIN * MIN) { last.end = Math.max(last.end, w.end); last.videos++; }
    else runs.push({ ...w, videos: 1 });
  }
  return runs.map((r) => ({ day: dayFmt.format(new Date(r.start)), start: new Date(r.start).toISOString(), end: new Date(r.end).toISOString(), videos: r.videos }));
}

export type RunTimeRow = { key: string; name: string; last: { day: string; start: string; end: string; min: number; note?: string } | null; avg: number | null; max: number | null; nights: number };

const stats = (mins: number[]) => (mins.length ? { avg: Math.round(mins.reduce((a, b) => a + b, 0) / mins.length), max: Math.max(...mins) } : { avg: null, max: null });

/** Per agent and for the video runs: last night, then average and max over the last 7 nights with times. */
export function summarizeRunTimes(activity: Activity[], videoRuns: VideoRun[], names: Record<Activity["agent"], string>): RunTimeRow[] {
  const rows: RunTimeRow[] = (Object.keys(names) as Activity["agent"][]).map((agent) => {
    const timed = activity
      .filter((a) => a.agent === agent && a.startedAt && a.finishedAt)
      .sort((x, y) => y.day.localeCompare(x.day))
      .slice(0, 7);
    const last = timed[0];
    return {
      key: agent, name: names[agent], nights: timed.length,
      last: last ? { day: last.day, start: last.startedAt!, end: last.finishedAt!, min: minutesBetween(last.startedAt!, last.finishedAt!) } : null,
      ...stats(timed.map((a) => minutesBetween(a.startedAt!, a.finishedAt!))),
    };
  });
  const days = [...new Set(videoRuns.map((r) => r.day))].sort().reverse().slice(0, 7);
  const recent = videoRuns.filter((r) => days.includes(r.day));
  const latestDay = days[0];
  const night = recent.filter((r) => r.day === latestDay).sort((x, y) => x.start.localeCompare(y.start));
  rows.push({
    key: "video", name: "Video runs", nights: days.length,
    last: night.length ? { day: latestDay!, start: night[0]!.start, end: night.at(-1)!.end, min: night.reduce((a, r) => a + minutesBetween(r.start, r.end), 0),
      note: `${night.reduce((a, r) => a + r.videos, 0)} videos in ${night.length} run${night.length > 1 ? "s" : ""}` } : null,
    ...stats(recent.map((r) => minutesBetween(r.start, r.end))),
  });
  return rows;
}
