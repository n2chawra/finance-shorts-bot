// Cutaway: a clipping plane slices everything inside it open over time. The cut faces show a flat
// "cap" colour (the inside of the solid), and a thin glowing sheet marks where the knife is.
// Labels and anything with userData.noClip are never cut.
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { cue, norm3, TECH, type V3 } from "./core";

export type CutawayProps = {
  children: React.ReactNode;
  /** the kept side: points with dot(normal, p) + d >= 0 stay (local space of this group) */
  normal?: V3;
  /** plane offset at the start and at the end of the cut */
  from: number;
  to: number;
  start: number;
  dur?: number;
  /** colour of the cut faces */
  cap?: string;
  /** a glowing sheet at the cut, this many units square (0 = none) */
  sheet?: number;
  sheetColor?: string;
};

const patched = new WeakMap<THREE.Material, THREE.Plane>();

function patch(m: THREE.Material, plane: THREE.Plane, cap: THREE.Color): void {
  if (patched.get(m) === plane) {
    m.clippingPlanes = [plane];
    return;
  }
  patched.set(m, plane);
  m.clippingPlanes = [plane];
  m.clipShadows = true;
  m.side = THREE.DoubleSide;
  const c = `vec3(${cap.r.toFixed(4)}, ${cap.g.toFixed(4)}, ${cap.b.toFixed(4)})`;
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>\n if (!gl_FrontFacing) { gl_FragColor = vec4(${c}, gl_FragColor.a); }`,
    );
  };
  m.customProgramCacheKey = () => `cut-${c}`;
  m.needsUpdate = true;
}

export const Cutaway: React.FC<CutawayProps> = ({ children, normal = [-1, 0, 0], from, to, start, dur = 30, cap = "#ff9a3c", sheet = 0, sheetColor = TECH.cyan }) => {
  const frame = useCurrentFrame();
  const d = from + (to - from) * cue(frame, start, dur);
  const n = norm3(normal);
  const local = useMemo(() => new THREE.Plane(), []);
  const world = useMemo(() => new THREE.Plane(), []);
  const capColor = useMemo(() => new THREE.Color(cap).convertSRGBToLinear(), [cap]);
  const group = useRef<THREE.Group>(null);
  const content = useRef<THREE.Group>(null);
  local.set(new THREE.Vector3(...n), d);

  // runs inside R3F's frame, before the draw: move the plane to world space, clip every material
  useFrame(() => {
    const g = group.current, inner = content.current;
    if (!g || !inner) return;
    g.updateWorldMatrix(true, false);
    world.copy(local).applyMatrix4(g.matrixWorld);
    inner.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.material || o.userData.noClip) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const own = mats.map((mm) => {
        if (mm.userData.cutOwner === mesh.uuid) return mm;
        const c = mm.clone();
        c.userData = { ...mm.userData, cutOwner: mesh.uuid };
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? own : own[0]!;
      for (const mm of own) patch(mm, world, capColor);
    });
  }, -1);

  // the sheet sits on the plane: its normal is n, its centre the point on the plane nearest the origin
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...n)), [n[0], n[1], n[2]]);
  const active = frame >= start && frame <= start + dur + 1;
  return (
    <group ref={group}>
      <group ref={content}>{children}</group>
      {sheet > 0 && d !== from && (
        <mesh position={[-n[0] * d, -n[1] * d, -n[2] * d]} quaternion={q} userData={{ noClip: true }} renderOrder={5}>
          <planeGeometry args={[sheet, sheet]} />
          <meshBasicMaterial color={sheetColor} transparent opacity={active ? 0.22 : 0.08} side={THREE.DoubleSide} depthWrite={false}
            blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};
