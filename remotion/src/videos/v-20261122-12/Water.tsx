// Water: "Melt it, and all that water runs into the one ocean that touches every coast on Earth." On "Melt" the ice
// cap shrinks and drips; on "water" rings spread out from Antarctica; on "runs" water arrows run north into the
// Atlantic, Indian and Pacific; on "ocean" the camera pulls back; on "coast" every coastline traces blue; on "Earth"
// a sea-level line on a gauge rises.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Arrow, QMark, Stars, World, iceColor } from "./props";
import { MeltRings } from "./Hook";

const Arrows: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const pairs: [[number, number], [number, number]][] = [[[-30, -62], [-30, -10]], [[75, -62], [75, -12]], [[190, -62], [190, -10]]];
  return <g>{pairs.map(([a, b], i) => {
    const pa = at(a), pb = at(b);
    return pa && pb ? <Arrow key={i} from={pa} to={pb} k={Math.max(0, Math.min(1, k * 1.4 - i * 0.2))} /> : null;
  })}</g>;
};

const Water: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const me = m.at("melt", 2), wa = m.at("water", 16), ru = m.at("runs", 26), oc = m.at("ocean", 44), co = m.at("coast", 62), ea = m.at("earth", 80), ht = m.at("hit", 110);
  const back = m.lerp([oc, oc + 20], [0, 1]);
  const coast = m.lerp([co, co + 14], [0, 1]);
  const lvl = m.lerp([ea, ea + 20], [0, 1]);
  return (
    <Stage p={p} bg="#0b1230" vignette={0.4}>
      <Stars t={m.t} />
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <World center={[40, -45 + 30 * back]} scale={560 - 220 * back}
          colors={{ Antarctica: { fill: iceColor(0.4 + 0.6 * m.lerp([me, me + 30], [0, 1])), k: 1 } }}>
          <MeltRings k={m.lerp([wa, wa + 10], [0, 1])} t={m.t} />
          <Arrows k={m.lerp([ru, ru + 24], [0, 1])} />
          {coast > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#7fd0e6" opacity={0.12 * coast * (0.6 + 0.4 * Math.sin(m.t / 6))} /> : null}
        </World>
      </View>
      {lvl > 0 || m.t >= ea - 10 ? (
        <g transform="translate(880 520)" opacity={Math.min(1, m.lerp([ea - 10, ea], [0, 1]))}>
          <rect x={-40} y={-200} width={80} height={400} rx={14} fill="#f4e3bd" stroke={INK} strokeWidth={6} />
          <rect x={-30} y={190 - 260 * (0.3 + 0.6 * lvl)} width={60} height={260 * (0.3 + 0.6 * lvl)} fill="#3f7f96" />
          <Txt x={0} y={-250} size={44} fill="#ffffff" stroke={INK}>SEA</Txt>
        </g>
      ) : null}
      <QMark x={540} y={900} k={m.pop(ht, 10)} t={m.t} size={220} />
    </Stage>
  );
};
export default Water;
