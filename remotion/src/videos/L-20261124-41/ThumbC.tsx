// Thumbnail C (the 1.85M and 0.55M hits' pattern: the broken or cracking hull with a red ring on the damage and a
// short quote-like phrase): Titan cut open to its black carbon band, the ring on the crack, a sound burst off it.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";
import { BigSub } from "./subdraw";

export default function ThumbC({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #10314f 0%, #04101e 60%, #000 100%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((i) => <circle key={i} cx={w * 0.48} cy={h * 0.62} r={h * (0.22 + i * 0.09)} fill="none" stroke="#ffd27a" strokeWidth={h * 0.008} opacity={0.6 - i * 0.18} />)}
        <BigSub x={w * 0.52} y={h * 0.6} L={w * 0.78} crack cut />
      </svg>
      <Ring x={w * 0.48} y={h * 0.62} rx={w * 0.08} ry={h * 0.17} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.04} width={w * 0.92} size={140} align="left" />
    </AbsoluteFill>
  );
}
