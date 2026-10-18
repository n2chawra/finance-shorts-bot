/**
 * Shared pieces for scenes: timing helpers, kinetic text, count-ups, cast members who act and
 * lip-sync, and the sets they act on. A scene is a pure function of its beat and local time.
 */
import React from "react";
import { AbsoluteFill, random, spring } from "remotion";
import type { Beat, PaletteT, Timeline } from "../contract/timeline";
import { CAST, type CastMember } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { blinkAt, settle } from "../cast/acting";
import { idle, mixPose, type Pose, STAND, STRIDE, walkLegs } from "../cast/rig";
import { visemeAt } from "../cast/visemes";
import { countUp } from "../fmt/inr";
import { FONT } from "../design/fonts";

export interface SceneProps {
  beat: Beat;
  tl: Timeline;
  frame: number;      // frame within the beat
  fps: number;
}

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => { const c = clamp(x); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

/** Seconds since the beat started. */
export const sec = (p: SceneProps) => p.frame / p.fps;
/** Seconds at which a named event happens in this beat (falls back to `dflt`). */
export const at = (p: SceneProps, name: string | undefined, dflt = 0) =>
  name !== undefined && name in p.beat.events ? p.beat.events[name]! / p.fps : dflt;
/** A 0..1 spring that starts at `start` seconds. */
export const pop = (p: SceneProps, start: number, damping = 12, stiffness = 140) =>
  p.frame / p.fps < start ? 0 : spring({ frame: p.frame - start * p.fps, fps: p.fps, config: { damping, stiffness, mass: 0.9 } });

export function str(v: unknown, d = ""): string { return typeof v === "string" ? v : d; }
export function num(v: unknown, d = 0): number { return typeof v === "number" ? v : d; }

// ---------------- text ----------------

export const Kinetic: React.FC<{
  text: string; p: SceneProps; start: number; size: number; color: string; weight?: number;
  x?: number; y: number; width?: number; align?: "center" | "left"; stagger?: number; shadow?: boolean;
}> = ({ text, p, start, size, color, weight = 800, x = 0, y, width, align = "center", stagger = 0.05, shadow = true }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: width ?? p.tl.width - x * 2, textAlign: align,
    fontFamily: FONT, fontWeight: weight, fontSize: size, color, lineHeight: 1.12, letterSpacing: -0.5,
    textShadow: shadow ? "0 6px 24px rgba(0,0,0,0.25)" : undefined,
  }}>
    {text.split(" ").map((w, i) => {
      const k = pop(p, start + i * stagger, 11, 170);
      return (
        <span key={i} style={{
          display: "inline-block", marginRight: size * 0.24, opacity: clamp(k * 2),
          transform: `translateY(${(1 - k) * size * 0.6}px) scale(${0.75 + 0.25 * k})`, filter: `blur(${(1 - clamp(k * 1.4)) * 8}px)`,
        }}>{w}</span>
      );
    })}
  </div>
);

export const Chip: React.FC<{ text: string; k: number; bg: string; fg: string; size?: number; style?: React.CSSProperties }> = ({ text, k, bg, fg, size = 34, style }) => (
  <span style={{
    display: "inline-block", padding: `${size * 0.3}px ${size * 0.75}px`, borderRadius: 999, background: bg, color: fg,
    fontFamily: FONT, fontWeight: 700, fontSize: size, opacity: clamp(k * 2), transform: `scale(${0.6 + 0.4 * k})`,
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)", ...style,
  }}>{text}</span>
);

/** A figure that counts up and lands exactly on Python's string at `land` seconds. */
export function counted(p: SceneProps, value: number, final: string, start: number, land: number): string {
  const t = sec(p);
  if (t >= land) return final;
  return countUp(value, ease((t - start) / Math.max(0.1, land - start)), final, "inr", p.tl.currency);
}

// ---------------- cast on stage ----------------

export interface ActSpec { at?: string; sec?: number; pose?: PoseName; expression?: Expression; turn?: number; x?: number; prop?: string }
export interface ActorSpec { who: string; x: number; scale?: number; enter?: "left" | "right"; exit?: "left" | "right"; acting?: ActSpec[]; turn?: number; gaze?: [number, number] }

