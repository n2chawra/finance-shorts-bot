// Thumbnail B: the pattern of "The Design Change That Took 114 Lives" (Deconstructed, 1.13M): the detail as
// drawn beside the detail as built, a tick and a cross, two heavy words. Ours, on our blueprint: the one
// continuous rod (drawn) and the two offset rods with the nut glowing red (built).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { ThumbProps } from "../../studio/thumb";
import { DisasterLookProvider, LookBackground } from "../../disaster/index";
import { Elev } from "./elev";

const Mark: React.FC<{ ok: boolean; x: number; y: number }> = ({ ok, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {ok ? <path d="M -90 0 L -25 70 L 110 -90" fill="none" stroke="#3ddc84" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
      : <g stroke="#ff3b30" strokeWidth={34} strokeLinecap="round"><line x1={-90} y1={-90} x2={90} y2={90} /><line x1={90} y1={-90} x2={-90} y2={90} /></g>}
  </g>
);

const Word: React.FC<{ text: string; x: number; color: string }> = ({ text, x, color }) => (
  <text x={x} y={1040} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={150} fill={color} stroke="#071a45" strokeWidth={10} paintOrder="stroke">{text}</text>
);

export default function ThumbB({ w, h }: ThumbProps) {
  return (
    <DisasterLookProvider value="blueprint">
      <AbsoluteFill>
        <LookBackground />
        <svg width={w} height={h} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <rect x={0} y={0} width={960} height={1080} fill="rgba(2,8,30,0.35)" /><rect x={960} y={0} width={960} height={1080} fill="rgba(2,6,24,0.7)" />
          <line x1={960} y1={0} x2={960} y2={1080} stroke="#ffffff" strokeWidth={10} />
          <g transform="translate(-60 -40) scale(1.0)"><Elev t={999} cx={520} split={0} /></g>
          <g transform="translate(40 -40) scale(1.0)"><Elev t={999} cx={1400} split={1} hot={1} /></g>
          <Mark ok x={760} y={260} />
          <Mark ok={false} x={1720} y={260} />
          <Word text="DRAWN" x={480} color="#ffffff" />
          <Word text="BUILT" x={1440} color="#ffd84a" />
        </svg>
      </AbsoluteFill>
    </DisasterLookProvider>
  );
}
