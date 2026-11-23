// kit: what this video's beats share. Every beat reads its own params (the script's `moments`, `camera`,
// `labels`, `sign`, `fig`): a moment's `do` names an action of the place, which starts on its word and
// eases in; the camera's keys go to named anchors of the place at the shot size on each word; labels and
// figures land on anchors. Models: the flat Starlink-style dish, a curved TV dish, the flat satellite with
// its solar wing, a box TV satellite, the Earth, houses, a router, a laptop, ground-station dishes, a data
// centre, stars, beams and ripples. All procedural; no figures in here (they come from params.fig).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, cue, FigLabel3D, glow, glowTexture, Label3D, mat, rnd, Stage3D, TECH, type CamKey, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const q = (x: number, n = 20) => Math.round(Math.max(0, Math.min(1, x)) * n) / n;
export const k01 = (f: number, a: number, d: number) => cue(f, a, Math.max(1, d), Easing.inOut(Easing.cubic));
export const BACK = { top: "#0d1428", bottom: "#03050b", glow: "rgba(90,150,255,0.10)" };
export const DUSK = { top: "#1d2552", bottom: "#c0603a", glow: "rgba(255,150,90,0.18)" };

type Moment = { at: string; do: string };
type CamP = { at?: string; sec?: number; size: "wide" | "medium" | "close" | "extreme"; on: string; move?: string };
type LabelP = { at?: string; sec?: number; text: string; on: string; fig?: string };
export type Params = {
  moments?: Moment[]; camera?: CamP[]; labels?: LabelP[]; fig?: Record<string, string>;
  sign?: { text: string; at: string; on: string }; tag?: "notToScale" | "illustration" | "recreation"; delay?: number | string;
};

/** A place's camera anchor: what it looks at, from which side, and the medium distance. */
export type Anchor = { look: V3; dir: V3; d: number };

export function useBeat(p: SceneProps) {
  const m = motion(p);
  const f = m.t;
  const prm = (p.beat.params ?? {}) as Params;
  const ev = p.beat.events;
  const fr = (a?: string, sec?: number) => (a && a in ev ? ev[a]! : Math.round((sec ?? 0) * p.fps));
  const acts: Record<string, number[]> = {};
  for (const mo of prm.moments ?? []) (acts[mo.do] ??= []).push(fr(mo.at));
  /** progress 0..1 of an action from its (first) word; 1 from frame 0 when it is a starting moment */
  const k = (name: string, dur = 14, dflt = 0, i = 0) => {
    const s = acts[name]?.[i];
    if (s === undefined) return dflt;
    if (s <= 2) return 1;
    return k01(f, s, dur);
  };
  const at = (name: string, dflt = Infinity, i = 0) => acts[name]?.[i] ?? dflt;
  const has = (name: string) => name in acts;
  return { m, f, prm, ev, fr, k, at, has, end: Math.max(m.end, 1), fig: prm.fig ?? {}, fps: p.fps };
}
export type BeatCtx = ReturnType<typeof useBeat>;

const along = (look: V3, dir: V3, d: number, yaw = 0): V3 => {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const dx = dir[0] * c + dir[2] * s, dz = -dir[0] * s + dir[2] * c;
  const l = Math.hypot(dx, dir[1], dz) || 1;
  return [look[0] + (dx / l) * d, look[1] + (dir[1] / l) * d, look[2] + (dz / l) * d];
};
const SIZE = { wide: 2.1, medium: 1, close: 0.5, extreme: 0.28 } as const;
const DIVE = Easing.bezier(0.7, 0, 0.2, 1);

/** The camera keys from params.camera: on each word it moves to its anchor at that shot size, then keeps
 * drifting in slowly until the next word, so it never parks. */
