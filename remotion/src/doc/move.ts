/**
 * Slow documentary camera moves on a picture (footage, a photo): a push, a pull, a drift, a rise. The
 * picture is always scaled past the frame (at least `base`), so a move never shows an edge.
 */
import { smooth } from "./theme";

export type MoveKind = "push" | "pull" | "drift-left" | "drift-right" | "rise" | "fall" | "still";
export const MOVES: readonly MoveKind[] = ["push", "pull", "drift-left", "drift-right", "rise", "fall", "still"];
export const isMove = (x: unknown): x is MoveKind => typeof x === "string" && (MOVES as readonly string[]).includes(x);

/** The CSS transform for a move at progress k (0..1) with strength `amount` (0.08 = 8% over the beat),
 * centred on `focus` (0..1 of the picture). */
export function moveTransform(kind: MoveKind, k: number, amount = 0.08, focus: [number, number] = [0.5, 0.5], base = 1.06): { transform: string; origin: string } {
  const e = smooth(k);
  let s = base, x = 0, y = 0;
  switch (kind) {
    case "push": s = base + amount * e; break;
    case "pull": s = base + amount * (1 - e); break;
    case "drift-left": s = base + amount * 0.5; x = (0.5 - e) * amount * 50; break;
    case "drift-right": s = base + amount * 0.5; x = (e - 0.5) * amount * 50; break;
    case "rise": s = base + amount * 0.5; y = (0.5 - e) * amount * 40; break;
    case "fall": s = base + amount * 0.5; y = (e - 0.5) * amount * 40; break;
    case "still": s = base; break;
  }
  return { transform: `scale(${s}) translate(${x}%, ${y}%)`, origin: `${focus[0] * 100}% ${focus[1] * 100}%` };
}
