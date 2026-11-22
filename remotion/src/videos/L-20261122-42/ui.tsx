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
    <div style={{ position: "absolute", left: 56, top, opacity: o, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, color,
      background: "rgba(4,10,6,0.8)", padding: "6px 16px", borderRadius: 4, whiteSpace: "nowrap" }}>
      {s}
      <span style={{ opacity: Math.floor(t / 8) % 2 ? 1 : 0 }}>▌</span>
    </div>
  );
};

export const Overlay: React.FC<{ children?: React.ReactNode; tag?: "reconstruction" | "paused"; text?: string; t?: number; marks?: number[] }> = ({ children, tag = "reconstruction", text, t, marks }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {t !== undefined && marks ? <LampStrip t={t} marks={marks} /> : null}
    <Tag3D kind={tag} text={text} at={-20} top={40} left={56} size={32} />
    {children}
  </AbsoluteFill>
);
export default Overlay;

/** The look recipe this video draws in (plan style.recipe). */
export const RECIPE = "instrument-panel" as const;
export const AMBER = "#ffb000", RED = "#ff3b30", GREEN = "#39ff9a", INK = "#d9ffe8";
export const ANTON = "Anton, Poppins, sans-serif";

type Mom = { at: string; what?: string };
/** Every moment's word as a story frame (fallbacks spaced through the beat when an event is missing). */
export function moments(p: SceneProps, at: (name: string, fallback: number) => number, end: number): Record<string, number> {
  const ms = ((p.beat.params as { moments?: Mom[] }).moments ?? []);
  const out: Record<string, number> = {};
  ms.forEach((x, i) => { out[x.at] = at(x.at, Math.round(((i + 1) / (ms.length + 1)) * end)); });
  return out;
}

/** A figure from params.fig by name ("" when missing). */
export const figOf = (p: SceneProps, name?: string): string => (name ? ((p.beat.params as { fig?: Record<string, string> }).fig ?? {})[name] ?? "" : "");

/** A readout plate over the frame: a mono label and a big value (counts up with `k`). */
export const Readout: React.FC<{ x: number; y: number; label: string; value: string; k: number; color?: string; size?: number; sub?: string }> = ({ x, y, label, value, k, color = AMBER, size = 86, sub }) => {
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - Math.min(1, k * 2)) * 20}px)`, background: "rgba(4,8,6,0.86)",
      border: `3px solid ${color}`, borderRadius: 8, padding: "12px 26px", minWidth: 300 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: INK }}>{label}</div>
      <div style={{ fontFamily: ANTON, fontSize: size, color, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ fontFamily: MONO, fontSize: 30, color: INK, opacity: 0.8 }}>{sub}</div> : null}
    </div>
  );
};

/** The instrument-panel status strip, top right: one small lamp per spoken moment, each lighting on its word
 * (the recipe's console language; fine print). */
export const LampStrip: React.FC<{ t: number; marks: number[] }> = ({ t, marks }) => {
  const ms = marks.filter((x) => x < 1e8).sort((a, b) => a - b);
  if (!ms.length) return null;
  return (
    <div style={{ position: "absolute", right: 60, top: 44, display: "flex", gap: 10 }}>
      {ms.map((f, i) => {
        const on = t >= f, fresh = on && t < f + 8;
        return <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: on ? (fresh ? "#fff1c8" : AMBER) : "rgba(57,255,154,0.18)", boxShadow: fresh ? "0 0 16px #ffb000" : "none" }} />;
      })}
    </div>
  );
};

/** A chapter card: the chapter's name types on in mono, top-left under the tag, for the opening seconds. */
export const ChapterCard: React.FC<{ t: number; text: string }> = ({ t, text }) => {
  const o = t < 75 ? 1 : Math.max(0, 1 - (t - 75) / 12);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 56, top: 96, opacity: o, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 10, height: 52, background: AMBER }} />
      <div style={{ fontFamily: ANTON, fontSize: 52, letterSpacing: 3, color: INK, background: "rgba(4,8,6,0.75)", padding: "2px 18px" }}>{text.slice(0, Math.max(0, Math.floor(t * 1.2)))}</div>
    </div>
  );
};

/** A finding card pinned over a 3D shot: the board's finding types on, then its verdict stamps. */
export const Finding: React.FC<{ t: number; at: number; text: string; verdict: string }> = ({ t, at, text, verdict }) => {
  const k = Math.min(1, Math.max(0, (t - at + 30) / 10));
  if (k <= 0) return null;
  const s = t >= at ? Math.min(1, (t - at) / 6) : 0;
  const col = verdict === "FACTOR" ? AMBER : RED;
  return (
    <div style={{ position: "absolute", left: 56, top: 170, opacity: k, background: "rgba(4,8,6,0.88)", borderLeft: `10px solid ${col}`, padding: "16px 26px", maxWidth: 900 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 3, color: INK }}>{text.slice(0, Math.max(0, Math.floor((t - at + 30) * 1.8)))}</div>
      {s > 0 && <div style={{ display: "inline-block", marginTop: 12, border: `5px solid ${col}`, color: col, fontFamily: ANTON, fontSize: 44, padding: "0 14px", transform: `rotate(-6deg) scale(${1.6 - 0.6 * s})`, opacity: s }}>{verdict}</div>}
    </div>
  );
};