export function camKeys(b: BeatCtx, anchors: Record<string, Anchor>, fov = 38): CamKey[] {
  const cams = (b.prm.camera ?? []).map((c) => ({ ...c, f: b.fr(c.at, c.sec) })).sort((x, y) => x.f - y.f);
  if (!cams.length) cams.push({ size: "medium", on: Object.keys(anchors)[0]!, f: 0 });
  const keys: CamKey[] = [];
  const pose = (c: (typeof cams)[number], drift: number) => {
    const a = anchors[c.on] ?? Object.values(anchors)[0]!;
    return { pos: along(a.look, a.dir, a.d * SIZE[c.size] * (1 - 0.07 * drift), 0.05 * drift), look: a.look };
  };
  cams.forEach((c, i) => {
    const next = cams[i + 1]?.f ?? b.end + 10;
    if (i === 0) {
      const p0 = pose(c, -0.6);
      keys.push({ f: 0, pos: p0.pos, look: p0.look, fov });
    } else {
      const dur = c.move === "dive" ? 22 : Math.round(Math.max(14, Math.min(30, (next - c.f) * 0.6)));
      const p1 = pose(c, 0);
      keys.push({ f: c.f + dur, pos: p1.pos, look: p1.look, fov, ease: c.move === "dive" ? DIVE : Easing.inOut(Easing.cubic) });
    }
    const p2 = pose(c, 1);
    keys.push({ f: Math.max(next, (keys[keys.length - 1]!.f) + 2), pos: p2.pos, look: p2.look, fov, ease: Easing.linear });
  });
  // each move starts on its word: the camera is where the drift left it at that frame
  const out: CamKey[] = [];
  for (const kk of keys) out.push(kk);
  return out.sort((a, b2) => a.f - b2.f);
}

/** Labels, figures and the chapter sign from params, placed on the place's anchors. */
export const Words: React.FC<{ b: BeatCtx; pos: (on: string) => V3; signAt?: (on: string) => V3; px?: number; off?: V3; signH?: number }> = ({ b, pos, signAt, px = 50, off = [0.6, 0.6, 0], signH = 0.5 }) => (
  <group>
    {(b.prm.labels ?? []).map((l, i) => {
      const s = b.fr(l.at, l.sec);
      const at = pos(l.on);
      if (l.fig && b.fig[l.fig]) {
        return <FigLabel3D key={i} fig={b.fig[l.fig]!} at={[at[0] + off[0], at[1] + off[1] * 1.4, at[2]]} start={s} count={18} px={92} />;
      }
      return <Label3D key={i} at={at} offset={off} text={l.text} start={s} px={px} color={i % 2 ? TECH.amber : TECH.cyan} align="left" />;
    })}
    {b.prm.sign && signAt && (
      <FigLabel3D fig={b.prm.sign.text} at={signAt(b.prm.sign.on)} start={b.fr(b.prm.sign.at)} count={0} face="front" height={signH} color={TECH.white} />
    )}
  </group>
);

/** The beat's frame: one stage, its camera, and the honesty tag when the place asks for one. */
const TAGS = { notToScale: "NOT TO SCALE", illustration: "ILLUSTRATION", recreation: "3D RECREATION" } as const;
/** The honesty tag, top left, at a size a long video's layout rule accepts. */
export const HonestTag: React.FC<{ kind: keyof typeof TAGS }> = ({ kind }) => (
  <div style={{ position: "absolute", left: 150, top: 44, padding: "8px 18px", borderRadius: 8, background: "rgba(8,11,22,0.6)",
    border: "1.5px solid rgba(255,255,255,0.35)", fontFamily: "Poppins, sans-serif", fontSize: 34, fontWeight: 600, letterSpacing: 3, color: "#dfe5f2" }}>
    {TAGS[kind]}
  </div>
);

