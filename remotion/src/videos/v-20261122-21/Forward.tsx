// Forward: "It pushes off each new ring and creeps forward. Together, the machines dug {fact2} kilometres
// under central London."
// At the tail: hydraulic jacks push against the newest ring ("pushes", close); the whole machine slides a
// step ("creeps"); the wheel turns ("forward"). Cut to central London from above at night ("Together",
// medium): glowing machine heads lead the tunnel lines under the streets ("machines"), a counter on the
// line counts up ("kilometres"); the camera rises over the lit city ("central", wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, mat, rnd, Stage3D, TECH } from "../../three/index";
import { R, Section, TAIL, k01, q } from "./Parts";
import { BACK } from "./Hook";

type Params = { fig?: { km?: string } };

/** the tunnel lines under the map: points (x, z) from west to east, a fork in the east */
const LINES: [number, number][][] = [
  [[-7, -1.2], [-3.5, -0.6], [0, 0], [3, 0.3], [5.5, -1.4], [7.5, -2.6]],
  [[3, 0.3], [5, 1.4], [7.5, 2.4]],
];

const lineAt = (pts: [number, number][], k: number): { seg: [number, number, number, number][]; head: [number, number] } => {
  const lens = pts.slice(1).map((pt, i) => Math.hypot(pt[0] - pts[i]![0], pt[1] - pts[i]![1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = total * k;
  const seg: [number, number, number, number][] = [];
  let head: [number, number] = pts[0]!;
  for (let i = 0; i < lens.length && left > 0; i++) {
    const a = pts[i]!, b = pts[i + 1]!, l = lens[i]!;
    const t = Math.min(1, left / l);
    const e: [number, number] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    seg.push([a[0], a[1], e[0], e[1]]);
    head = e;
    left -= l;
  }
  return { seg, head };
};

const Map: React.FC<{ f: number; grow: number; heads: number; lit: number }> = ({ f, grow, heads, lit }) => (
  <group>
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} material={mat("blackPlastic", "#11151e")}><planeGeometry args={[22, 14]} /></mesh>
    {/* the river */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 3.6]} material={glow("#0f2a48", 1)}><planeGeometry args={[22, 0.9]} /></mesh>
    {/* streets */}
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={`sx${i}`} rotation-x={-Math.PI / 2} position={[-10 + i * 1.55, 0.005, 0]} material={glow("#ffcf80", q(0.12 + 0.3 * lit))}><planeGeometry args={[0.04, 14]} /></mesh>
    ))}
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={`sz${i}`} rotation-x={-Math.PI / 2} position={[0, 0.005, -6.5 + i * 1.6]} material={glow("#ffcf80", q(0.12 + 0.3 * lit))}><planeGeometry args={[22, 0.04]} /></mesh>
    ))}
    {/* blocks of buildings */}
    {Array.from({ length: 70 }, (_, i) => {
      const x = -10 + 0.78 + 1.55 * Math.floor(rnd("bx", i) * 13);
      const z = -6.5 + 0.8 + 1.6 * Math.floor(rnd("bz", i) * 8);
      const h = 0.15 + 0.6 * rnd("bhh", i);
      return <Block key={i} size={[1.1, h, 1.1]} radius={0.02} preset="clay" color="#3a404d" position={[x, h / 2, z]} />;
    })}
    {LINES.map((pts, li) => {
      const { seg, head } = lineAt(pts, Math.max(0.01, Math.min(1, grow * (li ? 1.3 : 1) - (li ? 0.3 : 0))));
      return (
        <group key={li}>
          {seg.map(([x0, z0, x1, z1], i) => {
            const len = Math.hypot(x1 - x0, z1 - z0);
            return len > 0.01 ? (
              <mesh key={i} position={[(x0 + x1) / 2, 0.9, (z0 + z1) / 2]} rotation-y={-Math.atan2(z1 - z0, x1 - x0)} material={glow(TECH.cyan, 1.4)}>
                <boxGeometry args={[len, 0.07, 0.12]} />
              </mesh>
            ) : null;
          })}
          {heads > 0.02 && (
            <mesh position={[head[0], 0.9, head[1]]} material={glow(TECH.amber, q(1.6 * heads + 0.3 * Math.sin(f / 3)))}>
              <sphereGeometry args={[0.2, 16, 12]} />
            </mesh>
          )}
        </group>
      );
    })}
  </group>
);

const Forward: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const pushes = m.at("pushes", 4);
  const creeps = m.at("creeps", 20);
  const forward = m.at("forward", 32);
  const together = m.at("together", 44);
  const machines = m.at("machines", 56);
  const km = m.at("kilometres", 72);
  const central = m.at("london", 82);
  const end = Math.max(m.end, central + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const onMap = f >= together;
  const jack = k01(f, pushes, 12);
  const step = 0.3 * k01(f, creeps, 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [TAIL + 0.1, 0, 0], dir: [-0.5, 0.35, 0.8], from: 4.6, to: 4.0, dur: Math.max(8, forward), fov: 42 },
    { at: forward, move: "pullback", look: [TAIL + 0.5, 0, 0], dir: [-0.3, 0.35, 0.9], to: 5.4, dur: Math.max(8, together - forward) },
    { at: together, move: "push", look: [0, 0, 0], dir: [0, 0.82, 0.57], from: 15, to: 13.5, dur: Math.max(8, central - together) },
    { at: central, move: "pullback", look: [0, 0, 0.4], dir: [0, 0.9, 0.44], to: 18, dur: Math.max(12, end - central) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={onMap ? 12 : 8}>
        <Camera3D keys={keys} seed="v2221-forward" />
        {!onMap && (
          <group position={[step, 0, 0]}>
            <Section f={f} front={0} spin={f * 0.05 + 0.08 * Math.max(0, f - forward)} see={1} fill={1} flow={0.6} beltLit={0.6} rings={6} tubes={0.2} lamps={0.8} />
            {/* the hydraulic rams between the shield's tail and the newest ring */}
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2 + 0.5;
              const len = 0.25 + 0.3 * jack - step;
              return (
                <group key={i} position={[TAIL + 0.25 - len / 2, Math.sin(a) * R * 0.82, Math.cos(a) * R * 0.82]} rotation-z={Math.PI / 2}>
                  <mesh material={mat("brushed", "#c3c9d3")}><cylinderGeometry args={[0.06, 0.06, Math.max(0.05, len), 12]} /></mesh>
                  <mesh position={[0, len / 2 + 0.12, 0]} material={glow(TECH.amber, q(0.3 + 1.2 * m.pulse(pushes + 4, 14)))}><cylinderGeometry args={[0.1, 0.1, 0.24, 12]} /></mesh>
                </group>
              );
            })}
          </group>
        )}
        {onMap && (
          <>
            <Map f={f} grow={0.25 + 0.75 * k01(f, machines, Math.max(10, km - machines + 10))} heads={k01(f, machines, 8)} lit={k01(f, central, 12)} />
            <FigLabel3D fig={fig.km ?? ""} caption="kilometres of tunnel" at={[0, 2.2, -1.4]} start={km} count={18} px={110} color={TECH.amber} />
          </>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Forward;
