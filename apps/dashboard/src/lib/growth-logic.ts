/** The weekly loop's pure helpers: no imports, so the Node workers tests can load them too. */

/** Stayed to watch under this share for ESCALATE_AFTER cycles in a row makes the next test a format change. */
export const ESCALATE_BELOW = 0.45;
export const ESCALATE_AFTER = 3;
export const OWNER_AFTER = 6;

/** Cycles in a row, newest first, whose champion side stayed under ESCALATE_BELOW. */
export function cyclesUnder(rows: { champion?: number | null }[], below = ESCALATE_BELOW): number {
  let k = 0;
  for (const r of [...rows].reverse()) {
    if (r.champion == null || r.champion >= below) break;
    k++;
  }
  return k;
}

/** The kind the next cycle takes: first-second and look alternate; three cycles under 45% force a format test. */
export function nextKind(history: { kind?: string }[], stayed: { champion?: number | null }[]): "first-second" | "look" | "format" {
  if (cyclesUnder(stayed) >= ESCALATE_AFTER) return "format";
  const last = [...history].reverse().find((h) => h.kind === "first-second" || h.kind === "look")?.kind;
  return last === "first-second" ? "look" : "first-second";
}

const IST_MS = 5.5 * 3_600_000;

/** The reviewer's next run: Tuesday and Friday at 21:07 IST (agents/reviewer.md). */
export function nextReviewerRun(now = Date.now()): Date {
  for (let d = 0; d < 8; d++) {
    const ist = new Date(now + IST_MS + d * 86_400_000);
    if (![2, 5].includes(ist.getUTCDay())) continue;
    const at = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 21, 7) - IST_MS;
    if (at > now) return new Date(at);
  }
  return new Date(now + 7 * 86_400_000);
}

export const KIND_LABEL: Record<string, string> = { "first-second": "First-second test", look: "Look test", format: "Format change" };
export const KIND_METRIC: Record<string, string> = { "first-second": "stayed to watch", look: "held after the hook", format: "stayed to watch" };

/** The IST day a test's verdict is due: its start day plus maxDays. Calendar arithmetic on the day key,
 * so it never slips a day through UTC (IST midnight is 18:30 UTC the evening before). */
export function verdictDueDay(startedAt: string | null | undefined, maxDays: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(startedAt ?? "");
  if (!m || !Number.isFinite(maxDays)) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + maxDays)).toISOString().slice(0, 10);
}

/** "Day 3 of 7", "Starts today" or "Starts <day>" (days is negative before the start day). */
export function testDayLabel(days: number | null | undefined, maxDays: number, startsOn: string): string {
  if (days == null) return "Starts today";
  return days >= 0 ? `Day ${Math.min(days, maxDays)} of ${maxDays}` : `Starts ${startsOn}`;
}

/** The confidence worth showing: none until both sides have counted Shorts (the evaluator writes 0.5
 * for "no data", which reads as a real 50%). */
export function shownConfidence(e: { points?: number | null; pOnBetter?: number | null; counted: { on: number; off: number } }): number | null {
  if (e.points == null || e.pOnBetter == null || Math.min(e.counted.on, e.counted.off) === 0) return null;
  return e.pOnBetter;
}
