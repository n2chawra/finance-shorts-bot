/**
 * The look's texture overlays and shared helpers for the disaster kit. Every overlay is drawn in code
 * (SVG patterns, seeded feTurbulence, seeded specks): deterministic, no image files, cheap to render.
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { lookOf, type LookProp, type TextureKind, useDisasterLook } from "./looks";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
export const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
/** 0 → 1 over `len` frames from frame `at` (undefined `at`: already done). */
export const ease = (t: number, at: number | undefined, len = 12) => (at === undefined ? 1 : smooth((t - at) / len));
/** Characters shown of `s` while it types on from frame `at` (`cps` characters a frame). */
export const typed = (s: string, t: number, at: number | undefined, cps = 1.4) =>
  at === undefined ? s : s.slice(0, Math.max(0, Math.floor((t - at) * cps)));
/** seeded 0..1 randomness (never Math.random) */
export const rnd = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };

/** The frame's background for a look: its two-tone gradient. */
export const LookBackground: React.FC<LookProp> = ({ look }) => {
  const L = useDisasterLook(look === undefined ? undefined : lookOf(look));
  return <AbsoluteFill style={{ background: `linear-gradient(180deg, ${L.bg[0]}, ${L.bg[1]})` }} />;
};

const Layer: React.FC<{ kind: TextureKind; o: number; t: number; w: number; h: number; ink: string; id: string }> = ({ kind, o, t, w, h, ink, id }) => {
  if (kind === "none" || o <= 0) return null;
  const step = Math.floor(t / 2);
  if (kind === "grid" || kind === "hatch") {
    const s = kind === "grid" ? Math.round(Math.min(w, h) / 18) : 14;
    return (
      <g opacity={o}>
        <defs>
          <pattern id={`${id}p`} width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={kind === "hatch" ? "rotate(45)" : undefined}>
            {kind === "grid" ? <path d={`M ${s} 0 L 0 0 0 ${s}`} fill="none" stroke={ink} strokeWidth={1} /> : <line x1={0} y1={0} x2={0} y2={s} stroke={ink} strokeWidth={1} />}
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${id}p)`} />
      </g>
    );
  }
  if (kind === "scanline") {
    return (
      <g opacity={o}>
        <defs>
          <pattern id={`${id}p`} width={4} height={4} patternUnits="userSpaceOnUse"><rect width={4} height={2} fill="#000" /></pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${id}p)`} />
        <rect y={((t * 9) % (h + 200)) - 200} width={w} height={200} fill="#fff" opacity={0.04} />
      </g>
    );
  }
  if (kind === "halftone") {
    return (
      <g opacity={o}>
        <defs>
          <pattern id={`${id}p`} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx={4} cy={4} r={1.6} fill="#000" /></pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${id}p)`} />
      </g>
    );
  }
  if (kind === "paper" || kind === "grain" || kind === "chalk") {
    const freq = kind === "paper" ? 0.035 : kind === "chalk" ? 0.6 : 0.9;
    const seed = kind === "paper" ? 3 : step % 97;     // paper is still, grain and chalk dust move
    return (
      <g opacity={o}>
        <defs>
          <filter id={`${id}f`} x={0} y={0} width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={kind === "paper" ? 4 : 2} seed={seed} />
            <feColorMatrix type="matrix" values={kind === "chalk" ? "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.75" : "0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.9 -0.2"} />
          </filter>
        </defs>
        <rect width={w} height={h} filter={`url(#${id}f)`} style={{ mixBlendMode: kind === "chalk" ? "screen" : "overlay" }} />
      </g>
    );
  }
  if (kind === "dust" || kind === "rain") {
    const r = rnd(kind === "dust" ? 11 : 29);
    const n = kind === "dust" ? 70 : 140;
    return (
      <g opacity={o}>
        {Array.from({ length: n }, (_, i) => {
          const x0 = r() * w, y0 = r() * h, sp = 0.3 + r();
          if (kind === "dust") {
            const x = (x0 + Math.sin(t / 40 + i) * 12 + t * 0.2 * sp) % w, y = (y0 - t * 0.35 * sp + h) % h;
            return <circle key={i} cx={x} cy={y} r={1 + sp * 1.6} fill="#fff" opacity={0.25 + 0.4 * r()} />;
          }
          const y = (y0 + t * 38 * sp) % (h + 80) - 40, x = (x0 + t * 6 * sp) % w;
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34 * sp} stroke="#e8eef3" strokeWidth={1.4} opacity={0.5} />;
        })}
      </g>
    );
  }
  if (kind === "haze") {
    return (
      <g opacity={o}>
        <defs>
          <radialGradient id={`${id}g`} cx="50%" cy="45%" r="75%"><stop offset="40%" stopColor="#fff" stopOpacity={0} /><stop offset="100%" stopColor="#cfe3ff" stopOpacity={0.55} /></radialGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#${id}g)`} />
      </g>
    );
  }
  return null;
};

/** The look's textures over the whole frame (put it last, above the picture, under captions). */
export const Texture: React.FC<LookProp & { t: number }> = ({ look, t }) => {
  const L = useDisasterLook(look === undefined ? undefined : lookOf(look));
  const { width: w, height: h } = useVideoConfig();
  return (
    <AbsoluteFill data-probe="skip" style={{ pointerEvents: "none" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {L.textures.map((x, i) => <Layer key={i} id={`tx${i}${x.kind}`} kind={x.kind} o={x.o} t={t} w={w} h={h} ink={L.line} />)}
      </svg>
    </AbsoluteFill>
  );
};

/** A path with the look's hand wobble (chalk, desk): a straight segment otherwise. */
export function wobbleLine(x1: number, y1: number, x2: number, y2: number, amount: number, seed = 1): string {
  if (amount <= 0) return `M${x1},${y1} L${x2},${y2}`;
  const r = rnd(seed); const n = 6;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  let d = `M${x1},${y1}`;
  for (let i = 1; i <= n; i++) {
    const f = i / n, j = i === n ? 0 : (r() - 0.5) * amount * 4;
    d += ` L${x1 + dx * f + nx * j},${y1 + dy * f + ny * j}`;
  }
  return d;
}
