/**
 * All channels at a glance (owner, 2026-11-19: "a dashboard right after login … which channel is doing
 * great or not"). Every channel's numbers from the database, unscoped (lib/portfolio.db.ts), with the
 * verdict computed here in code. Shown on /portfolio, the page the dashboard opens on after sign-in.
 */
import { z } from "zod";

const n = z.number().nullable();

export const PortfolioVideoSchema = z.object({
  id: z.string(), title: z.string(), format: z.string(), publishAt: z.string(), youtubeId: z.string().nullable(),
  /** lifetime views: YouTube's live counter when known, else Analytics */
  views: z.number(),
  /** engaged views ÷ views (Analytics); null for long videos or before any stats */
  stayed: n,
});
export type PortfolioVideo = z.infer<typeof PortfolioVideoSchema>;

export const VERDICTS = ["Growing", "Flat", "Falling", "Too early", "Setting up"] as const;
export type VerdictCall = (typeof VERDICTS)[number];

export const PortfolioChannelSchema = z.object({
  id: z.string(), name: z.string(), status: z.string(),
  /** a channel still in setup: its stage ("research", "samples"…) */
  stage: z.string().nullable(),
  health: z.object({ color: z.enum(["green", "amber", "red"]), reason: z.string(), at: z.string().nullish() }).nullable().catch(null),
  /** the last day YouTube Analytics has reached for this channel */
  statsThrough: z.string().nullable(),
  /** net subscribers from Analytics over the last 12 months (the platform keeps no lifetime counter) */
  subs: n, subs7: n, subsPrev7: n, subs28: n,
  views7: n, viewsPrev7: n, views28: n,
  /** daily views, the 28 days ending at statsThrough */
  spark: z.array(z.number()),
  published7: z.number(), publishedTotal: z.number(), firstPublishAt: z.string().nullable(),
  /** median lifetime views of the Shorts published 2–14 days ago, and of those 15–42 days ago (the baseline) */
  medianShort14: n, medianShortBase: n, shorts14: z.number(),
  /** Shorts' engaged ÷ views, and average % viewed, over the 28 days to statsThrough */
  stayed28: n, pctShort28: n, pctLong28: n,
  /** average lifetime views of the Shorts published in the last 28 days */
  viewsPerShort: n,
  /** net subscribers per 1,000 views over 28 days */
  subsPer1k: n,
  best7: PortfolioVideoSchema.nullable(),
  top14: z.array(PortfolioVideoSchema),
  backlog: z.object({ short: z.number(), long: z.number() }),
  nextUpload: z.object({ at: z.string(), kind: z.enum(["scheduled", "slot"]), title: z.string().nullable(), format: z.string().nullable() }).nullable(),
  uploadsPaused: z.boolean(),
  loop: z.object({
    running: z.string().nullable(), description: z.string().nullable(), cycle: n,
    lastVerdict: z.object({ id: z.string(), verdict: z.string(), test: z.string().nullable() }).nullable(),
  }).nullable().catch(null),   // agents' docs: a bad shape shows "between tests", never an error page (2026-11-22)
  ypp: z.object({ subs: n, watchHoursLong365: n, shortsViews90: n }),
  verdict: z.object({ call: z.enum(VERDICTS), why: z.string() }),
});
export type PortfolioChannel = z.infer<typeof PortfolioChannelSchema>;

export const PortfolioSchema = z.object({
  source: z.enum(["sample", "database"]),
  generatedAt: z.string(),
  /** the comparison chart's days (28, ending at the latest day any channel's stats reached) */
  days: z.array(z.string()),
  /** per channel id, that channel's views on each of `days` (null: no data for that day yet) */
  daily: z.record(z.string(), z.array(n)),
  channels: z.array(PortfolioChannelSchema),
  /** "Today across all channels", one entry per live channel (TodaySchema, below) */
  today: z.array(z.lazy(() => TodaySchema)).default([]),
});
export type Portfolio = z.infer<typeof PortfolioSchema>;

/** The running test's id from a weekly-loop doc: `running` is meant to be the id, but on 21 Nov the improver wrote the
 * whole challenger entry there and the All channels page failed to load. Either form gives the id; anything else null. */
