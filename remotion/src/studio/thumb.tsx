/**
 * The thumbnail kit (2026-10-29, owner: "for each video its references are searched, see what type of
 * thumbnail actually works and make something like that"). A long video's thumbnail is its own
 * component, remotion/src/videos/<id>/Thumb.tsx, modelled on the topic's most viewed thumbnails
 * (python -m renderer.thumbs refs <id>). These are the pieces the hits are made of, in our style:
 *
 *   <Glow>      a bold two-colour background with a light behind the subject
 *   <Face>      a cast member, big (a face that fills a third of the frame reads at phone size); `flip` mirrors them
 *   <Thing>     one of the video's own props (or a shared one: note, coin, cash, box), big
 *   <Words>     1–4 huge outlined words, *starred* words in the accent colour, fitted to their box
 *   <Arrow>     the thick red arrow from what you see to what it means
 *   <Ring>      the red circle around the detail that matters
 *   <Badge>     a tilted pill or price tag (a figure from tl.figures, never typed)
 *   <Split>     two halves for a versus: a seam, two colours
 *
 *   export default function Thumb({ tl, th, w, h }: ThumbProps) { ... }   // w×h is 1280×720
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import type { Timeline } from "../contract/timeline";
import { fitWords } from "../design/fit";
import { FONT } from "../design/fonts";
import { VIDEOS } from "../videos/hooks";
import { SHARED_PROPS } from "./build";
import type { PropSet } from "./draw";

export interface ThumbProps { tl: Timeline; th: NonNullable<Timeline["thumbnail"]>; w: number; h: number }

/** The video's own props and the shared money props. */
export const propsOf = (tl: Timeline): PropSet => ({ ...SHARED_PROPS, ...(VIDEOS[tl.id]?.props ?? {}) });

export const Glow: React.FC<{ from: string; to: string; at?: [number, number]; children?: React.ReactNode }> = ({ from, to, at = [0.5, 0.5], children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at ${at[0] * 100}% ${at[1] * 100}%, ${from} 0%, ${to} 72%)`, overflow: "hidden" }}>{children}</AbsoluteFill>
);

export const Split: React.FC<{ left: string; right: string; tilt?: number; w: number; h: number }> = ({ left, right, tilt = 8, w, h }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    <rect width={w} height={h} fill={left} />
    <path d={`M${w / 2 + tilt * 6},0 L${w},0 L${w},${h} L${w / 2 - tilt * 6},${h} Z`} fill={right} />
    <path d={`M${w / 2 + tilt * 6},0 L${w / 2 - tilt * 6},${h}`} stroke="#fff" strokeWidth={14} />
  </svg>
);

/** A cast member at (x, y) = the feet, `scale` 1 ≈ 560 px tall. A face crop: put the feet below the frame. */
export const Face: React.FC<{ who: string; x: number; y: number; scale: number; pose?: string; expression?: string; gaze?: [number, number]; flip?: boolean; w: number; h: number }> =
  ({ who, x, y, scale, pose = "stand", expression = "shock", gaze, flip = false, w, h }) => {
    const m = CAST[who];
    if (!m) return null;
    return (
      <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}>
        <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
          <Character id={`th-${who}-${x | 0}`} look={m.look} pose={POSES[pose as PoseName] ?? POSES.stand} expression={expression as Expression}
            x={x} y={y} scale={scale} gaze={gaze} shadow={false} />
        </g>
      </svg>
    );
  };

/** A prop drawn at (x, y) = its base, `s` its size in px; a soft drop shadow lifts it off the ground. */
export const Thing: React.FC<{ tl: Timeline; prop: string; x: number; y: number; s: number; rot?: number; state?: string; w: number; h: number }> =
  ({ tl, prop, x, y, s, rot = 0, state, w, h }) => {
    const P = propsOf(tl)[prop];
    if (!P) return null;
    return (
      <svg width={w} height={h} style={{ position: "absolute", overflow: "visible", filter: "drop-shadow(0 18px 0 rgba(0,0,0,0.35))" }}>
        <g transform={`translate(${x},${y}) rotate(${rot})`}><P s={s} t={0.6} state={state} /></g>
      </svg>
    );
  };

/** Huge outlined words in a box (left, top, width): fitted so the longest word fits, never wrapping mid-word. */
export const Words: React.FC<{ text: string; x: number; y: number; width: number; size?: number; color?: string; hi?: string; align?: "left" | "center" | "right"; rot?: number }> =
  ({ text, x, y, width, size = 150, color = "#ffffff", hi = "#ffd84a", align = "left", rot = 0 }) => {
    const fs = fitWords(text.replace(/\*/g, ""), size, width, { upper: true, min: 60 });
    return (
      <div style={{ position: "absolute", left: x, top: y, width, textAlign: align, fontFamily: FONT, fontWeight: 900, fontSize: fs, lineHeight: 0.95,
        textTransform: "uppercase", letterSpacing: -1, color, WebkitTextStroke: `${Math.round(fs * 0.08)}px #000`, paintOrder: "stroke fill",
        textShadow: `0 ${Math.round(fs * 0.08)}px 0 rgba(0,0,0,0.55)`, transform: rot ? `rotate(${rot}deg)` : undefined }}>
        {text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, i) =>
          part.startsWith("*") ? <span key={i} style={{ color: hi }}>{part.slice(1, -1)}</span> : <span key={i}>{part}</span>)}
      </div>
    );
  };

