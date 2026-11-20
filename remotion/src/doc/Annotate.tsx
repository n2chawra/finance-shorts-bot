/**
 * Annotations drawn over any picture, the editor's marker pen: a hand-drawn circle around a point, a
 * hand-drawn arrow, a rubber stamp that slams, and a big date slam. Each arrives on its word (`inAt`,
 * story frames) and leaves over ~8 frames after `outAt`. Deterministic (seeded wobble, fixed turbulence).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, DISPLAY, DOC, fmtDate, fs, outBack, outCubic, SANS, unit } from "./theme";

export const ANNOTATE_KINDS = ["circle", "arrow", "stamp", "date"] as const;
export type AnnotateKind = (typeof ANNOTATE_KINDS)[number];
export const isAnnotateKind = (x: unknown): x is AnnotateKind => typeof x === "string" && (ANNOTATE_KINDS as readonly string[]).includes(x);

type Tone = "red" | "gold" | "white";
const INK: Record<Tone, string> = { red: "#E5483B", gold: DOC.gold, white: "#f6f3ec" };
const PEN = "drop-shadow(0 3px 6px rgba(0,0,0,0.45))";

type Base = { t: number; inAt: number; outAt?: number; w: number; h: number };

/** 1 while on screen, falling to 0 over 8 frames after outAt. */
const outK = (t: number, outAt?: number) => (outAt === undefined ? 1 : 1 - clamp01((t - outAt) / 8));

/** A seeded pseudo-random in [0,1). */
const rnd = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** The whole-frame shake of a slam: strongest on landing, gone in ~10 frames. Callers may apply it to the picture. */
export function slamShake(t: number, landAt: number, px = 14): { x: number; y: number; r: number } {
  const d = t - landAt;
  if (d < 0 || d > 12) return { x: 0, y: 0, r: 0 };
  const k = Math.pow(1 - d / 12, 2);
  return { x: Math.sin(d * 2.9) * px * k, y: Math.cos(d * 3.7) * px * 0.7 * k, r: Math.sin(d * 2.3) * 0.6 * k };
}

