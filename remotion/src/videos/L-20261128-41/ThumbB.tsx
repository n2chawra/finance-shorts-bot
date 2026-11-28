// Thumbnail B (the hidden cause, big): the sweep arm cut open, red paint outside, rust eating the wall inside,
// ringed in red, with the ride small behind.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

export default function ThumbB({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 55%, #3a2a20 0%, #0d0c0b 75%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${w * 0.08} ${h * 0.36}) rotate(-8)`}>
          <rect x={0} y={0} width={w * 0.92} height={250} fill="#c9281c" />
          <rect x={0} y={16} width={w * 0.92} height={218} fill="#8d959d" />
          <rect x={0} y={44} width={w * 0.92} height={162} fill="#241a14" />
          <path d={`M 0 44 ${Array.from({ length: 26 }, (_, i) => `L ${i * 46} ${54 + (i % 3) * 10}`).join(" ")} L ${w * 0.92} 44 Z`} fill="#a35a24" />
          <path d={`M 0 206 ${Array.from({ length: 26 }, (_, i) => `L ${i * 46} ${190 - (i % 3) * 12}`).join(" ")} L ${w * 0.92} 206 Z`} fill="#8c4a20" />
          {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 97) % (w * 0.9)} cy={80 + ((i * 53) % 90)} r={6 + (i % 5) * 4} fill={["#7a3a1a", "#a35a24", "#5e2c14"][i % 3]} />)}
          <rect x={0} y={170} width={w * 0.5} height={30} fill="#3f7fb0" opacity={0.75} />
        </g>
      </svg>
      <Ring x={w * 0.62} y={h * 0.52} rx={210} ry={120} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.05} width={w * 0.6} size={140} align="left" />
    </AbsoluteFill>
  );
}
