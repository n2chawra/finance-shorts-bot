// Explode: on a cue, a model's parts fly apart along their own directions (with a small stagger and
// a spring settle), each one labelled once it has arrived. `back` folds them together again.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { add3, scale3, type V3 } from "./core";
import { Label3D } from "./Label3D";

export type ExplodePart = {
  key: string;
  node: React.ReactNode;
  /** resting position (assembled) */
  at?: V3;
  /** direction × distance it travels when exploded */
  to: V3;
  label?: string;
  sub?: string;
  /** label position relative to the part's exploded position */
  labelOffset?: V3;
  /** the point on the part the leader line touches, relative to the part */
  labelAt?: V3;
  align?: "left" | "right" | "center";
  /** spin while travelling (radians around y) */
  spin?: number;
};

export type ExplodeProps = {
  parts: ExplodePart[];
  /** frame the parts start to separate (local time) */
  start: number;
  /** frames between one part and the next */
  stagger?: number;
  /** frame they fold back together (optional) */
  back?: number;
  /** label text size on screen */
  px?: number;
  labelColor?: string;
};

export const Explode: React.FC<ExplodeProps> = ({ parts, start, stagger = 4, back, px, labelColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <group>
      {parts.map((p, i) => {
        const go = spring({ frame: frame - start - i * stagger, fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
        const ret = back === undefined ? 0 : spring({ frame: frame - back - (parts.length - 1 - i) * 2, fps, config: { damping: 20, stiffness: 120 } });
        const k = Math.max(0, go - ret);
        const at = p.at ?? [0, 0, 0];
        const pos = add3(at, scale3(p.to, k));
        const settled = start + i * stagger + 16;
        return (
          <group key={p.key}>
            <group position={pos} rotation-y={(p.spin ?? 0) * k}>{p.node}</group>
            {p.label && (
              <Label3D at={add3(add3(at, p.to), p.labelAt ?? [0, 0, 0])} offset={p.labelOffset ?? [0.9, 0.35, 0]} text={p.label} sub={p.sub}
                start={settled} end={back} px={px} color={labelColor} align={p.align} />
            )}
          </group>
        );
      })}
    </group>
  );
};
