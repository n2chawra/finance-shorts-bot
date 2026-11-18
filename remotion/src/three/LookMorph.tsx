// LookMorph: one model changes how it is drawn on cues: textured → glowing wireframe → clay →
// x-ray → back to textured. Each change is a wipe: a glowing line rises through the model, the new
// look below it, the old above. The model is drawn twice during a wipe (once per look), each copy
// clipped to its side of the line; between wipes, once.
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { cue, TECH } from "./core";
import { mat, xray } from "./Proc";

export type Look = "textured" | "wire" | "clay" | "xray";

export type LookMorphProps = {
  children: React.ReactNode;
  /** the look from each frame on: [{ f: 0, look: "textured" }, { f: 40, look: "wire" }, …] */
  cues: { f: number; look: Look }[];
  /** frames each wipe takes */
  dur?: number;
  wireColor?: string;
};

type Side = { look: Look; keep: "above" | "below" | "all" };

function lookMaterial(look: Look, original: THREE.Material, wireColor: string): THREE.Material {
  switch (look) {
    case "textured": return original.clone();
    case "wire": return new THREE.MeshBasicMaterial({ color: new THREE.Color(wireColor).multiplyScalar(0.55), wireframe: true, toneMapped: false, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
    case "clay": return mat("clay").clone();
    case "xray": return xray(wireColor).clone();
  }
}

const LookCopy: React.FC<{ side: Side; plane: THREE.Plane; wireColor: string; children: React.ReactNode }> = ({ side, plane, wireColor, children }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || o.userData.noClip || (o as unknown as { isLine2?: boolean }).isLine2) return;
      const ud = mesh.userData as { lookOrig?: THREE.Material; lookFor?: string };
      const key = `${side.look}`;
      if (ud.lookFor !== key || !ud.lookOrig) {
        if (!ud.lookOrig) ud.lookOrig = mesh.material as THREE.Material;
        mesh.material = lookMaterial(side.look, ud.lookOrig, wireColor);
        ud.lookFor = key;
      }
      const m = mesh.material as THREE.Material;
      m.clippingPlanes = side.keep === "all" ? null : [plane];
      m.needsUpdate = m.needsUpdate || false;
    });
  }, -2);
  return <group ref={ref}>{children}</group>;
};

export const LookMorph: React.FC<LookMorphProps> = ({ children, cues, dur = 24, wireColor = TECH.cyan }) => {
  const frame = useCurrentFrame();
  const sorted = [...cues].sort((a, b) => a.f - b.f);
  let i = -1;
  for (let k = 0; k < sorted.length; k++) if (sorted[k]!.f <= frame) i = k;
  const now = sorted[Math.max(0, i)]?.look ?? "textured";
  const prev = i > 0 ? sorted[i - 1]!.look : now;
  const p = i >= 0 ? cue(frame, sorted[i]!.f, dur) : 1;
  const wiping = i > 0 && p < 1;

  const group = useRef<THREE.Group>(null);
  const box = useMemo(() => new THREE.Box3(), []);
  const below = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []); // keeps y < h
  const above = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []); // keeps y > h
  const line = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    box.setFromObject(g, false);
    if (box.isEmpty()) return;
    const h = box.min.y + (box.max.y - box.min.y) * p;
    below.constant = h;
    above.constant = -h;
    const l = line.current;
    if (l) {
      const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      l.position.set(c.x, h, c.z);
      l.scale.set(s.x * 1.08, 1, s.z * 1.08);
      l.updateMatrixWorld();
    }
  }, -3);
  return (
    <group>
      <group ref={group}>
        <LookCopy key={`now-${now}`} side={{ look: now, keep: wiping ? "below" : "all" }} plane={below} wireColor={wireColor}>{children}</LookCopy>
      </group>
      {wiping && <LookCopy key={`prev-${prev}`} side={{ look: prev, keep: "above" }} plane={above} wireColor={wireColor}>{children}</LookCopy>}
      {wiping && (
        <mesh ref={line} rotation-x={-Math.PI / 2} userData={{ noClip: true }} renderOrder={6}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color={new THREE.Color(wireColor).multiplyScalar(1.6)} transparent opacity={0.35} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
};
