import { parseImpact, type Impact } from "./impact";

const v = (id: string, title: string, day: string, views48h: number, avgViewPct: number, stayedToWatch: number | null) =>
  ({ id, title, day, views48h, avgViewPct, stayedToWatch });

/** Sample data for running the dashboard without a database. */
export async function getImpact(): Promise<Impact> {
  return parseImpact({
    updatedAt: new Date().toISOString(),
    weeks: [
      { week: "2026-10-19", n: 14, medianViews48h: 103, avgViewPct: 51.7, stayedToWatch: 0.258, avgViewSec: 15.6, videos: [v("v-20261021-05", "Why billionaires never sell their stock", "2026-10-21", 1121, 62, 0.41)] },
      { week: "2026-10-26", n: 11, medianViews48h: 211, avgViewPct: 39.7, stayedToWatch: 0.388, avgViewSec: 17.9, videos: [] },
      { week: "2026-11-02", n: 8, medianViews48h: 43, avgViewPct: 54.6, stayedToWatch: 0.386, avgViewSec: 23.2, videos: [] },
    ],
    changes: [
      { id: "money-travels-not-pops", area: "motion", status: "adopted", day: "2026-11-02", description: "Money travels between things instead of popping in.",
        before: { n: 25, medianViews48h: 148, avgViewPct: 44, stayedToWatch: 0.33, avgViewSec: 17 },
        after: { n: 8, medianViews48h: 43, avgViewPct: 54.6, stayedToWatch: 0.386, avgViewSec: 23.2 }, viewsRatio: 0.29, sameWeek: 7,
        afterVideos: [v("v-20261105-06", "The $10 gym that wants you to stay home", "2026-11-05", 581, 71, 0.36)] },
    ],
  });
}