export type DustSpec = { c: V3; r0: number; r1: number; size: number; n?: number; color?: string };
/** Soft glowing motes all round the place (seeded), drifting slowly: the depth the dark stage needs. */
export const Dust: React.FC<{ f: number; spec: DustSpec }> = ({ f, spec }) => {
  const n = spec.n ?? 3600;
  const arr = React.useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rnd("dust", i * 3), v = rnd("dust", i * 3 + 1), w = rnd("dust", i * 3 + 2);
      const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), r = spec.r0 + (spec.r1 - spec.r0) * Math.sqrt(w);
      a[i * 3] = spec.c[0] + r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = spec.c[1] + r * Math.cos(ph);
      a[i * 3 + 2] = spec.c[2] + r * Math.sin(ph) * Math.sin(th);
    }
    return a;
  }, [n, spec.c, spec.r0, spec.r1]);
  return (
    <group position={spec.c} rotation-y={f * 0.0007}>
      <points position={[-spec.c[0], -spec.c[1], -spec.c[2]]} userData={{ noClip: true, noFade: true }}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[arr, 3]} /></bufferGeometry>
        <pointsMaterial map={glowTexture()} size={spec.size} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={2} color={spec.color ?? "#8fc2ff"} toneMapped={false} />
      </points>
    </group>
  );
};

export const Shot: React.FC<{ p: SceneProps; b: BeatCtx; anchors: Record<string, Anchor>; children: React.ReactNode; backdrop?: typeof BACK; floor?: boolean | "reflect";
  fog?: { color?: string; near: number; far: number }; bloom?: number; fov?: number; seed: string; shadowBox?: number; light?: number; dust?: DustSpec }> = ({ p, b, anchors, children, backdrop = BACK, floor = "reflect", fog, bloom = 1.1, fov = 38, seed, shadowBox = 10, light, dust }) => (
  <Freeze frame={b.f}>
    <Stage3D backdrop={backdrop} floor={floor} bloom={bloom} dof={0} blur={0.6} shadowBox={shadowBox} fog={fog} light={light}
      overlay={b.prm.tag ? <HonestTag kind={b.prm.tag} /> : undefined}>
      <Camera3D keys={camKeys(b, anchors, fov)} seed={`L2321-${seed}-${p.beat.id}`} />
      {dust && <Dust f={b.f} spec={dust} />}
      {children}
    </Stage3D>
  </Freeze>
);

// ------------------------------------------------------------------ light things
/** A glowing rod from a to b. */
export const Beam: React.FC<{ a: V3; b: V3; r?: number; color?: string; o?: number }> = ({ a, b, r = 0.04, color = TECH.cyan, o = 1 }) => {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const L = Math.hypot(d[0], d[1], d[2]);
  if (L < 1e-4 || o <= 0.01) return null;
  const th = Math.acos(Math.max(-1, Math.min(1, d[1] / L)));
  const ph = Math.atan2(d[0], d[2]);
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={[th, ph, 0, "YXZ"]} material={glow(color, q(o))}>
      <cylinderGeometry args={[r, r, L, 8, 1, true]} />
    </mesh>
  );
};
/** A cone of light from a (narrow) to b (wide): a radio beam. */
export const Cone: React.FC<{ a: V3; b: V3; r?: number; color?: string; o?: number }> = ({ a, b, r = 0.5, color = TECH.cyan, o = 0.3 }) => {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const L = Math.hypot(d[0], d[1], d[2]);
  if (L < 1e-4 || o <= 0.01) return null;
  const th = Math.acos(Math.max(-1, Math.min(1, d[1] / L)));
  const ph = Math.atan2(d[0], d[2]);
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={[th, ph, 0, "YXZ"]} material={glow(color, q(o))}>
      <cylinderGeometry args={[r, 0.02, L, 20, 1, true]} />
    </mesh>
  );
};
export const lerpV = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** A glowing ball travelling a→b over progress t (0..1), hidden outside it. */
export const Pulse: React.FC<{ a: V3; b: V3; t: number; r?: number; color?: string }> = ({ a, b, t, r = 0.12, color = TECH.white }) =>
  t <= 0 || t >= 1 ? null : <mesh position={lerpV(a, b, t)} material={glow(color, 1)}><sphereGeometry args={[r, 12, 8]} /></mesh>;
