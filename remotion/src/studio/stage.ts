/**
 * Where a thing stands on the stage so it stays whole at its biggest (2026-11-08, the improver: "something
 * cut at the edge" was the most widespread QA failure of the fortnight, 27 videos and 102 notes, most of
 * them a thing at x 0.2 or 0.74 that a `grow` to 1.35 pushed past the frame's edge). A grow is capped at
 * what fits where the writer put the thing (a grow to 1.2 or less is never capped: it still visibly grows, and the frame stays full), and only the rest
 * is a slide inward: sliding a big thing across the stage covers its neighbour instead (stills, v-20261105-07).
 */

/** Margin each side of the frame, as a share of its width. */
export const STAGE_MARGIN = 0.03;
/** A grow always shows at least this much, even where the thing has no room to spare. */
export const MIN_GROW = 1.2;

/** The biggest scale at which a thing `sizePx` tall standing at `x` stays inside the frame (half its
 *  drawn width is 0.6 of its size, as the camera's item box). */
export function roomScale(x: number, sizePx: number, w: number): number {
  return Math.min(x - w * STAGE_MARGIN, w * (1 - STAGE_MARGIN) - x) / (sizePx * 0.6);
}

/** A grow's target, capped at the room the thing has (never below MIN_GROW). */
export function capGrow(target: number, x: number, sizePx: number, w: number): number {
  return target <= 1 ? target : Math.min(target, Math.max(MIN_GROW, roomScale(x, sizePx, w)));
}

/** The largest scale a thing reaches in its beat: 1, or the target of its biggest `grow`. */
export function grownScale(actions: readonly { target?: string; do?: string; scale?: number }[], id: string): number {
  let k = 1;
  for (const a of actions) if (a.target === id && a.do === "grow") k = Math.max(k, a.scale ?? 1.6);
  return k;
}

/** The x (px) closest to `x` at which a thing `half` px either side of it stays inside the frame
 *  (3% margins, like a multiplied row); centred when it is wider than the frame. */
export function fitOnStage(x: number, half: number, w: number): number {
  const lo = w * STAGE_MARGIN + half, hi = w * (1 - STAGE_MARGIN) - half;
  return lo > hi ? w / 2 : Math.min(hi, Math.max(lo, x));
}
