/**
 * "Latest updates only" (owner, 2026-11-12): Notifications, Agents and Feedback show what happened
 * in the last RECENT_DAYS days. A timestamp counts when it is within 48 hours; a plain IST day
 * ("2026-11-12") counts when it is today or yesterday.
 */
export const RECENT_DAYS = 2;
const DAY_MS = 86_400_000;

const istDayOf = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(ms));

export function isRecent(when: string | null | undefined, now = Date.now()): boolean {
  if (!when) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(when)) return when >= istDayOf(now - (RECENT_DAYS - 1) * DAY_MS);
  const t = Date.parse(when);
  return Number.isFinite(t) && now - t <= RECENT_DAYS * DAY_MS;
}
