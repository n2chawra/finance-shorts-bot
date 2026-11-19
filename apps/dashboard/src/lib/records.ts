/**
 * Wins worth celebrating on the Overview (pure, no React): a Short that holds the channel's best-ever
 * views, and Shorts crossing 1K / 10K / 100K views. Each win has a stable key, so a device shows its
 * toast once (the keys it has shown live in localStorage, see components/celebrate.tsx).
 */

export const MILESTONES = [100_000, 10_000, 1_000] as const;

export type Win = { key: string; videoId: string; title: string; kind: "record" | "milestone"; label: string; views: number };

type Short = { id: string; title: string; views: number; publishAt: string };

/** "1K views", "10K views", "100K views" */
export const milestoneLabel = (m: number) => `${m >= 1000 ? `${m / 1000}K` : m} views`;

/** The highest milestone `views` has crossed, or null. */
export const milestoneOf = (views: number) => MILESTONES.find((m) => views >= m) ?? null;

/**
 * The Short holding the best-ever views, when it beat every Short published before it (a real new
 * record, not the channel's only video). Null with fewer than two Shorts or no views.
 */
export function recordHolder(shorts: Short[]): Short | null {
  if (shorts.length < 2) return null;
  const best = shorts.reduce((a, b) => (b.views > a.views ? b : a));
  if (best.views <= 0) return null;
  const earlier = shorts.filter((s) => s.id !== best.id && s.publishAt < best.publishAt);
  if (earlier.length === 0) return null;
  return earlier.every((s) => best.views > s.views) ? best : null;
}

/** Wins from Shorts published in the last `recentDays` (older ones were won before this feature). */
export function winsOf(shorts: Short[], now = Date.now(), recentDays = 14): Win[] {
  const since = now - recentDays * 86_400_000;
  const out: Win[] = [];
  const rec = recordHolder(shorts);
  if (rec && Date.parse(rec.publishAt) >= since) {
    // a record is re-celebrated only when it has grown by a milestone bucket, never on every refetch
    out.push({ key: `record:${rec.id}:${milestoneOf(rec.views) ?? 0}`, videoId: rec.id, title: rec.title, kind: "record", label: "New record", views: rec.views });
  }
  for (const s of shorts) {
    const m = milestoneOf(s.views);
    if (m && Date.parse(s.publishAt) >= since) out.push({ key: `views:${s.id}:${m}`, videoId: s.id, title: s.title, kind: "milestone", label: milestoneLabel(m), views: s.views });
  }
  return out;
}
