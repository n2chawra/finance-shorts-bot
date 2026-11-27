// Vote: "फिर {fact1} में, लोगों से पूछा गया: राजा का राज ख़त्म हो, और सिक्किम भारत का हिस्सा बने?" Over Gangtok: a
// blackboard drops in with the year chalked on it on "फिर", voters line up on the hill on "लोगों", the crown over Sikkim tilts
// and dims on "राज", and on "हिस्सा" a ballot box lands and the first slip drops in as the camera pushes in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { BallotBox, Board, Crown, F, GANGTOK, GOLD, MapView, OnMap, SIK, Voter, lerpFrame } from "./props";

type Params = { fig?: { year?: string } };
const SHIRTS = ["#3d8bd9", "#e8453c", "#5fae6a", "#b467c9", "#f08a3c", "#2fb5a5"];

const Vote: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const ph = m.at("phir", 2), lo = m.at("logon", 20), ra = m.at("raj", 40), hi = m.at("hissa", 70);
  const frame = lerpFrame(lerpFrame(F.close, F.gangtok, m.lerp([0, lo + 10], [0, 1])), { ...F.gangtok, scale: F.gangtok.scale * 1.2 }, m.lerp([hi - 2, hi + 14], [0, 1]));
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.03 + m.wave(75, 0.012)}>
        <MapView t={m.t} frame={frame} states={{ Sikkim: { fill: GOLD, lift: 0.3 } }} dim={0.4}>
          <OnMap ll={SIK}>{(xy) => <Crown x={xy[0] - 150} y={xy[1] - 200} s={150} k={1} dim={m.lerp([ra, ra + 14], [0, 1])} tilt={m.lerp([ra, ra + 14], [0, -24])} />}</OnMap>
          <OnMap ll={GANGTOK}>{(xy) => (
            <g>
              {SHIRTS.map((c, i) => <Voter key={i} x={xy[0] - 330 + i * 70} y={xy[1] + 150 + (i % 2) * 18} s={120} shirt={c} t={m.t} phase={i} k={m.pop(lo + i * 3, 12)} />)}
              <BallotBox x={xy[0] + 190} y={xy[1] + 180} s={220} k={m.pop(hi, 12)} slip={m.lerp([hi + 6, hi + 20], [0, 1])} />
            </g>
          )}</OnMap>
        </MapView>
      </View>
      <Board x={540} y={330} w={560} h={250} k={m.pop(ph, 12)} title="जनमत संग्रह" rows={[{ text: "साल", value: year, color: "#ffd84a", k: m.pop(ph + 8, 10) }]} />
      <SourceLine p={p} y={190} />
    </Stage>
  );
};
export default Vote;
