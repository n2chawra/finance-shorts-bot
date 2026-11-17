/**
 * The routine schedule for many channels (docs/plans/multi-channel.md, "Routine timings"). Pure: the
 * dashboard uses it for the fit check on Launch, and `npm run routines` (workers) prints the routines and
 * their prompts for the /new-channel skill to create. Times are IST.
 *
 *   window A 23:00–04:00  auditor (shared), research per channel every 25 min, done by 02:30
 *   window B from 04:07   video runs per channel every 40 min (4 fit), then the improver, the dashboard agent
 *   window C from 09:07   the shared spare run (40 min later for each video run moved here), Studio, Scout
 *   free gap 12:00–20:30  setup research on the owner's PC; window D: reviewers from 21:07 every 30 min
 * GitHub's market scan runs at 22:17, 10 min apart per channel. Channels' upload slots stay ≥ 20 min apart.
 */

export type PlanChannel = {
  id: string; name: string;
  shortsPerDay: number; longPerWeek: number;
  /** IST "HH:MM" upload slots for Shorts and long videos */
  uploadTimes: string[]; longUploadTimes?: string[];
};

export type Routine = "auditor" | "research" | "video" | "improver" | "dashboard" | "spare" | "studio" | "scout" | "reviewer" | "monthly" | "market";
export type Slot = {
  routine: Routine; channel: string | null; ist: string;
  /** when it runs: "daily", weekdays like "Mon,Wed", or "1st" (of the month) */
  days: string; window: "A" | "B" | "C" | "D" | "GitHub";
  /** the cron line in UTC */
  cron: string;
};
export type RoutinePlan = { slots: Slot[]; problems: string[] };

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h! * 60 + m!; };
const fmt = (min: number) => { const m = ((min % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** IST time and days → a UTC cron line (IST is UTC+5:30; a time before 05:30 IST is the previous UTC day). */
export function cronOf(ist: string, days: string): string {
  const utc = toMin(ist) - 330, back = utc < 0;
  const m = (utc + 1440) % 1440;
  const dow = days === "daily" || days === "1st" ? "*" : days.split(",").map((d) => (DOW[d]! + (back ? 6 : 0)) % 7).join(",");
  const dom = days === "1st" ? (back ? "L" : "1") : "*";
  return `${m % 60} ${Math.floor(m / 60)} ${dom === "L" ? "*" : dom} * ${dow}`;
}

const slot = (routine: Routine, channel: string | null, ist: number, days: string, window: Slot["window"]): Slot =>
  ({ routine, channel, ist: fmt(ist), days, window, cron: cronOf(fmt(ist), days) });

export const LIMITS = { researchDone: toMin("02:30"), videoB: 4, freeGap: toMin("12:00"), auditor: toMin("23:00"), uploadGapMin: 20 };

/** Every routine for these channels, channel #1 first, in the order they were added. */
export function planRoutines(channels: PlanChannel[]): RoutinePlan {
  const slots: Slot[] = [], problems: string[] = [];
  slots.push(slot("auditor", null, toMin("23:00"), "daily", "A"));
  channels.forEach((c, i) => {
    const at = toMin("23:47") + 25 * i;
    slots.push(slot("research", c.id, at, "daily", "A"));
    if ((at % 1440) > LIMITS.researchDone && (at % 1440) < toMin("12:00")) problems.push(`${c.name}: research would start at ${fmt(at)}, after 02:30 (window A is full)`);
  });
  const making = channels.filter((c) => c.shortsPerDay > 0 || c.longPerWeek > 0);
  let lastB = toMin("04:07") - 40, inC = 0;
  making.forEach((c, i) => {
    if (i < LIMITS.videoB) { lastB = toMin("04:07") + 40 * i; slots.push(slot("video", c.id, lastB, "daily", "B")); }
    else slots.push(slot("video", c.id, toMin("09:07") + 40 * inC++, "daily", "C"));
  });
  const improver = Math.max(toMin("06:17"), lastB + 40);
  slots.push(slot("improver", null, improver, "daily", "B"));
  slots.push(slot("dashboard", null, improver + 80, "Sun", "B"));
  const spare = toMin("09:07") + 40 * inC;
  slots.push(slot("spare", null, spare, "daily", "C"));
  if (spare + 40 > LIMITS.freeGap) problems.push(`the spare run would start at ${fmt(spare)} and run into the 12:00 free gap: too many channels for windows B and C`);
  channels.filter((c) => c.longPerWeek > 0).forEach((c, j) => {
    slots.push(slot("studio", c.id, toMin("08:05") + 45 * j, "Mon,Wed", "C"));
    slots.push(slot("scout", c.id, toMin("09:37") + 30 * j, "Mon,Thu", "C"));
  });
  // three reviewers fit 21:07–23:00 before the auditor; the next three take Wed/Sat, then Thu/Sun
  const REVIEW_DAYS = ["Tue,Fri", "Wed,Sat", "Thu,Sun"];
  channels.filter((c) => c.shortsPerDay > 0).forEach((c, k) => {
    const at = toMin("21:07") + 30 * (k % 3);
    const days = REVIEW_DAYS[Math.floor(k / 3)];
    if (!days) { problems.push(`${c.name}: no reviewer slot left (nine channels review in window D)`); return; }
    slots.push(slot("reviewer", c.id, at, days, "D"));
  });
  slots.push(slot("monthly", null, toMin("12:07"), "1st", "C"));
  channels.forEach((c, i) => slots.push(slot("market", c.id, toMin("22:17") + 10 * i, "daily", "GitHub")));
  problems.push(...uploadClashes(channels));
  return { slots, problems };
}

/** Pairs of upload slots from different channels under 20 minutes apart. */
export function uploadClashes(channels: PlanChannel[]): string[] {
  const all = channels.flatMap((c) => [...c.uploadTimes, ...(c.longUploadTimes ?? [])].map((t) => ({ c, t: toMin(t) })));
  const out: string[] = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i]!, b = all[j]!;
    const gap = Math.min(Math.abs(a.t - b.t), 1440 - Math.abs(a.t - b.t));
    if (a.c.id !== b.c.id && gap < LIMITS.uploadGapMin) out.push(`${a.c.name} uploads at ${fmt(a.t)} and ${b.c.name} at ${fmt(b.t)}: keep different channels ${LIMITS.uploadGapMin}+ minutes apart`);
  }
  return out;
}

/** Whether `next` fits next to the live channels: the problems adding it creates (none = it fits). */
export function fitCheck(live: PlanChannel[], next: PlanChannel): { fits: boolean; problems: string[]; slots: Slot[]; moved: { routine: Routine; from: string; to: string; cron: string }[] } {
  const was = planRoutines(live);
  const before = new Set(was.problems);
  const after = planRoutines([...live.filter((c) => c.id !== next.id), next]);
  const problems = after.problems.filter((p) => !before.has(p));
  // shared routines the new channel pushes later (the improver, the spare run): their routines must be edited too
  const moved = after.slots.filter((s) => s.channel === null).flatMap((s) => {
    const old = was.slots.find((o) => o.channel === null && o.routine === s.routine && o.days === s.days);
    return old && old.ist !== s.ist ? [{ routine: s.routine, from: old.ist, to: s.ist, cron: s.cron }] : [];
  });
  return { fits: problems.length === 0, problems, slots: after.slots.filter((s) => s.channel === next.id), moved };
}

/** The routine's prompt (claude.ai → Code → Routines): the channel is named so every command uses it. */
export function promptFor(s: Slot): string {
  const ch = s.channel ? ` for the channel \`${s.channel}\`` : " for every channel";
  const channelLine = s.channel ? `\n\nThis run is for CHANNEL=${s.channel}: export it, and pass \`--channel ${s.channel}\` to every \`python -m generator.run\` command. Read and write only \`channels/${s.channel}/\` and shared code.` : "";
  const body: Record<Routine, string> = {
    video: "Read `generator/prompts/routine.md` and do one generation run",
    spare: "Read `generator/prompts/routine.md` and do the spare run: the channel whose ready buffer is shortest first (config/channels.json), else idle",
    research: "Read `agents/policy.md`, then `agents/research.md`, and do tonight's research",
    studio: "Read `agents/policy.md`, then `agents/studio.md`, and do the long-video run",
    scout: "Read `agents/policy.md`, then `agents/scout.md`, and do the long-video topic scan",
    reviewer: "Read `agents/policy.md`, then `agents/reviewer.md`, and review the recent Shorts",
    auditor: "Read `agents/policy.md`, then `agents/auditor.md`, and do tonight's audit",
    improver: "Read `agents/policy.md`, then `agents/improver.md`, and do this morning's run",
    dashboard: "Read `agents/policy.md`, then `agents/dashboard.md`, and do this week's run",
    monthly: "Read `agents/policy.md`, then `agents/monthly.md`, and do the monthly review",
    market: "(GitHub Actions: market.yml, no Claude routine)",
  };
  return `${body[s.routine]}${ch}.${channelLine}`;
}
