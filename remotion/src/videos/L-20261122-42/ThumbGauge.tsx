// Thumbnail B: the pattern of the CSB's 3D pipework frames (0.67M, 0.55M): the process drawn as a lit
// diagram with one label that tells the moment. Ours: the two tower gauges side by side, the board's showing
// a calm green NORMAL at the bottom, the real tower full to the top in red, a red arrow between them.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";

export default function ThumbGauge({ w, h }: ThumbProps) {
  const tw = w * 0.17, th = h * 0.78, top = h * 0.12;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b0d0f, #020303)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <rect x={w * 0.47} y={top} width={tw} height={th} rx={30} fill="#0b0f0c" stroke="#39ff9a" strokeWidth={8} />
        <rect x={w * 0.47 + 12} y={top + th - 12 - th * 0.07} width={tw - 24} height={th * 0.07} rx={10} fill="#39ff9a" />
        <text x={w * 0.47 + tw / 2} y={top + th * 0.84} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={h * 0.07} fill="#39ff9a">NORMAL</text>
        <rect x={w * 0.76} y={top} width={tw} height={th} rx={30} fill="#0b0f0c" stroke="#ff3b30" strokeWidth={8} />
        <rect x={w * 0.76 + 12} y={top + th - 12 - (th - 24) * 0.93} width={tw - 24} height={(th - 24) * 0.93} rx={10} fill="#ff3b30" />
        <path d={`M ${w * 0.66} ${h * 0.5} L ${w * 0.745} ${h * 0.5}`} stroke="#ffffff" strokeWidth={20} />
        <path d={`M ${w * 0.745} ${h * 0.44} L ${w * 0.76} ${h * 0.5} L ${w * 0.745} ${h * 0.56} Z`} fill="#ffffff" />
      </svg>
      <Words text="*Blind* gauge" x={w * 0.04} y={h * 0.18} width={w * 0.4} size={150} align="left" />
    </AbsoluteFill>
  );
}
