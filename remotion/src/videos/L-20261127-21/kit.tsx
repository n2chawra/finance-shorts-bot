// kit: what this video's beats share (how a chatbot turns a question into an answer). Every beat reads its own params (the script's `moments`,
// `camera`, `labels`, `sign`, `fig`): a moment's `do` names an action of the place, which starts on its word and
// eases in; the camera's keys go to named anchors of the place at the shot size on each word; labels and
// figures land on anchors. All procedural; no figures in here (they come from params.fig).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Block, Board, Camera3D, cue, useFontReady, FigLabel3D, glow, glowTexture, Label3D, mat, rnd, Stage3D, TECH, type CamKey, type V3 } from "../../three/index";

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
  // an orbit key turns on round the same anchor at the same size; any other key starts from the front again
  let turn = 0;
  const yaws = cams.map((c) => (turn = c.move === "orbit" ? turn + 0.12 : 0));
  const pose = (c: (typeof cams)[number], drift: number, i: number) => {
    const a = anchors[c.on] ?? Object.values(anchors)[0]!;
    return { pos: along(a.look, a.dir, a.d * SIZE[c.size] * (1 - 0.05 * drift), yaws[i]! + 0.04 * drift), look: a.look };
  };
  cams.forEach((c, i) => {
    const next = cams[i + 1]?.f ?? b.end + 10;
    if (i === 0) {
      const p0 = pose(c, -0.6, i);
      keys.push({ f: 0, pos: p0.pos, look: p0.look, fov });
    } else {
      const dur = c.move === "cut" ? 1 : c.move === "dive" ? 22 : Math.round(Math.max(14, Math.min(30, (next - c.f) * 0.6)));
      const p1 = pose(c, 0, i);
      keys.push({ f: c.f + dur, pos: p1.pos, look: p1.look, fov, ease: c.move === "dive" ? DIVE : Easing.inOut(Easing.cubic) });
    }
    const p2 = pose(c, 1, i);
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
  fog?: { color?: string; near: number; far: number }; bloom?: number; fov?: number; seed: string; shadowBox?: number; light?: number; dust?: DustSpec }> = ({ p, b, anchors, children, backdrop = BACK, floor = "reflect", fog, bloom = 1.1, fov = 38, seed, shadowBox = 10, light, dust }) => {
  // hold the shot until the label fonts are loaded, so painted words show from a render tab's first frame
  const f6 = useFontReady(600), f7 = useFontReady(700), f8 = useFontReady(800);
  if (!(f6 && f7 && f8)) return null;
  return (
  <Freeze frame={b.f}>
    <Stage3D backdrop={backdrop} floor={floor} bloom={bloom} dof={0} blur={0.6} shadowBox={shadowBox} fog={fog} light={light}
      overlay={<>{b.prm.tag ? <HonestTag kind={b.prm.tag} /> : null}<SourceLine p={p} y={120} /></>}>
      <Camera3D keys={camKeys(b, anchors, fov)} seed={`L2721-${seed}-${p.beat.id}`} />
      {dust && <Dust f={b.f} spec={{ ...dust, size: dust.size * 2.2, r0: dust.r0 * 0.8, r1: dust.r1 * 2.2, n: 9000 }} />}
      {children}
    </Stage3D>
  </Freeze>
  );
};

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


// ------------------------------------------------------------------ this video's things (a chatbot's answer)
export const NIGHT = { top: "#101a3a", bottom: "#03050c", glow: "rgba(80,140,255,0.14)" };
export const HALL = { top: "#0b1f2a", bottom: "#020608", glow: "rgba(60,220,255,0.12)" };
export const WARM = { top: "#2a1c10", bottom: "#070403", glow: "rgba(255,170,80,0.14)" };
export const VIOLET = { top: "#1e1438", bottom: "#05030c", glow: "rgba(150,110,255,0.16)" };
export const TEAL = { top: "#0c2626", bottom: "#020707", glow: "rgba(80,255,200,0.12)" };
/** token colours, in turn */
export const TOK = ["#38e1ff", "#ffb340", "#9dff5c", "#ff7ab8", "#b48cff", "#ffd75a"];
/** The example question and answer, cut into tokens (spaces belong to the token after them, as in a real tokenizer). */
export const Q_TOKENS = ["Why", " is", " the", " sky", " blue", "?"];
export const A_TOKENS = ["Sun", "light", " scatters", " off", " the", " air", ","];

/** A token tile: a rounded slab with its text painted on the front; `lit` glows its edge. */
export const Tile: React.FC<Group & { text: string; color?: string; w?: number; lit?: number; o?: number; textH?: number; start?: number }> = ({ text, color = TECH.cyan, w = 1, lit = 0.6, o = 1, textH = 0.34, start = 0, ...g }) => (
  <group {...g}>
    <Block size={[w, 0.62, 0.14]} radius={0.06} material={mat("glossy", "#141a2c", { roughness: 0.3 })} />
    <mesh position={[0, 0, 0.072]} material={mat("clay", color, { emissive: color, emissiveIntensity: q(0.15 + 0.35 * lit), transparent: o < 1, opacity: q(o) })}><planeGeometry args={[w * 0.94, 0.56]} /></mesh>
    {text.trim().length > 0 && o > 0.3 && <FigLabel3D fig={text.trim()} at={[0, 0, 0.09]} start={start} count={0} face="front" height={textH} color="#14161c" plate={false} />}
  </group>
);

/** A column of glowing bars: one token's list of numbers. Heights come from a seed; `shift` moves them. */
export const Column: React.FC<Group & { seed: string; n?: number; color?: string; shift?: number; k?: number; tint?: string; mix?: number }> = ({ seed, n = 10, color = TECH.cyan, shift = 0, k = 1, tint, mix = 0, ...g }) => (
  <group {...g}>
    {Array.from({ length: n }, (_, i) => {
      const h0 = 0.25 + 0.75 * rnd(seed, i);
      const h1 = 0.25 + 0.75 * rnd(seed + "b", i);
      const h = (h0 + (h1 - h0) * shift) * Math.max(0.02, k);
      const c = tint && mix > 0.5 ? tint : color;
      return (
        <mesh key={i} position={[h / 2 - 0.5, i * 0.16, 0]} material={glow(c, q(0.45 + 0.5 * (i % 3 === 0 ? 1 : 0.6)))}>
          <boxGeometry args={[Math.max(0.02, h), 0.11, 0.11]} />
        </mesh>
      );
    })}
  </group>
);

/** Little glowing beads flowing a→b (the parameters on the move), `t` the running time. */
export const Beads: React.FC<{ a: V3; b: V3; t: number; n?: number; color?: string; r?: number; spread?: number; o?: number }> = ({ a, b, t, n = 14, color = TECH.amber, r = 0.05, spread = 0.2, o = 1 }) => o <= 0.02 ? null : (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const u = ((t / 30 + i / n) % 1 + 1) % 1;
      const j = (rnd("bead", i) - 0.5) * spread, l = (rnd("bead", i + 99) - 0.5) * spread;
      return <mesh key={i} position={[a[0] + (b[0] - a[0]) * u + j, a[1] + (b[1] - a[1]) * u + l, a[2] + (b[2] - a[2]) * u]} material={glow(color, q(o))}><sphereGeometry args={[r, 8, 6]} /></mesh>;
    })}
  </group>
);

