/**
 * A video's thumbnail: one cast member reacting, one figure Python computed, at most four words.
 * Read at phone size in a feed, so everything is big and high-contrast. The size follows the
 * video: a long video's is YouTube's 1280×720; a Short's is its 1080×1920 cover (9:16), with the
 * words on top, the figure in the middle and the character below.
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
export const SHORT_THUMB = { width: 1080, height: 1920 } as const;

/** The thumbnail's size for a timeline: a Short's cover is vertical. */
export const thumbSize = (tl: Pick<Timeline, "format">) => (tl.format === "short" ? SHORT_THUMB : THUMB);

export const calculateThumbnailMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const tl = Timeline.parse(props.timeline);
  if (!tl.thumbnail) throw new Error("this timeline has no thumbnail block");
  return { props: { timeline: tl }, ...thumbSize(tl) };
};

export const Thumbnail: React.FC<StoryProps> = ({ timeline }) => {
  const th = timeline.thumbnail;
  const pal = timeline.palette;
  if (!th) return null;
  const member = CAST[th.who];
  if (!member) throw new Error(`unknown cast member ${th.who}`);
  const pose = POSES[(th.pose ?? "stand") as PoseName] ?? POSES.stand;
  const { width: w, height: h } = thumbSize(timeline);
  const v = h > w;
  const stripes = (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      {Array.from({ length: v ? 12 : 9 }, (_, i) => (
        <rect key={i} x={-200 + i * 190} y={-100} width={60} height={h + 200} fill={pal.text} opacity={0.035} transform={`rotate(18 ${w / 2} ${h / 2})`} />
      ))}
      <circle cx={v ? w * 0.5 : w * 0.8} cy={v ? h * 0.74 : h * 0.5} r={v ? 470 : 330} fill={pal.accent} opacity={0.14} />
      <Character id="thumb" look={member.look} pose={pose} expression={(th.expression ?? "shock") as Expression}
        x={v ? w * 0.5 : w * 0.8} y={v ? h + 700 : h + 520} scale={v ? 2.6 : 1.75} gaze={[v ? 0 : -0.4, 0]} shadow={false}
        holdL={th.prop ? PROPS[th.prop] : undefined} />
    </svg>
  );
  const words = { fontWeight: 900, lineHeight: 1.0, color: pal.text, textShadow: "0 6px 0 rgba(0,0,0,0.35)" } as const;
  const figure = {
    fontWeight: 900, lineHeight: 1.0, color: pal.danger, letterSpacing: -4, WebkitTextStroke: `10px ${pal.text}`, paintOrder: "stroke fill",
    transform: "rotate(-3deg)", filter: "drop-shadow(0 12px 0 rgba(0,0,0,0.35))",
  } as const;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${v ? "50% 70%" : "30% 55%"}, ${pal.danger}66, ${pal.bg} 62%)`, overflow: "hidden" }}>
      {stripes}
      {v ? (
        <div style={{ position: "absolute", left: 60, top: 150, width: w - 120, textAlign: "center", fontFamily: FONT }}>
          <div style={{ ...words, fontSize: 128 }}>{th.words}</div>
          <div style={{ ...figure, marginTop: 50, fontSize: 230, transformOrigin: "center" }}>{th.figure}</div>
          {th.sub && (
            <div style={{ marginTop: 50, display: "inline-block", padding: "16px 34px", borderRadius: 18, background: pal.accent, color: "#1b1b1b", fontWeight: 800, fontSize: 64 }}>
              {th.sub}
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: "absolute", left: 56, top: 70, width: w * 0.62, fontFamily: FONT }}>
          <div style={{ ...words, fontSize: 92 }}>{th.words}</div>
          <div style={{ ...figure, marginTop: 26, fontSize: 200, transformOrigin: "left" }}>{th.figure}</div>
          {th.sub && (
            <div style={{ marginTop: 34, display: "inline-block", padding: "12px 26px", borderRadius: 14, background: pal.accent, color: "#1b1b1b", fontWeight: 800, fontSize: 46 }}>
              {th.sub}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
