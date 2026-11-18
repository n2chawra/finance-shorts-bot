// Overlays that point at the answer: Pointer3D (a bobbing arrow that lands on a spot, with a ring
// pulse), Highlight (the named thing glows amber and pulses), ScanDome (a wireframe dome grows over a
// thing, a scan band sweeps it, radar rings run out across the floor).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { cue, glowTexture, norm3, TECH, type V3 } from "./core";
import { glow } from "./Proc";

// ---------------------------------------------------------------------- Pointer3D

export type Pointer3DProps = {
  at: V3;
  /** the direction the arrow comes from (default from above) */
  from?: V3;
  /** arrow length, world units */
  size?: number;
  start?: number;
  end?: number;
  color?: string;
};

export const Pointer3D: React.FC<Pointer3DProps> = ({ at, from = [0, 1, 0], size = 0.5, start = 0, end, color = TECH.amber }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = cue(frame, start, 12, Easing.out(Easing.back(2)));
  const out = end === undefined ? 0 : cue(frame, end - 8, 8);
  const k = inn * (1 - out);
  const dir = norm3(from);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir)), [dir[0], dir[1], dir[2]]);
  if (k <= 0.001) return null;
  const bob = Math.sin(((frame - start) / fps) * Math.PI * 2 * 1.4) * size * 0.12;
  const gapD = size * 0.15 + bob + (1 - inn) * size * 1.5;
  const ring = ((frame - start) % 24) / 24;
  return (
    <group userData={{ noClip: true }}>
      <group position={[at[0] + dir[0] * gapD, at[1] + dir[1] * gapD, at[2] + dir[2] * gapD]} quaternion={q} scale={k}>
        <mesh position={[0, size * 0.18, 0]} rotation-x={Math.PI} material={glow(color)}><coneGeometry args={[size * 0.2, size * 0.36, 24]} /></mesh>
        <mesh position={[0, size * 0.62, 0]} material={glow(color)}><cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.55, 16]} /></mesh>
      </group>
      <mesh position={at} quaternion={q} rotation-x={0}>
        <ringGeometry args={[size * (0.15 + ring * 0.5), size * (0.19 + ring * 0.5), 48]} />
        <meshBasicMaterial color={color} transparent opacity={(1 - ring) * 0.9 * k} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------- Highlight

export type HighlightProps = {
  children: React.ReactNode;
  start: number;
  end?: number;
  color?: string;
  /** glow strength at the peak of the pulse */
  strength?: number;
};

/** Makes everything inside glow (emissive) in `color` between start and end, pulsing gently. */
export const Highlight: React.FC<HighlightProps> = ({ children, start, end, color = TECH.amber, strength = 1.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<THREE.Group>(null);
  const on = cue(frame, start, 8) * (end === undefined ? 1 : 1 - cue(frame, end - 8, 8));
  const pulse = 0.75 + 0.25 * Math.sin(((frame - start) / fps) * Math.PI * 2 * 1.2);
  const amount = on * pulse * strength;
  const col = useMemo(() => new THREE.Color(color), [color]);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || o.userData.noClip || (o as unknown as { isLine2?: boolean }).isLine2) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const own = mats.map((m) => {
        if (m.userData.hiOwner === mesh.uuid) return m;
        const c = m.clone();
        const std = c as THREE.MeshStandardMaterial;
        c.userData = { ...m.userData, hiOwner: mesh.uuid, baseEmissive: std.emissive ? std.emissive.clone() : null, baseEI: std.emissiveIntensity ?? 0 };
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? own : own[0]!;
      for (const m of own) {
        const std = m as THREE.MeshStandardMaterial;
        if (!std.emissive || !m.userData.baseEmissive) continue;
        const be = m.userData.baseEmissive as THREE.Color, bi = m.userData.baseEI as number;
        // blend the emissive toward the highlight colour (intensity as colour weight, so bloom catches it)
        if (amount <= 0.001) { std.emissive.copy(be); std.emissiveIntensity = bi; continue; }
        std.emissive.copy(be).multiplyScalar(bi).lerp(col, Math.min(1, amount * 0.22));
        std.emissiveIntensity = 1;
      }
    });
  });
  return <group ref={ref}>{children}</group>;
};

// ---------------------------------------------------------------------- ScanDome

export type ScanDomeProps = {
  at: V3;
  radius: number;
  start: number;
  end?: number;
  color?: string;
  /** scan sweeps per second */
  speed?: number;
  rings?: boolean;
};

export const ScanDome: React.FC<ScanDomeProps> = ({ at, radius, start, end, color = TECH.cyan, speed = 0.6, rings = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = cue(frame, start, 18, Easing.out(Easing.cubic));
  const out = end === undefined ? 0 : cue(frame, end - 10, 10);
  const op = (1 - out) * Math.min(1, grow * 1.5);
  if (grow <= 0 || op <= 0) return null;
  const t = (frame - start) / fps;
  const sweep = (Math.sin(t * Math.PI * 2 * speed - Math.PI / 2) * 0.5 + 0.5); // 0..1 up and down
  const bandY = sweep * radius * grow;
  const bandR = Math.sqrt(Math.max(0, (radius * grow) ** 2 - bandY ** 2));
  return (
    <group position={at} userData={{ noClip: true }}>
      <mesh scale={grow} renderOrder={4}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35 * op} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh scale={grow} renderOrder={3}>
        <sphereGeometry args={[radius * 0.995, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.07 * op} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* the scan band */}
      <mesh position={[0, bandY, 0]} rotation-x={-Math.PI / 2} renderOrder={5}>
        <ringGeometry args={[Math.max(0, bandR - radius * 0.03), bandR + 0.001, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.95 * op} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <sprite position={[0, bandY, 0]} scale={[bandR * 2.4, bandR * 0.5, 1]} renderOrder={5}>
        <spriteMaterial map={glowTexture()} color={color} transparent opacity={0.35 * op} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      {/* radar rings running out across the floor */}
      {rings && [0, 1, 2].map((i) => {
        const u = ((t * 0.7 + i / 3) % 1);
        return (
          <mesh key={i} position={[0, 0.004, 0]} rotation-x={-Math.PI / 2} renderOrder={2}>
            <ringGeometry args={[radius * (1 + u * 1.6), radius * (1 + u * 1.6) + 0.025, 96]} />
            <meshBasicMaterial color={color} transparent opacity={(1 - u) * 0.6 * op} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};
