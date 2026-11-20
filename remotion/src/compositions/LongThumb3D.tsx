/**
 * LongThumb3D (2026-11-20, the tech channel's thumbnail playbook, gap #1): a long video's 1280×720
 * thumbnail drawn with the 3D kit. The video's own `remotion/src/videos/<id>/Thumb3D.tsx` (or the
 * spec's `component`) default-exports a 3D scene (ThumbProps: tl, th, w, h); it is mounted inside one
 * <Stage3D look="thumb"> (key + strong rim, warm/cool split, dark falloff, bloom, shallow DOF) and the
 * 2D overlay is laid on top from the spec, positions as shares of the frame:
 *
 *   "thumbnail": { "layout": "custom", "engine": "3d", "component": "Thumb3D", "words": "INSIDE ONE *CHIP*",
 *                  "arrow": {"from": [0.42, 0.3], "to": [0.6, 0.48]}, "ring": {"at": [0.66, 0.52], "r": 0.12},
 *                  "badge": {"text": "{node}", "at": [0.7, 0.12]},
 *                  "loupe": {"component": "Thumb3DLoupe", "at": [0.78, 0.3], "r": 0.2, "from": [0.6, 0.62]} }
 *
 * Words are StackWords (studio/thumbType.tsx) unless `type: "bold"` asks for the older outlined Words.
 * Rendered as a still by scripts/render.ts `thumbnail` (it picks this composition for engine "3d" and
 * gives Chrome a WebGL backend: angle on a GPU machine, swangle in the cloud).
 */
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction } from "remotion";
import { Timeline } from "../contract/timeline";
import { Arrow, Badge, Ring, Words, type ThumbProps } from "../studio/thumb";
import { StackWords } from "../studio/thumbType";
import { Loupe, Stage3D } from "../three";
import { VIDEOS } from "../videos/hooks";
import type { StoryProps } from "./StoryVideo";

export const LONG_THUMB3D = { width: 1280, height: 720 } as const;

export const calculateLongThumb3DMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const tl = Timeline.parse(props.timeline);
  if (!tl.thumbnail) throw new Error("this timeline has no thumbnail block");
  return { props: { timeline: tl }, ...LONG_THUMB3D };
};

type Th = ThumbProps["th"];

/** The 2D layer: the words, then the arrow, ring, badge (all from the spec). */
export const Thumb3DOverlay: React.FC<{ th: Th; w: number; h: number; loupe?: React.ReactNode }> = ({ th, w, h, loupe }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {loupe}
    {th.ring && <Ring x={th.ring.at[0] * w} y={th.ring.at[1] * h} rx={th.ring.r * h} color={th.ring.color} w={w} h={h} />}
    {th.arrow && <Arrow a={[th.arrow.from[0] * w, th.arrow.from[1] * h]} b={[th.arrow.to[0] * w, th.arrow.to[1] * h]} bend={th.arrow.bend}
      color={th.arrow.color ?? "#ffb23e"} width={22} w={w} h={h} />}
    {th.badge && <Badge text={th.badge.text} x={th.badge.at[0] * w} y={th.badge.at[1] * h} size={Math.round(h * 0.075)} bg={th.badge.color ?? "#ff8a1f"} />}
    {th.words && (th.type === "bold"
      ? <Words text={th.words} x={w * 0.045} y={h * 0.05} width={w * 0.5} size={130} />
      : <StackWords text={th.words} w={w} h={h} />)}
  </AbsoluteFill>
);

/** One thumbnail frame: a 3D scene in the thumb look plus the overlay. Demos call it directly. */
export const Thumb3DFrame: React.FC<{ th: Th; w: number; h: number; scene: React.ReactNode; loupe?: React.ReactNode; stage?: Partial<React.ComponentProps<typeof Stage3D>> }> =
  ({ th, w, h, scene, loupe, stage }) => {
    const lp = th.loupe && loupe
      ? <Loupe x={th.loupe.at[0] * w} y={th.loupe.at[1] * h} r={th.loupe.r * h} from={th.loupe.from ? [th.loupe.from[0] * w, th.loupe.from[1] * h] : undefined} w={w} h={h}>{loupe}</Loupe>
      : null;
    return (
      <AbsoluteFill style={{ background: "#020306", overflow: "hidden" }}>
        <Stage3D look="thumb" width={w} height={h} {...stage} overlay={<Thumb3DOverlay th={th} w={w} h={h} loupe={lp} />}>{scene}</Stage3D>
      </AbsoluteFill>
    );
  };

/** The video's own 3D thumbnail (videos/<id>/Thumb3D.tsx), and its loupe scene if the spec names one. */
export const LongThumb3D: React.FC<StoryProps> = ({ timeline }) => {
  const th = timeline.thumbnail!;
  const { width: w, height: h } = LONG_THUMB3D;
  const code = VIDEOS[timeline.id]?.components ?? {};
  const Own = code[th.component ?? "Thumb3D"] as unknown as React.FC<ThumbProps> | undefined;
  if (!Own) throw new Error(`remotion/src/videos/${timeline.id}/${th.component ?? "Thumb3D"}.tsx is missing (a 3D thumbnail's scene)`);
  const L = th.loupe ? code[th.loupe.component] as unknown as React.FC<ThumbProps> | undefined : undefined;
  return <Thumb3DFrame th={th} w={w} h={h} scene={<Own tl={timeline} th={th} w={w} h={h} />}
    loupe={L ? <L tl={timeline} th={th} w={w} h={h} /> : undefined} />;
};
