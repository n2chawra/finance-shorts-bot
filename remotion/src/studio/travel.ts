/**
 * Money travels, things arrive (experiment `money-travels-not-pops`, owner 2026-10-31: "animation
 * are very basic things just popping up and shaking"; "very static"). Pure motion maths for the
 * build scene's on-path:
 *  - an entering thing flies in from off the frame (or grows out of the thing named in `from`) on an
 *    arc and lands with a squash, instead of scaling up on its spot;
 *  - `shake` becomes a hop with squash and stretch;
 *  - `flow` sends a stream of notes from one thing to another along an arc, the figure riding on
 *    the lead note, and the destination squashes as they land.
 * Positions are world px (before the camera). Times are seconds since the action started.
 */

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

export const ENTER_SEC = 0.55, LAND_SEC = 0.3, HOP_SEC = 0.45, FLOW_SEC = 0.9, FLOW_GAP = 0.09;

export type Pt = [number, number];

/** Where an entering thing starts: the thing it grows out of, or just past the nearer side edge. */
export function entryStart(home: Pt, w: number, h: number, from?: Pt): Pt {
  if (from) return from;
  return [home[0] < w / 2 ? -0.14 * w : 1.14 * w, home[1] - h * 0.1];
}

/** An entering thing at `d` s: position on an arc from `start` to `home`, its scale-in, and the
 * landing squash (0..1) once it has arrived. */
export function entry(d: number, start: Pt, home: Pt, h: number, grows: boolean): { x: number; y: number; show: number; e: number; squash: number } {
  const e = easeOut(d / ENTER_SEC);
  const lift = Math.sin(e * Math.PI) * h * (grows ? 0.09 : 0.05);
  const x = start[0] + (home[0] - start[0]) * e, y = start[1] + (home[1] - start[1]) * e - lift;
  const show = d < 0 ? 0 : grows ? 0.2 + 0.8 * e : 1;
  return { x, y, show, e, squash: squashAt(d - ENTER_SEC) };
}

/** A landing squash: 0 → 1 → 0 over LAND_SEC after the moment of arrival (dt s after it). */
export function squashAt(dt: number): number {
  return dt < 0 || dt > LAND_SEC ? 0 : Math.sin((dt / LAND_SEC) * Math.PI) * (1 - dt / LAND_SEC * 0.5);
}

/** A hop (the on-path `shake`): 0 → 1 → 0 over HOP_SEC. */
export function hopAt(d: number): number {
  return d < 0 || d > HOP_SEC ? 0 : Math.sin((d / HOP_SEC) * Math.PI);
}

/** Squash (+) or stretch (-) as an x/y scale about the thing's base. */
export function squashScale(q: number): [number, number] {
  return [1 + 0.16 * q, 1 - 0.16 * q];
}

/** Piece `j` of `n` in a flow at `d` s: its position on the arc from `src` to `dst`, its progress
 * 0..1 and spin, or null before it leaves or after it lands. */
export function flowPiece(d: number, j: number, n: number, src: Pt, dst: Pt, h: number, dur = FLOW_SEC): { x: number; y: number; k: number; rot: number } | null {
  const local = d - j * FLOW_GAP;
  if (local < 0 || local > dur) return null;
  const k = easeInOut(local / dur);
  const mid: Pt = [(src[0] + dst[0]) / 2, Math.min(src[1], dst[1]) - h * (0.1 + 0.02 * (j % 3))];
  const x = (1 - k) * (1 - k) * src[0] + 2 * (1 - k) * k * mid[0] + k * k * dst[0];
  const y = (1 - k) * (1 - k) * src[1] + 2 * (1 - k) * k * mid[1] + k * k * dst[1];
  return { x, y, k, rot: (dst[0] >= src[0] ? 1 : -1) * (k * 300 + j * 37) };
}

/** When a flow's last piece lands (s after it started). */
export const flowEnd = (n: number, dur = FLOW_SEC) => (n - 1) * FLOW_GAP + dur;

const easeInOut = (x: number) => { const c = clamp(x); return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2; };

/** How late a thing's first word may come before it waits off screen for it (s). */
export const AUTO_ENTER_AFTER = 0.6;
/** How long before its first word an auto-entering thing sets off, so it lands on the word (s). */
export const AUTO_ENTER_LEAD = 0.35;

/**
 * Things arrive on their words (owner, 2026-11-03, on v-20261103-03: "the props are coming before
 * even their context is said, which is making it look static for a few seconds. Don't put things
 * already on screen and then animate, make them appear and animate"). A thing that is neither hidden
 * nor given an `enter`, and that nothing acts on until AUTO_ENTER_AFTER s into the beat, enters just
 * before its first action (as the target, or as where a flow, arrow or move goes). A thing acted on
 * at the start, or never acted on, stays where it is: frame 0 is what the feed shows.
 */
export function autoEnters<A extends { do: string; start: number; target?: string; to?: unknown }>(
  items: { id: string; hidden?: boolean }[], actions: A[],
): { do: "enter"; target: string; start: number; auto: true }[] {
  const out: { do: "enter"; target: string; start: number; auto: true }[] = [];
  for (const it of items) {
    if (it.hidden) continue;
    const mine = actions.filter((a) => a.target === it.id || a.to === it.id);
    if (!mine.length || mine.some((a) => a.do === "enter" && a.target === it.id)) continue;
    const first = Math.min(...mine.map((a) => a.start));
    if (first < AUTO_ENTER_AFTER) continue;
    out.push({ do: "enter", target: it.id, start: Math.max(0.05, first - AUTO_ENTER_LEAD), auto: true });
  }
  return out;
}
