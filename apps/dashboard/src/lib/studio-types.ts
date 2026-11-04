/**
 * Plain types for the Studio-grade analytics calculations, with no runtime imports. studio-calc.ts
 * uses these so it can be imported by the workers' tests (which have no zod in their CI job); the
 * zod schemas in studio-schema.ts describe the same shapes.
 */
export type Day = {
  day: string; views: number; engagedViews: number; watchMinutes: number; avgViewPct: number; avgViewSec: number;
  likes: number; comments: number; shares: number; subsGained: number; subsLost: number;
};

export type Totals = {
  views: number; engagedViews: number; watchHours: number; avgViewPct: number; avgViewSec: number;
  likes: number; comments: number; shares: number; subsGained: number; subsLost: number;
  impressions: number | null; ctr: number | null;
};

export type Group = { value: string; n: number; avgViewPct: number | null; views48: number | null; engagedRatio: number | null; hookHold: number | null };
export type Attribute = { attribute: string; label: string; groups: Group[] };