/** Rings spreading from a point (flat on the ground, or upright with `upright`), repeating. */
export const Ripples: React.FC<Group & { f: number; start: number; n?: number; reach?: number; period?: number; color?: string; upright?: boolean; o?: number }> = ({ f, start, n = 3, reach = 2, period = 24, color = TECH.cyan, upright = false, o = 1, ...g }) => {
  if (f < start || o <= 0) return null;
  return (
    <group {...g} rotation={upright ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}>
      {Array.from({ length: n }, (_, i) => {
        const u = (((f - start) / period + i / n) % 1);
        return (
          <mesh key={i} material={glow(color, q((1 - u) * 0.8 * o))}><torusGeometry args={[0.05 + u * reach, 0.012 + 0.01 * reach * 0.1, 6, 48]} /></mesh>
        );
      })}
    </group>
  );
};
/** A ring that pulses once around a point (a lock, a "nothing moves"). */
export const PulseRing: React.FC<{ f: number; start: number; at: V3; r?: number; color?: string; flat?: boolean }> = ({ f, start, at, r = 0.8, color = TECH.amber, flat = true }) => {
  if (f < start) return null;
  const u = ((f - start) % 30) / 30;
  return <mesh position={at} rotation={flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} material={glow(color, q(0.9 * (1 - u)))}><torusGeometry args={[r * (0.7 + 0.5 * u), 0.03, 6, 40]} /></mesh>;
};
/** Stars on a far dome (seeded). */
export const Stars: React.FC<{ n?: number; r?: number; bright?: number; seed?: string; f?: number; spin?: number }> = ({ n = 140, r = 60, bright = 0.6, seed = "stars", f = 0, spin = 0 }) => (
  <group rotation-y={f * spin}>
    {Array.from({ length: n }, (_, i) => {
      const u = rnd(seed, i * 3), v = rnd(seed, i * 3 + 1);
      const th = u * Math.PI * 2, ph = Math.acos(0.15 + 0.85 * v);
      return (
        <mesh key={i} position={[r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]} material={glow("#dfe8ff", q(bright * (0.4 + 0.6 * rnd(seed, i * 3 + 2))))}>
          <sphereGeometry args={[0.09 + 0.08 * rnd(seed, i), 6, 4]} />
        </mesh>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ the dish (flat, Starlink-style)
/** The flat dish: a white rectangular panel with rounded corners on a mast. `face` 0..1 lights its grid
 * of antennas from inside; `wave` 0..1 runs a light wave across it; `tilt` its fixed tilt. The panel's
 * centre is at y = mast + 0.05, facing up and a little toward +z. */
export const DISH = { w: 1.0, h: 1.45, t: 0.06, mast: 1.1 } as const;
export const FlatDish: React.FC<Group & { face?: number; wave?: number; waveDir?: number; xr?: number; tilt?: number }> = ({ face = 0, wave = -1, waveDir = 1, xr = 0, tilt = 0.45, ...g }) => {
  const { w, h, t, mast } = DISH;
  const n = 12, mrows = 17;
  return (
    <group {...g}>
      {/* mast and foot */}
      <mesh position={[0, mast / 2, 0]} material={mat("aluminium", "#d7dbe3")}><cylinderGeometry args={[0.045, 0.06, mast, 12]} /></mesh>
      <Block size={[0.5, 0.06, 0.5]} radius={0.02} preset="blackPlastic" position={[0, 0.03, 0]} />
      <group position={[0, mast + 0.05, 0]} rotation-x={-Math.PI / 2 + tilt}>
        {/* the white face */}
        <Block size={[w, h, t]} radius={0.12} material={mat("white", "#aab0bb", { roughness: 0.75, transparent: xr > 0, opacity: 1 - 0.75 * xr })} />
        {/* the grid inside: patches that light */}
        {(face > 0 || xr > 0) && Array.from({ length: n * mrows }, (_, i) => {
          const c = i % n, r = Math.floor(i / n);
          const x = (c - (n - 1) / 2) * (w * 0.072), y = (r - (mrows - 1) / 2) * (h * 0.053);
          const u = waveDir > 0 ? c / (n - 1) : 1 - c / (n - 1);
          const wv = wave >= 0 ? Math.max(0, 1 - Math.abs(u - wave) * 5) : 0;
          return <mesh key={i} position={[x, y, t / 2 + 0.004]} material={glow(wv > 0.1 ? TECH.white : TECH.cyan, q(0.08 + 0.55 * face + 0.4 * wv))}><planeGeometry args={[w * 0.045, h * 0.032]} /></mesh>;
        })}
      </group>
    </group>
  );
};
/** Where the flat dish's face points from (its centre), given the dish's group position. */
export const dishCentre = (base: V3): V3 => [base[0], base[1] + DISH.mast + 0.05, base[2]];

/** A curved TV dish on an arm: `yaw` and `pitch` aim it; `strain` reddens the mount. */
export const OldDish: React.FC<Group & { yaw?: number; pitch?: number; strain?: number; o?: number }> = ({ yaw = 0, pitch = 0.6, strain = 0, o = 1, ...g }) => (
  <group {...g}>
    <mesh position={[0, 0.4, 0]} material={mat("aluminium", "#9aa1ad")}><cylinderGeometry args={[0.04, 0.05, 0.8, 10]} /></mesh>
    <mesh position={[0, 0.82, 0]} material={strain > 0.05 ? glow("#ff4433", q(0.3 + 0.7 * strain)) : mat("blackPlastic")}><sphereGeometry args={[0.08, 12, 8]} /></mesh>
    <group position={[0, 0.85, 0]} rotation={[0, yaw, 0]}>
      <group rotation-x={-pitch}>
        {/* the bowl: a shallow spherical cap */}
        <mesh position={[0, 0, 0.05]} rotation-x={Math.PI / 2} material={mat("white", "#d9dde4", { side: 2, transparent: o < 1, opacity: o, roughness: 0.45 })}>
          <sphereGeometry args={[0.9, 28, 10, 0, Math.PI * 2, 0, 0.62]} />
        </mesh>
        {/* the feed arm and the horn at the focus */}
        <mesh position={[0, -0.25, 0.42]} rotation-x={0.55} material={mat("aluminium")}><cylinderGeometry args={[0.02, 0.02, 0.75, 6]} /></mesh>
        <mesh position={[0, 0, 0.75]} rotation-x={Math.PI / 2} material={mat("blackPlastic")}><cylinderGeometry args={[0.06, 0.08, 0.16, 10]} /></mesh>
      </group>
    </group>
  </group>
);

// ------------------------------------------------------------------ satellites
/** A flat broadband satellite: a thin rectangular body with arrays on its underside (`arrays` 0..1
 * lights them in turn, `n` of them) and one long solar wing. Its underside faces -y. */
export const FlatSat: React.FC<Group & { arrays?: number; n?: number; glowBody?: number }> = ({ arrays = 0, n = 5, glowBody = 0.3, ...g }) => (
  <group {...g}>
    <Block size={[1.4, 0.12, 0.7]} radius={0.03} material={mat("brushed", "#c2c8d3")} />
    <Block size={[1.38, 0.02, 0.68]} radius={0.01} preset="blackPlastic" position={[0, -0.07, 0]} />
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[-0.52 + i * (1.04 / Math.max(1, n - 1)), -0.085, (i % 2 ? 0.16 : -0.16)]} rotation-x={Math.PI / 2}
        material={glow(TECH.cyan, q(0.1 + 0.9 * Math.max(0, Math.min(1, arrays * n - i))))}>
        <planeGeometry args={[0.22, 0.22]} />
      </mesh>
    ))}
    {/* the solar wing on a boom */}
    <mesh position={[0, 0.12, 0]} material={mat("aluminium")}><cylinderGeometry args={[0.015, 0.015, 0.2, 6]} /></mesh>
    <group position={[0, 0.24, 0]} rotation-x={-0.25}>
      <Block size={[0.7, 0.02, 3.2]} radius={0.005} material={mat("silicon", "#1d2a6b", { emissive: "#1a2a7a", emissiveIntensity: 0.2 * glowBody })} position={[0, 0, -1.7]} />
      {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[0, 0.012, -0.25 - i * 0.4]} rotation-x={-Math.PI / 2} material={glow("#6f8cff", 0.25)}><planeGeometry args={[0.68, 0.01]} /></mesh>)}
    </group>
  </group>
);

