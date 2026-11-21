// Shared overlays for the 3D beats: the honesty tag and a mono caption that types on (date · place),
// plus the kit clock that maps a beat's story frames to the 3D kit's own frames.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { HonestyTag as Tag3D } from "../../three/index";

export const MONO = "'Courier Prime', 'Courier New', monospace";

export function kitClock(p: SceneProps, now: number): (story: number) => number {
  const tempo = p.tl.tempo || 1;
  const base = now - p.frame / tempo;
  return (story: number) => base + story / tempo;
}

const typed = (s: string, t: number, at: number, cps = 1.4) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));

/** A mono caption line under the tag, typing on from `at` (story frames). */
export const MonoCaption: React.FC<{ t: number; at: number; text: string; top?: number; size?: number; color?: string; out?: number }> = ({ t, at, text, top = 104, size = 34, color = "#ffd84a", out }) => {
  const s = typed(text, t, at, 1.6);
  const o = out !== undefined && t > out ? Math.max(0, 1 - (t - out) / 10) : 1;
  if (!s || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 120, top, opacity: o, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, color,
      background: "rgba(6,20,60,0.72)", padding: "6px 16px", borderRadius: 4, whiteSpace: "nowrap" }}>
      {s}
      <span style={{ opacity: Math.floor(t / 8) % 2 ? 1 : 0 }}>▌</span>
    </div>
  );
};

export const Overlay: React.FC<{ children?: React.ReactNode; tag?: "reconstruction" | "paused"; text?: string }> = ({ children, tag = "reconstruction", text }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Tag3D kind={tag} text={text} at={-20} top={40} left={120} size={32} />
    {children}
  </AbsoluteFill>
);
export default Overlay;

/** The frames of a beat's moments: each named event, or an even spread over the beat when one is missing. */
export function evs(m: { at: (n: string, d?: number) => number; end: number }, names: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  names.forEach((n, i) => { out[n] = m.at(n, Math.round((m.end * (i + 1)) / (names.length + 1))); });
  return out;
}

/** A chapter title: a red rule and a big mono line typing on, top left under the tag. */
export const ChapterTitle: React.FC<{ t: number; at: number; text: string; out?: number }> = ({ t, at, text, out }) => {
  if (t < at) return null;
  const o = out !== undefined && t > out ? Math.max(0, 1 - (t - out) / 12) : Math.min(1, (t - at) / 6);
  const s = typed(text, t, at, 1.2);
  return (
    <div style={{ position: "absolute", left: 120, top: 150, opacity: o }}>
      <div style={{ width: Math.min(220, (t - at) * 18), height: 6, background: "#ff3b30", marginBottom: 14 }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56, letterSpacing: 6, color: "#f4f8ff", textShadow: "0 3px 18px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>{s}</div>
    </div>
  );
};

/** A plain mono line, typing on, anywhere on the frame (a quiet line, a label over the 3D). */
export const MonoLine: React.FC<{ t: number; at: number; text: string; x: number; y: number; size?: number; color?: string; bg?: string; out?: number; center?: boolean }> = ({ t, at, text, x, y, size = 40, color = "#f4f8ff", bg = "rgba(6,12,24,0.7)", out, center }) => {
  const s = typed(text, t, at, 1.6);
  const o = out !== undefined && t > out ? Math.max(0, 1 - (t - out) / 10) : 1;
  if (!s || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: center ? "translateX(-50%)" : undefined, fontFamily: MONO, fontWeight: 700, fontSize: size,
      letterSpacing: size * 0.1, color, background: bg, padding: "6px 16px", borderRadius: 4, whiteSpace: "nowrap" }}>{s}</div>
  );
};

/** A big figure card on a thing (a sign, a plaque, a board) drawn over the 3D at (x, y). */
export const FigPlate: React.FC<{ t: number; at: number; label: string; value: string; x: number; y: number; color?: string; size?: number }> = ({ t, at, label, value, x, y, color = "#ffd84a", size = 96 }) => {
  if (t < at) return null;
  const k = Math.min(1, (t - at) / 8);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: k, transform: `translateY(${(1 - k) * 24}px)`, background: "rgba(8,14,26,0.82)",
      border: `2px solid ${color}`, borderRadius: 6, padding: "10px 26px 14px" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: "#c9d6e8" }}>{label}</div>
      <div style={{ fontFamily: "Anton, 'Bebas Neue', Impact, sans-serif", fontSize: size, lineHeight: 1.05, color }}>{value}</div>
    </div>
  );
};

/** Keep an interior camera inside the atrium (never inside or behind a wall, slab or the floor). */
export function inside<K extends { pos: [number, number, number] }>(keys: K[]): K[] {
  const c = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  return keys.map((k) => ({ ...k, pos: [c(k.pos[0], -8.4, 8.4), c(k.pos[1], 0.35, 7.1), c(k.pos[2], -5.6, 16)] as [number, number, number] }));
}

/** Moves a kit overlay (the 2D honesty tag) right, clear of the channel badge in the top-left corner. */
export const ClearOfBadge: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 66, top: 0, right: 0, bottom: 0, pointerEvents: "none" }}>{children}</div>
);
