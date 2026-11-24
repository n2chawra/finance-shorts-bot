// "Rain or ships: which does Panama need more? Tell me. Because without rain," A rain cloud pops on the left and a
// container ship on the right over Panama, a comment bubble between them; then the camera pulls back to the hook's
// first framing, Panama's flag returning, the rain cloud thinning over the lake.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Stage, Txt, View, motion } from "../../flat/kit";
import { HookMap } from "./Hook";
import { Cloud, Ship } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ra = m.at("rain", 2), sh = m.at("ships", 12), pa = m.at("panama", 30), te = m.at("tell", 46), be = m.at("because", 60), wi = m.at("without", 72);
  const back = m.lerp([be - 4, m.end - 4], [0, 1]);
  const pick = 1 - m.lerp([be, be + 12], [0, 1]);
  const glow = m.pulse(pa + 6, 14);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + m.wave(90, 0.01)}>
        <HookMap t={m.t} k={1 - back} trace={1} glow={0} ship={0.25} stop={0} rain={1 - 0.3 * m.lerp([wi, m.end], [0, 1])} flag={back} />
        {pick > 0 ? (
          <g opacity={pick}>
            {m.t >= ra ? <Cloud x={290} y={560 - 30 * glow} s={150 * Math.min(1, m.pop(ra, 12))} rain={0.8} t={m.t} dark /> : null}
            {m.t >= sh ? <Ship x={790} y={600 - 30 * glow} s={150 * Math.min(1, m.pop(sh, 12))} rot={0} /> : null}
            {m.t >= te ? (
              <g transform={`translate(540,330) scale(${Math.min(1, m.pop(te, 12))})`}>
                <Ball x={0} y={0} r={110} ry={80} fill="#ffffff" />
                <Txt x={0} y={16} size={48} fill="#1d1a2b">YOU?</Txt>
              </g>
            ) : null}
          </g>
        ) : null}
      </View>
    </Stage>
  );
};

export default Loop;