/** A boxy TV satellite with two panels. */
export const BoxSat: React.FC<Group & { lit?: number }> = ({ lit = 0.4, ...g }) => (
  <group {...g}>
    <Block size={[0.5, 0.5, 0.5]} radius={0.03} material={mat("gold", "#d9a74a")} />
    <mesh position={[0, 0, 0.3]} rotation-x={Math.PI / 2} material={mat("white")}><sphereGeometry args={[0.22, 16, 6, 0, Math.PI * 2, 0, 0.7]} /></mesh>
    {[-1, 1].map((s) => (
      <Block key={s} size={[1.3, 0.02, 0.42]} radius={0.005} material={mat("silicon", "#1d2a6b", { emissive: "#2a3fb0", emissiveIntensity: 0.3 * lit })} position={[s * 0.95, 0, 0]} />
    ))}
    <mesh material={glow(TECH.amber, q(0.3 + 0.7 * lit))} position={[0, 0.3, 0]}><sphereGeometry args={[0.05, 8, 6]} /></mesh>
  </group>
);

// ------------------------------------------------------------------ the Earth
/** The Earth, radius R: ocean, seeded land patches, a glowing atmosphere, night-side city lights. */
export const Earth: React.FC<Group & { R?: number; spin?: number; lights?: number }> = ({ R = 1, spin = 0, lights = 0.6, ...g }) => (
  <group {...g}>
    <group rotation-y={spin}>
      <mesh material={mat("clay", "#0c2650", { roughness: 0.85 })}><sphereGeometry args={[R, 64, 40]} /></mesh>
      {Array.from({ length: 90 }, (_, i) => {
        const la = (rnd("land", i) - 0.5) * 2.4, lo = rnd("land", i + 500) * Math.PI * 2;
        const cl = Math.floor(rnd("land", i + 900) * 3);
        const cx = Math.floor(i / 10);
        const la2 = la * 0.6 + (cx % 3 - 1) * 0.5, lo2 = (cx * 0.7 + lo * 0.25);
        const p: V3 = [R * 0.965 * Math.cos(la2) * Math.cos(lo2), R * 0.965 * Math.sin(la2), R * 0.965 * Math.cos(la2) * Math.sin(lo2)];
        return (
          <mesh key={i} position={p} scale={R} material={mat("clay", ["#3d6a3c", "#7c6c4c", "#4b7444"][cl], { roughness: 0.95 })}>
            <sphereGeometry args={[0.07 + 0.08 * rnd("land", i + 1300), 14, 8]} />
          </mesh>
        );
      })}
      {Array.from({ length: 60 }, (_, i) => {
        const la = (rnd("city", i) - 0.5) * 1.8, lo = Math.PI * (0.7 + 0.9 * rnd("city", i + 77));
        return <mesh key={`c${i}`} position={[R * 1.006 * Math.cos(la) * Math.cos(lo), R * 1.006 * Math.sin(la), R * 1.006 * Math.cos(la) * Math.sin(lo)]} material={glow("#ffcf7a", q(lights * (0.5 + 0.5 * rnd("city", i + 9))))}><sphereGeometry args={[R * 0.008, 6, 4]} /></mesh>;
      })}
    </group>
    <mesh scale={1.04} material={mat("white", "#5aa8ff", { emissive: "#5aa8ff", emissiveIntensity: 1.6, transparent: true, opacity: 0.22, side: 1, depthWrite: false })}><sphereGeometry args={[R, 48, 32]} /></mesh>
    <group rotation-y={spin}>
      {Array.from({ length: 12 }, (_, i) => <mesh key={`m${i}`} rotation={[0, (i * Math.PI) / 12, 0]} material={glow("#7fb8ff", 0.22)}><torusGeometry args={[R * 1.004, R * 0.0025, 4, 96]} /></mesh>)}
      {[-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map((la, i) => <mesh key={`p${i}`} position={[0, R * Math.sin(la), 0]} rotation-x={Math.PI / 2} material={glow("#7fb8ff", 0.22)}><torusGeometry args={[R * 1.004 * Math.cos(la), R * 0.0025, 4, 96]} /></mesh>)}
    </group>
  </group>
);
/** A point on a sphere of radius r at latitude/longitude (radians). */
export const sph = (r: number, lat: number, lon: number): V3 => [r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lon)];

