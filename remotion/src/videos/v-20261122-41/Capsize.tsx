// Capsize: "Then the riverboat rolled over. Slowly. It took {fact4} minutes."
// Off the riverboat's bow from the river: it begins to lean away from the wharf ("riverboat"); the decks tilt
// further ("rolled"); the decks tilt toward the water and the lights go out row by row ("over"); a
// second clock counts up beside the gauge ("slowly", "took"); the figure lands on the clock as the hull lies
// on its side, wide ("minutes"). Time compressed, and said so on screen. No people drawn.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { countText, motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { BOAT_X, BOAT_Z, Clock, PHI_HIT, River, Riverboat, Shot3D, Tag, TankerAt, turnPose } from "./World";

type Params = { fig?: { capsize?: string } };

const Capsize: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const rolled = m.at("rolled", 14), slowly = m.at("slowly", 40), minutes = m.at("minutes", 80);
  const k = m.lerp([4, minutes + 10], [0, 1], (x) => x * x * (3 - 2 * x));
  const roll = -1.45 * k, sink = 0.35 * k;
  const T = turnPose(PHI_HIT + 0.004);
  const look: [number, number, number] = [BOAT_X, 0.5, BOAT_Z];
  const keys = direct({}, [
    { at: 0, move: "push", look, dir: [0.82, 0.3, -0.48], from: 11, to: 9.8, dur: Math.max(10, slowly) },
    { at: slowly, move: "push", look: [BOAT_X + 0.5, 0.4, BOAT_Z], dir: [0.86, 0.22, -0.46], to: 8, dur: Math.max(10, minutes - slowly) },
    { at: minutes, move: "pullback", look, dir: [0.7, 0.45, -0.55], to: 12.5, dur: Math.max(10, m.end - minutes) },
  ]);
  const ck = m.lerp([slowly, minutes], [0.04, 1]);
  return (
    <Shot3D f={f}
      overlay={
        <>
          {f >= slowly ? <Clock value={`${countText(fig.capsize ?? "", ck)} MIN`} caption={f >= minutes ? "TO CAPSIZE" : "ELAPSED"} top={360} k={m.lerp([slowly, slowly + 8], [0, 1])} color={f >= minutes ? "#ff3b30" : "#f4efe7"} /> : null}
          <Tag t={f} at={0} top={1250} text="TIME COMPRESSED" color="#f4efe7" size={44} />
        </>
      }>
      <Camera3D keys={keys} seed="ms-capsize" drift={0.012} />
      <Focus at={look} range={7} />
      <River f={f} boat={<group position={[0, 0, 0.12]}><Riverboat roll={roll} sink={sink} dent={1} lights={Math.max(0, 1 - k * 1.3)} /></group>} />
      <TankerAt f={f} pos={T.pos} yaw={T.yaw} rudder={0.6} stress={0.6} bowStress={0.6} />
    </Shot3D>
  );
};
export default Capsize;
