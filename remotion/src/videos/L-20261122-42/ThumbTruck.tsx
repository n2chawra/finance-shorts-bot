// Thumbnail B: the most viewed hit's subject (2.26M: the liquid geyser over the refinery) told as our flat picture,
// with the CSB's finding that an idling pickup truck lit the cloud: the stack spewing, the vapour rolling along the
// ground to a small truck with its lights on, the truck ringed.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Ring, Words, type ThumbProps } from "../../studio/thumb";

export default function ThumbTruck({ th, w, h }: ThumbProps) {
  const ground = h * 0.8, stackX = w * 0.72, stackTop = h * 0.2;
  const truckX = w * 0.43, truckY = ground - h * 0.03;
  const columns = [0.48, 0.55, 0.86, 0.93];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0b1226 0%, #1b1f3a 55%, #6b2b16 82%, #1a0d08 100%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {/* refinery columns in silhouette */}
        {columns.map((c, i) => (
          <rect key={i} x={w * c} y={h * (0.28 + (i % 2) * 0.1)} width={w * 0.035} height={ground - h * (0.28 + (i % 2) * 0.1)} rx={14} fill="#0a0d16" />
        ))}
        {/* the stack */}
        <rect x={stackX - w * 0.03} y={stackTop} width={w * 0.06} height={ground - stackTop} fill="#2a2f3d" stroke="#05070c" strokeWidth={8} />
        {/* the geyser: a thick column straight up out of the stack, fanning into falling streams either side */}
        {[0.05, 0.09, 0.13, 0.17].map((span, i) =>
          [-1, 1].map((side) => (
            <path key={`${i}${side}`} d={`M ${stackX} ${h * 0.06} Q ${stackX + side * w * span * 0.6} ${h * (0.0 - i * 0.01)}, ${stackX + side * w * span} ${h * (0.3 + i * 0.1)}`}
              stroke={i % 2 ? "#e6dfae" : "#f6f2d6"} strokeWidth={30 - i * 5} fill="none" strokeLinecap="round" opacity={0.95 - i * 0.12} />
          )))}
        <path d={`M ${stackX - 26} ${stackTop} L ${stackX - 40} ${h * 0.04} L ${stackX + 40} ${h * 0.04} L ${stackX + 26} ${stackTop} Z`} fill="#fbf8e4" />
        {/* the vapour cloud rolling along the ground toward the truck */}
        {([[0.66, 0.74, 0.16], [0.53, 0.76, 0.14], [0.42, 0.77, 0.12], [0.33, 0.78, 0.1], [0.78, 0.73, 0.14]] as [number, number, number][]).map(([x, y, r], i) => (
          <ellipse key={i} cx={w * x} cy={h * y} rx={w * r} ry={h * r * 0.9} fill="#c9d3c4" opacity={0.78} />
        ))}
        {/* the ground */}
        <rect x={0} y={ground} width={w} height={h - ground} fill="#120a07" />
        {/* the pickup truck, idling: lights on */}
        <g transform={`translate(${truckX}, ${truckY})`}>
          <path d={`M -150 0 L 150 0 L 150 -50 L 60 -50 L 30 -100 L -60 -100 L -80 -50 L -150 -50 Z`} fill="#d23b2b" stroke="#0a0a0a" strokeWidth={8} strokeLinejoin="round" />
          <rect x={-50} y={-90} width={70} height={36} rx={6} fill="#9fd3ff" stroke="#0a0a0a" strokeWidth={5} />
          <circle cx={-90} cy={6} r={32} fill="#111" stroke="#444" strokeWidth={6} />
          <circle cx={95} cy={6} r={32} fill="#111" stroke="#444" strokeWidth={6} />
          <path d={`M 150 -40 L 330 -90 L 330 10 Z`} fill="#ffe98a" opacity={0.55} />
          <circle cx={150} cy={-38} r={10} fill="#fff6c0" />
        </g>
      </svg>
      <Ring x={truckX + 10} y={truckY - 45} rx={w * 0.15} ry={h * 0.13} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.05} width={w * 0.42} size={118} align="left" />
    </AbsoluteFill>
  );
}
