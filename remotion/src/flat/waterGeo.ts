/** The pure geometry of `MapWater` (water.tsx): kept apart so tests run without the kit's fonts. */
type XY = [number, number];

/**
 * The flood's front: a closed ring around (cx, cy) of radius about `r`, its edge rolling in waves that move
 * with `t` (frames). Pure, so the same frame always draws the same water.
 */
export function frontRing(cx: number, cy: number, r: number, t: number, seed = 0, n = 120): XY[] {
  if (r <= 0) return [];
  const out: XY[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(6 * a + t / 9 + seed) + 0.04 * Math.sin(11 * a - t / 6 + 2 * seed) + 0.025 * Math.sin(17 * a + t / 4);
    out.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return out;
}

/** How far the front must reach (px) to cover a box from (cx, cy): its farthest corner, plus the waves. */
export function reachOf(cx: number, cy: number, box: [XY, XY]): number {
  const [[x0, y0], [x1, y1]] = box;
  const far = Math.max(...[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => Math.hypot(x! - cx, y! - cy)));
  return far * 1.12 + 40;
}

/** One ripple line across the water at height y: soft crests that drift with `t`. */
export function rippleD(x0: number, x1: number, y: number, t: number, row: number): string {
  const len = 90, amp = 12;
  const shift = ((t * 1.6 + row * 37) % (len * 2)) - len * 2;
  let s = `M${(x0 + shift).toFixed(1)},${y.toFixed(1)}`;
  for (let x = x0 + shift; x < x1 + len; x += len) s += ` q${len / 4},${-amp} ${len / 2},0 q${len / 4},${amp} ${len / 2},0`;
  return s;
}

