import type { Activity } from "./schemas";

const DAY_MS = 86_400_000;
const prevDay = (day: string) => new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);

/**
 * Each agent's report from the latest night. A night spans two dates: the auditor (23:00) and
 * research (23:47) already write the next day's date, the improver and dashboard (06:17, 07:37)
 * write it after midnight. So between 23:00 and 06:17 the newest date holds only the first two;
 * taking each agent's newest report from the newest date or the one before keeps the rest of last
 * night visible instead of showing "no report".
 */
export function lastNight(activity: Activity[]): { day: string | undefined; byAgent: Map<Activity["agent"], Activity> } {
  const day = activity.reduce<string | undefined>((m, a) => (!m || a.day > m ? a.day : m), undefined);
  const byAgent = new Map<Activity["agent"], Activity>();
  if (!day) return { day, byAgent };
  const from = prevDay(day);
  for (const a of activity) {
    if (a.day < from) continue;
    const seen = byAgent.get(a.agent);
    if (!seen || a.day > seen.day || (a.day === seen.day && (a.finishedAt ?? "") > (seen.finishedAt ?? ""))) byAgent.set(a.agent, a);
  }
  return { day, byAgent };
}