export function runningId(x: unknown): string | null {
  if (typeof x === "string") return x || null;
  if (x && typeof x === "object" && typeof (x as { id?: unknown }).id === "string") return (x as { id: string }).id || null;
  return null;
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const pct = (r: number) => `${r >= 1 ? "+" : ""}${Math.round((r - 1) * 100)}%`;

/**
 * Growing / Flat / Falling / Too early, from three signals: views in the last 7 days against the 7
 * before, net subscribers likewise, and the median Short of the last 14 days against the channel's own
 * baseline (Shorts 15–42 days old). Each signal is +1 past +15%, −1 past −15%; two agreeing (or views
 * with a third neutral) decide. Under 10 published videos or 14 days live it is too early to tell.
 */
export function verdictOf(c: {
  publishedTotal: number; daysLive: number | null; views7: number | null; viewsPrev7: number | null;
  subs7: number | null; subsPrev7: number | null; medianShort14: number | null; medianShortBase: number | null;
}): { call: VerdictCall; why: string } {
  if (c.publishedTotal < 10 || c.daysLive === null || c.daysLive < 14)
    return { call: "Too early", why: `${c.publishedTotal} published${c.daysLive === null ? "" : `, ${c.daysLive} day${c.daysLive === 1 ? "" : "s"} live`}; a trend needs 10 videos and 2 weeks` };
  const why: string[] = [];
  let views = 0, score = 0;
  if (c.views7 !== null && c.viewsPrev7 !== null && c.viewsPrev7 > 0) {
    const r = c.views7 / c.viewsPrev7;
    views = r >= 1.15 ? 1 : r <= 0.85 ? -1 : 0;
    why.push(`views ${pct(r)} week on week`);
  } else if (c.views7 && !c.viewsPrev7) { views = 1; why.push("first views this week"); }
  score += views;
  if (c.subs7 !== null && c.subsPrev7 !== null && (c.subs7 !== 0 || c.subsPrev7 !== 0)) {
    const d = c.subs7 - c.subsPrev7;
    const big = Math.abs(d) >= 2 && Math.abs(d) >= 0.15 * Math.max(Math.abs(c.subsPrev7), 1);
    score += big ? Math.sign(d) : 0;
    why.push(`subs ${c.subs7 >= 0 ? "+" : ""}${c.subs7} vs ${c.subsPrev7 >= 0 ? "+" : ""}${c.subsPrev7}`);
  }
  if (c.medianShort14 !== null && c.medianShortBase !== null && c.medianShortBase > 0) {
    const r = c.medianShort14 / c.medianShortBase;
    score += r >= 1.15 ? 1 : r <= 0.85 ? -1 : 0;
    why.push(`median Short ${Math.round(c.medianShort14)} vs ${Math.round(c.medianShortBase)} baseline`);
  }
  const call: VerdictCall = score >= 2 || (score === 1 && views === 1) ? "Growing" : score <= -2 || (score === -1 && views === -1) ? "Falling" : "Flat";
  return { call, why: why.length ? why.join(" · ") : "not enough recent data to compare" };
}

/** "Today across all channels": one channel's upload slots for today (IST) and its views in the last 24 h. */
export const TodaySlotSchema = z.object({
  /** the slot (or the upload's own publishAt when it sits on no slot) */
  at: z.string(),
  format: z.string(),
  state: z.enum(["posted", "next", "later", "missed", "paused"]),
  title: z.string().nullable(), youtubeId: z.string().nullable(),
  /** lifetime views so far (live counter), posted uploads only */
  views: n,
});
export type TodaySlot = z.infer<typeof TodaySlotSchema>;
export const TodaySchema = z.object({
  channelId: z.string(),
  /** views across all of the channel's videos in the last 24 h, from the hourly public-counter snapshots */
  views24h: n,
  slots: z.array(TodaySlotSchema),
});
export type Today = z.infer<typeof TodaySchema>;

export type TodayUpload = { publishAt: number; state: string; youtubeId: string | null; title: string; format: string; views: number | null };

const IST = 330 * 60_000;
/** today's IST date ("2026-11-19") and weekday (0 = Sunday) */
export const istToday = (now: number) => { const d = new Date(now + IST); return { day: d.toISOString().slice(0, 10), weekday: d.getUTCDay() }; };

/**
 * Today's slots for one channel: every Shorts slot of the day (and the long slots on a long day), each
 * matched to the upload published within 30 minutes of it, plus any of today's uploads on no slot.
 * Posted: live on YouTube. Missed: the slot passed with nothing live (or its upload failed). The first
 * future slot is "next", the rest "later"; paused uploads turn future slots "paused".
 */
export function todaySlots(now: number, s: { uploadTimes: string[]; longUploadTimes: string[]; longUploadDays: number[]; uploadsPaused: boolean; live: boolean }, uploads: TodayUpload[]): TodaySlot[] {
  if (!s.live) return [];
  const { day, weekday } = istToday(now);
  const at = (t: string) => Date.parse(`${day}T${t}:00+05:30`);
  const planned: { at: number; format: string }[] = [
    ...[...new Set(s.uploadTimes)].map((t) => ({ at: at(t), format: "short" })),
    ...(s.longUploadDays.includes(weekday) ? [...new Set(s.longUploadTimes)].map((t) => ({ at: at(t), format: "long" })) : []),
  ].filter((p) => Number.isFinite(p.at));
  const left = [...uploads];
  const rows = planned.map((p) => {
    const i = left.findIndex((u) => u.format === p.format && Math.abs(u.publishAt - p.at) <= 30 * 60_000);
    return { ...p, u: i >= 0 ? left.splice(i, 1)[0] : undefined };
  });
  for (const u of left) if (istToday(u.publishAt).day === day) rows.push({ at: u.publishAt, format: u.format, u });
  rows.sort((a, b) => a.at - b.at);
  let nextGiven = false;
  return rows.map(({ at: t, format, u }) => {
    const posted = !!u && !!u.youtubeId && u.publishAt <= now && u.state !== "failed";
    let state: TodaySlot["state"];
    if (posted) state = "posted";
    else if (t <= now || u?.state === "failed") state = "missed";
    else if (s.uploadsPaused && !u) state = "paused";
    else { state = nextGiven ? "later" : "next"; nextGiven = true; }
    return { at: new Date(t).toISOString(), format, state, title: u?.title ?? null, youtubeId: u?.youtubeId ?? null, views: posted ? u!.views : null };
  });
}
