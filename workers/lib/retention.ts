/**
 * The hook score: how many viewers are still watching a few seconds in. YouTube Analytics gives each
 * video's audience retention curve as 100 points (elapsedVideoTimeRatio 0.01..1.00 →
 * audienceWatchRatio, the share of the starting audience watching at that moment; rewatches can push
 * it above 1). The hook moment is 3 s into a Short (the swipe decision) and 30 s into a long video
 * (the promise). Pure, so it is tested directly.
 */
export type Curve = [number, number][];     // [elapsed share 0..1, watch ratio]

export const HOOK_SECONDS = { short: 3, long: 30 } as const;

/** The watch ratio at `seconds` into a `durationSec` video, interpolated; null when the curve is empty. */
export function holdAt(curve: Curve, durationSec: number, seconds: number): number | null {
  if (!curve.length || durationSec <= 0) return null;
  const pts = [...curve].sort((a, b) => a[0] - b[0]);
  const x = Math.min(1, seconds / durationSec);
  if (x <= pts[0]![0]) return round(pts[0]![1]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!, [x1, y1] = pts[i]!;
    if (x <= x1) return round(y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1)));
  }
  return round(pts[pts.length - 1]![1]);
}

/** The hook score for a video of this format and length. */
export function hookHold(curve: Curve, durationSec: number, format: "short" | "long"): number | null {
  return holdAt(curve, durationSec, HOOK_SECONDS[format]);
}

const round = (v: number) => Math.round(v * 1000) / 1000;
