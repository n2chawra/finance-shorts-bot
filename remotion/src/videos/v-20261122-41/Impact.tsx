// Impact (no words): silence, time slowed. The tanker's bow fills the frame, a few metres from the riverboat's
// white side ("near"); the sub-boom: the bow strikes, the plating on both glows to red, sparks and torn metal fly
// ("hit"); wide: the riverboat shoved against the wharf, the tanker's bow in its side ("wide"). No people.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, direct, Focus } from "../../three/index";
import { PHI_HIT, River, Riverboat, Shot3D, TankerAt, turnPose } from "./World";

const Impact: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const hit = m.at("hit", 30), wide = m.at("wide", 51);
  const phi = f < hit ? PHI_HIT - 0.035 * (1 - f / hit) : PHI_HIT + 0.004 * Math.min(1, (f - hit) / 20);
  const T = turnPose(phi);
  const H = turnPose(PHI_HIT).bow;
  const k = cue(f, hit, 14, (x) => 1 - (1 - x) * (1 - x));
  const shove = 0.12 * k;
  const keys = f >= wide
    ? direct({}, [
        { at: 0, move: "hold", pos: [H[0] - 7, 3.2, H[2] - 7], look: [H[0], 0.4, H[2]], fov: 44 },
        { at: wide, move: "cut", pos: [H[0] - 7, 3.2, H[2] - 7], look: [H[0], 0.4, H[2]], fov: 44 },
        { at: wide + 1, move: "pullback", look: [H[0], 0.4, H[2]], dir: [-0.6, 0.35, -0.72], from: 10, to: 11.5, dur: Math.max(10, m.end - wide) },
      ])
    : direct({}, [
        { at: 0, move: "push", look: [H[0] - 0.3, 0.4, H[2] - 0.2], dir: [0.55, 0.3, -0.78], from: 4.4, to: 3.4, dur: Math.max(10, wide) },
      ]);
  const shake = f >= hit && f < hit + 10 ? 0.03 * Math.sin(f * 9) * (1 - (f - hit) / 10) : 0;
  return (
    <Shot3D f={f}>
      <Camera3D keys={keys} seed="ms-impact" drift={0.004 + Math.abs(shake)} />
      <Focus at={[H[0], 0.35, H[2]]} range={f >= wide ? 8 : 3} />
      <River f={f} boat={<group position={[0, 0, shove]}><Riverboat dent={k} roll={-0.03 * k} /></group>} />
      <TankerAt f={f} pos={T.pos} yaw={T.yaw} rudder={0.6} stress={0.7} bowStress={0.4 + 0.6 * k} />
      {f >= hit ? (
        <Debris at={[H[0], 0.35, H[2] - 0.05]} count={46} spread={0.25} dir={[-0.2, 0.7, -0.6]} speed={2.0} size={0.05} start={0} seconds={2} slow={0.45} gravity={4} floor={0} kind="metal" seed="ms-hit" progress={cue(f, hit, 50, (x) => x)} />
      ) : null}
      <pointLight position={[H[0] - 0.4, 0.8, H[2] - 0.8]} intensity={f >= hit ? 3.2 * (1 - 0.6 * k) + 0.6 : 0.6} distance={3} color="#ffb060" />
      <pointLight position={[H[0] + 1.5, 2.2, H[2] - 2.5]} intensity={2.2} distance={8} color="#cfe0ff" />
    </Shot3D>
  );
};
export default Impact;
