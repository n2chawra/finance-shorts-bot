/**
 * The long video's thumbnail (1280×720): one cast member reacting, one figure Python computed,
 * at most four words. Read at phone size in a feed, so everything is big and high-contrast.
 */
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction } from "remotion";
import { CAST } from "../cast/cast";
import { Character } from "../cast/Character";
import type { Expression } from "../cast/face";
import { POSES, type PoseName } from "../cast/poses";
import { Timeline } from "../contract/timeline";
import { FONT } from "../design/fonts";
import { PROPS } from "../scenes/kit";
import type { StoryProps } from "./StoryVideo";

export const THUMB = { width: 1280, height: 720 } as const;

export const calculateThumbnailMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const tl = Timeline.parse(props.timeline);
  if (!tl.thumbnail) throw new Error("this timeline has no thumbnail block");
  return { props: { timeline: tl } };
};

export const Thumbnail: React.FC<StoryProps> = ({ timeline }) => {
  const th = timeline.thumbnail;
  const pal = timeline.palette;
  if (!th) return null;
  const member = CAST[th.who];
  if (!member) throw new Error(`unknown cast member ${th.who}`);
  const pose = POSES[(th.pose ?? "stand") as PoseName] ?? POSES.stand;
  const { width: w, height: h } = THUMB;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 55%, ${pal.danger}66, ${pal.bg} 62%)`, overflow: "hidden" }}>
      <svg width={w} height={h} style={{ position: "absolute" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-200 + i * 190} y={-100} width={60} height={h + 200} fill={pal.text} opacity={0.035} transform={`rotate(18 ${w / 2} ${h / 2})`} />
        ))}
        <circle cx={w * 0.8} cy={h * 0.5} r={330} fill={pal.accent} opacity={0.14} />
        <Character id="thumb" look={member.look} pose={pose} expression={(th.expression ?? "shock") as Expression}
          x={w * 0.8} y={h + 520} scale={1.75} gaze={[-0.4, 0]} shadow={false}
          holdL={th.prop ? PROPS[th.prop] : undefined} />
      </svg>
      <div style={{ position: "absolute", left: 56, top: 70, width: w * 0.62, fontFamily: FONT }}>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: pal.text, textShadow: "0 6px 0 rgba(0,0,0,0.35)" }}>{th.words}</div>
        <div style={{
          marginTop: 26, fontWeight: 900, fontSize: 200, lineHeight: 1.0, color: pal.danger, letterSpacing: -4,
          WebkitTextStroke: `10px ${pal.text}`, paintOrder: "stroke fill", transform: "rotate(-3deg)", transformOrigin: "left",
          filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.35))",
        }}>{th.figure}</div>
        {th.sub && (
          <div style={{ marginTop: 34, display: "inline-block", padding: "12px 26px", borderRadius: 14, background: pal.accent, color: "#1b1b1b", fontWeight: 800, fontSize: 46 }}>
            {th.sub}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
