import { fmtDayKey, istDay } from "./format";

/**
 * How old the newest YouTube Analytics day is. Analytics normally runs a few days behind, so up to
 * 3 days is fine; past that the stats job has likely stopped (e.g. YouTube sign-in failed) and the
 * views, subscriber and likes charts are frozen. The age of the data, not of the last job run.
 */
export function statsAge(through: string | null, now = new Date()): { label: string; tone: "fine" | "warning" | "critical"; days: number | null } {
  if (!through) return { label: "No YouTube Analytics in 28 days", tone: "critical", days: null };
  const days = Math.round((Date.parse(`${istDay(now)}T00:00:00Z`) - Date.parse(`${through}T00:00:00Z`)) / 86_400_000);
  return { label: `YouTube Analytics through ${fmtDayKey(through)}`, tone: days >= 7 ? "critical" : days >= 4 ? "warning" : "fine", days };
}

export const STATS_AGE_CLASS = { fine: "text-muted", warning: "font-medium text-warning-text", critical: "font-medium text-critical-text" } as const;
