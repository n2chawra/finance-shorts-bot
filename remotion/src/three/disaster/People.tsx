// People: the human scale of a disaster, told without gore (owner, 2026-11-22, on the Hyatt walkway long
// video: "only showing death counts is not enough. Make that scenes. Don't make it very cruel or bloody").
// Simple clay figures (a rounded body and a head, no faces) that stand, dance or look up in the place, and
// that turn and move away from a point on a cue; `Rescuers` are the same figures in hi-vis with a lamp.
// The failure itself is never shown touching a figure: cut or dip to dust before contact, then show the
// aftermath (rescuers, lights, an empty floor). Seeded, so a re-render draws the same crowd.
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { rnd, type V3 } from "../core";
import { glow } from "../Proc";
import { useDLook } from "./look";

type Group = ThreeElements["group"];
export type CrowdMood = "stand" | "dance" | "lookUp";

/** Muted clothing colours: nothing that reads as the failure's red. */
export const CROWD_COLOURS = ["#5b6b82", "#8a7a68", "#4f6b5c", "#a3927d", "#6e5b7a", "#c2b49a", "#3f4a5c", "#7d8a93"];

export type CrowdProps = Group & {
  /** how many figures */
  count?: number;
  /** the floor they stand on: width (x) and depth (z), centred on the group */
  area?: [number, number];
  /** a figure's height in world units (Building floors are 0.7: a person is about 0.3) */
  height?: number;
  seed?: string;
  mood?: CrowdMood;
  /** on this frame (the beat's word), everyone turns and moves away from `from` */
  scatterAt?: number;
  /** where they move away from, in the group's space (the point under the failing part) */
  from?: V3;
  /** how far they get, in world units */
  scatterDist?: number;
  /** clothing colours (default CROWD_COLOURS) */
  colours?: string[];
  /** fade the whole crowd out from this frame over 12 frames (an empty floor after the cut) */
  goneAt?: number;
};

type Fig = { x: number; z: number; s: number; c: number; ph: number; yaw: number };

const Figure: React.FC<{ h: number; body: THREE.Material; head: THREE.Material; lean?: number; bob?: number; extra?: React.ReactNode }> = ({ h, body, head, lean = 0, bob = 0, extra }) => (
  <group position={[0, bob, 0]} rotation={[lean, 0, 0]}>
    {/* legs as one tapered block, body a capsule, head a sphere: a silhouette at any shot size */}
    <mesh position={[0, h * 0.22, 0]} material={body} castShadow receiveShadow><cylinderGeometry args={[h * 0.1, h * 0.08, h * 0.44, 10]} /></mesh>
    <mesh position={[0, h * 0.6, 0]} material={body} castShadow receiveShadow><capsuleGeometry args={[h * 0.12, h * 0.26, 4, 12]} /></mesh>
    <mesh position={[0, h * 0.9, 0]} material={head} castShadow><sphereGeometry args={[h * 0.095, 16, 12]} /></mesh>
    {extra}
  </group>
);

function useFigures(count: number, area: [number, number], seed: string): Fig[] {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (rnd(seed, i * 5) - 0.5) * area[0],
    z: (rnd(seed, i * 5 + 1) - 0.5) * area[1],
    s: 0.9 + rnd(seed, i * 5 + 2) * 0.2,
    c: Math.floor(rnd(seed, i * 5 + 3) * 1000),
    ph: rnd(seed, i * 5 + 4) * Math.PI * 2,
    yaw: (rnd(seed, i * 7 + 9) - 0.5) * Math.PI * 2,
  })), [count, area[0], area[1], seed]);
}

