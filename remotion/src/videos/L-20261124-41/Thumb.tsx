// Thumbnail A (the hits' main pattern, 16.9M / 6.0M / 4.9M: the sub big in deep water, a bold phrase): Titan nose
// down, diving toward the dark bow of the Titanic's wreck below, a red ring on its carbon band.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";
import { BigSub } from "./subdraw";

export default function Thumb({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1d6aa6 0%, #0a2f52 40%, #020a16 100%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 337) % w} cy={(i * 211) % h} r={2 + (i % 3)} fill="#cfe6ff" opacity={0.3} />)}
        <path d={`M ${w * 0.05} ${h} L ${w * 0.08} ${h * 0.8} L ${w * 0.62} ${h * 0.76} L ${w * 0.78} ${h * 0.9} L ${w * 0.8} ${h} Z`} fill="#2a1a12" stroke="#000" strokeWidth={6} />
        <rect x={w * 0.2} y={h * 0.7} width={w * 0.08} height={h * 0.08} fill="#1d120c" />
        <line x1={w * 0.55} y1={h * 0.77} x2={w * 0.6} y2={h * 0.6} stroke="#1d120c" strokeWidth={12} />
        <BigSub x={w * 0.66} y={h * 0.4} L={w * 0.5} crack tilt={28} />
        <circle cx={w * 0.645} cy={h * 0.4} r={h * 0.13} fill="none" stroke="#ff2d2d" strokeWidth={h * 0.014} />
      </svg>
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.05} width={w * 0.5} size={150} align="left" />
    </AbsoluteFill>
  );
}
