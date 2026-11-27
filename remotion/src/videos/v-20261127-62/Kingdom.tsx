// Kingdom: "नेपाल और भूटान के बीच, यहाँ के राजा को चोग्याल कहते थे, और इसका अपना झंडा था।" The eastern Himalaya: Nepal
// fills with its flag on its name, Bhutan with its own, Sikkim lifts between them on "बीच"; the camera pushes in on
// "चोग्याल" as the Chogyal's photo stands on Sikkim, and the kingdom's old flag drops onto Sikkim beside him on "झंडा".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Neighbour, type StateFx } from "../../flat/india";
import { Photo } from "../../studio/photo";
import { F, GOLD, MapView, OnMap, SIK, StateTag, lerpFrame } from "./props";

const Kingdom: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ne = m.at("nepal", 2), bt = m.at("bhutan", 14), be = m.at("beech", 26), ch = m.at("chogyal", 46), jh = m.at("jhanda", 72);
  const frame = lerpFrame(lerpFrame(F.region, { ...F.region, scale: F.region.scale * 0.85 }, m.lerp([0, ne + 10], [1, 0])), F.kingClose, m.lerp([ch - 4, ch + 16], [0, 1]));
  const states: Record<string, StateFx> = { Sikkim: { fill: GOLD, lift: m.lerp([be, be + 10], [0.3, 0.9]), trace: m.lerp([be, be + 20], [0, 1]) } };
  const push = m.lerp([ch - 4, ch + 16], [0, 1]);
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.03 + m.wave(75, 0.012)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.4}>
          <Neighbour name="Nepal" fill="#c8323f" flag="Nepal" k={m.lerp([ne, ne + 8], [0.5, 1])} flagK={m.lerp([ne, ne + 12], [0, 1])} lift={0.5 * m.pulse(ne + 6, 10)} />
          <Neighbour name="Bhutan" fill="#f6a623" flag="Bhutan" k={m.lerp([bt, bt + 8], [0.5, 1])} flagK={m.lerp([bt, bt + 12], [0, 1])} lift={0.5 * m.pulse(bt + 6, 10)} />
          <StateTag state="Sikkim" at={[84.6, 28.3]} text="नेपाल" k={m.pop(ne + 2, 10) * (1 - push)} size={50} dy={-60} />
          <StateTag state="Sikkim" at={[90.4, 27.4]} text="भूटान" k={m.pop(bt + 2, 10) * (1 - push)} size={50} dy={-60} />
          <OnMap ll={SIK}>{(xy) => (
            <g>
              {m.t >= ch ? (
                <g transform={`translate(${xy[0] + 230} ${xy[1] + 330 - (1 - Math.min(1, m.pop(ch, 12))) * 200})`} opacity={Math.min(1, m.pop(ch, 12) * 2)}>
                  <Photo name="chogyal" s={340} t={m.t / 30} />
                </g>
              ) : null}
              {m.t >= jh ? (
                <g transform={`translate(${xy[0] - 40} ${xy[1] + 110 - (1 - Math.min(1, m.pop(jh, 12))) * 200})`} opacity={Math.min(1, m.pop(jh, 12) * 2)}>
                  <Photo name="sikkimflag" s={170} t={m.t / 25} />
                </g>
              ) : null}
            </g>
          )}</OnMap>
          <StateTag state="Sikkim" at={[88.7, 27.9]} text="चोग्याल" k={m.pop(ch + 8, 10)} size={54} dy={-90} />
        </MapView>
      </View>
    </Stage>
  );
};
export default Kingdom;