/** A ring in the equatorial plane (or tilted by `tilt` about x). */
export const Orbit: React.FC<{ r: number; color?: string; o?: number; tilt?: number; arc?: number; tube?: number }> = ({ r, color = TECH.cyan, o = 0.6, tilt = 0, arc = Math.PI * 2, tube }) =>
  o <= 0.01 ? null : (
    <mesh rotation={[Math.PI / 2 + tilt, 0, 0]} material={glow(color, q(o))}><torusGeometry args={[r, tube ?? r * 0.004, 6, 160, arc]} /></mesh>
  );

// ------------------------------------------------------------------ houses and rooms
/** A small house: walls, a pitched roof, lit windows (`lights`), its door facing +z. */
export const House: React.FC<Group & { w?: number; d?: number; h?: number; color?: string; lights?: number; tv?: number; seed?: string }> = ({ w = 3, d = 3, h = 2, color = "#c9b79c", lights = 0.5, tv = 0, seed = "h", ...g }) => (
  <group {...g}>
    <Block size={[w, h, d]} radius={0.04} material={mat("clay", color)} position={[0, h / 2, 0]} />
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0, h + 0.55, s * d * 0.27]} rotation-x={s * 0.62} material={mat("clay", "#4a3a36", { roughness: 0.8 })}><boxGeometry args={[w + 0.3, 0.1, d * 0.62]} /></mesh>
    ))}
    {[-0.28, 0.28].map((x, i) => (
      <mesh key={i} position={[x * w, h * 0.55, d / 2 + 0.01]} material={glow(i === 0 && tv > 0 ? "#6fa8ff" : "#ffcf7a", q(lights * (0.5 + 0.5 * rnd(seed, i)) + (i === 0 ? tv * 0.5 : 0)))}><planeGeometry args={[w * 0.22, h * 0.3]} /></mesh>
    ))}
    <mesh position={[0, h * 0.25, d / 2 + 0.01]} material={mat("clay", "#5b4033")}><planeGeometry args={[w * 0.16, h * 0.5]} /></mesh>
  </group>
);

