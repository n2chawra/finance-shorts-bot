// Promise: "Gambia is a real country, with its own flag and its own money, and Senegal wraps around it on
// every side but the sea." On the map: the camera pushes in on Banjul, where a small girl plants the Gambian
// flag on "flag"; a market seller on the riverbank fans out banknotes on "money"; on "wraps" the camera pulls
// back and Senegal fills green, two arrows curling round the strip; on "sea" the coast lights up, the one
// open side.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Cash, Glow, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, MapRoute } from "../../flat/map";
import { At, BANJUL, GREEN, GeoMap, MapFlag, RED, RIVER } from "./props";

const Planted: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const real = m.at("real", 10), flag = m.at("flag", 40), money = m.at("money", 70), wraps = m.at("wraps", 110), sea = m.at("sea", 150);
  // the camera on the map: in on Banjul, along to the market, then back out over all of Senegal
  const lon = -16.0 - m.lerp([0, flag], [0, 0.3]) + m.lerp([money - 8, money + 8], [0, 0.6]) + m.lerp([wraps, wraps + 20], [0, 0.6]);
  const lat = 13.6 - m.lerp([0, flag], [0, 0.1]) + m.lerp([wraps, wraps + 20], [0, 0.6]);
  const scale = 15000 + m.lerp([0, flag], [0, 4000]) - m.lerp([wraps, wraps + 20], [0, 12000]);
  const green = m.lerp([wraps, wraps + 26], [0, 1]);
  const wrap = m.lerp([wraps + 6, wraps + 30], [0, 1]);
  const fan = m.pop(money, 10);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1 + m.wave(90, 0.01)}>
        <GeoMap center={[lon, lat]} scale={scale} colors={{ Gambia: { fill: RED }, Senegal: { fill: GREEN, draw: green, paint: green, from: [-12.5, 14.2] } }}>
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={9} dash={false} />
          <At at={BANJUL}>{(x, y) => (
            <Char x={x - 70} y={y + 8 + m.wave(40, 2)} s={82} skin="#8a5a3c" top="#ffc43d" pants="#3b5bdb" outfit="dress" hair="bun" hairColor="#1d1a2b"
              face={m.t > flag ? "happy" : "neutral"} look={[0.6, -0.6]} armR={[m.lerp([real, flag], [40, 160]), 20]} armL={[30, -20]} />
          )}</At>
          <MapFlag at={BANJUL} kind="gambia" k={m.pop(flag - 2, 11)} h={170} wave={m.wave(24, 3)} />
          <At at={[-16.05, 13.18]}>{(x, y) => fan > 0.01 ? (
            <g>
              <Char x={x} y={y + m.wave(46, 2)} s={78} skin="#6e4630" top="#2f9e44" pants="#2f3445" outfit="shirt" hair="cap" hairColor="#ffc43d"
                face="grin" armR={[130, 50]} armL={[30, -30]}
                holdR={(h) => <g>{[-30, -10, 10, 30].map((a, i) => (
                  <g key={i} transform={`rotate(${a * fan} ${h[0]} ${h[1]})`}><Cash x={h[0] - 26} y={h[1] - 58} w={52} color="#4a8f6a" /></g>
                ))}</g>} />
            </g>) : null}</At>
          {/* the arrows that wrap Senegal round the strip */}
          {wrap > 0 ? <MapRoute via={[[-16.6, 14.3], [-15.0, 14.5], [-13.6, 14.0], [-13.5, 13.0]]} k={wrap} color={GREEN} width={14} /> : null}
          {wrap > 0 ? <MapRoute via={[[-16.6, 12.6], [-15.0, 12.5], [-13.8, 12.8]]} k={wrap} color={GREEN} width={14} /> : null}
          <MapLabel at={[-14.9, 15.1]} text="SENEGAL" size={66} type={green} />
          <MapLabel at={[-17.6, 13.4]} text="SEA" size={52} fill="#dff3ff" type={m.lerp([sea, sea + 10], [0, 1])} />
          <At at={[-17.0, 13.45]}>{(x, y) => <Glow x={x} y={y} r={m.lerp([sea, sea + 20], [10, 220])} color="#bfe9ff" o={0.55 * m.lerp([sea, sea + 10], [0, 1])} />}</At>
        </GeoMap>
      </View>
    </Stage>
  );
};

export default Planted;