const Phone = (x: number, y: number) => (
  <g transform={`translate(${x - 18},${y - 52})`}>
    <rect width={36} height={64} rx={7} fill="#1e2230" />
    <rect x={4} y={6} width={28} height={50} rx={4} fill="#8fe3d6" />
  </g>
);
const Letter = (x: number, y: number) => (
  <g transform={`translate(${x - 30},${y - 60}) rotate(-8)`}>
    <rect width={70} height={50} rx={4} fill="#ffffff" stroke="#c9ced8" strokeWidth={3} />
    <path d="M0,0 L35,26 L70,0" stroke="#c9ced8" strokeWidth={3} fill="none" />
    <rect x={8} y={32} width={26} height={8} rx={2} fill="#3b5bdb" />
  </g>
);
const Card = (x: number, y: number) => (
  <g transform={`translate(${x - 40},${y - 50}) rotate(-12)`}>
    <rect width={86} height={54} rx={8} fill="#3b5bdb" />
    <rect x={10} y={14} width={18} height={13} rx={3} fill="#ffd34d" />
    <rect x={10} y={36} width={60} height={6} rx={3} fill="#ffffff" opacity={0.7} />
  </g>
);
export const PROPS: Record<string, (x: number, y: number) => React.ReactNode> = { phone: Phone, letter: Letter, card: Card };

/**
 * A cast member acting through a beat: walks in or out, moves through key poses and expressions
 * at events, breathes and blinks, and lip-syncs when the beat's line is theirs.
 */
export const Actor: React.FC<{ p: SceneProps; spec: ActorSpec; ground: number; index: number }> = ({ p, spec, ground, index }) => {
  const member: CastMember | undefined = CAST[spec.who];
  if (!member) throw new Error(`unknown cast member ${spec.who}`);
  const t = sec(p);
  const W = p.tl.width;
  const scale = spec.scale ?? 1.25;
  const homeX = spec.x * W;
  const dur = p.beat.frames / p.fps;
  // entrances and exits are walks, so the feet move with the ground
  const enterDur = 1.1;
  let x = homeX, walking = false, walkTurn = 0;
  if (spec.enter) {
    const from = spec.enter === "left" ? -220 : W + 220;
    const k = ease(t / enterDur);
    x = from + (homeX - from) * k;
    walking = t < enterDur;
    walkTurn = spec.enter === "left" ? 0.85 : -0.85;
  }
  if (spec.exit && t > dur - 1.2) {
    const to = spec.exit === "left" ? -260 : W + 260;
    const k = ease((t - (dur - 1.2)) / 1.1);
    x = homeX + (to - homeX) * k;
    walking = k > 0 && k < 1;
    walkTurn = spec.exit === "left" ? -0.85 : 0.85;
  }
  // acting: blend from one key to the next as its event arrives
  let pose: Pose = { ...STAND, turn: spec.turn ?? 0 };
  let expression: Expression = "neutral";
  let prop: string | undefined;
  for (const a of spec.acting ?? []) {
    const start = a.sec ?? at(p, a.at, 0);
    if (t < start) break;
    const target: Pose = { ...(a.pose ? POSES[a.pose] : pose), turn: a.turn ?? pose.turn };
    pose = mixPose(pose, target, Math.min(1, settle((t - start) / 0.45)));
    if (a.expression) expression = a.expression;
    prop = a.prop ?? prop;
  }
  if (walking) pose = { ...pose, ...walkLegs(Math.abs(x - homeX) / STRIDE), turn: walkTurn };
  pose = idle(pose, t, index * 1.7);
  const v = p.beat.voice;
  const speaking = v && p.beat.speaker === spec.who;
  const viseme = speaking ? visemeAt(v.phonemes, t - v.start / p.fps) : null;
  const gaze = spec.gaze ?? [pose.turn * 0.6, 0];
  return (
    <Character id={`${p.beat.id}-${spec.who}`} look={member.look} pose={pose} expression={expression} viseme={viseme}
      blink={blinkAt(t, index + 1)} gaze={gaze} x={x} y={ground} scale={scale}
      holdL={prop ? PROPS[prop] : undefined} />
  );
};

// ---------------- sets ----------------

