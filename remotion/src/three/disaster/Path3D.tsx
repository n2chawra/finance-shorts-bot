// Path3D: a flight / route path from the timeline's samples (x,y,z, or lat/lon/alt projected around
// an origin), drawn as a glowing tube coloured by a value (grey → amber → red: speed, descent rate,
// stress), a translucent drop curtain to the ground (the Fault Lines look, done properly), its
// ground trace, event callouts (Label3D) that write on as the head passes them, and a travelling
// marker that can carry a model (a Jet) oriented along the path.
import { Line } from "@react-three/drei";
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { clamp01, glowTexture, type V3 } from "../core";
import { Label3D } from "../Label3D";
import { RAMP, useDLook } from "./look";

export type PathSample = { t: number; v?: number } & ({ x: number; y: number; z: number } | { lat: number; lon: number; alt: number });

/** How lat/lon/alt map to world units: around (lat0, lon0), `km` kilometres per unit across, `m`
 * metres of altitude per unit up (vertical exaggeration = (km·1000) / m). */
export type GeoProjection = { lat0: number; lon0: number; km?: number; m?: number };

export type PathEvent = { t: number; text: string; sub?: string; offset?: V3; color?: string };

export type BuiltPath = { curve: THREE.CatmullRomCurve3; t0: number; t1: number; ts: number[]; vs: number[]; n: number };

function project(s: PathSample, geo?: GeoProjection): V3 {
  if ("x" in s) return [s.x, s.y, s.z];
  const g = geo ?? { lat0: s.lat, lon0: s.lon };
  const km = g.km ?? 1, m = g.m ?? 300;
  const kx = 111.32 * Math.cos(THREE.MathUtils.degToRad(g.lat0));
  // east → +x, north → -z (a map seen from the south), altitude → +y
  return [((s.lon - g.lon0) * kx) / km, s.alt / m, (-(s.lat - g.lat0) * 110.57) / km];
}

/** Build a path from samples (time-ordered). */
export function buildPath(samples: PathSample[], geo?: GeoProjection): BuiltPath {
  const pts = samples.map((s) => new THREE.Vector3(...project(s, geo)));
  if (pts.length === 1) pts.push(pts[0]!.clone().add(new THREE.Vector3(0.01, 0, 0)));
  return {
    curve: new THREE.CatmullRomCurve3(pts, false, "centripetal"),
    t0: samples[0]!.t, t1: samples[samples.length - 1]!.t,
    ts: samples.map((s) => s.t), vs: samples.map((s) => s.v ?? 0), n: Math.max(2, samples.length),
  };
}

/** The curve parameter at sample time t (samples are spaced by index on the curve). */
function paramAt(P: BuiltPath, t: number): number {
  const { ts } = P;
  if (t <= ts[0]!) return 0;
  for (let i = 1; i < ts.length; i++) {
    if (t <= ts[i]!) return (i - 1 + (t - ts[i - 1]!) / Math.max(1e-9, ts[i]! - ts[i - 1]!)) / (P.n - 1);
  }
  return 1;
}
function valueAt(P: BuiltPath, u: number): number {
  const f = u * (P.n - 1), i = Math.min(P.n - 2, Math.floor(f));
  return P.vs[i]! + (P.vs[i + 1]! - P.vs[i]!) * (f - i);
}

/** Where the head is at sample time t: position and an orientation with +x along the path
 * (banking into turns by `bank`). Use it to fly a Jet or put a camera on the path. */
export function pathPose(P: BuiltPath, t: number, bank = 0): { pos: V3; quat: THREE.Quaternion; tangent: V3 } {
  const u = paramAt(P, t);
  const p = P.curve.getPoint(u);
  const a = P.curve.getPoint(Math.max(0, u - 0.004)), b = P.curve.getPoint(Math.min(1, u + 0.004));
  const tan = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tan);
  if (bank) {
    const a2 = P.curve.getPoint(Math.min(1, u + 0.02));
    const turn = a2.clone().sub(b).normalize().cross(tan).y;
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.clamp(-turn * bank * 20, -0.9, 0.9)));
  }
  return { pos: [p.x, p.y, p.z], quat: q, tangent: [tan.x, tan.y, tan.z] };
}

export type Path3DProps = {
  samples: PathSample[];
  geo?: GeoProjection;
  /** draw from frame `start` over `dur` frames (sample time maps linearly); or set `t` directly */
  start?: number;
  dur?: number;
  t?: number;
  /** value range mapped onto the ramp (defaults to the samples' min/max) */
  range?: [number, number];
  ramp?: [string, string, string];
  radius?: number;
  /** the drop curtain to `ground` (y) */
  curtain?: boolean;
  curtainOpacity?: number;
  ground?: number;
  /** the trace on the ground */
  trace?: boolean;
  events?: PathEvent[];
  labelPx?: number;
  /** a model carried at the head, +x along the path */
  marker?: React.ReactNode;
  markerGlow?: boolean;
  bank?: number;
  segments?: number;
  /** leave this much (world units) of the tube undrawn behind the head, so it doesn't run through the marker */
  gap?: number;
};

