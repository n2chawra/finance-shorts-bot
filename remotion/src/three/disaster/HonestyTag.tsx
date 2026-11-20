// The disasters channel's honesty tag over a 3D shot (DOM; pass it in the stage's `overlay`): the
// channel's own wording (channel.json look.honestyTags), typewriter mono, top left, a dim plate with
// a red tick (red is the failure colour, so the tag reads as part of the investigation, not a logo).
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import "../../doc/fonts";

/** The channel's tags, verbatim from channels/disasters-and-engineering-failures-expla/channel.json. */
export const HONESTY_TAGS = {
  reconstruction: "3D reconstruction · not actual footage",
  asReported: "as reported",
  principle: "general principle",
  paused: "time paused",
  speed2: "2× speed",
} as const;
export type HonestyKind = keyof typeof HONESTY_TAGS;

const MONO = "'Courier Prime', 'Courier New', monospace";

export const HonestyTag: React.FC<{ kind?: HonestyKind; text?: string; at?: number; until?: number; top?: number; left?: number; size?: number }> = ({
  kind = "reconstruction", text, at = 0, until, top = 168, left = 48, size = 28,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    * (until === undefined ? 1 : interpolate(frame, [until, until + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left, opacity: o, display: "flex", alignItems: "center", gap: 12, padding: "9px 16px 9px 12px",
      background: "rgba(6,8,12,0.62)", borderRadius: 4, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 0.5, color: "#e8ecf2", whiteSpace: "nowrap" }}>
      <div style={{ width: 5, height: size * 0.95, background: "#ff3b30", borderRadius: 1 }} />
      {text ?? HONESTY_TAGS[kind]}
    </div>
  );
};
