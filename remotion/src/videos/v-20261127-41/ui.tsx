// Shared pieces for the Texas City promo Short (BP Texas City, 23 March 2005; promo of L-20261122-42).
// Portrait 1080×1920: everything that must be read stays above y = 1340 (captions and YouTube's buttons below)
// and left of x = 920. The 3D beats keep the long video's grey storm light; the flat beat is drawn in the
// cross-section recipe (white engineer's paper, black line, blue accent). Red only for the failure.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { DisasterLookProvider, HonestyTag, LookBackground, Texture } from "../../disaster/index";

export const RECIPE = "cross-section" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const RED = "#ff3b30", AMBER = "#ffb000", GREEN = "#39ff9a", INK = "#f2f4f5", BLUE = "#1f6fd1", PANEL = "rgba(8,12,18,0.86)";
export const W = 1080, H = 1920;

export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };
export const ramp = (t: number, at: number, len = 12) => sm((t - at) / len);
export const typed = (s: string, t: number, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

/** Story frames → the 3D kit's own frames (its tempo-scaled clock). */
export function kitClock(p: SceneProps, now: number): (story: number) => number {
  const tempo = p.tl.tempo || 1;
  const base = now - p.frame / tempo;
  return (story: number) => base + story / tempo;
}

type Mom = { at: string };
/** Every moment's word as a story frame (fallbacks spaced through the beat when an event is missing). */
export function moments(p: SceneProps, at: (name: string, fallback: number) => number, end: number): Record<string, number> {
  const ms = ((p.beat.params as { moments?: Mom[] }).moments ?? []);
  const out: Record<string, number> = {};
  ms.forEach((x, i) => { out[x.at] = at(x.at, Math.round(((i + 1) / (ms.length + 1)) * end)); });
  return out;
}

/** A figure from params.fig by name ("" when missing). */
export const figOf = (p: SceneProps, name: string): string => ((p.beat.params as { fig?: Record<string, string> }).fig ?? {})[name] ?? "";

/** A mono caption typing on (dark plate). */
export const Chip: React.FC<{ t: number; at: number; text: string; top: number; left?: number; size?: number; color?: string; border?: string; out?: number }> = ({ t, at, text, top, left = 60, size = 46, color = INK, border = AMBER, out }) => {
  const s = typed(text, t, at, 1.8);
  const o = out !== undefined && t > out ? Math.max(0, 1 - (t - out) / 10) : 1;
  if (!s || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left, top, opacity: o, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.05, color,
      background: PANEL, border: `3px solid ${border}`, padding: "6px 18px", borderRadius: 6, whiteSpace: "nowrap" }}>
      {s}<span style={{ opacity: Math.floor(t / 8) % 2 ? 1 : 0 }}>▌</span>
    </div>
  );
};

/** A readout plate: a mono label and a big value. */
export const Readout: React.FC<{ x: number; y: number; label: string; value: string; k: number; color?: string; size?: number }> = ({ x, y, label, value, k, color = RED, size = 100 }) => {
  if (k <= 0) return null;
  const o = Math.min(1, k * 2);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 20}px)`, background: PANEL,
      border: `4px solid ${color}`, borderRadius: 8, padding: "8px 26px", whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3, color: INK }}>{label}</div>
      <div style={{ fontFamily: ANTON, fontSize: size, color, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
};

/** A rubber stamp (HTML) landing with a squash at `at`. */
export const StampHtml: React.FC<{ t: number; at: number; text: string; x: number; y: number; size?: number; color?: string; rot?: number }> = ({ t, at, text, x, y, size = 80, color = RED, rot = -7 }) => {
  if (t < at) return null;
  const k = sm((t - at) / 6);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * k})`, opacity: k, border: `7px solid ${color}`, color,
      fontFamily: ANTON, fontSize: size, padding: "0 22px", letterSpacing: 4, background: "rgba(8,12,18,0.88)", whiteSpace: "nowrap" }}>{text}</div>
  );
};

/** The 3D overlay: the honesty tag top-left and whatever plates the beat adds. */
export const Overlay: React.FC<{ children?: React.ReactNode; t: number }> = ({ children, t }) => (
  <DisasterLookProvider value="night-grid">
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <HonestyTag t={t} tag="reconstruction" at={0} />
      {children}
    </AbsoluteFill>
  </DisasterLookProvider>
);

/** Mono text that types on in SVG (ink on the engineer's paper). */
export const TypeText: React.FC<{ x: number; y: number; t: number; at: number; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; cps?: number }> = ({ x, y, t, at, text, size = 48, color = "#111111", anchor = "start", cps = 1.8 }) => {
  const s = typed(text, t, at, cps);
  if (!s) return null;
  return <text x={x} y={y} fontFamily={MONO} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={size * 0.05} stroke="rgba(255,255,255,0.95)" strokeWidth={6} paintOrder="stroke">{s}</text>;
};

/** An arrow (shaft and head) that draws on (k 0→1). */
export const ArrowSvg: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string; w?: number }> = ({ x1, y1, x2, y2, k, color = "#111111", w = 10 }) => {
  if (k <= 0) return null;
  const kk = k01(k);
  const ex = x1 + (x2 - x1) * kk, ey = y1 + (y2 - y1) * kk;
  const a = Math.atan2(ey - y1, ex - x1), hl = w * 3.2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex - Math.cos(a) * hl * 0.6} y2={ey - Math.sin(a) * hl * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${ex} ${ey} L ${ex - Math.cos(a - 0.45) * hl} ${ey - Math.sin(a - 0.45) * hl} L ${ex - Math.cos(a + 0.45) * hl} ${ey - Math.sin(a + 0.45) * hl} Z`} fill={color} />
    </g>
  );
};

/** The engineer's paper (the cross-section recipe's backdrop), the camera (zoom ≤ 1.3 about cx, cy), texture and the honesty tag on top. */
export const Paper: React.FC<{ t: number; zoom?: number; cx?: number; cy?: number; children: React.ReactNode; html?: React.ReactNode; tag?: string }> = ({ t, zoom = 1, cx = W / 2, cy = H / 2, children, html, tag = "as reported" }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="tc-grid" width={60} height={60} patternUnits="userSpaceOnUse"><rect x={0} y={0} width={60} height={2} fill="rgba(31,111,209,0.12)" /><rect x={0} y={0} width={2} height={60} fill="rgba(31,111,209,0.12)" /></pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#tc-grid)" />
        <g transform={`translate(${W / 2} ${H / 2}) scale(${Math.min(1.3, zoom)}) translate(${-cx} ${-cy})`}>{children}</g>
      </svg>
      {html}
      <Texture t={t} />
      <HonestyTag t={t} tag={tag} at={0} />
    </AbsoluteFill>
  </DisasterLookProvider>
);
export default Paper;

/** A slow, steady orbit round each key's look point (rad per story frame), so the 3D camera never holds still
 * between moves (the motion gate). `dir` +1 or −1 alternates the side per beat. */
export function orbit<K extends { f: number; pos: [number, number, number]; look: [number, number, number] }>(keys: K[], rate = 0.003, dir = 1): K[] {
  return keys.map((k) => {
    const a = dir * rate * k.f;
    const dx = k.pos[0] - k.look[0], dz = k.pos[2] - k.look[2];
    const c = Math.cos(a), s = Math.sin(a);
    return { ...k, pos: [k.look[0] + dx * c - dz * s, k.pos[1] + 0.004 * k.f, k.look[2] + dx * s + dz * c] as [number, number, number] };
  });
}
