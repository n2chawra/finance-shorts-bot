/**
 * When each figure is spoken in a beat (owner, 2026-10-30: "animation was less when numbers were
 * spoken, which is wrong"). A spoken figure takes two or three seconds ("fifty-one thousand nine
 * hundred sixty-nine dollars"), so scenes react to it on their own: the thing that carries the
 * figure pulses, or the figure itself pops on screen. Times are story seconds in the beat.
 */
import type { SceneProps } from "../scenes/kit";

export interface Spoken { text: string; s: number; e: number }

export function spokenFigures(p: SceneProps): Spoken[] {
  const v = p.beat.voice;
  if (!v?.captions?.length) return [];
  const figures = new Set(Object.values(p.tl.figures ?? {}));
  const start = v.start / p.fps;
  return v.captions
    .map((c) => ({ text: c.t.replace(/[.,!?;:]+$/, ""), s: start + c.s, e: start + c.e }))
    .filter((c) => figures.has(c.text));
}

/** 0..1..0 while a figure is being said (a quick rise, held, eased out after). */
export function pulse(t: number, f: Spoken): number {
  if (t < f.s - 0.05 || t > f.e + 0.6) return 0;
  const up = Math.min(1, (t - f.s + 0.05) / 0.25);
  const down = t > f.e ? 1 - (t - f.e) / 0.6 : 1;
  return Math.max(0, Math.min(up, down));
}
