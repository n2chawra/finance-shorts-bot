// ScaleZoom: one continuous dive through nested levels (phone → board → chip → core → transistor).
// Each level is its own little scene, modelled at a normal size; level i+1 sits at `focus` inside
// level i, `ratio` times smaller. The camera stays put and the world grows exponentially (constant
// felt speed, no float trouble at 10⁻⁵ scale); the next level fades in as it comes close and the
// one we are passing through fades out.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Easing, useCurrentFrame } from "remotion";
import type * as THREE from "three";
import { clamp01, fadeTree, type V3 } from "./core";

export type ZoomLevel = {
  key: string;
  node: React.ReactNode;
  /** where the next level sits, in this level's own units */
  focus?: V3;
  /** how many times smaller the next level is (defaults to the zoom's `ratio`) */
  ratio?: number;
};

export type ScaleZoomProps = {
  levels: ZoomLevel[];
  /** how many times smaller each level is than the one before */
  ratio?: number;
  /** frame at which each level fills the frame (one per level, ascending). Between two of them the
   * dive eases; before the first and after the last it holds. */
  at: number[];
  /** level progress at which the next level starts to appear / is fully in (relative to its index) */
  fadeIn?: [number, number];
  /** level progress past its index at which a level starts / finishes fading out */
  fadeOut?: [number, number];
};

/** Continuous level progress t at `frame` (0 = first level, 1 = second…). Pure; tested. */
export function zoomProgress(at: number[], frame: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)): number {
  if (at.length === 0) return 0;
  if (frame <= at[0]!) return 0;
  for (let i = 1; i < at.length; i++) {
    if (frame <= at[i]!) return i - 1 + ease(clamp01((frame - at[i - 1]!) / Math.max(1, at[i]! - at[i - 1]!)));
  }
  return at.length - 1;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export const ScaleZoom: React.FC<ScaleZoomProps> = ({ levels, ratio = 8, at, fadeIn = [-0.75, -0.35], fadeOut = [0.3, 0.6] }) => {
  const frame = useCurrentFrame();
  const t = zoomProgress(at, frame);
  // each level's origin and scale in level-0 units
  const frames = useMemo(() => {
    const out: { o: V3; s: number }[] = [];
    let o: V3 = [0, 0, 0], s = 1;
    for (let i = 0; i < levels.length; i++) {
      out.push({ o, s });
      const f = levels[i]!.focus ?? [0, 0, 0];
      o = [o[0] + f[0] * s, o[1] + f[1] * s, o[2] + f[2] * s];
      s /= levels[i]!.ratio ?? ratio;
    }
    return out;
  }, [levels, ratio]);
  const i0 = Math.min(levels.length - 1, Math.floor(t));
  const u = smooth(t - i0);
  const a = frames[i0]!, b = frames[Math.min(levels.length - 1, i0 + 1)]!;
  // world scale: exponential within each step, so the dive feels like constant speed
  const grow = Math.pow(a.s / b.s || 1, t - i0);
  const S = grow / a.s;
  // the centre slides so the next level's spot glides smoothly to the middle of the frame
  // (its offset on screen shrinks as 1 - smooth(u), not overshooting while the world grows)
  const w = 1 - (1 - u) / grow;
  const c: V3 = [a.o[0] + (b.o[0] - a.o[0]) * w, a.o[1] + (b.o[1] - a.o[1]) * w, a.o[2] + (b.o[2] - a.o[2]) * w];

  const refs = useRef<(THREE.Group | null)[]>([]);
  const opacity = levels.map((_, j) => {
    const rel = t - j;
    const inn = j === 0 ? 1 : clamp01((rel - fadeIn[0]) / (fadeIn[1] - fadeIn[0]));
    const out = j === levels.length - 1 ? 0 : clamp01((rel - fadeOut[0]) / (fadeOut[1] - fadeOut[0]));
    return smooth(inn) * (1 - smooth(out));
  });
  useLayoutEffect(() => {
    opacity.forEach((op, j) => fadeTree(refs.current[j] ?? null, op));
  });

  return (
    <group scale={S} position={[-c[0] * S, -c[1] * S, -c[2] * S]}>
      {levels.map((lv, j) => (
        <group key={lv.key} ref={(r) => { refs.current[j] = r; }} position={frames[j]!.o} scale={frames[j]!.s}>
          {opacity[j]! > 0.004 ? lv.node : null}
        </group>
      ))}
    </group>
  );
};