/** A graphics chip seen up close: substrate, the big die as a grid of maths units, memory stacks either side. */
export const BigChip: React.FC<Group & { f: number; grid?: number; wave?: number; lit?: number; mem?: number; cols?: number; hot?: number }> = ({ f, grid = 0, wave = -1, lit = 0.3, mem = 0.3, cols = 14, hot = -1, ...g }) => {
  const S = 2.4, cell = S / cols;
  return (
    <group {...g}>
      <Board size={[12, 8]} seed="bigchip-board" parts={50} dark position={[0, -0.12, 0]} />
      <Block size={[S + 0.2, 0.08, S + 0.2]} radius={0.03} preset="blackPlastic" position={[0, 0.04, 0]} />
      {Array.from({ length: cols * cols }, (_, i) => {
        const x = (i % cols) - (cols - 1) / 2, z = Math.floor(i / cols) - (cols - 1) / 2;
        const d = Math.hypot(x, z) / cols;
        const show = grid >= 1 ? 1 : grid > d * 1.6 ? 1 : 0;
        if (!show) return null;
        const wv = wave >= 0 ? Math.max(0, 1 - Math.abs(((x + cols / 2) / cols) - wave) * 6) : 0;
        const isHot = i === hot;
        return <mesh key={i} position={[x * cell, 0.09, z * cell]} rotation-x={-Math.PI / 2} material={glow(isHot ? TECH.amber : wv > 0.3 ? TECH.white : TECH.cyan, q(Math.min(1, lit * 0.6 + 0.15 + wv * 0.8 + (isHot ? 0.6 : 0))))}><planeGeometry args={[cell * 0.78, cell * 0.78]} /></mesh>;
      })}
      {[-1, 1].map((s) => [0, 1].map((j) => (
        <group key={`${s}-${j}`} position={[s * 2.05, 0, -0.55 + j * 1.1]}>
          {Array.from({ length: 6 }, (_, l) => (
            <Block key={l} size={[0.7, 0.07, 0.9]} radius={0.01} material={mat("silicon", "#3c4466", { emissive: TECH.amber, emissiveIntensity: q(mem * (l % 2 ? 0.9 : 0.5)) })} position={[0, 0.04 + l * 0.08, 0]} />
          ))}
        </group>
      )))}
      <pointLight position={[0, 1.2, 0.6]} intensity={2 + 5 * lit} distance={6} color={TECH.cyan} />
    </group>
  );
};

/** A question mark that rises on its word. */
export const Ask: React.FC<{ b: BeatCtx; name?: string; at: V3; px?: number }> = ({ b, name = "question", at, px = 140 }) =>
  b.has(name) ? <FigLabel3D fig="?" at={[at[0], at[1] + 0.3 * b.k(name, 12), at[2]]} start={b.at(name)} count={0} px={px} color={TECH.amber} plate={false} /> : null;

/** Seeded 0..1 noise per index (deterministic). */
export const r01 = (seed: string, i: number) => rnd(seed, i);

/** A grid of fine lines on the floor (y = `y`): a cutting mat, floor tiles; gives a dark floor its texture. */
export const FloorGrid: React.FC<{ x0: number; x1: number; z0: number; z1: number; y?: number; step?: number; color?: string; o?: number }> = ({ x0, x1, z0, z1, y = 0.005, step = 0.5, color = "#2a3550", o = 0.8 }) => (
  <group>
    {Array.from({ length: Math.floor((x1 - x0) / step) + 1 }, (_, i) => <mesh key={`x${i}`} position={[x0 + i * step, y, (z0 + z1) / 2]} material={glow(color, o)}><boxGeometry args={[0.015, 0.002, z1 - z0]} /></mesh>)}
    {Array.from({ length: Math.floor((z1 - z0) / step) + 1 }, (_, i) => <mesh key={`z${i}`} position={[(x0 + x1) / 2, y, z0 + i * step]} material={glow(color, o)}><boxGeometry args={[x1 - x0, 0.002, 0.015]} /></mesh>)}
  </group>
);
