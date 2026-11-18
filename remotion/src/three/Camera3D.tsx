// Camera3D: a keyframed camera. Keys are (frame, position, look-at, fov); between two keys the
// camera eases along a straight line, or around the look-at point when the later key says `orbit`.
// Builders make the usual moves (push-in, orbit, dolly, crane) so a beat reads like a shot list.
import { useThree } from "@react-three/fiber";
import { noise2D } from "@remotion/noise";
import type React from "react";
import { useLayoutEffect } from "react";
import { Easing, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { clamp01, lerp, lerp3, type V3 } from "./core";
import { useMotionBlur } from "./post";

export type CamKey = {
  f: number;
  pos: V3;
  look: V3;
  fov?: number;
  /** arrive at this key by swinging around the look-at point instead of a straight line */
  orbit?: boolean;
  /** easing of the segment that ends at this key (default in-out cubic) */
  ease?: (t: number) => number;
  /** a hard cut: hold the previous key until this frame, then jump here */
  cut?: boolean;
};

export type Pose = { pos: V3; look: V3; fov: number };

const DEFAULT_EASE = Easing.inOut(Easing.cubic);

function spherical(p: V3, c: V3): { r: number; theta: number; y: number } {
  const dx = p[0] - c[0], dz = p[2] - c[2];
  return { r: Math.hypot(dx, dz), theta: Math.atan2(dx, dz), y: p[1] - c[1] };
}

/** The camera's pose at `frame` (pure; tested). Holds before the first key and after the last. */
export function cameraPose(keys: CamKey[], frame: number): Pose {
  const sorted = [...keys].sort((a, b) => a.f - b.f);
  const first = sorted[0];
  if (!first) return { pos: [0, 2, 8], look: [0, 0, 0], fov: 35 };
  if (frame <= first.f) return { pos: first.pos, look: first.look, fov: first.fov ?? 35 };
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1]!, b = sorted[i]!;
    if (frame > b.f) continue;
    if (b.cut) {
      if (frame < b.f) return { pos: a.pos, look: a.look, fov: a.fov ?? 35 };
      return { pos: b.pos, look: b.look, fov: b.fov ?? a.fov ?? 35 };
    }
    const t = (b.ease ?? DEFAULT_EASE)(clamp01((frame - a.f) / Math.max(1, b.f - a.f)));
    const look = lerp3(a.look, b.look, t);
    const fov = lerp(a.fov ?? 35, b.fov ?? a.fov ?? 35, t);
    if (!b.orbit) return { pos: lerp3(a.pos, b.pos, t), look, fov };
    const sa = spherical(a.pos, a.look), sb = spherical(b.pos, b.look);
    let dth = sb.theta - sa.theta;
    if (dth > Math.PI) dth -= 2 * Math.PI;
    if (dth < -Math.PI) dth += 2 * Math.PI;
    const r = lerp(sa.r, sb.r, t), th = sa.theta + dth * t, y = lerp(sa.y, sb.y, t);
    return { pos: [look[0] + Math.sin(th) * r, look[1] + y, look[2] + Math.cos(th) * r], look, fov };
  }
  const last = sorted[sorted.length - 1]!;
  return { pos: last.pos, look: last.look, fov: last.fov ?? 35 };
}

