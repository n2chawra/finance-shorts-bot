// Thumbnail B (the 291K and 107K hits' pattern: the snowy town at night from above, a glow among the houses,
// emergency lights, a red banner): the airliner small and falling toward the lit street, the glow beneath.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";
import { BigPlane, NightTown } from "./planedraw";

export default function ThumbB({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <NightTown w={w} h={h} horizon={0.18} glow={[w * 0.7, h * 0.68]} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={w * (0.52 + i * 0.07)} cy={h * (0.8 + (i % 2) * 0.05)} r={h * 0.018} fill={i % 2 ? "#3a7bff" : "#ff2a2a"} />)}
        <BigPlane x={w * 0.68} y={h * 0.28} L={w * 0.34} bank={68} red={1} />
      </svg>
      <Words text={th.words ?? ""} x={w * 0.03} y={h * 0.62} width={w * 0.5} size={110} align="left" />
    </AbsoluteFill>
  );
}
