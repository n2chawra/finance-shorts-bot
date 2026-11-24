/**
 * The India Maps channel's avatar (800×800) and banner (2560×1440, the map inside YouTube's 1546×423 safe
 * area), drawn with the India layer (src/flat/india.tsx) on India's official map. No channel name on them, so
 * they fit whichever name the owner picks.
 */
import React from "react";
import { AbsoluteFill } from "remotion";

import { INK } from "../flat/kit";
import { IndiaMap, stateColours, type StateFx } from "../flat/india";

const TONES = ["#e8453c", "#ffc43d", "#5fae6a", "#3d8bd9", "#b467c9", "#f08a3c", "#2fb5a5", "#e66aa0", "#9bc24a"];
const ALL: Record<string, StateFx> = Object.fromEntries(Object.entries(stateColours(TONES)).map(([s, c]) => [s, { fill: c }]));

export const IndiaAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#16354d" }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <defs><clipPath id="disc"><circle cx={400} cy={400} r={330} /></clipPath></defs>
      <circle cx={400} cy={400} r={348} fill={INK} />
      <g clipPath="url(#disc)">
        <IndiaMap w={800} h={800} focus={["India"]} pad={80} states={ALL} dim={0.55} />
      </g>
      <circle cx={400} cy={400} r={330} fill="none" stroke={INK} strokeWidth={14} />
    </svg>
  </AbsoluteFill>
);

/** The banner: India in the middle of the safe area, half its states painted (a map filling up). */
export const IndiaBanner: React.FC = () => {
  const half = Object.fromEntries(Object.entries(ALL).filter((_, i) => i % 2 === 0));
  return (
    <AbsoluteFill style={{ background: "#16354d" }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        {/* India large in the middle; the relief fades into the backdrop at its edges */}
        <IndiaMap w={2560} h={1440} focus={["India"]} pad={150} states={half} />
      </svg>
    </AbsoluteFill>
  );
};
