// "France took everything else. In {fact6}, Gambia became independent, inside exactly the same line." On
// the map: French flags drop onto the land around the strip on "France" and it fills green on "everything";
// a crowd gathers at Banjul and the Gambian flag goes up on "Gambia"; the year lands on a banner over the
// city on "independent"; the border lights up on "same", pulsing, unchanged, on "line".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapRoute } from "../../flat/map";
import { At, BANJUL, BorderTrace, GREEN, GeoMap, MapFlag, RED, RIVER } from "./props";

type Params = { fig?: { year?: string } };

const AROUND: [number, number][] = [[-16.3, 14.2], [-14.7, 14.3], [-13.6, 13.9], [-14.2, 12.9], [-15.7, 12.85]];
const CROWD = [
  { dx: -70, skin: "#6e4630", top: "#ffc43d" }, { dx: -35, skin: "#8a5a3c", top: "#e8453c" }, { dx: 0, skin: "#5a3a28", top: "#2f9e44" },
  { dx: 35, skin: "#9a6a48", top: "#3b5bdb" }, { dx: 70, skin: "#6e4630", top: "#ffffff" },
];

const Independence: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const fr = m.at("france", 4), every = m.at("everything", 20), gam = m.at("gambia", 50), ind = m.at("independent", 64), same = m.at("same", 90), line = m.at("line", 104);
  const toBanjul = m.lerp([gam - 6, gam + 10], [0, 1]) - m.lerp([same - 4, same + 14], [0, 1]);
  const scale = 9000 + 13000 * toBanjul;
  const center: [number, number] = [-15.1 - 1.3 * toBanjul, 13.8 - 0.3 * toBanjul];
  const raise = m.lerp([gam, gam + 10], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <GeoMap center={center} scale={scale} colors={{ Gambia: { fill: RED }, Senegal: { fill: GREEN, paint: m.lerp([every, every + 24], [0.001, 1]), from: [-12.4, 14.6] } }}>
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={9} dash={false} />
          {AROUND.map((s, i) => <MapFlag key={i} at={s} kind="france" k={m.pop(fr + i * 2, 12)} h={110} wave={m.wave(22, 3, i)} />)}
          <BorderTrace name="Gambia" k={m.lerp([same, same + 20], [0, 1])} width={9} color="#fff3b0" glow={0.6 + 0.4 * m.pulse(line, 10)} />
          <MapFlag at={[-16.52, 13.42]} kind="gambia" k={m.pop(gam, 11)} h={190} wave={m.wave(20, 3)} />
          <At at={[-16.64, 13.4]}>{(x, y) => (
            <g>{CROWD.map((c, i) => (
              <Char key={i} x={x + c.dx * 1.4 - 60} y={y + 40 + (i % 2) * 10 + m.wave(14, 4, i) * raise} s={64} skin={c.skin} top={c.top} pants="#2f3445"
                outfit={i % 2 ? "dress" : "shirt"} hair={(["bun", "side", "cap", "spiky", "bun"] as const)[i]} hairColor="#1d1a2b" face={raise > 0.5 ? "happy" : "neutral"}
                armR={[20 + 150 * raise + m.wave(14, 8, i) * raise, 10]} armL={[20, -10]} />
            ))}</g>
          )}</At>
          <At at={[-16.55, 13.62]}>{(x, y) => <Tag x={x - 150} y={y - 240} w={300} h={110} text={year} k={m.pop(ind, 12)} bg="#ffffff" rot={-2} />}</At>
        </GeoMap>
      </View>
    </Stage>
  );
};

export default Independence;