export const HomeSet: React.FC<{ w: number; h: number; ground: number; t: number }> = ({ w, h, ground, t }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e7d2" /><stop offset="1" stopColor="#ecd3b2" /></linearGradient>
      <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb98a" /><stop offset="1" stopColor="#ffe2bd" /></linearGradient>
    </defs>
    <rect width={w} height={h} fill="url(#hw)" />
    <g transform={`translate(${w * 0.62},${h * 0.13})`}>
      <rect width={w * 0.24} height={h * 0.34} rx={14} fill="#ffffff" />
      <rect x={16} y={16} width={w * 0.24 - 32} height={h * 0.34 - 32} rx={8} fill="url(#hsky)" />
      <circle cx={w * 0.17} cy={h * 0.1 + Math.sin(t * 0.3) * 4} r={28} fill="#fff4d6" opacity={0.9} />
      {[0.05, 0.11, 0.16, 0.2].map((fx, i) => <rect key={i} x={16 + w * fx - 20} y={h * 0.34 - 16 - (60 + i * 25)} width={40} height={60 + i * 25} fill="#c98a6a" opacity={0.55} />)}
    </g>
    <g transform={`translate(${w * 0.08},${ground - 260})`}>
      <rect x={0} y={150} width={330} height={110} rx={24} fill="#5a7bd6" />
      <rect x={10} y={90} width={310} height={90} rx={30} fill="#6b8cdf" />
      <rect x={-14} y={140} width={46} height={110} rx={20} fill="#4d6cc4" />
      <rect x={298} y={140} width={46} height={110} rx={20} fill="#4d6cc4" />
      <rect x={60} y={100} width={80} height={60} rx={14} fill="#ffd34d" transform={`rotate(-8 100 130)`} />
    </g>
    <rect x={0} y={ground - 10} width={w} height={h - ground + 10} fill="#c99a6b" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * (w / 12)} y={ground - 10} width={4} height={h} fill="#b5855a" />)}
    <rect x={0} y={ground - 18} width={w} height={12} fill="#e9d2b3" />
    <g transform={`translate(${w * 0.9},${ground - 10})`}>
      <path d="M-40,0 L-30,-90 L30,-90 L40,0Z" fill="#c2563a" />
      {[-0.6, -0.2, 0.2, 0.6].map((a, i) => <ellipse key={i} cx={Math.sin(a) * 60} cy={-130 - Math.cos(a) * 40} rx={22} ry={60} fill="#3f9b5b"
        transform={`rotate(${a * 50 + Math.sin(t * 1.2 + i) * 2} ${Math.sin(a) * 60} ${-130 - Math.cos(a) * 40})`} />)}
    </g>
  </svg>
);

export const StoreSet: React.FC<{ w: number; h: number; ground: number; t: number }> = ({ w, h, ground, t }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    <defs><linearGradient id="sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8f1fb" /><stop offset="1" stopColor="#d3e2f3" /></linearGradient></defs>
    <rect width={w} height={h} fill="url(#sw)" />
    <rect x={0} y={60} width={w} height={90} fill="#3b5bdb" />
    <text x={w / 2} y={122} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill="#ffffff">PHONE WORLD</text>
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i} transform={`translate(${w * 0.1 + i * w * 0.15},${h * 0.3})`}>
        <rect width={150} height={170} rx={14} fill="#ffffff" />
        <rect x={45} y={20} width={60} height={110} rx={10} fill="#1e2230" />
        <rect x={51} y={28} width={48} height={92} rx={6} fill={["#8fe3d6", "#ffb3c1", "#ffd34d", "#a5b4fc", "#86efac", "#fca5a5"][i]} opacity={0.7 + 0.3 * Math.sin(t * 2 + i)} />
        <rect x={35} y={140} width={80} height={14} rx={7} fill="#e2e8f0" />
      </g>
    ))}
    <rect x={w * 0.55} y={ground - 190} width={w * 0.4} height={190} rx={10} fill="#ffffff" />
    <rect x={w * 0.55} y={ground - 190} width={w * 0.4} height={22} rx={10} fill="#cbd5e1" />
    <rect x={0} y={ground - 10} width={w} height={h - ground + 10} fill="#9fb3c8" />
    <rect x={0} y={ground - 16} width={w} height={8} fill="#cfdbe8" />
  </svg>
);

/** A rich dark backdrop for data scenes: palette gradient, soft glows drifting, faint grid. */
export const DataSet: React.FC<{ pal: PaletteT; w: number; h: number; t: number; seed: string }> = ({ pal, w, h, t, seed }) => {
  const glows = [0, 1, 2].map((i) => ({
    x: w * (0.2 + 0.3 * i) + Math.sin(t * 0.3 + i * 2) * 80, y: h * (0.3 + 0.2 * (i % 2)) + Math.cos(t * 0.25 + i) * 60,
    c: pal.cast[i]!, r: 420 + 60 * i,
  }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${pal.bg}, ${pal.bgBottom})` }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <defs>{glows.map((g, i) => (
          <radialGradient key={i} id={`${seed}g${i}`}><stop offset="0" stopColor={g.c} stopOpacity={0.18} /><stop offset="1" stopColor={g.c} stopOpacity={0} /></radialGradient>
        ))}</defs>
        {glows.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r} fill={`url(#${seed}g${i})`} />)}
        {Array.from({ length: 40 }, (_, i) => {
          const rx = random(`${seed}x${i}`) * w, ry = random(`${seed}y${i}`) * h, sp = 10 + random(`${seed}s${i}`) * 25;
          return <circle key={i} cx={rx} cy={(ry - t * sp + h * 2) % h} r={1.5 + (i % 3)} fill={pal.text} opacity={0.12 + (i % 4) * 0.05} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const SETS = { home: HomeSet, store: StoreSet } as const;