export const Path3D: React.FC<Path3DProps> = ({
  samples, geo, start = 0, dur = 90, t, range, ramp = [RAMP.calm, RAMP.warn, RAMP.fail], radius = 0.05, curtain = true, curtainOpacity = 0.32,
  ground = 0, trace = true, events = [], labelPx = 44, marker, markerGlow = true, bank = 0, segments = 320, gap = 0,
}) => {
  const frame = useCurrentFrame();
  const look = useDLook();
  const P = useMemo(() => buildPath(samples, geo), [samples, geo]);
  const tNow = t ?? P.t0 + (P.t1 - P.t0) * clamp01((frame - start) / Math.max(1, dur));
  const uNow = paramAt(P, tNow);
  const frameOf = (te: number) => start + ((te - P.t0) / Math.max(1e-9, P.t1 - P.t0)) * dur;

  const geom = useMemo(() => {
    const N = segments, R = 8;
    const lo = range ? range[0] : Math.min(...P.vs), hi = range ? range[1] : Math.max(...P.vs);
    const cs = ramp.map((c) => new THREE.Color(c));
    const colorAt = (v: number, out: THREE.Color) => {
      const k = clamp01((v - lo) / Math.max(1e-9, hi - lo));
      return k < 0.5 ? out.copy(cs[0]!).lerp(cs[1]!, k * 2) : out.copy(cs[1]!).lerp(cs[2]!, (k - 0.5) * 2);
    };
    const tubePos: number[] = [], tubeCol: number[] = [], tubeIdx: number[] = [];
    const curPos: number[] = [], curCol: number[] = [], curIdx: number[] = [];
    const ground3: V3[] = [];
    const c = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
    let prevN = new THREE.Vector3(0, 0, 1);
    for (let k = 0; k <= N; k++) {
      const u = k / N;
      const p = P.curve.getPoint(u);
      const tan = P.curve.getPoint(Math.min(1, u + 1 / N)).sub(P.curve.getPoint(Math.max(0, u - 1 / N))).normalize();
      let nrm = new THREE.Vector3().crossVectors(tan, up);
      if (nrm.lengthSq() < 1e-6) nrm = prevN.clone();
      nrm.normalize();
      prevN = nrm;
      const bin = new THREE.Vector3().crossVectors(nrm, tan).normalize();
      colorAt(valueAt(P, u), c);
      for (let j = 0; j < R; j++) {
        const a = (j / R) * Math.PI * 2;
        const o = nrm.clone().multiplyScalar(Math.cos(a) * radius).addScaledVector(bin, Math.sin(a) * radius);
        tubePos.push(p.x + o.x, p.y + o.y, p.z + o.z);
        tubeCol.push(c.r * 1.6, c.g * 1.6, c.b * 1.6);
      }
      curPos.push(p.x, p.y, p.z, p.x, ground, p.z);
      curCol.push(c.r, c.g, c.b, 0, 0, 0);
      ground3.push([p.x, ground + 0.01, p.z]);
      if (k < N) {
        for (let j = 0; j < R; j++) {
          const a = k * R + j, b = k * R + ((j + 1) % R), a2 = a + R, b2 = b + R;
          tubeIdx.push(a, a2, b, b, a2, b2);
        }
        const q = k * 2;
        curIdx.push(q, q + 1, q + 2, q + 2, q + 1, q + 3);
      }
    }
    const tube = new THREE.BufferGeometry();
    tube.setAttribute("position", new THREE.Float32BufferAttribute(tubePos, 3));
    tube.setAttribute("color", new THREE.Float32BufferAttribute(tubeCol, 3));
    tube.setIndex(tubeIdx);
    tube.computeVertexNormals();
    const cur = new THREE.BufferGeometry();
    cur.setAttribute("position", new THREE.Float32BufferAttribute(curPos, 3));
    cur.setAttribute("color", new THREE.Float32BufferAttribute(curCol, 3));
    cur.setIndex(curIdx);
    return { tube, cur, ground3, N, R };
  }, [P, segments, radius, ground, range?.[0], range?.[1], ramp[0], ramp[1], ramp[2]]);

  const len = useMemo(() => P.curve.getLength(), [P]);
  const shown = Math.max(0, Math.min(geom.N, Math.floor(uNow * geom.N)));
  const shownTube = Math.max(0, Math.min(shown, Math.floor((uNow - gap / Math.max(1e-6, len)) * geom.N)));
  geom.tube.setDrawRange(0, shownTube * geom.R * 6);
  geom.cur.setDrawRange(0, shown * 6);
  const head = pathPose(P, tNow, bank);
  const mats = useMemo(() => ({
    tube: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    cur: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: curtainOpacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
  }), [curtainOpacity]);

  return (
    <group userData={{ noFail: true }}>
      {shownTube > 0 && <mesh geometry={geom.tube} material={mats.tube} userData={{ noFail: true }} frustumCulled={false} />}
      {curtain && shown > 0 && <mesh geometry={geom.cur} material={mats.cur} renderOrder={2} userData={{ noFail: true }} frustumCulled={false} />}
      {trace && shown > 1 && (
        <Line points={geom.ground3.slice(0, shown + 1)} color={look.clay ? "#55585e" : "#9fb6cc"} lineWidth={2} transparent opacity={0.45} dashed dashSize={0.25} gapSize={0.15} />
      )}
      {uNow > 0 && (
        <group position={head.pos} quaternion={head.quat}>
          {markerGlow && (
            <sprite scale={[0.5, 0.5, 0.5]} userData={{ noFail: true }}>
              <spriteMaterial map={glowTexture()} color={look.label} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
          {marker}
        </group>
      )}
      {events.map((e, i) => {
        const u = paramAt(P, e.t);
        if (u > uNow + 1e-6) return null;
        const p = P.curve.getPoint(u);
        return (
          <Label3D key={i} at={[p.x, p.y, p.z]} offset={e.offset ?? [0.5, 0.7, 0]} text={e.text} sub={e.sub}
            start={t === undefined ? Math.round(frameOf(e.t)) : -100} color={e.color ?? look.label} px={labelPx} />
        );
      })}
    </group>
  );
};
