// Atmos3D: weather and sea, deterministic and cheap: a cloud deck (a noise sheet plus soft sprite
// puffs), an ocean surface (displaced in the vertex shader, faceted; `oceanHeight` gives the same
// surface in JS so a ship can float and roll on it), a smoke column (soft sprites on a fixed life
// cycle) and rain streaks. Every one is a pure function of `frame`.
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd, type V3 } from "../core";
import { canvasTexture } from "../textures";
import { useDLook } from "./look";

// ---------------------------------------------------------------- cloud deck

const NOISE = /* glsl */ `
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }`;

export type CloudDeckProps = {
  frame: number;
  /** top of the deck (y) */
  y?: number;
  size?: number;
  /** 0 clear … 1 overcast */
  cover?: number;
  color?: string;
  shade?: string;
  /** soft sprite puffs on top for depth (clusters of camera-facing cumulus sprites) */
  puffs?: number;
  /** drift per frame (world units) */
  wind?: [number, number];
  seed?: string;
};

export const CloudDeck: React.FC<CloudDeckProps> = ({ frame, y = 0, size = 80, cover = 0.6, color, shade, puffs = 70, wind = [0.02, 0.006], seed = "clouds" }) => {
  const look = useDLook();
  const top = color ?? (look.clay ? "#f3eee6" : look.name === "storm" ? "#9aa3ad" : look.name === "nightGrid" ? "#5f7189" : "#c9d6e6");
  const low = shade ?? (look.clay ? "#b9b2a7" : look.name === "storm" ? "#3e464f" : look.name === "nightGrid" ? "#121b28" : "#4c5f78");
  const sheet = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uOff: { value: new THREE.Vector2() }, uCover: { value: cover }, uTop: { value: new THREE.Color(top) }, uLow: { value: new THREE.Color(low) }, uSize: { value: size } },
    vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `${NOISE}
      uniform vec2 uOff; uniform float uCover; uniform vec3 uTop; uniform vec3 uLow; uniform float uSize; varying vec2 vP;
      void main(){
        vec2 q = (vP + uOff) * 0.12;
        float n = fbm(q) + 0.35 * fbm(q * 3.1 + 7.0);
        float a = smoothstep(1.0 - uCover, 1.18 - uCover * 0.6, n);
        float edge = 1.0 - smoothstep(uSize * 0.32, uSize * 0.5, length(vP));
        float lit = smoothstep(0.3, 1.1, fbm(q * 1.7 - 3.0));
        gl_FragColor = vec4(mix(uLow, uTop, lit), a * edge);
      }`,
  }), [cover, top, low, size]);
  (sheet.uniforms.uOff!.value as THREE.Vector2).set(frame * wind[0], -frame * wind[1]);
  const tex = useMemo(() => cloudTexture(), []);
  const half = size * 0.38;
  // soft volume: each puff is a small cluster of camera-facing sprites (a cumulus texture lit from
  // above, drawn in code), tinted between the deck's shade and top colours; no geometry to facet
  const sprites = useMemo(() => {
    const out: { x: number; y: number; z: number; sx: number; sy: number; c: THREE.Color; a: number }[] = [];
    const cTop = new THREE.Color(top), cLow = new THREE.Color(low);
    for (let i = 0; i < puffs; i++) {
      const r = (k: number) => rnd(seed, i * 7 + k);
      const s = 0.9 + r(2) * 2.6;
      const n = 3 + Math.floor(r(3) * 2);
      for (let k = 0; k < n; k++) {
        const q = (j: number) => rnd(`${seed}c`, i * 31 + k * 5 + j);
        out.push({
          x: (r(0) * 2 - 1) * half + (q(0) - 0.5) * s * 1.4, y: (q(1) - 0.3) * s * 0.35, z: (r(1) * 2 - 1) * half + (q(2) - 0.5) * s * 1.1,
          sx: s * (1.5 + q(3) * 1.1), sy: s * (0.8 + q(4) * 0.45), c: cLow.clone().lerp(cTop, 0.45 + 0.55 * q(1)), a: 0.75 + q(0) * 0.25,
        });
      }
    }
    return out;
  }, [puffs, seed, top, low, half]);
  return (
    <group userData={{ noFail: true }}>
      <mesh rotation-x={-Math.PI / 2} position={[0, y - 0.3, 0]} material={sheet} renderOrder={1} userData={{ noFail: true }}>
        <planeGeometry args={[size, size, 1, 1]} />
      </mesh>
      {sprites.map((p, i) => {
        // wrap the drift so puffs stay over the deck; the cluster's anchor is scaled out to the deck
        const ax = p.x, az = p.z;
        const x = (((ax + frame * wind[0] + half) % (2 * half)) + 2 * half) % (2 * half) - half;
        return (
          <sprite key={i} position={[x, y + p.y + p.sy * 0.18, az - frame * wind[1]]} scale={[p.sx, p.sy, 1]} renderOrder={2} userData={{ noFail: true }}>
            <spriteMaterial map={tex} color={p.c} transparent opacity={p.a} depthWrite={false} fog />
          </sprite>
        );
      })}
    </group>
  );
};

