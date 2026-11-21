// Loop: "The jet bill or the guards' bill: which surprised you? It all starts with one jet."
// Back on the desert runway at sunset: the jet invoice flutters down on the left on "jet", the guards' bill on the
// right on "or", a question mark pops between them on "which", then the papers blow away and the camera swings back to
// the hook's framing, Musk walking toward the jet, on "starts" and "one".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Invoice, Jet, Runway, SUNSET } from "./props";
import { Mark, MuskWalk } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const jet = m.at("jet", 2), or = m.at("or", 16), which = m.at("which", 30), starts = m.at("starts", m.end - 30), one = m.at("one", m.end - 14);
  const a = m.lerp([jet, jet + 16], [0, 1]);
  const b = m.lerp([or, or + 16], [0, 1]);
  const q = m.pop(which, 9);
  const blow = m.lerp([starts, starts + 16], [0, 1]);
  const zoom = m.t < starts ? m.lerp([0, starts], [1.0, 1.05]) : m.lerp([starts, one + 10], [1.05, 1.3]);
  const cx = m.t < starts ? 540 : m.lerp([starts, one + 10], [540, 480]);
  const cy = m.t < starts ? 860 : m.lerp([starts, one + 10], [860, 1060]);
  return (
    <Stage p={p} bg={SUNSET} vignette={0.35}>
      <View zoom={zoom} cx={cx + m.wave(120, 5)} cy={cy}>
        <Runway m={m} />
        <Jet x={520} y={980} s={0.85} m={m} steps={1} glow={0.5} />
        {blow > 0 ? <MuskWalk m={m} k={0.05 + blow * 0.1} /> : null}
        <g opacity={1 - blow}>
          <g transform={`translate(${-blow * 600} ${(1 - a) * -700 + Math.sin(m.t / 6) * 10}) rotate(${-8 + Math.sin(m.t / 7) * 4} 260 560)`}>
            <Invoice x={90} y={340} w={330} logo="spacex" amount="" k={0} to="JET BILL" />
          </g>
          <g transform={`translate(${blow * 600} ${(1 - b) * -700 + Math.sin(m.t / 6 + 1) * 10}) rotate(${8 + Math.sin(m.t / 8) * 4} 820 560)`}>
            <Invoice x={650} y={340} w={330} logo="tesla" amount="" k={0} to="GUARDS' BILL" />
          </g>
          <Mark x={540} y={560} k={q} r={80} color="#ffb020" />
        </g>
      </View>
    </Stage>
  );
};

export default Loop;
