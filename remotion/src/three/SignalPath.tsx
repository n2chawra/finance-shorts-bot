// SignalPath: a track that draws itself along a 3D curve, then glowing pulses that run along it
// (data, electricity, light). Pulse positions are a pure function of the frame, so they loop cleanly.
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { cue, glowTexture, TECH, type V3 } from "./core";

export type SignalPathProps = {
  points: V3[];
  color?: string;
  /** tube radius of the track */
  radius?: number;
  /** frame the track starts drawing, and how long the draw takes */
  start?: number;
  draw?: number;
  /** pulses on the path at once, laps per second, and the pulse size */
  pulses?: number;
  speed?: number;
  size?: number;
  /** pulses run backwards */
  reverse?: boolean;
  /** straight segments between points (wires on a board) instead of a smooth curve */
  straight?: boolean;
  /** fade the whole path out from this frame */
  end?: number;
};

const SEG = 160, RAD = 8;

export const SignalPath: React.FC<SignalPathProps> = ({
  points, color = TECH.cyan, radius = 0.025, start = 0, draw = 20, pulses = 3, speed = 0.6, size = 0.16, reverse = false, straight = false, end,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const curve = useMemo(() => {
    const v = points.map((p) => new THREE.Vector3(...p));
    if (!straight) return new THREE.CatmullRomCurve3(v, false, "centripetal");
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < v.length; i++) path.add(new THREE.LineCurve3(v[i - 1]!, v[i]!));
    return path;
  }, [points, straight]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve as THREE.Curve<THREE.Vector3>, SEG, radius, RAD, false), [curve, radius]);
  const p = cue(frame, start, draw);
  const fade = end === undefined ? 1 : 1 - cue(frame, end - 10, 10);
  // TubeGeometry indexes 6 per quad, RAD quads per ring segment
  geo.setDrawRange(0, Math.floor(SEG * p) * RAD * 6);
  const running = frame - start - draw * 0.6;
  if (p <= 0 || fade <= 0) return null;
  const tex = glowTexture();
  const tail = 5;
  return (
    <group userData={{ noClip: true }}>
      <mesh geometry={geo} renderOrder={3}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.4} metalness={0.2} transparent opacity={0.8 * fade} toneMapped={false} />
      </mesh>
      {running > 0 && Array.from({ length: pulses }, (_, i) => {
        const lap = ((running / fps) * speed + i / pulses) % 1;
        return Array.from({ length: tail }, (_, k) => {
          const u = reverse ? 1 - lap + k * 0.012 : lap - k * 0.012;
          if (u < 0 || u > 1) return null;
          const at = curve.getPointAt(u);
          const s = size * (1 - k / tail) * (k === 0 ? 1.6 : 1);
          return (
            <sprite key={`${i}-${k}`} position={at} scale={[s, s, s]} renderOrder={6} userData={{ noClip: true, noFade: true }}>
              <spriteMaterial map={tex} color={k === 0 ? "#ffffff" : color} transparent opacity={(k === 0 ? 1 : 0.8 - k * 0.12) * fade}
                blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
            </sprite>
          );
        });
      })}
      {running > 0 && Array.from({ length: pulses }, (_, i) => {
        const lap = ((running / fps) * speed + i / pulses) % 1;
        const at = curve.getPointAt(reverse ? 1 - lap : lap);
        return (
          <sprite key={`halo${i}`} position={at} scale={[size * 4, size * 4, size * 4]} renderOrder={5} userData={{ noClip: true, noFade: true }}>
            <spriteMaterial map={tex} color={color} transparent opacity={0.45 * fade} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </sprite>
        );
      })}
    </group>
  );
};
