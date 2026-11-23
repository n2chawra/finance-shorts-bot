/**
 * A channel's health after launch (multi-channel plan, step 4, "Hands-off after launch"). Pure: ingest
 * gathers the numbers per channel and acts on the result (notifications, the stop rule's 1 a day).
 *
 *   buffer      days of Shorts ready at the channel's posting rate: under 1 → red and a notice, under 2 → amber
 *   drop        stayed to watch (engaged views ÷ views, pooled) this week 10+ points below the two weeks before
 *   stop rule   weeks in a row under 45% stayed to watch: 3 → amber (the next test is a format change),
 *               6 → red, one owner notification, and the channel drops to 1 Short a day until answered
 *   digest      a weekly summary per channel (Mondays)
 *   usage       the channel's share of the week's routine minutes
 */
export const STAY_FLOOR = 0.45;
export const DROP_POINTS = 0.10;

export type Week = { week: string; views: number; engaged: number };
export type HealthInput = {
  channel: string; name: string; status: string;
  queuedShorts: number; shortsPostedPerDay: number;
  /** oldest first, IST weeks (YYYY-Www) of the channel's Shorts' views and engaged views */
  weeks: Week[];
  /** minutes of routine runs in the last 7 days: this channel's, and every channel's */
  usageMinutes: number; allUsageMinutes: number;
  /** open critical notifications for this channel (a broken sign-in, uploads failing) */
  critical: string[];
  /** generation paused on purpose: no buffer alarm */
  generationPaused?: boolean;
  /** the stop rule's notice and 1 a day: every channel but channel #1 (deleted 2026-11-23), which kept the improver's escalation */
  stopRuleActions?: boolean;
};
export type Health = {
  color: "green" | "amber" | "red"; reason: string;
  bufferDays: number | null; stayed: number | null; stayedBefore: number | null;
  weeksUnderFloor: number; usageShare: number | null;
  notices: { key: string; severity: "info" | "warning" | "critical"; title: string; detail: string; fix: string }[];
  /** the stop rule's action: post 1 Short a day until the owner answers */
  dialDown: boolean;
};

const rate = (w: Week[]) => {
  const v = w.reduce((a, x) => a + x.views, 0);
  return v >= 200 ? w.reduce((a, x) => a + x.engaged, 0) / v : null;   // under 200 views a week says nothing
};
const pct = (x: number | null) => (x == null ? "–" : `${Math.round(x * 100)}%`);

export function health(h: HealthInput): Health {
  const notices: Health["notices"] = [];
  const bufferDays = h.shortsPostedPerDay > 0 ? Math.round((h.queuedShorts / h.shortsPostedPerDay) * 10) / 10 : null;
  // the last complete week is the second-to-last entry; the current week is still filling
  const done = h.weeks.slice(0, -1);
  const last = done.slice(-1), before = done.slice(-3, -1);
  const stayed = rate(last), stayedBefore = rate(before);
  let under = 0;
  for (let i = done.length - 1; i >= 0; i--) {
    const r = rate([done[i]!]);
    if (r == null || r >= STAY_FLOOR) break;
    under++;
  }
  const reasons: { level: 0 | 1 | 2; text: string }[] = [];
  if (h.status === "paused") reasons.push({ level: 1, text: "paused" });
  for (const c of h.critical) reasons.push({ level: 2, text: c });
  if (h.generationPaused) reasons.push({ level: 1, text: "making videos is paused" });
  if (h.status === "active" && !h.generationPaused && bufferDays != null) {
    if (bufferDays < 1) {
      reasons.push({ level: 2, text: `${h.queuedShorts} Short${h.queuedShorts === 1 ? "" : "s"} ready: under a day` });
      notices.push({ key: `buffer:${h.channel}`, severity: "critical", title: `${h.name}: under a day of Shorts ready`,
        detail: `${h.queuedShorts} ready at ${h.shortsPostedPerDay} a day. A slot with nothing ready stays empty.`,
        fix: "The spare run (09:07) makes up the shortfall. If it repeats, check the channel's video runs on the Agents page." });
    } else if (bufferDays < 2) reasons.push({ level: 1, text: `${bufferDays} days of Shorts ready` });
  }
  if (stayed != null && stayedBefore != null && stayedBefore - stayed >= DROP_POINTS) {
    // the auditor diagnoses it tonight (agents/auditor.md); the owner hears only if a decision is needed
    reasons.push({ level: 1, text: `stayed to watch fell to ${pct(stayed)} from ${pct(stayedBefore)}: diagnosis tonight` });
  }
  let dialDown = false;
  if (under >= 6 && h.stopRuleActions !== false) {
    reasons.push({ level: 2, text: `${under} weeks under ${pct(STAY_FLOOR)} stayed to watch` });
    notices.push({ key: `stop-rule:${h.channel}`, severity: "critical", title: `${h.name}: six weeks under 45% stayed to watch`,
      detail: `Stayed to watch has been under ${pct(STAY_FLOOR)} for ${under} weeks in a row, through format changes. The channel now posts 1 Short a day so it doesn't use the plan another channel needs.`,
      fix: "Decide: change the niche (Add channel with a new niche), or stop this channel (Pause on the Channels page)." });
    dialDown = true;
  } else if (under >= 3) reasons.push({ level: 1, text: `${under} weeks under ${pct(STAY_FLOOR)}: the next test is a format change` });
  const level = Math.max(0, ...reasons.map((r) => r.level));
  const top = reasons.filter((r) => r.level === level).map((r) => r.text);
  return {
    color: (["green", "amber", "red"] as const)[level]!,
    reason: top.length ? top.join("; ") : `on track${stayed != null ? `: ${pct(stayed)} stayed to watch last week` : ""}`,
    bufferDays, stayed, stayedBefore, weeksUnderFloor: under,
    usageShare: h.allUsageMinutes > 0 ? Math.round((h.usageMinutes / h.allUsageMinutes) * 100) / 100 : null,
    notices, dialDown,
  };
}

/** The weekly digest for one channel: what was tested, the verdict, what's next, stayed to watch week on week. */
export function digest(name: string, hl: Health, test: { running?: string | null; lastVerdict?: string | null; next?: string | null }, uploads: number): { title: string; detail: string } {
  const lines = [
    `Stayed to watch: ${pct(hl.stayed)} last week (${pct(hl.stayedBefore)} the two weeks before).`,
    `${uploads} Short${uploads === 1 ? "" : "s"} published last week; ${hl.bufferDays ?? "–"} days ready.`,
    test.lastVerdict ? `Last test: ${test.lastVerdict}.` : "No test finished last week.",
    test.running ? `Running: ${test.running}.` : test.next ? `Next: ${test.next}.` : "",
    hl.usageShare != null ? `Share of the week's routine time: ${Math.round(hl.usageShare * 100)}%.` : "",
  ].filter(Boolean);
  return { title: `${name}: the week (${hl.color})`, detail: lines.join("\n") };
}

/** IST week key, YYYY-Www (ISO weeks). */
export function istWeek(d: Date): string {
  const t = new Date(d.getTime() + 330 * 60_000);
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t.getTime() - first.getTime()) / 86_400_000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
