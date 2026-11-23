// Turn: "So in {fact4}, the two empires made a deal. Britain kept the river, and land about {fact5} back
// from its banks." The map turns into the old treaty map (sepia): the year lands at its head on "So", a
// British and a French diplomat stand on the map either side of the river on "empires" and shake hands on
// "deal"; a pen traces the river on "Britain", ruled lines are drawn alongside it on "land", and the gap
// between line and river is measured on "banks".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapRoute } from "../../flat/map";
import { At, GREEN, GeoMap, RED, RIVER, Tint, shifted } from "./props";

type Params = { fig?: { year?: string; gap?: string } };

const Ruler: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const so = m.at("so", 4), emp = m.at("empires", 30), deal = m.at("deal", 50), brit = m.at("britain", 70), land = m.at("land", 100), banks = m.at("banks", 125);
  const shake = m.lerp([deal - 4, deal + 4], [0, 1]);
  const trace = m.lerp([brit, brit + 26], [0.02, 1]);
  const rule = m.lerp([land, land + 24], [0.02, 1]);
  const close = m.lerp([banks - 6, banks + 14], [0, 1]);
  const scale = 14000 + 5000 * close + m.lerp([0, m.end], [0, 1200]);
  const center: [number, number] = [-15.3 + 0.2 * close, 13.5];
  const meet = m.lerp([emp, deal], [0, 1]);
  return (
    <Stage p={p} bg="#c9b48a" vignette={0.4}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <GeoMap center={center} scale={scale} sea="#a9c3b8" land="#efe2c2" colors={{ Gambia: { fill: RED, k: 0.15 }, Senegal: { fill: GREEN, k: 0.12 } }}>
          <Tint color="#e8cf9a" o={0.45} />
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={10} dash={false} />
          {/* the pen traces the river: Britain's */}
          <MapRoute via={RIVER} k={trace} color={RED} width={6} dash={false}
            mover={(x, y) => trace < 0.99 ? (
              <g transform={`translate(${x} ${y}) rotate(30)`}>
                <rect x={-9} y={-130} width={18} height={124} rx={7} fill="#1d1a2b" />
                <polygon points="-9,-6 9,-6 0,16" fill="#ffc43d" stroke={INK} strokeWidth={3} />
              </g>) : null} />
          {/* the ruled lines either side, about 10 km out */}
          <MapRoute via={shifted(0.09)} k={rule} color={INK} width={5} />
          <MapRoute via={shifted(-0.09)} k={rule} color={INK} width={5} />
          <At at={[-15.1, 13.52]}>{(x, y) => {
            const top = y - 0.09 * scale * Math.PI / 180;
            const k = m.pop(banks, 12);
            return k > 0.01 ? (
              <g>
                <line x1={x} y1={y} x2={x} y2={top} stroke={INK} strokeWidth={6} />
                <polygon points={`${x - 12},${top + 16} ${x + 12},${top + 16} ${x},${top}`} fill={INK} />
                <Tag x={x + 24} y={top - 30} w={230} h={86} text={fig.gap ?? ""} k={k} rot={2} />
              </g>) : null;
          }}</At>
          {/* the two diplomats on the map, north and south of the river, meeting on "deal" */}
          <At at={[-15.75, 13.95]}>{(x, y) => (
            <g>
              <Char x={x - 60 + 30 * meet} y={y + m.wave(46, 2)} s={100} skin="#f0c8a0" top="#2f3445" pants="#2f3445" outfit="suit" accent="#c92a2a" hair="side" hairColor="#5a4632"
                face={shake > 0.5 ? "smirk" : "neutral"} look={[1, 0]} armR={[m.lerp([deal - 6, deal + 2], [30, 80]), 20 + m.wave(4, 10) * shake * (1 - m.lerp([brit - 8, brit], [0, 1]))]} armL={[20, -20]} />
              <Char x={x + 60 - 30 * meet} y={y + m.wave(50, 2)} s={100} skin="#f0c8a0" top="#1f4fbf" pants="#1f4fbf" outfit="suit" hair="bald" hairColor="#5a4632" moustache
                face={shake > 0.5 ? "smirk" : "neutral"} look={[-1, 0]} armL={[m.lerp([deal - 6, deal + 2], [30, 80]), 20 + m.wave(4, 10) * shake * (1 - m.lerp([brit - 8, brit], [0, 1]))]} armR={[20, -20]} />
            </g>
          )}</At>
        </GeoMap>
        <Tag x={390} y={330} w={300} h={110} text={fig.year ?? ""} k={m.pop(so, 12)} bg="#ffffff" rot={-2} />
      </View>
    </Stage>
  );
};

export default Ruler;
