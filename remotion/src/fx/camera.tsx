/**
 * Camera and transitions for a beat. The camera never parks: every move keeps drifting, which is
 * most of what keeps a frame alive between actions. Transitions overlap the start of a beat with
 * the end of the last one, so cuts have motion in them.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { noise2D } from "@remotion/noise";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => { const c = clamp(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

/** Transform for a camera move at progress p (0..1 through the beat), with a punch at `punchAt`. */
export function cameraTransform(kind: string, p: number, sec: number, seed: string, punchSec: number | null): string {
  const e = easeInOut(p);
  const n1 = noise2D(seed, sec * 0.15, 0) * 6, n2 = noise2D(seed, 0, sec * 0.15) * 6;   // handheld drift
  let scale = 1.02, x = n1, y = n2;
  switch (kind) {
    case "push": scale = 1.0 + 0.09 * e; break;
    case "pull": scale = 1.09 - 0.09 * e; break;
    case "pan-left": x += 50 - 100 * e; scale = 1.06; break;
    case "pan-right": x += -50 + 100 * e; scale = 1.06; break;
    case "rise": y += 40 - 80 * e; scale = 1.05; break;
    case "still": scale = 1.0; x *= 0.3; y *= 0.3; break;
    default: scale = 1.03 + 0.02 * e;   // drift
  }
  if (punchSec !== null && sec >= punchSec) {
    const k = sec - punchSec;
    scale += 0.06 * Math.exp(-k * 7) * Math.cos(k * 16);
  }
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
}

export const TRANSITION_FRAMES = 12;
/** Story frames each transition takes: the ones that travel somewhere need a little longer. */
export const transitionFrames = (kind: string) => kind === "zoom-through" ? 18 : kind === "match" ? 14 : kind === "whip" ? 10 : TRANSITION_FRAMES;

/** Style for the incoming beat during its first transitionFrames(kind) frames. */
export function transitionStyle(kind: string, local: number): React.CSSProperties {
  const p = clamp(local / transitionFrames(kind));
  const e = 1 - Math.pow(1 - p, 3);
  switch (kind) {
    case "fade": return { opacity: e };
    case "slide": return { transform: `translateX(${(1 - e) * 100}%)` };
    case "slide-up": return { transform: `translateY(${(1 - e) * 100}%)` };
    case "zoom": return { opacity: e, transform: `scale(${1.25 - 0.25 * e})`, filter: `blur(${(1 - e) * 14}px)` };
    case "wipe": return { clipPath: `inset(0 ${(1 - e) * 100}% 0 0)` };
    case "iris": return { clipPath: `circle(${e * 120}% at 50% 50%)` };
    case "whip": return { transform: `translateX(${(1 - e) * -100}%)`, filter: `blur(${(1 - e) * 20}px)` };
    // dive into something and come out in the next place: the new shot grows out of the centre
    case "zoom-through": return { opacity: clamp(p * 2.2), transform: `scale(${0.5 + 0.5 * e})`, filter: `blur(${(1 - e) * 12}px)`, transformOrigin: "50% 42%" };
    // the same thing in the same place, a new world around it
    case "match": return { opacity: e, transform: `scale(${1.05 - 0.05 * e})` };
    default: return {};
  }
}

/** Style for the outgoing beat while the next one comes in (nothing for the simple kinds). */
export function exitStyle(kind: string, local: number): React.CSSProperties | undefined {
  const p = clamp(local / transitionFrames(kind));
  const e = p * p * (3 - 2 * p);
  switch (kind) {
    case "zoom-through": return { transform: `scale(${1 + 4 * e * e})`, filter: `blur(${e * 18}px)`, opacity: 1 - clamp((p - 0.45) / 0.55), transformOrigin: "50% 42%" };
    case "whip": return { transform: `translateX(${e * 100}%)`, filter: `blur(${e * 20}px)` };
    case "match": return { opacity: 1 - e };
    default: return undefined;
  }
}

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(0,0,0,0.28) 100%)" }} />
);
