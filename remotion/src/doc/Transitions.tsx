/**
 * How a doc layer arrives on its word (2026-11-20, owner: "how things appear can be improved"): a short,
 * punchy entrance per cut (6-12 frames) instead of a bare hard cut, chosen by the director (`enter`) or
 * deterministically by `autoEnter` when the layer names none. After the entrance the children render with
 * no wrapper transform or filter, so a held picture costs nothing. Also: a decaying impact shake for a
 * figure landing, and a soft drifting light leak for the film finish. Deterministic only (seeded hashes).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, outBack, outCubic, smooth } from "./theme";

export const ENTERS = ["cut", "fade", "flash", "whip-left", "whip-right", "zoom", "focus", "shutter", "glitch", "drop", "iris", "slide-up"] as const;
export type EnterKind = typeof ENTERS[number];
export const isEnter = (x: unknown): x is EnterKind => typeof x === "string" && (ENTERS as readonly string[]).includes(x);

/** A 32-bit FNV-1a hash of a string (seeded choices, no Math.random). */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** A deterministic 0..1 value for (seed, n). */
const rnd = (seed: string, n: number) => (hash(`${seed}#${n}`) % 10007) / 10007;

const FULL: readonly EnterKind[] = ["zoom", "whip-left", "whip-right", "flash", "focus", "glitch"];
const FRAMED: readonly EnterKind[] = ["drop", "slide-up", "iris", "zoom"];
const FULL_KINDS = new Set(["footage", "photo", "montage"]);

/** The entrance for a layer that names none: full-frame pictures rotate (never the same twice in a row),
 * framed things drop, slide or open, the poster flashes, a chapter card opens like a shutter, and the
 * video's very first layer (seed ending ":0", i 0) is a plain cut so frame 0 is the picture. */
export function autoEnter(layerKind: string, seed: string, i: number): EnterKind {
  if (i === 0 && seed.endsWith(":0")) return "cut";
  if (layerKind === "poster") return "flash";
  if (layerKind === "chapter") return "shutter";
  const pool = FULL_KINDS.has(layerKind) ? FULL : FRAMED;
  // a seeded start, then step by 1..len-1 each layer: consecutive picks always differ
  const start = hash(`${seed}:${layerKind}`) % pool.length;
  let k = start;
  for (let j = 1; j <= i; j++) k = (k + 1 + (hash(`${seed}:${j}`) % (pool.length - 1))) % pool.length;
  return pool[k] ?? "zoom";
}

