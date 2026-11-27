// "The road only starts again at Turbo, in Colombia, about 106 kilometres away. That gap has a name: the Darién
// Gap." From Yaviza the camera pans east, the road reappears out of Turbo, a pin drops on Turbo, Colombia traces with
// its flag, a measuring line stretches from Yaviza to Turbo with the distance on its tag, the empty stretch flashes
// red, and a sign rises in the middle with DARIÉN GAP writing on it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { AMap, Board, GAP_MID, NORTH_ROAD, RED, Road, SEA_GAP, TURBO, Waves, YAVIZA, between, mix, type LL } from "./props";

type Params = { fig?: { distance?: string } };

const TURBO_ROAD: LL[] = [TURBO, [-76.68, 7.8], [-76.65, 7.5], [-76.5, 7.1]];

const Ruler: React.FC<{ k: number; text: string; flash: number }> = ({ k, text, flash }) => {
  const at = useAt();
  const a = at(YAVIZA), b = at(TURBO);
  if (!a || !b || k <= 0) return null;
  const y = Math.min(a[1], b[1]) - 150;
  const x2 = mix(a[0], b[0], k);
  return (
    <g>
      <ellipse cx={(a[0] + b[0]) / 2} cy={(a[1] + b[1]) / 2} rx={(b[0] - a[0]) / 2 + 30} ry={70} fill={RED} opacity={0.15 + 0.4 * flash} />
      <line x1={a[0]} y1={y} x2={x2} y2={y} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <line x1={a[0]} y1={y} x2={x2} y2={y} stroke="#fff4d0" strokeWidth={7} strokeLinecap="round" />
      <line x1={a[0]} y1={y - 30} x2={a[0]} y2={y + 30} stroke={INK} strokeWidth={8} />
      {k >= 1 ? <line x1={b[0]} y1={y - 30} x2={b[0]} y2={y + 30} stroke={INK} strokeWidth={8} /> : null}
      <Tag x={(a[0] + b[0]) / 2 - 150} y={y - 140} w={300} h={100} text={text} size={56} k={Math.max(0, (k - 0.6) / 0.4)} />
    </g>
  );
};

const NameSign: React.FC<{ k: number; type: number }> = ({ k, type }) => {
  const xy = useAt()(GAP_MID);
  return xy ? <Board x={xy[0]} y={xy[1] + 300} w={520} title="DARIÉN GAP" k={k} type={type} tone="#f7d27a" /> : null;
};

const Gap: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dist = (p.beat.params as Params).fig?.distance ?? "";
  const st = m.at("starts", 4), tu = m.at("turbo", 16), co = m.at("colombia", 30), aw = m.at("away", 60), ga = m.at("gap", 80), na = m.at("name", 92), da = m.at("darién", 106);
  const start = { center: [YAVIZA[0] + 0.12, YAVIZA[1] + 0.02] as LL, scale: 22000 };
  const mid = { center: [-77.2, 8.0] as LL, scale: 21000 };
  const wide = { center: [-77.2, 7.95] as LL, scale: 15500 };
  const close = { center: [-77.2, 7.75] as LL, scale: 20000 };
  const a = between(start, mid, m.lerp([st, st + 24], [0, 1]));
  const b = between(a, wide, m.lerp([ga, ga + 20], [0, 1]));
  const cam = between(b, close, m.lerp([da, da + 20], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <AMap center={cam.center} scale={cam.scale} colors={{
          Panama: { fill: "#e2bd7a", k: 1, flag: "Panama" },
          Colombia: { fill: "#e8cf86", k: m.lerp([co, co + 12], [0, 1]), trace: m.lerp([co, co + 26], [0, 1]), flag: "Colombia" },
        }}>
          <Waves pts={SEA_GAP} t={m.t} />
          <Road pts={NORTH_ROAD} w={14} />
          <Road pts={TURBO_ROAD} w={14} k={m.lerp([st, st + 20], [0, 1])} />
          <MapPin at={YAVIZA} />
          <MapPin at={TURBO} k={m.pop(tu)} />
          <MapLabel at={[YAVIZA[0] - 0.02, YAVIZA[1] + 0.12]} text="YAVIZA" size={52} />
          <MapLabel at={[TURBO[0] + 0.02, TURBO[1] - 0.1]} text="TURBO" size={52} type={m.lerp([tu, tu + 12], [0, 1])} />
          <Ruler k={m.lerp([aw - 20, aw + 6], [0, 1])} text={`${dist} KM`} flash={m.pulse(ga, 18)} />
          <NameSign k={m.pop(na)} type={m.lerp([da, da + 16], [0, 1])} />
        </AMap>
      </View>
    </Stage>
  );
};
export default Gap;
