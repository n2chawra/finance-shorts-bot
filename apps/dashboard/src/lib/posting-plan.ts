/**
 * The posting plan: which queued video goes in which upload slot, per format, by the upload job's
 * own rules (workers/publish.ts): Shorts at `uploadTimes` every day, long videos at
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
};

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const FILLED_WITHIN = 3 * HOUR;
const DUE_BEFORE = 15 * 60_000;
const LATE_UNTIL = 2 * HOUR;
const istDayOf = (ms: number) => new Date(ms + 330 * 60_000).toISOString().slice(0, 10);
const istWeekday = (ms: number) => new Date(ms + 330 * 60_000).getUTCDay();   // 0 = Sunday

export function slotRule(format: Format, s: Pick<Settings, "uploadTimes" | "longUploadTimes" | "longUploadDays">) {
  return format === "short" ? { times: s.uploadTimes, days: null } : { times: s.longUploadTimes, days: s.longUploadDays };
}

/** Today's and the coming slots of one format: missed ones from today, then one per queued video
 * (plus one empty slot, so a gap shows), oldest first. */
export function postingPlan(format: Format, queue: Video[], posted: Video[], settings: Pick<Settings, "uploadTimes" | "longUploadTimes" | "longUploadDays">,
                            now = Date.now()): PlanSlot[] {
  const { times, days } = slotRule(format, settings);
  const sorted = [...new Set(times)].sort();
  if (!sorted.length || (days && !days.length)) return [];
  const mine = queue.filter((v) => v.format === format);
  const postedAt = posted.filter((v) => v.format === format && v.upload).map((v) => Date.parse(v.upload!.publishAt));
  const today = istDayOf(now);
  const out: PlanSlot[] = [];
  let next = 0, empty = 0;
  for (let d = 0; d < 400 && (next < mine.length || empty < 1); d++) {
    const day = istDayOf(Date.parse(`${today}T12:00:00+05:30`) + d * DAY);
    for (const t of sorted) {
      const at = Date.parse(`${day}T${t}:00+05:30`);
      if (days && !days.includes(istWeekday(at))) continue;
      if (postedAt.some((p) => Math.abs(p - at) <= FILLED_WITHIN)) continue;
      if (at < now - LATE_UNTIL) {
        if (day === today) out.push({ at, format, state: "missed", video: null, stale: false });
        continue;
      }
      const video = mine[next] ?? null;
      if (video) next++; else if (++empty > 1) break;
      const until = video?.style.source?.urgent?.until;
      out.push({ at, format, state: at <= now + DUE_BEFORE ? "due" : "upcoming", video, stale: Boolean(until && until < istDayOf(at)) });
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
export function runway(format: Format, queue: Video[], settings: Pick<Settings, "uploadTimes" | "longUploadTimes" | "longUploadDays">) {
  const { times, days } = slotRule(format, settings);
  const perWeek = new Set(times).size * (days ? new Set(days).size : 7);
  const n = queue.filter((v) => v.format === format).length;
  return { n, perWeek, days: perWeek ? Math.floor((n / perWeek) * 7) : null };
}