/** A seeded, decaying camera shake (CSS translate + rotate) for an impact at frame `at`; "" outside it. */
export function shake(t: number, at: number, amp = 14, len = 9): string {
  const d = t - at;
  if (!isFinite(at) || d < 0 || d >= len) return "";
  const fall = Math.pow(1 - d / len, 2);
  const f = Math.floor(d);
  const x = (rnd(`shx${at}`, f) * 2 - 1) * amp * fall;
  const y = (rnd(`shy${at}`, f) * 2 - 1) * amp * 0.7 * fall;
  const r = (rnd(`shr${at}`, f) * 2 - 1) * 0.6 * fall;
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg)`;
}

/** How long each entrance runs (frames); past it the children render plain. */
const LEN: Record<EnterKind, number> = {
  cut: 0, fade: 10, flash: 7, "whip-left": 9, "whip-right": 9, zoom: 10, focus: 12, shutter: 10, glitch: 6, drop: 14, iris: 11, "slide-up": 10,
};

export const EnterFx: React.FC<{ kind: EnterKind; t: number; w: number; h: number; children: React.ReactNode }> = ({ kind, t, w, h, children }) => {
  const len = LEN[kind];
  if (len === 0 || t >= len || t < 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const k = clamp01(t / len);
  switch (kind) {
    case "fade":
      return <AbsoluteFill style={{ opacity: outCubic(k) }}>{children}</AbsoluteFill>;
    case "flash": {
      const f = Math.max(0, 1 - t / 7);
      return (
        <AbsoluteFill>
          {children}
          <AbsoluteFill style={{ background: "#fff", opacity: f * 0.9 }} />
        </AbsoluteFill>
      );
    }
    case "whip-left":
    case "whip-right": {
      const dir = kind === "whip-left" ? 1 : -1;     // whip-left: travels leftward, from the right
      const e = outCubic(k);
      const x = dir * 40 * (1 - e);
      const blur = 28 * (1 - e);
      const skew = -dir * 8 * (1 - e);
      return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <AbsoluteFill style={{ transform: `translateX(${x}%) skewX(${skew}deg) scale(${1 + 0.06 * (1 - e)})`, filter: blur > 0.5 ? `blur(${blur * 0.35}px)` : undefined }}>
            {children}
          </AbsoluteFill>
          {/* a streak copy trailing the move sells the motion blur */}
          {blur > 2 ? (
            <AbsoluteFill style={{ transform: `translateX(${x + dir * 10 * (1 - e)}%) skewX(${skew}deg)`, filter: `blur(${blur}px)`, opacity: 0.45 * (1 - e) }}>
              {children}
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      );
    }
    case "zoom": {
      const e = outCubic(k);
      const lift = Math.max(0, 1 - t / 5);
      return (
        <AbsoluteFill style={{ transform: `scale(${1.28 - 0.28 * e})`, filter: `blur(${14 * (1 - e)}px) brightness(${1 + 0.45 * lift})` }}>
          {children}
        </AbsoluteFill>
      );
    }
    case "focus": {
      const e = smooth(k);
      return (
        <AbsoluteFill style={{ transform: `scale(${1.06 - 0.06 * e})`, filter: `blur(${26 * (1 - e)}px)` }}>
          {children}
        </AbsoluteFill>
      );
    }
    case "shutter": {
      const e = outCubic(k);
      const bar = (h / 2) * (1 - e);
      return (
        <AbsoluteFill>
          {children}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "#050506" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "#050506" }} />
        </AbsoluteFill>
      );
    }
    case "glitch": {
      const f = Math.floor(t);
      const amp = (1 - k) * 22;
      const dx = (rnd("gx", f) * 2 - 1) * amp;
      const dy = (rnd("gy", f) * 2 - 1) * amp * 0.25;
      const off = 6 + amp * 0.8;
      // a horizontal slice of the picture jumps sideways for a frame
      const sliceY = rnd("gs", f) * 80;
      const sliceH = 6 + rnd("gh", f) * 14;
      return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)`, filter: `drop-shadow(${off}px 0 0 rgba(255,30,60,0.75)) drop-shadow(${-off}px 0 0 rgba(0,230,255,0.7)) contrast(1.15)` }}>
            {children}
          </AbsoluteFill>
          <AbsoluteFill style={{ clipPath: `inset(${sliceY}% 0 ${Math.max(0, 100 - sliceY - sliceH)}% 0)`, transform: `translateX(${-dx * 2.5}px)` }}>
            {children}
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }
    case "drop": {
      // falls in on an overshoot, lands, and the frame shakes once
      const fallK = clamp01(t / 9);
      const e = outBack(fallK);
      const y = -110 * (1 - e);
      const r = -6 * (1 - e);
      const sh = shake(t, 9, 10 * (w / 1080), 5);
      return (
        <AbsoluteFill style={{ transform: sh || undefined }}>
          <AbsoluteFill style={{ transform: `translateY(${y}%) rotate(${r}deg)` }}>{children}</AbsoluteFill>
        </AbsoluteFill>
      );
    }
    case "iris": {
      const e = outCubic(k);
      const r = Math.hypot(w, h) / 2 * e;
      return <AbsoluteFill style={{ clipPath: `circle(${r.toFixed(1)}px at 50% 50%)` }}>{children}</AbsoluteFill>;
    }
    case "slide-up": {
      const e = outCubic(k);
      return <AbsoluteFill style={{ transform: `translateY(${30 * (1 - e)}%)`, opacity: e }}>{children}</AbsoluteFill>;
    }
    default:
      return <AbsoluteFill>{children}</AbsoluteFill>;
  }
};

/** A soft warm light leak that drifts across the frame (screen blend), for the film finish. */
export const LightLeak: React.FC<{ t: number; seed: string; o?: number }> = ({ t, seed, o = 0.18 }) => {
  const a = rnd(seed, 1), b = rnd(seed, 2);
  const x1 = 15 + 70 * (0.5 + 0.5 * Math.sin(t / 97 + a * 6.28));
  const y1 = 10 + 30 * (0.5 + 0.5 * Math.cos(t / 131 + b * 6.28));
  const x2 = 85 - 60 * (0.5 + 0.5 * Math.sin(t / 113 + b * 6.28));
  const y2 = 70 + 25 * (0.5 + 0.5 * Math.sin(t / 89 + a * 6.28));
  const pulse = 0.75 + 0.25 * Math.sin(t / 47 + a * 10);
  return (
    <AbsoluteFill style={{
      pointerEvents: "none", mixBlendMode: "screen", opacity: o * pulse,
      background: `radial-gradient(ellipse 55% 40% at ${x1}% ${y1}%, rgba(255,150,60,0.9), rgba(255,90,40,0) 70%), `
        + `radial-gradient(ellipse 45% 35% at ${x2}% ${y2}%, rgba(255,210,140,0.7), rgba(255,180,90,0) 70%)`,
    }} />
  );
};
