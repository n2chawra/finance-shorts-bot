/**
 * The posting plan: which queued video goes in which upload slot, per format, by the upload job's
 * own rules (workers/publish.ts): Shorts at `uploadTimes` every day plus `trendUploadTimes`, extra
 * slots that open only on a day with a breaking or trending video (each one opens one; it takes that
 * video, or the next video if the trend already went out earlier; on a quiet day they don't appear), long videos at
 * `longUploadTimes` on `longUploadDays`, one video per slot, each format from its own queue in queue
 * order. While uploads are paused the owner posts by hand, so a slot counts as filled once a video
 * of that format was posted within three hours of it, and a slot that passed today without one is
 * missed.
 */
import type { Settings, Video } from "./schemas";

export type Format = "short" | "long";
export type PlanSlot = {
  at: number;                               // the slot's instant (ms)
  format: Format;
  state: "missed" | "due" | "upcoming";     // due: post now (from 15 min before the slot until 2 h after)
  video: Video | null;                      // null: nothing ready for this slot
  stale: boolean;                           // a breaking/trending video whose urgency ends before this slot
  trend: boolean;                           // an extra slot only a breaking/trending video takes
};
type SlotSettings = Pick<Settings, "uploadTimes" | "trendUploadTimes" | "longUploadTimes" | "longUploadDays">;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const FILLED_WITHIN = 3 * HOUR;
const DUE_BEFORE = 15 * 60_000;
const LATE_UNTIL = 2 * HOUR;
const istDayOf = (ms: number) => new Date(ms + 330 * 60_000).toISOString().slice(0, 10);
const istWeekday = (ms: number) => new Date(ms + 330 * 60_000).getUTCDay();   // 0 = Sunday

export function slotRule(format: Format, s: SlotSettings) {
  return format === "short" ? { times: s.uploadTimes, trend: s.trendUploadTimes, days: null } : { times: s.longUploadTimes, trend: [] as string[], days: s.longUploadDays };
}

/** Whether a video is breaking or trending news still current on IST day `day`. */
const urgentOn = (v: Video, day: string) => Boolean(v.style.source?.urgent && v.style.source.urgent.until >= day);

/** Today's and the coming slots of one format: missed ones from today, then one per queued video
 * (plus one empty slot, so a gap shows), oldest first. */
export function postingPlan(format: Format, queue: Video[], posted: Video[], settings: SlotSettings, now = Date.now()): PlanSlot[] {
  const { times, trend, days } = slotRule(format, settings);
  const trendTimes = new Set(trend.filter((t) => !times.includes(t)));
  const sorted = [...new Set([...times, ...trendTimes])].sort();
  if (!times.length || (days && !days.length)) return [];
  const remaining = queue.filter((v) => v.format === format);
  const postedAt = posted.filter((v) => v.format === format && v.upload).map((v) => Date.parse(v.upload!.publishAt));
  const today = istDayOf(now);
  const out: PlanSlot[] = [];
  let empty = 0;
  for (let d = 0; d < 400 && (remaining.length || empty < 1); d++) {
    const day = istDayOf(Date.parse(`${today}T12:00:00+05:30`) + d * DAY);
    let urgentToday = 0, trendUsed = 0;
    for (const t of sorted) {
      const at = Date.parse(`${day}T${t}:00+05:30`);
      const isTrend = trendTimes.has(t);
      if (days && !days.includes(istWeekday(at))) continue;
      if (postedAt.some((p) => Math.abs(p - at) <= FILLED_WITHIN)) continue;
      if (at < now - LATE_UNTIL) {
        if (day === today && !isTrend) out.push({ at, format, state: "missed", video: null, stale: false, trend: false });
        continue;
      }
      let video: Video | null;
      if (isTrend) {
        // a trend slot opens for each breaking or trending video of the day; on a quiet day it doesn't appear
        const i = remaining.findIndex((v) => urgentOn(v, day));
        if (i >= 0) { video = remaining.splice(i, 1)[0]; urgentToday++; }
        else if (urgentToday > trendUsed && remaining.length) video = remaining.shift()!;
        else continue;
        trendUsed++;
      } else {
        video = remaining.shift() ?? null;
        if (video && urgentOn(video, day)) urgentToday++;
        if (!video && ++empty > 1) break;
      }
      const until = video?.style.source?.urgent?.until;
      out.push({ at, format, state: at <= now + DUE_BEFORE ? "due" : "upcoming", video, stale: Boolean(until && until < istDayOf(at)), trend: isTrend });
    }
  }
  return out;
}

/** Which routine made a video, from when it was made (IST): the runs' schedule in CLAUDE.md. */
export function madeBy(v: Pick<Video, "format" | "createdAt">): string {
  if (v.format === "long") return "Studio";
  const t = new Date(Date.parse(v.createdAt) + 330 * 60_000);
  const h = t.getUTCHours() + t.getUTCMinutes() / 60;
  if (h >= 4 && h < 9) return "Main run";
  if (h >= 9 && h < 11.5) return "Spare run";
  if (h >= 11.5 && h < 15) return "Trend run";
  return "Extra run";
}

/** How many days of posting the queue holds, and how it moves: runs make `madePerDay`. */
export function runway(format: Format, queue: Video[], settings: SlotSettings) {
  const { times, days } = slotRule(format, settings);
  const perWeek = new Set(times).size * (days ? new Set(days).size : 7);
  const n = queue.filter((v) => v.format === format).length;
  return { n, perWeek, days: perWeek ? Math.floor((n / perWeek) * 7) : null };
}
