// Steel: "And right beside every tyre, on the same axle, sits a steel train wheel, just above an ordinary rail."
// One axle of the bogie, close, in the dark: only the tyre is lit (medium). "right": the camera slides
// round behind the tyre; "beside": the tyre turns see-through; "axle": the axle glows along its length;
// "sits": a dark wheel shape shows beside the tyre; "steel": it lights up amber, a flanged steel wheel
// (close); "wheel": its label writes on; "above": the camera drops to the gap between it and the rail, a
// bracket drawing the gap (extreme); "ordinary": the rail glows under it; "rail": the camera pulls back:
// steel wheels over rails all along the bogie (medium).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { AMBER, AXLES, Bogie, GapBracket, RAIL_TOP, STEEL_R, STEEL_Z, TYRE_R, Track, k01, q } from "./Parts";

const Steel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const and = m.at("and", 2);
  const right = m.at("right", 10);
  const beside = m.at("beside", 20);
  const tyreW = m.at("tyre", 30);
  const same = m.at("same", 38);
  const axle = m.at("axle", 44);
  const sits = m.at("sits", 56);
  const steel = m.at("steel", 70);
  const wheel = m.at("wheel", 84);
  const above = m.at("above", 104);
  const ordinary = m.at("ordinary", 120);
  const rail = m.at("rail", 140);
  const end = Math.max(m.end, rail + 24);
  const ax = AXLES[1]!;
  const dist = f * 0.02;
  const keys = direct({}, [
    { at: 0, move: "push", look: [ax, TYRE_R, 0.7], dir: [0.6, 0.25, 1], from: 3.4, to: 3.0, dur: Math.max(8, right), fov: 35 },
    { at: right, move: "push", look: [ax, TYRE_R, 0.55], dir: [0.9, 0.35, -0.25], from: 3.0, to: 2.6, dur: Math.max(8, steel - right) },
    { at: steel, move: "push", look: [ax, STEEL_R * 0.7, STEEL_Z], dir: [0.95, 0.3, -0.35], to: 1.7, dur: Math.max(8, above - steel) },
    { at: above, move: "push", look: [ax + 0.02, 0.0, STEEL_Z], dir: [1, 0.12, -0.25], to: 0.85, dur: Math.max(8, rail - above) },
    { at: rail, move: "pullback", look: [0, 0.3, 0.2], dir: [0.7, 0.6, 0.6], to: 4.4, dur: Math.max(10, end - rail) },
  ]);
  const see = k01(f, beside, 12);
  const lit = k01(f, steel, 10);
  const shown = f >= sits;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#14121f", bottom: "#040408", glow: "rgba(255,179,64,0.10)" }} floor={false} bloom={1.15} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v2421-steel" />
        <Track length={16} offset={-dist} railLit={k01(f, ordinary, 10)} />
        <Bogie spin={dist / TYRE_R} tyreSee={see} tyreLit={m.pulse(tyreW + 3, 8)} steelLit={lit} steelDim={shown ? 0 : 1} />
        {f >= same && <mesh position={[ax, TYRE_R, 0.89]} rotation-x={Math.PI / 2} material={glow(TECH.cyan, q(0.4 + 0.5 * m.pulse(same + 3, 8)))}><cylinderGeometry args={[0.09, 0.09, 0.03, 20]} /></mesh>}
        {/* the axle glowing along its length */}
        {f >= axle && <mesh position={[ax, TYRE_R, 0]} rotation-x={Math.PI / 2} material={glow(TECH.cyan, q(0.25 + 0.6 * m.pulse(axle + 4, 10)))}><cylinderGeometry args={[0.062, 0.062, 1.72, 14]} /></mesh>}
        <spotLight position={[ax + 1.2, 2.2, 2.0]} angle={0.45} penumbra={0.7} intensity={22 * (1 - 0.6 * k01(f, and, 8)) + 10} color="#fff1d6" />
        <pointLight position={[ax + 0.6, 0.4, STEEL_Z + 0.4]} intensity={4 * lit} color={AMBER} distance={2} />
        <GapBracket at={[ax + 0.02, 0, STEEL_Z + 0.06]} y0={RAIL_TOP} y1={TYRE_R - STEEL_R} k={k01(f, above + 4, 10) * (1 - k01(f, rail, 8))} />
        <Label3D at={[ax, STEEL_R + 0.25, STEEL_Z]} offset={[0.2, 0.55, -0.3]} text="steel wheel" start={wheel} end={above} px={56} color={TECH.amber} align="center" />
        <Label3D at={[ax - 0.5, RAIL_TOP, STEEL_Z]} offset={[-0.15, 0.4, 0.15]} text="rail" start={ordinary + 2} px={56} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Steel;