/** Crowd3D: people in the place, before the failure (a lobby, a platform, a deck, a ride's queue). */
export const Crowd3D: React.FC<CrowdProps> = ({ count = 40, area = [4, 3], height = 0.3, seed = "crowd", mood = "stand", scatterAt, from = [0, 0, 0], scatterDist = 1.2, colours = CROWD_COLOURS, goneAt, ...g }) => {
  const f = useCurrentFrame();
  const { paint } = useDLook();
  const figs = useFigures(count, area, seed);
  const skin = paint("body", "#d9c2a7");
  const op = goneAt === undefined ? 1 : interpolate(f, [goneAt, goneAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0) return null;
  return (
    <group {...g}>
      {figs.map((p, i) => {
        const h = height * p.s;
        let x = p.x, z = p.z, yaw = p.yaw, lean = 0;
        let bob = mood === "dance" ? Math.abs(Math.sin(f / 7 + p.ph)) * h * 0.08 : Math.sin(f / 30 + p.ph) * h * 0.01;
        if (mood === "lookUp") lean = -0.12;
        if (scatterAt !== undefined && f > scatterAt) {
          // they turn away from the point and hurry out of the frame's centre (eased, staggered a little)
          const dx = p.x - from[0], dz = p.z - from[2];
          const d = Math.hypot(dx, dz) || 1;
          const k = interpolate(f - scatterAt - (i % 5), [0, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
          x += (dx / d) * scatterDist * k;
          z += (dz / d) * scatterDist * k;
          yaw = Math.atan2(dx, dz);
          lean = 0.25 * Math.min(1, k * 3);
          bob = Math.abs(Math.sin(f / 3 + p.ph)) * h * 0.05 * (1 - k);
        }
        const body = paint("body", colours[p.c % colours.length]);
        const m = op < 1 ? fade(body, op) : body;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, yaw, 0]}>
            <Figure h={h} body={m} head={op < 1 ? fade(skin, op) : skin} lean={lean} bob={bob} />
          </group>
        );
      })}
    </group>
  );
};

const fades = new Map<string, THREE.Material>();
function fade(m: THREE.Material, op: number): THREE.Material {
  const k = `${m.uuid}|${op.toFixed(2)}`;
  let out = fades.get(k);
  if (!out) {
    out = m.clone();
    out.transparent = true;
    out.opacity = op;
    fades.set(k, out);
  }
  return out;
}

export type RescuersProps = Group & {
  /** where each rescuer stands, in the group's space */
  spots?: V3[];
  height?: number;
  /** from this frame they walk in from `enterFrom` (x offset) to their spot */
  enterAt?: number;
  enterFrom?: number;
  /** a head lamp on each one, so a dark aftermath has people moving with light in it */
  lamps?: boolean;
};

/** Rescuers: firefighters in hi-vis after the failure, bending over the debris with lamps (the aftermath). */
export const Rescuers: React.FC<RescuersProps> = ({ spots = [[-0.6, 0, 0.3], [0, 0, -0.2], [0.7, 0, 0.2]], height = 0.3, enterAt = 0, enterFrom = -1.5, lamps = true, ...g }) => {
  const f = useCurrentFrame();
  const { paint } = useDLook();
  const coat = paint("accent", "#e0a63a");
  const helmet = paint("trim", "#f2d14b");
  return (
    <group {...g}>
      {spots.map((s, i) => {
        const k = interpolate(f - enterAt - i * 6, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 2 });
        const x = s[0] + enterFrom * (1 - k);
        const bend = k >= 1 ? 0.35 + Math.sin(f / 25 + i) * 0.08 : 0.1;
        const lamp = lamps ? (
          <mesh position={[0, height * 0.92, height * 0.09]} material={glow("#fff4c8")}><sphereGeometry args={[height * 0.03, 8, 8]} /></mesh>
        ) : null;
        return (
          <group key={i} position={[x, s[1], s[2]]} rotation={[0, k < 1 ? Math.PI / 2 : (i % 2 ? 0.4 : -0.4), 0]}>
            <Figure h={height} body={coat} head={helmet} lean={bend} bob={k < 1 ? Math.abs(Math.sin(f / 4 + i)) * height * 0.04 : 0} extra={lamp} />
            {lamps && k >= 1 && <pointLight position={[0, height * 0.9, height * 0.3]} intensity={0.6} distance={height * 6} color="#fff4c8" />}
          </group>
        );
      })}
    </group>
  );
};
