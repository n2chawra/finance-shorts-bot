// "But who else wanted those valleys? Boer settlers, who rolled in by ox wagon and founded the Orange Free State
// right on top of them." The Basotho blue on the map; the valleys flash, settlers walk up from the south-west, an
// ox wagon rolls behind them, a flag is planted at Bloemfontein and the Free State's orange spreads round it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { BLOEM, BLUE, FREE_STATE, LESOTHO_C, Map, ORANGE, Planted, WEST, Wagon, Walker, Zone } from "./props";

const Party: React.FC<{ t: number; walk: number; wagon: number; flag: number; dust: number }> = ({ t, walk, wagon, flag, dust }) => {
  const at = useAt();
  const b = at(BLOEM);
  if (!b) return null;
  const off = (1 - walk) * 360;
  return (
    <g>
      {[0, 1, 2].map((i) => <Walker key={i} x={b[0] - 40 - i * 50 - off} y={b[1] + 60 + off * 0.5} s={60} color="#5a6a3a" step={t / 4 + i} hat />)}
      {dust > 0 && dust < 1 ? [0, 1, 2].map((i) => <circle key={i} cx={b[0] - 330 - off * 0.8 - i * 50} cy={b[1] + 170 + off * 0.4} r={30 + 50 * dust} fill="#e9d6a8" opacity={0.7 * (1 - dust)} />) : null}
      {wagon > 0 ? <Wagon x={b[0] - 250 - (1 - wagon) * 300} y={b[1] + 140 + (1 - wagon) * 150} s={120} roll={t / 8} /> : null}
      <Planted x={b[0]} y={b[1]} s={80} k={flag} color={ORANGE} wave={Math.sin(t / 7)} />
    </g>
  );
};

const Boers: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wa = m.at("wanted", 8), vl = m.at("valleys", 20), ro = m.at("rolled", 50), tp = m.at("top", 130), bo = m.at("boer", 30), se = m.at("settlers", 38), wg = m.at("wagon", 62), fo = m.at("founded", 76), or = m.at("orange", 90), st = m.at("state", 104);
  const close = m.lerp([wg - 4, wg + 12], [0, 1]) - m.lerp([or - 4, or + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.03 + 0.15 * close + m.wave(80, 0.008)} cx={540 - 120 * close} cy={960 + 80 * close}>
        <Map center={[26.9, -29.15]} scale={9500} colors={{ Lesotho: { fill: BLUE, k: 0.8 }, "South Africa": { fill: "#d9c08a" } }}>
          <Zone via={FREE_STATE} fill={ORANGE} k={m.lerp([or, or + 20], [0, 1])} o={0.75} edge={m.pulse(tp + 6, 12)} />
          <Zone via={WEST} fill={BLUE} k={1} o={0.7 + 0.3 * m.pulse(wa + 6, 10)} edge={m.pulse(wa + 6, 14) + m.pulse(vl + 6, 12)} />
          <Party t={m.t} dust={m.lerp([ro, ro + 30], [0, 1])} walk={m.lerp([se, se + 30], [0, 1])} wagon={m.lerp([wg - 4, wg + 26], [0, 1])} flag={m.pop(fo, 12)} />
          <MapLabel at={[BLOEM[0] - 0.55, BLOEM[1] - 0.55]} text="BOERS" size={56} k={m.pop(bo, 12)} />
          <MapLabel at={[25.9, -28.0]} text="ORANGE FREE STATE" size={52} k={m.pop(st, 12)} />
          <MapLabel at={[LESOTHO_C[0] + 0.2, LESOTHO_C[1]]} text="BASOTHO" size={52} k={1} />
        </Map>
      </View>
    </Stage>
  );
};

export default Boers;
