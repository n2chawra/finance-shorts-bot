// Toll: "{fact4} people were killed."
// The town centre from high above at night, the fires among the houses far below, the camera rising slowly
// ("people"); a quiet line types on: the figure and LAC-MÉGANTIC ("killed"). Stated once, plainly. No people.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, Smoke } from "../../three/index";
import { ANTON, Consist, CREAM, Flames, Line, MONO, Shot3D, Town, vehX } from "./World";
import { LAST, PILE_FIRES, pilePoses } from "./Derail";

type Params = { fig?: { dead?: string } };

const Toll: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const dead = (p.beat.params as Params).fig?.dead ?? "";
  const killed = m.at("killed", 16);
  const Tr = 20;
  const pile = vehX(7) + Tr;
  const keys = direct({}, [
    { at: 0, move: "crane", look: [pile, 0, 0], base: [pile + 10, 0, 20], from: 12, to: 15, dur: Math.max(30, m.end), fov: 42 },
  ]);
  const k = m.lerp([killed, killed + 12], [0, 1]);
  return (
    <Shot3D f={f} fog={{ color: "#07101a", near: 14, far: 60 }}
      overlay={
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", opacity: k }}>
          <div style={{ fontFamily: ANTON, fontSize: 190, lineHeight: 1, color: CREAM, textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>{dead}</div>
          <div style={{ display: "inline-block", marginTop: 14, fontFamily: MONO, fontWeight: 700, fontSize: 48, letterSpacing: 5, color: CREAM, background: "rgba(8,10,14,0.74)", padding: "6px 22px" }}>
            {"PEOPLE KILLED".slice(0, Math.max(0, Math.floor((f - killed) * 1.4)))}
          </div>
        </div>
      }>
      <Camera3D keys={keys} seed="lm-toll" drift={0.006} />
      <Focus at={[pile, 0.4, 0]} range={14} />
      <Line length={120} x={pile} />
      <Town x0={pile - 22} x1={pile + 24} k={0.55} />
      <Consist cars={LAST} travelled={Tr + 12} loco={{ lamp: 0, head: 0 }} poses={pilePoses(1, 12)} />
      {PILE_FIRES.map((at, i) => <Flames key={i} at={[pile + 6 + at[0], at[1], at[2]]} t={f + 40 + i * 7} k={0.9} n={14} size={1.0} spread={0.9} seed={`tf${i}`} />)}
      <Smoke frame={f + 60} at={[pile, 1, 0]} height={10} width={5.5} count={30} life={110} wind={[-0.6, 0, -0.2]} opacity={0.55} glow="#ff7a2a" seed="lm-toll-smoke" />
    </Shot3D>
  );
};
export default Toll;
