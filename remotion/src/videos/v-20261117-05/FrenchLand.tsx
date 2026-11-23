// "France held the land all around it, the colony that became Senegal." On the map: a small French officer
// plants the tricolour north of the river on "France", flags pop up all over the land on "land", the camera
// pulls back on "around" to show them ringing the British river (its small Union flag at the mouth), the land
// fills green on "colony" and the name stamps across it on "Senegal".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, MapRoute } from "../../flat/map";
import { At, BANJUL, GREEN, GeoMap, MapFlag, RED, RIVER } from "./props";

const OFFICER: [number, number] = [-15.3, 14.35];
const SPOTS: [number, number][] = [
  [-16.5, 14.8], [-14.2, 14.6], [-15.9, 15.6], [-13.3, 15.2], [-16.0, 12.75], [-14.9, 12.65], [-13.4, 13.9],
  [-12.6, 14.3], [-15.0, 16.0], [-12.7, 12.9], [-16.3, 12.5], [-13.9, 12.6],
];

const FrenchLand: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fr = m.at("france", 4), land = m.at("land", 24), around = m.at("around", 40), colony = m.at("colony", 60), sen = m.at("senegal", 86);
  const back = m.lerp([around, around + 22], [0, 1]);
  const scale = 16000 - 9500 * back;
  const center: [number, number] = [-15.3 + 0.6 * back, 14.2 + 0.1 * back];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <GeoMap center={center} scale={scale} colors={{ Gambia: { fill: RED, k: 0.35 }, Senegal: { fill: GREEN, paint: m.lerp([colony, colony + 24], [0.001, 1]), from: OFFICER, draw: m.lerp([land, colony], [0, 1]) } }}>
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={9} dash={false} />
          <MapFlag at={BANJUL} kind="britain" k={1} h={90} wave={m.wave(24, 3)} />
          <MapFlag at={OFFICER} kind="france" k={m.pop(fr, 11)} h={170 - 70 * back} wave={m.wave(22, 3)} />
          <At at={OFFICER}>{(x, y) => (
            <Char x={x - 60 + 30 * back} y={y + 4 + m.wave(40, 2)} s={90 - 40 * back} skin="#f0c8a0" top="#1f4fbf" pants="#e0352b" outfit="suit" hair="cap" hairColor="#1f4fbf" moustache
              face="smirk" armR={[m.lerp([fr, fr + 10], [60, 130]), 30]} armL={[20, -20]} />
          )}</At>
          {SPOTS.map((s, i) => <MapFlag key={i} at={s} kind="france" k={m.pop(land + i * 2, 12)} h={110 - 40 * back} wave={m.wave(22, 3, i)} />)}
          <MapLabel at={[-14.4, 15.15]} text="SENEGAL" size={78} type={m.lerp([sen, sen + 14], [0, 1])} />
        </GeoMap>
      </View>
    </Stage>
  );
};

export default FrenchLand;
