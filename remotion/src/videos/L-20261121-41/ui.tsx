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
      background: "rgba(6,20,60,0.72)", padding: "6px 16px", borderRadius: 4, whiteSpace: "nowrap" }}>
      {s}
      <span style={{ opacity: Math.floor(t / 8) % 2 ? 1 : 0 }}>▌</span>
    </div>
  );
};

export const Overlay: React.FC<{ children?: React.ReactNode; tag?: "reconstruction" | "paused"; text?: string }> = ({ children, tag = "reconstruction", text }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <Tag3D kind={tag} text={text} at={-20} top={40} left={56} size={32} />
    {children}
  </AbsoluteFill>
);
export default Overlay;
