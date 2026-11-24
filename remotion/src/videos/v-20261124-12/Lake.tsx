// "Why would a canal need rain? It isn't a flat ditch from sea to sea. Ships climb up into a lake in the middle of
// Panama, Gatun Lake, then step back down to the other ocean." A flat ditch is drawn across and crossed out; a ship
// rises up the lock steps at the Caribbean end, sails over the lake and steps down to the Pacific.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BALBOA, COLON, Canal, CanalShip, GATUN_LOCKS, LAKE_C, Lake, PACIFIC_LOCKS, PMap } from "./props";

const Steps: React.FC<{ at: [number, number]; k: number; flip?: boolean }> = ({ at: ll, k, flip }) => {
  const xy = useAt()(ll);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      {[0, 1, 2].map((i) => <rect key={i} x={xy[0] + (flip ? -1 : 1) * i * 26 - 40} y={xy[1] - 20 - i * 22} width={80} height={18} fill="#f2b134" stroke={INK} strokeWidth={3} />)}
    </g>
  );
};

const Ditch: React.FC<{ k: number; x: number }> = ({ k, x }) => {
  const at = useAt();
  const a = at(COLON), b = at(BALBOA);
  if (!a || !b || k <= 0) return null;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * Math.min(1, k)} y2={a[1] + (b[1] - a[1]) * Math.min(1, k)} stroke="#d9c08a" strokeWidth={30} strokeDasharray="20 14" opacity={0.9} />
      {x > 0 ? <g opacity={Math.min(1, x)}>
        <line x1={(a[0] + b[0]) / 2 - 90} y1={(a[1] + b[1]) / 2 - 90} x2={(a[0] + b[0]) / 2 + 90} y2={(a[1] + b[1]) / 2 + 90} stroke="#e0352b" strokeWidth={22} strokeLinecap="round" />
        <line x1={(a[0] + b[0]) / 2 + 90} y1={(a[1] + b[1]) / 2 - 90} x2={(a[0] + b[0]) / 2 - 90} y2={(a[1] + b[1]) / 2 + 90} stroke="#e0352b" strokeWidth={22} strokeLinecap="round" />
      </g> : null}
    </g>
  );
};

const Ends: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([-79.95, 9.45]), b = at([-79.5, 8.85]);
  return <g>{a ? <Glow x={a[0]} y={a[1]} r={160} color="#9fe3ff" o={0.7 * k} /> : null}{b ? <Glow x={b[0]} y={b[1]} r={160} color="#9fe3ff" o={0.7 * k} /> : null}</g>;
};

const LakeBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ra = m.at("rain", 8), di = m.at("ditch", 40), se = m.at("sea", 52), cl = m.at("climb", 70), la = m.at("lake", 84), mi = m.at("middle", 94), ga = m.at("gatun", 112), st = m.at("step", 126), oc = m.at("ocean", 150);
  const ride = m.lerp([cl, la], [0.08, 0.25]) + m.lerp([mi, st], [0, 0.4]) + m.lerp([st, oc], [0, 0.33]);
  const lift = m.lerp([cl, la], [0, 1]) - m.lerp([st, oc], [0, 1]);
  const close = m.lerp([ga - 4, ga + 12], [0, 1]) - m.lerp([oc - 4, oc + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.12 * close + m.wave(80, 0.008)}>
        <PMap trees={1} center={[-79.74, 9.14]} scale={52000}>
          <Lake k={1} glow={m.pulse(ra + 6, 12) + m.pulse(la + 6, 14)} />
          <Canal w={24} />
          <Ditch k={m.lerp([0, di + 8], [0, 1])} x={m.lerp([di + 10, di + 18], [0, 1]) * (1 - m.lerp([cl - 4, cl + 4], [0, 1]))} />
          <Ends k={m.pulse(se + 6, 14)} />
          <Steps at={GATUN_LOCKS} k={m.lerp([cl - 4, cl + 8], [0, 1])} />
          <Steps at={PACIFIC_LOCKS} k={m.lerp([st - 4, st + 8], [0, 1])} flip />
          <CanalShip f={ride} s={78} lift={Math.max(0, lift)} />
          <MapLabel at={[LAKE_C[0] - 0.02, LAKE_C[1] + 0.16]} text="GATUN LAKE" size={52} k={m.pop(ga, 12)} />
          <MapLabel at={[-79.5, 8.8]} text="PACIFIC" size={52} k={m.pop(oc, 12)} />
        </PMap>
      </View>
    </Stage>
  );
};

export default LakeBeat;
