/**
 * How a live YouTube counter moves when a refresh returns a new value (pure, shared with the tests).
 *
 * YouTube's public counter can briefly return a slightly lower, cached value, so a small dip keeps
 * the larger number. A bigger drop is real: YouTube removes invalid (spam) views, likes from deleted
 * accounts, deleted comments, and the dashboard must follow it down or it over-counts for good
 * (v-20261026-03 on 27 Oct: stuck at 75 views while YouTube showed 57). The tolerance stays well
 * under the data audit's slack (5% or 5 views), so a kept dip never shows as a disagreement.
 * `fetched` null means YouTube returned nothing (private or deleted video): keep the stored value.
 */
export function nextLiveCount(stored: number | null, fetched: number | null): number | null {
  if (fetched === null) return stored;
  if (stored === null || fetched >= stored) return fetched;
  return stored - fetched <= Math.max(2, Math.floor(stored / 50)) ? stored : fetched;
}
