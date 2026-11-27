// "They're just 3.8 kilometres apart, and the sea around them is only 90 metres at its deepest. So why not a road?"
// Close on the channel between the islands: a ruler stretches between them with the distance on its tag; the water
// clears to show the sea floor close below, a depth line drops to a buoy carrying the depth; a question mark pops
// over the channel and a dotted road arcs from island to island.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BIG, BMap, Diomedes, ISLES, LITTLE, Planted, QMark, SEA_STRAIT, Waves, between, type LL , Floes } from "./props";
import { Ruler } from "./Near";

type Params = { fig?: { gap?: string; depth?: string } };

const Depth: React.FC<{ k: number; floor: number; text: string }> = ({ k, floor, text }) => {
  const xy = useAt()([-168.985, 65.745]);
  if (!xy) return null;
  const x = xy[0], y = xy[1] + 40;
  return (
    <g>
      {floor > 0 ? <path d={`M${x - 160},${y + 262} q40,-22 80,0 t80,0 t80,0 t80,0`} fill="none" stroke="#7a6a4a" strokeWidth={10} opacity={floor} strokeLinecap="round" /> : null}
      {k > 0 ? (
        <g>
          <line x1={x} y1={y} x2={x} y2={y + 250 * Math.min(1, k)} stroke={INK} strokeWidth={8} strokeDasharray="16 10" />
          <Limb a={[x - 26, y]} b={[x + 26, y]} w={16} color="#e8453c" sw={3} />
          <circle cx={x} cy={y - 22} r={24} fill="#e8453c" stroke={INK} strokeWidth={4} />
          <Tag x={x + 40} y={y + 60} w={300} h={100} text={text} size={56} k={Math.max(0, (k - 0.5) / 0.5)} />
        </g>
      ) : null}
    </g>
  );
};

const Dotted: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([BIG[0] + 0.045, BIG[1]]), b = at([LITTLE[0] - 0.025, LITTLE[1]]);
  if (!a || !b || k <= 0) return null;
  const d = `M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2},${Math.min(a[1], b[1]) - 120} ${b[0]},${b[1]}`;
  return (
    <g>
      <defs><mask id="apart-arc"><path d={d} fill="none" stroke="#fff" strokeWidth={18} pathLength={1} strokeDasharray={`${k} 1`} /></mask></defs>
      <path d={d} fill="none" stroke="#fff4d0" strokeWidth={10} strokeDasharray="20 14" strokeLinecap="round" mask="url(#apart-arc)" />
    </g>
  );
};

const QOver: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-168.985, 65.77]);
  return xy ? <QMark x={xy[0]} y={xy[1] - 470} size={130} k={k} t={t} /> : null;
};

const Apart: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const ju = m.at("just", 2), ap = m.at("apart", 30), se = m.at("sea", 44), ar = m.at("around", 54), de = m.at("deepest", 90), wh = m.at("why", 110), ro = m.at("road", 124), on = m.at("only", 62), me = m.at("metres", 80), km = m.at("kilometres", 22);
  const close = { center: [-169.0, 65.775] as LL, scale: 100000 };
  const med = { center: [-169.0, 65.765] as LL, scale: 85000 };
  const a = between(ISLES, close, m.lerp([0, ju + 20], [0, 1]));
  const cam = between(a, med, m.lerp([se, se + 24], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <BMap center={cam.center} scale={cam.scale}>
          <Floes t={m.t} size={60} />
          <Waves pts={[...SEA_STRAIT, [-169.2, 65.73], [-168.85, 65.72], [-169.15, 65.83], [-168.88, 65.82]]} t={m.t} />
          <Depth k={Math.max(m.pop(on) * 0.05, m.lerp([ar, me], [0, 1]))} floor={m.lerp([se, se + 16], [0, 1])} text={`${f.depth ?? ""} M`} />
          <Diomedes t={m.t} />
          <MapLabel at={[BIG[0] - 0.08, BIG[1] - 0.075]} text="BIG DIOMEDE" size={50} />
          <MapLabel at={[LITTLE[0] + 0.06, LITTLE[1] - 0.06]} text="LITTLE DIOMEDE" size={50} />
          <Planted at={[BIG[0] - 0.02, BIG[1]]} name="Russia" k={1} s={110} dx={-70} />
          <Planted at={[LITTLE[0], LITTLE[1]]} name="United States of America" k={1} s={110} dx={10} />
          <Ruler a={[BIG[0] + 0.045, BIG[1]]} b={[LITTLE[0] - 0.025, LITTLE[1]]} k={m.lerp([ju, ap], [0, 1])} text={`${f.gap ?? ""} KM`} dy={-200 - 8 * m.pulse(km, 8)} />
          <Dotted k={m.lerp([ro, ro + 16], [0, 1])} />
          <QOver k={m.pop(wh)} t={m.t} />
        </BMap>
      </View>
    </Stage>
  );
};
export default Apart;