/** A router: a small box, its lights `lit` 0..1, `blip` flashes them. */
export const Router: React.FC<Group & { lit?: number; blip?: number }> = ({ lit = 0.5, blip = 0, ...g }) => (
  <group {...g}>
    <Block size={[0.5, 0.7, 0.22]} radius={0.06} material={mat("white", "#e9ecf2")} position={[0, 0.35, 0]} />
    {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.5 - i * 0.12, 0.115]} material={glow(i === 2 && blip > 0.3 ? TECH.amber : TECH.lime, q(0.2 + 0.8 * lit))}><circleGeometry args={[0.025, 10]} /></mesh>)}
  </group>
);

/** A laptop, open; `screen` 0..1 lights it; children draw on the screen plane (local, facing +z). */
export const Laptop: React.FC<Group & { screen?: number; children?: React.ReactNode }> = ({ screen = 0.6, children, ...g }) => (
  <group {...g}>
    <Block size={[1.4, 0.05, 0.95]} radius={0.03} material={mat("aluminium", "#aeb4bf")} position={[0, 0.025, 0]} />
    <group position={[0, 0.05, -0.47]} rotation-x={-0.25}>
      <Block size={[1.4, 0.9, 0.04]} radius={0.03} material={mat("aluminium", "#aeb4bf")} position={[0, 0.45, -0.01]} />
      <mesh position={[0, 0.46, 0.012]} material={mat("screen", undefined, { emissiveIntensity: 0.2 + 1.1 * screen })}><planeGeometry args={[1.28, 0.78]} /></mesh>
      <group position={[0, 0.46, 0.02]}>{children}</group>
    </group>
  </group>
);

