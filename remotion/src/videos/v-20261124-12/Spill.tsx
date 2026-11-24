// "And where does the water go? Every ship that crosses lets a huge gulp of the lake's fresh water run out into the
// sea." Ships pass the locks one after another; with each, a gush of blue pours out of the lock into the sea at
// both ends and the lake's edge pulls back a little.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Canal, CanalShip, GATUN_LOCKS, Lake, PACIFIC_LOCKS, PMap } from "./props";

const Gush: React.FC<{ at: [number, number]; k: number; dir: [number, number] }> = ({ at: ll, k, dir }) => {
  const xy = useAt()(ll);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 3) * (1 - Math.max(0, k - 0.8) * 5)}>
      {[0, 1, 2, 3].map((i) => {
        const d = 30 + k * 220 - i * 40;
        if (d < 0) return null;
        return <ellipse key={i} cx={xy[0] + dir[0] * d} cy={xy[1] + dir[1] * d} rx={40 + i * 8} ry={24 + i * 6} fill="#6fb6ff" stroke="#1d1a2b" strokeWidth={3} opacity={0.9 - i * 0.15} />;
      })}
    </g>
  );
};

const Spill: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wa = m.at("water", 10), ev = m.at("every", 30), cr = m.at("crosses", 40), hu = m.at("huge", 56), gu = m.at("gulp", 62), fr = m.at("fresh", 72), ru = m.at("run", 90), se = m.at("sea", 100);
  const close = m.lerp([gu - 4, gu + 12], [0, 1]) - m.lerp([se - 4, se + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.1 * close + m.wave(80, 0.008)}>
        <PMap trees={1} center={m.t < ru ? [GATUN_LOCKS[0] + 0.01, GATUN_LOCKS[1] - 0.01] : [PACIFIC_LOCKS[0] + 0.02, PACIFIC_LOCKS[1] - 0.03]} scale={100000}>
          <Lake k={1 - 0.08 * m.lerp([fr, fr + 20], [0, 1])} glow={0.5 * Math.abs(m.wave(10, 1)) * m.lerp([wa, wa + 6], [0, 1]) * (1 - m.lerp([ev, ev + 6], [0, 1]))} />
          <Canal w={24} />
          <CanalShip f={m.lerp([ev, cr + 20], [0.05, 0.14])} s={70} lift={m.lerp([cr, hu], [0, 1])} />
          <CanalShip f={m.lerp([ru, se + 20], [0.72, 0.8])} s={70} color="#3a7ad0" lift={1 - m.lerp([ru, se], [0, 1])} />
          <Gush at={GATUN_LOCKS} k={m.lerp([hu, gu + 40], [0, 1])} dir={[0, -1.6]} />
          <Gush at={PACIFIC_LOCKS} k={m.lerp([ru, se + 30], [0, 1])} dir={[0.9, 1.3]} />
        </PMap>
      </View>
    </Stage>
  );
};

export default Spill;
