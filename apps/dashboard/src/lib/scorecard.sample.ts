/**
 * A sample scorecard for running the dashboard without a database: the sample Studio's Shorts, with a
 * second-line loss and a score against similar Shorts made up deterministically from each id, and the
 * reset three days ago so both sides of the before/after comparison have Shorts.
 */
import type { Scorecard } from "./scorecard";
import { getStudio } from "./studio.sample";

const DAY_MS = 86_400_000;

function unit(seed: string): number {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (h % 1000) / 1000;
}

export function getScorecard(): Scorecard {
  const now = Date.now();
  const resetDay = new Date(now - 3 * DAY_MS + 5.5 * 3_600_000).toISOString().slice(0, 10);
  const rows = getStudio("365", "short").content.filter((r) => r.format === "short");
  const shorts = rows
    .sort((a, b) => b.publishAt.localeCompare(a.publishAt))
    .map((r) => {
      const after = r.publishAt.slice(0, 10) >= resetDay;
      const lift = after ? 0.08 : 0;
      const young = now - Date.parse(r.publishAt) < 2 * DAY_MS;
      const u = unit(r.videoId);
      return {
        id: r.videoId, title: r.title, thumbnailUrl: r.thumbnailUrl, publishAt: r.publishAt, durationSec: r.durationSec,
        views: r.views, views48: r.views48 === null ? null : Math.round(r.views48 * (after ? 1.6 : 1)),
        stayed: young || r.engagedRatio === null ? null : Math.min(0.9, Math.round((r.engagedRatio + lift) * 1000) / 1000),
        lostAt5: young ? null : Math.round(Math.max(0.04, 0.12 + u * 0.2 - lift) * 1000) / 1000,
        endHold: young || r.endHold === null ? null : Math.round((r.endHold + lift) * 1000) / 1000,
        relative: young ? null : Math.round((0.32 + u * 0.3 + lift) * 1000) / 1000,
        likes: r.likes, shares: r.shares, subs: r.subsNet,
      };
    });
  return { source: "sample", generatedAt: new Date(now).toISOString(), resetDay, shorts };
}
