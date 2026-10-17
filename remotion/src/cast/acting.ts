/**
 * Acting over time: key poses with springy transitions, expression changes, blinks and talking.
 * All pure functions of the frame, so a performance is deterministic.
 */
import { mixPose, type Pose } from "./rig";
import type { Expression, Viseme } from "./face";

/** Smooth 0→1 with a small overshoot, so a move lands with life instead of stopping dead. */
export function settle(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const s = 1 - Math.exp(-6 * x) * Math.cos(9 * x);
  return Math.min(1.06, s);
}

export interface Key { at: number; pose: Pose; dur?: number }

/** The pose at time t (seconds) given key poses; each transition takes `dur` (default 0.45 s). */
export function posed(t: number, keys: Key[]): Pose {
  let pose = keys[0]!.pose;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]!;
    if (t < k.at) break;
    const p = settle((t - k.at) / (k.dur ?? 0.45));
    pose = mixPose(pose, k.pose, Math.min(1, p));
  }
  return pose;
}

/** The expression at time t from [time, expression] steps. */
export function expressionAt(t: number, steps: [number, Expression][]): Expression {
  let e = steps[0]![1];
  for (const [at, ex] of steps) if (t >= at) e = ex;
  return e;
}

/** Blinks every 2.5–4.5 s, 0.14 s long, offset per character so a cast never blinks in unison. */
export function blinkAt(t: number, seed: number): number {
  const period = 2.5 + ((seed * 7919) % 200) / 100;
  const phase = (t + seed * 1.37) % period;
  return phase < 0.14 ? Math.sin((phase / 0.14) * Math.PI) : 0;
}

const CYCLE: Viseme[] = ["A", "M", "E", "O", "I", "L", "A", "S", "U", "E", "F", "O"];

/**
 * A stand-in mouth for talking when no phoneme timings are given (sheets and previews only).
 * Real videos drive visemes from Kokoro's timings (visemes.ts).
 */
export function chatter(t: number, from: number, to: number, seed = 0): Viseme | null {
  if (t < from || t >= to) return null;
  const i = Math.floor((t - from) * 9 + seed);
  return CYCLE[i % CYCLE.length]!;
}
