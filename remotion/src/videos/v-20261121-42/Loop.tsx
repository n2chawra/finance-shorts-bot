// Loop: "It began with a train left on a hill, with no one aboard."
// Back on the hill at night, the parked train with its cab lamp and headlights on; the camera glides in
// along the line ("began", "hill") and settles on the hook's first frame, the lit empty cab and headlights
// facing us ("aboard"), so the Short plays straight back into its opening.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { Consist, Line, Shot3D, TownLights, Trees } from "./World";
import { X0 } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const aboard = m.at("hill", 50);
  // the hook's frame 0, relative to the train's front (there at X0, here at 0)
  const look: [number, number, number] = [-4.6 - X0, 0.85, 0];
  const keys = direct({}, [
    { at: 0, move: "push", look, dir: [0.95, 0.06, 0.45], from: 14, to: 7.4, dur: Math.max(20, aboard + 10), fov: 42 },
  ]);
  return (
    <Shot3D f={f}>
      <Camera3D keys={keys} seed="lm-hook" drift={0.012} />
      <Focus at={[-0.6, 0.8, 0]} range={6} />
      <Line length={120} x={-20 - X0} />
      <Trees from={-70 - X0} to={50 - X0} seed="hook-trees" clear={[-2 - X0, 12 - X0]} />
      <TownLights at={[40 - X0, 0, -14]} spread={[30, 10]} n={110} seed="hook-town" />
      <Consist cars={14} travelled={0} loco={{ lamp: 1, head: m.lerp([0, aboard], [0.4, 1]) }} />
    </Shot3D>
  );
};
export default Loop;
