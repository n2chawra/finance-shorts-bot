/**
 * A camera with shot sizes (owner, 2026-10-21: every shot was the same medium-wide framing, and the
 * old camera moved at most 9%). A shot frames a target (an actor's face, an object, the room) at a
 * size; keyframes on words cut or move between sizes. The stage is drawn at frame size, so scale 1
 * is the whole room (wide) and a close-up is 2-3x. The cast are vector rigs: close-ups stay sharp.
 */
export type ShotSize = "wide" | "medium" | "close" | "extreme";
export const SIZES: Record<ShotSize, number> = { wide: 1, medium: 1.38, close: 2.15, extreme: 3.3 };

export interface Frame { s: number; tx: number; ty: number }

/** The transform that puts target (x, y) at the frame's focus point at shot size `size`. */
export function frameOn(size: ShotSize, x: number, y: number, w: number, h: number): Frame {
  const s = SIZES[size];
  const v = h > w;
  // where the subject sits in the frame: a little above centre (room for captions below in a Short)
  const fx = w * 0.5, fy = h * (v ? 0.4 : 0.42);
  let tx = fx - x * s, ty = fy - y * s;
  // never show past the edge of the stage
  tx = Math.min(0, Math.max(w - w * s, tx));
  ty = Math.min(0, Math.max(h - h * s, ty));
  return { s, tx, ty };
}

/** Keep a box (stage coordinates) whole on screen (owner's long video L-20261023-01: close shots
 * on a stack or a phone pushed their figures off the frame): zoom out just enough, then slide it in. */
export function keepInside(f: Frame, box: [number, number, number, number], w: number, h: number, m = 24): Frame {
  const [x0, y0, x1, y1] = box;
  const s = Math.max(1, Math.min(f.s, (w - 2 * m) / (x1 - x0), (h - 2 * m) / (y1 - y0)));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;    // zoom about the box so it stays where the shot put it
  let tx = cx * f.s + f.tx - cx * s, ty = cy * f.s + f.ty - cy * s;
  tx = Math.max(m - x0 * s, Math.min(w - m - x1 * s, tx));
  ty = Math.max(m - y0 * s, Math.min(h - m - y1 * s, ty));
  return { s, tx: Math.min(0, Math.max(w - w * s, tx)), ty: Math.min(0, Math.max(h - h * s, ty)) };
}

export type Box = [number, number, number, number];

/** How long a camera move takes, and the least time a framing is held (owner, 2026-10-30: the
 * camera "zig-zagged": two or three new framings in a four-second beat, each a 0.6 s move). */
export const MOVE_SEC = 1.0, HOLD_SEC = 1.2;

/** Keyframes with any that come less than HOLD_SEC after the last kept one dropped. */
export function steady<K extends { start: number }>(keys: K[]): K[] {
  const out: K[] = [];
  for (const k of keys) if (!out.length || k.start - out[out.length - 1]!.start >= HOLD_SEC) out.push(k);
  return out;
}

/** The smallest box around all of `boxes`. */
export function union(boxes: Box[]): Box {
  return [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))];
}

const screen = (f: Frame, b: Box): Box => [b[0] * f.s + f.tx, b[1] * f.s + f.ty, b[2] * f.s + f.tx, b[3] * f.s + f.ty];

/** Is at least a hand's width of the box on screen? */
export function shows(f: Frame, b: Box, w: number, h: number, min = 40): boolean {
  const [x0, y0, x1, y1] = screen(f, b);
  return Math.min(x1, w) - Math.max(x0, 0) >= min && Math.min(y1, h) - Math.max(y0, 0) >= min;
}

/** Is all of the box on screen? */
export function holds(f: Frame, b: Box, w: number, h: number): boolean {
  const [x0, y0, x1, y1] = screen(f, b);
  return x0 >= 0 && y0 >= 0 && x1 <= w && y1 <= h;
}

/** A shot on a thing never cuts an actor off at the neck (L-20261028-01 failed QA three times on a
 * headless actor at the edge of item shots): an actor partly in the frame keeps their head whole,
 * the camera zooming out only as far as that needs. An actor wholly outside stays out. */
export function keepHeads(f: Frame, subject: Box, actors: { body: Box; head: Box }[], w: number, h: number): Frame {
  let out = f, box = subject;
  for (let i = 0; i < 3; i++) {
    const cut = actors.filter((a) => shows(out, a.body, w, h) && !holds(out, a.head, w, h));
    if (!cut.length) break;
    box = union([box, ...cut.map((a) => a.head)]);
    out = keepInside(f, box, w, h);
  }
  return out;
}

const ease = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

/** Between two framings: a cut (dur 0) or a move. Scale moves in log space so a zoom feels even. */
export function between(a: Frame, b: Frame, k: number): Frame {
  const e = ease(k);
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e);
  return { s, tx: a.tx + (b.tx - a.tx) * e, ty: a.ty + (b.ty - a.ty) * e };
}

/** A little life on every shot: a slow push and a hand-held drift, never perfectly still. */
export function breathe(f: Frame, t: number, w: number, h: number, seed: number): Frame {
  const push = 1 + 0.018 * t;
  const s = f.s * push;
  const dx = Math.sin(t * 0.7 + seed) * 6, dy = Math.cos(t * 0.53 + seed * 1.7) * 5;
  const tx = Math.min(0, Math.max(w - w * s, f.tx - (s - f.s) * w * 0.5 + dx));
  const ty = Math.min(0, Math.max(h - h * s, f.ty - (s - f.s) * h * 0.42 + dy));
  return { s, tx, ty };
}
