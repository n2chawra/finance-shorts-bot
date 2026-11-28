// Thumbnail C (the hit's pattern: the ride against the sky, caution tape across it, a question): the Fire Ball
// swinging, yellow tape slanting across, the broken arm glowing.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";
import { RideArt } from "./Thumb";

export default function ThumbC({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill>
      <RideArt w={w} h={h} px={w * 0.52} py={h * 0.2} s={0.95} swing={-0.75} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${w * 0.5} ${h * 0.7}) rotate(-16)`}>
          <rect x={-w} y={-50} width={w * 2} height={100} fill="#ffd400" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-w + i * 90} -50 l 40 0 l -40 100 l -40 0 Z`} fill="#1b1b1b" />)}
        </g>
      </svg>
      <Words text={th.words ?? ""} x={w * 0.04} y={h * 0.04} width={w * 0.92} size={120} align="center" />
    </AbsoluteFill>
  );
}
