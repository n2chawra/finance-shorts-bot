// Shared helpers for the 3D kit: vectors, easing, seeded randomness, fading whole groups, glow
// textures and the font hold. Everything is a pure function of the frame; nothing reads a clock.
import { useEffect, useState } from "react";
import { continueRender, delayRender, Easing, random } from "remotion";
import * as THREE from "three";
// Poppins is loaded by ../design/fonts (imported by Root); importing it here would load fonts in tests
const FONT = "Poppins";

export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale3 = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const norm3 = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Progress 0→1 of a cue: `start` frame, `dur` frames, eased (default: ease in-out cubic). */
export function cue(frame: number, start: number, dur: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)): number {
  if (dur <= 0) return frame >= start ? 1 : 0;
  return ease(clamp01((frame - start) / dur));
}

/** A window: rises over `fadeIn` frames from `start`, falls over `fadeOut` frames before `end`. */
export function window01(frame: number, start: number, end: number, fadeIn = 8, fadeOut = 8): number {
  return Math.min(cue(frame, start, fadeIn), 1 - cue(frame, end - fadeOut, fadeOut));
}

/** Seeded pseudo-random in [0,1): same seed + index → same value on every render and machine. */
export const rnd = (seed: string, i: number) => random(`${seed}:${i}`);

/** Fade every material under `root` to `opacity` (×its own base opacity). Call from a layout
 * effect or useFrame. Materials are cloned once per mesh so shared presets are left alone. */
export function fadeTree(root: THREE.Object3D | null, opacity: number): void {
  if (!root) return;
  root.visible = opacity > 0.004;
  if (!root.visible) return;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.material || o.userData.noFade) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const own = mats.map((mat) => {
      if (mat.userData.fadeOwner === m.uuid) return mat;
      const c = mat.clone();
      c.userData = { ...mat.userData, fadeOwner: m.uuid, baseOpacity: mat.opacity, baseTransparent: mat.transparent, baseDepthWrite: mat.depthWrite };
      return c;
    });
    m.material = Array.isArray(m.material) ? own : own[0]!;
    for (const mat of own) {
      const base = mat.userData.baseOpacity as number;
      const fading = opacity < 0.999;
      mat.opacity = base * opacity;
      if (mat.transparent !== (fading || mat.userData.baseTransparent)) {
        mat.transparent = fading || (mat.userData.baseTransparent as boolean);
        mat.needsUpdate = true;
      }
      mat.depthWrite = fading ? opacity > 0.6 && (mat.userData.baseDepthWrite as boolean) : (mat.userData.baseDepthWrite as boolean);
    }
  });
}

let glowTex: THREE.Texture | null = null;
/** A soft round glow for additive sprites (pulses, lamps, dots). Made once, in code. */
export function glowTexture(): THREE.Texture {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

/** True once Poppins is ready for canvas text; holds the render until then. */
export function useFontReady(weight = 700): boolean {
  const [ready, setReady] = useState(() => typeof document !== "undefined" && document.fonts.check(`${weight} 48px ${FONT}`));
  useEffect(() => {
    if (ready) return;
    const h = delayRender(`3D label font ${weight}`);
    document.fonts.load(`${weight} 48px ${FONT}`).then(() => { setReady(true); continueRender(h); }, () => { setReady(true); continueRender(h); });
  }, [ready, weight]);
  return ready;
}

/** How far (output pixels) a box centred at (cx, cy), w×h, must move to sit inside the frame's
 * safe area (a Short keeps clear of the right-hand buttons and the bottom caption zone). */
export function clampShift(cx: number, cy: number, w: number, h: number, W: number, H: number): [number, number] {
  const tall = H > W;
  const [mL, mR, mT, mB] = tall ? [48, 170, 160, 430] : [60, 60, 60, 200];
  let dx = 0, dy = 0;
  if (cx - w / 2 < mL) dx = mL - (cx - w / 2);
  else if (cx + w / 2 > W - mR) dx = W - mR - (cx + w / 2);
  if (cy - h / 2 < mT) dy = mT - (cy - h / 2);
  else if (cy + h / 2 > H - mB) dy = H - mB - (cy + h / 2);
  return [dx, dy];
}

/** The kit's colours: deep studio blues, cyan/violet signal light, warm accents for the cast. */
export const TECH = {
  bgTop: "#141a33",
  bgBottom: "#05060d",
  cyan: "#38e1ff",
  violet: "#8b5cff",
  lime: "#9dff5c",
  amber: "#ffb340",
  pink: "#ff4d8d",
  ink: "#0b0f1c",
  white: "#f4f7ff",
} as const;