/** A hand-drawn marker ellipse around `pos`, drawn on in ~14 frames; an optional label pops in beside it. */
export const CircleMark: React.FC<Base & { pos: [number, number]; r?: number; tone?: Tone; label?: string }> = ({
  t, inAt, outAt, w, h, pos, r = 0.16, tone = "red", label,
}) => {
  const d = t - inAt;
  if (d < 0) return null;
  const o = outK(t, outAt);
  if (o <= 0) return null;
  const u = unit(w, h);
  const cx = pos[0] * w, cy = pos[1] * h;
  const rx = r * w, ry = rx * 0.78;
  // ~1.1 turns, the radius wobbling a little, ending past the start (the open overlap of a real marker)
  const N = 90, turns = 1.12, start = -2.2;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const a = start + (i / N) * turns * Math.PI * 2;
    const wob = 1 + 0.045 * Math.sin(a * 2 + 0.7) + 0.03 * Math.sin(a * 5 + 1.3) + 0.05 * (i / N);
    pts.push(`${(cx + Math.cos(a) * rx * wob).toFixed(1)},${(cy + Math.sin(a) * ry * wob - (i / N) * ry * 0.06).toFixed(1)}`);
  }
  const k = outCubic(d / 14);
  const lk = outBack(clamp01((d - 14) / 8));
  const size = fs(w, h, 44);
  const right = cx + rx + size * 6 < w * 0.86;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, filter: PEN }}>
        <polyline points={pts.join(" ")} fill="none" stroke={INK[tone]} strokeWidth={12 * u} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      </svg>
      {label && lk > 0 ? (
        <div style={{ position: "absolute", top: cy - ry - size * 0.6, ...(right ? { left: cx + rx * 0.75 } : { right: w - cx + rx * 0.75 }),
          transform: `scale(${lk}) rotate(-4deg)`, transformOrigin: right ? "left center" : "right center",
          fontFamily: DISPLAY, fontSize: size, color: INK[tone], textTransform: "uppercase", letterSpacing: 1,
          textShadow: "0 3px 10px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>{label}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/** A hand-drawn curved arrow from `from` to `to` (0..1 of the frame); the head pops when the line arrives. */
export const ArrowMark: React.FC<Base & { from: [number, number]; to: [number, number]; label?: string; tone?: Tone }> = ({
  t, inAt, outAt, w, h, from, to, label, tone = "red",
}) => {
  const d = t - inAt;
  if (d < 0) return null;
  const o = outK(t, outAt);
  if (o <= 0) return null;
  const u = unit(w, h);
  const x0 = from[0] * w, y0 = from[1] * h, x1 = to[0] * w, y1 = to[1] * h;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  // bow the line to one side, a little past the middle
  const bow = 0.22 * len;
  const qx = x0 + dx * 0.55 - (dy / len) * bow, qy = y0 + dy * 0.55 + (dx / len) * bow;
  const k = outCubic(d / 12);
  const hk = outBack(clamp01((d - 10) / 6));
  // the head points along the curve's last tangent (from the control point to the end)
  const ang = Math.atan2(y1 - qy, x1 - qx);
  const hl = 46 * u;
  const head = (s: number) => `${x1 + Math.cos(ang + Math.PI - 0.5) * hl * s},${y1 + Math.sin(ang + Math.PI - 0.5) * hl * s} ${x1},${y1} ${x1 + Math.cos(ang + Math.PI + 0.5) * hl * s},${y1 + Math.sin(ang + Math.PI + 0.5) * hl * s}`;
  const size = fs(w, h, 46);
  const lk = outBack(clamp01(d / 7));
  const leftSide = x0 < w / 2;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, filter: PEN }}>
        <path d={`M ${x0} ${y0} Q ${qx} ${qy} ${x1} ${y1}`} fill="none" stroke={INK[tone]} strokeWidth={11 * u} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
        {hk > 0 ? <polyline points={head(hk)} fill="none" stroke={INK[tone]} strokeWidth={11 * u} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      {label ? (
        <div style={{ position: "absolute", top: y0 - size * 1.4, ...(leftSide ? { left: Math.max(40 * u, x0 - size * 1.5) } : { right: Math.max(150 * u, w - x0 - size * 1.5) }),
          transform: `scale(${lk}) rotate(-3deg)`, transformOrigin: leftSide ? "left bottom" : "right bottom",
          fontFamily: DISPLAY, fontSize: size, color: INK[tone], textTransform: "uppercase", letterSpacing: 1,
          textShadow: "0 3px 10px rgba(0,0,0,0.75)", whiteSpace: "nowrap" }}>{label}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/** A rubber stamp: slams from 2.4× to 1× in 5 frames, shakes the frame, its ink spreading a touch after. */
export const StampMark: React.FC<Base & { text: string; pos?: [number, number]; tone?: Tone; tilt?: number; size?: number }> = ({
  t, inAt, outAt, w, h, text, pos = [0.5, 0.42], tone = "red", tilt = -12, size: sizePx,
}) => {
  const d = t - inAt;
  if (d < 0) return null;
  const o = outK(t, outAt);
  if (o <= 0) return null;
  const u = unit(w, h);
  const land = clamp01(d / 5);
  const s = 2.4 - 1.4 * (land * land);
  const spread = d > 5 ? Math.min(1, (d - 5) / 20) : 0;
  const sh = slamShake(t, inAt + 5, 16 * u);
  const size = sizePx ?? fs(w, h, 120);   // a thumbnail's VerdictTag sets its own (doc/thumb)
  const c = INK[tone];
  const id = `stamp-${Math.round(inAt)}`;
  const seed = Math.round(rnd(inAt + text.length) * 90) + 3;
  return (
    <AbsoluteFill style={{ opacity: o * Math.min(1, d / 2 + 0.2), pointerEvents: "none", transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={seed} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.75" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" result="inked" />
          <feMorphology in="inked" operator="dilate" radius={spread * 0.8} />
        </filter>
      </svg>
      <div style={{ position: "absolute", left: pos[0] * w, top: pos[1] * h, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${s})`,
        filter: `url(#${id})`, mixBlendMode: "normal" }}>
        <div style={{ border: `${9 * u}px solid ${c}`, padding: 8 * u, borderRadius: 10 * u, opacity: 1, background: "rgba(10,8,8,0.28)" }}>
          <div style={{ border: `${4 * u}px solid ${c}`, borderRadius: 6 * u, padding: `${size * 0.08}px ${size * 0.3}px`,
            fontFamily: DISPLAY, fontSize: size, lineHeight: 1.05, color: c, textTransform: "uppercase", letterSpacing: size * 0.04, whiteSpace: "nowrap", textShadow: "0 0 2px rgba(0,0,0,0.3)" }}>
            {text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** A big date slam ("DEC 23, 2023"): a hard scale-in, a gold rule wiping under it, the place typing on after. */
export const DateSlam: React.FC<Base & { date: string; sub?: string; pos?: "top" | "center" }> = ({
  t, inAt, outAt, w, h, date, sub, pos = "top",
}) => {
  const d = t - inAt;
  if (d < 0) return null;
  const o = outK(t, outAt);
  if (o <= 0) return null;
  const v = h > w;
  const u = unit(w, h);
  const land = clamp01(d / 4);
  const s = 1.9 - 0.9 * land;
  const rule = outCubic((d - 4) / 10);
  const subN = sub ? Math.floor(clamp01((d - 10) / Math.max(8, sub.length * 1.2)) * sub.length) : 0;
  const sh = slamShake(t, inAt + 4, 10 * u);
  const size = fs(w, h, v ? 128 : 112);
  const top = pos === "center" ? h * 0.42 : v ? 250 : 90 * u;
  const txt = fmtDate(date).toUpperCase();
  return (
    <AbsoluteFill style={{ opacity: o * Math.min(1, land * 2), pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: v ? 60 : 0, right: v ? 150 : 0, top, display: "flex", flexDirection: "column", alignItems: "center",
        transform: `translate(${sh.x}px, ${sh.y}px)` }}>
        <div style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color: "#fff", letterSpacing: size * 0.03, whiteSpace: "nowrap",
          transform: `scale(${s})`, textShadow: "0 6px 24px rgba(0,0,0,0.75)" }}>{txt}</div>
        <div style={{ marginTop: 14 * u, height: 6 * u, width: size * 4.2 * rule, background: DOC.gold, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }} />
        {sub ? (
          <div style={{ marginTop: 14 * u, fontFamily: SANS, fontWeight: 700, fontSize: fs(w, h, 46), color: DOC.text, letterSpacing: 4 * u,
            textTransform: "uppercase", textShadow: "0 3px 10px rgba(0,0,0,0.8)", minHeight: fs(w, h, 46) * 1.2, whiteSpace: "nowrap" }}>
            {sub.slice(0, subN)}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
