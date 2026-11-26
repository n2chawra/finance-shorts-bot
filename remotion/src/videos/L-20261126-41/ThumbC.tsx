// Thumbnail C (the 381K hit's pattern: the cockpit moment with a question in a red banner): the airliner nose-up
// in a stall, wing red, with the control column small beside it and a red arrow pulling back.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";
import { BigPlane, NightTown } from "./planedraw";

export default function ThumbC({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <NightTown w={w} h={h} horizon={0.38} />
        <BigPlane x={w * 0.6} y={h * 0.5} L={w * 0.66} bank={-24} red={1} />
        <g transform={`translate(${w * 0.12} ${h * 0.52})`}>
          <rect x={-18} y={0} width={36} height={h * 0.4} fill="#2c333b" stroke="#000" strokeWidth={5} />
          <path d="M -110 -20 Q -120 40 -84 56 L 84 56 Q 120 40 110 -20 L 88 -20 Q 92 28 64 32 L -64 32 Q -92 28 -88 -20 Z" fill="#3a434c" stroke="#000" strokeWidth={6} />
          <path d={`M 150 -40 L 150 ${h * 0.3}`} stroke="#ff2a2a" strokeWidth={22} />
          <path d={`M 110 ${h * 0.26} L 150 ${h * 0.34} L 190 ${h * 0.26}`} stroke="#ff2a2a" strokeWidth={22} fill="none" strokeLinejoin="round" />
        </g>
      </svg>
      <Words text={th.words ?? ""} x={w * 0.03} y={h * 0.04} width={w * 0.6} size={130} align="left" />
    </AbsoluteFill>
  );
}