/** A thick curved arrow from `a` to `b` (px), red with a white edge, as the hits draw them. */
export const Arrow: React.FC<{ a: [number, number]; b: [number, number]; bend?: number; color?: string; width?: number; w: number; h: number }> =
  ({ a, b, bend = 0.25, color = "#ff2d2d", width = 26, w, h }) => {
    const [mx, my] = [(a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend];
    const ang = Math.atan2(b[1] - my, b[0] - mx), head = width * 2.4;
    const p1 = [b[0] - head * Math.cos(ang - 0.5), b[1] - head * Math.sin(ang - 0.5)], p2 = [b[0] - head * Math.cos(ang + 0.5), b[1] - head * Math.sin(ang + 0.5)];
    const end = [b[0] - head * 0.6 * Math.cos(ang), b[1] - head * 0.6 * Math.sin(ang)];
    return (
      <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}>
        {[["#fff", width + 14], [color, width]].map(([c, sw], i) => (
          <g key={i}>
            <path d={`M${a[0]},${a[1]} Q${mx},${my} ${end[0]},${end[1]}`} stroke={c as string} strokeWidth={sw as number} fill="none" strokeLinecap="round" />
            <path d={`M${b[0]},${b[1]} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Z`} fill={c as string} stroke={c as string} strokeWidth={i ? 2 : 14} strokeLinejoin="round" />
          </g>
        ))}
      </svg>
    );
  };

/** The red hand-drawn circle around a detail. */
export const Ring: React.FC<{ x: number; y: number; rx: number; ry?: number; color?: string; w: number; h: number }> = ({ x, y, rx, ry, color = "#ff2d2d", w, h }) => (
  <svg width={w} height={h} style={{ position: "absolute", overflow: "visible" }}>
    <ellipse cx={x} cy={y} rx={rx} ry={ry ?? rx * 0.8} fill="none" stroke="#fff" strokeWidth={22} transform={`rotate(-8 ${x} ${y})`} />
    <ellipse cx={x} cy={y} rx={rx} ry={ry ?? rx * 0.8} fill="none" stroke={color} strokeWidth={12} transform={`rotate(-8 ${x} ${y})`} />
  </svg>
);

/** A tilted pill: a word or a figure (from tl.figures) on a strong colour. */
export const Badge: React.FC<{ text: string; x: number; y: number; size?: number; bg?: string; color?: string; rot?: number }> =
  ({ text, x, y, size = 64, bg = "#ff2d2d", color = "#fff", rot = -6 }) => (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontWeight: 900, fontSize: size, color, background: bg, whiteSpace: "nowrap",
      padding: `${size * 0.1}px ${size * 0.38}px`, borderRadius: size * 0.25, border: `${Math.max(5, size * 0.08)}px solid #fff`,
      transform: `rotate(${rot}deg)`, boxShadow: "0 12px 0 rgba(0,0,0,0.45)", textTransform: "uppercase" }}>{text}</div>
  );
