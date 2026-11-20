// Estimate: "Engineers once estimated that at one low level, it could still make {fact3} megawatts."
// The control room. A report folder lands on the desk ("Engineers", wide), the Bureau of Reclamation label writes on ("once");
// the big output dial on the wall lights ("estimated"); a wall screen shows the lake ("low", medium) and
// its water drops to the red mark ("level"); the needle swings ("dam"); it settles and the figure counts
// up on the dial ("still", close); the dial's ring glows ("megawatts").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, Label3D, Stage3D, TECH } from "../../three/index";
import { ControlRoom, Dial, Folder, LakeScreen, k01 } from "./Parts";

type Params = { fig?: { old?: string } };
export const DIAL_AT: [number, number, number] = [0, 2.3, -0.85];
export const OLD_NEEDLE = 0.62;

const Estimate: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const bureau = m.at("engineers", 2);
  const recl = m.at("once", 8);
  const that = m.at("that", 36);
  const est = m.at("estimated", 30);
  const one = m.at("one", 44);
  const low = m.at("low", 50);
  const level = m.at("level", 58);
  const dam = m.at("could", 70) - 8;
  const could = m.at("could", 74);
  const still = m.at("still", 80);
  const mid = m.at("mid", 96);
  const mw = m.at("megawatts", 112);
  const end = Math.max(m.end, mw + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const drop = 0.4 * (1 - k01(f, bureau, 8));
  const needle = OLD_NEEDLE * (0.25 * k01(f, dam, 6) + 0.75 * k01(f, could, 10)) + 0.03 * m.pulse(mid + 2, 8) + 0.06 * Math.sin((f - dam) / 3) * (1 - k01(f, still, 10)) * k01(f, dam, 4);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 2.0, 0], dir: [0, 0.18, 1], from: 10.5, to: 9.5, dur: Math.max(8, low), fov: 40 },
    { at: low, move: "push", look: [1.2, 2.8, -1], dir: [0.15, 0.08, 1], to: 7, dur: Math.max(8, still - low) },
    { at: still, move: "push", look: [0, 3.0, -1], dir: [0, 0.06, 1], to: 5.6, dur: Math.max(10, end - still) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0d1626", bottom: "#04060b", glow: "rgba(56,225,255,0.08)" }} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={6}>
        <Camera3D keys={keys} seed="v2001-estimate" />
        <ControlRoom f={f} />
        <Dial position={DIAL_AT} needle={needle} lit={k01(f, est, 6) > 0.5 ? 1 : 0} ring={k01(f, mw, 8)} scale={1.05} />
        <LakeScreen position={[2.75, 2.75, -1.0]} level={1 - 0.62 * k01(f, level, 16)} mark={0.38} o={k01(f, one, 6)} />
        <Folder position={[-1.1, 1.03 + drop, 1.5]} rotation-y={0.2} open={k01(f, that, 10)} />
        <Label3D at={[-1.1, 1.1, 1.5]} offset={[-0.2, 1.2, 0]} text="Bureau of Reclamation" sub="estimate" start={recl + 2} end={low} px={50} color={TECH.white} align="center" />
        <Block size={[2.4, 0.95, 0.12]} radius={0.04} preset="blackPlastic" position={[0, 3.95, -0.85]} />
        <FigLabel3D fig={fig.old ?? ""} caption="megawatts" at={[0, 3.95, -0.7]} start={still} count={22} px={120} />
      </Stage3D>
    </Freeze>
  );
};
export default Estimate;