/** Builders: each returns the keys of one move; concatenate them into a shot list. */
export const moves = {
  /** jump to a new pose on frame f (a cut) */
  cut: (f: number, pos: V3, look: V3, fov = 35): CamKey[] => [{ f, pos, look, fov, cut: true }],
  /** fly along a smooth path through `points`, looking `ahead` along it (or at `look` if given) */
  fly: (f0: number, f1: number, points: V3[], opts: { look?: V3; ahead?: number; fov?: number; steps?: number } = {}): CamKey[] => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const steps = opts.steps ?? Math.max(4, Math.round((f1 - f0) / 6));
    const ahead = opts.ahead ?? 0.06;
    const keys: CamKey[] = [];
    for (let i = 0; i <= steps; i++) {
      // ease the travel (slow in, slow out) by spacing the samples, then interpolate linearly
      const u = Easing.inOut(Easing.cubic)(i / steps);
      const p = curve.getPointAt(u);
      const q = curve.getPointAt(Math.min(1, u + ahead));
      const look: V3 = opts.look ?? (u + ahead > 1 ? [p.x + (p.x - curve.getPointAt(u - 0.02).x) * 20, p.y, p.z + (p.z - curve.getPointAt(u - 0.02).z) * 20] : [q.x, q.y, q.z]);
      keys.push({ f: f0 + ((f1 - f0) * i) / steps, pos: [p.x, p.y, p.z], look, fov: opts.fov ?? 35, ease: Easing.linear });
    }
    return keys;
  },
  hold: (f: number, pos: V3, look: V3, fov = 35): CamKey[] => [{ f, pos, look, fov }],
  /** move along the line of sight toward `look`, from distance d0 to d1 */
  pushIn: (f0: number, f1: number, look: V3, dir: V3, d0: number, d1: number, fov = 35, ease?: (t: number) => number): CamKey[] => {
    const n = new THREE.Vector3(...dir).normalize();
    const at = (d: number): V3 => [look[0] + n.x * d, look[1] + n.y * d, look[2] + n.z * d];
    return [{ f: f0, pos: at(d0), look, fov }, { f: f1, pos: at(d1), look, fov, ease }];
  },
  /** swing around `center` from angle a0 to a1 (radians, 0 = in front, +z) */
  orbit: (f0: number, f1: number, center: V3, radius: number, height: number, a0: number, a1: number, fov = 35, ease?: (t: number) => number): CamKey[] => {
    const at = (a: number): V3 => [center[0] + Math.sin(a) * radius, center[1] + height, center[2] + Math.cos(a) * radius];
    // split long swings so each segment stays under half a turn
    const steps = Math.max(1, Math.ceil(Math.abs(a1 - a0) / (Math.PI * 0.75)));
    const keys: CamKey[] = [{ f: f0, pos: at(a0), look: center, fov }];
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      keys.push({ f: lerp(f0, f1, u), pos: at(lerp(a0, a1, u)), look: center, fov, orbit: true, ease: steps === 1 ? ease : Easing.linear });
    }
    return keys;
  },
  /** slide sideways (a truck/dolly) while looking along a fixed direction */
  dolly: (f0: number, f1: number, from: V3, to: V3, lookDir: V3 = [0, 0, -1], fov = 35, ease?: (t: number) => number): CamKey[] => [
    { f: f0, pos: from, look: [from[0] + lookDir[0] * 6, from[1] + lookDir[1] * 6, from[2] + lookDir[2] * 6], fov },
    { f: f1, pos: to, look: [to[0] + lookDir[0] * 6, to[1] + lookDir[1] * 6, to[2] + lookDir[2] * 6], fov, ease },
  ],
  /** rise or sink (a crane) while keeping `look` in frame */
  crane: (f0: number, f1: number, look: V3, base: V3, y0: number, y1: number, fov = 35, ease?: (t: number) => number): CamKey[] => [
    { f: f0, pos: [base[0], y0, base[2]], look, fov },
    { f: f1, pos: [base[0], y1, base[2]], look, fov, ease },
  ],
};

export type Camera3DProps = {
  keys: CamKey[];
  /** a slight hand-held float in world units (seeded noise, deterministic); 0 = locked off */
  drift?: number;
  seed?: string;
  /** frame offset, when the keys are written in a parent's time */
  frame?: number;
  /** motion blur from the camera's speed (×; 0 = none) */
  blur?: number;
};

/** How much the picture moves between two poses: radial (moving along the view) and pan (the view
 * turning or sliding sideways), as fractions of the frame. Pure. */
export function poseMotion(a: Pose, b: Pose): { radial: number; pan: [number, number] } {
  const pa = new THREE.Vector3(...a.pos), pb = new THREE.Vector3(...b.pos);
  const la = new THREE.Vector3(...a.look), lb = new THREE.Vector3(...b.look);
  const fwd = lb.clone().sub(pb).normalize();
  const dist = Math.max(0.05, lb.distanceTo(pb));
  const v = pb.clone().sub(pa);
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, fwd).normalize();
  const span = 2 * Math.tan(THREE.MathUtils.degToRad(b.fov) / 2);
  const da = la.clone().sub(pa).normalize();
  const turn = fwd.clone().sub(da);
  const radial = Math.abs(v.dot(fwd)) / dist + Math.abs(Math.log(Math.max(1e-3, b.fov) / Math.max(1e-3, a.fov)));
  const px = (turn.dot(right) + v.dot(right) / dist) / span;
  const py = (turn.dot(up) + v.dot(up) / dist) / span;
  return { radial, pan: [px * 0.5, py * 0.5] };
}

/** Puts the default camera at its pose for this frame (before R3F draws the frame). */
export const Camera3D: React.FC<Camera3DProps> = ({ keys, drift = 0.03, seed = "cam", frame, blur = 1 }) => {
  const own = useCurrentFrame();
  const f = frame ?? own;
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const pose = cameraPose(keys, f);
  // the speed over the last frame drives the motion blur; never across a cut
  const cutNow = keys.some((k) => k.cut && k.f > f - 1 && k.f <= f);
  const mo = blur > 0 && !cutNow ? poseMotion(cameraPose(keys, f - 1), pose) : { radial: 0, pan: [0, 0] as [number, number] };
  useMotionBlur(`cam-${seed}`, mo.radial * 0.6 * blur, [mo.pan[0] * 0.6 * blur, mo.pan[1] * 0.6 * blur]);
  useLayoutEffect(() => {
    const t = f / 30;
    const dx = drift ? noise2D(`${seed}x`, t * 0.35, 0) * drift : 0;
    const dy = drift ? noise2D(`${seed}y`, t * 0.35, 1) * drift : 0;
    camera.position.set(pose.pos[0] + dx, pose.pos[1] + dy, pose.pos[2]);
    camera.up.set(0, 1, 0);
    camera.lookAt(pose.look[0] + dx * 0.5, pose.look[1] + dy * 0.5, pose.look[2]);
    if (camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
  });
  return null;
};
