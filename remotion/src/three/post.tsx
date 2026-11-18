// The look pass: bloom on bright (emissive) parts, depth of field on a focus point, and a motion
// blur driven by the camera's own speed (a radial streak on dives, a directional one on pans). All
// effects are shader passes on the rendered frame: deterministic, no history between frames.
//
// Per-frame values (focus point, blur) go through a small store keyed by the frame number, so a
// value written by a scene that has since unmounted is ignored rather than left stale.
import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { BlendFunction, Effect, ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { V3 } from "./core";

type Stamp<T> = { frame: number; value: T };

export type StageStore = {
  focus: Stamp<{ at: V3; range: number }> | null;
  radial: Map<string, Stamp<number>>;
  pan: Map<string, Stamp<[number, number]>>;
};

// the store plus the stage's absolute frame: scenes live in Sequences (their useCurrentFrame is
// local), so contributions are stamped with the stage's frame, which the effect pass reads
const Ctx = createContext<{ store: StageStore; frame: number } | null>(null);
export const StageStoreProvider: React.FC<{ store: StageStore; frame: number; children: React.ReactNode }> = ({ store, frame, children }) => {
  const value = useMemo(() => ({ store, frame }), [store, frame]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
export const newStageStore = (): StageStore => ({ focus: null, radial: new Map(), pan: new Map() });
export const useStageStore = () => useContext(Ctx)?.store ?? null;
const useStageFrame = () => useContext(Ctx)?.frame ?? -1;

/** Add a motion-blur contribution for this frame: `radial` (0..~0.3, a dive) and `pan` (screen
 * fraction per frame). Camera3D and ScaleZoom call it; a beat may too (a whip, a slam). */
export function useMotionBlur(id: string, radial: number, pan: [number, number] = [0, 0]): void {
  const store = useStageStore();
  const frame = useStageFrame();
  useLayoutEffect(() => {
    if (!store) return;
    store.radial.set(id, { frame, value: radial });
    store.pan.set(id, { frame, value: pan });
  });
}

/** Put the depth-of-field focus on a world point (sharp within `range` units of it). */
export const Focus: React.FC<{ at: V3; range?: number }> = ({ at, range = 1.5 }) => {
  const store = useStageStore();
  const frame = useStageFrame();
  useLayoutEffect(() => {
    if (store) store.focus = { frame, value: { at, range } };
  });
  return null;
};

const BLUR_FRAG = /* glsl */ `
uniform float radial;
uniform vec2 pan;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (radial < 0.0008 && length(pan) < 0.0008) { outputColor = inputColor; return; }
  vec4 acc = vec4(0.0);
  float wsum = 0.0;
  for (int i = 0; i < 16; i++) {
    float t = float(i) / 15.0 - 0.5;
    vec2 off = (uv - vec2(0.5)) * radial * t + pan * t;
    float w = 1.0 - abs(t) * 1.2;
    acc += texture2D(inputBuffer, uv - off) * w;
    wsum += w;
  }
  outputColor = acc / wsum;
}`;

class MotionBlurEffect extends Effect {
  constructor() {
    super("MotionBlurEffect", BLUR_FRAG, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([["radial", new THREE.Uniform(0)], ["pan", new THREE.Uniform(new THREE.Vector2())]]),
    });
  }
}

export type PostProps = {
  /** bloom strength (0 = off); only parts brighter than `threshold` (emissive > ~1) glow */
  bloom?: number;
  threshold?: number;
  /** depth of field: bokeh size (0 = off); focus from <Focus/>, else the camera's look-at distance */
  dof?: number;
  /** motion blur strength multiplier (0 = off) */
  blur?: number;
  vignette?: number;
};

/** The composer: render → DOF → bloom → motion blur → tone mapping → vignette. */
export const Post: React.FC<PostProps & { store: StageStore }> = ({ store, bloom = 0.9, threshold = 0.85, dof = 0, blur = 1, vignette = 0.45 }) => {
  const frame = useStageFrame();
  const mb = useMemo(() => new MotionBlurEffect(), []);
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const focusAt = useMemo(() => new THREE.Vector3(), []);
  // priority 0: runs before the composer (priority 1) draws the frame
  useFrame(() => {
    let radial = 0, px = 0, py = 0;
    for (const s of store.radial.values()) if (s.frame === frame) radial += s.value;
    for (const s of store.pan.values()) if (s.frame === frame) { px += s.value[0]; py += s.value[1]; }
    mb.uniforms.get("radial")!.value = Math.min(0.35, radial * blur);
    (mb.uniforms.get("pan")!.value as THREE.Vector2).set(Math.max(-0.06, Math.min(0.06, px * blur)), Math.max(-0.06, Math.min(0.06, py * blur)));
    const d = dofRef.current;
    const f = store.focus && store.focus.frame === frame ? store.focus.value : null;
    if (d) {
      if (f) {
        d.target = focusAt;
        focusAt.set(...f.at);
        d.cocMaterial.focusRange = f.range;
      } else {
        // no focus this frame: everything sharp (never a stale point from another scene)
        d.target = null;
        d.cocMaterial.focusDistance = 5;
        d.cocMaterial.focusRange = 1e4;
      }
    }
  });
  return (
    <EffectComposer multisampling={4} frameBufferType={THREE.HalfFloatType}>
      {dof > 0 ? <DepthOfField ref={dofRef} focusRange={1.5} bokehScale={dof} /> : <></>}
      {bloom > 0 ? <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={0.25} radius={0.7} /> : <></>}
      <primitive object={mb} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {vignette > 0 ? <Vignette eskil={false} offset={0.3} darkness={vignette} /> : <></>}
    </EffectComposer>
  );
};
