// Derail: "{fact3} tank cars of crude oil left the rails in the town centre."
// Medium by the curve in the town centre as the runaway's tank cars stream in, the count labelled on the
// cars ("tank"); CRUDE OIL types on a tank ("crude"); the sub-boom: the cars jackknife off the rails, close
// ("rails"); wide from above: the pile glows orange among the houses ("centre"). No people.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, direct, Focus, Label3D, Smoke, type V3 } from "../../three/index";
import { AMBER, Consist, Flames, Line, type Pose, Shot3D, Town, vehX } from "./World";
import { V } from "./Hook";

type Params = { fig?: { cars?: string } };
export const FIRST = 2, LAST = 13;

/** The derailment: from FIRST on, each car swings off the line in a zigzag and stops in a pile,
 * `d` 0..1 per car from `k` (0..1 overall), `slide` how far the train had run since the rails gave way. */
export function pilePoses(k: number, slide: number): Record<number, Pose> {
  const out: Record<number, Pose> = {};
  for (let i = FIRST; i <= LAST; i++) {
    const d = Math.max(0, Math.min(1, k * 1.6 - (i - FIRST) * 0.06));
    const s = i % 2 === 0 ? 1 : -1;
    out[i] = {
      dx: -slide * d + (i - FIRST) * 1.9 * d,
      dz: s * (0.4 + 0.5 * ((i * 7) % 3) / 2) * d,
      yaw: s * (0.5 + 0.35 * ((i * 5) % 3) / 2) * d,
      roll: (i % 3 === 0 ? s * 1.4 : s * 0.3) * d,
      dy: 0.25 * Math.sin(d * Math.PI) + (i % 3 === 0 ? 0.15 * d : 0),
    };
  }
  return out;
}
export const PILE_FIRES: V3[] = [[-1.5, 0.4, 0.4], [-4.5, 0.4, -0.5], [-7.5, 0.4, 0.6], [-10.5, 0.4, -0.3], [-13, 0.4, 0.3]];

const Derail: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const tank = m.at("tank", 6), crude = m.at("crude", 22), rails = m.at("derailed", 40), centre = m.at("centre", 62);
  const T = (fr: number) => 6 + V * fr;
  const Tr = T(rails);
  const travelled = T(f);
  const k = cue(f, rails, 30, (x) => 1 - (1 - x) * (1 - x));
  const poses = pilePoses(k, travelled - Tr);
  const pile = vehX(7) + Tr;
  const burn = cue(f, rails + 8, 24, (x) => x);
  const keys = f >= centre
    ? direct({}, [
        { at: 0, move: "hold", pos: [pile + 14, 9, 15], look: [pile, 0.4, 0], fov: 44 },
        { at: centre, move: "cut", pos: [pile + 14, 9, 15], look: [pile, 0.4, 0], fov: 44 },
        { at: centre + 1, move: "pullback", look: [pile, 0.4, 0], dir: [0.55, 0.5, 0.67], from: 22, to: 24, dur: Math.max(10, m.end - centre) },
      ])
    : f >= rails
      ? direct({}, [
          { at: 0, move: "hold", pos: [pile + 4, 1.4, 4.2], look: [pile - 1, 0.7, 0], fov: 46 },
          { at: rails, move: "cut", pos: [pile + 4, 1.4, 4.2], look: [pile - 1, 0.7, 0], fov: 46 },
          { at: rails + 1, move: "pullback", look: [pile - 1, 0.7, 0], dir: [0.55, 0.2, 0.81], from: 5.8, to: 7.4, dur: Math.max(10, centre - rails) },
        ])
      : direct({}, [
          { at: 0, move: "hold", pos: [pile + 6, 2.6, 5.2], look: [pile - 4, 0.6, 0], fov: 44 },
          { at: tank, move: "push", look: [pile - 3, 0.8, 0], dir: [0.7, 0.18, 0.69], from: 11.4, to: 9.6, dur: Math.max(10, rails - tank) },
        ]);
  return (
    <Shot3D f={f}>
      <Camera3D keys={keys} seed="lm-derail" drift={0.012} />
      <Focus at={[pile, 0.7, 0]} range={f >= centre ? 12 : 5} />
      <Line length={120} x={pile} />
      <Town x0={pile - 22} x1={pile + 24} k={1} gap={[pile - 6, pile + 30]} />
      <Consist cars={LAST} travelled={travelled} loco={{ lamp: 0, head: 0 }} poses={poses} />
      {f >= rails ? (
        <>
          <Debris at={[pile, 0.4, 0]} count={50} spread={4} dir={[0, 1, 0]} speed={1.8} size={0.07} start={0.02} seconds={2} slow={0.5} gravity={3} floor={0} kind="metal" seed="lm-pile" progress={cue(f, rails, 50, (x) => x)} />
          {PILE_FIRES.map((at, i) => <Flames key={i} at={[pile + 6 + at[0], at[1], at[2]]} t={f + i * 7} k={burn * (0.7 + 0.1 * i)} n={14} size={0.9} spread={0.9} seed={`pf${i}`} />)}
          <Smoke frame={f - rails} at={[pile, 1, 0]} height={9} width={5} count={30} life={110} wind={[-0.6, 0, -0.2]} opacity={0.6 * burn} glow="#ff7a2a" seed="lm-pile-smoke" />
        </>
      ) : null}
      <Label3D at={[vehX(5) + travelled, 1.2, 0]} offset={[0.4, 1.4, 0.8]} text={`${fig.cars ?? ""} TANK CARS`} start={tank} end={rails} px={56} color={AMBER} />
      <Label3D at={[vehX(3) + travelled, 1.1, 0.35]} offset={[-0.6, 0.9, 0.9]} text="CRUDE OIL" start={crude} end={rails} px={50} color={AMBER} />
    </Shot3D>
  );
};
export default Derail;
