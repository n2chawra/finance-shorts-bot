// Thumbnail B: the pattern of "The Design Change That Took 114 Lives" (1.13M): the detail as drawn beside the
// detail as built, a tick and a cross, two heavy words. Ours, on the night-grid sheet: the one continuous rod
// (as designed) and the two offset rods with the upper nut glowing red (as built).
import React from "react";
import { AbsoluteFill } from "remotion";
import type { ThumbProps } from "../../studio/thumb";
import { DisasterLookProvider } from "../../disaster/index";
import { Elev } from "./elev";

const Mark: React.FC<{ ok: boolean; x: number; y: number }> = ({ ok, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {ok ? <path d="M -90 0 L -25 70 L 110 -90" fill="none" stroke="#3ddc84" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
      : <g stroke="#ff3b30" strokeWidth={34} strokeLinecap="round"><line x1={-90} y1={-90} x2={90} y2={90} /><line x1={90} y1={-90} x2={-90} y2={90} /></g>}
  </g>
);

export default function ThumbB({ w, h }: ThumbProps) {
  return (
    <DisasterLookProvider value="night-grid">
      <AbsoluteFill>
        <AbsoluteFill style={{ background: "#05080d" }} />
        <svg width={w} height={h} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <rect x={960} y={0} width={960} height={1080} fill="rgba(60,0,0,0.35)" />
          <line x1={960} y1={0} x2={960} y2={1080} stroke="#ffffff" strokeWidth={10} />
          <g transform="translate(480 0) scale(1.12) translate(-500 -90)"><Elev t={999} cx={500} split={0} rodColor="#3ddc84" /></g>
          <g transform="translate(1440 0) scale(1.12) translate(-1420 -90)"><Elev t={999} cx={1420} split={1} hot={1} /></g>
          <text x={480} y={1030} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={150} fill="#ffffff" stroke="#000" strokeWidth={12} paintOrder="stroke">DRAWN</text>
          <text x={1440} y={1030} textAnchor="middle" fontFamily="Anton, Poppins, sans-serif" fontSize={150} fill="#ffd84a" stroke="#000" strokeWidth={12} paintOrder="stroke">BUILT</text>
          <Mark ok x={800} y={250} />
          <Mark ok={false} x={1740} y={250} />
        </svg>
      </AbsoluteFill>
    </DisasterLookProvider>
  );
}
