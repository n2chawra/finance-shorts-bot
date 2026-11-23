// Thumbnail C: the people's side of the story without showing harm. The office trailers stood near the unit;
// the vapour cloud rolls toward them from the tower behind. The pattern of the CSB's site frames (0.55M): the
// real place laid out, one question.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Arrow, Words, type ThumbProps } from "../../studio/thumb";

export default function ThumbTrailers({ th, w, h }: ThumbProps) {
  const ground = h * 0.78;
  const trailers = [0.06, 0.24, 0.42];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #8fb6d8 0%, #c9dbe6 60%, #d9c9a8 100%)" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        {/* the tower and the stack behind, right */}
        <rect x={w * 0.8} y={h * 0.08} width={w * 0.07} height={ground - h * 0.08} rx={30} fill="#5b6470" stroke="#1d2228" strokeWidth={8} />
        <rect x={w * 0.9} y={h * 0.2} width={w * 0.04} height={ground - h * 0.2} fill="#3f4650" stroke="#1d2228" strokeWidth={8} />
        {/* the cloud, rolling left over the ground */}
        {([[0.84, 0.62, 0.17], [0.7, 0.66, 0.15], [0.58, 0.69, 0.12], [0.92, 0.5, 0.12]] as [number, number, number][]).map(([x, y, r], i) => (
          <ellipse key={i} cx={w * x} cy={h * y} rx={w * r} ry={h * r * 0.95} fill="#e8e3c4" stroke="#b9ae7c" strokeWidth={6} opacity={0.92} />
        ))}
        {/* the ground */}
        <rect x={0} y={ground} width={w} height={h - ground} fill="#8a7b5e" />
        {/* the office trailers */}
        {trailers.map((x, i) => (
          <g key={i} transform={`translate(${w * x}, ${ground - h * 0.24})`}>
            <rect x={10} y={10} width={w * 0.16} height={h * 0.24} fill="#000" opacity={0.25} />
            <rect width={w * 0.16} height={h * 0.24} rx={6} fill="#f4f4ef" stroke="#1d2228" strokeWidth={8} />
            {[0.12, 0.42, 0.72].map((wx, j) => (
              <rect key={j} x={w * 0.16 * wx} y={h * 0.06} width={w * 0.032} height={h * 0.06} fill="#7fb0d6" stroke="#1d2228" strokeWidth={4} />
            ))}
            <rect x={w * 0.16 * 0.42} y={h * 0.14} width={w * 0.03} height={h * 0.1} fill="#a1704a" stroke="#1d2228" strokeWidth={4} />
          </g>
        ))}
      </svg>
      <Arrow a={[w * 0.72, h * 0.42]} b={[w * 0.58, h * 0.5]} bend={0.2} w={w} h={h} />
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.05} width={w * 0.55} size={170} align="left" />
    </AbsoluteFill>
  );
}
