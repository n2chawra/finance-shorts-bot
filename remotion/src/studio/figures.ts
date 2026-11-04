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

/** Whether a figure is already written inside one of these texts ("8%" in "$45,000 at 8%, assumed"),
 *  as a whole figure, not part of a bigger one ("$1" is not in "$100"). QA on L-20261104-01 (owner
 *  note: "some texts are overlapped and hiding behind"): a figure the board's sum already shows slammed
 *  in again behind it. */
export function shownIn(figure: string, texts: Iterable<string>): boolean {
  if (!figure) return false;
  const esc = figure.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^0-9A-Za-z.,$₹£€])${esc}(?![0-9A-Za-z]|[.,][0-9])`);
  for (const t of texts) if (t === figure || re.test(t)) return true;
  return false;
}
