// "Until the only way left is the long way round: all the way down South America, round stormy Cape Horn, and back
// up the other side." The camera pulls back from Panama until South America fills the map; a ship sets off and the
// route draws down the Atlantic coast, through storm clouds round Cape Horn and back up the Pacific side.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { CAPE_HORN, Canal, CanalShip, Cloud, DETOUR, Lake, PMap, Ship, along } from "./props";

const Route: React.FC<{ k: number; t: number; storm: number }> = ({ k, t, storm }) => {
  const at = useAt();
  const xy = DETOUR.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const ch = at(CAPE_HORN);
  const n = Math.max(2, Math.round(xy.length * 8 * Math.min(1, k)));
  const pts: [number, number][] = [];
  for (let i = 0; i < xy.length - 1; i++) for (let s = 0; s < 8; s++) {
    const a = xy[i]!, b = xy[i + 1]!;
    pts.push([a[0] + ((b[0] - a[0]) * s) / 8, a[1] + ((b[1] - a[1]) * s) / 8]);
  }
  const shown = pts.slice(0, n);
  const d = shown.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const tip = along(xy, Math.min(1, k));
  return (
    <g>
      {ch && storm > 0 ? [[-70, 0], [60, -40], [0, 50]].map(([dx, dy], i) => <Cloud key={i} x={ch[0] + dx!} y={ch[1] + dy! - 40} s={70} rain={0.8} t={t + i * 9} k={storm} dark />) : null}
      {k > 0 ? <path d={d} fill="none" stroke="#1d1a2b" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {k > 0 ? <path d={d} fill="none" stroke="#ffffff" strokeWidth={9} strokeDasharray="20 14" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {tip && k > 0 ? <Ship x={tip[0]} y={tip[1]} s={44} rot={tip[2]} /> : null}
    </g>
  );
};

const Calendar: React.FC<{ k: number; flip: number }> = ({ k, flip }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(800,340) scale(${q})`}>
      {[2, 1, 0].map((i) => <Block key={i} x={-120 + i * 10} y={-100 + i * 10} w={240} h={220} fill="#f4f4f0" r={12} />)}
      <Block x={-120} y={-100} w={240} h={60} fill="#d23b30" r={12} />
      <Txt x={0} y={-56} size={46} fill="#ffffff">WEEKS</Txt>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-96 + (i % 4) * 50} y={-20 + Math.floor(i / 4) * 40} width={36} height={28} rx={4} fill={i < flip * 12 ? "#d23b30" : "#dcdcd4"} />)}
    </g>
  );
};

const Hours: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()([-79.7, 9.1]);
  return xy && k > 0 ? <Glow x={xy[0]} y={xy[1]} r={150} color="#ffe08a" o={0.9 * k} /> : null;
};

const Detour: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ha = m.at("half", 210), we = m.at("weeks", 140), hr = m.at("straight", 160), wa = m.at("way", 4), lo = m.at("long", 18), ro = m.at("round", 28), so = m.at("south", 40), am = m.at("america", 48), stv = m.at("stormy", 64), ca = m.at("cape", 72), ho = m.at("horn", 80), ba = m.at("back", 96), si = m.at("side", 120);
  const back = m.lerp([wa, lo + 10], [0, 1]);
  const k = m.lerp([ro, ca + 6], [0, 0.56]) + m.lerp([ba, si + 10], [0, 0.44]);
  const close = m.lerp([ho - 6, ho + 8], [0, 1]) - m.lerp([ba - 2, ba + 12], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.12 * close + m.wave(80, 0.008)} cy={960 + 380 * close}>
        <PMap z={1} trees={Math.max(0, 1 - back * 4)} brown={1} center={[-79.7 + 19.7 * back, 9.1 - 31.1 * back]} scale={45000 - 43500 * back} colors={{ Panama: { fill: "#d9b77a" } }}>
          <Lake k={0.45} mud={1} color="#4f8fc9" />
          <Canal w={20} dry={1} />
          {back < 0.5 ? <CanalShip f={0.2} s={70} /> : null}
          <Hours k={m.pulse(hr + 8, 16) + m.pulse(ha + 8, 16)} />
          <Route k={k} t={m.t} storm={m.pop(stv, 12)} />
          <MapLabel at={[-60, -12]} text="SOUTH AMERICA" size={54} k={close > 0.3 ? 0 : m.pop(am, 12)} />
          <MapLabel at={[-66.5, -52.6]} text="CAPE HORN" size={50} k={m.pop(ho, 12)} />
        </PMap>
        <Calendar k={m.pop(we, 12)} flip={m.lerp([we, hr], [0, 1])} />
      </View>
    </Stage>
  );
};

export default Detour;
