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