/** A ground-station dish: a big curved bowl looking up, on a pedestal. */
export const GroundDish: React.FC<Group & { lit?: number }> = ({ lit = 0, ...g }) => (
  <group {...g}>
    <mesh position={[0, 0.5, 0]} material={mat("clay", "#cfd3da")}><cylinderGeometry args={[0.18, 0.28, 1, 10]} /></mesh>
    <group position={[0, 1.05, 0]} rotation-x={-0.5}>
      <mesh rotation-x={Math.PI} material={mat("white", "#e3e6ec", { side: 2 })}><sphereGeometry args={[0.9, 24, 8, 0, Math.PI * 2, 0, 0.7]} /></mesh>
      <mesh position={[0, 0.55, 0]} material={glow(TECH.cyan, q(0.2 + 0.8 * lit))}><sphereGeometry args={[0.07, 8, 6]} /></mesh>
    </group>
  </group>
);

/** A data centre: a long low hall with rows of lit windows. */
export const DataCentre: React.FC<Group & { lit?: number }> = ({ lit = 0, ...g }) => (
  <group {...g}>
    <Block size={[5, 1.6, 2.6]} radius={0.04} material={mat("clay", "#7d8595")} position={[0, 0.8, 0]} />
    {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[-2.2 + i * 0.49, 0.9, 1.31]} material={glow(TECH.cyan, q(0.08 + 0.8 * lit * (0.6 + 0.4 * rnd("dc", i))))}><planeGeometry args={[0.3, 0.7]} /></mesh>)}
    {[-1.5, 0, 1.5].map((x, i) => <Block key={i} size={[0.6, 0.4, 0.6]} radius={0.02} preset="aluminium" position={[x, 1.8, 0]} />)}
  </group>
);
export default Shot;

/** A flat grid of small dots on a wall (pegboard holes, rivets), in one draw call. `w`×`h` in the
 * x-y plane at `z`, `gap` apart. */
export const DotGrid: React.FC<{ x0: number; x1: number; y0: number; y1: number; z: number; gap: number; size?: number; color?: string; glowing?: boolean }> = ({ x0, x1, y0, y1, z, gap, size = 0.06, color = "#05070b", glowing = false }) => {
  const arr = React.useMemo(() => {
    const pts: number[] = [];
    for (let x = x0; x <= x1; x += gap) for (let y = y0; y <= y1; y += gap) pts.push(x, y, z);
    return new Float32Array(pts);
  }, [x0, x1, y0, y1, z, gap]);
  return (
    <points userData={{ noClip: true, noFade: true }}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[arr, 3]} /></bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation color={color} transparent={glowing} opacity={glowing ? 0.6 : 1} blending={glowing ? 2 : 1} toneMapped={!glowing} depthWrite={!glowing} map={glowing ? glowTexture() : null} />
    </points>
  );
};
/** Thin lines across a wall: panelling, tiles, a measuring grid. */
export const Lines: React.FC<{ from: number; to: number; step: number; along: "x" | "y"; span: [number, number]; z: number; color?: string; o?: number; r?: number }> = ({ from, to, step, along, span, z, color = "#0a0d14", o = 1, r = 0.012 }) => (
  <group>
    {Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => {
      const v = from + i * step;
      return along === "x"
        ? <mesh key={i} position={[v, (span[0] + span[1]) / 2, z]} material={mat("clay", color, { transparent: o < 1, opacity: o })}><boxGeometry args={[r * 2, span[1] - span[0], r]} /></mesh>
        : <mesh key={i} position={[(span[0] + span[1]) / 2, v, z]} material={mat("clay", color, { transparent: o < 1, opacity: o })}><boxGeometry args={[span[1] - span[0], r * 2, r]} /></mesh>;
    })}
  </group>
);
