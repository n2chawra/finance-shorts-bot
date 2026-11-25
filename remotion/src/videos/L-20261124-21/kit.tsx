// kit: what this video's beats share (EUV lithography). Every beat reads its own params (the script's `moments`,
// `camera`, `labels`, `sign`, `fig`): a moment's `do` names an action of the place, which starts on its word and
// eases in; the camera's keys go to named anchors of the place at the shot size on each word; labels and
// figures land on anchors. All procedural; no figures in here (they come from params.fig).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
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
      return <Label3D key={i} at={at} offset={off} text={l.text} start={s} end={s + 48} px={px} color={i % 2 ? TECH.amber : TECH.cyan} align="left" />;
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
      overlay={<>{b.prm.tag ? <HonestTag kind={b.prm.tag} /> : null}<SourceLine p={p} y={120} /></>}>
      <Camera3D keys={camKeys(b, anchors, fov)} seed={`L2421-${seed}-${p.beat.id}`} />
      {dust && <Dust f={b.f} spec={{ ...dust, size: dust.size * 2.2, r0: dust.r0 * 0.8, r1: dust.r1 * 2.2, n: 5200 }} />}
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

// ------------------------------------------------------------------ this video's things (EUV lithography)
export const EUV = "#b48cff";
export const DEEP = "#6f4dff";
export const TIN = "#d9dee8";
export const LAB = { top: "#2a2142", bottom: "#0a0812", glow: "rgba(170,120,255,0.22)" };
export const FAB = { top: "#3a3014", bottom: "#0c0a04", glow: "rgba(255,210,90,0.16)" };

/** A drop of molten tin; `flat` 0..1 squashes it into a pancake, `lit` makes it glow violet. */
export const TinDrop: React.FC<Group & { r?: number; flat?: number; lit?: number }> = ({ r = 0.12, flat = 0, lit = 0, ...g }) => (
  <group {...g}>
    <group scale={[1 + flat * 2.4, 1 - flat * 0.82, 1 + flat * 2.4]}>
      <mesh material={mat("aluminium", TIN, { roughness: 0.32 })}><sphereGeometry args={[r, 20, 14]} /></mesh>
      {lit > 0.02 && <mesh material={glow(EUV, q(lit))}><sphereGeometry args={[r * 1.08, 14, 10]} /></mesh>}
    </group>
  </group>
);

/** The glowing ball of tin plasma: a white core in violet haloes, `k` 0..1 its size. */
export const PlasmaBall: React.FC<Group & { k: number; f: number }> = ({ k, f, ...g }) => k <= 0.02 ? null : (
  <group {...g} scale={q(k)}>
    <mesh material={glow("#ffffff", 1)}><sphereGeometry args={[0.2, 16, 12]} /></mesh>
    <mesh material={glow(EUV, 0.7)}><sphereGeometry args={[0.4 + 0.04 * Math.sin(f * 0.9), 16, 12]} /></mesh>
    <mesh material={glow(DEEP, 0.3)}><sphereGeometry args={[0.78, 16, 12]} /></mesh>
    <pointLight intensity={8 * q(k)} distance={10} color={EUV} />
  </group>
);

/** A curved multilayer mirror: a shallow bowl, its hollow facing +z, iridescent like the real coatings. */
export const Bowl: React.FC<Group & { R?: number; open?: number; lit?: number }> = ({ R = 2.2, open = 0.75, lit = 0, ...g }) => (
  <group {...g}>
    <mesh rotation-x={-Math.PI / 2} material={mat("silicon", "#4a4f8a", { side: 2, roughness: 0.08, metalness: 0.9, emissive: EUV, emissiveIntensity: 0.05 + 0.6 * q(lit) })}>
      <sphereGeometry args={[R, 40, 14, 0, Math.PI * 2, Math.PI - open, open]} />
    </mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -R * Math.cos(open) + 0.02]} material={mat("brushed", "#8b90a0")}>
      <torusGeometry args={[R * Math.sin(open), 0.06, 8, 48]} />
    </mesh>
  </group>
);

/** A flat multilayer mirror on its mount (a disc facing +y). */
export const FlatMirror: React.FC<Group & { r?: number; lit?: number }> = ({ r = 0.8, lit = 0, ...g }) => (
  <group {...g}>
    <mesh position={[0, -0.09, 0]} material={mat("brushed", "#7d8394")}><cylinderGeometry args={[r * 1.08, r * 1.12, 0.16, 36]} /></mesh>
    <mesh material={mat("silicon", "#5a5fa0", { roughness: 0.04, metalness: 0.95, emissive: EUV, emissiveIntensity: 0.05 + 0.7 * q(lit) })}><cylinderGeometry args={[r, r, 0.04, 36]} /></mesh>
  </group>
);

/** A wave drawn as a chain of glowing beads from x0 to x1 (wavelength `lambda`, height `amp`), shown up to `k`. */
export const Wave: React.FC<Group & { x0: number; x1: number; lambda: number; amp: number; k?: number; color?: string; phase?: number; r?: number }> = ({ x0, x1, lambda, amp, k = 1, color = EUV, phase = 0, r = 0.03, ...g }) => {
  const n = Math.max(8, Math.round(((x1 - x0) / lambda) * 14));
  const shown = Math.floor(n * Math.max(0, Math.min(1, k)));
  const pts: V3[] = Array.from({ length: shown + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return [x, amp * Math.sin(((x - x0) / lambda) * Math.PI * 2 + phase), 0];
  });
  return (
    <group {...g}>
      {pts.slice(1).map((p, i) => <Beam key={i} a={pts[i]!} b={p} r={r} color={color} o={0.95} />)}
    </group>
  );
};

/** A screen on a wall with a figure on it that counts up from its word (from params.fig). */
export const Screen: React.FC<Group & { b: BeatCtx; fig?: string; start: number; caption?: string; w?: number; h?: number; on?: boolean; again?: number }> = ({ b, fig, start, caption, w = 2.2, h = 1.1, on = true, again = 0, ...g }) => {
  const restart = again > 0 && b.f > start ? start + Math.floor((b.f - start) / again) * again : start;
  return (
    <group {...g}>
      <Block size={[w + 0.16, h + 0.16, 0.12]} radius={0.04} preset="blackPlastic" />
      <mesh position={[0, 0, 0.065]} material={mat("screen", "#05070f", { emissive: "#24124a", emissiveIntensity: on ? 0.8 : 0.2 })}><planeGeometry args={[w, h]} /></mesh>
      {fig && on && b.f >= start - 1 && <FigLabel3D fig={fig} caption={caption} at={[0, 0, 0.09]} start={restart} count={Math.min(26, again || 26)} face="front" height={h * 0.62} color={EUV} plate={false} />}
    </group>
  );
};

/** A question mark that rises on its word. */
export const Ask: React.FC<{ b: BeatCtx; name?: string; at: V3; px?: number }> = ({ b, name = "question", at, px = 140 }) =>
  b.has(name) ? <FigLabel3D fig="?" at={[at[0], at[1] + 0.3 * b.k(name, 12), at[2]]} start={b.at(name)} count={0} px={px} color={TECH.amber} plate={false} /> : null;

/** Seeded 0..1 noise per index (deterministic). */
export const r01 = (seed: string, i: number) => rnd(seed, i);