/** A cumulus puff on a transparent canvas: overlapping soft lobes, a flat-ish base, lit from above
 * (white crown, grey underside). Seeded, drawn once. */
function cloudTexture(): THREE.Texture {
  return canvasTexture("dcloud-puff", 256, 160, (g) => {
    for (let i = 0; i < 14; i++) {
      const u = rnd("cloudtex", i), v = rnd("cloudtex", i + 40), w = rnd("cloudtex", i + 80);
      const x = 128 + (u - 0.5) * 150, r = 34 + w * 34, yb = 112 - r * 0.55 - Math.abs(u - 0.5) * 30 - v * 14;
      const grad = g.createRadialGradient(x, yb, 0, x, yb, r);
      grad.addColorStop(0, "rgba(255,255,255,0.55)");
      grad.addColorStop(0.6, "rgba(255,255,255,0.32)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 160);
    }
    // shade the underside: keep alpha, darken toward the base
    g.globalCompositeOperation = "source-atop";
    const sh = g.createLinearGradient(0, 30, 0, 140);
    sh.addColorStop(0, "rgba(255,255,255,0)");
    sh.addColorStop(1, "rgba(120,128,140,0.75)");
    g.fillStyle = sh;
    g.fillRect(0, 0, 256, 160);
    // feather the bottom edge so no straight line shows
    g.globalCompositeOperation = "destination-out";
    const fe = g.createLinearGradient(0, 118, 0, 160);
    fe.addColorStop(0, "rgba(0,0,0,0)");
    fe.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = fe;
    g.fillRect(0, 0, 256, 160);
    g.globalCompositeOperation = "source-over";
  });
}

// ---------------------------------------------------------------- ocean

export type Waves = { amp?: number; length?: number; speed?: number; dir?: number };
const WAVES = (w: Waves) => {
  const amp = w.amp ?? 0.12, len = w.length ?? 3, sp = w.speed ?? 0.05, d = w.dir ?? 0.4;
  return [
    { a: amp, k: (2 * Math.PI) / len, s: sp, dx: Math.cos(d), dz: Math.sin(d) },
    { a: amp * 0.55, k: (2 * Math.PI) / (len * 0.53), s: sp * 1.3, dx: Math.cos(d + 1.1), dz: Math.sin(d + 1.1) },
    { a: amp * 0.3, k: (2 * Math.PI) / (len * 0.31), s: sp * 1.7, dx: Math.cos(d - 0.9), dz: Math.sin(d - 0.9) },
  ];
};

/** The ocean's height at world (x, z) on this frame: the same sum of waves the shader draws. */
export function oceanHeight(x: number, z: number, frame: number, waves: Waves = {}): number {
  let h = 0;
  for (const w of WAVES(waves)) h += w.a * Math.sin((x * w.dx + z * w.dz) * w.k + frame * w.s * w.k * 2);
  return h;
}

/** How a floating thing pitches and rolls on the waves at (x, z): [roll about x, pitch about z]. */
export function oceanTilt(x: number, z: number, frame: number, waves: Waves = {}, half = 1): [number, number] {
  const dx = oceanHeight(x + half, z, frame, waves) - oceanHeight(x - half, z, frame, waves);
  const dz = oceanHeight(x, z + half, frame, waves) - oceanHeight(x, z - half, frame, waves);
  return [Math.atan2(dz, 2 * half), -Math.atan2(dx, 2 * half)];
}

export const Ocean: React.FC<{ frame: number; size?: number; segments?: number; color?: string; waves?: Waves; y?: number }> = ({ frame, size = 60, segments = 140, color, waves = {}, y = 0 }) => {
  const look = useDLook();
  const W = WAVES(waves);
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: color ?? look.water, roughness: 0.28, metalness: 0.1, flatShading: true });
    m.userData.uT = { value: 0 };
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = m.userData.uT;
      const terms = W.map((w) => `${w.a.toFixed(4)} * sin((wx * ${w.dx.toFixed(4)} + wz * ${w.dz.toFixed(4)}) * ${w.k.toFixed(4)} + uT * ${(w.s * w.k * 2).toFixed(5)})`).join(" + ");
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uT;")
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          float wx = position.x, wz = -position.y;
          transformed.z += ${terms};`);
    };
    m.customProgramCacheKey = () => `docean-${W.map((w) => `${w.a}${w.k}${w.dx}`).join()}`;
    return m;
  }, [color, look.water, waves.amp, waves.length, waves.speed, waves.dir]);
  (mat.userData.uT as { value: number }).value = frame;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, y, 0]} material={mat} receiveShadow userData={{ noFail: true }}>
      <planeGeometry args={[size, size, segments, segments]} />
    </mesh>
  );
};

// ---------------------------------------------------------------- smoke

function puffTexture(): THREE.Texture {
  return canvasTexture("dsmoke-puff", 128, 128, (g) => {
    for (let i = 0; i < 9; i++) {
      const x = 64 + (rnd("puff", i) - 0.5) * 40, y = 64 + (rnd("puff", i + 20) - 0.5) * 40, r = 22 + rnd("puff", i + 40) * 26;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(255,255,255,0.42)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
  });
}

export type SmokeProps = { frame: number; at: V3; height?: number; width?: number; count?: number; life?: number; wind?: V3; color?: string; opacity?: number; seed?: string; glow?: string };

/** A rising smoke column: puffs born at `at`, rising `height`, spreading to `width`, bent by `wind`;
 * `glow` tints the base (fire light) without showing fire. */
export const Smoke: React.FC<SmokeProps> = ({ frame, at, height = 5, width = 2.4, count = 34, life = 120, wind = [0.8, 0, 0], color = "#3a3d42", opacity = 0.8, seed = "smoke", glow }) => {
  const tex = useMemo(() => puffTexture(), []);
  return (
    <group userData={{ noFail: true }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rnd(seed, i * 5 + k);
        const age = (((frame + (i * life) / count + r(0) * 8) % life) + life) % life;
        const u = age / life;
        const rise = Math.pow(u, 0.8) * height;
        const pos: V3 = [at[0] + wind[0] * u * u * height * 0.5 + (r(1) - 0.5) * width * 0.3 * u, at[1] + rise, at[2] + wind[2] * u * u * height * 0.5 + (r(2) - 0.5) * width * 0.3 * u];
        const s = (0.35 + u * width) * (0.8 + r(3) * 0.4);
        const a = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.7) * opacity;
        const c = glow && u < 0.25 ? new THREE.Color(color).lerp(new THREE.Color(glow), (0.25 - u) * 3) : color;
        return (
          <sprite key={i} position={pos} scale={[s, s, s]} renderOrder={3} userData={{ noFail: true }}>
            <spriteMaterial map={tex} color={c} transparent opacity={a} depthWrite={false} rotation={r(4) * 6 + u * 1.2} fog />
          </sprite>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- rain

export type RainProps = { frame: number; center?: V3; size?: V3; count?: number; length?: number; speed?: number; wind?: [number, number]; color?: string; opacity?: number; seed?: string };

/** Rain streaks in a box around `center` (put it around the camera's view): line segments falling
 * at `speed` units a frame, slanted by `wind`. */
export const Rain: React.FC<RainProps> = ({ frame, center = [0, 3, 0], size = [14, 8, 14], count = 900, length = 0.35, speed = 0.55, wind = [0.12, 0.03], color = "#dfe8f2", opacity = 0.35, seed = "rain" }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    return g;
  }, [count]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const [sx, sy, sz] = size;
  for (let i = 0; i < count; i++) {
    const fall = (rnd(seed, i * 3) * sy + frame * speed * (0.8 + rnd(seed, i * 3 + 2) * 0.4)) % sy;
    const y = center[1] + sy / 2 - fall;
    const x = center[0] + (rnd(seed, i * 3 + 1) - 0.5) * sx + wind[0] * fall;
    const z = center[2] + (rnd(seed, i * 3 + 2) - 0.5) * sz + wind[1] * fall;
    arr.set([x, y, z, x - wind[0] * length, y + length, z - wind[1] * length], i * 6);
  }
  pos.needsUpdate = true;
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }), [color, opacity]);
  return <lineSegments geometry={geo} material={mat} frustumCulled={false} userData={{ noFail: true }} />;
};
