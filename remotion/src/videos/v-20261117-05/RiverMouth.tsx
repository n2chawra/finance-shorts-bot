// "So how did that happen? The answer is the river. In the age of sailing ships, it was a highway deep into
// Africa, and Britain held its mouth." Close on the map at the river mouth: a gull crosses on "happen", the
// river lights up on "river", a tall ship sails in from the ocean on "ships", boats loaded with peanut sacks
// travel up the river as the camera follows them inland on "highway", then swings back to the mouth where a
// fort and the British flag land on "Britain" and a soldier points out to sea on "mouth".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapRoute } from "../../flat/map";
import { At, BANJUL, Boat, FortIcon, GREEN, GeoMap, MapFlag, RED, RIVER, ShipIcon } from "./props";

const SEA_IN: [number, number][] = [[-17.6, 13.62], [-17.1, 13.55], [-16.75, 13.5]];

const RiverMouth: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const happen = m.at("happen", 6), river = m.at("river", 40), ships = m.at("ships", 80), hw = m.at("highway", 110), brit = m.at("britain", 150), mouth = m.at("mouth", 175);
  // follow the boats inland on "highway", swing back to the mouth on "Britain"
  const inland = m.lerp([hw, hw + 30], [0, 1]) - m.lerp([brit - 10, brit + 6], [0, 1]);
  const lon = -16.75 + 1.3 * inland, lat = 13.5;
  const scale = 20000 - 4000 * inland;
  const glow = m.lerp([river, river + 10], [0, 1]);
  const gull = m.lerp([happen, happen + 36], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1 + m.wave(70, 0.012)}>
        <GeoMap center={[lon, lat]} scale={scale} colors={{ Gambia: { fill: RED, k: 0.35 }, Senegal: { fill: GREEN, k: 0.2 } }}>
          <MapRoute via={RIVER} k={m.lerp([river - 4, river + 34], [0.1, 1])} color={glow > 0 ? "#7fd0ff" : "#2f7fb8"} width={9 + 8 * glow + 4 * m.pulse(river + 4, 10)} dash={false} />
          {/* the tall ship in from the ocean */}
          <MapRoute via={SEA_IN} k={m.lerp([ships - 4, ships + 30], [0.02, 1])} color="rgba(0,0,0,0)" width={1} dash={false}
            mover={(x, y) => <ShipIcon x={x} y={y - 6} s={150} roll={m.wave(40, 2)} />} />
          {/* the peanut boats up the river, one behind the other */}
          {[0, 1, 2].map((i) => (
            <MapRoute key={i} via={RIVER} k={m.lerp([hw + i * 8, hw + 70 + i * 8], [0.02, 0.6 - i * 0.06])} color="rgba(0,0,0,0)" width={1} dash={false}
              mover={(x, y) => <Boat x={x} y={y - 4} s={95} load />} />
          ))}
          <At at={[-16.62, 13.39]}>{(x, y) => { const k = m.pop(brit - 2, 12); return k > 0.01 ? <FortIcon x={x} y={y} s={190 * k} /> : null; }}</At>
          <MapFlag at={[-16.52, 13.38]} kind="britain" k={m.pop(brit, 11)} h={170} wave={m.wave(24, 3)} />
          <At at={[-16.72, 13.4]}>{(x, y) => { const k = m.pop(mouth - 6, 12); return k > 0.01 ? (
            <Char x={x} y={y + m.wave(40, 2)} s={84 * k} skin="#f0c8a0" top="#c92a2a" pants="#f1f1f1" outfit="shirt" hair="cap" hairColor="#1d1a2b"
              face="neutral" look={[-1, 0]} armL={[m.lerp([mouth, mouth + 8], [20, 100]), 0]} armR={[20, -20]} />) : null; }}</At>
          <At at={BANJUL}>{(x, y) => gull > 0 && gull < 1 ? (
            <path d={`M ${x - 500 + gull * 1000 - 30} ${y - 260 + m.wave(16, 14)} q 15 -18 30 0 q 15 -18 30 0`} fill="none" stroke="#1d1a2b" strokeWidth={7} strokeLinecap="round" />) : null}</At>
        </GeoMap>
      </View>
    </Stage>
  );
};

export default RiverMouth;
