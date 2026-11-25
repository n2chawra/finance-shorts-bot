// Turn: "और तेलंगाना? बनने के बाद उसकी गाड़ियों पर टी एस लिखा गया।" Wide on the map so far; on "तेलंगाना" the camera
// dives to it as the light drops to dusk; on "बनने" its border draws and it lifts out of Andhra Pradesh; on "गाड़ियों"
// three small cars roll across it; on "लिखा" a big TS plate stamps onto its middle.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import type { StateFx } from "../../flat/india";
import { COLOUR, Car, F, MapView, OldPlates, TEL, doneBefore, lerpFrame, painted, type LL } from "./props";
import { FlipPlate, TEL_C, mixHex } from "./extra";

const SPOTS: LL[] = [[78.4, 17.3], [79.5, 17.6], [78.1, 18.0]];
const TONE = ["#e8453c", "#3d8bd9", "#5fae6a"];

const Cars: React.FC<{ k: number[]; drive: number; t: number }> = ({ k, drive, t }) => {
  const at = useAt();
  return (
    <g>
      {SPOTS.map((ll, i) => {
        const xy = at(ll);
        if (!xy || k[i]! <= 0) return null;
        return <Car key={i} x={xy[0] - (1 - Math.min(1, k[i]!)) * 300 + drive * 50} y={xy[1]} s={150} color={TONE[i]} t={t + i * 7} />;
      })}
    </g>
  );
};

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const te = m.at("telangana", 4), bn = m.at("banne", 22), ga = m.at("gaadi", 44), li = m.at("likha", 68);
  const dive = m.lerp([te, te + 30], [0, 1]);
  const frame = lerpFrame(F.india, F.tel, dive);
  const before = doneBefore("turn");
  const states: Record<string, StateFx> = { ...painted(before), "Andhra Pradesh": { fill: COLOUR["Andhra Pradesh"]!, k: 0.35 * dive } };
  if (m.t >= bn) states[TEL] = { fill: COLOUR[TEL]!, draw: m.lerp([bn, bn + 20], [0, 1]), lift: m.lerp([bn + 8, bn + 24], [0, 0.85]) };
  return (
    <Stage p={p} bg="#16354d" vignette={0.3 + 0.12 * dive}>
      <View zoom={1.02 + m.lerp([0, m.end], [0, 0.04]) + m.wave(80, 0.008) + 0.035 * m.pulse(li + 3, 7)}>
        <MapView frame={frame} states={states} dim={0.42 + 0.18 * dive} sheet={mixHex("#f3ead6", "#d9c7a4", 0.7 * dive)}>
          <g data-probe="skip" opacity={1 - 0.5 * dive}><OldPlates names={before} /></g>
          <Cars k={[0, 1, 2].map((i) => m.pop(ga + i * 5, 14))} drive={m.lerp([ga, m.end], [0, 1])} t={m.t} />
          <FlipPlate at={TEL_C} from="TS" to="TS" k={m.pop(li, 10)} stamp size={1.4} dy={-110} glow={m.pulse(li + 6, 12)} wob={m.wave(40, 1.2)} />
        </MapView>
      </View>
      <rect x={0} y={0} width={1080} height={1920} fill="#2a1f4a" opacity={0.14 * dive} />
    </Stage>
  );
};

export default Turn;
