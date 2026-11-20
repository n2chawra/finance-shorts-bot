// Failure3D: the moment of failure on any part (references §3: "the mechanism is the reveal").
// Wrap the failing part:
//   - stress colour: the part's own colour → grey → amber → red as `stress` goes 0 → 1, optionally
//     only around a hot spot (`hot`, `hotRadius`), glowing (bloom) near the top of the ramp;
//   - fracture by `progress` 0 → 1: `hinge` (rotates about `pivot` on `axis`), `buckle` (sags and
//     kinks between `span` x0..x1, bent in the vertex shader), `shear` (cut by a plane; the far side
//     slides along `slide` and drops), `tear` (cut; the far side peels away about the cut line);
//   - slow-motion debris (seeded chunks and sparks) from `debris.at`.
// Never bodies or gore: this shows parts, not people. Pure function of its props (drive them from
// the frame with cue()); no state between frames.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp01, rnd, type V3 } from "../core";
import { glow } from "../Proc";
import { rampColor, useDLook } from "./look";

export type FractureMode = "none" | "hinge" | "buckle" | "shear" | "tear";

export type DebrisSpec = {
  count?: number;
  /** where it comes from (local) */
  at: V3;
  /** the cloud's radius at the source */
  spread?: number;
  /** mean throw direction (local) and speed (units/s) */
  dir?: V3;
  speed?: number;
  /** chunk size */
  size?: number;
  /** progress at which it starts */
  start?: number;
  /** seconds of (slowed) flight between start and progress 1 */
  seconds?: number;
  /** slow motion factor (0.3 = a third of real speed) */
  slow?: number;
  gravity?: number;
  /** stops falling at this local y */
  floor?: number;
  color?: string;
  /** amber sparks as well (default true) */
  sparks?: boolean;
  seed?: string;
};

export type Failure3DProps = {
  children: React.ReactNode;
  /** 0 calm → 1 failing */
  stress?: number;
  /** a hot spot (local); without it the whole part takes the ramp */
  hot?: V3;
  hotRadius?: number;
  /** emissive strength of the ramp at full stress (bloom); 0 = no glow */
  glowAt?: number;
  /** frame, for the stress pulse near failure */
  frame?: number;
  mode?: FractureMode;
  /** 0 → 1 */
  progress?: number;
  /** hinge / tear: the pivot (local) and axis; angle at progress 1 (rad) */
  pivot?: V3;
  axis?: V3;
  angle?: number;
  /** shear / tear: the cut plane (local); the side the normal points to moves */
  cut?: { at: V3; normal: V3 };
  /** shear: how far and where the moving side slides (local); it also drops by `drop` */
  slide?: V3;
  drop?: number;
  /** buckle: the member's extent along local x, how far it sags at progress 1, kink sharpness (0.5 soft … 2 sharp) */
  span?: [number, number];
  sag?: number;
  sharp?: number;
  debris?: DebrisSpec;
};

type U = {
  fM: { value: THREE.Matrix4 }; fMInv: { value: THREE.Matrix4 }; fBuckle: { value: number }; fSpan: { value: THREE.Vector3 };
  fTint: { value: number }; fHot: { value: THREE.Vector3 }; fRadius: { value: number }; fRamp: { value: THREE.Color }; fGlow: { value: number };
};

let ids = 0;

