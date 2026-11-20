// Thumbnail pieces for the 3D path (compositions/LongThumb3D.tsx; the tech thumbnail playbook, gaps #1–#2):
//   <ThumbCamera>  a close 3/4 view of the subject that also puts the depth-of-field focus on it, and
//                  can push the subject centre-right (`shift`) so the stacked words sit on the left
//   <Loupe>        a magnifier inset (P3 scale): a second small stage in a thick ringed circle with a
//                  leader to the spot it enlarges. It is a second WebGL context: one per thumbnail.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera3D } from "./Camera3D";
import { TECH, type V3 } from "./core";
import { Focus } from "./post";
import { Stage3D } from "./Stage3D";

export type ThumbCameraProps = {
  /** the point the thumbnail is about (the lit part) */
  target: V3;
  /** distance from it (world units) */
  dist?: number;
  /** around the vertical axis, radians: 0 = from the front (+z), 0.6 ≈ a 3/4 view from the right */
  yaw?: number;
  /** above the horizon, radians (0.35 ≈ 20°) */
  pitch?: number;
  fov?: number;
  /** move the subject right of centre by this share of the half-width (0.35 = centre-right, words on the left) */
  shift?: number;
  /** depth of field: the sharp range around the target (smaller = shallower) */
  range?: number;
  aspect?: number;
};

/** The camera pose of a ThumbCamera (pure). */
export function thumbPose({ target, dist = 3.2, yaw = 0.6, pitch = 0.38, fov = 30, shift = 0.35, aspect = 16 / 9 }: ThumbCameraProps): { pos: V3; look: V3; fov: number } {
  const dir: V3 = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
  const pos: V3 = [target[0] + dir[0] * dist, target[1] + dir[1] * dist, target[2] + dir[2] * dist];
  // the camera's right vector in the ground plane; looking left of the target puts it right of centre
  const right: V3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const half = dist * Math.tan(((fov / 2) * Math.PI) / 180) * aspect;
  const k = shift * half;
  const look: V3 = [target[0] - right[0] * k, target[1], target[2] - right[2] * k];
  return { pos: [pos[0] - right[0] * k, pos[1], pos[2] - right[2] * k], look, fov };
}

export const ThumbCamera: React.FC<ThumbCameraProps> = (p) => {
  const pose = thumbPose(p);
  return (
    <>
      <Camera3D keys={[{ f: 0, ...pose }]} drift={0} blur={0} />
      <Focus at={p.target} range={p.range ?? (p.dist ?? 3.2) * 0.25} />
    </>
  );
};

export type LoupeProps = {
  children: React.ReactNode;
  /** centre and radius of the lens on the thumbnail (px) */
  x: number;
  y: number;
  r: number;
  /** the spot on the main picture it enlarges (px): a leader line runs from the lens to it */
  from?: [number, number];
  w: number;
  h: number;
  color?: string;
};

/** A circular magnifier: its own small stage (the thumb look), a thick white rim with a coloured ring, a leader. */
export const Loupe: React.FC<LoupeProps> = ({ children, x, y, r, from, w, h, color = TECH.amber }) => {
  const rim = Math.max(8, r * 0.07);
  let leader: React.ReactNode = null;
  if (from) {
    const dx = from[0] - x, dy = from[1] - y, d = Math.hypot(dx, dy) || 1;
    const ex = x + (dx / d) * (r + rim), ey = y + (dy / d) * (r + rim);
    leader = (
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={ex} y1={ey} x2={from[0]} y2={from[1]} stroke="#fff" strokeWidth={rim * 0.9} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={from[0]} y2={from[1]} stroke={color} strokeWidth={rim * 0.45} strokeLinecap="round" />
        <circle cx={from[0]} cy={from[1]} r={rim * 1.6} fill="none" stroke="#fff" strokeWidth={rim * 0.6} />
        <circle cx={from[0]} cy={from[1]} r={rim * 1.6} fill="none" stroke={color} strokeWidth={rim * 0.3} />
      </svg>
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {leader}
      <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden",
        boxShadow: `0 0 0 ${rim}px #ffffff, 0 0 0 ${rim * 1.5}px ${color}, 0 ${rim}px ${rim * 4}px rgba(0,0,0,0.8)` }}>
        <Stage3D look="thumb" width={Math.round(2 * r)} height={Math.round(2 * r)} floor={false} vignette={0.5}>{children}</Stage3D>
      </div>
    </AbsoluteFill>
  );
};
