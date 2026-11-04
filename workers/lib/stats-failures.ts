/**
 * When a stats run's failures are worth a red job and an email (2026-11-04: a single passing "Internal
 * error" from YouTube on one video turned the whole job red). Pure, so it is tested directly.
 */

/** What failed, without the message: "v-20261023-02" or "channel totals". */
export const failKey = (error: string): string => error.split(":")[0]!.trim();

/** Serious: the same thing failed in the previous run too, or more than 20% of the videos failed now. */
export function seriousFailure(now: string[], previous: string[], videos: number): boolean {
  if (!now.length) return false;
  return now.some((k) => previous.includes(k)) || now.length > Math.max(1, videos * 0.2);
}

/**
 * A run's outcome: `clean` (nothing failed), `passing` (a passing failure, retried next run: the job stays
 * green and the data counts as refreshed, else `statsRefreshedAt` stops moving and the data audit reports
 * stale stats while every run is green) or `serious` (red job, email, not refreshed).
 */
export function statsOutcome(now: string[], previous: string[], videos: number): "clean" | "passing" | "serious" {
  if (!now.length) return "clean";
  return seriousFailure(now, previous, videos) ? "serious" : "passing";
}
