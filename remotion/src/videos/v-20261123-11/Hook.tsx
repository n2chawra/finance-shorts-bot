// Hook: "Russia once ended at the Ural Mountains. So how did it reach the Pacific?" The old map of the Urals:
// a small red Russia west of the ridge from frame 0, a boat waiting at the ridge; on "how" it pushes off east
// and on "reach" the camera pulls back across empty Siberia to the Pacific, where a question mark drops.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { Asia, Boat, OKHOTSK, QMark, RACE, RedLand, Ridge, tipOf } from "./props";

/** The hook's map, shared with the loop's last frames. */
export const HookMap: React.FC<{ t: number; center: [number, number]; scale: number; east: number; ridge: number; shake?: number; label?: number; boat: number; pac?: number; q?: number; front?: number; names?: number }> = ({
  t, center, scale, east, ridge, shake = 0, label = 1, boat, pac = 0, q = 0, front = 1, names = 1,
}) => (
  <Asia center={center} scale={scale}>
    <RedLand east={east} id="v1123h" front={front} />
    <Ridge k={ridge} s={1.3} shake={shake} />
    <MapLabel at={[44, 56.5]} text="RUSSIA" size={64} k={names} />
    <MapLabel at={[52.5, 63.6]} text="URAL MOUNTAINS" size={52} type={label} k={names} />
    {names > 0 ? <Boats t={t} k={boat} /> : null}
    <Pac k={pac} q={q} t={t} />
  </Asia>
);

const Boats: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const at = useAt();
  const tip = tipOf(at, RACE, k);
  if (!tip) return null;
  return <Boat x={tip[0]} y={tip[1] - 10 + Math.sin(t / 8) * 4} s={95} rot={tip[2]} crew={3} oar={t / 5} leader />;
};

const Pac: React.FC<{ k: number; q: number; t: number }> = ({ k, q, t }) => {
  const at = useAt();
  const xy = at(OKHOTSK), lab = at([132, 54]);
  if (!xy || !lab || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      <Glow x={xy[0] + 40} y={xy[1]} r={220} color="#9fe3ff" o={0.7 * k} />
      <MapLabel at={[133, 53.5]} text="PACIFIC" size={56} k={k} />
      <QMark x={xy[0] - 90} y={xy[1] - 170} k={q} t={t} size={230} />
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ru = m.at("russia", 2), en = m.at("ended", 14), ur = m.at("ural", 24), mo = m.at("mountains", 30), how = m.at("how", 44), re = m.at("reach", 56), pa = m.at("pacific", 66);
  const back = m.lerp([re - 4, pa + 6], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01) + 0.03 * m.pulse(en, 8)}>
        <HookMap t={m.t}
          center={[52 + 53 * back, 58 + 2 * back]} scale={1400 - 840 * back}
          east={58}
          front={0.6 + 0.4 * m.pulse(en, 10) + 0.3 * m.lerp([ru, ru + 12], [0, 1])}
          ridge={0.75 + 0.25 * m.pop(ur, 10)} shake={m.pulse(ur + 4, 6)}
          label={m.lerp([mo - 2, mo + 14], [0, 1])}
          boat={m.lerp([how, m.end], [0, 0.32])}
          pac={m.lerp([re + 6, pa], [0, 1])} q={m.pop(pa, 10)} />
      </View>
    </Stage>
  );
};

export default Hook;