function patch(src: THREE.Material, U: U, owner: string, planes: THREE.Plane[] | null, doubleSide: boolean): THREE.Material {
  const m = src.clone();
  const prev = src.onBeforeCompile;
  const prevKey = src.customProgramCacheKey();
  m.userData = { ...src.userData, failOwner: owner, failSrc: src };
  if (planes) m.clippingPlanes = planes;
  if (doubleSide) m.side = THREE.DoubleSide;
  m.onBeforeCompile = (sh, r) => {
    prev.call(src, sh, r);
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform mat4 fM;\nuniform mat4 fMInv;\nuniform float fBuckle;\nuniform vec3 fSpan;\nvarying vec3 vFW;")
      .replace("#include <project_vertex>", `
        vec4 fP = vec4( transformed, 1.0 );
        #ifdef USE_BATCHING
          fP = batchingMatrix * fP;
        #endif
        #ifdef USE_INSTANCING
          fP = instanceMatrix * fP;
        #endif
        vec4 fW = modelMatrix * fP;
        if ( fBuckle != 0.0 ) {
          vec3 fl = ( fMInv * fW ).xyz;
          float fu = clamp( ( fl.x - fSpan.x ) / max( 1e-4, fSpan.y - fSpan.x ), 0.0, 1.0 );
          float fk = pow( max( 0.0, 1.0 - abs( 2.0 * fu - 1.0 ) ), fSpan.z );
          fl.y -= fBuckle * fk;
          fl.z += fBuckle * 0.16 * fk;
          fW = fM * vec4( fl, 1.0 );
        }
        vFW = fW.xyz;
        vec4 mvPosition = viewMatrix * fW;
        gl_Position = projectionMatrix * mvPosition;`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float fTint;\nuniform vec3 fHot;\nuniform float fRadius;\nuniform vec3 fRamp;\nuniform float fGlow;\nvarying vec3 vFW;")
      .replace("#include <color_fragment>", `#include <color_fragment>
        float fK = fRadius > 0.0 ? 1.0 - smoothstep( fRadius * 0.25, fRadius, distance( vFW, fHot ) ) : 1.0;
        diffuseColor.rgb = mix( diffuseColor.rgb, fRamp, clamp( fTint * fK, 0.0, 1.0 ) );`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        totalEmissiveRadiance += fRamp * fGlow * fK;`);
  };
  m.customProgramCacheKey = () => `${prevKey}|dfail1`;
  m.needsUpdate = true;
  return m;
}

const tess = new Map<string, THREE.BufferGeometry>();
/** A box with only its 8 corners can't bend: swap it for a subdivided one (cached by size). */
function tessellate(mesh: THREE.Mesh) {
  const g = mesh.geometry as THREE.BoxGeometry;
  if (g.type !== "BoxGeometry" || g.userData.tess) return;
  const { width: w, height: h, depth: d } = g.parameters;
  const seg = (x: number) => Math.min(48, Math.max(1, Math.round(x * 8)));
  const key = `${w}|${h}|${d}`;
  let t = tess.get(key);
  if (!t) {
    t = new THREE.BoxGeometry(w, h, d, seg(w), Math.min(8, seg(h)), seg(d));
    t.userData.tess = true;
    tess.set(key, t);
  }
  mesh.geometry = t;
}

function applyTree(root: THREE.Object3D | null, U: U, owner: string, planes: THREE.Plane[] | null, doubleSide: boolean, bend = false) {
  if (!root) return;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || o.userData.noClip || o.userData.noFail || !mesh.material) return;
    if (bend && !(mesh as THREE.InstancedMesh).isInstancedMesh) tessellate(mesh);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (mats.every((x) => x.userData.failOwner === owner)) return;
    const own = mats.map((x) => (x.userData.failOwner === owner ? x : patch((x.userData.failSrc as THREE.Material | undefined) ?? x, U, owner, planes, doubleSide)));
    mesh.material = Array.isArray(mesh.material) ? own : own[0]!;
  });
}

const ease = (t: number) => t * t * (3 - 2 * t);

export const Failure3D: React.FC<Failure3DProps> = ({
  children, stress = 0, hot, hotRadius = 0.8, glowAt = 1.6, frame = 0, mode = "none", progress = 0,
  pivot = [0, 0, 0], axis = [0, 0, 1], angle = 0.6, cut, slide = [0, 0, 0], drop = 0.6, span = [-1, 1], sag = 0.5, sharp = 1.2, debris,
}) => {
  const id = useMemo(() => `fail${ids++}`, []);
  const root = useRef<THREE.Group>(null);
  const partA = useRef<THREE.Group>(null);
  const partB = useRef<THREE.Group>(null);
  const U = useMemo<U>(() => ({
    fM: { value: new THREE.Matrix4() }, fMInv: { value: new THREE.Matrix4() }, fBuckle: { value: 0 }, fSpan: { value: new THREE.Vector3() },
    fTint: { value: 0 }, fHot: { value: new THREE.Vector3() }, fRadius: { value: 0 }, fRamp: { value: new THREE.Color() }, fGlow: { value: 0 },
  }), []);
  const planeA = useMemo(() => new THREE.Plane(), []);
  const planeB = useMemo(() => new THREE.Plane(), []);
  const split = (mode === "shear" || mode === "tear") && !!cut;
  const p = clamp01(progress);
  const e = ease(p);

  // the moving side's transform (in the wrapper's space)
  const bT = useMemo(() => {
    const pos = new THREE.Vector3(), q = new THREE.Quaternion();
    if (!cut) return { pos, q };
    const n = new THREE.Vector3(...cut.normal).normalize();
    if (mode === "shear") {
      pos.set(...slide).multiplyScalar(e).add(new THREE.Vector3(0, -drop * p * p, 0));
      const ax = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0));
      if (ax.lengthSq() < 1e-6) ax.set(0, 0, 1);
      q.setFromAxisAngle(ax.normalize(), -0.35 * p * p);
    } else if (mode === "tear") {
      const ax = new THREE.Vector3(...axis).normalize();
      q.setFromAxisAngle(ax, angle * e);
      // rotate about the cut point: pos = at - R·at
      const at = new THREE.Vector3(...cut.at);
      pos.copy(at).sub(at.clone().applyQuaternion(q)).add(new THREE.Vector3(...slide).multiplyScalar(e)).add(new THREE.Vector3(0, -drop * p * p, 0));
    }
    return { pos, q };
  }, [cut?.at[0], cut?.at[1], cut?.at[2], cut?.normal[0], cut?.normal[1], cut?.normal[2], mode, slide[0], slide[1], slide[2], e, p, drop, axis[0], axis[1], axis[2], angle]);

  const hingeQ = useMemo(() => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis).normalize(), mode === "hinge" ? angle * e : 0), [axis[0], axis[1], axis[2], angle, e, mode]);

  useLayoutEffect(() => {
    const r = root.current;
    if (!r) return;
    r.updateWorldMatrix(true, true);
    U.fM.value.copy(r.matrixWorld);
    U.fMInv.value.copy(r.matrixWorld).invert();
    U.fBuckle.value = mode === "buckle" ? sag * e : 0;
    U.fSpan.value.set(span[0], span[1], sharp);
    const s = clamp01(stress);
    // the pulse near failure: 2 Hz at 30 fps, deterministic
    const pulse = s > 0.75 ? 0.75 + 0.25 * Math.sin(frame * 0.42) : 1;
    U.fTint.value = Math.min(1, s * 2.5);
    rampColor(s, U.fRamp.value);
    U.fGlow.value = s > 0.55 ? glowAt * ((s - 0.55) / 0.45) * pulse : 0;
    if (hot) { U.fHot.value.set(...hot).applyMatrix4(r.matrixWorld); U.fRadius.value = hotRadius * r.matrixWorld.getMaxScaleOnAxis(); }
    else U.fRadius.value = 0;
    if (split && cut) {
      const n = new THREE.Vector3(...cut.normal).normalize(), at = new THREE.Vector3(...cut.at);
      // three keeps the positive side of a clipping plane: A keeps the -normal side, B the +normal side
      planeA.setFromNormalAndCoplanarPoint(n.clone().negate(), at).applyMatrix4(partA.current!.matrixWorld);
      planeB.setFromNormalAndCoplanarPoint(n, at).applyMatrix4(partB.current!.matrixWorld);
    }
    applyTree(partA.current, U, `${id}A${split ? "s" : ""}`, split ? [planeA] : null, split, mode === "buckle");
    if (split) applyTree(partB.current, U, `${id}B`, [planeB], true);
  });

  return (
    <group ref={root}>
      {mode === "hinge" ? (
        <group position={pivot} quaternion={hingeQ}>
          <group position={[-pivot[0], -pivot[1], -pivot[2]]} ref={partA}>{children}</group>
        </group>
      ) : (
        <group ref={partA}>{children}</group>
      )}
      {split && <group ref={partB} position={bT.pos} quaternion={bT.q}>{children}</group>}
      {debris && <Debris {...debris} progress={p} />}
    </group>
  );
};

/** Slow-motion debris: seeded chunks (and amber sparks) thrown from a point, falling under gravity
 * to a floor. Pure function of progress. */
export const Debris: React.FC<DebrisSpec & { progress: number }> = ({
  count = 36, at, spread = 0.15, dir = [0, 1, 0], speed = 2.2, size = 0.07, start = 0, seconds = 2.4, slow = 0.4, gravity = 6, floor = -1e9,
  color, sparks = true, seed = "debris", progress,
}) => {
  const { paint } = useDLook();
  const chunks = useRef<THREE.InstancedMesh>(null);
  const sp = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const sgeo = useMemo(() => new THREE.SphereGeometry(1, 6, 4), []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const nSp = sparks ? Math.round(count * 0.5) : 0;
  const t = Math.max(0, (progress - start) / Math.max(1e-3, 1 - start)) * seconds * slow;
  const d = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir[0], dir[1], dir[2]]);
  useLayoutEffect(() => {
    const place = (m: THREE.InstancedMesh | null, n: number, key: string, sz: number, spd: number, life: number) => {
      if (!m) return;
      for (let i = 0; i < n; i++) {
        const r = (k: number) => rnd(`${seed}${key}`, i * 11 + k);
        const v = new THREE.Vector3(r(0) - 0.5, r(1) - 0.5, r(2) - 0.5).multiplyScalar(1.6).add(d).normalize().multiplyScalar(spd * (0.4 + r(3)));
        const o = new THREE.Vector3(r(4) - 0.5, r(5) - 0.5, r(6) - 0.5).multiplyScalar(spread * 2);
        const tt = t * (0.85 + r(7) * 0.3);
        const y = at[1] + o.y + v.y * tt - 0.5 * gravity * tt * tt;
        tmp.position.set(at[0] + o.x + v.x * tt, Math.max(floor, y), at[2] + o.z + v.z * tt);
        tmp.rotation.set(r(8) * 6 + tt * 4 * (r(9) - 0.5), r(10) * 6 + tt * 3, tt * 2);
        const alive = t > 0 && tt < life;
        const s = alive ? sz * (0.4 + r(3) * 0.9) * (life < 10 ? 1 - tt / life : 1) : 0;
        tmp.scale.set(s, s * (0.6 + r(2) * 0.6), s * (0.7 + r(1) * 0.5));
        tmp.updateMatrix();
        m.setMatrixAt(i, tmp.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    };
    place(chunks.current, count, "c", size, speed, 1e9);
    place(sp.current, nSp, "s", size * 0.35, speed * 1.6, 0.9);
  });
  return (
    <group userData={{ noFail: true }}>
      <instancedMesh ref={chunks} args={[geo, undefined, count]} material={paint("concrete", color)} castShadow userData={{ noFail: true }} frustumCulled={false} />
      {nSp > 0 && <instancedMesh ref={sp} args={[sgeo, undefined, nSp]} material={glow("#ffb23e")} userData={{ noFail: true }} frustumCulled={false} />}
    </group>
  );
};
