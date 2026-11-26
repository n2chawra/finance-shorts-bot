// Thumbnail A (the topic's top hit's pattern, 2.34M, and the 129K one: the airliner huge, banking over a night
// town, bold words top-left): the turboprop banked hard over snowy houses, its wing red (the stall).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Words, type ThumbProps } from "../../studio/thumb";
import { BigPlane, NightTown } from "./planedraw";

export default function Thumb({ th, w, h }: ThumbProps) {
  return (
    <AbsoluteFill>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <NightTown w={w} h={h} horizon={0.32} />
        <BigPlane x={w * 0.62} y={h * 0.52} L={w * 0.62} bank={-28} red={1} />
      </svg>
      <Words text={th.words ?? ""} x={w * 0.03} y={h * 0.04} width={w * 0.5} size={130} align="left" />
    </AbsoluteFill>
  );
}
